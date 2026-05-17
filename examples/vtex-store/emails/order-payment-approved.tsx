/**
 * VTEX `order-payment-approved` template — faithful port of
 * `refs/vtex-email-framework/source/templates/03-payment-approved.hbs`.
 *
 * Onda 3 of Bloco 7. Header + Hi + preparing-shipping copy + Payment +
 * Regards. No addresses, no totals.
 */

import { Body, Container, Heading, Html, Section, Text } from 'react-email';
import { Each, Else, If } from 'react-email-bridge/hbs';

import { Hi, HtmlHead, Logo, OrderReference, Payment, Regards } from '../components/index.js';

const sectionStyle = { padding: '24px' };
const sectionWithDividerStyle = { ...sectionStyle, borderTop: '1px solid #ddd' };

export default function OrderPaymentApproved() {
  return (
    <Html>
      <HtmlHead />
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ backgroundColor: '#fff', maxWidth: '600px' }}>
          {/* Header: Logo + h1 + OrderRef */}
          <Section style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
            <Logo />
            <Heading as="h1">Seu pagamento foi aprovado.</Heading>
            <OrderReference />
          </Section>

          {/* Intro: Hi + preparing-shipping (one or many products) */}
          <Section style={sectionStyle}>
            <Text>
              <Hi />{' '}
              <If compare={['shippingData.logisticsInfo.length', '>', '1']}>
                Estamos providenciando a emissão da Nota Fiscal do seu pedido e o envio dos seus
                produtos.
                <Else />
                Estamos providenciando a emissão da Nota Fiscal do seu pedido e o envio do seu
                produto.
              </If>
            </Text>
          </Section>

          {/* Payment */}
          <Section style={sectionWithDividerStyle}>
            <Heading as="h3" style={{ margin: 0 }}>
              Pagamento
            </Heading>
            <Each path="paymentData.transactions">
              <Payment />
            </Each>
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
