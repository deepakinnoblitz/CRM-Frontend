import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { EmailAutomationDetailsView } from 'src/sections/email-automations/view';

// ----------------------------------------------------------------------

export default function EmailAutomationDetailsPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Email Automation: ${id} - ${CONFIG.appName}`}</title>

            <EmailAutomationDetailsView />
        </>
    );
}
