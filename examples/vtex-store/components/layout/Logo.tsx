import { Img, Link, Section } from 'react-email';

/**
 * Mirrors `refs/vtex-email-framework/source/templates/partials/logo.hbs`.
 *
 * Hard-coded brand asset URL and target link are the same as the source
 * (this is example storefront code — real consumers swap in their own
 * brand). Alt text uses the `{{_accountInfo.TradingName}}` marker so VTEX
 * fills in the store name at send time.
 */
export function Logo() {
  return (
    <Section style={{ margin: '32px auto 24px', width: '128px', textAlign: 'center' }}>
      <Link href="http://redcloud.com.ar">
        <Img
          alt={`{{_accountInfo.TradingName}}`}
          src="https://redcloudone.vtexassets.com/assets/vtex.file-manager-graphql/images/5fa40cfb-0742-44e7-a5f9-361eacce8e65___1f019fb496cbfcc135c518f9dfa9894a.png"
          style={{ maxHeight: '80px', border: 0, width: 'auto' }}
        />
      </Link>
    </Section>
  );
}
