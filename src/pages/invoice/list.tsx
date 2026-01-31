import { CONFIG } from 'src/config-global';

import { InvoiceManagementView } from 'src/sections/invoice/view';

// ----------------------------------------------------------------------

export default function InvoiceListPage() {
    return (
        <>
            <title>{`Invoices - ${CONFIG.appName}`}</title>

            <InvoiceManagementView />
        </>
    );
}
