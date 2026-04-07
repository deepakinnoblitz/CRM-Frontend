import { CONFIG } from 'src/config-global';

import { BankAccountView } from 'src/sections/master/bank-account/view/bank-account-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Bank Account - ${CONFIG.appName}`}</title>
      <BankAccountView />
    </>
  );
}
