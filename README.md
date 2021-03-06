# Express Responses

Express Responses attaches methods to `res` to make returning HTTP errors easier and more consistent.

```sh
npm install express-responses
```

```js
var app = require('express')();
var responses = require('express-responses');

app.use(responses({
	view: 'http-error',
	emit: function(error) {...}
}));

app.get('/users/:user', function(req, res, next) {
	var user = db.getUser(req.params.user);
	if(!user) {
		// returns a 404 along with the error message
		res.notFound('User '+req.params.user+' not found.');
	} else {
		res.locals.user = user;
		res.render('user/show');
	}
});

app.get('/feature', function(req, res, next) {
  res.notImplemented({
    message: "This feature has not been implemented.",
    documentationUrl: "http://api.example.com/docs/..."
  });
});

```

Not every single HTTP code is attached to `res`, see the [source](https://github.com/andrejewski/express-responses/blob/master/index.js) for which methods are included.

## Options

### view String

If the `view` option is set with a template name, Responses will respond to a request with `res.render([view])` if the request accepts (is expecting) HTML. In the template, Responses will expose an `http` object in `res.locals` containing an object like the following:

```json
{
	"code": 404,
	"status": "not found",
	"message": "User chris not found."
}
```

If the request does not accept HTML or `view` is not set, Responses will return this object via `res.json(data)`. In either case, `res.status` will be appropriately called.

### emit Function

If the `emit` option is set with a function accepting an Error, any errors sent with Responses will also be passed to the function. This is useful for debugging and logging.

Only errors with status codes 500 and above will be passed to `emit` when `process.env.NODE_ENV = 'production'` as 5xx series errors are the fault of the server. In development, any error will be emitted to the `emit` function.

## Contributing

Obviously, there are a lot more HTTP error codes. I have only implemented the ones I have been using daily. If you can justify the use case for new methods, open an issue or pull request (new methods are really just one liners).

We can always have more tests: if you find a bug, create an issue or be **fabulous** and fix the problem and write the tests up yourself in a coherent pull request.

Run tests with the `npm test` command.

Follow me on [Twitter](https://twitter.com/ndrejewski) for updates or just for the lolz and please check out my other [repositories](https://github.com/andrejewski) if I have earned it. I thank you for reading.

