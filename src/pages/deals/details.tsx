import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { DealDetailsView } from 'src/sections/deal/view';

// ----------------------------------------------------------------------

export default function DealDetailsPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Deal details: ${id} - ${CONFIG.appName}`}</title>

            <DealDetailsView />
        </>
    );
}
