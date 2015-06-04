var deps = {
    "/compiler": [
      "/compiler/project",
      "/utils/files"
    ],
    "/acorn": [
      "/acorn/src",
      "/acorn/plugins/flow",
      "acorn-jsx/inject"
    ],
    "/acorn/src/expression": [
      "/acorn/src/tokentype",
      "/acorn/src/state",
      "/acorn/src/identifier",
      "/acorn/src/util"
    ],
    "/acorn/src": [
      "/acorn/src/state",
      "/acorn/src/options",
      "/acorn/src/parseutil",
      "/acorn/src/statement",
      "/acorn/src/lval",
      "/acorn/src/expression",
      "/acorn/src/lookahead",
      "/acorn/src/location",
      "/acorn/src/node",
      "/acorn/src/tokentype",
      "/acorn/src/tokencontext",
      "/acorn/src/identifier",
      "/acorn/src/tokenize",
      "/acorn/src/whitespace"
    ],
    "/acorn/src/location": [
      "/acorn/src/state",
      "/acorn/src/whitespace"
    ],
    "/acorn/src/lookahead": [
      "/acorn/src/state"
    ],
    "/acorn/src/lval": [
      "/acorn/src/tokentype",
      "/acorn/src/state",
      "/acorn/src/identifier",
      "/acorn/src/util"
    ],
    "/acorn/src/node": [
      "/acorn/src/state",
      "/acorn/src/location"
    ],
    "/acorn/src/options": [
      "/acorn/src/util",
      "/acorn/src/location"
    ],
    "/acorn/src/parseutil": [
      "/acorn/src/tokentype",
      "/acorn/src/state",
      "/acorn/src/whitespace"
    ],
    "/acorn/src/state": [
      "/acorn/src/identifier",
      "/acorn/src/tokentype"
    ],
    "/acorn/src/statement": [
      "/acorn/src/tokentype",
      "/acorn/src/state",
      "/acorn/src/whitespace"
    ],
    "/acorn/src/tokencontext": [
      "/acorn/src/state",
      "/acorn/src/tokentype",
      "/acorn/src/whitespace"
    ],
    "/acorn/src/tokenize": [
      "/acorn/src/identifier",
      "/acorn/src/tokentype",
      "/acorn/src/state",
      "/acorn/src/location",
      "/acorn/src/whitespace"
    ],
    "/babel/messages": [
      "util"
    ],
    "/babel/patch": [
      "estraverse",
      "lodash/object/extend",
      "ast-types",
      "/babel/types"
    ],
    "/babel/polyfill": [
      "core-js/shim",
      "regenerator/runtime"
    ],
    "/babel/util": [
      "/babel/patch",
      "lodash/string/escapeRegExp",
      "debug/node",
      "lodash/lang/cloneDeep",
      "lodash/lang/isBoolean",
      "/babel/messages",
      "minimatch",
      "lodash/collection/contains",
      "/babel/traversal",
      "lodash/lang/isString",
      "lodash/lang/isRegExp",
      "module",
      "lodash/lang/isEmpty",
      "/babel/helpers/parse",
      "path",
      "lodash/collection/each",
      "lodash/object/has",
      "fs",
      "/babel/types",
      "slash",
      "util"
    ],
    "/babel/api/node": [
      "lodash/lang/isFunction",
      "/babel/transformation",
      "/acorn",
      "/babel/util",
      "fs",
      "/babel/transformation/file/options",
      "/babel/transformation/transformer",
      "/babel/transformation/transformer-pipeline",
      "/babel/traversal",
      "/babel/tools/build-external-helpers",
      "/package",
      "/babel/types"
    ],
    "/babel/api/register/browser": [
      "/babel/polyfill"
    ],
    "/babel/api/register/cache": [
      "path",
      "os",
      "fs",
      "user-home"
    ],
    "/babel/api/register/node-polyfill": [
      "/babel/polyfill",
      "/babel/api/register/node"
    ],
    "/babel/api/register/node": [
      "source-map-support",
      "/babel/api/register/cache",
      "/babel/tools/resolve-rc",
      "lodash/object/extend",
      "/babel/api/node",
      "lodash/collection/each",
      "/babel/util",
      "fs",
      "slash"
    ],
    "/babel/generation/buffer": [
      "repeating",
      "trim-right",
      "lodash/lang/isBoolean",
      "lodash/collection/includes",
      "lodash/lang/isNumber"
    ],
    "/babel/generation": [
      "detect-indent",
      "/babel/generation/whitespace",
      "repeating",
      "/babel/generation/source-map",
      "/babel/generation/position",
      "/babel/messages",
      "/babel/generation/buffer",
      "lodash/object/extend",
      "lodash/collection/each",
      "/babel/generation/node",
      "/babel/types"
    ],
    "/babel/generation/source-map": [
      "source-map",
      "/babel/types"
    ],
    "/babel/generation/whitespace": [
      "lodash/collection/sortBy"
    ],
    "/babel/generation/generators/expressions": [
      "is-integer",
      "lodash/lang/isNumber",
      "/babel/types"
    ],
    "/babel/generation/generators/flow": [
      "/babel/types"
    ],
    "/babel/generation/generators/jsx": [
      "lodash/collection/each",
      "/babel/types"
    ],
    "/babel/generation/generators/methods": [
      "/babel/types"
    ],
    "/babel/generation/generators/modules": [
      "lodash/collection/each",
      "/babel/types"
    ],
    "/babel/generation/generators/statements": [
      "repeating",
      "/babel/types"
    ],
    "/babel/generation/generators/template-literals": [
      "lodash/collection/each"
    ],
    "/babel/generation/generators/types": [
      "lodash/collection/each"
    ],
    "/babel/generation/node": [
      "/babel/generation/node/whitespace",
      "/babel/generation/node/parentheses",
      "lodash/collection/each",
      "lodash/collection/some",
      "/babel/types"
    ],
    "/babel/generation/node/parentheses": [
      "lodash/collection/each",
      "/babel/types"
    ],
    "/babel/generation/node/whitespace": [
      "lodash/lang/isBoolean",
      "lodash/collection/each",
      "lodash/collection/map",
      "/babel/types"
    ],
    "/babel/helpers/code-frame": [
      "line-numbers",
      "repeating",
      "js-tokens",
      "esutils",
      "chalk"
    ],
    "/babel/helpers/normalize-ast": [
      "/babel/types"
    ],
    "/babel/helpers/parse": [
      "/babel/helpers/normalize-ast",
      "estraverse",
      "/acorn"
    ],
    "/babel/tools/build-external-helpers": [
      "/babel/generation",
      "/babel/messages",
      "/babel/util",
      "/babel/transformation/file",
      "lodash/collection/each",
      "/babel/types"
    ],
    "/babel/tools/resolve-rc": [
      "strip-json-comments",
      "lodash/object/merge",
      "path",
      "fs"
    ],
    "/babel/transformation": [
      "/babel/transformation/transformer-pipeline",
      "/babel/transformation/transformers",
      "/babel/transformation/transformers/deprecated",
      "/babel/transformation/transformers/aliases",
      "/babel/transformation/transformers/filters"
    ],
    "/babel/transformation/transformer-pass": [
      "lodash/collection/includes",
      "/babel/traversal"
    ],
    "/babel/transformation/transformer-pipeline": [
      "/babel/transformation/transformer",
      "/babel/helpers/normalize-ast",
      "lodash/object/assign",
      "/babel/helpers/object",
      "/babel/transformation/file"
    ],
    "/babel/transformation/transformer": [
      "/babel/transformation/transformer-pass",
      "/babel/messages",
      "lodash/lang/isFunction",
      "/babel/traversal",
      "lodash/lang/isObject",
      "lodash/object/assign",
      "/acorn",
      "/babel/transformation/file",
      "lodash/collection/each"
    ],
    "/babel/transformation/file": [
      "convert-source-map",
      "/babel/transformation/file/option-parsers",
      "/babel/transformation/modules",
      "/babel/transformation/file/plugin-manager",
      "shebang-regex",
      "/babel/traversal/path",
      "lodash/lang/isFunction",
      "path-is-absolute",
      "/babel/tools/resolve-rc",
      "source-map",
      "/babel/transformation",
      "/babel/generation",
      "/babel/helpers/stringify-ast",
      "/babel/helpers/code-frame",
      "lodash/object/defaults",
      "lodash/collection/includes",
      "/babel/traversal",
      "lodash/object/assign",
      "/babel/transformation/file/logger",
      "/babel/helpers/parse",
      "/babel/traversal/scope",
      "slash",
      "lodash/lang/clone",
      "/babel/util",
      "/babel/api/node",
      "path",
      "lodash/collection/each",
      "/babel/types"
    ],
    "/babel/transformation/file/logger": [
      "/babel/util"
    ],
    "/babel/transformation/file/option-parsers": [
      "/babel/util"
    ],
    "/babel/transformation/file/plugin-manager": [
      "/babel/api/node",
      "/babel/messages",
      "/babel/util"
    ],
    "/babel/transformation/helpers/build-binary-assignment-operator-transformer": [
      "/babel/transformation/helpers/explode-assignable-expression",
      "/babel/types"
    ],
    "/babel/transformation/helpers/build-comprehension": [
      "/babel/types"
    ],
    "/babel/transformation/helpers/build-conditional-assignment-operator-transformer": [
      "/babel/transformation/helpers/explode-assignable-expression",
      "/babel/types"
    ],
    "/babel/transformation/helpers/build-react-transformer": [
      "lodash/lang/isString",
      "/babel/messages",
      "esutils",
      "/babel/transformation/helpers/react",
      "/babel/types"
    ],
    "/babel/transformation/helpers/call-delegate": [
      "/babel/traversal",
      "/babel/types"
    ],
    "/babel/transformation/helpers/define-map": [
      "lodash/lang/cloneDeep",
      "/babel/traversal",
      "lodash/collection/each",
      "lodash/object/has",
      "/babel/types"
    ],
    "/babel/transformation/helpers/explode-assignable-expression": [
      "/babel/types"
    ],
    "/babel/transformation/helpers/get-function-arity": [
      "/babel/types"
    ],
    "/babel/transformation/helpers/memoise-decorators": [
      "/babel/types"
    ],
    "/babel/transformation/helpers/name-method": [
      "/babel/transformation/helpers/get-function-arity",
      "/babel/util",
      "/babel/types"
    ],
    "/babel/transformation/helpers/react": [
      "lodash/lang/isString",
      "/babel/types"
    ],
    "/babel/transformation/helpers/regex": [
      "lodash/array/pull",
      "/babel/types"
    ],
    "/babel/transformation/helpers/remap-async-to-generator": [
      "/babel/types"
    ],
    "/babel/transformation/helpers/replace-supers": [
      "/babel/messages",
      "/babel/types"
    ],
    "/babel/transformation/helpers/strict": [
      "/babel/types"
    ],
    "/babel/transformation/modules/_default": [
      "/babel/messages",
      "/babel/traversal",
      "lodash/object/extend",
      "/babel/helpers/object",
      "/babel/util",
      "/babel/types"
    ],
    "/babel/transformation/modules/_strict": [
      "/babel/util"
    ],
    "/babel/transformation/modules/amd-strict": [
      "/babel/transformation/modules/amd",
      "/babel/transformation/modules/_strict"
    ],
    "/babel/transformation/modules/amd": [
      "/babel/transformation/modules/_default",
      "/babel/transformation/modules/common",
      "lodash/collection/includes",
      "lodash/object/values",
      "/babel/util",
      "/babel/types"
    ],
    "/babel/transformation/modules/asx-strict": [
      "/babel/transformation/modules/asx",
      "/babel/transformation/modules/_strict"
    ],
    "/babel/transformation/modules/asx": [
      "/babel/transformation/modules/_default",
      "/babel/transformation/modules/common",
      "lodash/collection/includes",
      "lodash/object/values",
      "/babel/util",
      "/babel/types"
    ],
    "/babel/transformation/modules/common-strict": [
      "/babel/transformation/modules/common",
      "/babel/transformation/modules/_strict"
    ],
    "/babel/transformation/modules/common": [
      "/babel/transformation/modules/_default",
      "lodash/collection/includes",
      "/babel/util",
      "/babel/types"
    ],
    "/babel/transformation/modules/ignore": [
      "/babel/types"
    ],
    "/babel/transformation/modules/system": [
      "/babel/transformation/modules/_default",
      "/babel/transformation/modules/amd",
      "/babel/util",
      "lodash/array/last",
      "lodash/collection/each",
      "lodash/collection/map",
      "/babel/types"
    ],
    "/babel/transformation/modules/umd-strict": [
      "/babel/transformation/modules/umd",
      "/babel/transformation/modules/_strict"
    ],
    "/babel/transformation/modules/umd": [
      "/babel/transformation/modules/_default",
      "/babel/transformation/modules/amd",
      "lodash/object/values",
      "path",
      "/babel/util",
      "/babel/types"
    ],
    "/babel/transformation/transformers/filters": [
      "lodash/collection/includes"
    ],
    "/babel/transformation/transformers/es3/member-expression-literals": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/es3/property-literals": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/es5/properties.mutators": [
      "/babel/transformation/helpers/define-map",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/arrow-functions": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/block-scoping": [
      "/babel/traversal",
      "/babel/helpers/object",
      "/babel/util",
      "/babel/types",
      "lodash/object/values",
      "lodash/object/extend"
    ],
    "/babel/transformation/transformers/es6/classes-old": [
      "/babel/transformation/helpers/memoise-decorators",
      "/babel/transformation/helpers/replace-supers",
      "/babel/transformation/helpers/name-method",
      "/babel/transformation/helpers/define-map",
      "/babel/messages",
      "/babel/util",
      "/babel/traversal",
      "lodash/collection/each",
      "lodash/object/has",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/classes": [
      "/babel/transformation/helpers/memoise-decorators",
      "/babel/transformation/helpers/replace-supers",
      "/babel/transformation/helpers/name-method",
      "/babel/transformation/helpers/define-map",
      "/babel/messages",
      "/babel/util",
      "/babel/traversal",
      "lodash/collection/each",
      "lodash/object/has",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/constants": [
      "/babel/messages",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/destructuring": [
      "/babel/messages",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/for-of": [
      "/babel/messages",
      "/babel/util",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/modules": [
      "/babel/types",
      "/babel/transformation/transformers/internal/modules"
    ],
    "/babel/transformation/transformers/es6/object-super": [
      "/babel/transformation/helpers/replace-supers",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/parameters.default": [
      "/babel/transformation/helpers/call-delegate",
      "/babel/util",
      "/babel/traversal",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/parameters.rest": [
      "lodash/lang/isNumber",
      "/babel/util",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/properties.computed": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/properties.shorthand": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/regex.sticky": [
      "/babel/transformation/helpers/regex",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/regex.unicode": [
      "regexpu/rewrite-pattern",
      "/babel/transformation/helpers/regex"
    ],
    "/babel/transformation/transformers/es6/spec.block-scoping": [
      "/babel/traversal",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/spec.symbols": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/spec.template-literals": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/spread": [
      "lodash/collection/includes",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/tail-call": [
      "lodash/collection/reduceRight",
      "/babel/messages",
      "lodash/array/flatten",
      "/babel/traversal",
      "/babel/util",
      "lodash/collection/map",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es6/template-literals": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/es7/comprehensions": [
      "/babel/transformation/helpers/build-comprehension",
      "/babel/traversal",
      "/babel/util",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es7/decorators": [
      "/babel/transformation/helpers/memoise-decorators",
      "/babel/transformation/helpers/define-map",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es7/do-expressions": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/es7/exponentiation-operator": [
      "/babel/transformation/helpers/build-binary-assignment-operator-transformer",
      "/babel/types"
    ],
    "/babel/transformation/transformers/es7/export-extensions": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/es7/object-rest-spread": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/internal/block-hoist": [
      "lodash/collection/sortBy"
    ],
    "/babel/transformation/transformers/internal/module-formatter": [
      "/babel/transformation/helpers/strict"
    ],
    "/babel/transformation/transformers/internal/modules": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/internal/shadow-functions": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/internal/strict": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/internal/validation": [
      "/babel/messages",
      "/babel/types"
    ],
    "/babel/transformation/transformers/minification/dead-code-elimination": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/minification/member-expression-literals": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/minification/property-literals": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/optimisation/flow.for-of": [
      "/babel/transformation/transformers/es6/for-of",
      "/babel/types"
    ],
    "/babel/transformation/transformers/optimisation/react.constant-elements": [
      "/babel/transformation/helpers/react"
    ],
    "/babel/transformation/transformers/optimisation/react.inline-elements": [
      "/babel/transformation/helpers/react",
      "/babel/types"
    ],
    "/babel/transformation/transformers/other/async-to-generator": [
      "/babel/transformation/helpers/remap-async-to-generator",
      "/babel/transformation/transformers/other/bluebird-coroutines"
    ],
    "/babel/transformation/transformers/other/bluebird-coroutines": [
      "/babel/transformation/helpers/remap-async-to-generator",
      "/babel/types"
    ],
    "/babel/transformation/transformers/other/flow": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/other/jscript": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/other/ludicrous": [
      "/babel/types",
      "/babel/util"
    ],
    "/babel/transformation/transformers/other/react-compat": [
      "/babel/transformation/helpers/react",
      "/babel/types"
    ],
    "/babel/transformation/transformers/other/react": [
      "/babel/transformation/helpers/react",
      "/babel/types"
    ],
    "/babel/transformation/transformers/other/regenerator": [
      "regenerator",
      "/babel/types"
    ],
    "/babel/transformation/transformers/other/strict": [
      "/babel/messages",
      "/babel/types"
    ],
    "/babel/transformation/transformers/other/runtime": [
      "lodash/collection/includes",
      "/babel/traversal",
      "/babel/util",
      "lodash/object/has",
      "/babel/types",
      "/babel/transformation/transformers/other/runtime/definitions"
    ],
    "/babel/transformation/transformers/spec/block-scoped-functions": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/spec/function-name": [
      "/babel/transformation/helpers/name-method"
    ],
    "/babel/transformation/transformers/spec/proto-to-assign": [
      "/babel/types",
      "lodash/array/pull"
    ],
    "/babel/transformation/transformers/spec/undefined-to-void": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/utility/inline-environment-variables": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/utility/inline-expressions": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/utility/remove-console": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/utility/remove-debugger": [
      "/babel/types"
    ],
    "/babel/transformation/transformers/validation/react": [
      "/babel/messages",
      "/babel/types"
    ],
    "/babel/transformation/transformers/validation/undeclared-variable-check": [
      "leven",
      "/babel/messages"
    ],
    "/babel/traversal/binding": [
      "/babel/types"
    ],
    "/babel/traversal/context": [
      "/babel/traversal/path",
      "lodash/array/compact",
      "/babel/types"
    ],
    "/babel/traversal": [
      "/babel/traversal/context",
      "/babel/traversal/visitors",
      "/babel/messages",
      "lodash/collection/includes",
      "/babel/types"
    ],
    "/babel/traversal/scope": [
      "lodash/collection/includes",
      "/babel/traversal/visitors",
      "/babel/traversal",
      "lodash/object/defaults",
      "/babel/messages",
      "/babel/traversal/binding",
      "globals",
      "lodash/array/flatten",
      "lodash/object/extend",
      "/babel/helpers/object",
      "lodash/collection/each",
      "/babel/types"
    ],
    "/babel/traversal/visitors": [
      "/babel/traversal/path/virtual-types",
      "/babel/messages",
      "/babel/types",
      "esquery"
    ],
    "/babel/traversal/path/conversion": [
      "/babel/types"
    ],
    "/babel/traversal/path/hoister": [
      "/babel/transformation/helpers/react",
      "/babel/types"
    ],
    "/babel/traversal/path": [
      "/babel/traversal/path/hoister",
      "/babel/traversal/path/virtual-types",
      "lodash/lang/isBoolean",
      "lodash/lang/isNumber",
      "lodash/lang/isRegExp",
      "lodash/lang/isString",
      "/babel/helpers/code-frame",
      "/babel/helpers/parse",
      "/babel/traversal/visitors",
      "/babel/traversal",
      "lodash/collection/includes",
      "lodash/object/assign",
      "lodash/object/extend",
      "/babel/traversal/scope",
      "/babel/types"
    ],
    "/babel/traversal/path/virtual-types": [
      "/babel/types"
    ],
    "/babel/types/converters": [
      "lodash/lang/isPlainObject",
      "lodash/lang/isNumber",
      "lodash/lang/isRegExp",
      "lodash/lang/isString",
      "/babel/traversal",
      "lodash/collection/each",
      "/babel/types"
    ],
    "/babel/types": [
      "to-fast-properties",
      "lodash/array/compact",
      "lodash/object/assign",
      "lodash/collection/each",
      "lodash/array/uniq"
    ],
    "/babel/types/retrievers": [
      "/babel/helpers/object",
      "/babel/types"
    ],
    "/babel/types/validators": [
      "lodash/lang/isString",
      "esutils",
      "/babel/types"
    ],
    "/compiler/project": [
      "/babel/transformation",
      "/utils/files"
    ],
    "/utils/files": [
      "fs",
      "path"
    ]
  };

function travel(key,collect){
  collect[key] = true;
  if(deps[key]){
    for(var c=0;c<deps[key].length;c++){
      var k = deps[key][c];
      if(!collect[k]){
        travel(k,collect);
      }

    }
  }
}

var flat = {}

Object.keys(deps).forEach(function(k){
  deps[k].forEach(function(d){
    if(!deps[d]){
      deps[d] = [];
    }
  })
})
Object.keys(deps).forEach(function(k){
  var f = {};
  travel(k,f);
  flat[k]= Object.keys(f);
})


console.info(flat['/babel/api/node'].length);
console.info(flat['/compiler'].length);
console.info(Object.keys(deps).filter(function(k){
  return flat['/babel/api/node'].indexOf(k)==-1
}).sort());

