import { CONFIG } from 'src/config-global';

import { EmailAutomationCreateView } from 'src/sections/email-automations/view';

// ----------------------------------------------------------------------

export default function EmailAutomationNewPage() {
    return (
        <>
            <title>{`New Email Automation - ${CONFIG.appName}`}</title>

            <EmailAutomationCreateView />
        </>
    );
}
