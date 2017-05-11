const methods = new Set([
    'get',
    'post',
    'put',
    'patch',
    'delete',
]);

function hyphenate(string) {
    return string.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function bodyAsQueryParams(body) {
    return '?' + Object.keys(body)
                       .map(param =>
                         `${encodeURIComponent(param)}=${encodeURIComponent(body[param])}`)
                       .join('&');
}

function getProxy(stack, adapter, baseOptions) {
    return new Proxy({}, {
        get(_, prop) {
            if (methods.has(prop.toLowerCase())) {
                const method = prop;
                return (body, override={}) => {
                    let queryParams = '';
                    if (method === 'get' || method === 'delete') {
                        if (body) {
                            queryParams = bodyAsQueryParams(body);
                        }
                        body = undefined;
                    }
                    const options = Object.assign(
                        {},
                        baseOptions,
                        { body, method },
                        override
                    );
                    if (options.hyphenate) {
                        stack = stack.map(hyphenate);
                    }
                    options.uri = stack.join('/') + queryParams;
                    return adapter(options);
                };
            }
            return getProxy(stack.concat([prop]), adapter, baseOptions);
        }
    });
}

function xyquest(adapter, baseUrl, baseOptions={}) {
    if (!('hyphenate' in baseOptions)) {
        baseOptions.hyphenate = true;
    }
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.substr(0, baseUrl.length - 1);
    }
    return getProxy([baseUrl], adapter, baseOptions);
}

module.exports = xyquest;