import { CONFIG } from 'src/config-global';

import { HRDocumentCategoryView } from 'src/sections/master/hr-document-category/view/hr-document-category-view';

// ----------------------------------------------------------------------

export default function HRDocumentCategoryPage() {
    return (
        <>
            <title>{`HR Document Category List - ${CONFIG.appName}`}</title>
            <HRDocumentCategoryView />
        </>
    );
}
