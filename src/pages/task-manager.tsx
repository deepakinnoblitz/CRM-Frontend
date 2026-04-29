import { CONFIG } from 'src/config-global';

import TaskManagerView from 'src/sections/task-manager/view/task-manager-view';

// ----------------------------------------------------------------------

export default function TaskManagerPage() {
  return (
    <>
      <title>{`Task Manager - ${CONFIG.appName}`}</title>

      <TaskManagerView />
    </>
  );
}
