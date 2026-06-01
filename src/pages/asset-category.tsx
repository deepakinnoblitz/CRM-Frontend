import { CONFIG } from 'src/config-global';

import { AssetCategoryView } from 'src/sections/master/asset-category/view/asset-category-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Asset Category - ${CONFIG.appName}`}</title>
      <AssetCategoryView />
    </>
  );
}
