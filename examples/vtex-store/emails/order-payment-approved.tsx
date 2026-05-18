/**
 * VTEX `order-payment-approved` — Halo-Tailwind (Bloco 11).
 * Hi + preparing-shipping copy + Payment.
 */

import { Text } from 'react-email';
import { Each, Else, If } from 'react-email-bridge/hbs';

import { EmailDivider, EmailLayout, EmailSection, Hi, Payment } from '../components/index';

export default function OrderPaymentApproved() {
  return (
    <EmailLayout title="Seu pagamento foi aprovado." orderReference>
      <EmailSection>
        <Text className="font-15 text-fg m-0">
          <Hi />{' '}
          <If compare={['shippingData.logisticsInfo.length', '>', '1']}>
            Estamos providenciando a emissão da Nota Fiscal do seu pedido e o envio dos seus
            produtos.
            <Else />
            Estamos providenciando a emissão da Nota Fiscal do seu pedido e o envio do seu produto.
          </If>
        </Text>
      </EmailSection>

      <EmailDivider />
      <EmailSection label="Pagamento">
        <Each path="paymentData.transactions">
          <Payment />
        </Each>
      </EmailSection>
    </EmailLayout>
  );
}
