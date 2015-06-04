(function(){
  with(this.scope('./module/name')){
    return this.define({
      '#import'        : {
        'global'        : '*',
        'runtime'       : {
          '*'           : 'runtime',
          Module        : '*',
          Class         : '*',
          Runtime       : '*'
        }
      },
      '#export'        : {
        'Class'         : 'Some',
        'Other'         : 'Another'
      },
      '#static'        : function (){
        var hello = new Hello('Grish');
        console.info(hello.method('Hello'));
        console.info(hello.property);
      },
      '.Base'          : function BaseClass($class){
        return {
          '#new'       : function Base(name){
            console.info('Base Constructor');
            this.property = name;
          },
          '.property'  : {
            '#value'   : {base:'value'},
            '#getter'  : function Base_property_getter(){
              return this.name;
            },
            '#setter'  : function Base_property_setter(v){
              return this.name = v;
            }
          },
          '.method'    : {
            '#f'       : function Base_method(){
              return this.name;
            }
          },
          '.toString'  : function Base_toString(){

          }
        }
      },
      '.Hello'         : function ($class){
        return {
          '#extend'      : Base,
          '#new'       : function Hello(name){
            console.info('Hello Constructor');
            $class.super(this)(name);
          },
          '.property'  : {
            '#v'        : {hello:'value'},
            '#g'        : function Hello_property_getter(){
              return $class.super(this,'.property').value.substring(9);
            },
            '#s'        : function Hello_property_getter(v){
              $class.super(this,'.property').value = 'extended '+v;
            }
          },
          '.method'    : function Hello_method(msg){
            return $class.super(this,'.method')()+msg;
          },
          '.toString'  : function Hello_toString(){

          }
        }
      }
    });
  }
}).bind(
  (function module(){
    var global = this;
    var extend = function extend(sub, sup) {
      if (typeof sup !== "function" && sup !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof sup);
      }
      sub.prototype = Object.create(sup && sup.prototype, {
        constructor     : {
          value         : sub,
          enumerable    : false,
          writable      : true,
          configurable  : true
        }
      });
      if (sup){
        sub.__proto__ = sup;
      }
    };
    var define = function define(D){
      var C = D['*:new'],P=D['*:extend'],S=D['*:static'];
      if(P){
        extend(C,P);
      }
      Object.keys(D).forEach(function(k){
        var d=D[k],t=k.charAt(0).toUpperCase();
        var s=k.charAt(1),n=k.substring(2);
        var h=(s==':')?C:C.prototype;
        switch(t){
          case 'F' :
            Object.defineProperty(h,n,{
              configurable : true,
              value        : d
            });
            break;
          case 'V' :
            Object.defineProperty(h,n,{
              configurable : true,
              value        : d
            });
            break;
          case 'G' :
          case 'S' :
            var pd = Object.getOwnPropertyDescriptor(h,n)
            pd = pd || {
                configurable : true
              };
            switch(t){
              case 'G': pd.get = d; break;
              case 'S': pd.set = d; break;
            }
            Object.defineProperty(h,n,pd);
            break;
        }
      });

      if(S){
        S.call(C);
      }
      return C;
    };

    // classes
    var Runtime       = define({
      '*:new'            : function Runtime(){

      }
    });
    var Scope         = define({
      '*:new'           : function Scope(){},
      'f.export'        : function exports(exports){
        //console.log(exports);
      },
      'f.declare'       : function declare(declaration){
        if(declaration.type=='P'){
          return Object.defineProperty(this,declaration.name,{
            value     : declaration.done()
          })[declaration.name];
        }else{
          Object.defineProperty(this,declaration.name,{
            configurable  : true,
            get           : function(){
              return Object.defineProperty(this,declaration.name,{
                value     : declaration.done()
              })[declaration.name];
            }
          });
        }

      },
      'f.done'          : function done(){
        delete this.declare;
        delete this.export;
        delete this.done;
      }
    });
    var ClassMember   = define({
      '*:new'               : function ClassMember(owner,key,def){
        this.key    = key;
        this.owner  = owner;
        this.type   = key.charAt(0);
        this.scope  = key.charAt(1);
        this.name   = key.substring(2);
        this.flags  = def.f;
        if(def.original){
          this.parent = def.original;
        }
      },
      'f.isHidden'          : function isHidden(){
        return !!(this.flags&1)
      },
      'f.isFinal'           : function isFinal(){
        return !!(this.flags&2)
      },
      'f.isConstant'        : function isConstant(){
        return !!(this.flags&4)
      },
      'f.isStaticMember'    : function isStaticMember(){
        return this.scope==':';
      },
      'f.isInstanceMember'  : function isInstanceMember(){
        return this.scope==':';
      },
      'f.holder'            : function holder(){
        if(this.isStaticMember()){
          return this.owner.constructor;
        }else{
          return this.owner.constructor.prototype;
        }
      },
      'f.done'              : function done(){
        throw new Error('abstract method');
      }
    });
    var ClassFunction = define({
      '*:extend'            : ClassMember,
      '*:new'               : function ClassFunction(owner,key,def){
        ClassMember.call(this,owner,key,def);
        this.value = def.v;
        //console.info(this)
      },
      'f.super'             : function supper(target){
        var def = {
          call : function(){
            throw new Error('Invalid super call');
          }
        };
        if(this.owner.type=='P'){
          def.call = this.parent.value.bind(target)
        }else
        if(this.owner.type=='C'){
          var method = this.owner.parent.get(this.key);
          if(method){
            def.call = method.value.bind(target)
          }
        }
        return def;
      },
      'f.done'              : function done(){
        if(!this.isFinal()){
          var d ={
            enumberable  : !this.isHidden(),
            configurable : !this.isFinal(),
            writable     : !this.isConstant(),
            value        : this.value
          };
          if(!d.enumberable){
            delete d.enumberable;
          }
          if(!d.configurable){
            delete d.configurable;
          }
          if(!d.writable){
            delete d.writable;
          }
          Object.defineProperty(this.holder(),this.name,d);
        }
        return this;
      }
    });
    var ClassVariable = define({
      '*:extend'            : ClassMember,
      '*:new'               : function ClassVariable(owner,key,def){
        ClassMember.call(this,owner,key,def);
        this.value = def.v;
        this.getter = def.g;
        this.value = def.v;
        //console.info(this)
      },
      'f.supper'            : function supper(target){
        var def = {
          call : function(){
            throw new Error('Invalid super call');
          }
        };
        if(this.owner.type=='P'){
          def.call = this.parent.value.bind(target)
        }else
        if(this.owner.type=='C'){
          var method = this.owner.parent.get(this.key);
          if(method){
            def.call = method.value.bind(target)
          }
        }
        return def;
      },
      'f.done'              : function done(){
        if(!this.isFinal()){
          var d = {
            enumberable  : !this.isHidden(),
            configurable : !this.isFinal(),
            writable     : !this.isConstant()
          };

          if(!d.enumberable){
            delete d.enumberable;
          }
          if(!d.configurable){
            delete d.configurable;
          }
          if(!d.writable){
            delete d.writable;
          }

          if(this.setter){
            d.set = this.setter;
          }
          if(this.getter){
            d.get = this.getter;
          }
          if(!(this.setter || this.getter)){
            if(typeof value =='function'){
              d.value = this.value();
            } else {
              d.value = this.value;
            }
          }
          Object.defineProperty(this.holder(),this.name,d);
        }
        return this;
      }
    });
    var Class         = define({
      '*:new'           : function Class(name,type,definition){
        if(!(this instanceof Class)){
          return new Class(name,type,definition);
        }
        if(typeof name=='string'){
          this.name = name;
          this.type = type;
          this.definition = definition;
        }else
        if(typeof name=='function'){
          if(Object.getOwnPropertyDescriptor(name,'class') && (name.class instanceof Class)){
            return name.class;
          }
          this.name = name.name;
          this.type = 'P';
          this.define(name);
        }
      },
      'v:classes'       : {},
      'f:inherits'      : extend,
      'f:uid'           : function uid(){
        return [
          'C:',
          (Math.round(Math.random() * 0xFFFFFF)).toString(32),
          (Math.round(Math.random() * 0xFFFFFF)).toString(32),
        ].join('');
      },
      'f.define'        : function define(C){
        Object.defineProperty(this,'uid',{value:Class.uid()});
        Object.defineProperty(this,'constructor',{value:C});
        Object.defineProperty(Class.classes,this.uid,{value:this});
        if(C !== Object){
          Object.defineProperty(this,'parent',{
            value : Object.getPrototypeOf(C.prototype).constructor.class
          });
        }
        //Object.defineProperty(C,'class',{value:this});
        function defineDescriptor(s,t,key){
          var cd={f:0},cn,pd=Object.getOwnPropertyDescriptor(t,key);
          if(!pd.enumerable){
            cd.f = cd.f | 1;
          }
          if(!pd.configurable){
            cd.f = cd.f | 2;
          }
          if(!pd.writable){
            cd.f = cd.f | 4;
          }
          if(pd.value && typeof pd.value =='function'){
            cn = 'F'+s+key;
            cd.v = pd.value;
          }else{
            cn = 'V'+s+key;
            if(pd.value){
              cd.v = function(){
                return pd.value;
              }
            }
            if(pd.get){
              cd.g = pd.get
            }
            if(pd.set){
              cd.s = pd.set
            }
          }
          this.set(cn,cd);

        }
        Object.getOwnPropertyNames(C).forEach(defineDescriptor.bind(this,':',C));
        Object.getOwnPropertyNames(C.prototype).forEach(defineDescriptor.bind(this,'.',C.prototype));
      },
      'f.get'           : function get(key){
        if(this[key]){
          return this[key];
        }else
        if(this.parent){
          return this.parent.get(key);
        }
      },
      'f.set'           : function set(key,def){
        if(!key.match(/(F|V)(:|\.).*/i)){
          throw new Error('Invalid member name '+key);
        }
        if(key.match(/(F|V)(:|\.)(class|arguments|prototype)/i)){
          return;
        }
        var type  = key.charAt(0);
        if(typeof def == 'function'){
          def = {v:def}
        }
        if(this.type=='P' && this[key]){
          def.original = this[key];
        }
        if(this.type=='C' || !this.parent || !this.parent.hasOwnProperty(key)){
          switch(type.toUpperCase()){
            case 'F' : this[key]=new ClassFunction(this,key,def).done();break;
            case 'V' : this[key]=new ClassVariable(this,key,def).done();break;
          }
        }
      },
      'f.super'         : function supper(target,name){
        if(!name){
          return {call:this.parent.constructor.bind(target)};
        }else{
          return this.get(name).super(target);
        }
      },
      'f.done'          : function done(){
        var CD = this.definition = this.definition(this);
        var CC = CD['*.constructor'];
        var CP = CD['*:extends'];
        if(CP){
          Class.inherits(CC,CP);
        }
        this.define(CC);
        Object.keys(CD).forEach(function(key){
          if(key.match(/(F|V)(:|\.).*/i)){
            this.set(key,CD[key]);
          }
        }.bind(this));
        return this.constructor;
      }
    });
    var Module        = define({
      '*:new'           : function Module(){},
      '*:static'        : function static(){
        Object.defineProperty(Function.prototype,'class',{
          configurable  : true,
          get           : function(){
            var target;
            if(this instanceof Class){
              target = this;
            }else
            if(typeof this == 'function'){
              target = Class(this);
            }else
            if(typeof this.constructor == 'function'){
              target = this.constructor.class;
            }
            return Object.defineProperty(this,'class',{
              writable      : true,
              configurable  : true,
              value         : target
            }).class;
          }
        });
        Object.defineProperty(Object.prototype,'class',{
          configurable  : true,
          get           : function(){
            return Object.defineProperty(this,'class',{
              writable      : true,
              configurable  : true,
              value         : this.constructor.class
            }).class;
          }
        });
      },
      'f.scope'         : function scope(path){
        Object.defineProperty(this,'path',{value:path});
        Object.defineProperty(this,'scope',{value:new Scope()});
        return this.scope;
      },
      'f.declare'       : function declare(type,name,declaration){
        switch(type){
          case '*' : return;
          case 'C' :
          case 'P' :
            declaration = new Class(name,type,declaration);
            break;
          default  :
            throw new Error('Unknown definition type '+dfType);
        }
        this.scope.declare(declaration);
      },
      'f.define'        : function define(definer){
        var scope = this.scope;
        if(definer['*:import']){
          var imports   = definer['*:import'];
          var entities  = {
            'Runtime'       : Runtime,
            'Module'        : Module,
            'Class'         : Class,
            'ClassFunction' : ClassFunction,
            'ClassVariable' : ClassVariable
          };
          Object.keys(imports).forEach(function(key){
            if(key=='runtime'){
              var runtime = imports['runtime'];
              Object.keys(runtime).forEach(function(key){
                var named = runtime[key]=='*' ? key:runtime[key];
                if(entities.hasOwnProperty(key)){
                  return scope.declare({
                    name : key,
                    done : function(){
                      return entities[key]
                    }
                  })
                }
              })
            }
          });
        }
        if(definer){
          Object.keys(definer).forEach(function(key){
            return this.declare(key.charAt(0),key.substring(2),definer[key]);
          }.bind(this));
        }
        if(definer['*:static']){
          definer['*:static'].call(this.scope);
        }
        if(definer['*:export']){
          this.export(definer['*:export']);
        }
        return this.done();
      },
      'f.export'        : function exports(exports){
        Object.defineProperty(this,'public',{
          value : this.scope.export(exports)
        });
      },
      'f.done'          : function done(){
        this.scope.done();
        delete this.declare;
        delete this.define;
        delete this.export;
        delete this.done;
      }
    });

    return new Module();
  })()
)("PROCESS");

