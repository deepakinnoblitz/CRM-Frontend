import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { EmailCampaignsEditView } from 'src/sections/email-campaigns/view';

// ----------------------------------------------------------------------

export default function EmailCampaignsEditPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Edit Email Campaigns: ${id} - ${CONFIG.appName}`}</title>

            <EmailCampaignsEditView />
        </>
    );
}
