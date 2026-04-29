import { CONFIG } from 'src/config-global';

import { UploadAttendanceView } from 'src/sections/upload-attendance/view/upload-attendance-view';

// ----------------------------------------------------------------------

export default function ImportAttendancePage() {
  return (
    <>
      <title>{`Import Attendance - ${CONFIG.appName}`}</title>
      <UploadAttendanceView />
    </>
  );
}
