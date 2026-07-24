import { CONFIG } from 'src/config-global';

import { SalesTargetEntryReportView } from 'src/sections/report/view/sales-target-entry-report-view';

// ----------------------------------------------------------------------

export default function SalesTargetEntryReportPage() {
    return (
        <>
            <title>{`Sales Target Entry Report - ${CONFIG.appName}`}</title>
            <SalesTargetEntryReportView />
        </>
    );
}
