import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { EmailTempleteEditView } from 'src/sections/email-templete/view';

// ----------------------------------------------------------------------

export default function EmailTempleteEditPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Edit Email Templete: ${id} - ${CONFIG.appName}`}</title>

            <EmailTempleteEditView />
        </>
    );
}
