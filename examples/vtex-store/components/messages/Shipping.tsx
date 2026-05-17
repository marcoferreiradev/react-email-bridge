import { Text } from 'react-email';
import { Else, If } from 'react-email-bridge/hbs';
import { Hi } from './Hi.js';

/**
 * Mirrors `partials/messages/shipping.hbs`. Used by 06-shipped, 07-shipped-
 * cancel-request. Same all-vs-split shape as Pickup but worded for the
 * carrier-handoff case.
 */
export function Shipping() {
  return (
    <>
      <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
        <Text style={{ marginTop: '16px' }}>
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Seu produto acabou de ser entregue à transportadora.
            <Else />
            Seus produtos acabaram de ser entregues à transportadora.
          </If>
        </Text>
      </If>
      <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
        <Text style={{ marginTop: '16px' }}>
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Um dos produtos do seu pedido acabou de ser entregue à transportadora.
            <Else />
            Alguns dos produtos do seu pedido acabaram de ser entregues à transportadora.
          </If>
        </Text>
      </If>
    </>
  );
}
