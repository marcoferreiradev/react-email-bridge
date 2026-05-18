import { Link, Text } from 'react-email';
import { button, text } from '../../theme.js';

/**
 * Used by all 13 templates as the footer block — contact line + signoff.
 *
 * Mirrors `partials/messages/regards.hbs` structurally; styling updated
 * in Bloco 11 to use theme tokens (muted body text + subtle link style).
 * Contact email/phone are storefront-specific constants (Red Cloud /
 * Red 101) — real users override in their own fork.
 */
export function Regards() {
  return (
    <>
      <Text style={text.bodyMuted}>
        Para qualquer dúvida, você pode entrar em contato conosco em:
        <br />
        Email:{' '}
        <Link href="mailto:soporte@red101.com" style={button.textLink}>
          soporte@red101.com
        </Link>
        <br />
        Telefone:{' '}
        <Link href="tel:+5491132945383" style={button.textLink}>
          +5491132945383
        </Link>
      </Text>
      <Text style={text.body}>
        Atenciosamente,
        <br />
        Equipe {`{{_accountInfo.TradingName}}`}
      </Text>
    </>
  );
}
