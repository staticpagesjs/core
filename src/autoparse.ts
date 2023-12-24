import { parse as parseYAML } from 'yaml';
import parseMarkdown from 'gray-matter';

export function autoparse(content: string | Uint8Array, filename: string) {
    const dot = filename.lastIndexOf('.');
    if (dot < 1) {
        throw new Error(`Could not parse document without an extension.`);
    }
    const extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    let doc: any;
    switch (extension) {
        case 'json':
            doc = JSON.parse(content.toString());
            break;

        case 'yaml':
        case 'yml':
            doc = parseYAML(content.toString());
            break;

        case 'md':
        case 'markdown':
            const { data, content: markdownContent } = parseMarkdown(content.toString());
            doc = { ...data, content: markdownContent };
            break;

        default:
            throw new Error(`Could not parse document with '${extension}' extension.`);
    }
    if (doc && typeof doc === 'object' && !('url' in doc)) {
        doc.url = filename.substring(0, dot).replace(/\\/g, '/');
    }
    return doc;
}
