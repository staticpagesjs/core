const staticPages = require('../lib/cjs/index').default;

test('it should throw when the route is not an object', async () => {
  await expect(async () => {
    await staticPages(null);
  })
    .rejects
    .toThrow(Error);
});

test('it shoult throw when "from" is not iterable', async () => {
  await expect(async () => {
    await staticPages({ from: 1 });
  })
    .rejects
    .toThrow(Error);
});

test('it shoult throw when "to" is not a function', async () => {
  await expect(async () => {
    await staticPages({ from: [], to: 1 });
  })
    .rejects
    .toThrow(Error);
});

test('it shoult throw when "controller" is not a function', async () => {
  await expect(async () => {
    await staticPages({ from: [], to: () => undefined, controller: 1 });
  })
    .rejects
    .toThrow(Error);
});
