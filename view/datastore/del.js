/*

module['exports'] = function get (opts, cb) {
  var $ = this.$,
  req = opts.request,
  res = opts.response;

  var types = [];

  if (req.headers && req.headers.accept) {
    types = req.headers.accept.split(',');
  }

  if (types.indexOf('application/json') !== -1) {
    return cb(null, JSON.stringify({ foo: "bar"}, true, 2))
  }



  console.log(req.headers)
  cb(null, $.html());
};

*/
var psr = require('parse-service-request');
var checkRoleAccess = require('../../lib/server/routeHandlers/checkRoleAccess');
var config = require('../../config');

var Datastore = require('../../lib/resources/datastore').Datastore;

module['exports'] = function datasourceDelView (opts, callback) {

  var $ = this.$, 
      req = opts.request,
      res = opts.response,
      params = req.resource.params;

  psr(req, res, function(req, res, fields){
    for (var p in fields) {
      params[p] = fields[p];
    }
    finish();
  });

  function finish () {
    if (typeof params.key !== 'undefined') {
      checkRoleAccess({ req: req, res: res, role: "datastore::del" }, function (err, hasPermission) {
        if (!hasPermission) {
          return res.end(config.messages.unauthorizedRoleAccess(req, "datastore::del" ));
        } else {
          var datastore = new Datastore({ root: req.resource.owner });
          datastore.del(params.key, function(err, result){
            if (err) {
              return callback(err);
            }
            return callback(null, JSON.stringify(result, true, 2));
          });
        }
      });
    } else {
      return callback(null, $.html());
    }
  }

};