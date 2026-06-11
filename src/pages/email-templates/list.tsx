import { CONFIG } from 'src/config-global';

import { EmailTempleteListView } from 'src/sections/email-templete/view';

// ----------------------------------------------------------------------

export default function EmailTempleteListPage() {
    return (
        <>
            <title>{`Email Templetes - ${CONFIG.appName}`}</title>

            <EmailTempleteListView />
        </>
    );
}
