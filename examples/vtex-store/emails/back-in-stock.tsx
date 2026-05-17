/**
 * Back-in-stock notification — faithful port of
 * `refs/vtex-email-framework/source/templates/11-let-me-know.hbs`.
 *
 * Onda 3 of Bloco 7. Marketing email (not order-related) sent when a
 * product the customer asked to be notified about comes back in stock.
 * Simplest template in the framework: just logo + body + regards.
 *
 * Source uses literal Portuguese strings (not i18n keys) — copy is
 * hard-coded in the original template and we preserve verbatim.
 *
 * Note the `{{{productDescription}}}` triple-brace — Handlebars syntax
 * for "do not HTML-escape this value". VTEX may pass HTML in the
 * description; preserving triple-brace keeps the original semantics.
 * Our render pipeline preserves it through unescapeMarkers correctly
 * (the trailing `}` falls outside the marker boundary regex but ends
 * up adjacent in the output string).
 */

import { Body, Container, Html, Link, Section, Text } from 'react-email';

import { HtmlHead, Logo, Regards } from '../components/index.js';

const sectionStyle = { padding: '24px' };
const sectionWithDividerStyle = { ...sectionStyle, borderTop: '1px solid #ddd' };

export default function BackInStock() {
  return (
    <Html>
      <HtmlHead />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', maxWidth: '600px' }}>
          {/* Header: just the logo (no h1 in source) */}
          <Section
            style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #moon-gray' }}
          >
            <Logo />
          </Section>

          {/* Body: notice + product link + description (HTML-preserving) */}
          <Section style={sectionStyle}>
            <Text>
              Conforme a sua solicitação, informamos que o produto abaixo encontra-se disponível
              para compra:
              <br />
              <Link href={`{{productLink}}`}>{`{{productName}}`}</Link>
              <br />
              <br />
              Informações sobre o produto:
              <br />
              {`{{{productDescription}}}`}
            </Text>
          </Section>

          {/* Footer */}
          <Section style={sectionWithDividerStyle}>
            <Regards />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
