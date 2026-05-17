/**
 * VTEX `order-invoiced` template — faithful port of
 * `refs/vtex-email-framework/source/templates/04-invoiced.hbs`.
 *
 * Bloco 7 PR B.5 — rewrites the v0.1 freeform demo to match the source
 * (which the original port diverged from). Composes from PR A's shared
 * components.
 *
 * Section map (matches source line ranges):
 *  - HtmlHead                           src:3
 *  - Header: Logo + h1 + OrderRef +     src:11–26
 *    many-invoices alert (when split)
 *  - Intro: Hi + Handling (only if      src:28–42
 *    non-anonymous client)
 *  - Per-group invoice items            src:44–106
 *  - Regards                            src:108–112
 *
 * Special patterns:
 *  - The order-info section is structurally `richShippingData → group by
 *    addressId → group by packageId → items table`. The items table body
 *    is exactly what the shared `Items` component renders — so we use it
 *    directly inside the group.
 *  - The "Products" vs "Product" heading is gated by items.length > 1.
 */

import { Body, Container, Heading, Html, Section } from 'react-email';
import { Else, If, Raw } from 'react-email-bridge/hbs';

import {
  Handling,
  Hi,
  HtmlHead,
  Items,
  Logo,
  OrderReference,
  Regards,
} from '../components/index.js';

const sectionStyle = { padding: '24px' };
const sectionWithDividerStyle = {
  ...sectionStyle,
  borderTop: '1px solid #ddd',
};

export default function OrderInvoiced() {
  return (
    <Html>
      <HtmlHead />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', maxWidth: '600px' }}>
          {/* Header: logo + headline + order ref + many-invoices alert */}
          <Section style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
            <Logo />
            <Heading as="h1">Sua Nota Fiscal foi emitida.</Heading>
            <OrderReference />

            {/* Alert: more than 1 invoice (items / packages mismatch) */}
            <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
              <Section
                style={{
                  backgroundColor: '#f4f4f4',
                  padding: '12px 16px',
                  marginTop: '16px',
                  fontWeight: 700,
                  lineHeight: 1.4,
                }}
              >
                <div>Seu pedido possui mais de uma Nota Fiscal.</div>
                <div>Avisaremos sobre a emissão de cada uma delas.</div>
              </Section>
            </If>
          </Section>

          {/* Intro: greet + handling message — only if non-anonymous client */}
          <Section style={sectionStyle}>
            <If path="clientProfileData.firstName">
              <If compare={['clientProfileData.firstName', '!=', "'isAnonymous'"]}>
                <p>
                  <Hi /> <Handling />
                </p>
              </If>
            </If>
          </Section>

          {/* Per-group invoice items: richShippingData + group + group + Items */}
          <Section style={sectionStyle}>
            <Raw>{`{{#richShippingData shippingData}}`}</Raw>
            <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
            <div>
              <If compare={['items.length', '>', '1']}>
                <Heading as="h3" style={{ margin: 0 }}>
                  Produtos na Nota Fiscal
                </Heading>
                <Else />
                <Heading as="h3" style={{ margin: 0 }}>
                  Produto na Nota Fiscal
                </Heading>
              </If>
              <Raw>{`{{#group items by="packageId"}}`}</Raw>
              <Items />
              <Raw>{`{{/group}}`}</Raw>
            </div>
            <Raw>{`{{/group}}`}</Raw>
            <Raw>{`{{/richShippingData}}`}</Raw>
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
