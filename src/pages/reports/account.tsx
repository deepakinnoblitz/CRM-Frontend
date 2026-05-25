import { CONFIG } from 'src/config-global';

import { AccountReportView } from 'src/sections/report/account/view/account-report-view';

// ----------------------------------------------------------------------

export default function AccountReportPage() {
    return (
        <>
            <title>{`Company Report - ${CONFIG.appName}`}</title>
            <AccountReportView />
        </>
    );
}
