import { CONFIG } from 'src/config-global';

import { SalaryStructureComponentView } from 'src/sections/master/salary-structure-component/view/salary-structure-component-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Salary Structure Components - ${CONFIG.appName}`}</title>
      <SalaryStructureComponentView />
    </>
  );
}
