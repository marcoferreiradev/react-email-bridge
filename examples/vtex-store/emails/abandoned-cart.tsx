/**
 * Abandoned cart reminder — Halo-Tailwind (Bloco 11).
 * Header + intro + items list + primary CTA + Regards.
 */

import {
  Body,
  Button,
  Container,
  Heading,
  Html,
  Img,
  Link,
  Section,
  Tailwind,
  Text,
} from 'react-email';
import { Each } from 'react-email-bridge/hbs';

import { HtmlHead, Logo, Regards } from '../components/index.js';
import { vtexStoreTailwindConfig } from '../tailwind.config.js';

/**
 * Inlines `partials/abandoned-cart-items.hbs`. Single-use. Uses math
 * sub-expression `(math sellingPrice '*' 100)` to convert cents → reais.
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
    <Tailwind config={vtexStoreTailwindConfig}>
      <Html>
        <HtmlHead />
        <Body className="bg-bg m-0 py-8 font-sans">
          <Container className="bg-bg-2 mx-auto max-w-[600px] rounded-lg overflow-hidden">
            <Section className="px-6 pt-2 text-center">
              <Logo />
              <Heading className="font-32 font-geist text-fg m-0 mb-2">
                Você deixou algo no seu carrinho!
              </Heading>
            </Section>

            <Section className="px-6 py-6">
              <Text className="font-15 text-fg m-0 mb-3">
                Olá {`{{additionalFields.firstName}}`},
              </Text>
              <Text className="font-15 text-fg m-0">
                Percebemos que você deixou alguns itens no seu carrinho de compras. Não perca,
                conclua sua compra agora!
              </Text>
            </Section>

            <hr className="border-stroke m-0" />

            <Section className="px-6 py-6">
              <AbandonedCartItems />
            </Section>

            <Section className="px-6 py-4 text-center">
              <Button
                href={`http://www.redcloud.com.ar/checkout/cart/{{addToCartURL}}`}
                className="inline-block bg-fg text-bg-2 font-15 font-semibold px-6 py-3 rounded-lg no-underline"
              >
                Concluir sua compra
              </Button>
            </Section>

            <hr className="border-stroke m-0" />

            <Section className="px-6 py-6">
              <Regards />
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
