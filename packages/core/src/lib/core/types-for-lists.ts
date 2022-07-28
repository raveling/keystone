import { CacheHint } from 'apollo-server-types';
import {
  BaseItem,
  GraphQLTypesForSchemaCcc,
  getGqlNames,
  NextFieldType,
  BaseSchemaCccTypeInfo,
  ListGraphQLTypes,
  ListHooks,
  KeystoneConfig,
  FindManyArgs,
  CacheHintArgs,
  MaybePromise,
} from '../../types';
import { graphql } from '../..';
import { FieldHooks } from '../../types/config/hooks';
import { FilterOrderArgs } from '../../types/config/fields';
import {
  ResolvedFieldAccessControl,
  ResolvedListAccessControl,
  parseListAccessControl,
  parseFieldAccessControl,
} from './access-control';
import { getNamesFromList } from './utils';
import { ResolvedDBField, resolveRelationships } from './resolve-relationships';
import { outputTypeField } from './queries/output-field';
import { assertFieldsValid } from './field-assertions';

export type InitialisedField = Omit<NextFieldType, 'dbField' | 'access' | 'graphql'> & {
  dbField: ResolvedDBField;
  access: ResolvedFieldAccessControl;
  hooks: FieldHooks<BaseSchemaCccTypeInfo>;
  graphql: {
    isEnabled: {
      read: boolean;
      create: boolean;
      update: boolean;
      filter: boolean | ((args: FilterOrderArgs<BaseSchemaCccTypeInfo>) => MaybePromise<boolean>);
      orderBy: boolean | ((args: FilterOrderArgs<BaseSchemaCccTypeInfo>) => MaybePromise<boolean>);
    };
    cacheHint: CacheHint | undefined;
  };
};

export type InitialisedSchemaCcc = {
  fields: Record<string, InitialisedField>;
  /** This will include the opposites to one-sided relationships */
  resolvedDbFields: Record<string, ResolvedDBField>;
  pluralGraphQLName: string;
  types: GraphQLTypesForSchemaCcc;
  access: ResolvedListAccessControl;
  hooks: ListHooks<BaseSchemaCccTypeInfo>;
  adminUILabels: { label: string; singular: string; plural: string; path: string };
  cacheHint: ((args: CacheHintArgs) => CacheHint) | undefined;
  maxResults: number;
  schemaCccKey: string;
  schemaCcc: Record<string, InitialisedSchemaCcc>;
  dbMap: string | undefined;
  graphql: {
    isEnabled: IsEnabled;
  };
};

type IsEnabled = {
  type: boolean;
  query: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  filter: boolean | ((args: FilterOrderArgs<BaseSchemaCccTypeInfo>) => MaybePromise<boolean>);
  orderBy: boolean | ((args: FilterOrderArgs<BaseSchemaCccTypeInfo>) => MaybePromise<boolean>);
};

function throwIfNotAFilter(x: unknown, schemaCccKey: string, fieldKey: string) {
  if (['boolean', 'undefined', 'function'].includes(typeof x)) return;

  throw new Error(
    `Configuration option '${schemaCccKey}.${fieldKey}' must be either a boolean value or a function. Received '${x}'.`
  );
}

function getIsEnabled(listsConfig: KeystoneConfig['schemaPpp']) {
  const isEnabled: Record<string, IsEnabled> = {};

  for (const [schemaCccKey, listConfig] of Object.entries(listsConfig)) {
    const omit = listConfig.graphql?.omit;
    const { defaultIsFilterable, defaultIsOrderable } = listConfig;
    if (!omit) {
      // We explicity check for boolean/function values here to ensure the dev hasn't made a mistake
      // when defining these values. We avoid duck-typing here as this is security related
      // and we want to make it hard to write incorrect code.
      throwIfNotAFilter(defaultIsFilterable, schemaCccKey, 'defaultIsFilterable');
      throwIfNotAFilter(defaultIsOrderable, schemaCccKey, 'defaultIsOrderable');
    }
    if (omit === true) {
      isEnabled[schemaCccKey] = {
        type: false,
        query: false,
        create: false,
        update: false,
        delete: false,
        filter: false,
        orderBy: false,
      };
    } else if (omit === undefined) {
      isEnabled[schemaCccKey] = {
        type: true,
        query: true,
        create: true,
        update: true,
        delete: true,
        filter: defaultIsFilterable ?? true,
        orderBy: defaultIsOrderable ?? true,
      };
    } else {
      isEnabled[schemaCccKey] = {
        type: true,
        query: !omit.includes('query'),
        create: !omit.includes('create'),
        update: !omit.includes('update'),
        delete: !omit.includes('delete'),
        filter: defaultIsFilterable ?? true,
        orderBy: defaultIsOrderable ?? true,
      };
    }
  }

  return isEnabled;
}

