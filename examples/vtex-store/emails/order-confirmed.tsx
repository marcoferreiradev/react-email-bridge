/**
 * VTEX order-confirmed template, ported from
 * `refs/vtex-email-framework/source/templates/01-confirmed.hbs`.
 *
 * Exercises the densest patterns VTEX templates use in production:
 *   - {{#each orders}} with nested per-order data
 *   - {{#richShippingData shippingData}}  (custom block helper)
 *   - {{#group logisticsInfo by="addessId"}}  (handlebars-helpers + hash params)
 *   - {{#group items by="packageId"}}  (nested group)
 *   - {{#compare items.length '>' 1}}  (operator-string compare)
 *   - {{#math index '+' 1}}{{/math}}  (math as block expression)
 *   - {{formatCurrency}}, {{formatDate}}, {{formatDateTime}}
 *   - Parent paths via `<Raw>` (../ traversal)
 *
 * The exported .hbs pastes directly into VTEX Message Center.
 */
import { Html, Head, Body, Container, Section, Row, Column, Text, Heading, Img } from 'react-email';
import { hbs } from 'react-email-bridge';
import { Each, If, Unless, Else, Raw } from 'react-email-bridge/hbs';

export default function OrderConfirmed() {
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
          {/* Header with store logo + greeting */}
          <Section style={{ padding: '24px', borderBottom: '1px solid #ddd' }}>
            <Heading as="h1" style={{ color: hbs('storeTheme.primary'), margin: 0 }}>
              {`{{_accountInfo.TradingName}}`}
            </Heading>
            <Text style={{ color: '#666', marginTop: '8px' }}>
              Olá {`{{customer.firstName}}`}, seu pedido foi confirmado!
            </Text>
          </Section>

          {/* Payment status — uses #compare with operator */}
          <If compare={['split', '!=', 'true']}>
            <Section style={{ padding: '24px', borderBottom: '1px solid #ddd' }}>
              <Heading as="h3" style={{ marginTop: 0 }}>
                Pagamento
              </Heading>
              <Each path="orders.0.paymentData.transactions">
                <Each path="payments">
                  <Text style={{ margin: '4px 0' }}>
                    {`{{paymentSystemName}}`} — R$ {`{{formatCurrency value}}`}
                  </Text>
                </Each>
              </Each>
            </Section>
          </If>

          {/* Per-order detail block — uses nested richShippingData + group + group */}
          <Each path="orders">
            <Section style={{ padding: '24px', borderBottom: '1px solid #ddd' }}>
              <Heading as="h2" style={{ marginTop: 0 }}>
                Pedido <span>#{`{{orderId}}`}</span>
              </Heading>

              <Text style={{ color: '#888', fontSize: '13px' }}>
                Vendido por <strong>{`{{sellers.0.name}}`}</strong>
              </Text>

              <Text style={{ color: '#888', fontSize: '13px' }}>
                Realizado em {`{{formatDateTime creationDate}}`}
              </Text>

              {/* Payment when split == true (per-order, not top-level) */}
              <If compare={['split', '==', 'true']}>
                <Section style={{ marginTop: '16px' }}>
                  <Heading as="h4">Pagamento</Heading>
                  <Each path="paymentData.transactions">
                    <Each path="payments">
                      <Text style={{ margin: '4px 0' }}>
                        {`{{paymentSystemName}}`} — R$ {`{{formatCurrency value}}`}
                      </Text>
                    </Each>
                  </Each>
                </Section>
              </If>

              {/* Totals */}
              <Section style={{ marginTop: '16px' }}>
                <Each path="totals">
                  <Row>
                    <Column>
                      <Text style={{ margin: '4px 0' }}>{`{{id}}`}</Text>
                    </Column>
                    <Column align="right">
                      <Text style={{ margin: '4px 0' }}>R$ {`{{formatCurrency value}}`}</Text>
                    </Column>
                  </Row>
                </Each>
              </Section>

              {/* Items grouped by address, then by package — uses custom helpers */}
              <Raw>{`{{#richShippingData shippingData}}`}</Raw>
              <Raw>{`{{#group logisticsInfo by="addessId"}}`}</Raw>
              <Section style={{ marginTop: '24px' }}>
                <Heading as="h3" style={{ marginTop: 0 }}>
                  Entrega em endereço {`{{value}}`}
                </Heading>

                <Raw>{`{{#group items by="packageId"}}`}</Raw>
                <Section
                  style={{
                    padding: '12px',
                    border: '1px solid #eee',
                    marginBottom: '12px',
                    backgroundColor: hbs('storeTheme.packageBg'),
                  }}
                >
                  {/* Show "Pacote 1, 2..." only if more than one package */}
                  <If compare={['items.length', '>', '1']}>
                    <Heading as="h4">
                      Pacote <Raw>{`{{#math index '+' 1}}{{/math}}`}</Raw>
                    </Heading>
                  </If>

                  <Each path="items">
                    <Row>
                      <Column style={{ width: '70px', verticalAlign: 'top' }}>
                        <Img src={`{{imageUrl}}`} alt={`{{name}}`} width="60" height="60" />
                      </Column>
                      <Column>
                        <Text style={{ margin: 0 }}>
                          <strong>{`{{name}}`}</strong>
                        </Text>
                        <Text style={{ margin: '4px 0', color: '#666', fontSize: '12px' }}>
                          Qtd: {`{{quantity}}`}
                        </Text>
                        <Text style={{ margin: 0 }}>R$ {`{{formatCurrency sellingPrice}}`}</Text>
                      </Column>
                    </Row>
                  </Each>
                </Section>
                <Raw>{`{{/group}}`}</Raw>
              </Section>
              <Raw>{`{{/group}}`}</Raw>
              <Raw>{`{{/richShippingData}}`}</Raw>
            </Section>
          </Each>

          {/* Striped item recap using sub-expression (math @index % 2) */}
          <Section style={{ padding: '24px' }}>
            <Heading as="h3" style={{ marginTop: 0 }}>
              Resumo
            </Heading>
            <Each path="orders.0.items">
              <Raw>{`{{#eq (math @index "%" 2) 0}}`}</Raw>
              <Row style={{ backgroundColor: hbs('storeTheme.stripeColor') }}>
                <Column>
                  <Text style={{ margin: 0 }}>
                    {`{{@index}}`} — {`{{name}}`}
                  </Text>
                </Column>
              </Row>
              <Raw>{`{{else}}`}</Raw>
              <Row>
                <Column>
                  <Text style={{ margin: 0 }}>
                    {`{{@index}}`} — {`{{name}}`}
                  </Text>
                </Column>
              </Row>
              <Raw>{`{{/eq}}`}</Raw>
            </Each>
          </Section>

          {/* Cancellation handling via Unless */}
          <Unless path="orders.0.cancelled">
            <Section
              style={{
                padding: '24px',
                borderTop: '1px solid #ddd',
                color: '#888',
                fontSize: '12px',
              }}
            >
              <Text>
                Acompanhe seu pedido em {`{{accountInfo.MainAccountName}}`}
                .myvtex.com
              </Text>
            </Section>
          </Unless>
        </Container>
      </Body>
    </Html>
  );
}
