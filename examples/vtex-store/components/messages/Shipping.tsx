import { Text } from 'react-email';
import { Else, If } from 'react-email-bridge/hbs';
import { Hi } from './Hi.js';

/**
 * Shipping intro (used by 06-shipped, 07-shipped-cancel-request). Same
 * 4-branch shape as Pickup but for carrier-handoff. Halo-Tailwind.
 */
export function Shipping() {
  return (
    <>
      <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
        <Text className="font-15 text-fg m-0 mt-4">
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Seu produto acabou de ser entregue à transportadora.
            <Else />
            Seus produtos acabaram de ser entregues à transportadora.
          </If>
        </Text>
      </If>
      <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
        <Text className="font-15 text-fg m-0 mt-4">
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
