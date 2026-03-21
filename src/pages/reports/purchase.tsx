import { CONFIG } from 'src/config-global';

import { PurchaseReportView } from 'src/sections/report/purchase/view/purchase-report-view';

// ----------------------------------------------------------------------

export default function PurchaseReportPage() {
    return (
        <>
            <title>{`Purchase Report - ${CONFIG.appName}`}</title>
            <PurchaseReportView />
        </>
    );
}
