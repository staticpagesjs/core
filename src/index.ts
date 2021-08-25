type Data = { [key: string]: unknown };

export type Route = {
    from: Iterable<Data> | AsyncIterable<Data>;
    to: (data: Data) => void | Promise<void>;
    controller?: (data: Data) => undefined | Data | Data[] | Promise<undefined | Data | Data[]>;
};

export default async (routes: Route | Route[]): Promise<void> => {
    for (const route of Array.isArray(routes) ? routes : [routes]) {
        const controller = route.controller ?? (data => data);

        for await (let data of route.from) {
            const results = await controller(data);
            if (results) {
                if (Array.isArray(results)) {
                    for (const result of results) {
                        await route.to(result);
                    }
                } else {
                    await route.to(results);
                }
            }
        }
    }
};
