import { CONFIG } from 'src/config-global';

import { HRDocumentGenerationListView } from 'src/sections/hr-document-generation/view';

// ----------------------------------------------------------------------

export default function HRDocumentGenerationListPage() {
    return (
        <>
            <title>{`Document Generation - ${CONFIG.appName}`}</title>
            <HRDocumentGenerationListView />
        </>
    );
}
