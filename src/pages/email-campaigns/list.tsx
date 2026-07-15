import { CONFIG } from 'src/config-global';

import { EmailCampaignsListView } from 'src/sections/email-campaigns/view';

// ----------------------------------------------------------------------

export default function EmailCampaignsListPage() {
    return (
        <>
            <title>{`Email Campaigns - ${CONFIG.appName}`}</title>

            <EmailCampaignsListView />
        </>
    );
}
