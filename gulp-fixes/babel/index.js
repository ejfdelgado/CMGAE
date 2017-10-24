"use strict";

exports.__esModule = true;

exports.default = function (_ref) {
  var messages = _ref.messages;
  let globals = null;
  return {
    visitor: {
      ReferencedIdentifier: function ReferencedIdentifier(path, options) {
        let pluginOptions  = options.opts;
        let envNames       = pluginOptions.env;
        let customGlobals  = pluginOptions.globals;
        let cacheGlobals   = pluginOptions.cacheGlobals;
        let scope          = path.scope;
        let variableName   = path.node.name;
        let binding        = scope.getBinding(variableName);

        // set default
        if (typeof cacheGlobals === "undefined")
          cacheGlobals = true;

        if (binding && binding.kind === "type" && !path.parentPath.isFlow()) {
          throw path.buildCodeFrameError(
            messages.get("undeclaredVariableType", variableName),
            ReferenceError);
        }

        // cache globals in module scope
        // to prevent computing the globals array
        // on each function call
        if ( ! cacheGlobals || (cacheGlobals && ! globals) ) {
          globals = [];

          // add environemnt globals
          if (envNames) {
            if (typeof envNames !== "string" && ! (envNames instanceof Array))
              throw new Error("\"env\" has to be of type String or Array");

            [].concat(envNames).forEach( (envName) => {
              let envGlobals = _predefinedEnvs2[envName];

              if ( ! envGlobals )
                throw new Error([
                  "Unkown environment \"" + envName + "\".\n",
                  "Supported environments:",
                  Object.keys(_predefinedEnvs2).map( (w) => "\t" + w ).join("\n"),
                  "\nFor more details visit:\n",
                  "\thttps://github.com/sindresorhus/globals\n",
                  "or use the \"globals\" option to add custom globals."
                ].join("\n"));

              globals = globals.concat( Object.keys(envGlobals) );
            });
          }

          // add custom globals
          if (customGlobals) {
            if ( ! (customGlobals instanceof Array) )
              throw new Error("\"globals\" has to be an array");

            globals = globals.concat( customGlobals );
          }
        }

        if (scope.hasBinding(variableName) ||
            globals.indexOf(variableName) !== -1) return;

        // get the closest declaration to offer as a suggestion
        // the variable name may have just been mistyped
        let closest;
        let shortest = -1;
        let bindings = scope.getAllBindings();
    
    for (var name in bindings) {
          var distance = (0, _leven2.default)(variableName, name);
          if (distance <= 0 || distance > 3) continue;
          if (distance <= shortest) continue;

          closest = name;
          shortest = distance;
        }

        let msg;
        if (closest) {
          msg = messages.get("undeclaredVariableSuggestion", variableName, closest);
        } else {
          msg = messages.get("undeclaredVariable", variableName);
        }

        throw path.buildCodeFrameError(msg, ReferenceError);
      }
    }
  };
};

var _leven = require("leven");
var _predefinedEnvs = require("globals");

var _leven2 = _interopRequireDefault(_leven);
var _predefinedEnvs2 = _interopRequireDefault(_predefinedEnvs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports["default"];