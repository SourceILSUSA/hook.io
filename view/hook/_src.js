var hook = require('../../lib/resources/hook');
var checkRoleAccess = require('../../lib/server/routeHandlers/checkRoleAccess');
var config = require('../../config');

module['exports'] = function view (opts, callback) {
  var req = opts.req, res = opts.res, $ = this.$;
  var appName = req.hostname;
  
  var params = req.resource.params;
  
  return hook.find({owner: req.params.owner, name: req.params.hook }, function (err, result) {
    if (err) {
      return res.end(err.message);
    }

    if (result.length === 0) {
      return res.end('Not found');
    }

    var h = result[0];
    req.resource.owner = req.params.owner;
    checkRoleAccess({ req: req, res: res, role: "hook::source::read" }, function (err, hasPermission) {

      // only protect source of private services
      if (h.isPrivate !== true) {
        hasPermission = true;
      }

      if (!hasPermission) {
        return res.end(config.messages.unauthorizedRoleAccess(req, "hook::source::read"));
      }
      next();
    });

    function next () {

        // note: we could be using the new pkg format
        var extentions = {
          ".js": "javascript",
          ".coffee": "coffee-script",
          ".lua": "lua",
          ".php": "php",
          ".pl": "perl",
          ".py": "python", // Remark: You can also use the "--language python" option
          ".py3": "python3", // Remark: You can also use the "--language python3" option
          ".sh": "bash",
          ".rb": "ruby",
          ".tcl": "tcl",
          ".ss": "scheme",
          ".st": "smalltalk"
        };
        var file = "index";
        Object.keys(extentions).forEach(function(ext){
          if (extentions[ext] === h.language) {
            file += ext;
          }
        });

        $('.service').html(file);

        if (typeof h.themeSource === "undefined" || h.themeSource.length === 0) {
          $('.view').parent().remove();
        }

        if (typeof h.presenterSource === "undefined" || h.presenterSource.length === 0) {
          $('.presenter').parent().remove();
        }

        if (typeof h.mschema === "undefined") {
          $('.schema').parent().remove();
        }

        /*
        h.themeSource
        h.presenterSource
        h.mschema
        $('.service').html();
        $('.view').html();
        $('.presenter').html();
        $('.schema').html();
        */


        req.hook = h;

        switch (params.f) {

          case 'view.html':
            $('#code').text(h.themeSource);
          break;

          case 'presenter.js':
            $('#code').text(h.presenterSource);
          break;

          case 'schema.js':
            $('#code').text(JSON.stringify(h.mschema, true, 2));
          break;

          default:
            $('#code').text(h.source);
          break;

        }

        var out = $.html();
        out = out.replace(/\{\{appName\}\}/g, appName);
        callback(null, out);

    }

  });

};

module['exports'].useParentLayout = false;