import { CONFIG } from 'src/config-global';
import { HRDocumentTemplateListView } from 'src/sections/hr-document-templates/view';

export default function HRDocumentTemplateListPage() {
    return (
        <>
            <title>{`HR Document Templates - ${CONFIG.appName}`}</title>
            <HRDocumentTemplateListView />
        </>
    );
}
