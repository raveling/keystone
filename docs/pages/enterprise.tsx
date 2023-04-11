/** @jsxRuntime classic */
/** @jsx jsx  */
import { jsx } from '@emotion/react';
import Image from 'next/image';
import Link from 'next/link';

import { useMediaQuery } from '../lib/media';
import { IntroWrapper, IntroHeading, IntroLead } from '../components/content/Intro';
import { Highlight } from '../components/primitives/Highlight';
import { MWrapper } from '../components/content/MWrapper';
import { Section, SideBySideSection } from '../components/content/Section';
import { Button } from '../components/primitives/Button';
import { Quote } from '../components/content/Quote';
import { Type } from '../components/primitives/Type';
import { ArrowR } from '../components/icons/ArrowR';
import { Pill } from '../components/content/Pill';
import { Tick } from '../components/icons/Tick';
import { Page } from '../components/Page';
import { ContactForm } from '../components/ContactForm';

import dsGeneration from '../public/assets/ds-generation.png';
import vocal from '../public/assets/vocal-4.png';
import contentManagement2 from '../public/assets/content-management-2.png';
import contentManagement3 from '../public/assets/content-management-3.png';
import contentManagement4 from '../public/assets/content-management-4.png';
import { EndCta } from '../components/content/EndCta';

export default function ForOrganisations() {
  const mq = useMediaQuery();

  return (
    <Page
      title={'KeystoneJS for Content Management'}
      description={
        'Discover how Keystone’s Admin UI is a natural extension of how you work in code, and has the flexibility you need to enable content creatives.'
      }
    >
      <MWrapper>
        <Pill grad="grad6">Keystone for Enterprise</Pill>
        <IntroWrapper>
          <IntroHeading look="heading64">
            Scale Keystone with the people who <Highlight look="grad6">built it</Highlight>
          </IntroHeading>
          <IntroLead>
            Lorem ipsum dolor sit amet fames turpis eget euismod dolore viverra fames enim. Justo
            mauris nisl dolore sodales ut adipiscing dui aenean nisi maecenas odio. A etiam interdum
            auctor in adipiscing velit facilisis dapibus libero erat sagittis.
          </IntroLead>
        </IntroWrapper>
        {/* <Button
          as="a"
          href="/docs/guides/document-fields"
          css={{ marginTop: '2rem' }}
          size="large"
          shadow
        >
          Try the Rich Text demo <ArrowR />
        </Button> */}

        <ContactForm
          stacked
          css={mq({
            '& button': {
              justifySelf: ['center', 'auto'],
            },
          })}
        >
          <p css={{ marginBottom: '1rem' }}>Subscribe to our mailing list to stay in the loop!</p>
        </ContactForm>
        <SideBySideSection reverse>
          <div>
            <Type as="h2" look="heading48">
              Scaling from a hunch to a{' '}
              <Highlight look="grad6">multi-million user platform</Highlight> with Keystone.
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Vocal came to Thinkmill with a great idea and a fast growing community. They needed a
              smart and scalable backend architecture approach to support rapid growth over a five
              year horizon, while delivering immediate value — at the same time. We deployed a
              React, KeystoneJS, and GraphQL stack so they could start fast and scale without
              sacrificing multichannel reach over the long run.
            </Type>
            {/* <ul
              css={{
                listStyle: 'none',
                margin: '1rem 0',
                padding: 0,
                '& li': {
                  display: 'flex',
                  alignItems: 'center',
                },
                '& svg': {
                  height: '1.25rem',
                  marginRight: '0.75rem',
                },
              }}
            >
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Custom roles for unique teams
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Tailor CRUD for every field
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Secure your content ops
                </Type>
              </li>
            </ul> */}
            <Type as="p" look="body18">
              <Link href="https://www.thinkmill.com.au/work/vocal">Read the Case Study →</Link>
            </Type>
          </div>
          <div>
            <Image
              src={vocal}
              alt="Dropdown selector from Keystone’s Admin UI showing different user roles: Administrator, Editor, Content Manager, Author"
              width={2034}
              height={1300}
              css={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </div>
        </SideBySideSection>
        <Quote
          name="Justin Maury"
          img="https://www.thinkmill.com.au/_astro/vocal-justin-maury@1280w.5316de23.webp"
          title="Chief Operating Officer, Vocal Media"
          grad="grad6"
        >
          Vocal wouldn’t be what it is today without Thinkmill & Keystone. The team shaped the
          product visually, technically, and ethically, as we grew from a hunch to a multi-million
          user network.
        </Quote>

        <SideBySideSection>
          <div>
            <Type as="h2" look="heading48">
              Replatforming from Salesforce with{' '}
              <Highlight look="grad6">Sungage Financial.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Keystone comes with an extensive fields API out of the box, and an easy GraphQL
              endpoint for every field you make.
            </Type>
            <ul
              css={{
                listStyle: 'none',
                margin: '1rem 0',
                padding: 0,
                '& li': {
                  display: 'flex',
                  alignItems: 'center',
                },
                '& svg': {
                  height: '1.25rem',
                  marginRight: '0.75rem',
                },
              }}
            >
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Easy labels & descriptions
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Extensive Scalar types
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Custom & virtual options
                </Type>
              </li>
            </ul>
            <Type as="p" look="body18">
              <Link href="/docs/fields/overview">Fields API →</Link>
            </Type>
          </div>
          <div>
            <Image
              src={vocal}
              alt="Overlay of Admin UI field panes showing fields for a Post content type. Promotional text overlays show: custom and virtual fields; flexible relationships; powerful sort & filtering."
              width={1254}
              height={1107}
              css={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </div>
        </SideBySideSection>

        <Section>
          <div
            css={mq({
              display: 'grid',
              gridTemplateColumns: ['1fr', null, '1fr 1fr'],
              gap: '2rem',
              alignItems: 'center',
            })}
          >
            <div>
              <Type as="h2" look="heading48">
                A rich text experience for the{' '}
                <Highlight look="grad6">design system generation.</Highlight>
              </Type>
              <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
                Keystone’s Document field is the first of its kind: intuitive, customisable, and
                works with your design system components. Make it as lean or full-featured as you
                like. It‘s up to you.
              </Type>
              <Button
                as="a"
                // look="soft"
                size="large"
                href="/docs/guides/document-field-demo"
                css={{ margin: '1.5rem 1rem 1rem 0' }}
              >
                Try the demo <ArrowR />
              </Button>
              <Type look="body18">
                <Link href="/docs/guides/document-fields">Read the guide →</Link>
              </Type>
            </div>
            <div>
              <Image
                src={dsGeneration}
                alt="Keystone Document field containing Rich Text content including Twitter embed components, and syntax highlighted code block"
                width={1854}
                height={1535}
                css={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
            </div>
          </div>
          <ul
            css={mq({
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              marginTop: '5rem',
              gridTemplateColumns: ['1fr', '1fr 1fr', null, '1fr 1fr 1fr 1fr'],
              gap: '3rem',
              '& li': {
                maxWidth: '27rem',
                margin: '0 auto',
              },
            })}
          >
            <li>
              <Type as="h2" look="heading20bold">
                Customisable interface
              </Type>
              <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
                Every rich text field instance is what you make it. Control what's possible
                depending on what you need to do.
              </Type>
            </li>
            <li>
              <Type as="h2" look="heading20bold">
                BYO Design System components
              </Type>
              <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
                Embed layout components, social cards, and relationships to other content with your
                own React components.
              </Type>
            </li>
            <li>
              <Type as="h2" look="heading20bold">
                Preview embeds
              </Type>
              <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
                Give your editors a sense of how things will look with preview functionality in
                place as they write.
              </Type>
            </li>
            <li>
              <Type as="h2" look="heading20bold">
                Structured JSON output
              </Type>
              <Type as="p" look="body18" margin="1rem 0" color="var(--muted)">
                Access the storytelling capabilities of a WYSIWYG without losing content integrity.
                It's queryable JSON all the way down.
              </Type>
            </li>
          </ul>
        </Section>

        <Quote
          name="Kevin Stafford"
          img="https://thinkmill.com.au/_astro/kevin-stafford-rugby-au@1280w.24c4530d.webp"
          title="CTO, Rugby Australia"
          grad="grad6"
        >
          Keystone & Thinkmill have played a crucial role in our transformation of Rugby Australia’s
          website network and development practices. Thinkmill are exceptional at what they do, and
          generous with their time and expertise.
        </Quote>

        <SideBySideSection>
          <div>
            <Type as="h2" look="heading48">
              Relate while <Highlight look="grad6">you create.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              Create relationships as you write to get your stories to market faster. No more
              context switching when designing structured content.
            </Type>
            <ul
              css={{
                listStyle: 'none',
                margin: '1rem 0',
                padding: 0,
                '& li': {
                  display: 'flex',
                  alignItems: 'center',
                },
                '& svg': {
                  height: '1.25rem',
                  marginRight: '0.75rem',
                },
              }}
            >
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Extensive relationships & cardinalities
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Self referencing options
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Design for queries as you code
                </Type>
              </li>
            </ul>
            <Type as="p" look="body18">
              <Link href="/docs/guides/relationships">Relationships guide →</Link>
            </Type>
          </div>
          <div>
            <Image
              src={contentManagement3}
              alt="2 Admin UI panes showing creation of relationships in place. Author window opens up a Create Post window where Post categories can be selected."
              width={2007}
              height={1727}
              css={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </div>
        </SideBySideSection>

        <SideBySideSection reverse>
          <div>
            <Type as="h2" look="heading48">
              Manage complexity
              <br /> {/* This <br /> needs to be there to fix a horrible safari bug, sadface */}
              <Highlight look="grad6">on your terms.</Highlight>
            </Type>
            <Type as="p" look="body18" color="var(--muted)" margin="1rem 0">
              The Keystone Admin UI has great tooling for managing complex sets of content, so
              editors can intuitively understand the data they're editing.
            </Type>
            <ul
              css={{
                listStyle: 'none',
                margin: '1rem 0',
                padding: 0,
                '& li': {
                  display: 'flex',
                  alignItems: 'center',
                },
                '& svg': {
                  height: '1.25rem',
                  marginRight: '0.75rem',
                },
              }}
            >
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Only see what’s most relevant
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Default sort & filtering
                </Type>
              </li>
              <li>
                <Tick grad="grad6" />
                <Type look="body18" color="var(--muted)">
                  Custom views for fields
                </Type>
              </li>
            </ul>
          </div>
          <div>
            <Image
              src={contentManagement4}
              alt="Admin UI browser window showing a tabular a list of Articles with filtration applied to the list. Filter by published status."
              width={1827}
              height={1516}
              css={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </div>
        </SideBySideSection>

        <EndCta grad="grad6" />
      </MWrapper>
    </Page>
  );
}
