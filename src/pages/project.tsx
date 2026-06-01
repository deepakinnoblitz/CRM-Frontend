import { CONFIG } from 'src/config-global';

import { ProjectView } from 'src/sections/master/project/view/project-view';

// ----------------------------------------------------------------------

export default function ProjectPage() {
  return (
    <>
      <title>{`Project List - ${CONFIG.appName}`}</title>
      <ProjectView />
    </>
  );
}
