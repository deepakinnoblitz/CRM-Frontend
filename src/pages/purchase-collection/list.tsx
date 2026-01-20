import { CONFIG } from 'src/config-global';
    
import { PurchaseCollectionListView } from 'src/sections/purchase-collection/view/purchase-collection-list-view';

// ----------------------------------------------------------------------

export default function PurchaseCollectionListPage() {
    return (
        <>
            <title>{`Purchase Collections - ${CONFIG.appName}`}</title>

            <PurchaseCollectionListView />
        </>
    );
}
