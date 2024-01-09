import type { Route as RouteBase } from './static-pages.js';
import { staticPages as staticPagesBase } from './static-pages.js';
import { createReader, CreateReaderOptions, isCreateReaderOptions } from './create-reader.js';
import { createWriter, CreateWriterOptions, isCreateWriterOptions } from './create-writer.js';

export interface Route<F = unknown, T = unknown> {
	from?: RouteBase['from'] | CreateReaderOptions<F>;
	to?: RouteBase['to'] | CreateWriterOptions<T>;
	controller?: RouteBase['controller'];
}

export async function staticPages<F1, T1>(...route: [Route<F1, T1>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2>(...route: [Route<F1, T1>, Route<F2, T2>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3>(...route: [Route<F1, T1>, Route<F2, T2>, Route<F3, T3>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3, F4, T4>(...route: [Route<F1, T1>, Route<F2, T2>, Route<F3, T3>, Route<F4, T4>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3, F4, T4, F5, T5>(...route: [Route<F1, T1>, Route<F2, T2>, Route<F3, T3>, Route<F4, T4>, Route<F5, T5>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3, F4, T4, F5, T5, F6, T6>(...route: [Route<F1, T1>, Route<F2, T2>, Route<F3, T3>, Route<F4, T4>, Route<F5, T5>, Route<F6, T6>]): Promise<void>;
export async function staticPages(...routes: Route[]): Promise<void>;

export async function staticPages(...routes: Route[]): Promise<void> {
	return staticPagesBase(
		...routes.map(
			({ from, to, controller }) => ({
				from: isCreateReaderOptions(from) ? createReader(from) : from,
				to: isCreateWriterOptions(to) ? createWriter(to) : to,
				controller: controller,
			})
		)
	);
}
