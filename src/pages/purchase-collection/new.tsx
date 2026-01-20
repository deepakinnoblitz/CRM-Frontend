import { CONFIG } from 'src/config-global';

import { PurchaseCollectionCreateView } from 'src/sections/purchase-collection/view/purchase-collection-create-view';

// ----------------------------------------------------------------------

export default function PurchaseCollectionCreatePage() {
    return (
        <>
            <title>{`New Purchase Collection - ${CONFIG.appName}`}</title>

            <PurchaseCollectionCreateView />
        </>
    );
}
