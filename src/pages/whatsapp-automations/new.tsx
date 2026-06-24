import { CONFIG } from 'src/config-global';

import { WhatsAppAutomationsCreateView } from 'src/sections/whatsapp-automations/view';

// ----------------------------------------------------------------------

export default function WhatsAppAutomationsNewPage() {
    return (
        <>
            <title>{`New WhatsApp Automation - ${CONFIG.appName}`}</title>

            <WhatsAppAutomationsCreateView />
        </>
    );
}
