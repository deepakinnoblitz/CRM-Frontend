import { CONFIG } from 'src/config-global';

import { WhatsAppCampaignsDetailsView } from 'src/sections/whatsapp-campaigns/view';

// ----------------------------------------------------------------------

export default function WhatsAppCampaignsDetailsPage() {
    return (
        <>
            <title>{`WhatsApp Campaign Details - ${CONFIG.appName}`}</title>

            <WhatsAppCampaignsDetailsView />
        </>
    );
}
