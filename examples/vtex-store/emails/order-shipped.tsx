/**
 * VTEX `order-shipped` template — faithful port of
 * `refs/vtex-email-framework/source/templates/06-shipped.hbs`.
 *
 * Onda 1 of the Bloco 7 port (#5). Composes entirely from the shared
 * components landed in PR A so any drift between this and the next
 * shipping-variant templates (07-shipped-cancel-request,
 * 08-shipping-update, 10-delivered in Onda 2) is captured in one place.
 *
 * Section map (matches source line ranges):
 *  - HtmlHead                           src:3
 *  - Header: Logo + 4-way h1 +          src:11–41
 *    OrderReference + many-packages
 *    notification (when split)
 *  - Intro: Pickup OR Shipping          src:43–53
 *  - Order address section              src:55–70
 *  - Packages section                   src:72–91
 *  - Regards                            src:93–97
 *
 * Special patterns flagged in PORTING.md:
 *  - 4-way h1 branching (one/many × pickup/delivery) — preserved
 *    with nested <If compare>/<Else /> instead of source's nested
 *    `{{#compare}}{{else}}` for readability; emitted HBS shape is
 *    equivalent.
 *  - `{{#richShippingData}}` + `{{#group … by="…"}}` — no sugar
 *    component, wrapped in <Raw> open/close.
 *  - The packages section uses a nested IF (pickup→Items vs delivery→
 *    Package) to mirror the source's per-package branching.
 */

import { Body, Container, Heading, Html, Section } from 'react-email';
import { Else, If, Raw } from 'react-email-bridge/hbs';

import {
  AddressDeliveryNoTitle,
  AddressPickupBusinessHours,
  AddressPickupNoTitle,
  HtmlHead,
  Items,
  Logo,
  OrderReference,
  Package,
  Pickup,
  Regards,
  Shipping,
} from '../components/index.js';

const sectionStyle = {
  padding: '24px',
};

const sectionWithDividerStyle = {
  ...sectionStyle,
  borderTop: '1px solid #ddd',
};

export default function OrderShipped() {
  return (
    <Html>
      <HtmlHead />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', maxWidth: '600px' }}>
          {/* Header section — Logo + 4-way headline + order ref + many-pkgs notice */}
          <Section style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
            <Logo />

            <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
              {/* Just 1 package */}
              <If
                compare={[
                  'shippingData.logisticsInfo.0.selectedDeliveryChannel',
                  '==',
                  "'pickup-in-point'",
                ]}
              >
                <Heading as="h1">Seu pacote está disponível para retirada.</Heading>
                <Else />
                <Heading as="h1">Sua entrega foi iniciada.</Heading>
              </If>

              <OrderReference />

              <Else />
              {/* More than 1 package */}
              <If
                compare={[
                  'shippingData.logisticsInfo.0.selectedDeliveryChannel',
                  '==',
                  "'pickup-in-point'",
                ]}
              >
                <Heading as="h1">Um novo pacote está disponível para retirada.</Heading>
                <Else />
                <Heading as="h1">Uma nova entrega foi iniciada.</Heading>
              </If>

              <OrderReference />

              <Section
                style={{
                  backgroundColor: '#f4f4f4',
                  padding: '12px 16px',
                  marginTop: '16px',
                  fontWeight: 700,
                  lineHeight: 1.4,
                }}
              >
                <div>Seu pedido possui mais de um pacote.</div>
                <div>Avisaremos sobre o andamento de cada um deles.</div>
              </Section>
            </If>
          </Section>

          {/* Intro message — pickup vs shipping (mutually exclusive) */}
          <Section style={sectionStyle}>
            <If
              compare={[
                'shippingData.logisticsInfo.0.selectedDeliveryChannel',
                '==',
                "'pickup-in-point'",
              ]}
            >
              <Pickup />
              <Else />
              <Shipping />
            </If>
          </Section>

          {/* Shipping address per logistics group */}
          <Section style={sectionStyle}>
            <Raw>{`{{#richShippingData shippingData}}`}</Raw>
            <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
            <div>
              <Heading as="h3" style={{ margin: '0 0 8px' }}>
                Endereço
              </Heading>
              <AddressDeliveryNoTitle />
              <AddressPickupNoTitle />
              <AddressPickupBusinessHours />
            </div>
            <Raw>{`{{/group}}`}</Raw>
            <Raw>{`{{/richShippingData}}`}</Raw>
          </Section>

          {/* Packages per logistics group, then per package: items vs package */}
          <Section style={sectionWithDividerStyle}>
            <Raw>{`{{#richShippingData shippingData}}`}</Raw>
            <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
            <div>
              <Heading as="h3" style={{ margin: '0 0 8px' }}>
                Pacote
              </Heading>
              <Raw>{`{{#group items by="packageId"}}`}</Raw>
              <If compare={['items.0.selectedDeliveryChannel', '==', "'pickup-in-point'"]}>
                <Items />
                <Else />
                <Package />
              </If>
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
