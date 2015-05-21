(function () {
  var global  = this;
  var locker  = {};
  var modules = Object.create(null);
  function Definer(module){
    this.c$ = this.defineClass.bind(module);
  }
  Definer.prototype.defineClass = function defineClass(def){
    var name = def.name.substring(2);
    var scope = this.scope;
    function declare(D) {
      var C = D['#constructor'];
      var P = D['#extend'];
      var N = D['#override'];
      if(!C){
        C = global[name];
      }

      if(N){
        switch(N){
          case 'local':Object.defineProperty(scope,name,{
            configurable:true,
            value : C = (C||scope[name])
          })
            break;
          case 'global':Object.defineProperty(global,name,{
            configurable:true,
            value : C = (C||global[name])
          })
            break;
        }
      }

      if(P){
        extend(C, P);
      }

      Object.keys(D).forEach(function (k) {
        var x = {configurable:true,writable:true};
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
    function definer(){
      var s = {};
      var c = declare(def(s));
      if(c.class && c.initialize){
        c.initialize(s);
      }
      return Object.defineProperty(this,name,{
        value : c
      })[name];
    }
    if(this.scope.hasOwnProperty(name)){
      //console.info(name)
      Object.defineProperty(this.scope,name,{
        configurable  : true,
        value         : definer.call(this.scope)
      })
    }else{
      Object.defineProperty(this.scope,name,{
        configurable  : true,
        get           : definer
      })
    }
  };

  function Module(lock,id){
    if(lock != locker){
      throw new Error("Module '"+id+"' can't be instantiated directly");
    }else
    if(modules[id]){
      throw new Error("Module '"+id+"' already defined");
    }else{
      Object.defineProperty(this,'id',{value:id});
      Object.defineProperty(modules,id,{
        configurable : false,
        writable     : false,
        enumerable   : true,
        value        : this
      });
      this.prepare();
    }
  }
  Module.get = function(id){
    id = this.normalize(id);
    if(modules[id]){
      return modules[id];
    }else{
      return new Module(locker,id);
    }
  }
  Module.normalize = function normalize(name){
    var id = name;
    id = id.replace(/^(.*)\.js$/, '$1');
    id = id.split('/').filter(p=>p.match(/^[A-Z][A-Z0-9_\-]*$/i));
    if(id.length<2){
      throw new Error('Invalid Module Id '+name);
    } else
    if(id.length==2){
      id.push('index');
    }
    return id.join('/');
  }
  Module.prototype.prepare      = function prepare(){
    this.scope = {
      Module   : Module,
      Runtime  : Runtime,
      Asx      : Runtime.Asx
    }
  };
  Module.prototype.initialize   = function initialize(def){
    def = def.bind(this.scope)(this);
    this.imports = def.imports;
    this.exports = def.exports;
    this.definer = def.execute;
    this.doImports();
    return this;
  };
  Module.prototype.doImports    = function doImports(){
    delete this.imports;
    this.doExecute();
  }
  Module.prototype.doExecute    = function doExecute(){
    Object.defineProperty(this,'exports',{
      value : this.definer.call(this.scope,new Definer(this))
    })
    delete this.definer;
    this.doExports();
  }
  Module.prototype.doExports    = function doExports(){
    this.finalize();
  }
  Module.prototype.finalize     = function finalize(){
    if(this.onComplete){
      var onComplete = this.onComplete;
      delete this.onComplete;
      onComplete();
    }
  }

  function Runtime(){
    if(!global.Asx){
      if(typeof require == 'function'){
        Object.defineProperty(this,'require',{
          value:require
        });
      }
      Object.defineProperty(this,'modules',{
        value:modules
      });
      Object.defineProperty(Runtime,'global',{
        value:global
      });
      Object.defineProperty(Runtime,'Asx',{
        value:this
      });
      Object.defineProperty(global,'Asx',{
        value:this
      });
      return this;
    }else{
      return global.Asx;
    }
  }
  Runtime.prototype.define    = function define(name,def){
    return Module.get(name).initialize(def);
  }
  return new Runtime();
})();
