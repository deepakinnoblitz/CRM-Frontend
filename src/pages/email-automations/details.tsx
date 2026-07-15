import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { EmailAutomationsDetailsView } from 'src/sections/email-automations/view';

// ----------------------------------------------------------------------

export default function EmailAutomationsDetailsPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Email Automation: ${id} - ${CONFIG.appName}`}</title>

            <EmailAutomationsDetailsView />
        </>
    );
}
