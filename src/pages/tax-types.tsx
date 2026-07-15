import { CONFIG } from 'src/config-global';

import { TaxTypesView } from 'src/sections/master/tax-types/view/tax-types-view';

// ----------------------------------------------------------------------

export default function TaxTypesPage() {
  return (
    <>
      <title>{`Tax Types - ${CONFIG.appName}`}</title>

      <TaxTypesView />
    </>
  );
}
