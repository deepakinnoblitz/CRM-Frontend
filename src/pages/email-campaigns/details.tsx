import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { EmailCampaignsDetailsView } from 'src/sections/email-campaigns/view';

// ----------------------------------------------------------------------

export default function EmailCampaignsDetailsPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Email Campaigns: ${id} - ${CONFIG.appName}`}</title>

            <EmailCampaignsDetailsView />
        </>
    );
}
