import { CONFIG } from 'src/config-global';

import { PurchaseEditView } from 'src/sections/purchase/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`Edit Purchase - ${CONFIG.appName}`}</title>
            <PurchaseEditView />
        </>
    );
}