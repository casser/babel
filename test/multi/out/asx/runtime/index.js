(function () {
  var global = this;
  var locker = {};
  var modules = Object.create(null);

  function Definer(module) {
    this.c$ = this.defineClass.bind(module);
  }

  Definer.prototype.defineClass = function defineClass(def) {
    var name = def.name.substring(2);
    var scope = this.scope;

    function declare(D) {
      var C = D['#constructor'];
      var P = D['#extend'];
      var N = D['#override'];

      if (!C) {
        C = global[name];
      }

      if (N) {
        switch (N) {
          case 'local':
            Object.defineProperty(scope, name, {
              configurable: true,
              value: C = C || scope[name]
            });
            break;

          case 'global':
            Object.defineProperty(global, name, {
              configurable: true,
              value: C = C || global[name]
            });
            break;
        }
      }

      if (P) {
        extend(C, P);
      }

      Object.keys(D).forEach(function (k) {
        var x = {
          configurable: true,
          writable: true
        };
        var h;
        var d = D[k];
        var s = k.charAt(0);
        var n = k.substring(1);

        if (s == '.' || s == ':') {
          h = s == ':' ? C : C.prototype;

          if (d['#f']) {
            x.value = d['#f'];
            x.enumerable = false;
            x.writable = false;
          } else if (d['#v'] || d['#g'] || d['#s']) {
            x.enumerable = true;

            if (d['#g'] || d['#s']) {
              delete x.writable;

              if (d['#g']) {
                x.get = d['#g'];
              }

              if (d['#s']) {
                x.set = d['#s'];
              }
            } else {
              if (d['#v']) {
                x.value = d['#v']();
              }
            }
          } else {}

          Object.defineProperty(h, n, x);
        }
      });
      return C;
    }

    function extend(d, b) {
      for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];

      d.__proto__ = b.__proto__;

      function __() {
        this.constructor = d;
      }

      __.prototype = b.prototype;
      d.prototype = new __();
    }

    function definer() {
      var s = {};
      var c = declare(def(s));

      if (c['class'] && c.initialize) {
        c.initialize(s);
      }

      return Object.defineProperty(this, name, {
        value: c
      })[name];
    }

    if (this.scope.hasOwnProperty(name)) {
      Object.defineProperty(this.scope, name, {
        configurable: true,
        value: definer.call(this.scope)
      });
    } else {
      Object.defineProperty(this.scope, name, {
        configurable: true,
        get: definer
      });
    }
  };

  function Module(lock, id) {
    if (lock != locker) {
      throw new Error('Module \'' + id + '\' can\'t be instantiated directly');
    } else if (modules[id]) {
      throw new Error('Module \'' + id + '\' already defined');
    } else {
      Object.defineProperty(this, 'id', {
        value: id
      });
      Object.defineProperty(modules, id, {
        configurable: false,
        writable: false,
        enumerable: true,
        value: this
      });
      this.prepare();
    }
  }

  Module.get = function (id) {
    id = this.normalize(id);

    if (modules[id]) {
      return modules[id];
    } else {
      return new Module(locker, id);
    }
  };

  Module.normalize = function normalize(name) {
    var id = name;
    id = id.replace(/^(.*)\.js$/, '$1');
    id = id.split('/').filter(function (p) {
      return p.match(/^[A-Z][A-Z0-9_\-]*$/i);
    });

    if (id.length < 2) {
      throw new Error('Invalid Module Id ' + name);
    } else if (id.length == 2) {
      id.push('index');
    }

    return id.join('/');
  };

  Module.prototype.prepare = function prepare() {
    this.scope = {
      Module: Module,
      Runtime: Runtime,
      Asx: Runtime.Asx
    };
  };

  Module.prototype.initialize = function initialize(def) {
    def = def.bind(this.scope)(this);
    this.imports = def.imports;
    this.exports = def.exports;
    this.definer = def.execute;
    this.doImports();
    return this;
  };

  Module.prototype.doImports = function doImports() {
    delete this.imports;
    this.doExecute();
  };

  Module.prototype.doExecute = function doExecute() {
    Object.defineProperty(this, 'exports', {
      value: this.definer.call(this.scope, new Definer(this))
    });
    delete this.definer;
    this.doExports();
  };

  Module.prototype.doExports = function doExports() {
    this.finalize();
  };

  Module.prototype.finalize = function finalize() {
    if (this.onComplete) {
      var onComplete = this.onComplete;
      delete this.onComplete;
      onComplete();
    }
  };

  function Runtime() {
    if (!global.Asx) {
      if (typeof require == 'function') {
        Object.defineProperty(this, 'require', {
          value: require
        });
      }

      Object.defineProperty(this, 'modules', {
        value: modules
      });
      Object.defineProperty(Runtime, 'global', {
        value: global
      });
      Object.defineProperty(Runtime, 'Asx', {
        value: this
      });
      Object.defineProperty(global, 'Asx', {
        value: this
      });
      return this;
    } else {
      return global.Asx;
    }
  }

  Runtime.prototype.define = function define(name, def) {
    return Module.get(name).initialize(def);
  };

  return new Runtime();
})()

