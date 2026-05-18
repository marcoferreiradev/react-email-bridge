/**
 * Back-in-stock notification — Halo-Tailwind redesign (Bloco 11).
 *
 * Simplest template in the set: header + body + signoff. Used as the
 * smoke test for the Tailwind pipeline before redesigning the
 * remaining 12 templates.
 *
 * - `{{{productDescription}}}` triple-brace preserved verbatim (VTEX
 *   may send HTML in the description; triple-brace tells Handlebars not
 *   to escape).
 * - Hard-coded Portuguese strings come from the source verbatim (no
 *   i18n.* keys in 11-let-me-know.hbs).
 */

import { Body, Container, Html, Link, Section, Tailwind, Text } from 'react-email';

import { HtmlHead, Logo, Regards } from '../components/index.js';
import { vtexStoreTailwindConfig } from '../tailwind.config.js';

export default function BackInStock() {
  return (
    <Tailwind config={vtexStoreTailwindConfig}>
      <Html>
        <HtmlHead />
        <Body className="bg-bg m-0 py-8 font-sans">
          <Container className="bg-bg-2 mx-auto max-w-[600px] rounded-lg overflow-hidden">
            <Section className="px-6 pt-2">
              <Logo />
            </Section>

            <Section className="px-6 pb-6">
              <Text className="font-15 text-fg m-0 mb-4">
                Conforme a sua solicitação, informamos que o produto abaixo encontra-se disponível
                para compra:
              </Text>
              <Text className="font-18 text-fg m-0 mb-4">
                <Link href={`{{productLink}}`} className="text-fg underline underline-offset-2">
                  {`{{productName}}`}
                </Link>
              </Text>
              <Text className="font-14 text-fg-2 m-0 mb-2">Informações sobre o produto:</Text>
              <Text className="font-14 text-fg-2 m-0">{`{{{productDescription}}}`}</Text>
            </Section>

            <hr className="border-stroke m-0" />

            <Section className="px-6 py-6">
              <Regards />
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
