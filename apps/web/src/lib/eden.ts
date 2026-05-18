import { edenTreaty } from '@elysiajs/eden';
import type { App } from '../../../api/src/index';

export const api = edenTreaty<App>(window.location.origin);
