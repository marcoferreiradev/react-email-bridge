import { Each, If, Raw } from 'react-email-bridge/hbs';

/**
 * Internal building block — mirrors `partials/address-pickup-info.hbs`.
 * Used transitively by `AddressPickupNoTitle` and `AddressPickupTitle`.
 *
 * Source uses `{{#with pickupStoreInfo.address}}` which has no sugar
 * component — wrapped in `<Raw>` open/close.
 */
export function AddressPickupInfo() {
  return (
    <Each path="items.0.slas">
      <If compare={['../items.0.selectedSla', '==', 'id']}>
        <strong>{`{{pickupStoreInfo.friendlyName}}`}</strong>
        <Raw>{`{{#with pickupStoreInfo.address}}`}</Raw>
        <br />
        {`{{street}}`}, {`{{number}}`}
        <If path="complement">, {`{{complement}}`}</If>
        <br />
        {`{{neighborhood}}`}
        <Raw>{`{{/with}}`}</Raw>
      </If>
    </Each>
  );
}
