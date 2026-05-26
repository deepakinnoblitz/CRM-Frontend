import { CONFIG } from 'src/config-global';

import { SalarySlipReportView } from 'src/sections/report/salary-slip/view/salary-slip-report-view';

// ----------------------------------------------------------------------

export default function SalarySlipReportPage() {
    return (
        <>
            <title>{`Salary Slip Report - ${CONFIG.appName}`}</title>
            <SalarySlipReportView />
        </>
    );
}
