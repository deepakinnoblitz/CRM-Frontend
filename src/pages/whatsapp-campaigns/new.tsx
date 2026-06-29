import { CONFIG } from 'src/config-global';

import { WhatsAppCampaignsCreateView } from 'src/sections/whatsapp-campaigns/view';

// ----------------------------------------------------------------------

export default function WhatsAppCampaignsCreatePage() {
    return (
        <>
            <title>{`New WhatsApp Campaign - ${CONFIG.appName}`}</title>

            <WhatsAppCampaignsCreateView />
        </>
    );
}
