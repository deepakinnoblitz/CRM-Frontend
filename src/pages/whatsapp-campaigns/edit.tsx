import { CONFIG } from 'src/config-global';

import { WhatsAppCampaignsEditView } from 'src/sections/whatsapp-campaigns/view';

// ----------------------------------------------------------------------

export default function WhatsAppCampaignsEditPage() {
    return (
        <>
            <title>{`Edit WhatsApp Campaign - ${CONFIG.appName}`}</title>

            <WhatsAppCampaignsEditView />
        </>
    );
}
