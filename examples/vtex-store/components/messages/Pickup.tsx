import { Text } from 'react-email';
import { Else, If } from 'react-email-bridge/hbs';
import { Hi } from './Hi.js';

/**
 * Mirrors `partials/messages/pickup.hbs`. Used by 06-shipped, 07-shipped-
 * cancel-request, 10-delivered. Two paragraphs gated by whether all
 * items ship in the same package or got split — each paragraph then
 * branches on whether it's one product or many.
 */
export function Pickup() {
  return (
    <>
      <If compare={['items.length', '==', 'shippingData.logisticsInfo.length']}>
        <Text style={{ marginTop: '16px' }}>
          <Hi />{' '}
          <If compare={['items.length', '==', '1']}>
            Você já pode retirar seu produto. Confira as instruções:
            <Else />
            Você já pode retirar seus produtos. Confira as instruções:
          </If>
        </Text>
      </If>
      <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
        <Text style={{ marginTop: '16px' }}>
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
