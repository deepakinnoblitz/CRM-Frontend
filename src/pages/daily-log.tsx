import { CONFIG } from 'src/config-global';

import { EmployeeDailyLogView } from 'src/sections/overview/view/employee-daily-log-view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title> {`Employee Daily Log - ${CONFIG.appName}`}</title>
            <EmployeeDailyLogView />
        </>
    );
}
