import { Link, Text } from 'react-email';

/**
 * Used by all 13 templates as the footer block — contact line + signoff.
 *
 * Bloco 11: Halo-Tailwind styling. Contact email/phone are storefront-
 * specific constants (Red Cloud / Red 101) — real users override in
 * their own fork.
 */
export function Regards() {
  return (
    <>
      <Text className="font-14 text-fg-2 m-0 mb-4">
        Para qualquer dúvida, você pode entrar em contato conosco em:
        <br />
        Email:{' '}
        <Link href="mailto:soporte@red101.com" className="text-fg underline underline-offset-2">
          soporte@red101.com
        </Link>
        <br />
        Telefone:{' '}
        <Link href="tel:+5491132945383" className="text-fg underline underline-offset-2">
          +5491132945383
        </Link>
      </Text>
      <Text className="font-14 text-fg m-0">
        Atenciosamente,
        <br />
        Equipe {`{{_accountInfo.TradingName}}`}
      </Text>
    </>
  );
}
