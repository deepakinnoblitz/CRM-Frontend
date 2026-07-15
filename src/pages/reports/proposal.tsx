import { CONFIG } from 'src/config-global';

import { ProposalReportView } from '../../sections/report/proposal/view/proposal-report-view';

// ----------------------------------------------------------------------

export default function ProposalReportPage() {
    return (
        <>
            <title>{`Proposal Report - ${CONFIG.appName}`}</title>
            <ProposalReportView />
        </>
    );
}
