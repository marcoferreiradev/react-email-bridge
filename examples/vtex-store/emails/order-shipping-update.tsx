/**
 * VTEX `order-shipping-update` — Halo-Tailwind (Bloco 11).
 * Title + courier-status block (headerExtra) + tracking + history table.
 */

import { Button, Text } from 'react-email';
import { Each, Else, If, Raw } from 'react-email-bridge/hbs';

import {
  AddressDeliveryNoTitle,
  AddressPickupNoTitle,
  EmailDivider,
  EmailLayout,
  EmailSection,
  Hi,
  Package,
} from '../components/index.js';

const courierStatusCard = (
  <If path="package.courierStatus.data.0.lastChange">
    <div className="bg-bg-3 rounded-lg p-5 text-left">
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
    </div>
  </If>
);

export default function OrderShippingUpdate() {
  return (
    <EmailLayout title="Sua entrega foi atualizada." orderReference headerExtra={courierStatusCard}>
      <EmailSection>
        <Text className="font-15 text-fg m-0 mb-4">
          <Hi />{' '}
          <If compare={['package.courierStatus.data.length', '>', '1']}>
            Acompanhe o andamento da sua entrega:
            <Else />
            Seguem os detalhes da sua entrega:
          </If>
        </Text>

        <div className="mb-6">
          <If path="package.courier">
            <div className="font-15 text-fg">
              <strong>Transporte via {`{{package.courier}}`}</strong>
            </div>
          </If>
          <div className="font-15 text-fg-2">Rastreio #{`{{package.trackingNumber}}`}</div>
          <div className="mt-4">
            <Button
              href={`{{package.trackingUrl}}`}
              className="inline-block bg-fg text-bg-2 font-15 font-semibold px-6 py-3 rounded-lg no-underline"
            >
              Ver histórico detalhado
            </Button>
          </div>
        </div>

        <If compare={['package.courierStatus.data.length', '>', '1']}>
          <div className="border-t border-stroke">
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
      </EmailSection>

      <EmailDivider />
      <EmailSection label="Pacote">
        <Raw>{`{{#richShippingData shippingData}}`}</Raw>
        <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
        <div>
          <AddressDeliveryNoTitle />
          <AddressPickupNoTitle />
          <Raw>{`{{#group items by="selectedSla"}}`}</Raw>
          <Package />
          <Raw>{`{{/group}}`}</Raw>
        </div>
        <Raw>{`{{/group}}`}</Raw>
        <Raw>{`{{/richShippingData}}`}</Raw>
      </EmailSection>
    </EmailLayout>
  );
}
