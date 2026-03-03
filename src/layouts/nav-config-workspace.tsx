import { CONFIG } from 'src/config-global';

import type { WorkspacesPopoverProps } from './components/workspaces-popover';

// ----------------------------------------------------------------------

export const _workspaces: WorkspacesPopoverProps['data'] = [
  {
    id: 'team-1',
    name: 'Team 1',
    plan: 'Free',
    logo: `${CONFIG.assetsDir}/icons/workspaces/logo-1.webp`,
  }
];
