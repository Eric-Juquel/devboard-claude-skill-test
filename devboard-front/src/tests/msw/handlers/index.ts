import { projectHandlers } from './projects';
import { taskHandlers } from './tasks';

export const handlers = [...projectHandlers, ...taskHandlers];
