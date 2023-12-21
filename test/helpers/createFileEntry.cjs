module.exports = {
	createFileEntry(url, content, format) {
		switch (format) {
			case 'json':
				return [
					`pages/${url}.${format}`,
					JSON.stringify({
						url: url,
						content: content,
					})
				];
			case 'yaml':
				return [
					`pages/${url}.${format}`,
					`url: ${url}\ncontent: ${content}`
				];
			case 'md':
				return [
					`pages/${url}.${format}`,
					`---\nurl: ${url}\n---\n${content}`
				];
			default:
				return [
					`pages/${url}`,
					{ url, content }
				];
		}
	}
};
