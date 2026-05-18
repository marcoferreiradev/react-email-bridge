/**
 * VTEX `order-invoiced-cancel-request` — Halo-Tailwind (Bloco 11).
 * Variant of order-invoiced + CantCancel + cancelation note.
 */

import { Body, Container, Heading, Html, Section, Tailwind, Text } from 'react-email';
import { Else, If, Raw } from 'react-email-bridge/hbs';

import {
  CantCancel,
  Handling,
  Hi,
  HtmlHead,
  Items,
  Logo,
  OrderReference,
  Regards,
} from '../components/index.js';
import { vtexStoreTailwindConfig } from '../tailwind.config.js';

export default function OrderInvoicedCancelRequest() {
  return (
    <Tailwind config={vtexStoreTailwindConfig}>
      <Html>
        <HtmlHead />
        <Body className="bg-bg m-0 py-8 font-sans">
          <Container className="bg-bg-2 mx-auto max-w-[600px] rounded-lg overflow-hidden">
            <Section className="px-6 pt-2 text-center">
              <Logo />
              <Heading className="font-32 font-geist text-fg m-0 mb-2">
                Sua Nota Fiscal foi emitida.
              </Heading>
              <OrderReference />
              <CantCancel />
              <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
                <div className="mt-4">
                  <span className="bg-status-warning-bg text-status-warning-fg font-13 font-semibold px-3 py-1 rounded-full inline-block">
                    Mais de uma Nota Fiscal · avisaremos sobre cada uma
                  </span>
                </div>
              </If>
            </Section>

            <Section className="px-6 py-6">
              <If path="clientProfileData.firstName">
                <If compare={['clientProfileData.firstName', '!=', "'isAnonymous'"]}>
                  <p className="font-15 text-fg m-0 mb-3">
                    <Hi /> <Handling />
                  </p>
                </If>
              </If>
              <Text className="font-14 text-fg-2 m-0">
                Caso queira seguir com o cancelamento, você poderá recusar a entrega e
                posteriormente seu pagamento será estornado.
              </Text>
            </Section>

            <hr className="border-stroke m-0" />

            <Section className="px-6 py-6">
              <Raw>{`{{#richShippingData shippingData}}`}</Raw>
              <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
              <div>
                <If compare={['items.length', '>', '1']}>
                  <div className="font-13 text-fg-2 uppercase tracking-wider m-0 mb-3">
                    Produtos na Nota Fiscal
                  </div>
                  <Else />
                  <div className="font-13 text-fg-2 uppercase tracking-wider m-0 mb-3">
                    Produto na Nota Fiscal
                  </div>
                </If>
                <Raw>{`{{#group items by="packageId"}}`}</Raw>
                <Items />
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
