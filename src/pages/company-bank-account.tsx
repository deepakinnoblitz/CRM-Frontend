import { CONFIG } from 'src/config-global';

import { CompanyBankAccountView } from 'src/sections/master/company-bank-account';

// ----------------------------------------------------------------------

export default function CompanyBankAccountPage() {
  return (
    <>
      <title>{`Company Bank Account - ${CONFIG.appName}`}</title>

      <CompanyBankAccountView />
    </>
  );
}
