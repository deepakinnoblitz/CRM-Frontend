import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { EmailTemplateDetailsView } from 'src/sections/email-templates/view';

// ----------------------------------------------------------------------

export default function EmailTemplateDetailsPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Email Templete: ${id} - ${CONFIG.appName}`}</title>

            <EmailTemplateDetailsView />
        </>
    );
}
