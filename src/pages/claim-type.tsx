import { CONFIG } from 'src/config-global';

import { ClaimTypeView } from 'src/sections/master/claim-type/view/claim-type-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Claim Type - ${CONFIG.appName}`}</title>
      <ClaimTypeView />
    </>
  );
}
