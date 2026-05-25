import { CONFIG } from 'src/config-global';

import { PaymentTypesView } from 'src/sections/master/payment-type/view/payment-type-view';

// ----------------------------------------------------------------------

export default function PaymentTypesPage() {
  return (
    <>
       <title>{` Payment Type - ${CONFIG.appName}`}</title>


      <PaymentTypesView />
    </>
  );
}
