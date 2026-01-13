import { CONFIG } from 'src/config-global';

import { PurchaseCreateView } from 'src/sections/purchase/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`New Purchase - ${CONFIG.appName}`}</title>
            <PurchaseCreateView />
        </>
    );
}