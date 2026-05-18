/**
 * VTEX `order-replaced` — Halo-Tailwind (Bloco 11).
 * Variant of order-confirmed with introMessageReplaced + payments.length
 * guard + no shipping-summary section.
 */

import { Button, Heading, Link, Text } from 'react-email';
import { Each, If, Raw } from 'react-email-bridge/hbs';

import {
  AddressDeliveryTitle,
  AddressPickupTitle,
  EmailDivider,
  EmailLayout,
  EmailSection,
  Hi,
  Package,
  Payment,
  Totals,
} from '../components/index';

const labelClass = 'font-13 text-fg-2 uppercase tracking-wider m-0 mb-4';

function IntroReplaced() {
  return (
    <>
      <Text className="font-15 text-fg m-0 mb-4">
        <Hi /> Estamos aguardando possíveis aprovações de pagamento para dar andamento ao seu
        pedido.
      </Text>
      <div className="my-4">
        <Button
          href={`{{ordersUrl}}`}
          className="inline-block bg-fg text-bg-2 font-15 font-semibold px-6 py-3 rounded-lg no-underline"
        >
          Acompanhar pedido
        </Button>
      </div>
      <Each path="orders.0.paymentData.transactions">
        <Each path="payments">
          <If eq={['paymentSystemName', "'Boleto Bancário'"]}>
            <Text className="font-14 text-fg-2 m-0 mt-4 mb-2">
              Não se esqueça de fazer o pagamento do boleto bancário, caso ainda não o tenha feito.
            </Text>
            <div className="mb-4">
              <Link
                href={`{{replace url '{Installment}' installments}}`}
                className="inline-block bg-bg-2 text-fg font-15 font-semibold px-5 py-2 rounded-lg border border-button-border no-underline"
              >
                Abrir boleto bancário
              </Link>
            </div>
          </If>
        </Each>
      </Each>
    </>
  );
}

export default function OrderReplaced() {
  return (
    <EmailLayout title="Seu pedido foi substituído.">
      <EmailSection>
        <IntroReplaced />
      </EmailSection>

      <If compare={['split', '!=', 'true']}>
        <If compare={['orders.0.paymentData.transactions.payments.length', '>', '0']}>
          <EmailDivider />
          <EmailSection label="Pagamento">
            <Each path="orders.0.paymentData.transactions">
              <Payment />
            </Each>
          </EmailSection>
        </If>
      </If>

      <Each path="orders">
        <EmailDivider />
        <EmailSection>
          <Heading className="font-22 text-fg m-0">Pedido #{`{{orderId}}`}</Heading>
          <Text className="font-13 text-fg-2 m-0 mt-1 mb-4">
            Fornecido e entregue por {`{{sellers.0.name}}`}
          </Text>

          <If compare={['split', '==', 'true']}>
            <If compare={['paymentData.transactions.payments.length', '>', '0']}>
              <div className="mt-4">
                <div className={labelClass}>Pagamento</div>
                <Each path="paymentData.transactions">
                  <Payment />
                </Each>
              </div>
            </If>
          </If>

          <div className="mt-6">
            <Totals />
          </div>

          <Raw>{`{{#richShippingData shippingData}}`}</Raw>
          <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
          <div className="mt-6">
            <AddressDeliveryTitle />
            <AddressPickupTitle />

            <Raw>{`{{#group items by="packageId"}}`}</Raw>
            <If compare={['item.length', '>', '1']}>
              <Heading className="font-18 text-fg mt-6 mb-2">
                Pacote <Raw>{`{{#math index '+' 1}}{{/math}}`}</Raw>
              </Heading>
            </If>
            <Package />
            <Raw>{`{{/group}}`}</Raw>
          </div>
          <Raw>{`{{/group}}`}</Raw>
          <Raw>{`{{/richShippingData}}`}</Raw>
        </EmailSection>
      </Each>

      <EmailDivider />
      <EmailSection tight>
        <Text className="font-13 text-fg-2 m-0">
          O prazo dos pacotes deverá ser considerado somente após a confirmação do pagamento.
        </Text>
      </EmailSection>
    </EmailLayout>
  );
}
