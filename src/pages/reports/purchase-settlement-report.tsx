import { CONFIG } from 'src/config-global';

import { PurchaseCollectionReportView } from 'src/sections/report/view/purchase-collection-report-view';

// ----------------------------------------------------------------------

export default function PurchaseCollectionReportPage() {
    return (
        <>
            <title>{`Purchase Settlement Report - ${CONFIG.appName}`}</title>
            <PurchaseCollectionReportView />
        </>
    );
}
