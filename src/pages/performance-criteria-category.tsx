import { CONFIG } from 'src/config-global';

import { PerformanceCriteriaCategoryView } from 'src/sections/master/performance-criteria-category/view/performance-criteria-category-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Performance Criteria Category - ${CONFIG.appName}`}</title>
      <PerformanceCriteriaCategoryView />
    </>
  );
}
