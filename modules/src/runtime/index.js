/**
 * Some Module Description
 * @module {
 *  bind    : true,
 *  execute : true,
 *  runtime : true
 * }
 */
import 'runtime';

@override('global')
class Class {
  static get class() {
    return Object.defineProperty(this, 'class', {
      value: new this(this)
    }).class;
  }
  constructor(constructor) {
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
  }
  get parent() {
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
        value: Object.getPrototypeOf(this.constructor.prototype).constructor.class
      }).parent;
    }
  }
  get name() {
    return this.constructor.name;
  }
  initialize() {
    var ms:Array = Object.getOwnPropertyNames(this.constructor);
    var mi:Array = Object.getOwnPropertyNames(this.constructor.prototype);
    ms.forEach(key=>Member.get(this, ':' + key));
    mi.forEach(key=>Member.get(this, '.' + key));
  }
  defaults(scope) {
    //console.info(scope)
  }
}

@native
class Function {
  get class() {
    return new Class(this);
  }
}
@native
class String {
  static isString(obj) {
    return typeof obj === 'string';
  }
}

class Member {

  static HIDDEN = 1;
  static FINAL = 2;
  static CONSTANT = 4;
  static NATIVE = 8;
  static STATIC = 16;
  static EXTENDED = 32;

  static isStatic(member) {
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

  static get(owner:Class, key:String) {
    if (!owner[key]) {
      owner[key] = new Member(owner, key);
    }
    return owner[key];
  }

  key:String;
  modifiers:Number;
  owner:Class;


  constructor(owner:Class, key:String) {
    this.owner = owner;
    this.key = key;
  }

}
class Path {
  static SEP = '/';

  static isAbsolute(path:Path) {
    return path.charAt(0) == '/';
  }

  static dirname(path:Path) {
    var filename = Path.filename(path);
    if (filename.indexOf('.') > 0) {
      path = path.split(Path.SEP);
      path.pop();
      return path.join(Path.SEP);
    }
    return path;
  }

  static filename(path:String) {
    return path.split(Path.SEP).pop();
  }

  static rename(path:String, name, ext) {
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

  static normalize(path:Path) {
    if (!path || path === '/') {
      return '/';
    }
    var prepend = (path.charAt(0) == '/' || path.charAt(0) == '.');
    var target = [], src, scheme, parts, token;
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
    return (
      (scheme ? scheme + '://' : '') +
      (prepend ? '/' : '') +
      target.join('/').replace(/[\/]{2,}/g, '/')
    );
  }

  static resolve(...paths) {
    var current = paths.shift();
    paths.forEach(path=> {
      if (Path.isAbsolute(path)) {
        current = path;
      } else {
        current = Path.normalize(current + '/' + path)
      }
    });
    return current;
  }
}
class Url {
  static parse(str) {
    return new Url(str);
  }
  static resolve(url,path){
    if(!(url instanceof Url)){
      url = new Url(url);
    }
    return new Url(url.toString()).update({
      pathname:Path.resolve(url.pathname,path)
    });
  }
  get href() {
    return this.protocol + '//'
      + (this.credentials ? this.credentials + '@' : '')
      + this.host
      + this.pathname
      + this.search
      + this.hash;
  }

