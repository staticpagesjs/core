export type { Data } from './common.js';
export { staticPages } from './static-pages.js';
export { createReader } from './create-reader';
export { createWriter } from './create-writer';

import type { Data } from './common.js';
import { createReader } from './create-reader.js';
import { createWriter } from './create-writer.js';

export function from<T extends Data>(options: createReader.Options<T>) {
	return { from: createReader(options) };
}

export function to<T extends Data>(options: createWriter.Options<T>) {
	return { to: createWriter(options) };
}
