import { CONFIG } from 'src/config-global';

import { ToDoView } from 'src/sections/todo/view/todo-view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`ToDo - ${CONFIG.appName}`}</title>

            <ToDoView />
        </>
    );
}
