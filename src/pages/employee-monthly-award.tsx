import { CONFIG } from 'src/config-global';

import { EmployeeMonthlyAwardView } from 'src/sections/employee-monthly-award/view/employee-monthly-award-view';

// ----------------------------------------------------------------------

export default function EmployeeMonthlyAwardPage() {
  return (
    <>
      <title>{`Employee Monthly Award - ${CONFIG.appName}`}</title>
      <EmployeeMonthlyAwardView />
    </>
  );
}
