import { series, createWithContext, Handler, Api, symbols } from 'tque';
import { interpolate } from './util/interpolate';

type StaticApi<UserApi extends object> = {
    registerFinalizer(fn: Function): Services<UserApi>;
    bindArgs(fn: Function, ...args: unknown[]): Function;
    interpolate(this: Services<UserApi>, target: unknown, source?: { [key: string]: unknown }, pattern?: RegExp): unknown;
} & UserApi;

export type Services<UserApi extends object = {}> = Api<StaticApi<UserApi>, any>;

export function staticPages<UserApi extends object = {}>(userApi?: UserApi) {
    const registeredFinalizers = new Set<Function>();
    const services: StaticApi<UserApi> = {
        registerFinalizer(fn) {
            if (!registeredFinalizers.has(fn)) {
                registeredFinalizers.add(fn);
            }
            return <any>this;
        },

        bindArgs(fn, ...args) {
            return function (this: Services<UserApi>, d: unknown) {
                args.unshift(d);
                return fn.apply(this, args);
            };
        },

        interpolate(target, source?, pattern?) {
            const data = source ? source : (<any>this)[symbols.internals].data;
            return interpolate(target, data, pattern);
        },

        ...<UserApi>userApi // undefined has no effect with spread
    };

    // TODO: add types for data
    return Object.assign(async function (data: any, controllers: Handler<Services<UserApi>, any>[] = []) {
        return await createWithContext(services, series(controllers))(data);
    }, {
        async finalize() {
            for (const finalizer of registeredFinalizers) {
                await finalizer();
            }
            registeredFinalizers.clear();
        }
    });
}
