import { Body, Container, Heading, Html, Section, Tailwind } from 'react-email';
import type { ReactNode } from 'react';

import { vtexStoreTailwindConfig } from '../../tailwind.config';
import { OrderReference } from '../messages/OrderReference';
import { Regards } from '../messages/Regards';
import { HtmlHead } from './HtmlHead';
import { Logo } from './Logo';

interface EmailLayoutProps {
  /**
   * Big centered h1 at the top of every email. Accepts a string for
   * static titles or a ReactNode for templates with branched headlines
   * (`<If compare={...}>title A<Else />title B</If>`).
   * Optional — back-in-stock and similar have no h1.
   */
  title?: ReactNode;
  /** Show `<OrderReference />` ("Pedido #X") as a subtitle below the h1. */
  orderReference?: boolean;
  /** Optional second-line element below the order ref (status pill, courier card, etc.). */
  headerExtra?: ReactNode;
  /** The body sections — wrap each in `<EmailSection>` / `<EmailDivider>`. */
  children: ReactNode;
}

/**
 * Standardized email chrome — wraps every template.
 *
 * Guarantees consistent across the 13 templates:
 *   - Tailwind wrapper + Halo config
 *   - Container width (600px), background, rounded corners, slight elevation
 *   - Centered header: Logo + h1 (font-32 Geist) + optional OrderRef + optional pill/extra
 *   - Generous outer padding (px-10 desktop)
 *   - Bottom divider + Regards footer
 *
 * Templates only own the body sections in between — use `<EmailSection>`
 * with optional `label` and `<EmailDivider>` between sections.
 */
export function EmailLayout({ title, orderReference, headerExtra, children }: EmailLayoutProps) {
  return (
    <Tailwind config={vtexStoreTailwindConfig}>
      <Html>
        <HtmlHead />
        <Body className="bg-bg m-0 py-10 font-sans">
          <Container className="bg-bg-2 mx-auto max-w-[600px] rounded-xl overflow-hidden">
            {/* Header */}
            <Section className="px-10 pt-10 pb-6 text-center">
              <Logo />
              {title && <Heading className="font-32 font-geist text-fg m-0 mt-6">{title}</Heading>}
              {orderReference && (
                <div className="mt-2">
                  <OrderReference />
                </div>
              )}
              {headerExtra && <div className="mt-6">{headerExtra}</div>}
            </Section>

            {children}

            {/* Footer */}
            <hr className="border-stroke m-0" />
            <Section className="px-10 py-8">
              <Regards />
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

interface EmailSectionProps {
  /** Optional uppercase label rendered above the content (e.g. "ENDEREÇO", "PAGAMENTO"). */
  label?: string;
  /** Tighter padding for sections that are mostly compact (e.g. estimate note). */
  tight?: boolean;
  children: ReactNode;
}

/** Standardized body section — uniform padding + optional small-caps label. */
export function EmailSection({ label, tight, children }: EmailSectionProps) {
  return (
    <Section className={tight ? 'px-10 py-6' : 'px-10 py-8'}>
      {label && <div className="font-13 text-fg-2 uppercase tracking-wider m-0 mb-4">{label}</div>}
      {children}
    </Section>
  );
}

/** Standardized horizontal divider between sections. */
export function EmailDivider() {
  return <hr className="border-stroke m-0" />;
}
