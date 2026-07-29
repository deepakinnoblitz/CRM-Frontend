import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { HRDocumentTemplateDetailsView } from 'src/sections/hr-document-templates/view';

export default function HRDocumentTemplateDetailsPage() {
    const { id } = useParams();
    return (
        <>
            <title>{`HR Document Template Details - ${CONFIG.appName}`}</title>
            <HRDocumentTemplateDetailsView id={id as string} />
        </>
    );
}
