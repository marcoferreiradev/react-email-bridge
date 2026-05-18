import { Heading, Section } from 'react-email';
import { If } from 'react-email-bridge/hbs';
import { AddressPickupInfo } from './AddressPickupInfo';

/**
 * Mirrors `partials/address-pickup-title.hbs`. Adds a "Retirar" heading
 * on top of the pickup info block.
 */
export function AddressPickupTitle() {
  return (
    <If eq={['items.0.selectedDeliveryChannel', '"pickup-in-point"']}>
      <Section
        style={{
          backgroundColor: '#f4f4f4',
          padding: '12px 16px',
          marginBottom: '12px',
        }}
      >
        <Heading as="h4">Retirar</Heading>
        <AddressPickupInfo />
      </Section>
    </If>
  );
}
