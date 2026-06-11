import { CONFIG } from 'src/config-global';

import { EmailTempleteCreateView } from 'src/sections/email-templete/view';

// ----------------------------------------------------------------------

export default function EmailTempleteNewPage() {
    return (
        <>
            <title>{`New Email Templete - ${CONFIG.appName}`}</title>

            <EmailTempleteCreateView />
        </>
    );
}
