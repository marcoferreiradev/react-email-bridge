import { Else, If } from 'react-email-bridge/hbs';

/**
 * Mirrors `partials/messages/handling.hbs`. Used by 04-invoiced and
 * 05-invoiced-cancel-request. Picks one of four sentences based on
 * delivery channel (pickup vs delivery) × items count (one vs many).
 *
 *   {{#compare shippingData.logisticsInfo.0.selectedDeliveryChannel '==' 'pickup-in-point'}}
 *     {{#compare items.length '>' 1}} handlingProductsPickup
 *     {{else}}                         handlingProductPickup
 *   {{else}}
 *     {{#compare items.length '>' 1}} handlingProducts
 *     {{else}}                         handlingProduct
 */
export function Handling() {
  return (
    <If
      compare={['shippingData.logisticsInfo.0.selectedDeliveryChannel', '==', "'pickup-in-point'"]}
    >
      <If compare={['items.length', '>', '1']}>
        Estamos empacotando seus produtos para que você possa retirá-los.
        <Else />
        Estamos empacotando seu produto para que você possa retirá-lo.
      </If>
      <Else />
      <If compare={['items.length', '>', '1']}>
        Estamos empacotando seus produtos para providenciar o envio.
        <Else />
        Estamos empacotando seu produto para providenciar o envio.
      </If>
    </If>
  );
}
