import { CONFIG } from 'src/config-global';

import { EmailTemplateListView } from 'src/sections/email-templates/view/email-templates-list-view';

// ----------------------------------------------------------------------

export default function EmailTemplateListPage() {
    return (
        <>
            <title>{`Email Templetes - ${CONFIG.appName}`}</title>

            <EmailTemplateListView />
        </>
    );
}
