import { CONFIG } from 'src/config-global';

import { InvoiceCollectionListView } from 'src/sections/invoice-collection/view/invoice-collection-list-view';

// ----------------------------------------------------------------------

export default function InvoiceCollectionListPage() {
    return (
        <>
            <title>{`Invoice Collections - ${CONFIG.appName}`}</title>

            <InvoiceCollectionListView />
        </>
    );
}
