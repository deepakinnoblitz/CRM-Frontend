import { CONFIG } from 'src/config-global';

import { PurchaseCollectionEditView } from 'src/sections/purchase-collection/view/purchase-collection-edit-view';

// ----------------------------------------------------------------------

export default function PurchaseCollectionEditPage() {
    return (
        <>
            <title>{`Edit Purchase Collection - ${CONFIG.appName}`}</title>

            <PurchaseCollectionEditView />
        </>
    );
}
