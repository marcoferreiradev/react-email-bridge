/**
 * Back-in-stock notification — Halo-Tailwind (Bloco 11).
 * Simplest template: logo + product notice + Regards.
 */

import { Link, Text } from 'react-email';

import { EmailLayout, EmailSection } from '../components/index';

export default function BackInStock() {
  return (
    <EmailLayout title="Produto disponível">
      <EmailSection>
        <Text className="font-15 text-fg m-0 mb-4">
          Conforme a sua solicitação, informamos que o produto abaixo encontra-se disponível para
          compra:
        </Text>
        <Text className="font-22 text-fg m-0 mb-4">
          <Link href={`{{productLink}}`} className="text-fg underline underline-offset-2">
            {`{{productName}}`}
          </Link>
        </Text>
        <Text className="font-14 text-fg-2 m-0 mb-2">Informações sobre o produto:</Text>
        <Text className="font-14 text-fg-2 m-0">{`{{{productDescription}}}`}</Text>
      </EmailSection>
    </EmailLayout>
  );
}
