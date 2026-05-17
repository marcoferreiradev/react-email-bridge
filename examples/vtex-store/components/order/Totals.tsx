import { Heading, Section } from 'react-email';
import { Each, If } from 'react-email-bridge/hbs';

/**
 * Mirrors `partials/totals.hbs`. Used by 01-confirmed, 02-cancelled,
 * 09-replaced.
 *
 * Iterates `totals` (a VTEX-shaped list of named amounts) and renders
 * one row per non-zero entry. The id→label mapping is hard-coded for
 * the four canonical ids (Items / Shipping / Discounts / Tax) — matches
 * what the source does. A grand total row is appended when `value` is
 * present (the bare `{{value}}` outside the loop refers to the parent
 * order's total).
 */
export function Totals() {
  return (
    <Section style={{ paddingBottom: '12px', width: '100%' }}>
      <Heading as="h3">Resumo</Heading>
      <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
        <tbody>
          <Each path="totals">
            <If path="value">
              <tr>
                <td style={{ padding: '4px 0', borderBottom: '1px solid #ddd' }}>
                  <If eq={['id', '"Items"']}>Itens</If>
                  <If eq={['id', '"Shipping"']}>Entrega</If>
                  <If eq={['id', '"Discounts"']}>Descontos</If>
                  <If eq={['id', '"Tax"']}>Taxas</If>
                </td>
                <td
                  style={{
                    padding: '4px 0',
                    borderBottom: '1px solid #ddd',
                    textAlign: 'right',
                  }}
                >
                  R$ {`{{formatCurrency value}}`}
                </td>
              </tr>
            </If>
          </Each>
          <If path="value">
            <tr>
              <td style={{ padding: '4px 0', fontWeight: 500 }}>Total</td>
              <td style={{ padding: '4px 0', fontWeight: 500, textAlign: 'right' }}>
                R$ {`{{formatCurrency value}}`}
              </td>
            </tr>
          </If>
        </tbody>
      </table>
    </Section>
  );
}
