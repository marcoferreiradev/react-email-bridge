import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Link,
} from 'react-email';
import { hbs } from 'react-email-bridge';
import { Each, If, Else } from 'react-email-bridge/hbs';

export default function Welcome() {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#fff', fontFamily: 'Arial' }}>
        <Container style={{ padding: '24px', maxWidth: '600px' }}>
          <Heading style={{ color: hbs('theme.primaryColor') }}>
            Welcome, {`{{customer.firstName}}`}!
          </Heading>

          <Text>
            Your order <strong>#{`{{orderId}}`}</strong> is confirmed.
          </Text>

          <Each path="items">
            <Text>
              • {`{{name}}`} × {`{{quantity}}`}
            </Text>
          </Each>

          <If path="trackingUrl">
            <Text>
              <Link href={`{{trackingUrl}}`}>Track your order</Link>
            </Text>
            <Else />
            <Text>Tracking will be available soon.</Text>
          </If>
        </Container>
      </Body>
    </Html>
  );
}