function getListsWithInitialisedFields(
  { storage: configStorage, schemaPpp: listsConfig, db: { provider } }: KeystoneConfig,
  listGraphqlTypes: Record<string, ListGraphQLTypes>,
  intermediateLists: Record<string, { graphql: { isEnabled: IsEnabled } }>
) {
  return Object.fromEntries(
    Object.entries(listsConfig).map(([schemaCccKey, list]) => [
      schemaCccKey,
      {
        fields: Object.fromEntries(
          Object.entries(list.fields).map(([fieldKey, fieldFunc]) => {
            if (typeof fieldFunc !== 'function') {
              throw new Error(
                `The field at ${schemaCccKey}.${fieldKey} does not provide a function`
              );
            }
            const f = fieldFunc({
              fieldKey,
              schemaCccKey,
              lists: listGraphqlTypes,
              provider,
              getStorage: storage => configStorage?.[storage],
            });

            const omit = f.graphql?.omit;
            const read = omit !== true && !omit?.includes('read');

            // We explicity check for boolean values here to ensure the dev hasn't made a mistake
            // when defining these values. We avoid duck-typing here as this is security related
            // and we want to make it hard to write incorrect code.
            throwIfNotAFilter(f.isFilterable, schemaCccKey, 'isFilterable');
            throwIfNotAFilter(f.isOrderable, schemaCccKey, 'isOrderable');

            const _isEnabled = {
              read,
              update: omit !== true && !omit?.includes('update'),
              create: omit !== true && !omit?.includes('create'),
              // Filter and orderBy can be defaulted at the list level, otherwise they
              // default to `false` if no value was set at the list level.
              filter:
                read &&
                (f.isFilterable ?? intermediateLists[schemaCccKey].graphql.isEnabled.filter),
              orderBy:
                read &&
                (f.isOrderable ?? intermediateLists[schemaCccKey].graphql.isEnabled.orderBy),
            };
            const field = {
              ...f,
              access: parseFieldAccessControl(f.access),
              hooks: f.hooks ?? {},
              graphql: { cacheHint: f.graphql?.cacheHint, isEnabled: _isEnabled },
              input: { ...f.input },
            };

            return [fieldKey, field];
          })
        ),
        ...intermediateLists[schemaCccKey],
        ...getNamesFromList(schemaCccKey, list),
        hooks: list.hooks,
        access: parseListAccessControl(list.access),
        dbMap: list.db?.map,
        types: listGraphqlTypes[schemaCccKey].types,
      },
    ])
  );
}

