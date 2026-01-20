import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { PurchaseDetailsView } from 'src/sections/purchase/view';

// ----------------------------------------------------------------------

export default function PurchaseViewPage() {
    const { id } = useParams();

    return (
        <>
            <title> {`Purchase Detail - ${CONFIG.appName}`}</title>

            <PurchaseDetailsView />
        </>
    );
}