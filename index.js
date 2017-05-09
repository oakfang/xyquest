const request = require('request');
const HttpError = require('standard-http-error');

function promisifyRequest(options) {
    return new Promise((resolve, reject) =>
        request(options, (err, resp, body) => {
            if (err) return reject(err);
            if (resp.statusCode >= 400) return reject(new HttpError(resp.statusCode));
            return resolve(body);
        }));
}

const methods = new Set([
    'get',
    'post',
    'put',
    'patch',
    'delete',
]);

function getProxy(stack, baseOptions) {
    return new Proxy({}, {
        get(_, prop) {
            if (methods.has(prop.toLowerCase())) {
                const uri = stack.join('/');
                const method = prop;
                return (body, override={}) => {
                    const options = Object.assign(
                        {},
                        baseOptions,
                        { body, method, uri },
                        override
                    );
                    return promisifyRequest(options);
                };
            }
            return getProxy(stack.concat([prop]), baseOptions);
        }
    });
}

function xyquest(baseUrl, baseOptions={}) {
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.substr(0, baseUrl.length - 1);
    }
    return getProxy([baseUrl], baseOptions);
}

module.exports = xyquest;