/**
 * Abandoned cart reminder — Halo-Tailwind (Bloco 11).
 * Intro + items list + primary CTA.
 */

import { Button, Img, Link, Text } from 'react-email';
import { Each } from 'react-email-bridge/hbs';

import { EmailDivider, EmailLayout, EmailSection } from '../components/index';

/**
 * Inlines `partials/abandoned-cart-items.hbs`. Uses math sub-expression
 * `(math sellingPrice '*' 100)` (source pattern; preserves as-is).
 */
function AbandonedCartItems() {
  return (
    <table className="w-full border-collapse">
      <tbody>
        <Each path="items">
          <tr>
            <td className="align-top py-4 border-b border-stroke">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="align-top w-[100px] pr-4">
                      <Link href={`{{link}}`} title={`{{productName}}`}>
                        <Img
                          src={`{{image}}`}
                          alt={`{{productName}}`}
                          className="w-[80px] h-auto rounded-md"
                        />
                      </Link>
                    </td>
                    <td className="align-top">
                      <div className="font-15 text-fg m-0">{`{{productName}}`}</div>
                      <div className="font-13 text-fg-2 mt-1">Quantidade: {`{{quantity}}`}</div>
                    </td>
                    <td className="align-top text-right">
                      <div className="font-15 text-fg font-semibold m-0">
                        R$ {`{{formatCurrency (math sellingPrice '*' 100)}}`}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </Each>
      </tbody>
    </table>
  );
}

export default function AbandonedCart() {
  return (
    <EmailLayout title="Você deixou algo no seu carrinho!">
      <EmailSection>
        <Text className="font-15 text-fg m-0 mb-4">Olá {`{{additionalFields.firstName}}`},</Text>
        <Text className="font-15 text-fg m-0">
          Percebemos que você deixou alguns itens no seu carrinho de compras. Não perca, conclua sua
          compra agora!
        </Text>
      </EmailSection>

      <EmailDivider />
      <EmailSection>
        <AbandonedCartItems />
      </EmailSection>

      <EmailSection tight>
        <div className="text-center">
          <Button
            href={`http://www.redcloud.com.ar/checkout/cart/{{addToCartURL}}`}
            className="inline-block bg-fg text-bg-2 font-15 font-semibold px-6 py-3 rounded-lg no-underline"
          >
            Concluir sua compra
          </Button>
        </div>
      </EmailSection>
    </EmailLayout>
  );
}
