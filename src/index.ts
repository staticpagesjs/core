export { staticPages } from './static-pages.js';
export { createReader } from './create-reader';
export { createWriter } from './create-writer';

import { createReader } from './create-reader.js';
import { createWriter } from './create-writer.js';

export function from<T>(options: createReader.Options<T>) {
	return { from: createReader(options) };
}

export function to<T>(options: createWriter.Options<T>) {
	return { to: createWriter(options) };
}
