import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { EmailTemplateEditView } from 'src/sections/email-templates/view/email-templates-edit-view';

// ----------------------------------------------------------------------

export default function EmailTemplateEditPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Edit Email Templete: ${id} - ${CONFIG.appName}`}</title>

            <EmailTemplateEditView />
        </>
    );
}
