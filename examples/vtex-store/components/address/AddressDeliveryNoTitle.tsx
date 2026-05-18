import { Section } from 'react-email';
import { If } from 'react-email-bridge/hbs';
import { AddressDeliveryInfo } from './AddressDeliveryInfo.js';

/**
 * Delivery address card. Two parallel branches for
 * `selectedDeliveryChannel == null` and `== "delivery"` — source
 * duplicates the markup, we preserve.
 *
 * Halo-Tailwind: subtle card surface.
 */
export function AddressDeliveryNoTitle() {
  const boxClass = 'bg-bg-3 rounded-lg p-4 mb-3 max-w-[440px] font-15 text-fg';
  return (
    <>
      <If compare={['items.0.selectedDeliveryChannel', '==', 'null']}>
        <Section className={boxClass}>
          <AddressDeliveryInfo />
        </Section>
      </If>
      <If eq={['items.0.selectedDeliveryChannel', '"delivery"']}>
        <Section className={boxClass}>
          <AddressDeliveryInfo />
        </Section>
      </If>
    </>
  );
}
