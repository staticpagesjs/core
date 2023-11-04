export const getType = (x: unknown): string => typeof x === 'object' ? (x ? 'object' : 'null') : typeof x;
export const isIterable = <T>(x: unknown extends Iterable<T> ? Iterable<T> : any): x is Iterable<T> => typeof x?.[Symbol.iterator] === 'function';
export const isAsyncIterable = <T>(x: unknown extends Iterable<T> ? Iterable<T> : any): x is AsyncIterable<T> => typeof x?.[Symbol.asyncIterator] === 'function';
