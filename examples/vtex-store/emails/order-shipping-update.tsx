/**
 * VTEX `order-shipping-update` — Halo-Tailwind (Bloco 11).
 * Tracking update: latest courier event + tracking link + history table.
 */

import { Body, Button, Container, Heading, Html, Section, Tailwind, Text } from 'react-email';
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
import { vtexStoreTailwindConfig } from '../tailwind.config.js';

const labelClass = 'font-13 text-fg-2 uppercase tracking-wider m-0 mb-3';

export default function OrderShippingUpdate() {
  return (
    <Tailwind config={vtexStoreTailwindConfig}>
      <Html>
        <HtmlHead />
        <Body className="bg-bg m-0 py-8 font-sans">
          <Container className="bg-bg-2 mx-auto max-w-[600px] rounded-lg overflow-hidden">
            <Section className="px-6 pt-2 text-center">
              <Logo />
              <Heading className="font-32 font-geist text-fg m-0 mb-2">
                Sua entrega foi atualizada.
              </Heading>
              <OrderReference />

              <If path="package.courierStatus.data.0.lastChange">
                <Section className="bg-bg-3 rounded-lg p-5 mt-6 text-left">
                  <div className="font-13 text-fg-2 font-semibold">
                    {`{{formatDateTime package.courierStatus.data.0.lastChange}}`}
                  </div>
                  <div className="font-22 text-fg font-semibold mt-1">
                    {`{{package.courierStatus.data.0.description}}`}
                  </div>
                  <If path="package.courierStatus.data.0.city">
                    <div className="font-13 text-fg-2 mt-1">
                      {`{{package.courierStatus.data.0.city}}`}
                      <If path="package.courierStatus.data.0.state">
                        {' '}
                        — {`{{package.courierStatus.data.0.state}}`}
                      </If>
                    </div>
                  </If>
                </Section>
              </If>
            </Section>

            <Section className="px-6 py-6">
              <Text className="font-15 text-fg m-0">
                <Hi />{' '}
                <If compare={['package.courierStatus.data.length', '>', '1']}>
                  Acompanhe o andamento da sua entrega:
                  <Else />
                  Seguem os detalhes da sua entrega:
                </If>
              </Text>

              <div className="mt-4 mb-4">
                <If path="package.courier">
                  <div className="font-15 text-fg">
                    <strong>Transporte via {`{{package.courier}}`}</strong>
                  </div>
                </If>
                <div className="font-15 text-fg">Rastreio #{`{{package.trackingNumber}}`}</div>
                <div className="mt-3">
                  <Button
                    href={`{{package.trackingUrl}}`}
                    className="inline-block bg-fg text-bg-2 font-15 font-semibold px-6 py-3 rounded-lg no-underline"
                  >
                    Ver histórico detalhado
                  </Button>
                </div>
              </div>

              <If compare={['package.courierStatus.data.length', '>', '1']}>
                <div className="mt-4 border-t border-stroke">
                  <Each path="package.courierStatus.data">
                    <div className="py-3 border-b border-stroke">
                      <div className="font-13 text-fg-2">{`{{formatDateTime lastChange}}`}</div>
                      <div className="font-15 text-fg">{`{{description}}`}</div>
                      <If path="city">
                        <div className="font-13 text-fg-2">
                          {`{{city}}`}
                          <If path="state"> — {`{{state}}`}</If>
                        </div>
                      </If>
                    </div>
                  </Each>
                </div>
              </If>
            </Section>

            <hr className="border-stroke m-0" />

            <Section className="px-6 py-6">
              <Raw>{`{{#richShippingData shippingData}}`}</Raw>
              <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
              <div>
                <div className={labelClass}>Pacote</div>
                <AddressDeliveryNoTitle />
                <AddressPickupNoTitle />
                <Raw>{`{{#group items by="selectedSla"}}`}</Raw>
                <Package />
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
