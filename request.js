const request = require('request');
const HttpError = require('standard-http-error');

function promisifyRequest(options) {
    return new Promise(function (resolve, reject) {
        return request(options, function (err, resp, body) {
            if (err) return reject(err);
            if (resp.statusCode >= 400) return reject(new HttpError(resp.statusCode));
            return resolve(body);
        });
    });
}

module.exports = promisifyRequest;