const evaluate = (
    expr: string,
    ctx: { [key: string]: unknown }
) => Function.call(null, "with(this)return (" + expr + ")").call(ctx);

export const interpolate = (
    target: unknown,
    context: { [key: string]: unknown },
    pattern = /\$\{(.*?[^\\]+?)\}/g
): unknown => {
    if (!context) {
        context = {};
    }
    if (typeof target === 'string') {
        try {
            const match = pattern.exec(target);
            if (pattern.lastIndex) {
                pattern.lastIndex = 0; // reset last index if there is a g flag
            }
            if (match && match[0].length === target.length) { // eg. "${param}" and not "aaa${param}"
                return evaluate(match[1], context);
            }
            return target.replace(pattern, (_, expr) => evaluate(expr, context));
        } catch (ex) {
            throw new Error(`Could not interpolate string '${target}': ${ex}`);
        }
    } else if (Array.isArray(target)) {
        const a = [];
        for (let value of target) {
            a.push(interpolate(value, context, pattern));
        }
        return a;
    } else if (target && typeof target === 'object') {
        const o: { [k: string]: unknown } = {};
        for (const k of Object.keys(target)) {
            o[k] = interpolate((<any>target)[k], context, pattern);
        }
        return o;
    }
    return target;
}
