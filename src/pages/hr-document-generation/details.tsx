import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { HRDocumentGenerationDetailsView } from 'src/sections/hr-document-generation/view';

// ----------------------------------------------------------------------

export default function HRDocumentGenerationDetailsPage() {
    const { id } = useParams();
    return (
        <>
            <title>{`Document Generation Details - ${CONFIG.appName}`}</title>
            <HRDocumentGenerationDetailsView id={id || ''} />
        </>
    );
}
