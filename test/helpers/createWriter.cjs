module.exports = {
	/**
	 * Saves every input document as recieved to an array accessible via `writer.output` member.
	 */
	createWriter() {
		async function writer(item) {
			output.push(item);
		};
		const output = writer.output = [];
		return writer;
	}
};