function getListGraphqlTypes(
  listsConfig: KeystoneConfig['schemaPpp'],
  lists: Record<string, InitialisedSchemaCcc>,
  intermediateLists: Record<string, { graphql: { isEnabled: IsEnabled } }>
): Record<string, ListGraphQLTypes> {
  const graphQLTypes: Record<string, ListGraphQLTypes> = {};

  for (const [schemaCccKey, listConfig] of Object.entries(listsConfig)) {
    const names = getGqlNames({
      schemaCccKey,
      pluralGraphQLName: getNamesFromList(schemaCccKey, listConfig).pluralGraphQLName,
    });

    const output = graphql.object<BaseItem>()({
      name: names.outputTypeName,
      fields: () => {
        const { fields } = lists[schemaCccKey];
        return {
          ...Object.fromEntries(
            Object.entries(fields).flatMap(([fieldPath, field]) => {
              if (
                !field.output ||
                !field.graphql.isEnabled.read ||
                (field.dbField.kind === 'relation' &&
                  !intermediateLists[field.dbField.list].graphql.isEnabled.query)
              ) {
                return [];
              }
              return [
                [fieldPath, field.output] as const,
                ...Object.entries(field.extraOutputFields || {}),
              ].map(([outputTypeFieldName, outputField]) => {
                return [
                  outputTypeFieldName,
                  outputTypeField(
                    outputField,
                    field.dbField,
                    field.graphql?.cacheHint,
                    field.access.read,
                    schemaCccKey,
                    fieldPath,
                    lists
                  ),
                ];
              });
            })
          ),
        };
      },
    });

    const uniqueWhere = graphql.inputObject({
      name: names.whereUniqueInputName,
      fields: () => {
        const { fields } = lists[schemaCccKey];
        return Object.fromEntries(
          Object.entries(fields).flatMap(([key, field]) => {
            if (
              !field.input?.uniqueWhere?.arg ||
              !field.graphql.isEnabled.read ||
              !field.graphql.isEnabled.filter
            ) {
              return [];
            }
            return [[key, field.input.uniqueWhere.arg]] as const;
          })
        );
      },
    });

    const where: GraphQLTypesForSchemaCcc['where'] = graphql.inputObject({
      name: names.whereInputName,
      fields: () => {
        const { fields } = lists[schemaCccKey];
        return Object.assign(
          {
            AND: graphql.arg({ type: graphql.list(graphql.nonNull(where)) }),
            OR: graphql.arg({ type: graphql.list(graphql.nonNull(where)) }),
            NOT: graphql.arg({ type: graphql.list(graphql.nonNull(where)) }),
          },
          ...Object.entries(fields).map(
            ([fieldKey, field]) =>
              field.input?.where?.arg &&
              field.graphql.isEnabled.read &&
              field.graphql.isEnabled.filter && { [fieldKey]: field.input?.where?.arg }
          )
        );
      },
    });

    const create = graphql.inputObject({
      name: names.createInputName,
      fields: () => {
        const { fields } = lists[schemaCccKey];
        return Object.fromEntries(
          Object.entries(fields).flatMap(([key, field]) => {
            if (!field.input?.create?.arg || !field.graphql.isEnabled.create) return [];
            return [[key, field.input.create.arg]] as const;
          })
        );
      },
    });

    const update = graphql.inputObject({
      name: names.updateInputName,
      fields: () => {
        const { fields } = lists[schemaCccKey];
        return Object.fromEntries(
          Object.entries(fields).flatMap(([key, field]) => {
            if (!field.input?.update?.arg || !field.graphql.isEnabled.update) return [];
            return [[key, field.input.update.arg]] as const;
          })
        );
      },
    });

    const orderBy = graphql.inputObject({
      name: names.listOrderName,
      fields: () => {
        const { fields } = lists[schemaCccKey];
        return Object.fromEntries(
          Object.entries(fields).flatMap(([key, field]) => {
            if (
              !field.input?.orderBy?.arg ||
              !field.graphql.isEnabled.read ||
              !field.graphql.isEnabled.orderBy
            ) {
              return [];
            }
            return [[key, field.input.orderBy.arg]] as const;
          })
        );
      },
    });

    const findManyArgs: FindManyArgs = {
      where: graphql.arg({ type: graphql.nonNull(where), defaultValue: {} }),
      orderBy: graphql.arg({
        type: graphql.nonNull(graphql.list(graphql.nonNull(orderBy))),
        defaultValue: [],
      }),
      // TODO: non-nullable when max results is specified in the list with the default of max results
      take: graphql.arg({ type: graphql.Int }),
      skip: graphql.arg({ type: graphql.nonNull(graphql.Int), defaultValue: 0 }),
    };

    const isEnabled = intermediateLists[schemaCccKey].graphql.isEnabled;
    let relateToManyForCreate, relateToManyForUpdate, relateToOneForCreate, relateToOneForUpdate;
    if (isEnabled.type) {
      relateToManyForCreate = graphql.inputObject({
        name: names.relateToManyForCreateInputName,
        fields: () => {
          return {
            // Create via a relationship is only supported if this list allows create
            ...(isEnabled.create && {
              create: graphql.arg({ type: graphql.list(graphql.nonNull(create)) }),
            }),
            connect: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
          };
        },
      });

      relateToManyForUpdate = graphql.inputObject({
        name: names.relateToManyForUpdateInputName,
        fields: () => {
          return {
            // The order of these fields reflects the order in which they are applied
            // in the mutation.
            disconnect: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
            set: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
            // Create via a relationship is only supported if this list allows create
            ...(isEnabled.create && {
              create: graphql.arg({ type: graphql.list(graphql.nonNull(create)) }),
            }),
            connect: graphql.arg({ type: graphql.list(graphql.nonNull(uniqueWhere)) }),
          };
        },
      });

      relateToOneForCreate = graphql.inputObject({
        name: names.relateToOneForCreateInputName,
        fields: () => {
          return {
            // Create via a relationship is only supported if this list allows create
            ...(isEnabled.create && { create: graphql.arg({ type: create }) }),
            connect: graphql.arg({ type: uniqueWhere }),
          };
        },
      });

      relateToOneForUpdate = graphql.inputObject({
        name: names.relateToOneForUpdateInputName,
        fields: () => {
          return {
            // Create via a relationship is only supported if this list allows create
            ...(isEnabled.create && { create: graphql.arg({ type: create }) }),
            connect: graphql.arg({ type: uniqueWhere }),
            disconnect: graphql.arg({ type: graphql.Boolean }),
          };
        },
      });
    }

    graphQLTypes[schemaCccKey] = {
      types: {
        output,
        uniqueWhere,
        where,
        create,
        orderBy,
        update,
        findManyArgs,
        relateTo: {
          many: {
            where: graphql.inputObject({
              name: `${schemaCccKey}ManyRelationFilter`,
              fields: {
                every: graphql.arg({ type: where }),
                some: graphql.arg({ type: where }),
                none: graphql.arg({ type: where }),
              },
            }),
            create: relateToManyForCreate,
            update: relateToManyForUpdate,
          },
          one: { create: relateToOneForCreate, update: relateToOneForUpdate },
        },
      },
    };
  }

  return graphQLTypes;
}

