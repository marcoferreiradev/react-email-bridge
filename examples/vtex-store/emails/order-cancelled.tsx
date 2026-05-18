/**
 * VTEX `order-cancelled` template — Halo-Tailwind (Bloco 11).
 * Header + Totals + per-group items + Regards. No payment, no addresses.
 */

import { Body, Container, Heading, Html, Section, Tailwind } from 'react-email';
import { Else, If, Raw } from 'react-email-bridge/hbs';

import { HtmlHead, Items, Logo, OrderReference, Regards, Totals } from '../components/index.js';
import { vtexStoreTailwindConfig } from '../tailwind.config.js';

export default function OrderCancelled() {
  return (
    <Tailwind config={vtexStoreTailwindConfig}>
      <Html>
        <HtmlHead />
        <Body className="bg-bg m-0 py-8 font-sans">
          <Container className="bg-bg-2 mx-auto max-w-[600px] rounded-lg overflow-hidden">
            <Section className="px-6 pt-2 text-center">
              <Logo />
              <Heading className="font-32 font-geist text-fg m-0 mb-2">
                Seu pedido foi cancelado.
              </Heading>
              <OrderReference />
            </Section>

            <hr className="border-stroke m-0 mt-6" />

            <Section className="px-6 py-6">
              <Totals />
              <div className="mt-6">
                <Raw>{`{{#richShippingData shippingData}}`}</Raw>
                <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
                <div>
                  <If compare={['items.length', '>', '1']}>
                    <div className="font-13 text-fg-2 uppercase tracking-wider m-0 mb-2">
                      Produtos
                    </div>
                    <Else />
                    <div className="font-13 text-fg-2 uppercase tracking-wider m-0 mb-2">
                      Produto
                    </div>
                  </If>
                  <Raw>{`{{#group items by="packageId"}}`}</Raw>
                  <Items />
                  <Raw>{`{{/group}}`}</Raw>
                </div>
                <Raw>{`{{/group}}`}</Raw>
                <Raw>{`{{/richShippingData}}`}</Raw>
              </div>
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
