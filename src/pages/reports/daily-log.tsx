import { CONFIG } from 'src/config-global';

import { DailyLogReportView } from 'src/sections/report/daily-log/view/daily-log-report-view';

// ----------------------------------------------------------------------

export default function DailyLogReportPage() {
    return (
        <>
            <title>{`Daily Log Report - ${CONFIG.appName}`}</title>
            <DailyLogReportView />
        </>
    );
}
