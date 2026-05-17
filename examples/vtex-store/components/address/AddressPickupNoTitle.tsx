import { Section } from 'react-email';
import { If } from 'react-email-bridge/hbs';
import { AddressPickupInfo } from './AddressPickupInfo.js';

/**
 * Mirrors `partials/address-pickup-no-title.hbs`. Single branch — gated
 * by `selectedDeliveryChannel == "pickup-in-point"`. The wrapped box
 * is rendered only for pickup channels.
 */
export function AddressPickupNoTitle() {
  return (
    <If eq={['items.0.selectedDeliveryChannel', '"pickup-in-point"']}>
      <Section
        style={{
          backgroundColor: '#f4f4f4',
          padding: '12px 16px',
          marginBottom: '12px',
          maxWidth: '440px',
        }}
      >
        <AddressPickupInfo />
      </Section>
    </If>
  );
}
