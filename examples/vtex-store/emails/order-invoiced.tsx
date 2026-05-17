/**
 * VTEX order-invoiced template, ported from
 * `refs/vtex-email-framework/source/templates/04-invoiced.hbs`.
 *
 * Adds patterns not present in order-confirmed:
 *   - Pluralization via {{#compare items.length '>' 1}}…{{else}}…{{/compare}}
 *   - Nested conditionals (#if + #compare on the same path)
 *   - Multi-invoice alert when items.length != logisticsInfo.length
 *   - Fallback when sellingPrice is null ({{#if sellingPrice}}…{{else}})
 *   - Bundle items nested inside item iteration ({{#each bundleItems}})
 *   - Parent-path traversal up 4 levels: `../../../../items`
 *
 * Uses the real VTEX 04-invoiced fixture (1971 lines, top-level shape:
 * items, shippingData, clientProfileData, paymentData, totals, _accountInfo).
 */
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Heading,
  Img,
} from 'react-email';
import { hbs } from 'react-email-bridge';
import { Each, If, Unless, Else, Raw } from 'react-email-bridge/hbs';

export default function OrderInvoiced() {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial' }}>
        <Container
          style={{
            backgroundColor: '#fff',
            maxWidth: '600px',
            padding: '0',
          }}
        >
          {/* Header */}
          <Section
            style={{
              padding: '32px 24px 24px',
              borderBottom: '1px solid #ddd',
              textAlign: 'center',
            }}
          >
            <Heading
              as="h1"
              style={{ color: hbs('storeTheme.primary'), margin: 0 }}
            >
              {`{{_accountInfo.TradingName}}`}
            </Heading>
            <Text style={{ color: '#666', marginTop: '8px' }}>
              Sua nota fiscal está disponível
            </Text>
            <Text style={{ color: '#888', fontSize: '13px' }}>
              Pedido <strong>#{`{{orderId}}`}</strong>
            </Text>

            {/* Multi-invoice alert: split shipment with items.length != logisticsInfo.length */}
            <If compare={['items.length', '!=', 'shippingData.logisticsInfo.length']}>
              <Section
                style={{
                  backgroundColor: '#fff3cd',
                  padding: '12px 16px',
                  marginTop: '16px',
                  borderRadius: '6px',
                  textAlign: 'left',
                }}
              >
                <Text style={{ margin: 0, fontSize: '13px' }}>
                  <strong>Seu pedido foi dividido em mais de uma entrega.</strong>
                </Text>
                <Text style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
                  Você receberá notificações de cada parte.
                </Text>
              </Section>
            </If>
          </Section>

          {/* Greeting — only for non-anonymous purchases */}
          <If path="clientProfileData.firstName">
            <If
              compare={[
                'clientProfileData.firstName',
                '!=',
                '"isAnonymous"',
              ]}
            >
              <Section style={{ padding: '24px' }}>
                <Text>
                  Olá <strong>{`{{clientProfileData.firstName}}`}</strong>, sua
                  nota fiscal foi emitida. Continuaremos atualizando você sobre
                  o status da entrega.
                </Text>
              </Section>
            </If>
          </If>

          {/* Items grouped by address, then by package */}
          <Raw>{`{{#richShippingData shippingData}}`}</Raw>
          <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
          <Section style={{ padding: '0 24px 24px' }}>
            {/* Pluralization: "Produto" vs "Produtos" */}
            <If compare={['items.length', '>', '1']}>
              <Heading as="h3" style={{ marginTop: 0 }}>
                Produtos enviados
              </Heading>
              <Else />
              <Heading as="h3" style={{ marginTop: 0 }}>
                Produto enviado
              </Heading>
            </If>

            <Raw>{`{{#group items by="packageId"}}`}</Raw>
            <Section
              style={{
                padding: '12px',
                border: '1px solid #eee',
                marginBottom: '12px',
                backgroundColor: hbs('storeTheme.packageBg'),
              }}
            >
              {/* Item iteration with parent-path lookup to get full item data */}
              <Each path="items">
                <Raw>{`{{#each ../../../../items}}`}</Raw>
                <Raw>{`{{#eq id ../itemId}}`}</Raw>
                <Row>
                  <Column style={{ width: '70px', verticalAlign: 'top' }}>
                    <Img
                      src={`{{imageUrl}}`}
                      alt={`{{name}}`}
                      width="60"
                      height="60"
                    />
                  </Column>
                  <Column>
                    <Text style={{ margin: 0 }}>
                      <strong>{`{{name}}`}</strong>
                    </Text>
                    <Text
                      style={{
                        margin: '4px 0 0',
                        color: '#666',
                        fontSize: '12px',
                      }}
                    >
                      Qtd: {`{{quantity}}`}
                    </Text>
                    {/* Fallback: price may be null for free items */}
                    <If path="sellingPrice">
                      <Text style={{ margin: 0 }}>
                        R$ {`{{formatCurrency sellingPrice}}`}
                      </Text>
                      <Else />
                      <Text style={{ margin: 0, color: '#22c55e' }}>
                        Grátis
                      </Text>
                    </If>

                    {/* Bundle items nested inside main item */}
                    <Each path="bundleItems">
                      <If path="name">
                        <Row style={{ marginTop: '8px', marginLeft: '16px' }}>
                          <Column style={{ width: '50px', verticalAlign: 'top' }}>
                            <Img
                              src={`{{imageUrl}}`}
                              alt={`{{name}}`}
                              width="40"
                              height="40"
                            />
                          </Column>
                          <Column>
                            <Text style={{ margin: 0, fontSize: '13px' }}>
                              + {`{{name}}`}
                            </Text>
                            <Text
                              style={{
                                margin: 0,
                                color: '#888',
                                fontSize: '11px',
                              }}
                            >
                              Qtd: {`{{quantity}}`}
                              {' • '}
                              <If path="price">
                                R$ {`{{formatCurrency price}}`}
                                <Else />
                                Grátis
                              </If>
                            </Text>
                          </Column>
                        </Row>
                      </If>
                    </Each>
                  </Column>
                </Row>
                <Raw>{`{{/eq}}`}</Raw>
                <Raw>{`{{/each}}`}</Raw>
              </Each>
            </Section>
            <Raw>{`{{/group}}`}</Raw>
          </Section>
          <Raw>{`{{/group}}`}</Raw>
          <Raw>{`{{/richShippingData}}`}</Raw>

          {/* Footer */}
          <Section
            style={{
              padding: '24px',
              borderTop: '1px solid #ddd',
              color: '#888',
              fontSize: '12px',
              textAlign: 'center',
            }}
          >
            <Text>Obrigado por comprar com {`{{_accountInfo.TradingName}}`}.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
