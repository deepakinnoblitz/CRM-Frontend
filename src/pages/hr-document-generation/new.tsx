import { CONFIG } from 'src/config-global';

import { HRDocumentGenerationCreateView } from 'src/sections/hr-document-generation/view';

// ----------------------------------------------------------------------

export default function HRDocumentGenerationCreatePage() {
    return (
        <>
            <title>{`New Document Generation - ${CONFIG.appName}`}</title>
            <HRDocumentGenerationCreateView />
        </>
    );
}
