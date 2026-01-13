import { CONFIG } from 'src/config-global';

import InvoiceCollectionEditView from 'src/sections/invoice-collection/view/invoice-collection-edit-view';

// ----------------------------------------------------------------------

export default function InvoiceCollectionEditPage() {
    return (
        <>
            <title>{`Edit Collection - ${CONFIG.appName}`}</title>

            <InvoiceCollectionEditView />
        </>
    );
}
