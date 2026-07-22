import type { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from './auth-context';

type RolePermissionGuardProps = {
    children: ReactNode;
    actionKey: string;
};

export function RolePermissionGuard({ children, actionKey }: RolePermissionGuardProps) {
    const { user } = useAuth();
    const hasCustomPerms = user?.permissions?.custom_permissions_assigned;

    if (hasCustomPerms) {
        const actionPerms = user?.permissions?.actions?.[actionKey];
        if (!actionPerms || !actionPerms.view) {
            return <Navigate to="/access-denied" replace />;
        }
    }

    return <>{children}</>;
}
