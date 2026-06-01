import { CONFIG } from 'src/config-global';

import { TaskManagerReportView } from 'src/sections/report/task-manager/view/task-manager-report-view';

// ----------------------------------------------------------------------

export default function TaskManagerReportPage() {
  return (
    <>
      <title> Task Report - ${CONFIG.appName}</title>
      <TaskManagerReportView />
    </>
  );
}