/**
 * 1. Get the `isEnabled` config object from the listConfig - the returned object will be modified later
 * 2. Instantiate `lists` object - it is done here as the object will be added to the listGraphqlTypes
 * 3. Get graphqlTypes
 * 4. Initialise fields - field functions are called
 * 5. Handle relationships - ensure correct linking between two sides of all relationships (including one-sided relationships)
 * 6.
 */
export function initialiseLists(config: KeystoneConfig): Record<string, InitialisedSchemaCcc> {
  const listsConfig = config.schemaPpp;

  let intermediateLists;
  intermediateLists = Object.fromEntries(
    Object.entries(getIsEnabled(listsConfig)).map(([key, isEnabled]) => [
      key,
      { graphql: { isEnabled } },
    ])
  );

  /**
   * Lists is instantiated here so that it can be passed into the `getListGraphqlTypes` function
   * This function attaches this list object to the various graphql functions
   *
   * The object will be populated at the end of this function, and the reference will be maintained
   */
  const listsRef: Record<string, InitialisedSchemaCcc> = {};

  {
    const listGraphqlTypes = getListGraphqlTypes(listsConfig, listsRef, intermediateLists);
    intermediateLists = getListsWithInitialisedFields(config, listGraphqlTypes, intermediateLists);
  }

  {
    const resolvedDBFieldsForLists = resolveRelationships(intermediateLists);
    intermediateLists = Object.fromEntries(
      Object.entries(intermediateLists).map(([schemaCccKey, blah]) => [
        schemaCccKey,
        { ...blah, resolvedDbFields: resolvedDBFieldsForLists[schemaCccKey] },
      ])
    );
  }

  intermediateLists = Object.fromEntries(
    Object.entries(intermediateLists).map(([schemaCccKey, list]) => {
      const fields: Record<string, InitialisedField> = Object.fromEntries(
        Object.entries(list.fields).map(([fieldKey, field]) => [
          fieldKey,
          { ...field, dbField: list.resolvedDbFields[fieldKey] },
        ])
      );
      return [schemaCccKey, { ...list, fields }];
    })
  );

  for (const list of Object.values(intermediateLists)) {
    let hasAnEnabledCreateField = false;
    let hasAnEnabledUpdateField = false;

    for (const field of Object.values(list.fields)) {
      if (field.input?.create?.arg && field.graphql.isEnabled.create) {
        hasAnEnabledCreateField = true;
      }
      if (field.input?.update && field.graphql.isEnabled.update) {
        hasAnEnabledUpdateField = true;
      }
    }
    // You can't have a graphQL type with no fields, so
    // if they're all disabled, we have to disable the whole operation.
    if (!hasAnEnabledCreateField) {
      list.graphql.isEnabled.create = false;
    }
    if (!hasAnEnabledUpdateField) {
      list.graphql.isEnabled.update = false;
    }
  }

  /*
    Error checking
    */
  for (const [schemaCccKey, { fields }] of Object.entries(intermediateLists)) {
    assertFieldsValid({ schemaCccKey, fields });
  }

  for (const [schemaCccKey, intermediateList] of Object.entries(intermediateLists)) {
    listsRef[schemaCccKey] = {
      ...intermediateList,
      /** These properties weren't related to any of the above actions but need to be here */
      hooks: intermediateList.hooks || {},
      cacheHint: (() => {
        const cacheHint = listsConfig[schemaCccKey].graphql?.cacheHint;
        if (cacheHint === undefined) {
          return undefined;
        }
        return typeof cacheHint === 'function' ? cacheHint : () => cacheHint;
      })(),
      maxResults: listsConfig[schemaCccKey].graphql?.queryLimits?.maxResults ?? Infinity,
      schemaCccKey: schemaCccKey,
      /** Add self-reference */
      schemaPpp: listsRef,
    };
  }

  return listsRef;
}
