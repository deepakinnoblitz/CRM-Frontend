import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { ProposalEditView } from 'src/sections/proposal/view';

// ----------------------------------------------------------------------

export default function ProposalEditPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Edit Proposal: ${id} - ${CONFIG.appName}`}</title>

            <ProposalEditView />
        </>
    );
}
