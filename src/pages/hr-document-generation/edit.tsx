import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { HRDocumentGenerationEditView } from 'src/sections/hr-document-generation/view';

// ----------------------------------------------------------------------

export default function HRDocumentGenerationEditPage() {
    const { id } = useParams();
    return (
        <>
            <title>{`Edit Document Generation - ${CONFIG.appName}`}</title>
            <HRDocumentGenerationEditView id={id || ''} />
        </>
    );
}
