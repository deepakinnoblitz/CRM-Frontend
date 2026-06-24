import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { WhatsAppSettingsView } from 'src/sections/whatsapp-settings/view';

// ----------------------------------------------------------------------

export default function EmailSettingsPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`WhatsApp Settings: ${id} - ${CONFIG.appName}`}</title>

            <WhatsAppSettingsView />
        </>
    );
}
