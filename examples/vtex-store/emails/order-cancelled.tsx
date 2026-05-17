/**
 * VTEX `order-cancelled` template — faithful port of
 * `refs/vtex-email-framework/source/templates/02-cancelled.hbs`.
 *
 * Onda 3 of Bloco 7. One of the simpler templates: header + Totals +
 * per-group items + Regards. No payment section, no addresses.
 */

import { Body, Container, Heading, Html, Section } from 'react-email';
import { Else, If, Raw } from 'react-email-bridge/hbs';

import { HtmlHead, Items, Logo, OrderReference, Regards, Totals } from '../components/index.js';

const sectionStyle = { padding: '24px' };
const sectionWithDividerStyle = { ...sectionStyle, borderTop: '1px solid #ddd' };

export default function OrderCancelled() {
  return (
    <Html>
      <HtmlHead />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', maxWidth: '600px' }}>
          {/* Header: Logo + h1 + OrderRef */}
          <Section style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
            <Logo />
            <Heading as="h1">Seu pedido foi cancelado.</Heading>
            <OrderReference />
          </Section>

          {/* Totals + per-group items */}
          <Section style={sectionWithDividerStyle}>
            <Totals />

            <Raw>{`{{#richShippingData shippingData}}`}</Raw>
            <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
            <div>
              <If compare={['items.length', '>', '1']}>
                <Heading as="h3" style={{ margin: 0 }}>
                  Produtos
                </Heading>
                <Else />
                <Heading as="h3" style={{ margin: 0 }}>
                  Produto
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
