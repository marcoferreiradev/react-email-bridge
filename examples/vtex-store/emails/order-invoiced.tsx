/**
 * VTEX `order-invoiced` — Halo-Tailwind (Bloco 11).
 * Intro (non-anonymous only) + per-group items.
 */

import { Else, If, Raw } from 'react-email-bridge/hbs';

import {
  EmailDivider,
  EmailLayout,
  EmailSection,
  Handling,
  Hi,
  Items,
} from '../components/index.js';

const pill = (
  <span className="bg-status-warning-bg text-status-warning-fg font-13 font-semibold px-3 py-1 rounded-full inline-block">
    Mais de uma Nota Fiscal · avisaremos sobre cada uma
  </span>
);

export default function OrderInvoiced() {
  return (
    <EmailLayout
      title="Sua Nota Fiscal foi emitida."
      orderReference
      headerExtra={
        <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>{pill}</If>
      }
    >
      <EmailSection>
        <If path="clientProfileData.firstName">
          <If compare={['clientProfileData.firstName', '!=', "'isAnonymous'"]}>
            <p className="font-15 text-fg m-0">
              <Hi /> <Handling />
            </p>
          </If>
        </If>
      </EmailSection>

      <EmailDivider />
      <EmailSection>
        <Raw>{`{{#richShippingData shippingData}}`}</Raw>
        <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
        <div>
          <If compare={['items.length', '>', '1']}>
            <div className="font-13 text-fg-2 uppercase tracking-wider m-0 mb-4">
              Produtos na Nota Fiscal
            </div>
            <Else />
            <div className="font-13 text-fg-2 uppercase tracking-wider m-0 mb-4">
              Produto na Nota Fiscal
            </div>
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
