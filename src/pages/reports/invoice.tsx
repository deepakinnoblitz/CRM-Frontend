import { CONFIG } from 'src/config-global';

import { InvoiceReportView } from 'src/sections/report/invoice/view/invoice-report-view';

// ----------------------------------------------------------------------

export default function InvoiceReportPage() {
    return (
        <>
            <title>{`Invoice Report - ${CONFIG.appName}`}</title>
            <InvoiceReportView />
        </>
    );
}
