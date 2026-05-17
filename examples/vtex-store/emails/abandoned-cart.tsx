/**
 * Abandoned cart reminder — faithful port of
 * `refs/vtex-email-framework/source/templates/12-abandoned-cart.hbs`.
 *
 * Onda 3 of Bloco 7. Marketing email sent when a customer left items
 * in the cart without checking out. Header + intro + items list +
 * CTA + Regards.
 *
 * Inlines `partials/abandoned-cart-items.hbs` as a local AbandonedCartItems
 * component — single-use partial, stays inline per PORTING.md policy.
 *
 * AbandonedCartItems uses `{{formatCurrency (math sellingPrice '*' 100)}}` —
 * a sub-expression with the math helper. Preserved literally via <Raw>
 * since sugar components don't compose into parens.
 */

import { Body, Container, Heading, Html, Img, Link, Section, Text } from 'react-email';
import { Each } from 'react-email-bridge/hbs';

import { HtmlHead, Logo, Regards } from '../components/index.js';

const sectionStyle = { padding: '24px' };
const sectionWithDividerStyle = { ...sectionStyle, borderTop: '1px solid #ddd' };

/**
 * Inlines `partials/abandoned-cart-items.hbs`. Single-use.
 *
 * Each abandoned item: image + name + qty + price. Price uses a math
 * sub-expression to convert cents → reais.
 */
function AbandonedCartItems() {
  return (
    <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
      <tbody>
        <Each path="items">
          <tr>
            <td style={{ verticalAlign: 'top', padding: '12px 0', borderBottom: '1px solid #ddd' }}>
              <table border={0} cellPadding={0} cellSpacing={0} width="100%">
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: 'top', width: '48px', paddingRight: '16px' }}>
                      <Link href={`{{link}}`} title={`{{productName}}`}>
                        <Img src={`{{image}}`} alt={`{{productName}}`} width="100" />
                      </Link>
                    </td>
                    <td style={{ verticalAlign: 'top' }}>
                      <div style={{ fontSize: '15px', lineHeight: 1.3 }}>{`{{productName}}`}</div>
                      <div style={{ color: '#888' }}>Quantidade: {`{{quantity}}`}</div>
                    </td>
                    <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', lineHeight: 1.3 }}>
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
    <Html>
      <HtmlHead />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', maxWidth: '600px' }}>
          {/* Header: Logo + h1 */}
          <Section style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
            <Logo />
            <Heading as="h1">Você deixou algo no seu carrinho!</Heading>
          </Section>

          {/* Intro */}
          <Section style={sectionStyle}>
            <Text>Olá {`{{additionalFields.firstName}}`},</Text>
            <Text>
              Percebemos que você deixou alguns itens no seu carrinho de compras. Não perca, conclua
              sua compra agora!
            </Text>
          </Section>

          {/* Items */}
          <Section style={sectionWithDividerStyle}>
            <AbandonedCartItems />
          </Section>

          {/* CTA */}
          <Section style={{ padding: '24px', textAlign: 'center' }}>
            <Link
              href={`http://www.redcloud.com.ar/checkout/cart/{{addToCartURL}}`}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#000',
                color: '#fff',
                fontWeight: 700,
                textDecoration: 'none',
                borderRadius: '4px',
              }}
            >
              Concluir sua compra
            </Link>
          </Section>

          {/* Footer */}
          <Section style={sectionWithDividerStyle}>
            <Regards />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
