import type { Route } from './static-pages.js';
import { staticPages } from './static-pages.js';

export function configureStaticPages({ from, to, controller }: Partial<Route>) {
	return function configuredStaticPages(...routes: Partial<Route>[]) {
		return staticPages(...routes.map(route => ({
			from: typeof route.from !== 'undefined' ? route.from : from!,
			to: typeof route.to !== 'undefined' ? route.to : to!,
			controller: typeof route.controller !== 'undefined' ? route.controller : controller,
		})));
	};
}

// type NullablePartialRoute = {
// 	[P in keyof staticPages.Route]?: null | staticPages.Route[P];
// };

// staticPages.with = ({ from, to, controller }: NullablePartialRoute): typeof staticPages => {
// 	const withFunction = (newValue: NullablePartialRoute) =>
// 		staticPages.with({
// 			from: determineFrom(from, newValue.from)!,
// 			to: determineTo(to, newValue.to)!,
// 			controller: typeof newValue.controller !== 'undefined' ? newValue.controller : controller,
// 		});

// 	function modifiedStaticPages(...routes: NullablePartialRoute[]): Promise<void> {
// 		return staticPages(...routes.map(route => ({
// 			from: determineFrom(from, route.from)!,
// 			to: determineTo(to, route.to)!,
// 			controller: (typeof route.controller !== 'undefined' ? route.controller : controller)! ?? undefined,
// 		})));
// 	}

// 	modifiedStaticPages.with = withFunction;
// 	return modifiedStaticPages;
// };

// function determineFrom(oldValue: NullablePartialRoute['from'], newValue: NullablePartialRoute['from']) {
// 	if (newValue && typeof newValue === 'object' && !isIterable(newValue) && !isAsyncIterable(newValue) &&
// 		oldValue && typeof oldValue === 'object' && !isIterable(oldValue) && !isAsyncIterable(oldValue)
// 	) return { ...oldValue, ...newValue };

// 	return typeof newValue !== 'undefined' ? newValue : oldValue;
// }

// function determineTo(oldValue: NullablePartialRoute['to'], newValue: NullablePartialRoute['to']) {
// 	if (newValue && typeof newValue === 'object' &&
// 		oldValue && typeof oldValue === 'object'
// 	) return { ...oldValue, ...newValue };

// 	return typeof newValue !== 'undefined' ? newValue : oldValue;
// }
