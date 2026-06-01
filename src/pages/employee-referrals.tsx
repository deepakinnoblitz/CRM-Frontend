import { CONFIG } from 'src/config-global';

import { EmployeeReferralsView } from 'src/sections/employee-referrals/view/employee-referrals-view';

// ----------------------------------------------------------------------

export default function EmployeeReferralsPage() {
  return (
    <>
      <title>{`Employee Referrals - ${CONFIG.appName}`}</title>
      <EmployeeReferralsView />
    </>
  );
}
