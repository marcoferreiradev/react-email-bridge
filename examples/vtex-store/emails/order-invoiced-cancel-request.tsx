/**
 * VTEX `order-invoiced-cancel-request` template — faithful port of
 * `refs/vtex-email-framework/source/templates/05-invoiced-cancel-request.hbs`.
 *
 * Onda 2 of Bloco 7. Variant of `order-invoiced`:
 *   - Adds `<CantCancel />` overlay after `<OrderReference />` in the
 *     header section.
 *   - Adds a static cancelation-instructions paragraph at the end of the
 *     intro section.
 *   - Everything else mirrors 04-invoiced.
 */

import { Body, Container, Heading, Html, Section, Text } from 'react-email';
import { Else, If, Raw } from 'react-email-bridge/hbs';

import {
  CantCancel,
  Handling,
  Hi,
  HtmlHead,
  Items,
  Logo,
  OrderReference,
  Regards,
} from '../components/index.js';

const sectionStyle = { padding: '24px' };
const sectionWithDividerStyle = { ...sectionStyle, borderTop: '1px solid #ddd' };

export default function OrderInvoicedCancelRequest() {
  return (
    <Html>
      <HtmlHead />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', maxWidth: '600px' }}>
          {/* Header: Logo + headline + OrderRef + CantCancel + many-invoices alert */}
          <Section style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
            <Logo />
            <Heading as="h1">Sua Nota Fiscal foi emitida.</Heading>
            <OrderReference />
            <CantCancel />

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

          {/* Intro: Hi + Handling (non-anonymous only) + cancelation instructions */}
          <Section style={sectionStyle}>
            <If path="clientProfileData.firstName">
              <If compare={['clientProfileData.firstName', '!=', "'isAnonymous'"]}>
                <p>
                  <Hi /> <Handling />
                </p>
              </If>
            </If>

            <Text>
              Caso queria seguir com o cancelamento, você poderá recusar a entrega e posteriormente
              seu pagamento será estornado.
            </Text>
          </Section>

          {/* Per-group invoice items */}
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
