import { Text } from 'react-email';

/**
 * Mirrors `partials/messages/order-reference.hbs`. Single-line note with
 * the order id, used as a sub-header in 8 of the 13 templates.
 */
export function OrderReference() {
  return (
    <Text style={{ marginTop: '8px', color: '#888' }}>
      Referente ao Pedido <strong>#{`{{orderId}}`}</strong>
    </Text>
  );
}
