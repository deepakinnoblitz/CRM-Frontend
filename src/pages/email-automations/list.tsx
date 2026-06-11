import { CONFIG } from 'src/config-global';

import { EmailAutomationsListView } from 'src/sections/email-automations/view';

// ----------------------------------------------------------------------

export default function EmailAutomationsListPage() {
    return (
        <>
            <title>{`Email Automation - ${CONFIG.appName}`}</title>

            <EmailAutomationsListView />
        </>
    );
}
