import { Heading, Section } from 'react-email';
import { If } from 'react-email-bridge/hbs';
import { AddressDeliveryInfo } from './AddressDeliveryInfo.js';

const boxStyle = {
  backgroundColor: '#f4f4f4',
  padding: '12px 16px',
  marginBottom: '12px',
};

/**
 * Mirrors `partials/address-delivery-title.hbs`. Adds an "Entrega" heading
 * on top of the same address-info shown by `AddressDeliveryNoTitle`.
 * Duplicate branches preserved for the same reason as the no-title variant.
 */
export function AddressDeliveryTitle() {
  return (
    <>
      <If compare={['items.0.selectedDeliveryChannel', '==', 'null']}>
        <Section style={boxStyle}>
          <Heading as="h4">Entrega</Heading>
          <AddressDeliveryInfo />
        </Section>
      </If>
      <If eq={['items.0.selectedDeliveryChannel', '"delivery"']}>
        <Section style={boxStyle}>
          <Heading as="h4">Entrega</Heading>
          <AddressDeliveryInfo />
        </Section>
      </If>
    </>
  );
}
