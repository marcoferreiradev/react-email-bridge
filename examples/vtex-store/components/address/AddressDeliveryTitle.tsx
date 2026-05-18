import { Section } from 'react-email';
import { If } from 'react-email-bridge/hbs';
import { AddressDeliveryInfo } from './AddressDeliveryInfo.js';

/**
 * Delivery address card with an "Entrega" sub-heading. Halo-Tailwind.
 */
export function AddressDeliveryTitle() {
  const boxClass = 'bg-bg-3 rounded-lg p-5 mb-3 font-15 text-fg';
  const labelClass = 'font-13 text-fg-2 uppercase tracking-wider m-0 mb-2';
  return (
    <>
      <If compare={['items.0.selectedDeliveryChannel', '==', 'null']}>
        <Section className={boxClass}>
          <div className={labelClass}>Entrega</div>
          <AddressDeliveryInfo />
        </Section>
      </If>
      <If eq={['items.0.selectedDeliveryChannel', '"delivery"']}>
        <Section className={boxClass}>
          <div className={labelClass}>Entrega</div>
          <AddressDeliveryInfo />
        </Section>
      </If>
    </>
  );
}
