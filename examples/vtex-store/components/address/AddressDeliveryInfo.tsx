import { If } from 'react-email-bridge/hbs';
import { Each, Else } from 'react-email-bridge/hbs';

/**
 * Internal building block — mirrors `partials/address-delivery-info.hbs`.
 * NOT exported from the address barrel because the source partial isn't
 * used directly by any top-level template; it's transitively included
 * by `address-delivery-no-title` and `address-delivery-title`. Keep it
 * here for reuse between those two variants.
 *
 * Uses parent-path #each (`../../shippingData.availableAddresses`) — the
 * regression test for this lives in tests/render-pipeline.test.tsx.
 */
export function AddressDeliveryInfo() {
  return (
    <If path="orders.0.giftRegistryData">
      {`{{orders.0.giftRegistryData.description}}`}
      <Else />
      <Each path="../../shippingData.availableAddresses">
        <If eq={['../addressId', 'AddressId']}>
          <strong>{`{{receiverName}}`}</strong>
          <br />
          {`{{street}}`}, {`{{number}}`}
          <If path="complement"> - {`{{complement}}`}</If>
          <br />
          {`{{neighborhood}}`} - {`{{city}}`} - {`{{state}}`}
          <br />
          CEP {`{{postalCode}}`}
        </If>
      </Each>
    </If>
  );
}
