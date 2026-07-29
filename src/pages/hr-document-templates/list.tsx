import { CONFIG } from 'src/config-global';

import { HRDocumentTemplateListView } from 'src/sections/hr-document-templates/view';

export default function HRDocumentTemplateListPage() {
    return (
        <>
            <title>{`Document Templates - ${CONFIG.appName}`}</title>
            <HRDocumentTemplateListView />
        </>
    );
}
