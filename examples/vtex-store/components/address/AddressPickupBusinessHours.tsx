import { Heading } from 'react-email';
import { Each, If, Raw } from 'react-email-bridge/hbs';

/**
 * Mirrors `partials/address-pickup-business-hours.hbs`. Used by
 * 06-shipped and 07-shipped-cancel-request.
 *
 * Source uses `{{#hasSubStr X Y}}` which has no sugar — wrapped in
 * `<Raw>` open/close. The weekday switch (DayOfWeek 0..6) is a brittle
 * source pattern that we mirror verbatim; cleaner would be a single
 * lookup in JS but that would diverge from the gulp dist output.
 */
export function AddressPickupBusinessHours() {
  return (
    <If eq={['items.0.selectedDeliveryChannel', '"pickup-in-point"']}>
      <Each path="../pickupPoints">
        <Raw>{`{{#hasSubStr ../items.0.selectedSla address.addressId}}`}</Raw>
        <If compare={['businessHours.length', '>', '0']}>
          <Heading as="h3" style={{ margin: 0 }}>
            Horário de funcionamento
          </Heading>
          <table style={{ width: '100%', maxWidth: '440px', marginBottom: '12px' }}>
            <Each path="businessHours">
              <If compare={['DayOfWeek', '!=', '0']}>
                <tr>
                  <td
                    style={{ borderBottom: '1px solid #ddd', paddingTop: '8px', fontSize: '13px' }}
                  >
                    <If compare={['DayOfWeek', '==', '1']}>Segunda-feira</If>
                    <If compare={['DayOfWeek', '==', '2']}>Terça-feira</If>
                    <If compare={['DayOfWeek', '==', '3']}>Quarta-feira</If>
                    <If compare={['DayOfWeek', '==', '4']}>Quinta-feira</If>
                    <If compare={['DayOfWeek', '==', '5']}>Sexta-feira</If>
                    <If compare={['DayOfWeek', '==', '6']}>Sábado</If>
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid #ddd',
                      paddingTop: '8px',
                      fontSize: '13px',
                      textAlign: 'right',
                    }}
                  >
                    {`{{OpeningTime}}`} às {`{{ClosingTime}}`}
                  </td>
                </tr>
              </If>
            </Each>
            <Each path="businessHours">
              <If compare={['DayOfWeek', '==', '0']}>
                <tr>
                  <td
                    style={{ borderBottom: '1px solid #ddd', paddingTop: '8px', fontSize: '13px' }}
                  >
                    Domingo
                  </td>
                  <td
                    style={{
                      borderBottom: '1px solid #ddd',
                      paddingTop: '8px',
                      fontSize: '13px',
                      textAlign: 'right',
                    }}
                  >
                    {`{{OpeningTime}}`} às {`{{ClosingTime}}`}
                  </td>
                </tr>
              </If>
            </Each>
          </table>
          <If compare={['additionalInfo', '!=', "''"]}>
            <Heading as="h3" style={{ margin: '0 0 8px' }}>
              Informações importantes
            </Heading>
            <div>{`{{additionalInfo}}`}</div>
          </If>
        </If>
        <Raw>{`{{/hasSubStr}}`}</Raw>
      </Each>
    </If>
  );
}
