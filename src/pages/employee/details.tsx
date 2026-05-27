import { CONFIG } from 'src/config-global';

import { EmployeeDetailsView } from 'src/sections/employee/view/employee-details-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title> {`Employee Details - ${CONFIG.appName}`}</title>

      <EmployeeDetailsView />
    </>
  );
}


