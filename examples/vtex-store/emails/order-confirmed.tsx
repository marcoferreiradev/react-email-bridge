/**
 * VTEX `order-confirmed` — Halo-Tailwind (Bloco 11).
 * Most complex template. Composes IntroBlock + ShippingSummary cards +
 * per-order section (Payment + Totals + addresses + Package).
 */

import { Button, Heading, Link, Section, Text } from 'react-email';
import { Each, Else, If, Raw } from 'react-email-bridge/hbs';

import {
  AddressDeliveryTitle,
  AddressPickupTitle,
  EmailDivider,
  EmailLayout,
  EmailSection,
  Hi,
  Package,
  Payment,
  ShippingEstimateRangeTime,
  Totals,
} from '../components/index';

const labelClass = 'font-13 text-fg-2 uppercase tracking-wider m-0 mb-4';
const pillClass =
  'bg-status-warning-bg text-status-warning-fg font-13 font-semibold px-3 py-1 rounded-full inline-block';

function IntroBlock() {
  return (
    <>
      <Text className="font-15 text-fg m-0 mb-4">
        <Hi /> Estamos aguardando a aprovação do pagamento para dar andamento ao seu pedido.
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

function ShippingSummary() {
  return (
    <>
      <Raw>{`{{#richShippingData shippingData}}`}</Raw>
      <Raw>{`{{#group logisticsInfo by="packageId"}}`}</Raw>
      <Each path="items">
        <If compare={['@index', '==', '0']}>
          <Section className="bg-bg-3 rounded-lg p-5 mb-3 max-w-[480px]">
            <If eq={['selectedDeliveryChannel', '"pickup-in-point"']}>
              <div className={labelClass}>Retirar</div>
              <Else />
              <div className={labelClass}>Receber</div>
            </If>

            <div className="font-15 text-fg mb-3">
              <If eq={['../items.length', '1']}>
                <Each path="../../../items">
                  <If compare={['id', '==', '../../items.0.itemId']}>
                    <strong>{`{{name}}`}</strong>
                  </If>
                </Each>
                <Else />
                <strong>{`{{../items.length}}`} itens</strong>
              </If>
            </div>

            <div className="font-13 text-fg-2">
              <If path="deliveryWindow">
                <>
                  Em {`{{formatDate deliveryWindow.startDateUtc}}`}, entre{' '}
                  {`{{formatTime deliveryWindow.startDateUtc}}`} e{' '}
                  {`{{formatTime deliveryWindow.endDateUtc}}`}
                </>
                <Else />
                <If path="shippingEstimateDate">
                  <>
                    <If eq={['deliveryChannel', '"pickup-in-point"']}>
                      a partir de
                      <Else />
                      até
                    </If>{' '}
                    {`{{formatDate shippingEstimateDate}}`}
                  </>
                  <Else />
                  <If eq={['shippingEstimateDays', '"0"']}>
                    <If eq={['selectedDeliveryChannel', '"pickup-in-point"']}>
                      a partir de hoje
                      <Else />
                      hoje
                    </If>
                    <Else />
                    <If eq={['selectedDeliveryChannel', '"pickup-in-point"']}>
                      a partir de
                      <Else />
                      em até
                    </If>{' '}
                    <ShippingEstimateRangeTime />
                  </If>
                </If>
              </If>
            </div>

            <div className="font-13 text-fg-2 mt-3 pt-3 border-t border-stroke">
              <If eq={['selectedDeliveryChannel', '"pickup-in-point"']}>
                <Each path="slas">
                  <If
                    compare={['../selectedSla', '==', 'id']}
                  >{`{{pickupStoreInfo.friendlyName}}`}</If>
                </Each>
                <Else />
                <If path="../../../giftRegistryData">
                  {`{{../../../giftRegistryData.description}}`}
                  <Else />
                  <Each path="../../availableAddresses">
                    <If eq={['../addressId', 'addressId']}>
                      {`{{street}}`}, {`{{number}}`}
                    </If>
                  </Each>
                </If>
              </If>
            </div>
          </Section>
        </If>
      </Each>
      <Raw>{`{{/group}}`}</Raw>
      <Raw>{`{{/richShippingData}}`}</Raw>
    </>
  );
}

export default function OrderConfirmed() {
  return (
    <EmailLayout title="Obrigado pelo seu pedido.">
      <EmailSection>
        <IntroBlock />
      </EmailSection>

      <EmailDivider />
      <EmailSection label="Resumo do envio">
        <Each path="orders">
          <ShippingSummary />
        </Each>
      </EmailSection>

      <If compare={['split', '!=', 'true']}>
        <EmailDivider />
        <EmailSection label="Pagamento">
          <Each path="orders.0.paymentData.transactions">
            <Payment />
            <div className="mt-2">
              <span className={pillClass}>Aguardando aprovação</span>
            </div>
          </Each>
        </EmailSection>
      </If>

      <Each path="orders">
        <EmailDivider />
        <EmailSection>
          <Heading className="font-22 text-fg m-0">Pedido #{`{{orderId}}`}</Heading>
          <Text className="font-13 text-fg-2 m-0 mt-1 mb-4">
            Fornecido e entregue por {`{{sellers.0.name}}`}
          </Text>

          <If compare={['split', '==', 'true']}>
            <div className="mt-4">
              <div className={labelClass}>Pagamento</div>
              <Each path="paymentData.transactions">
                <Payment />
                <div className="mt-2">
                  <span className={pillClass}>Aguardando aprovação</span>
                </div>
              </Each>
            </div>
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
