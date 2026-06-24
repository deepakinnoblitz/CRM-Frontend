import { CONFIG } from 'src/config-global';

import { WhatsAppAutomationsListView } from 'src/sections/whatsapp-automations/view';

// ----------------------------------------------------------------------

export default function WhatsAppAutomationsListPage() {
    return (
        <>
            <title>{`WhatsApp Automation - ${CONFIG.appName}`}</title>

            <WhatsAppAutomationsListView />
        </>
    );
}
