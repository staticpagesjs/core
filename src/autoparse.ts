import { parse as parseYAML } from 'yaml';
import parseMarkdown from 'gray-matter';

export function autoparse(content: string | Uint8Array, filename: string) {
    const extension = filename.split('.').pop()!.toLowerCase();
    switch (extension) {
        case 'json':
            return JSON.parse(content.toString());

        case 'yaml':
        case 'yml':
            return parseYAML(content.toString());

        case 'md':
        case 'markdown':
            const { data, content: markdownContent } = parseMarkdown(content.toString());
            return { ...data, content: markdownContent };
    }
    throw new Error(`Could not parse document with '${extension}' extension.`);
}
