import { Section } from 'react-email';
import { If } from 'react-email-bridge/hbs';
import { AddressPickupInfo } from './AddressPickupInfo';

/**
 * Pickup store info card (no heading). Gated by
 * `selectedDeliveryChannel == "pickup-in-point"`. Halo-Tailwind.
 */
export function AddressPickupNoTitle() {
  return (
    <If eq={['items.0.selectedDeliveryChannel', '"pickup-in-point"']}>
      <Section className="bg-bg-3 rounded-lg p-4 mb-3 max-w-[440px] font-15 text-fg">
        <AddressPickupInfo />
      </Section>
    </If>
  );
}
