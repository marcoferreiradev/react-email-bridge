import { Section } from 'react-email';
import { Each, Else, If, Unless } from 'react-email-bridge/hbs';
import { Items } from './Items.js';
import {
  ShippingEstimateDate,
  ShippingEstimateRange,
  ShippingEstimateScheduled,
} from './ShippingEstimate.js';

/**
 * Mirrors `partials/package.hbs`. Used by 01, 06, 07, 08, 09, 10.
 *
 * Renders the per-package SLA info (delivery channel, ETA) once at the
 * top of each package, then transitively includes the `items.hbs`
 * partial for the items in that package.
 *
 * The triple-branch for ETA format (scheduled vs range vs date) maps
 * directly to the three `shipping-estimate-*.hbs` source partials,
 * kept inline here as ShippingEstimate{Scheduled,Range,Date}.
 */
export function Package() {
  return (
    <>
      <Each path="items">
        <If compare={['@index', '==', '0']}>
          <Each path="../../../../items">
            <If eq={['id', '../itemId']}>
              <Section
                style={{
                  backgroundColor: '#f4f4f4',
                  padding: '8px 16px',
                  margin: '12px 0',
                  fontWeight: 500,
                }}
              >
                <If compare={['../selectedDeliveryChannel', '!=', '"pickup-in-point"']}>
                  <If path="../deliveryWindow">
                    <div style={{ fontSize: '13px', color: '#888' }}>Agendada para</div>
                    <Else />
                    <div style={{ fontSize: '13px', color: '#888' }}>{`{{../selectedSla}}`}</div>
                  </If>
                </If>

                <If path="../deliveryWindow">
                  <ShippingEstimateScheduled />
                  <Else />
                  <Unless path="../shippingEstimateDate">
                    <ShippingEstimateRange />
                    <Else />
                    <ShippingEstimateDate />
                  </Unless>
                </If>
              </Section>
            </If>
          </Each>
        </If>
      </Each>
      <Items />
    </>
  );
}
