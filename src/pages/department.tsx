import { CONFIG } from 'src/config-global';

import { DepartmentView } from 'src/sections/master/department/view/department-view';

// ----------------------------------------------------------------------

export default function DepartmentPage() {
  return (
    <>
      <title>{`Department List - ${CONFIG.appName}`}</title>
      <DepartmentView />
    </>
  );
}
