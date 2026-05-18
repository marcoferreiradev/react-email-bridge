/**
 * VTEX `order-shipped-cancel-request` — Halo-Tailwind (Bloco 11).
 * Variant of order-shipped + CantCancel + cancelation note.
 */

import { Text } from 'react-email';
import { Else, If, Raw } from 'react-email-bridge/hbs';

import {
  AddressDeliveryNoTitle,
  AddressPickupBusinessHours,
  AddressPickupNoTitle,
  CantCancel,
  EmailDivider,
  EmailLayout,
  EmailSection,
  Items,
  Package,
  Pickup,
  Shipping,
} from '../components/index.js';

const branchedTitle = (
  <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
    <If
      compare={['shippingData.logisticsInfo.0.selectedDeliveryChannel', '==', "'pickup-in-point'"]}
    >
      Seu pacote está disponível para retirada.
      <Else />
      Sua entrega foi iniciada.
    </If>
    <Else />
    <If
      compare={['shippingData.logisticsInfo.0.selectedDeliveryChannel', '==', "'pickup-in-point'"]}
    >
      Um novo pacote está disponível para retirada.
      <Else />
      Uma nova entrega foi iniciada.
    </If>
  </If>
);

const headerExtra = (
  <>
    <CantCancel />
    <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
      <div className="mt-3">
        <span className="bg-status-warning-bg text-status-warning-fg font-13 font-semibold px-3 py-1 rounded-full inline-block">
          Mais de um pacote · avisaremos sobre cada um
        </span>
      </div>
    </If>
  </>
);

export default function OrderShippedCancelRequest() {
  return (
    <EmailLayout title={branchedTitle} orderReference headerExtra={headerExtra}>
      <EmailSection>
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
        <Text className="font-14 text-fg-2 m-0 mt-4">
          Caso queira seguir com o cancelamento, você poderá recusar a entrega e posteriormente seu
          pagamento será estornado.
        </Text>
      </EmailSection>

      <EmailDivider />
      <EmailSection label="Endereço">
        <Raw>{`{{#richShippingData shippingData}}`}</Raw>
        <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
        <div>
          <AddressDeliveryNoTitle />
          <AddressPickupNoTitle />
          <AddressPickupBusinessHours />
        </div>
        <Raw>{`{{/group}}`}</Raw>
        <Raw>{`{{/richShippingData}}`}</Raw>
      </EmailSection>

      <EmailDivider />
      <EmailSection label="Pacote">
        <Raw>{`{{#richShippingData shippingData}}`}</Raw>
        <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
        <div>
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
      </EmailSection>
    </EmailLayout>
  );
}
