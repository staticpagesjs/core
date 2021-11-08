const staticPages = require('../cjs/index').default;

test('it should throw when the route is not an object', async () => {
  await expect(async () => {
    await staticPages(null);
  })
    .rejects
    .toThrow('Route');
});

test('it shoult throw when "from" is not iterable', async () => {
  await expect(async () => {
    await staticPages({ from: 1, to: () => undefined });
  })
    .rejects
    .toThrow('Route');
});

test('it shoult throw when "to" is not a function', async () => {
  await expect(async () => {
    await staticPages({ from: [], to: { a: 1 } });
  })
    .rejects
    .toThrow('Route');
});

test('it shoult throw when "controller" is not a function', async () => {
  await expect(async () => {
    await staticPages({ from: [], to: () => undefined, controller: 1 });
  })
    .rejects
    .toThrow('Route');
});

test('it shoult throw when from and to is undefined', async () => {
  await expect(async () => {
    await staticPages({ from: undefined, to: undefined });
  })
    .rejects
    .toThrow('Route');
});
