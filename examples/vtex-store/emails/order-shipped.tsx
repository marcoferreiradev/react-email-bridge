/**
 * VTEX `order-shipped` — Halo-Tailwind (Bloco 11).
 * 4-way h1 (one/many × pickup/delivery) + intro + addresses + packages.
 */

import { Body, Container, Heading, Html, Section, Tailwind } from 'react-email';
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
import { vtexStoreTailwindConfig } from '../tailwind.config.js';

const headingClass = 'font-32 font-geist text-fg m-0 mb-2';
const pillClass =
  'bg-status-warning-bg text-status-warning-fg font-13 font-semibold px-3 py-1 rounded-full inline-block';
const labelClass = 'font-13 text-fg-2 uppercase tracking-wider m-0 mb-3';

export default function OrderShipped() {
  return (
    <Tailwind config={vtexStoreTailwindConfig}>
      <Html>
        <HtmlHead />
        <Body className="bg-bg m-0 py-8 font-sans">
          <Container className="bg-bg-2 mx-auto max-w-[600px] rounded-lg overflow-hidden">
            <Section className="px-6 pt-2 text-center">
              <Logo />
              <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
                <If
                  compare={[
                    'shippingData.logisticsInfo.0.selectedDeliveryChannel',
                    '==',
                    "'pickup-in-point'",
                  ]}
                >
                  <Heading className={headingClass}>
                    Seu pacote está disponível para retirada.
                  </Heading>
                  <Else />
                  <Heading className={headingClass}>Sua entrega foi iniciada.</Heading>
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
                  <Heading className={headingClass}>
                    Um novo pacote está disponível para retirada.
                  </Heading>
                  <Else />
                  <Heading className={headingClass}>Uma nova entrega foi iniciada.</Heading>
                </If>
                <OrderReference />
                <div className="mt-4">
                  <span className={pillClass}>Mais de um pacote · avisaremos sobre cada um</span>
                </div>
              </If>
            </Section>

            <Section className="px-6 py-6">
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

            <hr className="border-stroke m-0" />

            <Section className="px-6 py-6">
              <Raw>{`{{#richShippingData shippingData}}`}</Raw>
              <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
              <div className="mb-2">
                <div className={labelClass}>Endereço</div>
                <AddressDeliveryNoTitle />
                <AddressPickupNoTitle />
                <AddressPickupBusinessHours />
              </div>
              <Raw>{`{{/group}}`}</Raw>
              <Raw>{`{{/richShippingData}}`}</Raw>
            </Section>

            <hr className="border-stroke m-0" />

            <Section className="px-6 py-6">
              <Raw>{`{{#richShippingData shippingData}}`}</Raw>
              <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
              <div>
                <div className={labelClass}>Pacote</div>
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

            <hr className="border-stroke m-0" />

            <Section className="px-6 py-6">
              <Regards />
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
