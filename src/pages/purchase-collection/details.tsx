
import { CONFIG } from 'src/config-global';

import { PurchaseCollectionDetailsView } from 'src/sections/purchase-collection/view/purchase-collection-details-view';

// ----------------------------------------------------------------------

export default function PurchaseCollectionDetailsPage() {
    return (
        <>
            <title>{`Purchase Collection Details - ${CONFIG.appName}`}</title>

            <PurchaseCollectionDetailsView />
        </>
    );
}
