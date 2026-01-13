import { CONFIG } from 'src/config-global';

import { PurchaseView } from 'src/sections/purchase/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`Purchases - ${CONFIG.appName}`}</title>

            <PurchaseView />
        </>
    );
}