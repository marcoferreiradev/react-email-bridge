import { Img } from 'react-email';

const PLACEHOLDER_LOGO = 'https://placehold.co/180x60/F0F0F0/5B5B5B?text=YOUR+LOGO';

/**
 * Storefront logo — bare Img, no wrapper. EmailLayout positions it
 * (text-center within its header Section).
 *
 * Replace `PLACEHOLDER_LOGO` with your brand asset URL. Alt text uses
 * the `{{_accountInfo.TradingName}}` marker so VTEX fills in the
 * storefront name at send time.
 */
export function Logo() {
  return (
    <Img
      alt={`{{_accountInfo.TradingName}}`}
      src={PLACEHOLDER_LOGO}
      className="h-10 w-auto mx-auto"
    />
  );
}
