import { CONFIG } from 'src/config-global';

import { EmailAutomationsCreateView } from 'src/sections/email-automations/view';

// ----------------------------------------------------------------------

export default function EmailAutomationsNewPage() {
    return (
        <>
            <title>{`New Email Automation - ${CONFIG.appName}`}</title>

            <EmailAutomationsCreateView />
        </>
    );
}
