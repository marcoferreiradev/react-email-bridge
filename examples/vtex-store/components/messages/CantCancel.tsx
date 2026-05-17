import { Text } from 'react-email';

/**
 * Mirrors `partials/messages/cant-cancel.hbs`. Static warning shown on
 * cancel-request templates (05, 07) when the order can't actually be
 * cancelled because it already shipped or was invoiced.
 */
export function CantCancel() {
  return (
    <Text
      style={{
        backgroundColor: '#fff2f1',
        color: '#666',
        padding: '12px 16px',
        marginTop: '24px',
        fontWeight: 700,
        textAlign: 'center',
        lineHeight: 1.5,
      }}
    >
      Não foi possível cancelar seu pedido.
    </Text>
  );
}
