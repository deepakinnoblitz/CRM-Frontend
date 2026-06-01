import { CONFIG } from 'src/config-global';

import { PaymentTermsView } from 'src/sections/master/payment-terms/view/payment-terms-view';

// ----------------------------------------------------------------------

export default function PaymentTermsPage() {
  return (
    <>
      <title>{` Payment Terms - ${CONFIG.appName}`}</title>

      <PaymentTermsView />
    </>
  );
}
