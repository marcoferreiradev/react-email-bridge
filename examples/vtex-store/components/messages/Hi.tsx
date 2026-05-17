import { If } from 'react-email-bridge/hbs';

/**
 * Mirrors `partials/messages/hi.hbs`. Greets the customer by first name
 * when the order has one and it isn't the anonymous sentinel.
 *
 * The source partial branches on whether `orders` (multi-order context)
 * or a bare `clientProfileData` (single-order context) is present. We
 * keep both branches.
 */
export function Hi() {
  return (
    <>
      <If path="orders">
        <If path="orders.0.clientProfileData.firstName">
          <If compare={['orders.0.clientProfileData.firstName', '!=', "'isAnonymous'"]}>
            {' '}
            Olá, {`{{orders.0.clientProfileData.firstName}}`}.{' '}
          </If>
        </If>
      </If>
      <If path="clientProfileData.firstName">
        <If compare={['clientProfileData.firstName', '!=', "'isAnonymous'"]}>
          {' '}
          Olá, {`{{clientProfileData.firstName}}`}.{' '}
        </If>
      </If>
    </>
  );
}
