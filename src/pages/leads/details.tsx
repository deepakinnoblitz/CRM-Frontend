import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { LeadDetailsView } from 'src/sections/lead/view';

// ----------------------------------------------------------------------

export default function LeadDetailsPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Lead details: ${id} - ${CONFIG.appName}`}</title>

            <LeadDetailsView />
        </>
    );
}
