
function camel(words) {
  return words.split(' ').map(function(x) {
    return x.charAt(0) + x.slice(1);
  }).join('');
}

module.exports = function(options) {
  options = options || {};

  var env = options.env || process.env.NODE_ENV;
  var dev = env && env !== 'production';

  function responses(req, res, next) {

    function handle(code, status) {
      return function(error) {
        var data = {
          code: code,
          status: status,
          error: error
        };

        if(options.emit && (dev || code >= 500)) {
          var err = new Error(error);
          err.code = code;
          err.name = camel("Http " + status);
          options.emit(err);
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

    // 4xx: client error
    res.badRequest = handle(400, 'bad request');
    res.forbidden = handle(403, 'forbidden');
    res.notFound = handle(404, 'not found');
    res.undefined = handle(405, 'method not allowed');

    // 5xx: server error
    res.internalError = handle(500, 'internal server error');
    res.notImplemented = handle(501, 'not implemented');

    // If you want more: open issue/pull request

    next();
  }

  return responses;

}

