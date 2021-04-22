"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticPages = void 0;
const tque_1 = require("tque");
const interpolate_1 = require("./util/interpolate");
function staticPages(userApi) {
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
        ...userApi
    };
    return Object.assign(async function (data, controllers = []) {
        return await tque_1.createWithContext(services, tque_1.series(controllers))(data);
    }, {
        async finalize() {
            for (const finalizer of registeredFinalizers) {
                await finalizer();
            }
            registeredFinalizers.clear();
        }
    });
}
exports.staticPages = staticPages;
