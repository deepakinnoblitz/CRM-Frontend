import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { WhatsAppAutomationsDetailsView } from 'src/sections/whatsapp-automations/view';

// ----------------------------------------------------------------------

export default function WhatsAppAutomationsDetailsPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`WhatsApp Automation: ${id} - ${CONFIG.appName}`}</title>

            <WhatsAppAutomationsDetailsView />
        </>
    );
}
