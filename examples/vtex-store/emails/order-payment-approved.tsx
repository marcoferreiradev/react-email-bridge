/**
 * VTEX `order-payment-approved` — Halo-Tailwind (Bloco 11).
 * Header + Hi + preparing-shipping copy + Payment + Regards.
 */

import { Body, Container, Heading, Html, Section, Tailwind, Text } from 'react-email';
import { Each, Else, If } from 'react-email-bridge/hbs';

import { Hi, HtmlHead, Logo, OrderReference, Payment, Regards } from '../components/index.js';
import { vtexStoreTailwindConfig } from '../tailwind.config.js';

export default function OrderPaymentApproved() {
  return (
    <Tailwind config={vtexStoreTailwindConfig}>
      <Html>
        <HtmlHead />
        <Body className="bg-bg m-0 py-8 font-sans">
          <Container className="bg-bg-2 mx-auto max-w-[600px] rounded-lg overflow-hidden">
            <Section className="px-6 pt-2 text-center">
              <Logo />
              <Heading className="font-32 font-geist text-fg m-0 mb-2">
                Seu pagamento foi aprovado.
              </Heading>
              <OrderReference />
            </Section>

            <Section className="px-6 py-6">
              <Text className="font-15 text-fg m-0">
                <Hi />{' '}
                <If compare={['shippingData.logisticsInfo.length', '>', '1']}>
                  Estamos providenciando a emissão da Nota Fiscal do seu pedido e o envio dos seus
                  produtos.
                  <Else />
                  Estamos providenciando a emissão da Nota Fiscal do seu pedido e o envio do seu
                  produto.
                </If>
              </Text>
            </Section>

            <hr className="border-stroke m-0" />

            <Section className="px-6 py-6">
              <div className="font-13 text-fg-2 uppercase tracking-wider m-0 mb-3">Pagamento</div>
              <Each path="paymentData.transactions">
                <Payment />
              </Each>
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
