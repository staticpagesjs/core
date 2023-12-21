const { Readable } = require('node:stream');

module.exports = {
	/**
	 * Creates an object stream from an array.
	 */
	arrayToObjectStream(source) {
		return new Readable({
			objectMode: true,
			read() {
				this.push(source.shift() ?? null);
			}
		});
	}
};
