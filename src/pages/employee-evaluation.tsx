import { CONFIG } from 'src/config-global';

import { EmployeeEvaluationView } from 'src/sections/employee-evaluation/view/employee-evaluation-view';

// ----------------------------------------------------------------------

export default function EmployeeEvaluationPage() {
  return (
    <>
      <title>{`Employee Evaluation - ${CONFIG.appName}`}</title>
      <EmployeeEvaluationView />
    </>
  );
}
