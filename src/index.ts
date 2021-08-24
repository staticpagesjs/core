type Data = { [key: string]: unknown };

export type Route = {
    from: {
        reader: (...args: unknown[]) => Iterable<Data> | AsyncIterable<Data>;
        args?: unknown[];
    };
    to: {
        writer: (...args: unknown[]) => (data: Data) => void | Promise<void>;
        args?: unknown[];
    };
    controller?: (data: Data) => undefined | Data | Data[] | Promise<undefined | Data | Data[]>;
};

export default async (routes: Route | Route[]): Promise<void> => {
    for (const route of Array.isArray(routes) ? routes : [routes]) {
        const source = route.from.reader.apply(undefined, route.from.args ?? []);
        const destination = route.to.writer.apply(undefined, route.to.args ?? []);
        const controller = route.controller ?? (data => data);

        for await (let data of source) {
            const results = await controller(data);
            if (results) {
                if (Array.isArray(results)) {
                    for (const result of results) {
                        await destination(result);
                    }
                } else {
                    await destination(results);
                }
            }
        }
    }
};
