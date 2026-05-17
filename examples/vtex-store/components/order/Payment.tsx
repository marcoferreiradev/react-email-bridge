import { Each, Else, If } from 'react-email-bridge/hbs';

/**
 * Mirrors `partials/payment.hbs`. Used by 01-confirmed, 03-payment-
 * approved, 09-replaced.
 *
 * Two branches: single-payment renders a friendly block, N-payments
 * renders a table. Both display payment-system name, last digits if
 * available, installments, and the value in R$.
 */
export function Payment() {
  return (
    <>
      <If compare={['payments.length', '==', '1']}>
        <Each path="payments">
          <div style={{ fontSize: '16px', lineHeight: 1.4 }}>
            {`{{paymentSystemName}}`}
            <If path="lastDigits"> final {`{{lastDigits}}`} </If>
            <br />
            R$ {`{{formatCurrency value}}`}{' '}
            <If eq={['installments', '1']}>
              à vista
              <Else />
              em {`{{installments}}`}x
            </If>
          </div>
        </Each>
      </If>

      <If compare={['payments.length', '!=', '1']}>
        <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
          <tbody>
            <Each path="payments">
              <tr>
                <td style={{ fontSize: '14px', padding: '4px 0', borderBottom: '1px solid #ddd' }}>
                  {`{{paymentSystemName}}`}
                  <If path="lastDigits"> final {`{{lastDigits}}`} </If>{' '}
                  <If eq={['installments', '1']}>
                    à vista
                    <Else />
                    em {`{{installments}}`}x
                  </If>
                </td>
                <td
                  style={{
                    fontSize: '14px',
                    padding: '4px 0',
                    borderBottom: '1px solid #ddd',
                    textAlign: 'right',
                  }}
                >
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
