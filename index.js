
function camel(words) {
  return words.split(' ').map(function(x) {
    return x.charAt(0).toUpperCase() + x.slice(1);
  }).join('');
}

module.exports = function(options) {
  options = options || {};

  var env = options.env || process.env.NODE_ENV;
  var dev = env && env !== 'production';

  function responses(req, res, next) {

    function respond(shared) {
      return function _respond(unique) {
        unique = unique || {};
        if(typeof unique === 'string') {
          unique = {message: unique};
        }

        var data = Object.assign({}, shared, unique);
        var code = data.code || 500;
        var status = data.status || 'Error';

        if(options.emit && (dev || code >= 500)) {
          if(!(unique instanceof Error)) {
            var error = new Error(data);
            error.code = code;
            error.name = camel("Http " + status);
            options.emit(error);
          } else {
            options.emit(data);
          }
        }

        res.status(code);
        if(options.view && req.accepts('html')) {
          res.locals.http = data;
          res.render(options.view);
        } else {
          res.json(data);
        }
      }
    }

    function handle(code, status) {
      return respond({
        code: code,
        status: status,
      });
    }

    res.httpRespond = respond;

    // 4xx: client error
    res.badRequest = handle(400, 'bad request');
    res.unauthorized = handle(401, 'unauthorized');
    res.paymentRequired = handle(402, 'payment required');
    res.forbidden = handle(403, 'forbidden');
    res.notFound = handle(404, 'not found');
    res.notAllowed = handle(405, 'method not allowed');

    // 5xx: server error
    res.internalError = handle(500, 'internal server error');
    res.notImplemented = handle(501, 'not implemented');
    res.badGateway = handle(502, 'bad gateway');
    res.serviceUnavailable = handle(503, 'service unavailable');

    // If you want more: open issue/pull request

    next();
  }

  return responses;

}

