/**
 * VTEX `order-confirmed` template — Halo-inspired modernization
 * (Bloco 11). Same functional structure as the faithful port of
 * `01-confirmed.hbs` (Bloco 7 PR B.5) — every Handlebars marker and
 * source section preserved — but redesigned with theme tokens for
 * clean typography, generous whitespace, card-based shipping summary,
 * and a primary-button CTA.
 *
 * Pilot template for Bloco 11. The shared components (Logo, Regards)
 * were also updated in this PR; other shared components (Payment,
 * Totals, AddressDeliveryTitle, etc.) still render with their original
 * faithful-port styling and will be modernized in PR M.2.
 *
 * Inlines (single-use partials from source):
 *   - messages/intro + order-link → <IntroBlock /> below
 *   - shipping-summary + 3 estimate sub-partials → <ShippingSummary /> below
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
import { button, card, color, heading, layout, pill, space, text } from '../theme.js';

/**
 * Inlines `partials/messages/intro.hbs`. Hi + intro paragraph, then the
 * order-tracking CTA (Halo-style primary button), then the boleto-
 * bancário branch.
 */
function IntroBlock() {
  return (
    <>
      <Text style={text.body}>
        <Hi /> Estamos aguardando a aprovação do pagamento para dar andamento ao seu pedido.
      </Text>

      <div style={{ margin: `${space.md} 0` }}>
        <Link href={`{{ordersUrl}}`} style={button.primary}>
          Acompanhar pedido
        </Link>
      </div>

      <Each path="orders.0.paymentData.transactions">
        <Each path="payments">
          <If eq={['paymentSystemName', "'Boleto Bancário'"]}>
            <Text style={text.bodyMuted}>
              Não se esqueça de fazer o pagamento do boleto bancário, caso ainda não o tenha feito.
            </Text>
            <div style={{ margin: `${space.sm} 0 ${space.md}` }}>
              <Link href={`{{replace url '{Installment}' installments}}`} style={button.secondary}>
                Abrir boleto bancário
              </Link>
            </div>
          </If>
        </Each>
      </Each>
    </>
  );
}

/**
 * Inlines `partials/shipping-summary.hbs` and its 3 estimate sub-partials.
 * One card per logistics package: heading (Receber/Retirar) + items count
 * + ETA + address/pickup-store. Halo card style.
 */
function ShippingSummary() {
  return (
    <>
      <Raw>{`{{#richShippingData shippingData}}`}</Raw>
      <Raw>{`{{#group logisticsInfo by="packageId"}}`}</Raw>
      <Each path="items">
        <If compare={['@index', '==', '0']}>
          <Section style={card.base}>
            {/* Method label */}
            <If eq={['selectedDeliveryChannel', '"pickup-in-point"']}>
              <div style={heading.h4}>Retirar</div>
              <Else />
              <div style={heading.h4}>Receber</div>
            </If>

            {/* Contents: single product name OR "{N} itens" */}
            <div style={{ ...text.body, margin: `${space.xs} 0 ${space.sm}` }}>
              <If eq={['../items.length', '1']}>
                <Each path="../../../items">
                  <If compare={['id', '==', '../../items.0.itemId']}>
                    <strong>{`{{name}}`}</strong>
                  </If>
                </Each>
                <Else />
                <strong>{`{{../items.length}}`} itens</strong>
              </If>
            </div>

            {/* ETA */}
            <div style={text.caption}>
              <If path="deliveryWindow">
                <>
                  Em {`{{formatDate deliveryWindow.startDateUtc}}`}, entre{' '}
                  {`{{formatTime deliveryWindow.startDateUtc}}`} e{' '}
                  {`{{formatTime deliveryWindow.endDateUtc}}`}
                </>
                <Else />
                <If path="shippingEstimateDate">
                  <>
                    <If eq={['deliveryChannel', '"pickup-in-point"']}>
                      a partir de
                      <Else />
                      até
                    </If>{' '}
                    {`{{formatDate shippingEstimateDate}}`}
                  </>
                  <Else />
                  <If eq={['shippingEstimateDays', '"0"']}>
                    <If eq={['selectedDeliveryChannel', '"pickup-in-point"']}>
                      a partir de hoje
                      <Else />
                      hoje
                    </If>
                    <Else />
                    <If eq={['selectedDeliveryChannel', '"pickup-in-point"']}>
                      a partir de
                      <Else />
                      em até
                    </If>{' '}
                    <ShippingEstimateRangeTime />
                  </If>
                </If>
              </If>
            </div>

            {/* Address / pickup store */}
            <div style={{ ...text.caption, marginTop: space.sm }}>
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
      <Body style={layout.bodyStyle}>
        <Container style={layout.containerStyle}>
          {/* Header */}
          <Section style={{ padding: `${space.lg} ${space.md} 0` }}>
            <Logo />
            <Heading as="h1" style={{ ...heading.h1, textAlign: 'center' }}>
              Obrigado pelo seu pedido.
            </Heading>
          </Section>

          {/* Intro */}
          <Section style={layout.sectionPad}>
            <IntroBlock />
          </Section>

          <hr style={layout.divider} />

          {/* Shipping summary */}
          <Section style={layout.sectionPad}>
            <Heading as="h3" style={heading.h3}>
              Resumo do envio
            </Heading>
            <Each path="orders">
              <ShippingSummary />
            </Each>
          </Section>

          {/* Payment — when NOT split */}
          <If compare={['split', '!=', 'true']}>
            <hr style={layout.divider} />
            <Section style={layout.sectionPad}>
              <Heading as="h3" style={heading.h3}>
                Pagamento
              </Heading>
              <Each path="orders.0.paymentData.transactions">
                <Payment />
                <div style={{ marginTop: space.xs }}>
                  <span style={pill.warning}>Aguardando aprovação</span>
                </div>
              </Each>
            </Section>
          </If>

          {/* Per-order section */}
          <Each path="orders">
            <hr style={layout.divider} />
            <Section style={layout.sectionPad}>
              <Heading as="h2" style={heading.h2}>
                Pedido #{`{{orderId}}`}
              </Heading>
              <Text style={text.caption}>Fornecido e entregue por {`{{sellers.0.name}}`}</Text>

              {/* Payment when split */}
              <If compare={['split', '==', 'true']}>
                <div style={{ marginTop: space.md }}>
                  <Heading as="h3" style={heading.h3}>
                    Pagamento
                  </Heading>
                  <Each path="paymentData.transactions">
                    <Payment />
                    <div style={{ marginTop: space.xs }}>
                      <span style={pill.warning}>Aguardando aprovação</span>
                    </div>
                  </Each>
                </div>
              </If>

              <div style={{ marginTop: space.md }}>
                <Totals />
              </div>

              {/* Addresses + packages */}
              <Raw>{`{{#richShippingData shippingData}}`}</Raw>
              <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
              <div style={{ marginTop: space.md }}>
                <AddressDeliveryTitle />
                <AddressPickupTitle />

                <Raw>{`{{#group items by="packageId"}}`}</Raw>
                <If compare={['item.length', '>', '1']}>
                  <Heading as="h3" style={{ ...heading.h3, marginTop: space.md }}>
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

          <hr style={layout.divider} />

          {/* Shipping estimate note */}
          <Section style={layout.sectionPadTight}>
            <Text style={text.caption}>
              O prazo dos pacotes deverá ser considerado somente após a confirmação do pagamento.
            </Text>
          </Section>

          <hr style={layout.divider} />

          {/* Footer */}
          <Section style={layout.sectionPad}>
            <Regards />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
