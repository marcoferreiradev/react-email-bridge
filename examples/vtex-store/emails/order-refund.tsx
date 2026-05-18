/**
 * VTEX `order-refund` — Halo-Tailwind (Bloco 11).
 * Intro + refunded items table (uses {{#with (lookup ../items @index)}}) + amount.
 */

import { Img, Text } from 'react-email';
import { Each, Else, If, Raw } from 'react-email-bridge/hbs';

import { EmailDivider, EmailLayout, EmailSection } from '../components/index.js';

export default function OrderRefund() {
  return (
    <EmailLayout title={<>Reembolso processado · #{`{{orderId}}`}</>}>
      <EmailDivider />
      <EmailSection>
        <Text className="font-15 text-fg m-0 mb-6">
          Processamos um reembolso para sua compra recente. Detalhes abaixo:
        </Text>

        <div className="font-13 text-fg-2 uppercase tracking-wider m-0 mb-4">
          Itens reembolsados
        </div>
        <table className="w-full border-collapse">
          <tbody>
            <Each path="package.restitutions.Refund.items">
              <Raw>{`{{#with (lookup ../items @index)}}`}</Raw>
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
                    {`{{../quantity}}`} un.{' '}
                    <span className="text-fg font-semibold">
                      <If path="../price">
                        R$ {`{{formatCurrency ../price}}`}
                        <Else />
                        Grátis
                      </If>
                    </span>
                  </div>
                </td>
              </tr>
              <Raw>{`{{/with}}`}</Raw>
            </Each>
          </tbody>
        </table>

        <div className="font-13 text-fg-2 uppercase tracking-wider m-0 mt-8 mb-2">
          Valor do reembolso
        </div>
        <Text className="font-22 font-geist text-fg font-bold m-0">
          R$ {`{{formatCurrency package.restitutions.Refund.value}}`}
        </Text>
      </EmailSection>
    </EmailLayout>
  );
}
