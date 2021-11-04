export type Data = { [key: string]: unknown };
export type Controller = (data: Data) => undefined | Data | Data[] | Promise<undefined | Data | Data[]>;
export type Route = {
	from: Iterable<Data> | AsyncIterable<Data>;
	to: (data: Data) => void | Promise<void>;
	controller?: Controller;
	[key: string]: unknown;
};

const getType = (x: unknown): string => typeof x === 'object' ? (x ? 'object' : 'null') : typeof x;

export default async (routes: Route | Route[]): Promise<void> => {
	for (const route of Array.isArray(routes) ? routes : [routes]) {
		if (typeof route !== 'object' || !route)
			throw new Error(`Route type mismatch, expected 'object', got '${getType(route)}'.`);

		const { from, to, controller, ...userOptions } = route;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (typeof (from as any)?.[Symbol.iterator] !== 'function' && typeof (from as any)?.[Symbol.asyncIterator] !== 'function')
			throw new Error('Route \'from\' is not an \'iterable\' or an \'asyncIterable\'.');

		if (typeof to !== 'function')
			throw new Error(`Route 'to' type mismatch, expected 'function', got '${getType(to)}'.`);

		if (typeof controller !== 'undefined' && typeof controller !== 'function')
			throw new Error(`Route 'controller' type mismatch, expected 'function', got '${getType(controller)}'.`);

		const isController = typeof controller === 'function';

		for await (const data of from) {
			const results = isController ? await (controller as Controller).call(userOptions, data) : data;
			if (typeof results === 'object' && results) {
				if (Array.isArray(results)) {
					for (const result of results) {
						await to(result);
					}
				} else {
					await to(results);
				}
			}
		}
	}
};
