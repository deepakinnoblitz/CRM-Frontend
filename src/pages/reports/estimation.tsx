import { CONFIG } from 'src/config-global';

import { EstimationReportView } from '../../sections/report/estimation/view/estimation-report-view';

// ----------------------------------------------------------------------

export default function EstimationReportPage() {
    return (
        <>
            <title>{`Estimation Report - ${CONFIG.appName}`}</title>
            <EstimationReportView />
        </>
    );
}
