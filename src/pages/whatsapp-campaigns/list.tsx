import { CONFIG } from 'src/config-global';

import { WhatsAppCampaignsListView } from 'src/sections/whatsapp-campaigns/view';

// ----------------------------------------------------------------------

export default function WhatsAppCampaignsListPage() {
    return (
        <>
            <title>{`WhatsApp Campaigns - ${CONFIG.appName}`}</title>

            <WhatsAppCampaignsListView />
        </>
    );
}
