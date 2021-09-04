export type Data = { [key: string]: unknown };
export type Controller = (data: Data) => undefined | Data | Data[] | Promise<undefined | Data | Data[]>;
export type Route = {
    from: Iterable<Data> | AsyncIterable<Data>;
    to: (data: Data) => void | Promise<void>;
    controller?: Controller;
    [key: string]: unknown;
};

export default async (routes: Route | Route[]): Promise<void> => {
    for (const route of Array.isArray(routes) ? routes : [routes]) {
        const { from, to, controller, ...userOptions } = route;
        const isController = typeof controller === "function";

        for await (let data of from) {
            const results = isController ? await (controller as Controller).call(userOptions, data) : data;
            if (typeof results === 'object' && results) {
                if (Array.isArray(results)) {
                    for (const result of results) {
                        await to(result);
                    }
                } else {
                    await to(results);
                }
            }
        }
    }
};
