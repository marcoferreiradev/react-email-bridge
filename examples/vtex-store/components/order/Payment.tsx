import { Each, Else, If } from 'react-email-bridge/hbs';

/**
 * Payment block. Used by 01-confirmed, 03-payment-approved, 09-replaced.
 * Single payment renders prominently; multiple renders as a clean table.
 *
 * Halo-Tailwind: bigger value emphasis on single, subtle dividers on multi.
 */
export function Payment() {
  return (
    <>
      <If compare={['payments.length', '==', '1']}>
        <Each path="payments">
          <div className="font-15 text-fg m-0 mt-2">
            <strong>{`{{paymentSystemName}}`}</strong>
            <If path="lastDigits"> · final {`{{lastDigits}}`} </If>
          </div>
          <div className="m-0 mt-1">
            <span className="font-18 text-fg font-bold">R$ {`{{formatCurrency value}}`}</span>{' '}
            <span className="font-13 text-fg-2">
              <If eq={['installments', '1']}>
                à vista
                <Else />
                em {`{{installments}}`}x
              </If>
            </span>
          </div>
        </Each>
      </If>

      <If compare={['payments.length', '!=', '1']}>
        <table className="w-full mt-2 border-collapse">
          <tbody>
            <Each path="payments">
              <tr>
                <td className="font-14 text-fg py-2 border-b border-stroke">
                  {`{{paymentSystemName}}`}
                  <If path="lastDigits"> · final {`{{lastDigits}}`} </If>{' '}
                  <span className="font-13 text-fg-2">
                    <If eq={['installments', '1']}>
                      à vista
                      <Else />
                      em {`{{installments}}`}x
                    </If>
                  </span>
                </td>
                <td className="font-14 text-fg font-semibold py-2 border-b border-stroke text-right">
                  R$ {`{{formatCurrency value}}`}
                </td>
              </tr>
            </Each>
          </tbody>
        </table>
      </If>
    </>
  );
}
