import { Each, If } from 'react-email-bridge/hbs';

/**
 * Order totals breakdown + grand total. Used by 01-confirmed, 02-cancelled,
 * 09-replaced.
 *
 * Halo-Tailwind: subtle row dividers + emphasized grand total.
 */
export function Totals() {
  const cellClass = 'font-15 text-fg py-2 border-b border-stroke';
  const cellRightClass = `${cellClass} text-right`;
  return (
    <div>
      <div className="font-13 text-fg-2 uppercase tracking-wider m-0 mb-2">Resumo</div>
      <table className="w-full border-collapse">
        <tbody>
          <Each path="totals">
            <If path="value">
              <tr>
                <td className={cellClass}>
                  <If eq={['id', '"Items"']}>Itens</If>
                  <If eq={['id', '"Shipping"']}>Entrega</If>
                  <If eq={['id', '"Discounts"']}>Descontos</If>
                  <If eq={['id', '"Tax"']}>Taxas</If>
                </td>
                <td className={cellRightClass}>R$ {`{{formatCurrency value}}`}</td>
              </tr>
            </If>
          </Each>
          <If path="value">
            <tr>
              <td className="font-16 text-fg font-bold pt-4">Total</td>
              <td className="font-16 text-fg font-bold pt-4 text-right">
                R$ {`{{formatCurrency value}}`}
              </td>
            </tr>
          </If>
        </tbody>
      </table>
    </div>
  );
}
