/**
 * VTEX `order-shipping-update` template — faithful port of
 * `refs/vtex-email-framework/source/templates/08-shipping-update.hbs`.
 *
 * Onda 2 of Bloco 7. Structurally distinct from the other shipping
 * variants: single h1, courier status block (latest event highlighted +
 * full history table), tracking link, and a per-group package section.
 *
 * Differences from 06-shipped:
 *   - No 4-way headline. Single h1 "Sua entrega foi atualizada."
 *   - Adds courier-status block from `package.courierStatus.data[0]`
 *     (highlighted lastChange + description + city/state).
 *   - Intro: Hi + trackDelivery (when history.length > 1) or
 *     deliveryDetails (when only 1 event).
 *   - Carrier + tracking number + history link.
 *   - Full event history table (only when history.length > 1).
 *   - Order info groups by `selectedSla` (not `packageId`) and uses
 *     `<Package />` for every package, no pickup/delivery branch.
 *   - No business hours, no per-package heading.
 */

import { Body, Container, Heading, Html, Link, Section, Text } from 'react-email';
import { Each, Else, If, Raw } from 'react-email-bridge/hbs';

import {
  AddressDeliveryNoTitle,
  AddressPickupNoTitle,
  Hi,
  HtmlHead,
  Logo,
  OrderReference,
  Package,
  Regards,
} from '../components/index.js';

const sectionStyle = { padding: '24px' };
const sectionWithDividerStyle = { ...sectionStyle, borderTop: '1px solid #ddd' };

export default function OrderShippingUpdate() {
  return (
    <Html>
      <HtmlHead />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', maxWidth: '600px' }}>
          {/* Header: Logo + h1 + OrderRef + courier latest status (when present) */}
          <Section style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
            <Logo />
            <Heading as="h1">Sua entrega foi atualizada.</Heading>
            <OrderReference />

            <If path="package.courierStatus.data.0.lastChange">
              <Section
                style={{
                  backgroundColor: '#f4f4f4',
                  padding: '8px 16px',
                  marginTop: '16px',
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                <div style={{ marginBottom: '4px', fontWeight: 700, color: '#888' }}>
                  {`{{formatDateTime package.courierStatus.data.0.lastChange}}`}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1.3 }}>
                  {`{{package.courierStatus.data.0.description}}`}
                </div>
                <If path="package.courierStatus.data.0.city">
                  <div style={{ fontSize: '16px' }}>
                    {`{{package.courierStatus.data.0.city}}`}
                    <If path="package.courierStatus.data.0.state">
                      {' '}
                      - {`{{package.courierStatus.data.0.state}}`}
                    </If>
                  </div>
                </If>
              </Section>
            </If>
          </Section>

          {/* Intro: Hi + tracking text (history-length-aware) + carrier + tracking number + history */}
          <Section style={sectionStyle}>
            <Text style={{ marginTop: '16px' }}>
              <Hi />{' '}
              <If compare={['package.courierStatus.data.length', '>', '1']}>
                Acompanhe o andamento sua entrega:
                <Else />
                Seguem os detalhes da sua entrega:
              </If>
            </Text>

            <div style={{ paddingBottom: '12px' }}>
              <If path="package.courier">
                <div style={{ fontWeight: 700 }}>Transporte via {`{{package.courier}}`}</div>
              </If>
              <div>
                Rastreio #{`{{package.trackingNumber}}`} —{' '}
                <Link href={`{{package.trackingUrl}}`}>ver histórico detalhado</Link>
              </div>
            </div>

            {/* Full history table (only when > 1 event) */}
            <If compare={['package.courierStatus.data.length', '>', '1']}>
              <Each path="package.courierStatus.data">
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#888' }}>
                    {`{{formatDateTime lastChange}}`}
                  </div>
                  <div>{`{{description}}`}</div>
                  <If path="city">
                    <div>
                      {`{{city}}`}
                      <If path="state"> - {`{{state}}`}</If>
                    </div>
                  </If>
                </div>
              </Each>
            </If>
          </Section>

          {/* Order info: package per logistics + addresses */}
          <Section style={sectionWithDividerStyle}>
            <Raw>{`{{#richShippingData shippingData}}`}</Raw>
            <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
            <div>
              <Heading as="h3" style={{ margin: '0 0 8px' }}>
                Pacote
              </Heading>
              <AddressDeliveryNoTitle />
              <AddressPickupNoTitle />
              <Raw>{`{{#group items by="selectedSla"}}`}</Raw>
              <Package />
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
