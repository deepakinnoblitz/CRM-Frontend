import { CONFIG } from 'src/config-global';

import { PurchaseListView } from 'src/sections/purchase/view';

// ----------------------------------------------------------------------

export default function PurchaseListPage() {
    return (
        <>
            <title>{`Purchases - ${CONFIG.appName}`}</title>

            <PurchaseListView />
        </>
    );
}
