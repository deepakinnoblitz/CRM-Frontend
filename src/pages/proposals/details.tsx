import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { ProposalDetailsView } from 'src/sections/proposal/view';

// ----------------------------------------------------------------------

export default function ProposalDetailsPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Proposal: ${id} - ${CONFIG.appName}`}</title>

            <ProposalDetailsView />
        </>
    );
}
