import { ExitError } from '../utils';
import { applyMigrations } from './apply';
import { generateMigrations } from './generate';

export async function migrate(cwd: string, input: string[], shouldDropDatabase: boolean) {
  const migrateCommand = input[1];
  switch (migrateCommand) {
    case 'generate':
      return generateMigrations(cwd, shouldDropDatabase);
    case 'apply':
      return applyMigrations(cwd);
    default:
      console.log(`${migrateCommand} is not a migrate command that keystone accepts`);
      throw new ExitError(1);
  }
}
