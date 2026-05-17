import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Img,
  Link,
  Heading,
} from '@react-email/components';
import { hbs } from 'react-email-bridge';
import { Each, If, Unless, Else, Raw } from 'react-email-bridge/hbs';

export default function OrderSummary() {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial' }}>
        <Container
          style={{
            backgroundColor: '#fff',
            padding: '24px',
            maxWidth: '600px',
          }}
        >
          <Img
            src={`{{logoUrl}}`}
            alt={`{{accountName}}`}
            width="180"
            height="40"
          />

          <Heading
            as="h1"
            style={{ color: hbs('theme.primaryColor'), marginTop: '24px' }}
          >
            Olá {`{{customer.firstName}}`}!
          </Heading>

          <Text>
            Seu pedido <strong>#{`{{orderId}}`}</strong> foi confirmado em{' '}
            {`{{formatDate orderDate}}`}.
          </Text>

          <Section style={{ marginTop: '24px' }}>
            <Heading as="h2" style={{ fontSize: '18px' }}>
              Itens
            </Heading>
            <Each path="items">
              <Row>
                <Column>
                  <Text>
                    <strong>{`{{productName}}`}</strong> × {`{{quantity}}`}
                  </Text>
                </Column>
                <Column align="right">
                  <Text>R$ {`{{formatCurrency sellingPrice}}`}</Text>
                </Column>
              </Row>
            </Each>
          </Section>

          <Section
            style={{
              borderTop: '1px solid #ddd',
              marginTop: '16px',
              paddingTop: '16px',
            }}
          >
            <Row>
              <Column>
                <Text>
                  <strong>Total</strong>
                </Text>
              </Column>
              <Column align="right">
                <Text>
                  <strong>R$ {`{{formatCurrency total}}`}</strong>
                </Text>
              </Column>
            </Row>
          </Section>

          <If path="invoiceUrl">
            <Section style={{ marginTop: '24px' }}>
              <Text>
                <Link href={`{{invoiceUrl}}`}>Ver nota fiscal</Link>
              </Text>
            </Section>
            <Else />
            <Section style={{ marginTop: '24px' }}>
              <Text style={{ color: '#666' }}>
                Sua nota fiscal será enviada em breve.
              </Text>
            </Section>
          </If>

          <Unless path="cancelled">
            <If compare={['items.length', '>', '1']}>
              <Text style={{ color: '#666', fontSize: '12px' }}>
                Você comprou múltiplos itens.
              </Text>
            </If>
          </Unless>

          {/* Escape hatch — sub-expression via <Raw> */}
          <Section>
            <Each path="items">
              <Raw>{`{{#eq (math @index "%" 2) 0}}`}</Raw>
              <Row style={{ backgroundColor: hbs('theme.stripeColor') }}>
                <Column>
                  <Text>par #{`{{@index}}`}: {`{{productName}}`}</Text>
                </Column>
              </Row>
              <Raw>{`{{else}}`}</Raw>
              <Row>
                <Column>
                  <Text>impar #{`{{@index}}`}: {`{{productName}}`}</Text>
                </Column>
              </Row>
              <Raw>{`{{/eq}}`}</Raw>
            </Each>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
