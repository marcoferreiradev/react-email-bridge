import { Img } from 'react-email';
import { Each, Else, If } from 'react-email-bridge/hbs';

/**
 * Items table. Used by 5 templates. Deep `../../../../items` parent-path
 * traversal preserved (regression test in tests/render-pipeline.test.tsx).
 *
 * Halo-Tailwind: rounded thumbnails + body/caption type.
 */
export function Items() {
  return (
    <table className="w-full border-collapse">
      <tbody>
        <Each path="items">
          <Each path="../../../../items">
            <If eq={['@index', '../itemIndex']}>
              <tr>
                <td className="align-top py-3 pr-4 w-[72px]">
                  <Img
                    alt=""
                    src={`{{imageUrl}}`}
                    className="w-[56px] h-[56px] rounded-md object-cover"
                  />
                </td>
                <td className="align-top py-3">
                  <div className="font-15 text-fg m-0">{`{{name}}`}</div>
                  <div className="font-13 text-fg-2 mt-1">
                    {`{{quantity}}`} un.{' '}
                    <span className="text-fg font-semibold">
                      <If path="sellingPrice">
                        R$ {`{{formatCurrency sellingPrice}}`}
                        <Else />
                        Grátis
                      </If>
                    </span>
                  </div>
                </td>
              </tr>
              <Each path="bundleItems">
                <If path="name">
                  <tr>
                    <td className="align-top py-3 pr-4 w-[72px]">
                      <Img
                        alt=""
                        src={`{{imageUrl}}`}
                        className="w-[56px] h-[56px] rounded-md object-cover"
                      />
                    </td>
                    <td className="align-top py-3">
                      <div className="font-15 text-fg m-0">{`{{name}}`}</div>
                      <div className="font-13 text-fg-2 mt-1">
                        {`{{quantity}}`} un.{' '}
                        <span className="text-fg font-semibold">
                          <If path="price">
                            R$ {`{{formatCurrency price}}`}
                            <Else />
                            Grátis
                          </If>
                        </span>
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
