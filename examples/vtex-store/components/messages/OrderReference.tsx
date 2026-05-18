import { Text } from 'react-email';

/**
 * Sub-header showing the order id (used by 8 templates). Halo-Tailwind.
 */
export function OrderReference() {
  return (
    <Text className="font-13 text-fg-2 m-0 mt-1 text-center">
      Pedido <strong className="text-fg-2">#{`{{orderId}}`}</strong>
    </Text>
  );
}
