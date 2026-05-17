import { Img } from 'react-email';
import { Each, Else, If } from 'react-email-bridge/hbs';

/**
 * Mirrors `partials/items.hbs`. Used by 02-cancelled, 05-invoiced-cancel-
 * request, 06-shipped, 07-shipped-cancel-request, 10-delivered.
 *
 * The deep `../../../../items` parent-path traversal is intentional — it
 * climbs from the inner `#each items` (per-shippingInfo) back up through
 * the package context to the original order items list. Regression test
 * for the parent-path pattern is in tests/render-pipeline.test.tsx.
 */
export function Items() {
  return (
    <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
      <tbody>
        <Each path="items">
          <Each path="../../../../items">
            <If eq={['@index', '../itemIndex']}>
              <tr>
                <td style={{ verticalAlign: 'top', padding: '8px 8px 8px 0', width: '48px' }}>
                  <Img alt="" src={`{{imageUrl}}`} />
                </td>
                <td style={{ verticalAlign: 'top', padding: '8px 0' }}>
                  <div style={{ fontSize: '15px', lineHeight: 1.3 }}>{`{{name}}`}</div>
                  <div style={{ color: '#888' }}>
                    {`{{quantity}}`} un.{' '}
                    <If path="sellingPrice">
                      R$ {`{{formatCurrency sellingPrice}}`}
                      <Else />
                      Grátis
                    </If>
                  </div>
                </td>
              </tr>
              <Each path="bundleItems">
                <If path="name">
                  <tr>
                    <td style={{ verticalAlign: 'top', padding: '8px 8px 8px 0', width: '48px' }}>
                      <Img alt="" src={`{{imageUrl}}`} />
                    </td>
                    <td style={{ verticalAlign: 'top', padding: '8px 0' }}>
                      <div style={{ fontSize: '15px', lineHeight: 1.3 }}>{`{{name}}`}</div>
                      <div style={{ color: '#888' }}>
                        {`{{quantity}}`} un.{' '}
                        <If path="price">
                          R$ {`{{formatCurrency price}}`}
                          <Else />
                          Grátis
                        </If>
                      </div>
                    </td>
                  </tr>
                </If>
              </Each>
            </If>
          </Each>
        </Each>
      </tbody>
    </table>
  );
}
