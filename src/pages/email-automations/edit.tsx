import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { EmailAutomationEditView } from 'src/sections/email-automations/view';

// ----------------------------------------------------------------------

export default function EmailAutomationEditPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Edit Email Automation: ${id} - ${CONFIG.appName}`}</title>

            <EmailAutomationEditView />
        </>
    );
}
