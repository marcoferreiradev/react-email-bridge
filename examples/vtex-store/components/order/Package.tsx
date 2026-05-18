import { Section } from 'react-email';
import { Each, Else, If, Unless } from 'react-email-bridge/hbs';
import { Items } from './Items';
import {
  ShippingEstimateDate,
  ShippingEstimateRange,
  ShippingEstimateScheduled,
} from './ShippingEstimate';

/**
 * Per-package SLA strip + items. Used by 01, 06, 07, 08, 09, 10.
 *
 * Halo-Tailwind: minimal strip on top of items table.
 */
export function Package() {
  return (
    <>
      <Each path="items">
        <If compare={['@index', '==', '0']}>
          <Each path="../../../../items">
            <If eq={['id', '../itemId']}>
              <Section className="mt-4 py-2 border-t border-stroke">
                <If compare={['../selectedDeliveryChannel', '!=', '"pickup-in-point"']}>
                  <If path="../deliveryWindow">
                    <div className="font-13 text-fg-2 font-semibold">Agendada para</div>
                    <Else />
                    <div className="font-13 text-fg-2 font-semibold">{`{{../selectedSla}}`}</div>
                  </If>
                </If>
                <div className="font-13 text-fg-2">
                  <If path="../deliveryWindow">
                    <ShippingEstimateScheduled />
                    <Else />
                    <Unless path="../shippingEstimateDate">
                      <ShippingEstimateRange />
                      <Else />
                      <ShippingEstimateDate />
                    </Unless>
                  </If>
                </div>
              </Section>
            </If>
          </Each>
        </If>
      </Each>
      <Items />
    </>
  );
}
