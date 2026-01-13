import { CONFIG } from 'src/config-global';

import { InvoiceCollectionReportView } from 'src/sections/report/view/invoice-collection-report-view';

// ----------------------------------------------------------------------

export default function InvoiceCollectionReportPage() {
    return (
        <>
            <title>{`Invoice Collection Report - ${CONFIG.appName}`}</title>
            <InvoiceCollectionReportView />
        </>
    );
}
