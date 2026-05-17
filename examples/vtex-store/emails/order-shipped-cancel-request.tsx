/**
 * VTEX `order-shipped-cancel-request` template — faithful port of
 * `refs/vtex-email-framework/source/templates/07-shipped-cancel-request.hbs`.
 *
 * Onda 2 of Bloco 7. Variant of `order-shipped` — same structure, plus
 * `<CantCancel />` overlay after `<OrderReference />` (in both single-
 * and many-package header branches), plus a static cancelation-
 * instructions paragraph after the intro.
 */

import { Body, Container, Heading, Html, Section, Text } from 'react-email';
import { Else, If, Raw } from 'react-email-bridge/hbs';

import {
  AddressDeliveryNoTitle,
  AddressPickupBusinessHours,
  AddressPickupNoTitle,
  CantCancel,
  HtmlHead,
  Items,
  Logo,
  OrderReference,
  Package,
  Pickup,
  Regards,
  Shipping,
} from '../components/index.js';

const sectionStyle = { padding: '24px' };
const sectionWithDividerStyle = { ...sectionStyle, borderTop: '1px solid #ddd' };

export default function OrderShippedCancelRequest() {
  return (
    <Html>
      <HtmlHead />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', maxWidth: '600px' }}>
          {/* Header — 4-way h1 + OrderRef + CantCancel + many-pkgs notice */}
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
              <CantCancel />

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
              <CantCancel />

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

          {/* Intro: Pickup/Shipping + static cancelation instructions */}
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

            <Text>
              Caso queria seguir com o cancelamento, você poderá recusar a entrega e posteriormente
              seu pagamento será estornado.
            </Text>
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

          {/* Packages: per logistics group, then per package: items vs package */}
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
