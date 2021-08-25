const { Readable, Writable } = require('stream');
const static = require('../lib/cjs/index').default;

const seq = n => Array.from(new Array(n)).map((v, i) => ({ a: i }));

const iterableReader = function* (source) { yield* source; };
const asyncIterableReader = async function* (source) { yield* source; };
const streamReader = function (source) {
    return new Readable({
        objectMode: true,
        read() {
            this.push(source.shift() || null);
        }
    });
};

const logStreamWriter = new Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
        console.log(chunk);
        callback();
    }
});


test('it passes trough the input data with minimal configuration', async () => {
    const input = seq(5);
    const expected = seq(5);

    await static([{
        from: {
            reader: input
        }
    }])

    const staticPagesWorker = staticPages();
    const output = await staticPagesWorker(input);

    expect(output).toStrictEqual(expected);
});

test('has all the custom api features', async () => {
    const staticPagesWorker = staticPages({
        userFunctions() { }
    });

    const output = await staticPagesWorker({}, [
        function () {
            if (typeof this.bindArgs !== 'function') return { missing: 'bindArgs' };
            if (typeof this.interpolate !== 'function') return { missing: 'interpolate' };
            if (typeof this.registerFinalizer !== 'function') return { missing: 'registerFinalizer' };
            if (typeof this.userFunctions !== 'function') return { missing: 'userFunctions' };
        }
    ]);

    expect(output).toStrictEqual([{}]);
});

test('can finalize', async () => {
    const staticPagesWorker = staticPages();

    let finalized = false;
    const finalizer = () => {
        finalized = true;
    };

    await staticPagesWorker({}, [
        function () {
            this.registerFinalizer(finalizer);
        }
    ]);

    expect(finalized).toBe(false);

    await staticPagesWorker.finalize();

    expect(finalized).toBe(true);
});

test('can interpolate', async () => {
    const staticPagesWorker = staticPages();

    await staticPagesWorker({
        person: {
            first: 'Lionel',
            last: 'Twain'
        },
        name: '${person.first} ${person.last}',
        nameObject: '${person}'
    }, [
        function ({ name, nameObject }) {
            return {
                name: this.interpolate(name),
                nameObject: this.interpolate(nameObject),
            };
        }
    ]);

    expect(finalized).toBe(false);

    await staticPagesWorker.finalize();

    expect(finalized).toBe(true);
});
