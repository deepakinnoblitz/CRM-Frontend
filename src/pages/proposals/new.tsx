import { CONFIG } from 'src/config-global';

import { ProposalCreateView } from 'src/sections/proposal/view';

// ----------------------------------------------------------------------

export default function ProposalNewPage() {
    return (
        <>
            <title>{`New Proposal - ${CONFIG.appName}`}</title>

            <ProposalCreateView />
        </>
    );
}
