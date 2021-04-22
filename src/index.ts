import { series, createWithContext, Handler, Api, symbols } from 'tque';
import { interpolate } from './util/interpolate';

type StaticApi<UserApi extends object> = {
    registerFinalizer(fn: Function): Services<UserApi>;
    bindArgs(fn: Handler<Services<UserApi>, any>, ...args: unknown[]): Function;
    interpolate(this: Services<UserApi>, target: unknown, source?: { [key: string]: unknown }, pattern?: RegExp): unknown;
} & UserApi;

export type Services<UserApi extends object> = Api<StaticApi<UserApi>, any>;

export function staticPages<UserApi extends object = {}>(userApi?: UserApi) {
    const registeredFinalizers = new Set<Function>();
    const services: StaticApi<UserApi> = {
        registerFinalizer(fn: Function): Services<UserApi> {
            if (!registeredFinalizers.has(fn)) {
                registeredFinalizers.add(fn);
            }
            return <any>this;
        },

        bindArgs(fn: Handler<Services<UserApi>, any>, ...args: unknown[]): Function {
            return function (this: Services<UserApi>, d: unknown) {
                args.unshift(d);
                return fn.apply(this, <[any]>args);
            };
        },

        interpolate(this: Services<UserApi>, target: unknown, source?: { [key: string]: unknown }, pattern?: RegExp): unknown {
            const data = source ? source : (<any>this)[symbols.internals].data;
            return interpolate(target, data, pattern);
        },

        ...<any>userApi
    };

    const finalize = async function finalize() {
        for (const finalizer of registeredFinalizers) {
            await finalizer();
        }
        registeredFinalizers.clear();
    };

    return function (controllers: Handler<Services<UserApi>, any>[] = []) {
        const que = createWithContext(services, series(controllers));

        const fn = que as unknown as typeof que & {
            finalize(): void;
        };

        fn.finalize = finalize;
        return fn;
    };
}
