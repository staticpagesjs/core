"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticPages = void 0;
const tque_1 = require("tque");
const interpolate_1 = require("./util/interpolate");
function staticPages() {
    const registeredFinalizers = new Set();
    const services = {
        registerFinalizer(fn) {
            if (!registeredFinalizers.has(fn)) {
                registeredFinalizers.add(fn);
            }
            return this;
        },
        bindArgs(fn, ...args) {
            return function (d) {
                args.unshift(d);
                return fn.apply(this, args);
            };
        },
        interpolate(target, source, pattern) {
            const data = source ? source : this[tque_1.symbols.internals].data;
            return interpolate_1.interpolate(target, data, pattern);
        },
    };
    const finalize = async function finalize() {
        for (const finalizer of registeredFinalizers) {
            await finalizer();
        }
        registeredFinalizers.clear();
    };
    return function (controllers = []) {
        const que = tque_1.createWithContext(services, tque_1.series(controllers));
        const fn = que;
        fn.finalize = finalize;
        return fn;
    };
}
exports.staticPages = staticPages;