Asx.define('asx/runtime/index', function (module) {
  with (this) {
    return {
      'imports': {
        runtime: '*'
      },
      'execute': function (asx) {
        asx.c$(function c$Class(_class) {
          return {
            '#override': 'global',
            '#constructor': function Class(constructor) {
              if (!(this instanceof Class)) {
                return new Class(constructor);
              } else if (typeof constructor == 'function') {
                var desc = Object.getOwnPropertyDescriptor(constructor, 'class');
                if (desc && desc.value instanceof Class) {
                  return desc.value;
                } else {
                  Object.defineProperty(this, 'constructor', {
                    value: constructor
                  });
                  Object.defineProperty(constructor, 'class', {
                    value: this
                  });

                  if (typeof this.initialize == 'function') {
                    this.initialize();
                  }
                }
              } else {
                throw new Error('Invalid class constructor');
              }
            },
            '#decorators': [],
            ':class': {
              '#g': function class_getter() {
                return Object.defineProperty(this, 'class', {
                  value: new this(this)
                })['class'];
              }
            },
            '.parent': {
              '#g': function parent_getter() {
                if (this.constructor == Object) {
                  return Object.defineProperty(this, 'parent', {
                    enumerable: false,
                    configurable: false,
                    value: false
                  }).parent;
                } else {
                  return Object.defineProperty(this, 'parent', {
                    enumerable: false,
                    configurable: true,
                    value: Object.getPrototypeOf(this.constructor.prototype).constructor['class']
                  }).parent;
                }
              }
            },
            '.name': {
              '#g': function name_getter() {
                return this.constructor.name;
              }
            },
            '.initialize': {
              '#f': function initialize() {
                var _this = this;

                var ms = Object.getOwnPropertyNames(this.constructor);
                var mi = Object.getOwnPropertyNames(this.constructor.prototype);
                ms.forEach(function (key) {
                  return Member.get(_this, ':' + key);
                });
                mi.forEach(function (key) {
                  return Member.get(_this, '.' + key);
                });
              }
            },
            '.defaults': {
              '#f': function defaults(scope) {}
            }
          };
        })
        asx.c$(function c$Function(_class) {
          return {
            '#decorators': [],
            '.class': {
              '#g': function class_getter() {
                return new Class(this);
              }
            }
          };
        })
        asx.c$(function c$String(_class) {
          return {
            '#decorators': [],
            ':isString': {
              '#f': function isString(obj) {
                return typeof obj === 'string';
              }
            }
          };
        })
        asx.c$(function c$Member(_class) {
          return {
            '#constructor': function Member(owner, key) {
              this.owner = owner;
              this.key = key;
            },
            ':HIDDEN': {
              '#v': function () {
                return 1;
              }
            },
            ':FINAL': {
              '#v': function () {
                return 2;
              }
            },
            ':CONSTANT': {
              '#v': function () {
                return 4;
              }
            },
            ':NATIVE': {
              '#v': function () {
                return 8;
              }
            },
            ':STATIC': {
              '#v': function () {
                return 16;
              }
            },
            ':EXTENDED': {
              '#v': function () {
                return 32;
              }
            },
            ':isStatic': {
              '#f': function isStatic(member) {
                if (member instanceof Member) {
                  member = member.modifiers;
                }
                if (typeof member == 'string') {
                  return member.charAt(0) == ':';
                } else if (typeof member == 'number') {
                  return !!(member & Member.STATIC);
                }
                return false;
              }
            },
            ':get': {
              '#f': function get(owner, key) {
                if (!owner[key]) {
                  owner[key] = new Member(owner, key);
                }
                return owner[key];
              }
            },
            '.key': {},
            '.modifiers': {},
            '.owner': {}
          };
        })
        asx.c$(function c$Path(_class) {
          return {
            '#constructor': function Path() {},
            ':SEP': {
              '#v': function () {
                return '/';
              }
            },
            ':isAbsolute': {
              '#f': function isAbsolute(path) {
                return path.charAt(0) == '/';
              }
            },
            ':dirname': {
              '#f': function dirname(path) {
                var filename = Path.filename(path);
                if (filename.indexOf('.') > 0) {
                  path = path.split(Path.SEP);
                  path.pop();
                  return path.join(Path.SEP);
                }
                return path;
              }
            },
            ':filename': {
              '#f': function filename(path) {
                return path.split(Path.SEP).pop();
              }
            },
            ':rename': {
              '#f': function rename(path, name, ext) {
                var dn = Path.dirname(path);
                var fn;
                if (ext) {
                  if (name.charAt(0) == '.') {
                    name = name.substring(1);
                  }
                  fn = Path.filename(path);
                  fn = fn.split('.');
                  fn.pop();
                  fn.push(name);
                  fn = fn.join('.');
                } else {
                  fn = name;
                }
                return Path.resolve(dn, fn);
              }
            },
            ':normalize': {
              '#f': function normalize(path) {
                if (!path || path === '/') {
                  return '/';
                }
                var prepend = path.charAt(0) == '/' || path.charAt(0) == '.';
                var target = [],
                    src,
                    scheme,
                    parts,
                    token;
                if (path.indexOf('://') > 0) {
                  parts = path.split('://');
                  scheme = parts[0];
                  src = parts[1].split('/');
                } else {
                  src = path.split('/');
                }
                for (var i = 0; i < src.length; ++i) {
                  token = src[i];
                  if (token === '..') {
                    target.pop();
                  } else if (token !== '' && token !== '.') {
                    target.push(token);
                  }
                }
                return (scheme ? scheme + '://' : '') + (prepend ? '/' : '') + target.join('/').replace(/[\/]{2,}/g, '/');
              }
            },
            ':resolve': {
              '#f': function resolve() {
                for (var _len = arguments.length, paths = Array(_len), _key = 0; _key < _len; _key++) {
                  paths[_key] = arguments[_key];
                }

                var current = paths.shift();
                paths.forEach(function (path) {
                  if (Path.isAbsolute(path)) {
                    current = path;
                  } else {
                    current = Path.normalize(current + '/' + path);
                  }
                });
                return current;
              }
            }
          };
        })
        asx.c$(function c$Url(_class) {
          return {
            '#constructor': function Url(url) {
              Object.defineProperty(this, '$', { value: {} });
              if (typeof url == 'string') {
                this.href = url;
              }
            },
            ':parse': {
              '#f': function parse(str) {
                return new Url(str);
              }
            },
            ':resolve': {
              '#f': function resolve(url, path) {
                if (!(url instanceof Url)) {
                  url = new Url(url);
                }
                return new Url(url.toString()).update({
                  pathname: Path.resolve(url.pathname, path)
                });
              }
            },
            '.href': {
              '#g': function href_getter() {
                return this.protocol + '//' + (this.credentials ? this.credentials + '@' : '') + this.host + this.pathname + this.search + this.hash;
              },
              '#s': function href_setter(v) {
                var i = v.indexOf('#');
                if (i > 0) {
                  this.hash = v.substring(i);
                  v = v.substring(0, i);
                }
                if (v.indexOf('/') == 0) {
                  v = 'file://' + v;
                }
                i = v.indexOf('//');
                if (i > 0) {
                  this.protocol = v.substring(0, i);
                  v = v.substring(i + 2);
                }
                i = v.indexOf('?');
                if (i > 0) {
                  this.search = v.substring(i);
                  v = v.substring(0, i);
                }
                i = v.indexOf('/');
                if (i == 0 && this.protocol == 'file:') {
                  this.pathname = v;
                } else if (i > 0) {
                  this.host = v.substring(0, i);
                  v = v.substring(i);
                  this.pathname = v;
                } else {
                  this.host = v;
                }
              }
            },
            '.origin': {
              '#g': function origin_getter() {
                return this.protocol + '//' + this.host;
              },
              '#s': function origin_setter(v) {
                var i = v.indexOf('//');
                if (i > 0) {
                  this.protocol = v.substring(0, i);
                  v = v.substring(i + 2);
                }
                i = v.indexOf('/');
                if (i > 0) {
                  this.host = v.substring(0, i);
                }
              }
            },
            '.protocol': {
              '#g': function protocol_getter() {
                return this.$.protocol;
              },
              '#s': function protocol_setter(v) {
                this.$.protocol = v;
              }
            },
            '.credentials': {
              '#g': function credentials_getter() {
                if (this.username || this.password) {
                  return this.username + ':' + this.password;
                } else {
                  return '';
                }
              },
              '#s': function credentials_setter(v) {
                v = v.split(':');
                this.username = v.shift();
                if (v.length) {
                  this.password = v.shift();
                }
              }
            },
            '.username': {
              '#g': function username_getter() {
                return this.$.username || '';
              },
              '#s': function username_setter(v) {
                this.$.username = v;
              }
            },
            '.password': {
              '#g': function password_getter() {
                return this.$.password || '';
              },
              '#s': function password_setter(v) {
                this.$.password = v;
              }
            },
            '.host': {
              '#g': function host_getter() {
                if (this.port) {
                  return this.hostname + ':' + this.port;
                } else {
                  return this.hostname;
                }
              },
              '#s': function host_setter(v) {
                if (v) {
                  var host = v.split('@');
                  if (host.length > 1) {
                    this.credentials = host.shift();
                  }
                  host = host.shift().split(':');
                  this.hostname = host.shift();
                  this.port = host.shift();
                } else {
                  delete this.$.host;
                }
              }
            },
            '.hostname': {
              '#g': function hostname_getter() {
                return this.$.hostname || '';
              },
              '#s': function hostname_setter(v) {
                this.$.hostname = v;
              }
            },
            '.port': {
              '#g': function port_getter() {
                return this.$.port || '';
              },
              '#s': function port_setter(v) {
                if (v) {
                  this.$.port = parseInt(v);
                } else {
                  delete this.$.port;
                }
              }
            },
            '.pathname': {
              '#g': function pathname_getter() {
                return this.$.pathname || '/';
              },
              '#s': function pathname_setter(v) {
                this.$.pathname = Path.normalize(v);
              }
            },
            '.filename': {
              '#g': function filename_getter() {
                return Path.filename(this.pathname);
              },
              '#s': function filename_setter(v) {
                this.pathname = Path.resolve(this.pathname, '..', Path.filename(v));
              }
            },
            '.search': {
              '#g': function search_getter() {
                var pairs = [];
                for (var i in this.query) {
                  pairs.push(i + '=' + this.query[i]);
                }
                if (pairs.length) {
                  return '?' + pairs.sort().join('&');
                } else {
                  return '';
                }
              },
              '#s': function search_setter(v) {
                if (v.indexOf('?') == 0) {
                  this.query = v.substring(1);
                } else {
                  this.query = v;
                }
              }
            },
            '.query': {
              '#g': function query_getter() {
                return this.$.query || (this.$.query = {});
              },
              '#s': function query_setter(v) {
                var _this2 = this;

                if (!this.$.query) {
                  this.$.query = {};
                }
                v.split('&').forEach(function (pair) {
                  pair = pair.split('=');
                  _this2.$.query[pair[0].trim()] = pair[1].trim();
                });
              }
            },
            '.hash': {
              '#g': function hash_getter() {
                return this.$.hash || '';
              },
              '#s': function hash_setter(v) {
                this.$.hash = v;
              }
            },
            '.update': {
              '#f': function update(url) {
                if (typeof url == 'string') {
                  url = new Url(url);
                }
                if (url.query) {
                  for (var key in url.query) {
                    this.query[key] = url.query[key];
                  }
                }
                if (url.origin) {
                  this.origin = url.origin;
                }
                if (url.pathname) {
                  this.pathname = Path.resolve(this.pathname, url.pathname);
                }
                if (url.hash) {
                  this.hash = url.hash;
                }
                return this;
              }
            },
            '.resolve': {
              '#f': function resolve(path) {
                return Url.resolve(this, path);
              }
            },
            '.inspect': {
              '#f': function inspect() {
                return {
                  href: this.href,
                  origin: this.origin,
                  protocol: this.protocol,
                  credentials: this.credentials,
                  username: this.username,
                  password: this.password,
                  host: this.host,
                  hostname: this.hostname,
                  port: this.port,
                  pathname: this.pathname,
                  filename: this.filename,
                  search: this.search,
                  query: this.query,
                  hash: this.hash
                };
              }
            },
            '.toString': {
              '#f': function toString() {
                return this.href;
              }
            },
            '.toJSON': {
              '#f': function toJSON() {
                return this.toString();
              }
            }
          };
        })
        asx.c$(function c$Loader(_class) {
          return {
            '#constructor': function Loader() {},
            ':load': {
              '#f': function load(path) {
                switch (Asx.platform) {
                  case Runtime.NODE:
                    return require('fs').readFileSync(Url.parse(path).pathname, 'utf8');

                  case Runtime.BROWSER:
                    var request = new XMLHttpRequest();
                    request.open('GET', path, false);
                    request.send();
                    if (request.status != 200) {
                      throw new Error('File not found ' + path);
                    }
                    return request.responseText;
                }
              }
            }
          };
        })
        asx.c$(function c$Module(_class) {
          return {
            '#override': 'local',
            '#decorators': [],
            ':paths': {
              '#f': function paths(module) {
                return [Asx.repository.resolve(Module.path(module))];
              }
            },
            ':path': {
              '#f': function path(module) {
                return module.id + '.js';
              }
            },
            '.prepare': {
              '#f': function prepare() {
                this.pending = true;
                if (!this.scope) {
                  this.scope = {};
                }
              }
            },
            '.load': {
              '#f': function load() {
                var script,
                    paths = Module.paths(this);
                for (var i = 0, path; i < paths.length; i++) {
                  path = paths[i].toString();
                  try {
                    script = Loader.load(path);
                    break;
                  } catch (ex) {
                    console.error(ex);
                  }
                }
                if (script) {
                  this.script = script;
                  this.evaluate();
                } else {
                  throw new Error('Module Not Available ' + this.id, paths);
                }
              }
            },
            '.evaluate': {
              '#f': function evaluate() {
                switch (Runtime.Asx.platform) {
                  case Runtime.NODE:
                    return require('vm').runInThisContext(this.script);
                  case Runtime.BROWSER:
                    var Asx = Runtime.Asx;
                    return eval(this.script);
                }
              }
            },
            '.require': {
              '#f': function require(path, targets) {
                var _this3 = this;

                if (path.charAt(0) == '.') {
                  path = Path.resolve(Path.dirname(Module.path(this)), path);
                }
                var child = Module.get(path);
                if (child.pending) {
                  if (Asx.platform == 'node' && child.id.indexOf('node/') == 0) {
                    path = child.id.substring(5).replace(/^(.*)\/index$/, '$1');
                    child.initialize(function () {
                      return {
                        execute: function execute() {
                          return Asx.require(path);
                        }
                      };
                    });
                  } else {
                    child.load();
                  }
                }

                if (typeof targets == 'string') {
                  if (targets == '*') {
                    Object.keys(child.exports).forEach(function (k, n) {
                      _this3.scope[k] = child.exports[k];
                    });
                  } else {
                    this.scope[targets] = child.exports;
                  }
                } else {
                  if (targets['#']) {
                    this.scope[targets['#']] = child.exports;
                    delete targets['#'];
                  } else {
                    console.info('Handle Complex Case', targets);
                  }
                }
                return child;
              }
            },
            '.doImports': {
              '#f': function doImports(imports) {
                var _this4 = this;

                if (this.imports) {
                  Object.keys(this.imports).forEach(function (i) {
                    return _this4.require(i, _this4.imports[i]);
                  });
                }
                this.doExecute();
              }
            },
            '.doExports': {
              '#f': function doExports() {
                delete this.pending;

                this.finalize();
              }
            }
          };
        })
        asx.c$(function c$Runtime(_class) {
          return {
            '#override': 'local',
            '#decorators': [],
            ':NODE': {
              '#v': function () {
                return 'node';
              }
            },
            ':BROWSER': {
              '#v': function () {
                return 'browser';
              }
            },
            ':execute': {
              '#f': function execute() {
                module.onComplete = function () {
                  var main = module.require(Asx.executable, '*');
                  if (main.exports && typeof main.exports.main == 'function') {
                    main.exports.main(['args']);
                  }
                };
              }
            },
            '.platform': {
              '#g': function platform_getter() {
                if (typeof process != 'undefined') {
                  return Runtime.NODE;
                }
                if (typeof window != 'undefined') {
                  return Runtime.BROWSER;
                }
              }
            },
            '.repository': {
              '#g': function repository_getter() {
                var url;
                switch (this.platform) {
                  case Runtime.NODE:
                    url = new Url(__filename);
                    break;
                  case Runtime.BROWSER:
                    url = new Url(document.querySelector('script[main]').src);
                    break;
                }
                return url.resolve('../../../');
              }
            },
            '.executable': {
              '#g': function executable_getter() {
                switch (this.platform) {
                  case Runtime.NODE:
                    return process.argv[2];
                  case Runtime.BROWSER:
                    return document.querySelector('script[main]').getAttribute('main');
                }
              }
            }
          };
        })

        Runtime.execute();
      }
    };
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hc3gvcnVudGltZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FDQVdNLEtBQUssQ0FNRyxXQUFXO0FBQ3JCLGtCQUFJLEVBQUUsSUFBSSxZQUFZLEtBQUssQ0FBQSxBQUFDLEVBQUU7QUFDNUIsdUJBQU8sSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7ZUFDL0IsTUFBTSxJQUFJLE9BQU8sV0FBVyxJQUFJLFVBQVUsRUFBRTtBQUMzQyxvQkFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNqRSxvQkFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssWUFBWSxLQUFLLEVBQUU7QUFDdkMseUJBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztpQkFDbkIsTUFBTTtBQUNMLHdCQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7QUFDekMseUJBQUssRUFBRSxXQUFXO21CQUNuQixDQUFDLENBQUM7QUFDSCx3QkFBTSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFO0FBQzFDLHlCQUFLLEVBQUUsSUFBSTttQkFDWixDQUFDLENBQUM7O0FBRUgsc0JBQUksT0FBTyxJQUFJLENBQUMsVUFBVSxJQUFJLFVBQVUsRUFBRTtBQUN4Qyx3QkFBSSxDQUFDLFVBQVUsRUFBRSxD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LGlCQUN0RTtlQUNGOzs7OztBQUdILGVBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQSIsImZpbGUiOiJhc3gvcnVudGltZS9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU29tZSBNb2R1bGUgRGVzY3JpcHRpb25cbiAqIEBtb2R1bGUge1xuICogIGJpbmQgICAgOiB0cnVlLFxuICogIGV4ZWN1dGUgOiB0cnVlLFxuICogIHJ1bnRpbWUgOiB0cnVlXG4gKiB9XG4gKi9cbmltcG9ydCAncnVudGltZSc7XG5cbkBvdmVycmlkZSgnZ2xvYmFsJylcbmNsYXNzIENsYXNzIHtcbiAgc3RhdGljIGdldCBjbGFzcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdjbGFzcycsIHtcbiAgICAgIHZhbHVlOiBuZXcgdGhpcyh0aGlzKVxuICAgIH0pLmNsYXNzO1xuICB9XG4gIGNvbnN0cnVjdG9yKGNvbnN0cnVjdG9yKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIENsYXNzKSkge1xuICAgICAgcmV0dXJuIG5ldyBDbGFzcyhjb25zdHJ1Y3Rvcik7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgY29uc3RydWN0b3IgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGNvbnN0cnVjdG9yLCAnY2xhc3MnKTtcbiAgICAgIGlmIChkZXNjICYmIGRlc2MudmFsdWUgaW5zdGFuY2VvZiBDbGFzcykge1xuICAgICAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnY29uc3RydWN0b3InLCB7XG4gICAgICAgICAgdmFsdWU6IGNvbnN0cnVjdG9yXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29uc3RydWN0b3IsICdjbGFzcycsIHtcbiAgICAgICAgICB2YWx1ZTogdGhpc1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuaW5pdGlhbGl6ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNsYXNzIGNvbnN0cnVjdG9yJyk7XG4gICAgfVxuICB9XG4gIGdldCBwYXJlbnQoKSB7XG4gICAgaWYgKHRoaXMuY29uc3RydWN0b3IgPT0gT2JqZWN0KSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdwYXJlbnQnLCB7XG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgIH0pLnBhcmVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncGFyZW50Jywge1xuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMuY29uc3RydWN0b3IucHJvdG90eXBlKS5jb25zdHJ1Y3Rvci5jbGFzc1xuICAgICAgfSkucGFyZW50O1xuICAgIH1cbiAgfVxuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG4gIGluaXRpYWxpemUoKSB7XG4gICAgdmFyIG1zOkFycmF5ID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5jb25zdHJ1Y3Rvcik7XG4gICAgdmFyIG1pOkFycmF5ID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5jb25zdHJ1Y3Rvci5wcm90b3R5cGUpO1xuICAgIG1zLmZvckVhY2goa2V5PT5NZW1iZXIuZ2V0KHRoaXMsICc6JyArIGtleSkpO1xuICAgIG1pLmZvckVhY2goa2V5PT5NZW1iZXIuZ2V0KHRoaXMsICcuJyArIGtleSkpO1xuICB9XG4gIGRlZmF1bHRzKHNjb3BlKSB7XG4gICAgLy9jb25zb2xlLmluZm8oc2NvcGUpXG4gIH1cbn1cblxuQG5hdGl2ZVxuY2xhc3MgRnVuY3Rpb24ge1xuICBnZXQgY2xhc3MoKSB7XG4gICAgcmV0dXJuIG5ldyBDbGFzcyh0aGlzKTtcbiAgfVxufVxuQG5hdGl2ZVxuY2xhc3MgU3RyaW5nIHtcbiAgc3RhdGljIGlzU3RyaW5nKG9iaikge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnc3RyaW5nJztcbiAgfVxufVxuXG5jbGFzcyBNZW1iZXIge1xuXG4gIHN0YXRpYyBISURERU4gPSAxO1xuICBzdGF0aWMgRklOQUwgPSAyO1xuICBzdGF0aWMgQ09OU1RBTlQgPSA0O1xuICBzdGF0aWMgTkFUSVZFID0gODtcbiAgc3RhdGljIFNUQVRJQyA9IDE2O1xuICBzdGF0aWMgRVhURU5ERUQgPSAzMjtcblxuICBzdGF0aWMgaXNTdGF0aWMobWVtYmVyKSB7XG4gICAgaWYgKG1lbWJlciBpbnN0YW5jZW9mIE1lbWJlcikge1xuICAgICAgbWVtYmVyID0gbWVtYmVyLm1vZGlmaWVycztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBtZW1iZXIgPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBtZW1iZXIuY2hhckF0KDApID09ICc6JztcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtZW1iZXIgPT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiAhIShtZW1iZXIgJiBNZW1iZXIuU1RBVElDKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3RhdGljIGdldChvd25lcjpDbGFzcywga2V5OlN0cmluZykge1xuICAgIGlmICghb3duZXJba2V5XSkge1xuICAgICAgb3duZXJba2V5XSA9IG5ldyBNZW1iZXIob3duZXIsIGtleSk7XG4gICAgfVxuICAgIHJldHVybiBvd25lcltrZXldO1xuICB9XG5cbiAga2V5OlN0cmluZztcbiAgbW9kaWZpZXJzOk51bWJlcjtcbiAgb3duZXI6Q2xhc3M7XG5cblxuICBjb25zdHJ1Y3Rvcihvd25lcjpDbGFzcywga2V5OlN0cmluZykge1xuICAgIHRoaXMub3duZXIgPSBvd25lcjtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgfVxuXG59XG5jbGFzcyBQYXRoIHtcbiAgc3RhdGljIFNFUCA9ICcvJztcblxuICBzdGF0aWMgaXNBYnNvbHV0ZShwYXRoOlBhdGgpIHtcbiAgICByZXR1cm4gcGF0aC5jaGFyQXQoMCkgPT0gJy8nO1xuICB9XG5cbiAgc3RhdGljIGRpcm5hbWUocGF0aDpQYXRoKSB7XG4gICAgdmFyIGZpbGVuYW1lID0gUGF0aC5maWxlbmFtZShwYXRoKTtcbiAgICBpZiAoZmlsZW5hbWUuaW5kZXhPZignLicpID4gMCkge1xuICAgICAgcGF0aCA9IHBhdGguc3BsaXQoUGF0aC5TRVApO1xuICAgICAgcGF0aC5wb3AoKTtcbiAgICAgIHJldHVybiBwYXRoLmpvaW4oUGF0aC5TRVApO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aDtcbiAgfVxuXG4gIHN0YXRpYyBmaWxlbmFtZShwYXRoOlN0cmluZykge1xuICAgIHJldHVybiBwYXRoLnNwbGl0KFBhdGguU0VQKS5wb3AoKTtcbiAgfVxuXG4gIHN0YXRpYyByZW5hbWUocGF0aDpTdHJpbmcsIG5hbWUsIGV4dCkge1xuICAgIHZhciBkbiA9IFBhdGguZGlybmFtZShwYXRoKTtcbiAgICB2YXIgZm47XG4gICAgaWYgKGV4dCkge1xuICAgICAgaWYgKG5hbWUuY2hhckF0KDApID09ICcuJykge1xuICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgICB9XG4gICAgICBmbiA9IFBhdGguZmlsZW5hbWUocGF0aCk7XG4gICAgICBmbiA9IGZuLnNwbGl0KCcuJyk7XG4gICAgICBmbi5wb3AoKTtcbiAgICAgIGZuLnB1c2gobmFtZSk7XG4gICAgICBmbiA9IGZuLmpvaW4oJy4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm4gPSBuYW1lO1xuICAgIH1cbiAgICByZXR1cm4gUGF0aC5yZXNvbHZlKGRuLCBmbik7XG4gIH1cblxuICBzdGF0aWMgbm9ybWFsaXplKHBhdGg6UGF0aCkge1xuICAgIGlmICghcGF0aCB8fCBwYXRoID09PSAnLycpIHtcbiAgICAgIHJldHVybiAnLyc7XG4gICAgfVxuICAgIHZhciBwcmVwZW5kID0gKHBhdGguY2hhckF0KDApID09ICcvJyB8fCBwYXRoLmNoYXJBdCgwKSA9PSAnLicpO1xuICAgIHZhciB0YXJnZXQgPSBbXSwgc3JjLCBzY2hlbWUsIHBhcnRzLCB0b2tlbjtcbiAgICBpZiAocGF0aC5pbmRleE9mKCc6Ly8nKSA+IDApIHtcbiAgICAgIHBhcnRzID0gcGF0aC5zcGxpdCgnOi8vJyk7XG4gICAgICBzY2hlbWUgPSBwYXJ0c1swXTtcbiAgICAgIHNyYyA9IHBhcnRzWzFdLnNwbGl0KCcvJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNyYyA9IHBhdGguc3BsaXQoJy8nKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcmMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHRva2VuID0gc3JjW2ldO1xuICAgICAgaWYgKHRva2VuID09PSAnLi4nKSB7XG4gICAgICAgIHRhcmdldC5wb3AoKTtcbiAgICAgIH0gZWxzZSBpZiAodG9rZW4gIT09ICcnICYmIHRva2VuICE9PSAnLicpIHtcbiAgICAgICAgdGFyZ2V0LnB1c2godG9rZW4pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgKHNjaGVtZSA/IHNjaGVtZSArICc6Ly8nIDogJycpICtcbiAgICAgIChwcmVwZW5kID8gJy8nIDogJycpICtcbiAgICAgIHRhcmdldC5qb2luKCcvJykucmVwbGFjZSgvW1xcL117Mix9L2csICcvJylcbiAgICApO1xuICB9XG5cbiAgc3RhdGljIHJlc29sdmUoLi4ucGF0aHMpIHtcbiAgICB2YXIgY3VycmVudCA9IHBhdGhzLnNoaWZ0KCk7XG4gICAgcGF0aHMuZm9yRWFjaChwYXRoPT4ge1xuICAgICAgaWYgKFBhdGguaXNBYnNvbHV0ZShwYXRoKSkge1xuICAgICAgICBjdXJyZW50ID0gcGF0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnQgPSBQYXRoLm5vcm1hbGl6ZShjdXJyZW50ICsgJy8nICsgcGF0aClcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY3VycmVudDtcbiAgfVxufVxuY2xhc3MgVXJsIHtcbiAgc3RhdGljIHBhcnNlKHN0cikge1xuICAgIHJldHVybiBuZXcgVXJsKHN0cik7XG4gIH1cbiAgc3RhdGljIHJlc29sdmUodXJsLHBhdGgpe1xuICAgIGlmKCEodXJsIGluc3RhbmNlb2YgVXJsKSl7XG4gICAgICB1cmwgPSBuZXcgVXJsKHVybCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVXJsKHVybC50b1N0cmluZygpKS51cGRhdGUoe1xuICAgICAgcGF0aG5hbWU6UGF0aC5yZXNvbHZlKHVybC5wYXRobmFtZSxwYXRoKVxuICAgIH0pO1xuICB9XG4gIGdldCBocmVmKCkge1xuICAgIHJldHVybiB0aGlzLnByb3RvY29sICsgJy8vJ1xuICAgICAgKyAodGhpcy5jcmVkZW50aWFscyA/IHRoaXMuY3JlZGVudGlhbHMgKyAnQCcgOiAnJylcbiAgICAgICsgdGhpcy5ob3N0XG4gICAgICArIHRoaXMucGF0aG5hbWVcbiAgICAgICsgdGhpcy5zZWFyY2hcbiAgICAgICsgdGhpcy5oYXNoO1xuICB9XG5cbiAgc2V0IGhyZWYodikge1xuICAgIHZhciBpID0gdi5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGkgPiAwKSB7XG4gICAgICB0aGlzLmhhc2ggPSB2LnN1YnN0cmluZyhpKTtcbiAgICAgIHYgPSB2LnN1YnN0cmluZygwLCBpKTtcbiAgICB9XG4gICAgaWYgKHYuaW5kZXhPZignLycpID09IDApIHtcbiAgICAgIHYgPSAnZmlsZTovLycgKyB2O1xuICAgIH1cbiAgICBpID0gdi5pbmRleE9mKCcvLycpO1xuICAgIGlmIChpID4gMCkge1xuICAgICAgdGhpcy5wcm90b2NvbCA9IHYuc3Vic3RyaW5nKDAsIGkpO1xuICAgICAgdiA9IHYuc3Vic3RyaW5nKGkgKyAyKTtcbiAgICB9XG4gICAgaSA9IHYuaW5kZXhPZignPycpO1xuICAgIGlmIChpID4gMCkge1xuICAgICAgdGhpcy5zZWFyY2ggPSB2LnN1YnN0cmluZyhpKTtcbiAgICAgIHYgPSB2LnN1YnN0cmluZygwLCBpKTtcbiAgICB9XG4gICAgaSA9IHYuaW5kZXhPZignLycpO1xuICAgIGlmIChpID09IDAgJiYgdGhpcy5wcm90b2NvbCA9PSAnZmlsZTonKSB7XG4gICAgICB0aGlzLnBhdGhuYW1lID0gdjtcbiAgICB9IGVsc2UgaWYgKGkgPiAwKSB7XG4gICAgICB0aGlzLmhvc3QgPSB2LnN1YnN0cmluZygwLCBpKTtcbiAgICAgIHYgPSB2LnN1YnN0cmluZyhpKTtcbiAgICAgIHRoaXMucGF0aG5hbWUgPSB2O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhvc3QgPSB2O1xuICAgIH1cbiAgICAvLyBub3JtYWxpemUgaG9zdFxuICB9XG5cbiAgZ2V0IG9yaWdpbigpIHtcbiAgICByZXR1cm4gdGhpcy5wcm90b2NvbCArICcvLycgKyB0aGlzLmhvc3Q7XG4gIH1cblxuICBzZXQgb3JpZ2luKHYpIHtcbiAgICB2YXIgaSA9IHYuaW5kZXhPZignLy8nKTtcbiAgICBpZiAoaSA+IDApIHtcbiAgICAgIHRoaXMucHJvdG9jb2wgPSB2LnN1YnN0cmluZygwLCBpKTtcbiAgICAgIHYgPSB2LnN1YnN0cmluZyhpICsgMik7XG4gICAgfVxuICAgIGkgPSB2LmluZGV4T2YoJy8nKTtcbiAgICBpZiAoaSA+IDApIHtcbiAgICAgIHRoaXMuaG9zdCA9IHYuc3Vic3RyaW5nKDAsIGkpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBwcm90b2NvbCgpIHtcbiAgICByZXR1cm4gdGhpcy4kLnByb3RvY29sO1xuICB9XG5cbiAgc2V0IHByb3RvY29sKHYpIHtcbiAgICB0aGlzLiQucHJvdG9jb2wgPSB2O1xuICB9XG5cbiAgZ2V0IGNyZWRlbnRpYWxzKCkge1xuICAgIGlmICh0aGlzLnVzZXJuYW1lIHx8IHRoaXMucGFzc3dvcmQpIHtcbiAgICAgIHJldHVybiB0aGlzLnVzZXJuYW1lICsgJzonICsgdGhpcy5wYXNzd29yZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfVxuXG4gIHNldCBjcmVkZW50aWFscyh2KSB7XG4gICAgdiA9IHYuc3BsaXQoJzonKTtcbiAgICB0aGlzLnVzZXJuYW1lID0gdi5zaGlmdCgpO1xuICAgIGlmICh2Lmxlbmd0aCkge1xuICAgICAgdGhpcy5wYXNzd29yZCA9IHYuc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBnZXQgdXNlcm5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuJC51c2VybmFtZSB8fCAnJztcbiAgfVxuXG4gIHNldCB1c2VybmFtZSh2KSB7XG4gICAgdGhpcy4kLnVzZXJuYW1lID0gdjtcbiAgfVxuXG4gIGdldCBwYXNzd29yZCgpIHtcbiAgICByZXR1cm4gdGhpcy4kLnBhc3N3b3JkIHx8ICcnO1xuICB9XG5cbiAgc2V0IHBhc3N3b3JkKHYpIHtcbiAgICB0aGlzLiQucGFzc3dvcmQgPSB2O1xuICB9XG5cbiAgZ2V0IGhvc3QoKSB7XG4gICAgaWYgKHRoaXMucG9ydCkge1xuICAgICAgcmV0dXJuIHRoaXMuaG9zdG5hbWUgKyAnOicgKyB0aGlzLnBvcnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmhvc3RuYW1lO1xuICAgIH1cbiAgfVxuXG4gIHNldCBob3N0KHYpIHtcbiAgICBpZiAodikge1xuICAgICAgdmFyIGhvc3QgPSB2LnNwbGl0KCdAJyk7XG4gICAgICBpZiAoaG9zdC5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBob3N0LnNoaWZ0KCk7XG4gICAgICB9XG4gICAgICBob3N0ID0gaG9zdC5zaGlmdCgpLnNwbGl0KCc6Jyk7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gaG9zdC5zaGlmdCgpO1xuICAgICAgdGhpcy5wb3J0ID0gaG9zdC5zaGlmdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdGhpcy4kLmhvc3Q7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGhvc3RuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLiQuaG9zdG5hbWUgfHwgJyc7XG4gIH1cblxuICBzZXQgaG9zdG5hbWUodikge1xuICAgIHRoaXMuJC5ob3N0bmFtZSA9IHY7XG4gIH1cblxuICBnZXQgcG9ydCgpIHtcbiAgICByZXR1cm4gdGhpcy4kLnBvcnQgfHwgJyc7XG4gIH1cblxuICBzZXQgcG9ydCh2KSB7XG4gICAgaWYgKHYpIHtcbiAgICAgIHRoaXMuJC5wb3J0ID0gcGFyc2VJbnQodik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB0aGlzLiQucG9ydDtcbiAgICB9XG4gIH1cblxuICBnZXQgcGF0aG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuJC5wYXRobmFtZSB8fCAnLyc7XG4gIH1cblxuICBzZXQgcGF0aG5hbWUodikge1xuICAgIHRoaXMuJC5wYXRobmFtZSA9IFBhdGgubm9ybWFsaXplKHYpO1xuICB9XG5cbiAgZ2V0IGZpbGVuYW1lKCkge1xuICAgIHJldHVybiBQYXRoLmZpbGVuYW1lKHRoaXMucGF0aG5hbWUpO1xuICB9XG5cbiAgc2V0IGZpbGVuYW1lKHYpIHtcbiAgICB0aGlzLnBhdGhuYW1lID0gUGF0aC5yZXNvbHZlKHRoaXMucGF0aG5hbWUsICcuLicsIFBhdGguZmlsZW5hbWUodikpO1xuICB9XG5cbiAgZ2V0IHNlYXJjaCgpIHtcbiAgICB2YXIgcGFpcnMgPSBbXTtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcnkpIHtcbiAgICAgIHBhaXJzLnB1c2goaSArICc9JyArIHRoaXMucXVlcnlbaV0pO1xuICAgIH1cbiAgICBpZiAocGFpcnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gJz8nICsgcGFpcnMuc29ydCgpLmpvaW4oJyYnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfVxuXG4gIHNldCBzZWFyY2godikge1xuICAgIGlmICh2LmluZGV4T2YoJz8nKSA9PSAwKSB7XG4gICAgICB0aGlzLnF1ZXJ5ID0gdi5zdWJzdHJpbmcoMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucXVlcnkgPSB2O1xuICAgIH1cbiAgfVxuXG4gIGdldCBxdWVyeSgpIHtcbiAgICByZXR1cm4gdGhpcy4kLnF1ZXJ5IHx8ICh0aGlzLiQucXVlcnkgPSB7fSk7XG4gIH1cblxuICBzZXQgcXVlcnkodikge1xuICAgIGlmICghdGhpcy4kLnF1ZXJ5KSB7XG4gICAgICB0aGlzLiQucXVlcnkgPSB7fTtcbiAgICB9XG4gICAgdi5zcGxpdCgnJicpLmZvckVhY2gocGFpcj0+IHtcbiAgICAgIHBhaXIgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgICB0aGlzLiQucXVlcnlbcGFpclswXS50cmltKCldID0gcGFpclsxXS50cmltKCk7XG4gICAgfSlcbiAgfVxuXG4gIGdldCBoYXNoKCkge1xuICAgIHJldHVybiB0aGlzLiQuaGFzaCB8fCAnJztcbiAgfVxuXG4gIHNldCBoYXNoKHYpIHtcbiAgICB0aGlzLiQuaGFzaCA9IHY7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcih1cmwpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJyQnLCB7dmFsdWU6IHt9fSk7XG4gICAgaWYgKHR5cGVvZiB1cmwgPT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuaHJlZiA9IHVybDtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUodXJsKSB7XG4gICAgaWYgKHR5cGVvZiB1cmwgPT0gJ3N0cmluZycpIHtcbiAgICAgIHVybCA9IG5ldyBVcmwodXJsKTtcbiAgICB9XG4gICAgaWYgKHVybC5xdWVyeSkge1xuICAgICAgZm9yICh2YXIga2V5IGluIHVybC5xdWVyeSkge1xuICAgICAgICB0aGlzLnF1ZXJ5W2tleV0gPSB1cmwucXVlcnlba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHVybC5vcmlnaW4pIHtcbiAgICAgIHRoaXMub3JpZ2luID0gdXJsLm9yaWdpblxuICAgIH1cbiAgICBpZiAodXJsLnBhdGhuYW1lKSB7XG4gICAgICB0aGlzLnBhdGhuYW1lID0gUGF0aC5yZXNvbHZlKHRoaXMucGF0aG5hbWUsIHVybC5wYXRobmFtZSk7XG4gICAgfVxuICAgIGlmICh1cmwuaGFzaCkge1xuICAgICAgdGhpcy5oYXNoID0gdXJsLmhhc2hcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXNvbHZlKHBhdGgpIHtcbiAgICByZXR1cm4gVXJsLnJlc29sdmUodGhpcyxwYXRoKTtcbiAgfVxuXG4gIGluc3BlY3QoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhyZWY6IHRoaXMuaHJlZixcbiAgICAgIG9yaWdpbjogdGhpcy5vcmlnaW4sXG4gICAgICBwcm90b2NvbDogdGhpcy5wcm90b2NvbCxcbiAgICAgIGNyZWRlbnRpYWxzOiB0aGlzLmNyZWRlbnRpYWxzLFxuICAgICAgdXNlcm5hbWU6IHRoaXMudXNlcm5hbWUsXG4gICAgICBwYXNzd29yZDogdGhpcy5wYXNzd29yZCxcbiAgICAgIGhvc3Q6IHRoaXMuaG9zdCxcbiAgICAgIGhvc3RuYW1lOiB0aGlzLmhvc3RuYW1lLFxuICAgICAgcG9ydDogdGhpcy5wb3J0LFxuICAgICAgcGF0aG5hbWU6IHRoaXMucGF0aG5hbWUsXG4gICAgICBmaWxlbmFtZTogdGhpcy5maWxlbmFtZSxcbiAgICAgIHNlYXJjaDogdGhpcy5zZWFyY2gsXG4gICAgICBxdWVyeTogdGhpcy5xdWVyeSxcbiAgICAgIGhhc2g6IHRoaXMuaGFzaFxuICAgIH07XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5ocmVmO1xuICB9XG5cbiAgdG9KU09OKCkge1xuICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG4gIH1cbn1cbmNsYXNzIExvYWRlciB7XG4gIHN0YXRpYyBsb2FkKHBhdGgpIHtcbiAgICBzd2l0Y2ggKEFzeC5wbGF0Zm9ybSkge1xuICAgICAgY2FzZSBSdW50aW1lLk5PREUgICAgIDpcbiAgICAgICAgcmV0dXJuIHJlcXVpcmUoJ2ZzJykucmVhZEZpbGVTeW5jKFVybC5wYXJzZShwYXRoKS5wYXRobmFtZSwgJ3V0ZjgnKTtcbiAgICAgIC8vcmV0dXJuIFZNLnJ1bkluVGhpc0NvbnRleHQoKTtcbiAgICAgIGNhc2UgUnVudGltZS5CUk9XU0VSICA6XG4gICAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgcGF0aCwgZmFsc2UpO1xuICAgICAgICByZXF1ZXN0LnNlbmQoKTtcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzICE9IDIwMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmlsZSBub3QgZm91bmQgJyArIHBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXF1ZXN0LnJlc3BvbnNlVGV4dDtcbiAgICAgIC8vcmV0dXJuIGV2YWwoKTtcbiAgICB9XG4gIH1cbn1cblxuQG5hdGl2ZVxuQG92ZXJyaWRlKCdsb2NhbCcpXG5jbGFzcyBNb2R1bGUge1xuICBzdGF0aWMgcGF0aHMobW9kdWxlKXtcbiAgICByZXR1cm4gW0FzeC5yZXBvc2l0b3J5LnJlc29sdmUoTW9kdWxlLnBhdGgobW9kdWxlKSldO1xuICB9XG4gIHN0YXRpYyBwYXRoKG1vZHVsZSl7XG4gICAgcmV0dXJuIG1vZHVsZS5pZCsnLmpzJztcbiAgfVxuICBwcmVwYXJlKCkge1xuICAgIC8vdmFyIHBhcnRzID0gdGhpcy5pZC5zcGxpdCgnLycpO1xuICAgIC8vdGhpcy5wcm9qZWN0ID0gcGFydHMuc2hpZnQoKTtcbiAgICAvL3RoaXMuZ3JvdXAgPSBwYXJ0cy5zaGlmdCgpO1xuICAgIC8vdGhpcy5wYXRoID0gcGFydHMuam9pbignLycpKycuanMnO1xuICAgIHRoaXMucGVuZGluZyA9IHRydWU7XG4gICAgaWYgKCF0aGlzLnNjb3BlKSB7XG4gICAgICB0aGlzLnNjb3BlID0ge307XG4gICAgfVxuICB9XG4gIGxvYWQoKSB7XG4gICAgdmFyIHNjcmlwdCxwYXRocyA9IE1vZHVsZS5wYXRocyh0aGlzKTtcbiAgICBmb3IodmFyIGk9MCxwYXRoO2k8cGF0aHMubGVuZ3RoO2krKyl7XG4gICAgICBwYXRoID0gcGF0aHNbaV0udG9TdHJpbmcoKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHNjcmlwdCA9IExvYWRlci5sb2FkKHBhdGgpXG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihleCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzY3JpcHQpIHtcbiAgICAgIHRoaXMuc2NyaXB0ID0gc2NyaXB0O1xuICAgICAgdGhpcy5ldmFsdWF0ZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTW9kdWxlIE5vdCBBdmFpbGFibGUgJyArIHRoaXMuaWQscGF0aHMpXG4gICAgfVxuICB9XG4gIGV2YWx1YXRlKCkge1xuICAgIHN3aXRjaCAoUnVudGltZS5Bc3gucGxhdGZvcm0pIHtcbiAgICAgIGNhc2UgUnVudGltZS5OT0RFICAgICA6XG4gICAgICAgIHJldHVybiByZXF1aXJlKCd2bScpLnJ1bkluVGhpc0NvbnRleHQodGhpcy5zY3JpcHQpO1xuICAgICAgY2FzZSBSdW50aW1lLkJST1dTRVIgIDpcbiAgICAgICAgdmFyIEFzeCA9IFJ1bnRpbWUuQXN4O1xuICAgICAgICByZXR1cm4gZXZhbCh0aGlzLnNjcmlwdCk7XG4gICAgfVxuICB9XG4gIHJlcXVpcmUocGF0aCwgdGFyZ2V0cykge1xuICAgIGlmKHBhdGguY2hhckF0KDApPT0nLicpe1xuICAgICAgcGF0aCA9IFBhdGgucmVzb2x2ZShQYXRoLmRpcm5hbWUoTW9kdWxlLnBhdGgodGhpcykpLHBhdGgpO1xuICAgIH1cbiAgICB2YXIgY2hpbGQgPSBNb2R1bGUuZ2V0KHBhdGgpO1xuICAgIGlmKGNoaWxkLnBlbmRpbmcpe1xuICAgICAgaWYoQXN4LnBsYXRmb3JtPT0nbm9kZScgJiYgY2hpbGQuaWQuaW5kZXhPZignbm9kZS8nKT09MCl7XG4gICAgICAgIHBhdGggPSBjaGlsZC5pZC5zdWJzdHJpbmcoNSkucmVwbGFjZSgvXiguKilcXC9pbmRleCQvLCckMScpXG4gICAgICAgIGNoaWxkLmluaXRpYWxpemUoZnVuY3Rpb24oKXtyZXR1cm4ge1xuICAgICAgICAgIGV4ZWN1dGUgOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIEFzeC5yZXF1aXJlKHBhdGgpXG4gICAgICAgICAgfVxuICAgICAgICB9fSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgY2hpbGQubG9hZCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKHR5cGVvZiB0YXJnZXRzPT0nc3RyaW5nJyl7XG4gICAgICBpZih0YXJnZXRzID09ICcqJyl7XG4gICAgICAgIE9iamVjdC5rZXlzKGNoaWxkLmV4cG9ydHMpLmZvckVhY2goKGssbik9PntcbiAgICAgICAgICB0aGlzLnNjb3BlW2tdPWNoaWxkLmV4cG9ydHNba107XG4gICAgICAgIH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5zY29wZVt0YXJnZXRzXT1jaGlsZC5leHBvcnRzO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgaWYodGFyZ2V0c1snIyddKXtcbiAgICAgICAgdGhpcy5zY29wZVt0YXJnZXRzWycjJ11dID0gY2hpbGQuZXhwb3J0cztcbiAgICAgICAgZGVsZXRlIHRhcmdldHNbJyMnXTtcbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zb2xlLmluZm8oJ0hhbmRsZSBDb21wbGV4IENhc2UnLHRhcmdldHMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hpbGQ7XG4gICAgLypcbiAgICAgTW9kdWxlLmdldChwYXRoKS5sb2FkKCk7XG4gICAgIGNvbnNvbGUuaW5mbyhNb2R1bGUuZ2V0KHBhdGgpKTsqL1xuICB9XG4gIGRvSW1wb3J0cyhpbXBvcnRzKSB7XG4gICAgaWYgKHRoaXMuaW1wb3J0cykge1xuICAgICAgT2JqZWN0LmtleXModGhpcy5pbXBvcnRzKS5mb3JFYWNoKGk9PnRoaXMucmVxdWlyZShpLHRoaXMuaW1wb3J0c1tpXSkpO1xuICAgIH1cbiAgICB0aGlzLmRvRXhlY3V0ZSgpO1xuICB9XG4gIGRvRXhwb3J0cygpe1xuICAgIGRlbGV0ZSB0aGlzLnBlbmRpbmc7XG4gICAgLy9kZWxldGUgdGhpcy5leHBvcnRzO1xuICAgIHRoaXMuZmluYWxpemUoKTtcbiAgfVxufVxuXG5cblxuQG5hdGl2ZVxuQG92ZXJyaWRlKCdsb2NhbCcpXG5jbGFzcyBSdW50aW1lIHtcbiAgc3RhdGljIE5PREUgPSAnbm9kZSc7XG4gIHN0YXRpYyBCUk9XU0VSID0gJ2Jyb3dzZXInO1xuXG4gIHN0YXRpYyBleGVjdXRlKCkge1xuICAgIG1vZHVsZS5vbkNvbXBsZXRlID0gKCk9PntcbiAgICAgIHZhciBtYWluID0gbW9kdWxlLnJlcXVpcmUoQXN4LmV4ZWN1dGFibGUsJyonKTtcbiAgICAgIGlmKG1haW4uZXhwb3J0cyAmJiAodHlwZW9mIG1haW4uZXhwb3J0cy5tYWluPT0nZnVuY3Rpb24nKSl7XG4gICAgICAgIG1haW4uZXhwb3J0cy5tYWluKFsnYXJncyddKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQgcGxhdGZvcm0oKSB7XG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gUnVudGltZS5OT0RFO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIFJ1bnRpbWUuQlJPV1NFUjtcbiAgICB9XG4gIH1cbiAgZ2V0IHJlcG9zaXRvcnkoKSB7XG4gICAgdmFyIHVybDtcbiAgICBzd2l0Y2ggKHRoaXMucGxhdGZvcm0pIHtcbiAgICAgIGNhc2UgUnVudGltZS5OT0RFICAgICA6XG4gICAgICAgIHVybCA9IG5ldyBVcmwoX19maWxlbmFtZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBSdW50aW1lLkJST1dTRVIgIDpcbiAgICAgICAgdXJsID0gbmV3IFVybChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzY3JpcHRbbWFpbl0nKS5zcmMpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIHVybC5yZXNvbHZlKCcuLi8uLi8uLi8nKTtcbiAgfVxuICBnZXQgZXhlY3V0YWJsZSgpIHtcbiAgICBzd2l0Y2ggKHRoaXMucGxhdGZvcm0pIHtcbiAgICAgIGNhc2UgUnVudGltZS5OT0RFICAgICA6XG4gICAgICAgIHJldHVybiBwcm9jZXNzLmFyZ3ZbMl07XG4gICAgICBjYXNlIFJ1bnRpbWUuQlJPV1NFUiAgOlxuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2NyaXB0W21haW5dJykuZ2V0QXR0cmlidXRlKCdtYWluJyk7XG4gICAgfVxuICB9XG59XG5cblJ1bnRpbWUuZXhlY3V0ZSgpXG4iXX0=