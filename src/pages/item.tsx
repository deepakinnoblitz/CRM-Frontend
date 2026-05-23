import { CONFIG } from 'src/config-global';

import { ItemView } from 'src/sections/master/item/view/item-view';

// ----------------------------------------------------------------------

export default function ItemPage() {
  return (
    <>
      <title>{`Item - ${CONFIG.appName}`}</title>

      <ItemView />
    </>
  );
}
