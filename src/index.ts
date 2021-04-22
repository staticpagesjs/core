import { series, createWithContext, Handler, Api, symbols } from 'tque';
import { interpolate } from './util/interpolate';

type BaseApi = {
    registerFinalizer(fn: Function): Api<BaseApi, any>;
    bindArgs(fn: Function, ...args: unknown[]): Function;
    interpolate(target: unknown, source?: { [key: string]: unknown }): unknown;
};

export type StaticPagesServices = Api<BaseApi, any>;

export function staticPages() {
    const registeredFinalizers = new Set<Function>();
    const services: BaseApi = {
        registerFinalizer(fn) {
            if (!registeredFinalizers.has(fn)) {
                registeredFinalizers.add(fn);
            }
            return <Api<BaseApi, any>>this;
        },

        bindArgs(fn: Handler<StaticPagesServices, any>, ...args: unknown[]) {
            return function (this: StaticPagesServices, d: unknown) {
                args.unshift(d);
                return fn.apply(this, <[any]>args);
            };
        },

        interpolate(this: StaticPagesServices, target: unknown, source?: { [key: string]: unknown }, pattern?: RegExp): unknown {
            const data = source ? source : (<any>this)[symbols.internals].data;
            return interpolate(target, data, pattern);
        },
    };

    const finalize = async function finalize() {
        for (const finalizer of registeredFinalizers) {
            await finalizer();
        }
        registeredFinalizers.clear();
    };

    return function (controllers: Handler<StaticPagesServices, any>[] = []) {
        const que = createWithContext(services, series(controllers));

        const fn = que as unknown as typeof que & {
            finalize(): void;
        };

        fn.finalize = finalize;
        return fn;
    };
}
