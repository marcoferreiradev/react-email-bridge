/**
 * VTEX `order-delivered` — Halo-Tailwind (Bloco 11).
 * 4-way Delivered/PickedUp title + intro + addresses + packages.
 */

import { Text } from 'react-email';
import { Else, If, Raw } from 'react-email-bridge/hbs';

import {
  AddressDeliveryNoTitle,
  AddressPickupNoTitle,
  EmailDivider,
  EmailLayout,
  EmailSection,
  Hi,
  Items,
  Package,
} from '../components/index.js';

function Delivered() {
  return (
    <>
      <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
        <Text className="font-15 text-fg m-0">
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Seu produto acabou de ser entregue no seu endereço.
            <Else />
            Seus produtos acabaram de ser entregues no seu endereço.
          </If>
        </Text>
      </If>
      <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
        <Text className="font-15 text-fg m-0">
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
        <Text className="font-15 text-fg m-0">
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Seu produto foi retirado.
            <Else />
            Seus produtos foram retirados.
          </If>
        </Text>
      </If>
      <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
        <Text className="font-15 text-fg m-0">
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

const branchedTitle = (
  <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
    <If
      compare={['shippingData.logisticsInfo.0.selectedDeliveryChannel', '==', "'pickup-in-point'"]}
    >
      A retirada do seu pacote foi concluída.
      <Else />
      Sua entrega foi concluída.
    </If>
    <Else />
    <If
      compare={['shippingData.logisticsInfo.0.selectedDeliveryChannel', '==', "'pickup-in-point'"]}
    >
      A retirada de um dos seus pacotes foi concluída.
      <Else />
      Uma de suas entregas foi concluída.
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

export default function OrderDelivered() {
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
          <PickedUp />
          <Else />
          <Delivered />
        </If>
      </EmailSection>

      <EmailDivider />
      <EmailSection label="Endereço">
        <Raw>{`{{#richShippingData shippingData}}`}</Raw>
        <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
        <div>
          <AddressDeliveryNoTitle />
          <AddressPickupNoTitle />
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
