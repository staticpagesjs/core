/// <reference types="node" />
import { Handler, Api } from 'tque';
declare type BaseApi = {
    registerFinalizer(fn: Function): Api<BaseApi, any>;
    bindArgs(fn: Function, ...args: unknown[]): Function;
    interpolate(target: unknown, source?: {
        [key: string]: unknown;
    }): unknown;
};
export declare type StaticPagesServices = Api<BaseApi, any>;
export declare function staticPages(): (controllers?: Handler<StaticPagesServices, any>[]) => {
    (data: any): Promise<any[]>;
    stream(data: any): import("stream").Readable;
} & {
    finalize(): void;
};
export {};
