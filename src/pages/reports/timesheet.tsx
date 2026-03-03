import { CONFIG } from 'src/config-global';

import { TimesheetsReportView } from 'src/sections/report/timesheets/view/timesheets-report-view';

// ----------------------------------------------------------------------

export default function TimesheetReportPage() {
    return (
        <>
            <title>{`Timesheet Report - ${CONFIG.appName}`}</title>
            <TimesheetsReportView />
        </>
    );
}
