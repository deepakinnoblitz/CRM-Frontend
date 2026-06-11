import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { EmailAutomationsEditView } from 'src/sections/email-automations/view';

// ----------------------------------------------------------------------

export default function EmailAutomationsEditPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Edit Email Automation: ${id} - ${CONFIG.appName}`}</title>

            <EmailAutomationsEditView />
        </>
    );
}
