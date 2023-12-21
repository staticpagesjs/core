/**
 * Creates an async iterable from an array.
 */
async function* arrayToAsyncIterable(source) {
	yield* source;
}

module.exports = {
	arrayToAsyncIterable
};