  set href(v) {
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

  get origin() {
    return this.protocol + '//' + this.host;
  }

  set origin(v) {
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

  get protocol() {
    return this.$.protocol;
  }

  set protocol(v) {
    this.$.protocol = v;
  }

  get credentials() {
    if (this.username || this.password) {
      return this.username + ':' + this.password;
    } else {
      return '';
    }
  }

  set credentials(v) {
    v = v.split(':');
    this.username = v.shift();
    if (v.length) {
      this.password = v.shift();
    }
  }

  get username() {
    return this.$.username || '';
  }

  set username(v) {
    this.$.username = v;
  }

  get password() {
    return this.$.password || '';
  }

  set password(v) {
    this.$.password = v;
  }

  get host() {
    if (this.port) {
      return this.hostname + ':' + this.port;
    } else {
      return this.hostname;
    }
  }

  set host(v) {
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

  get hostname() {
    return this.$.hostname || '';
  }

  set hostname(v) {
    this.$.hostname = v;
  }

  get port() {
    return this.$.port || '';
  }

  set port(v) {
    if (v) {
      this.$.port = parseInt(v);
    } else {
      delete this.$.port;
    }
  }

  get pathname() {
    return this.$.pathname || '/';
  }

  set pathname(v) {
    this.$.pathname = Path.normalize(v);
  }

  get filename() {
    return Path.filename(this.pathname);
  }

  set filename(v) {
    this.pathname = Path.resolve(this.pathname, '..', Path.filename(v));
  }

  get search() {
    var pairs = [];
    for (var i in this.query) {
      pairs.push(i + '=' + this.query[i]);
    }
    if (pairs.length) {
      return '?' + pairs.sort().join('&');
    } else {
      return '';
    }
  }

  set search(v) {
    if (v.indexOf('?') == 0) {
      this.query = v.substring(1);
    } else {
      this.query = v;
    }
  }

  get query() {
    return this.$.query || (this.$.query = {});
  }

  set query(v) {
    if (!this.$.query) {
      this.$.query = {};
    }
    v.split('&').forEach(pair=> {
      pair = pair.split('=');
      this.$.query[pair[0].trim()] = pair[1].trim();
    })
  }

  get hash() {
    return this.$.hash || '';
  }

  set hash(v) {
    this.$.hash = v;
  }

  constructor(url) {
    Object.defineProperty(this, '$', {value: {}});
    if (typeof url == 'string') {
      this.href = url;
    }
  }

  update(url) {
    if (typeof url == 'string') {
      url = new Url(url);
    }
    if (url.query) {
      for (var key in url.query) {
        this.query[key] = url.query[key];
      }
    }
    if (url.origin) {
      this.origin = url.origin
    }
    if (url.pathname) {
      this.pathname = Path.resolve(this.pathname, url.pathname);
    }
    if (url.hash) {
      this.hash = url.hash
    }
    return this;
  }

  resolve(path) {
    return Url.resolve(this,path);
  }

  inspect() {
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

  toString() {
    return this.href;
  }

  toJSON() {
    return this.toString();
  }
}
class Loader {
  static load(path) {
    switch (Asx.platform) {
      case Runtime.NODE     :
        return require('fs').readFileSync(Url.parse(path).pathname, 'utf8');
      //return VM.runInThisContext();
      case Runtime.BROWSER  :
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

@native
@override('local')
class Module {
  static paths(module){
    return [Asx.repository.resolve(Module.path(module))];
  }
  static path(module){
    return module.id+'.js';
  }
  prepare() {
    //var parts = this.id.split('/');
    //this.project = parts.shift();
    //this.group = parts.shift();
    //this.path = parts.join('/')+'.js';
    this.pending = true;
    if (!this.scope) {
      this.scope = {};
    }
  }
  load() {
    var script,paths = Module.paths(this);
    for(var i=0,path;i<paths.length;i++){
      path = paths[i].toString();
      try {
        script = Loader.load(path)
        break;
      } catch (ex) {
        console.error(ex);
      }
    }
    if (script) {
      this.script = script;
      this.evaluate()
    } else {
      throw new Error('Module Not Available ' + this.id,paths)
    }
  }
  evaluate() {
    switch (Runtime.Asx.platform) {
      case Runtime.NODE     :
        return require('vm').runInThisContext(this.script);
      case Runtime.BROWSER  :
        var Asx = Runtime.Asx;
        return eval(this.script);
    }
  }
  require(path, targets) {
    if(path.charAt(0)=='.'){
      path = Path.resolve(Path.dirname(Module.path(this)),path);
    }
    var child = Module.get(path);
    if(child.pending){
      if(Asx.platform=='node' && child.id.indexOf('node/')==0){
        path = child.id.substring(5).replace(/^(.*)\/index$/,'$1')
        child.initialize(function(){return {
          execute : function(){
            return Asx.require(path)
          }
        }});
      }else{
        child.load();
      }
    }

    if(typeof targets=='string'){
      if(targets == '*'){
        Object.keys(child.exports).forEach((k,n)=>{
          this.scope[k]=child.exports[k];
        })
      }else{
        this.scope[targets]=child.exports;
      }
    }else{
      if(targets['#']){
        this.scope[targets['#']] = child.exports;
        delete targets['#'];
      }else{
        console.info('Handle Complex Case',targets);
      }
    }
    return child;
    /*
     Module.get(path).load();
     console.info(Module.get(path));*/
  }
  doImports(imports) {
    if (this.imports) {
      Object.keys(this.imports).forEach(i=>this.require(i,this.imports[i]));
    }
    this.doExecute();
  }
  doExports(){
    delete this.pending;
    //delete this.exports;
    this.finalize();
  }
}
@native
@override('local')
class Runtime {
  static NODE = 'node';
  static BROWSER = 'browser';

  static execute() {
    module.onComplete = ()=>{
      var main = module.require(Asx.executable,'*');
      if(main.exports && (typeof main.exports.main=='function')){
        main.exports.main(['args']);
      }
    }
  }

  get platform() {
    if (typeof process != 'undefined') {
      return Runtime.NODE;
    }
    if (typeof window != 'undefined') {
      return Runtime.BROWSER;
    }
  }
  get repository() {
    var url;
    switch (this.platform) {
      case Runtime.NODE     :
        url = new Url(__filename);
        break;
      case Runtime.BROWSER  :
        url = new Url(document.querySelector('script[main]').src);
        break;
    }
    return url.resolve('../../../');
  }
  get executable() {
    switch (this.platform) {
      case Runtime.NODE     :
        return process.argv[2];
      case Runtime.BROWSER  :
        return document.querySelector('script[main]').getAttribute('main');
    }
  }
}

Runtime.execute()
