
var assert = require('assert');
var responses = require('..');

function mockReq(acceptsHTML) {
  function accepts(type) {
    return type == 'html' && acceptsHTML;
  }

  return {accepts: accepts};
}

function mockRes() {
  var data = {
    statusCode: null,
    locals: {},
    view: null,
    renderCalls: 0,
    jsonCalls: 0
  };
  
  function status(code) {
    data.statusCode = code;
  }

  function render(view) {
    data.view = view;
    data.renderCalls++;
  }

  function json(obj) {
    data.json = obj;
    data.jsonCalls++;
  }

  function toJSON() {
    return data;
  }

  return {
    status: status,
    render: render,
    json: json,
    locals: data.locals,
    toJSON: toJSON
  };
}

function mockFn() {
  var calls = 0;
  var callArgs = [];

  function fn() {
    calls++;
    callArgs.push(arguments);
  }

  fn.calls = function() {
    return calls;
  }

  fn.args = function() {
    return callArgs;
  }

  return fn;
}

describe('express-responses', function() {

  it('should return the correct HTTP status code and JSON response', function() {
    var res = mockRes();
    var ware = responses();

    ware(null, res, function() {
      res.notFound('error message');

      var data = res.toJSON();

      assert.equal(data.statusCode, 404);

      // json response should be populated 
      assert.equal(typeof data.json, 'object');
      assert.equal(data.json.code, 404);
      assert.equal(data.json.status, 'not found');
      assert.equal(data.json.message, 'error message');

      assert.equal(data.jsonCalls, 1);
      assert.equal(data.renderCalls, 0);

    });
  });

  describe('view String', function() {
    it('should render a template if the request accepts HTML', function() {
      var req = mockReq(true);
      var res = mockRes();
      var view = 'http-error';
      var ware = responses({
        view: view
      });

      ware(req, res, function() {
        res.notFound('error message');

        var data = res.toJSON();

        assert.equal(data.statusCode, 404);

        // res.locals should be set
        assert.equal(typeof data.locals.http, 'object');
        assert.equal(data.locals.http.code, 404);
        assert.equal(data.locals.http.status, 'not found');
        assert.equal(data.locals.http.message, 'error message');

        assert.equal(data.jsonCalls, 0);
        assert.equal(data.renderCalls, 1);
        assert.equal(data.view, 'http-error');
      });

    });
  });

  describe('emit Function', function() {
  
    it('should emit all errors in development', function() {
      var res = mockRes();
      var emitter = mockFn();
      var ware = responses({
        env: 'not production',
        emit: emitter
      });

      ware(null, res, function() {
        res.notFound();
        
        assert.equal(emitter.calls(), 1);
        assert.ok(emitter.args()[0][0] instanceof Error);
      });

      ware(null, res, function() {
        res.internalError();

        assert.equal(emitter.calls(), 2);
        assert.ok(emitter.args()[1][0] instanceof Error);
      });
    });

    it('should emit 5xx errors in production', function() {
      var res = mockRes();
      var emitter = mockFn();
      var ware = responses({
        env: 'production',
        emit: emitter
      });

      ware(null, res, function() {
        res.notFound();
        
        assert.equal(emitter.calls(), 0);
        assert.equal(emitter.args().length, 0);
      });

      ware(null, res, function() {
        res.internalError();

        assert.equal(emitter.calls(), 1);
        assert.ok(emitter.args()[0][0] instanceof Error);
      });
    });

  });

});

