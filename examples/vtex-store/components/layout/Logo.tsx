import { Img, Section } from 'react-email';

const PLACEHOLDER_LOGO = 'https://placehold.co/180x60/F0F0F0/5B5B5B?text=YOUR+LOGO';

/**
 * Storefront logo. Uses a placehold.co URL by default — fork the
 * starter and replace with your brand asset.
 *
 * Alt text uses the `{{_accountInfo.TradingName}}` marker so VTEX fills
 * in the store name at send time.
 */
export function Logo() {
  return (
    <Section className="text-center py-6">
      <Img
        alt={`{{_accountInfo.TradingName}}`}
        src={PLACEHOLDER_LOGO}
        className="block mx-auto h-10 w-auto"
      />
    </Section>
  );
}
