import { CONFIG } from 'src/config-global';

import { ProposalListView } from 'src/sections/proposal/view';

// ----------------------------------------------------------------------

export default function ProposalListPage() {
    return (
        <>
            <title>{`Proposals - ${CONFIG.appName}`}</title>

            <ProposalListView />
        </>
    );
}
