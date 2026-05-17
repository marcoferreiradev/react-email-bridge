/**
 * VTEX `order-confirmed` template — faithful port of
 * `refs/vtex-email-framework/source/templates/01-confirmed.hbs`.
 *
 * Bloco 7 PR B.5 — rewrites the v0.1 freeform demo to match the source.
 * Composes from PR A's shared components, plus inlines the 4 single-use
 * partials that aren't worth extracting (used only by this template per
 * PORTING.md's frequency table):
 *   - messages/intro          → see <IntroBlock /> below
 *   - messages/order-link     → inline inside <IntroBlock />
 *   - shipping-summary        → see <ShippingSummary /> below
 *   - shipping-summary-estimate-{scheduled,date,range} → inline inside
 *     <ShippingSummary />
 *
 * Section map (matches source line ranges):
 *  - HtmlHead                                  src:3
 *  - Header: Logo + h1 "Obrigado..."           src:11–17
 *  - Intro message (boleto branch included)    src:19–22
 *  - Shipping summary (per logistics package)  src:23–30
 *  - Payment when not split                    src:32–43
 *  - Per-order section (#each orders):         src:46–85
 *      h2 + seller + split-payment + Totals +
 *      richShippingData + group by addr +
 *      AddressDeliveryTitle + AddressPickupTitle +
 *      group by package + per-package heading +
 *      Package
 *  - Shipping estimate note                    src:88–93
 *  - Regards                                   src:95–98
 */

import { Body, Container, Heading, Html, Link, Section, Text } from 'react-email';
import { Each, Else, If, Raw } from 'react-email-bridge/hbs';

import {
  AddressDeliveryTitle,
  AddressPickupTitle,
  Hi,
  HtmlHead,
  Logo,
  Package,
  Payment,
  Regards,
  ShippingEstimateRangeTime,
  Totals,
} from '../components/index.js';

const sectionStyle = { padding: '24px' };
const sectionWithTopDividerStyle = {
  ...sectionStyle,
  borderTop: '1px solid #ddd',
};

/**
 * Inlines `partials/messages/intro.hbs`. Used by 01-confirmed only.
 * Sequence: Hi + introMessage paragraph, then order-link (inline), then
 * the boleto-bancário branch that surfaces a payment-link CTA when the
 * customer chose Boleto.
 */
