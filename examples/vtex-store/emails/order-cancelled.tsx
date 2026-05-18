/**
 * VTEX `order-cancelled` — Halo-Tailwind (Bloco 11).
 * Totals + per-group items.
 */

import { Else, If, Raw } from 'react-email-bridge/hbs';

import { EmailDivider, EmailLayout, EmailSection, Items, Totals } from '../components/index.js';

export default function OrderCancelled() {
  return (
    <EmailLayout title="Seu pedido foi cancelado." orderReference>
      <EmailDivider />
      <EmailSection>
        <Totals />
      </EmailSection>

      <EmailDivider />
      <EmailSection>
        <Raw>{`{{#richShippingData shippingData}}`}</Raw>
        <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
        <div>
          <If compare={['items.length', '>', '1']}>
            <div className="font-13 text-fg-2 uppercase tracking-wider m-0 mb-4">Produtos</div>
            <Else />
            <div className="font-13 text-fg-2 uppercase tracking-wider m-0 mb-4">Produto</div>
          </If>
          <Raw>{`{{#group items by="packageId"}}`}</Raw>
          <Items />
          <Raw>{`{{/group}}`}</Raw>
        </div>
        <Raw>{`{{/group}}`}</Raw>
        <Raw>{`{{/richShippingData}}`}</Raw>
      </EmailSection>
    </EmailLayout>
  );
}
