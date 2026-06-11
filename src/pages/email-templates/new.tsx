import { CONFIG } from 'src/config-global';

import { EmailTemplateCreateView } from 'src/sections/email-templates/view/email-templates-create-view';

// ----------------------------------------------------------------------

export default function EmailTemplateNewPage() {
    return (
        <>
            <title>{`New Email Templete - ${CONFIG.appName}`}</title>

            <EmailTemplateCreateView />
        </>
    );
}
