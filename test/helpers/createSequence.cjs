module.exports = {
	/**
	 * Creates numbers in an array.
	 */
	createSequence(n) {
		return Array.from({ length: n }, (v, i) => i);
	}
};
