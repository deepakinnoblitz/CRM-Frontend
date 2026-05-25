import { CONFIG } from 'src/config-global';

import { ContactReportView } from 'src/sections/report/contact/view/contact-report-view';

// ----------------------------------------------------------------------

export default function ContactReportPage() {
    return (
        <>
            <title>{`Clients Report - ${CONFIG.appName}`}</title>
            <ContactReportView />
        </>
    );
}
