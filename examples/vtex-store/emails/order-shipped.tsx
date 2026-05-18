/**
 * VTEX `order-shipped` — Halo-Tailwind (Bloco 11).
 * 4-way title (one/many × pickup/delivery) + intro + addresses + packages.
 */

import { Else, If, Raw } from 'react-email-bridge/hbs';

import {
  AddressDeliveryNoTitle,
  AddressPickupBusinessHours,
  AddressPickupNoTitle,
  EmailDivider,
  EmailLayout,
  EmailSection,
  Items,
  Package,
  Pickup,
  Regards as _Regards,
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

const manyPackagesPill = (
  <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
    <span className="bg-status-warning-bg text-status-warning-fg font-13 font-semibold px-3 py-1 rounded-full inline-block">
      Mais de um pacote · avisaremos sobre cada um
    </span>
  </If>
);

export default function OrderShipped() {
  return (
    <EmailLayout title={branchedTitle} orderReference headerExtra={manyPackagesPill}>
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
