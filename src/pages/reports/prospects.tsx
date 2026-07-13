import { CONFIG } from 'src/config-global';

import { ProspectsReportView } from '../../sections/report/prospects/view/prospects-report-view';

// ----------------------------------------------------------------------

export default function ProspectsReportPage() {
    return (
        <>
            <title>{`Prospects Report - ${CONFIG.appName}`}</title>
            <ProspectsReportView />
        </>
    );
}
