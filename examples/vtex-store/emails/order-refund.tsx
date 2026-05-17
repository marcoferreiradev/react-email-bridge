/**
 * VTEX `order-refund` template — faithful port of
 * `refs/vtex-email-framework/source/templates/13-refund.hbs`.
 *
 * Onda 3 of Bloco 7. Sent when a refund is processed. Header + intro +
 * refunded items table + refund amount + Regards.
 *
 * Source uses `{{#each ... }}` over `package.restitutions.Refund.items`
 * with an inner `{{#with (lookup ../items @index)}}` — sub-expression
 * with the `lookup` helper to correlate refund-item-index with the
 * original order item. Both `#each` and `#with` are emitted via sugar
 * components except for the `lookup` sub-expression which is preserved
 * via `<Raw>` around the `#with` open/close.
 */

import { Body, Container, Heading, Html, Img, Section, Text } from 'react-email';
import { Each, Else, If, Raw } from 'react-email-bridge/hbs';

import { HtmlHead, Logo, Regards } from '../components/index.js';

const sectionStyle = { padding: '24px' };
const sectionWithDividerStyle = { ...sectionStyle, borderTop: '1px solid #ddd' };

export default function OrderRefund() {
  return (
    <Html>
      <HtmlHead />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', maxWidth: '600px' }}>
          {/* Header: Logo + h1 with orderId */}
          <Section style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
            <Logo />
            <Heading as="h1">Seu Reembolso Foi Processado {`{{orderId}}`}</Heading>
          </Section>

          {/* Body: intro + refunded items + refund amount */}
          <Section style={sectionWithDividerStyle}>
            <Text>Processamos um reembolso para sua compra recente. Detalhes abaixo:</Text>

            <Heading as="h3">Itens Reembolsados</Heading>
            <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
              <tbody>
                <Each path="package.restitutions.Refund.items">
                  <Raw>{`{{#with (lookup ../items @index)}}`}</Raw>
                  <tr>
                    <td style={{ verticalAlign: 'top', padding: '8px 8px 8px 0', width: '48px' }}>
                      <Img alt="" src={`{{imageUrl}}`} />
                    </td>
                    <td style={{ verticalAlign: 'top', padding: '8px 0' }}>
                      <div style={{ fontSize: '15px', lineHeight: 1.3 }}>{`{{name}}`}</div>
                      <div style={{ color: '#888' }}>
                        {`{{../quantity}}`} un.{' '}
                        <If path="../price">
                          R$ {`{{formatCurrency ../price}}`}
                          <Else />
                          Grátis
                        </If>
                      </div>
                    </td>
                  </tr>
                  <Raw>{`{{/with}}`}</Raw>
                </Each>
              </tbody>
            </table>

            <Heading as="h3">Valor do Reembolso</Heading>
            <Text>R$ {`{{formatCurrency package.restitutions.Refund.value}}`}</Text>
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
