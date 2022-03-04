require("newrelic");

var request = require("request")
  , express      = require("express")
  , morgan       = require("morgan")
  , path         = require("path")
  , bodyParser   = require("body-parser")
  , async        = require("async")
  , cookieParser = require("cookie-parser")
  , session      = require("express-session")
  , config       = require("./config")
  , helpers      = require("./helpers")
  , cart         = require("./api/cart")
  , catalogue    = require("./api/catalogue")
  , orders       = require("./api/orders")
  , user         = require("./api/user")
  , metrics      = require("./api/metrics")
  , app          = express()
  , fs           = require("fs")


app.use(helpers.rewriteSlash);
app.use(metrics);
app.use(express.static("public"));

const { logger } = helpers;
// overrwrite global console.log object
global.console.log = (...args) => logger.info.call(logger, ...args);


if(process.env.SESSION_REDIS) {
    console.log('Using the redis based session manager');
    app.use(session(config.session_redis));
}
else {
    console.log('Using local session manager');
    app.use(session(config.session));
}

app.use(bodyParser.json());
app.use(cookieParser());
app.use(helpers.sessionMiddleware);
app.use(morgan("dev", {}));

var domain = "";
process.argv.forEach(function (val, index, array) {
  var arg = val.split("=");
  if (arg.length > 1) {
    if (arg[0] == "--domain") {
      domain = arg[1];
      console.log("Setting domain to:", domain);
    }
  }
});

function getNewRelicBrowserAgent() {
  const nrtemplate = fs.readFileSync('./public/js/newrelicbrower.js.template').toString();

  return nrtemplate
    .replace(/_TEMPLATE_ACCOUNT_ID_/g, process.env.NEW_RELIC_ACCOUNT_ID)
    .replace(/_TEMPLATE_TRUST_KEY_/g, process.env.NEW_RELIC_APP_ID)
    .replace(/_TEMPLATE_LICENSE_KEY_/g, process.env.NEW_RELIC_BROWSER_LICENSE_KEY)
    .replace(/_TEMPLATE_APP_ID_/g, process.env.NEW_RELIC_APP_ID)
    ;
}

const NewRelicBrowserFile = getNewRelicBrowserAgent();

app.get('/nragent/newrelic.js', function(req, res) {
  res.setHeader('content-type', 'text/javascript');
  res.write(NewRelicBrowserFile);
  res.end();
});

/* Mount API endpoints */
app.use(cart);
app.use(catalogue);
app.use(orders);
app.use(user);

app.use(helpers.errorHandler);

var server = app.listen(process.env.PORT || 8079, function () {
  var port = server.address().port;
  console.log("App now running in %s mode on port %d", app.get("env"), port);
});
