import { CONFIG } from 'src/config-global';

import { SalarySlipsView } from 'src/sections/salary-slips/view/salary-slips-view';

// ----------------------------------------------------------------------

export default function SalarySlipsPage() {
    return (
        <>
            <title>{`Salary Slip - ${CONFIG.appName}`}</title>
            <SalarySlipsView />
        </>
    );
}
