/**
 * VTEX `order-delivered` template — faithful port of
 * `refs/vtex-email-framework/source/templates/10-delivered.hbs`.
 *
 * Onda 2 of Bloco 7. Variant of `order-shipped` with three differences:
 *   1. Headline strings use "Delivered/PickedUp" variants
 *      (onePackagePickedUp / manyPackagePickedUp / onePackageDelivered /
 *      manyPackagesDelivered).
 *   2. Intro inlines `messages/delivered.hbs` (delivery channel) or
 *      `messages/pickedup.hbs` (pickup channel) — both are single-use
 *      partials so they live here as local `Delivered` / `PickedUp`
 *      components.
 *   3. The address section drops `AddressPickupBusinessHours` (already
 *      retrieved the package, no need to show hours again).
 */

import { Body, Container, Heading, Html, Section, Text } from 'react-email';
import { Else, If, Raw } from 'react-email-bridge/hbs';

import {
  AddressDeliveryNoTitle,
  AddressPickupNoTitle,
  Hi,
  HtmlHead,
  Items,
  Logo,
  OrderReference,
  Package,
  Regards,
} from '../components/index.js';

const sectionStyle = { padding: '24px' };
const sectionWithDividerStyle = { ...sectionStyle, borderTop: '1px solid #ddd' };

/**
 * Inlines `partials/messages/delivered.hbs`. Used by 10-delivered only.
 * Same all-vs-split × one/many shape as the shared `Shipping` component
 * but with delivery-completion copy.
 */
function Delivered() {
  return (
    <>
      <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
        <Text style={{ marginTop: '16px' }}>
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Seu produto acabou de ser entregue no seu endereço.
            <Else />
            Seus produtos acabaram de ser entregues no seu endereço.
          </If>
        </Text>
      </If>
      <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
        <Text style={{ marginTop: '16px' }}>
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Um dos produtos do seu pedido acabou de ser entregue no seu endereço.
            <Else />
            Alguns dos produtos do seu pedido acabaram de ser entregues no seu endereço.
          </If>
        </Text>
      </If>
    </>
  );
}

/**
 * Inlines `partials/messages/pickedup.hbs`. Used by 10-delivered only.
 * Same shape as `Delivered`, worded for pickup-completion.
 */
function PickedUp() {
  return (
    <>
      <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
        <Text style={{ marginTop: '16px' }}>
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Seu produto foi retirado.
            <Else />
            Seus produtos foram retirados.
          </If>
        </Text>
      </If>
      <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
        <Text style={{ marginTop: '16px' }}>
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Um de seus produtos foi retirado.
            <Else />
            Alguns de seus produtos foram retirados.
          </If>
        </Text>
      </If>
    </>
  );
}

export default function OrderDelivered() {
  return (
    <Html>
      <HtmlHead />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', maxWidth: '600px' }}>
          {/* Header — 4-way h1 (delivered/pickedup) + OrderRef + many-pkgs notice */}
          <Section style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
            <Logo />

            <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
              <If
                compare={[
                  'shippingData.logisticsInfo.0.selectedDeliveryChannel',
                  '==',
                  "'pickup-in-point'",
                ]}
              >
                <Heading as="h1">A retirada do seu pacote foi concluída.</Heading>
                <Else />
                <Heading as="h1">Sua entrega foi concluída.</Heading>
              </If>

              <OrderReference />

              <Else />
              <If
                compare={[
                  'shippingData.logisticsInfo.0.selectedDeliveryChannel',
                  '==',
                  "'pickup-in-point'",
                ]}
              >
                <Heading as="h1">A retirada de um dos seus pacotes foi concluída.</Heading>
                <Else />
                <Heading as="h1">Uma de suas entregas foi concluída.</Heading>
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

          {/* Intro: PickedUp or Delivered (mutually exclusive) */}
          <Section style={sectionStyle}>
            <If
              compare={[
                'shippingData.logisticsInfo.0.selectedDeliveryChannel',
                '==',
                "'pickup-in-point'",
              ]}
            >
              <PickedUp />
              <Else />
              <Delivered />
            </If>
          </Section>

          {/* Shipping address per logistics group (no business hours — already retrieved) */}
          <Section style={sectionStyle}>
            <Raw>{`{{#richShippingData shippingData}}`}</Raw>
            <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
            <div>
              <Heading as="h3" style={{ margin: '0 0 8px' }}>
                Endereço
              </Heading>
              <AddressDeliveryNoTitle />
              <AddressPickupNoTitle />
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
