import { CONFIG } from 'src/config-global';

import { HRDocumentTemplateCreateView } from 'src/sections/hr-document-templates/view';

export default function HRDocumentTemplateCreatePage() {
    return (
        <>
            <title>{`Create New HR Document Template - ${CONFIG.appName}`}</title>
            <HRDocumentTemplateCreateView />
        </>
    );
}
