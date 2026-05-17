import { Link, Text } from 'react-email';

/**
 * Mirrors `partials/messages/regards.hbs`. Used by all 13 templates as
 * the footer block — contact line + signoff.
 *
 * i18n keys resolved from `locales/pt-BR/i18n.json` and inlined as PT-BR.
 * Contact email/phone are storefront-specific constants (Red Cloud / Red 101).
 */
export function Regards() {
  return (
    <>
      <Text style={{ marginTop: '24px' }}>
        Para qualquer dúvida, você pode entrar em contato conosco em:
        <br />
        Email: <Link href="mailto:soporte@red101.com">soporte@red101.com</Link>
        <br />
        Telefone: <Link href="tel:+5491132945383">+5491132945383</Link>
      </Text>
      <Text>
        Atenciosamente,
        <br />
        Equipe {`{{_accountInfo.TradingName}}`}
      </Text>
    </>
  );
}
