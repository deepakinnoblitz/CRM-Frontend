import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { RolePermissionDetailsView } from 'src/sections/user/view/role-permission-details-view';

// ----------------------------------------------------------------------

export default function RolePermissionDetailsPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Role Permission Details: ${id} - ${CONFIG.appName}`}</title>

            <RolePermissionDetailsView name={id || ''} />
        </>
    );
}
