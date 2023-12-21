module.exports = {
	/**
	 * Saves every input document as recieved to an array accessible via `writer.output` member.
	 */
	createMockWriter() {
		async function writer(items) {
			for await (const item of items) output.push(item);
		};
		const output = writer.output = [];
		return writer;
	}
};
