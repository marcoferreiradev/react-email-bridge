import { Else, If } from 'react-email-bridge/hbs';

/**
 * Internal building blocks — mirror the four `shipping-estimate-*.hbs`
 * partials from the source. Used transitively by `Package`. Not exported
 * from the order barrel.
 *
 * Files mirrored:
 * - `shipping-estimate-scheduled.hbs`
 * - `shipping-estimate-range.hbs`
 * - `shipping-estimate-range-time.hbs`
 * - `shipping-estimate-date.hbs`
 *
 * All four play together inside `Package`'s nested branch — they show
 * the shipping ETA per logistics info entry in one of four formats.
 */

export function ShippingEstimateScheduled() {
  return (
    <>
      {`{{formatDate ../deliveryWindow.startDateUtc}}`} entre{' '}
      {`{{formatTime ../deliveryWindow.startDateUtc}}`} e{' '}
      {`{{formatTime ../deliveryWindow.endDateUtc}}`}
    </>
  );
}

export function ShippingEstimateRangeTime() {
  return (
    <If compare={['shippingEstimateDays', '>', '"1"']}>
      <If eq={['shippingEstimateDaysType', '"bd"']}>
        {`{{shippingEstimateDays}}`} dias úteis
        <Else />
        <If eq={['shippingEstimateDaysType', '"d"']}>
          {`{{shippingEstimateDays}}`} dias
          <Else />
          <If eq={['shippingEstimateDaysType', '"h"']}>
            {`{{shippingEstimateDays}}`} horas
            <Else />
            {`{{shippingEstimateDays}}`} minutos
          </If>
        </If>
      </If>
      <Else />
      <If eq={['shippingEstimateDaysType', '"bd"']}>
        {`{{shippingEstimateDays}}`} dia útil
        <Else />
        <If eq={['shippingEstimateDaysType', '"d"']}>
          {`{{shippingEstimateDays}}`} dia
          <Else />
          <If eq={['shippingEstimateDaysType', '"h"']}>
            {`{{shippingEstimateDays}}`} hora
            <Else />
            {`{{shippingEstimateDays}}`} minuto
          </If>
        </If>
      </If>
    </If>
  );
}

export function ShippingEstimateRange() {
  return (
    <If eq={['../shippingEstimateDays', '"0"']}>
      <If eq={['../selectedDeliveryChannel', '"pickup-in-point"']}>
        a partir de hoje
        <Else />
        hoje
      </If>
      <Else />
      <If eq={['../selectedDeliveryChannel', '"pickup-in-point"']}>
        A partir de
        <Else />
        Em até
      </If>{' '}
      <ShippingEstimateRangeTime />
    </If>
  );
}

export function ShippingEstimateDate() {
  return (
    <>
      <If eq={['../deliveryChannel', '"pickup-in-point"']}>
        A partir de
        <Else />
        Até
      </If>{' '}
      {`{{formatDate ../shippingEstimateDate}}`}
    </>
  );
}
