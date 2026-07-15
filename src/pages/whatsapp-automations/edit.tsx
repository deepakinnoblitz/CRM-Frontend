import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { WhatsAppAutomationsEditView } from 'src/sections/whatsapp-automations/view';

// ----------------------------------------------------------------------

export default function WhatsAppAutomationsEditPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Edit WhatsApp Automation: ${id} - ${CONFIG.appName}`}</title>

            <WhatsAppAutomationsEditView />
        </>
    );
}
