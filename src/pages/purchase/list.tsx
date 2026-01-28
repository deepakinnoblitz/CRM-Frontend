import { CONFIG } from 'src/config-global';

import { PurchaseManagementView } from 'src/sections/purchase/view';

// ----------------------------------------------------------------------

export default function PurchaseListPage() {
    return (
        <>
            <title>{`Purchases - ${CONFIG.appName}`}</title>

            <PurchaseManagementView />
        </>
    );
}
