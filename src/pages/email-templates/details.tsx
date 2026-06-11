import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { EmailTempleteDetailsView } from 'src/sections/email-templete/view';

// ----------------------------------------------------------------------

export default function EmailTempleteDetailsPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Email Templete: ${id} - ${CONFIG.appName}`}</title>

            <EmailTempleteDetailsView />
        </>
    );
}
