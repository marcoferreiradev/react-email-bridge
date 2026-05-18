import { Each, If, Raw } from 'react-email-bridge/hbs';

/**
 * Pickup business hours table. Halo-Tailwind. Used by 06-shipped,
 * 07-shipped-cancel-request.
 *
 * Source uses {{#hasSubStr X Y}} which has no sugar — wrapped in <Raw>
 * open/close. The weekday DayOfWeek 0..6 switch mirrors source verbatim.
 */
export function AddressPickupBusinessHours() {
  const labelClass = 'font-13 text-fg-2 uppercase tracking-wider m-0 mt-4 mb-2';
  const cellClass = 'font-13 text-fg py-2 border-b border-stroke';
  const cellRightClass = 'font-13 text-fg-2 py-2 border-b border-stroke text-right';

  return (
    <If eq={['items.0.selectedDeliveryChannel', '"pickup-in-point"']}>
      <Each path="../pickupPoints">
        <Raw>{`{{#hasSubStr ../items.0.selectedSla address.addressId}}`}</Raw>
        <If compare={['businessHours.length', '>', '0']}>
          <div className={labelClass}>Horário de funcionamento</div>
          <table className="w-full max-w-[440px] mb-3 border-collapse">
            <tbody>
              <Each path="businessHours">
                <If compare={['DayOfWeek', '!=', '0']}>
                  <tr>
                    <td className={cellClass}>
                      <If compare={['DayOfWeek', '==', '1']}>Segunda-feira</If>
                      <If compare={['DayOfWeek', '==', '2']}>Terça-feira</If>
                      <If compare={['DayOfWeek', '==', '3']}>Quarta-feira</If>
                      <If compare={['DayOfWeek', '==', '4']}>Quinta-feira</If>
                      <If compare={['DayOfWeek', '==', '5']}>Sexta-feira</If>
                      <If compare={['DayOfWeek', '==', '6']}>Sábado</If>
                    </td>
                    <td className={cellRightClass}>
                      {`{{OpeningTime}}`} às {`{{ClosingTime}}`}
                    </td>
                  </tr>
                </If>
              </Each>
              <Each path="businessHours">
                <If compare={['DayOfWeek', '==', '0']}>
                  <tr>
                    <td className={cellClass}>Domingo</td>
                    <td className={cellRightClass}>
                      {`{{OpeningTime}}`} às {`{{ClosingTime}}`}
                    </td>
                  </tr>
                </If>
              </Each>
            </tbody>
          </table>
          <If compare={['additionalInfo', '!=', "''"]}>
            <div className={labelClass}>Informações importantes</div>
            <div className="font-13 text-fg-2">{`{{additionalInfo}}`}</div>
          </If>
        </If>
        <Raw>{`{{/hasSubStr}}`}</Raw>
      </Each>
    </If>
  );
}
