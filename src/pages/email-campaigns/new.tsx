import { CONFIG } from 'src/config-global';

import { EmailCampaignsCreateView } from 'src/sections/email-campaigns/view';

// ----------------------------------------------------------------------

export default function EmailCampaignsNewPage() {
    return (
        <>
            <title>{`New Email Campaigns - ${CONFIG.appName}`}</title>

            <EmailCampaignsCreateView />
        </>
    );
}
