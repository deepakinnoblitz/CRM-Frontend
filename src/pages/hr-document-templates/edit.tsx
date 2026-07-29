import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { HRDocumentTemplateEditView } from 'src/sections/hr-document-templates/view';

export default function HRDocumentTemplateEditPage() {
    const { id } = useParams();
    return (
        <>
            <title>{`Edit HR Document Template - ${CONFIG.appName}`}</title>
            <HRDocumentTemplateEditView id={id as string} />
        </>
    );
}
