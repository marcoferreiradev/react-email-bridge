import { Text } from 'react-email';
import { Else, If } from 'react-email-bridge/hbs';
import { Hi } from './Hi.js';

/**
 * Pickup intro (used by 06-shipped, 07-shipped-cancel-request,
 * 10-delivered). 4 branches: all-vs-split × one/many. Halo-Tailwind.
 */
export function Pickup() {
  return (
    <>
      <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
        <Text className="font-15 text-fg m-0 mt-4">
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Você já pode retirar seu produto. Confira as instruções:
            <Else />
            Você já pode retirar seus produtos. Confira as instruções:
          </If>
        </Text>
      </If>
      <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
        <Text className="font-15 text-fg m-0 mt-4">
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Você já pode retirar um dos seus produtos. Confira as instruções:
            <Else />
            Você já pode retirar alguns dos seus produtos. Confira as instruções:
          </If>
        </Text>
      </If>
    </>
  );
}
