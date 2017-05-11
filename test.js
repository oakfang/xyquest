import test from 'ava';
import proxyquire from 'proxyquire';

import xyquest from '.';
const request = proxyquire('./request', {
    request: ({error, response, body}, cb) => {
        cb(error, response, body);
    }
});

function testAdapter(options) {
    return Promise.resolve(options);
}

test('Base usage works', async t => {
    const x = xyquest(testAdapter, 'http://foo.bar');
    const result = await x.meow.spamBuzz.rawr.post({ name: 'lolz' }, { opt: true });
    t.is(result.uri, 'http://foo.bar/meow/spam-buzz/rawr');
    t.is(result.method, 'post');
    t.is(result.body.name, 'lolz');
    t.is(result.opt, true);
});

test('Edge cases', async t => {
    const x = xyquest(testAdapter, 'http://foo.bar/', {hyphenate: false});
    const result = await x.meow.spamBuzz.rawr.get();
    t.is(result.uri, 'http://foo.bar/meow/spamBuzz/rawr');
    t.is(result.method, 'get');
    t.is(result.body, undefined);
});

test('Use with query params', async t => {
    const x = xyquest(testAdapter, 'http://foo.bar');
    const { uri } = await x.meow.spamBuzz.rawr.get({ name: 'lolz rawr' });
    t.is(uri, 'http://foo.bar/meow/spam-buzz/rawr?name=lolz%20rawr');
});

test('Request adapter', async t => {
    const options = {
        response: {
            statusCode: 200,
        },
        error: null,
        body: 5,
    };
    t.is(await request(options), 5);
    options.error = new Error();
    await t.throws(request(options));
    options.error = null;
    options.response.statusCode = 403;
    await t.throws(request(options));
});