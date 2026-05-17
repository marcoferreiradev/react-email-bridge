/**
 * VTEX `order-replaced` template — faithful port of
 * `refs/vtex-email-framework/source/templates/09-replaced.hbs`.
 *
 * Onda 3 of Bloco 7. Sent when an order's items got replaced. The
 * stand-alone complex of Onda 3 — uses #math for per-package heading
 * numbering and inlines a variant of order-confirmed's IntroBlock with
 * the `introMessageReplaced` copy.
 *
 * Differences from order-confirmed:
 *   - h1 is "Seu pedido foi substituído." (titleReplaced).
 *   - Intro uses introMessageReplaced ("Estamos aguardando possíveis
 *     aprovações…") instead of introMessage.
 *   - No shipping-summary section.
 *   - Payment sections guard on `payments.length > 0` (not present when
 *     the original order was free / 100%-discounted).
 *   - Otherwise mirrors order-confirmed's per-order layout.
 */

import { Body, Container, Heading, Html, Link, Section, Text } from 'react-email';
import { Each, If, Raw } from 'react-email-bridge/hbs';

import {
  AddressDeliveryTitle,
  AddressPickupTitle,
  Hi,
  HtmlHead,
  Logo,
  Package,
  Payment,
  Regards,
  Totals,
} from '../components/index.js';

const sectionStyle = { padding: '24px' };
const sectionWithDividerStyle = { ...sectionStyle, borderTop: '1px solid #ddd' };

/**
 * Inlines `partials/messages/intro-replaced.hbs`. Single-use. Same shape
 * as order-confirmed's IntroBlock but uses the introMessageReplaced
 * copy + same boleto-bancário CTA branch.
 */
function IntroReplaced() {
  return (
    <>
      <Text>
        <Hi /> Estamos aguardando possíveis aprovações de pagamento para dar andamento ao seu
        pedido.
      </Text>
      <Text>
        Você pode <Link href={`{{ordersUrl}}`}>acompanhar este pedido no nosso site</Link>.
      </Text>
      <Each path="orders.0.paymentData.transactions">
        <Each path="payments">
          <If eq={['paymentSystemName', "'Boleto Bancário'"]}>
            <Text>
              Não se esqueça de fazer o pagamento do boleto bancário, caso ainda não o tenha feito.
            </Text>
            <Text>
              <Link href={`{{replace url '{Installment}' installments}}`}>
                Abrir boleto bancário
              </Link>
            </Text>
          </If>
        </Each>
      </Each>
    </>
  );
}

export default function OrderReplaced() {
  return (
    <Html>
      <HtmlHead />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', maxWidth: '600px' }}>
          {/* Header */}
          <Section style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
            <Logo />
            <Heading as="h1">Seu pedido foi substituído.</Heading>
          </Section>

          {/* Intro (replaced variant) */}
          <Section style={sectionStyle}>
            <IntroReplaced />
          </Section>

          {/* Payment — when not split, only if any payments exist */}
          <If compare={['split', '!=', 'true']}>
            <If compare={['orders.0.paymentData.transactions.payments.length', '>', '0']}>
              <Section style={sectionWithDividerStyle}>
                <Heading as="h3" style={{ margin: 0 }}>
                  Pagamento
                </Heading>
                <Each path="orders.0.paymentData.transactions">
                  <Payment />
                </Each>
              </Section>
            </If>
          </If>

          {/* Per-order section */}
          <Each path="orders">
            <Section style={sectionWithDividerStyle}>
              <Heading as="h2">
                Pedido <span style={{ fontWeight: 500 }}>#{`{{orderId}}`}</span>
              </Heading>
              <Text style={{ marginTop: '4px', marginBottom: '8px', color: '#aaa' }}>
                Fornecido e entregue por {`{{sellers.0.name}}`}
              </Text>

              {/* Payment when split, only if any payments */}
              <If compare={['split', '==', 'true']}>
                <If compare={['paymentData.transactions.payments.length', '>', '0']}>
                  <div style={{ float: 'left', width: '100%', paddingBottom: '12px' }}>
                    <Heading as="h3">Pagamento</Heading>
                    <Each path="paymentData.transactions">
                      <Payment />
                    </Each>
                  </div>
                </If>
              </If>

              <Totals />

              {/* Address + packages */}
              <Raw>{`{{#richShippingData shippingData}}`}</Raw>
              <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
              <div style={{ clear: 'both', paddingTop: '12px' }}>
                <AddressDeliveryTitle />
                <AddressPickupTitle />

                <Raw>{`{{#group items by="packageId"}}`}</Raw>
                <If compare={['item.length', '>', '1']}>
                  <Heading as="h3" style={{ marginBottom: '8px' }}>
                    Pacote <Raw>{`{{#math index '+' 1}}{{/math}}`}</Raw>
                  </Heading>
                </If>
                <Package />
                <Raw>{`{{/group}}`}</Raw>
              </div>
              <Raw>{`{{/group}}`}</Raw>
              <Raw>{`{{/richShippingData}}`}</Raw>
            </Section>
          </Each>

          {/* Shipping estimate note */}
          <Section style={sectionWithDividerStyle}>
            <Text>
              O prazo dos pacotes deverá ser considerado somente após a confirmação do pagamento.
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
