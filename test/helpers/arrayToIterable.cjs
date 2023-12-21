/**
 * Creates an iterable from an array.
 */
function* arrayToIterable(source) {
	yield* source;
}

module.exports = {
	arrayToIterable
};
