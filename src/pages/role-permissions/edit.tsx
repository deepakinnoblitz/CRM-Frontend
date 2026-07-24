import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { RolePermissionEditView } from 'src/sections/user/view/role-permission-edit-view';

// ----------------------------------------------------------------------

export default function RolePermissionEditPage() {
    const { id } = useParams();

    return (
        <>
            <title>{`Edit Role Permission: ${id} - ${CONFIG.appName}`}</title>

            <RolePermissionEditView name={id || ''} />
        </>
    );
}
