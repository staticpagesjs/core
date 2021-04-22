import { Handler, Api } from 'tque';
declare type StaticApi<UserApi extends object> = {
    registerFinalizer(fn: Function): Services<UserApi>;
    bindArgs(fn: Handler<Services<UserApi>, any>, ...args: unknown[]): Function;
    interpolate(this: Services<UserApi>, target: unknown, source?: {
        [key: string]: unknown;
    }, pattern?: RegExp): unknown;
} & UserApi;
export declare type Services<UserApi extends object = {}> = Api<StaticApi<UserApi>, any>;
export declare function staticPages<UserApi extends object = {}>(userApi?: UserApi): ((data: any, controllers?: Handler<Services<UserApi>, any>[]) => Promise<any[]>) & {
    finalize(): Promise<void>;
};
export {};
