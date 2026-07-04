import { CONFIG } from 'src/config-global';

import { LeaveAllocationReportView } from 'src/sections/report/leave-allocation/view/leave-allocation-report-view';

// ----------------------------------------------------------------------

export default function LeaveAllocationReportPage() {
    return (
        <>
            <title>{`Leave Allocation Report - ${CONFIG.appName}`}</title>
            <LeaveAllocationReportView />
        </>
    );
}
