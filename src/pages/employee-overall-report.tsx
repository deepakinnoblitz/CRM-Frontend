import { CONFIG } from 'src/config-global';

import { EmployeeOverallReportView } from 'src/sections/report/employee/view/employee-overall-report-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Employee Overall Report - ${CONFIG.appName}`}</title>
      <EmployeeOverallReportView />
    </>
  );
}
