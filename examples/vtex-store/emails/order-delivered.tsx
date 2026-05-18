/**
 * VTEX `order-delivered` — Halo-Tailwind (Bloco 11).
 * Variant of order-shipped with Delivered/PickedUp intro + no business hours.
 */

import { Body, Container, Heading, Html, Section, Tailwind, Text } from 'react-email';
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
import { vtexStoreTailwindConfig } from '../tailwind.config.js';

const headingClass = 'font-32 font-geist text-fg m-0 mb-2';
const pillClass =
  'bg-status-warning-bg text-status-warning-fg font-13 font-semibold px-3 py-1 rounded-full inline-block';
const labelClass = 'font-13 text-fg-2 uppercase tracking-wider m-0 mb-3';

function Delivered() {
  return (
    <>
      <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
        <Text className="font-15 text-fg m-0 mt-4">
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Seu produto acabou de ser entregue no seu endereço.
            <Else />
            Seus produtos acabaram de ser entregues no seu endereço.
          </If>
        </Text>
      </If>
      <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
        <Text className="font-15 text-fg m-0 mt-4">
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

function PickedUp() {
  return (
    <>
      <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
        <Text className="font-15 text-fg m-0 mt-4">
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Seu produto foi retirado.
            <Else />
            Seus produtos foram retirados.
          </If>
        </Text>
      </If>
      <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
        <Text className="font-15 text-fg m-0 mt-4">
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
                    A retirada do seu pacote foi concluída.
                  </Heading>
                  <Else />
                  <Heading className={headingClass}>Sua entrega foi concluída.</Heading>
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
                    A retirada de um dos seus pacotes foi concluída.
                  </Heading>
                  <Else />
                  <Heading className={headingClass}>Uma de suas entregas foi concluída.</Heading>
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
                <PickedUp />
                <Else />
                <Delivered />
              </If>
            </Section>

            <hr className="border-stroke m-0" />

            <Section className="px-6 py-6">
              <Raw>{`{{#richShippingData shippingData}}`}</Raw>
              <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
              <div>
                <div className={labelClass}>Endereço</div>
                <AddressDeliveryNoTitle />
                <AddressPickupNoTitle />
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
