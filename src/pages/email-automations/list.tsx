import { CONFIG } from 'src/config-global';

import { EmailAutomationListView } from 'src/sections/email-automations/view';

// ----------------------------------------------------------------------

export default function EmailAutomationListPage() {
    return (
        <>
            <title>{`Email Automation - ${CONFIG.appName}`}</title>

            <EmailAutomationListView />
        </>
    );
}
