import { CONFIG } from 'src/config-global';

import { InvoiceCollectionCreateView } from 'src/sections/invoice-collection/view/invoice-collection-create-view';

// ----------------------------------------------------------------------

export default function InvoiceCollectionCreatePage() {
    return (
        <>
            <title>{`Create Collection - ${CONFIG.appName}`}</title>

            <InvoiceCollectionCreateView />
        </>
    );
}
