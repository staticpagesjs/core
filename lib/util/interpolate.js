"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolate = void 0;
const evaluate = (expr, ctx) => Function.call(null, "with(this)return (" + expr + ")").call(ctx);
const interpolate = (target, context, pattern = /\$\{(.*?[^\\]+?)\}/g) => {
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
        }
        catch (ex) {
            throw new Error(`Could not interpolate string '${target}': ${ex}`);
        }
    }
    else if (Array.isArray(target)) {
        const a = [];
        for (let value of target) {
            a.push(exports.interpolate(value, context, pattern));
        }
        return a;
    }
    else if (target && typeof target === 'object') {
        const o = {};
        for (const k of Object.keys(target)) {
            o[k] = exports.interpolate(target[k], context, pattern);
        }
        return o;
    }
    return target;
};
exports.interpolate = interpolate;
