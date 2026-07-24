import { forwardRef } from 'react';

import { RolePermissionListView } from './role-permission-list-view';

export const RolePermissionView = forwardRef(({ hideHeader = false, hideActionButton = false }: { hideHeader?: boolean; hideActionButton?: boolean }, ref) => (
    <RolePermissionListView />
));
RolePermissionView.displayName = 'RolePermissionView';
