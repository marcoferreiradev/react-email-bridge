import { Section } from 'react-email';
import { If } from 'react-email-bridge/hbs';
import { AddressDeliveryInfo } from './AddressDeliveryInfo.js';

const boxStyle = {
  backgroundColor: '#f4f4f4',
  padding: '12px 16px',
  marginBottom: '12px',
  maxWidth: '440px',
};

/**
 * Mirrors `partials/address-delivery-no-title.hbs`. Two parallel branches:
 *   - `selectedDeliveryChannel == null` (still being assigned)
 *   - `selectedDeliveryChannel == "delivery"` (committed delivery)
 *
 * Both render the same address-info block — the source duplicates the
 * markup, we preserve the duplication so the export .hbs matches what
 * VTEX Message Center expects to see.
 */
export function AddressDeliveryNoTitle() {
  return (
    <>
      <If compare={['items.0.selectedDeliveryChannel', '==', 'null']}>
        <Section style={boxStyle}>
          <AddressDeliveryInfo />
        </Section>
      </If>
      <If eq={['items.0.selectedDeliveryChannel', '"delivery"']}>
        <Section style={boxStyle}>
          <AddressDeliveryInfo />
        </Section>
      </If>
    </>
  );
}
