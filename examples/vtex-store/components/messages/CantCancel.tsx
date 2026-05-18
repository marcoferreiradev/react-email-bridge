import { Section } from 'react-email';

/**
 * Soft warning shown on cancel-request templates (05, 07). Halo-Tailwind
 * pill: soft amber background, dark amber text, rounded.
 */
export function CantCancel() {
  return (
    <Section className="bg-status-warning-bg text-status-warning-fg font-14 font-semibold text-center py-3 px-5 mt-4 mx-auto max-w-[440px] rounded-lg">
      Não foi possível cancelar seu pedido.
    </Section>
  );
}