function IntroBlock() {
  return (
    <>
      <Text>
        <Hi /> Estamos aguardando a aprovação do pagamento para dar andamento ao seu pedido.
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

/**
 * Inlines `partials/shipping-summary.hbs` (and its 3 transitive estimate
 * sub-partials). Used by 01-confirmed only.
 *
 * For each package in the order's logistics info, emit a card showing:
 *   - Heading ("Receber" or "Retirar" depending on delivery channel)
 *   - Either the single product's name (if 1 item) or "{N} itens"
 *   - The ETA in one of three formats (scheduled date+time / fixed date / range)
 *   - The pickup-store name or the delivery address summary
 */
function ShippingSummary() {
  return (
    <>
      <Raw>{`{{#richShippingData shippingData}}`}</Raw>
      <Raw>{`{{#group logisticsInfo by="packageId"}}`}</Raw>
      <Each path="items">
        <If compare={['@index', '==', '0']}>
          <Section
            style={{
              maxWidth: '440px',
              padding: '12px 16px',
              margin: '12px 0',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            {/* Heading */}
            <If eq={['selectedDeliveryChannel', '"pickup-in-point"']}>
              <Heading as="h4" style={{ marginBottom: '8px' }}>
                Retirar
              </Heading>
              <Else />
              <Heading as="h4" style={{ marginBottom: '8px' }}>
                Receber
              </Heading>
            </If>

            {/* Single product name OR "{N} itens" */}
            <If eq={['../items.length', '1']}>
              <Each path="../../../items">
                <If compare={['id', '==', '../../items.0.itemId']}>
                  <div style={{ fontWeight: 700, width: '80%' }}>{`{{name}}`}</div>
                </If>
              </Each>
              <Else />
              {`{{../items.length}}`} itens
            </If>

            {/* ETA — three branches inlined from shipping-summary-estimate-* */}
            <If path="deliveryWindow">
              {/* shipping-summary-estimate-scheduled.hbs */}
              <>
                em
                <div
                  style={{ fontWeight: 700 }}
                >{`{{formatDate deliveryWindow.startDateUtc}}`}</div>
                <div>
                  entre {`{{formatTime deliveryWindow.startDateUtc}}`} e{' '}
                  {`{{formatTime deliveryWindow.endDateUtc}}`}
                </div>
              </>
              <Else />
              <If path="shippingEstimateDate">
                {/* shipping-summary-estimate-date.hbs */}
                <>
                  <If eq={['deliveryChannel', '"pickup-in-point"']}>
                    a partir de
                    <Else />
                    até
                  </If>{' '}
                  {`{{formatDate shippingEstimateDate}}`}
                </>
                <Else />
                {/* shipping-summary-estimate-range.hbs */}
                <If eq={['shippingEstimateDays', '"0"']}>
                  <div style={{ marginTop: '8px', paddingBottom: '12px' }}>
                    <If eq={['selectedDeliveryChannel', '"pickup-in-point"']}>
                      a partir de hoje
                      <Else />
                      hoje
                    </If>
                  </div>
                  <Else />
                  <If eq={['selectedDeliveryChannel', '"pickup-in-point"']}>
                    a partir de
                    <Else />
                    em até
                  </If>
                  <div style={{ marginTop: '8px', paddingBottom: '12px' }}>
                    <ShippingEstimateRangeTime />
                  </div>
                </If>
              </If>
            </If>

            {/* Pickup store name OR delivery address summary */}
            <div style={{ paddingTop: '8px', borderTop: '1px solid #ccc' }}>
              <If eq={['selectedDeliveryChannel', '"pickup-in-point"']}>
                <Each path="slas">
                  <If
                    compare={['../selectedSla', '==', 'id']}
                  >{`{{pickupStoreInfo.friendlyName}}`}</If>
                </Each>
                <Else />
                <If path="../../../giftRegistryData">
                  {`{{../../../giftRegistryData.description}}`}
                  <Else />
                  <Each path="../../availableAddresses">
                    <If eq={['../addressId', 'addressId']}>
                      {`{{street}}`}, {`{{number}}`}
                    </If>
                  </Each>
                </If>
              </If>
            </div>
          </Section>
        </If>
      </Each>
      <Raw>{`{{/group}}`}</Raw>
      <Raw>{`{{/richShippingData}}`}</Raw>
    </>
  );
}

export default function OrderConfirmed() {
  return (
    <Html>
      <HtmlHead />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', maxWidth: '600px' }}>
          {/* Header */}
          <Section style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
            <Logo />
            <Heading as="h1">Obrigado pelo seu pedido.</Heading>
          </Section>

          {/* Intro: hi + intro message + order-link + boleto branch */}
          <Section style={sectionStyle}>
            <IntroBlock />
          </Section>

          {/* Shipping Summary card stack */}
          <Section style={sectionWithTopDividerStyle}>
            <Heading as="h3" style={{ marginTop: 0 }}>
              Resumo de seu(s) pacote(s)
            </Heading>
            <Each path="orders">
              <ShippingSummary />
            </Each>
          </Section>

          {/* Payment — when NOT split */}
          <If compare={['split', '!=', 'true']}>
            <Section style={sectionWithTopDividerStyle}>
              <Heading as="h3" style={{ margin: 0 }}>
                Pagamento
              </Heading>
              <Each path="orders.0.paymentData.transactions">
                <Payment />
                <div
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '4px 8px',
                    backgroundColor: '#ccc',
                    fontSize: '12px',
                  }}
                >
                  Aguardando aprovação
                </div>
              </Each>
            </Section>
          </If>

          {/* Per-order section */}
          <Each path="orders">
            <Section style={sectionWithTopDividerStyle}>
              <Heading as="h2">
                Pedido <span style={{ fontWeight: 500 }}>#{`{{orderId}}`}</span>
              </Heading>
              <Text style={{ marginTop: '4px', marginBottom: '8px', color: '#aaa' }}>
                Fornecido e entregue por {`{{sellers.0.name}}`}
              </Text>

              {/* Payment when split */}
              <If compare={['split', '==', 'true']}>
                <div style={{ float: 'left', width: '100%', paddingBottom: '12px' }}>
                  <Heading as="h3">Pagamento</Heading>
                  <Each path="paymentData.transactions">
                    <Payment />
                    <div
                      style={{
                        display: 'inline-block',
                        marginTop: '8px',
                        padding: '4px 8px',
                        backgroundColor: '#ccc',
                        fontSize: '12px',
                      }}
                    >
                      Aguardando aprovação
                    </div>
                  </Each>
                </div>
              </If>

              <Totals />

              {/* Address blocks + packages */}
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
          <Section style={sectionWithTopDividerStyle}>
            <Text>
              O prazo dos pacotes deverá ser considerado somente após a confirmação do pagamento.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={sectionWithTopDividerStyle}>
            <Regards />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
