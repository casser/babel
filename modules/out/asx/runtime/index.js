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
      var I = D['#initializer'];
      var P = D['#extend'];
      var N = D['#override'];

      if (!C) {
        C = global[name];
      }

      console.info('Define', name, D['#initializer']);

      if (I) {
        C['#initializer'] = I;
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
            delete x.writable;
            x.enumerable = true;

            if (d['#g'] || d['#s']) {
              if (d['#g']) {
                x.get = d['#g'];
              }

              if (d['#s']) {
                x.set = d['#s'];
              }
            } else {
              if (d['#v']) {
                x.configurable = true;

                x.get = function value_getter() {
                  delete this[n];
                  return Object.defineProperty(this, n, {
                    configurable: true,
                    value: d['#v']()
                  })[n];
                };

                x.set = function value_setter(v) {
                  delete this[n];
                  return Object.defineProperty(this, n, {
                    configurable: true,
                    value: v
                  })[n];
                };
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

      function __() {
        this.constructor = d;
      }

      __.prototype = b.prototype;
      d.prototype = new __();
    }

    function definer() {
      var s = {};
      var c = declare(def(s));

      if (c['class'] && c['class'].initialize) {
        c['class'].initialize(s);
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
})();

Asx.define('asx/runtime/index', function (module) {
  with (this) {
    return {
      imports: {
        runtime: '*'
      },
      execute: function (asx) {
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
        });
        asx.c$(function c$Function(_class) {
          return {
            '#decorators': [],
            '.class': {
              '#g': function class_getter() {
                return new Class(this);
              }
            }
          };
        });
        asx.c$(function c$String(_class) {
          return {
            '#decorators': [],
            ':isString': {
              '#f': function isString(obj) {
                return typeof obj === 'string';
              }
            }
          };
        });
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
        });
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
        });
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
                // normalize host
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
        });
        asx.c$(function c$Loader(_class) {
          return {
            '#constructor': function Loader() {},
            ':load': {
              '#f': function load(path) {
                switch (Asx.platform) {
                  case Runtime.NODE:
                    return require('fs').readFileSync(Url.parse(path).pathname, 'utf8');
                  //return VM.runInThisContext();
                  case Runtime.BROWSER:
                    var request = new XMLHttpRequest();
                    request.open('GET', path, false);
                    request.send();
                    if (request.status != 200) {
                      throw new Error('File not found ' + path);
                    }
                    return request.responseText;
                    //return eval();
                }
              }
            }
          };
        });
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
                //var parts = this.id.split('/');
                //this.project = parts.shift();
                //this.group = parts.shift();
                //this.path = parts.join('/')+'.js';
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
                /*
                 Module.get(path).load();
                 console.info(Module.get(path));*/
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
                //delete this.exports;
                this.finalize();
              }
            }
          };
        });
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
        });

        Runtime.execute();
      }
    };
  }
});

//console.info(scope)