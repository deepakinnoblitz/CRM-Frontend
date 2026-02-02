import { CONFIG } from 'src/config-global';

import { WFHAttendanceView } from 'src/sections/wfh-attendance/view/wfh-attendance-view';

export default function Page() {
    return (
        <>
            <title>{`WFH Attendance - ${CONFIG.appName}`}</title>
            <WFHAttendanceView />
        </>
    );
}
