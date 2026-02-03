import { CONFIG } from 'src/config-global';

import { AttendanceReportView } from 'src/sections/report/attendance/view/attendance-report-view';

// ----------------------------------------------------------------------

export default function AttendanceReportPage() {
    return (
        <>
            <title>{`Attendance Report - ${CONFIG.appName}`}</title>
            <AttendanceReportView />
        </>
    );
}
