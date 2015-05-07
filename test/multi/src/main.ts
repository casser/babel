/**
 * Some Module Description
 * @module {
 *  bind    : true,
 *  execute : true,
 *  runtime : true
 * }
 */
@shim
class Object {}
@shim
class Class {
    static define(c:Function,d?:Object):Function {
        return new Class(c,d).initialize();
    }

    closure     : Function;
    descriptor  : Object;

    constructor(c:Function,d?:Object){
        this.closure = c;
        this.descriptor = d;
    }
    initialize():Function{
        return this.closure;
    }
}
class Grish {
    private property;
    get property(){
        return this::property
    }
}

/*
var MyBase = (function () {
    function MyBase(){}
    return Class.define(MyBase);
})();

var MyChild = (function (E56P) {
    function MyChild() {}
    return Class.define(MyChild, {
        "C:name"   : 'MyChild',
        "C:super"  : E56P,
        "C:init"   : function(){

        },
        "C:meta"   : function(){

        },
        "P.hello"  : {
            v: function hello() {
                return "Jan";
            }
        }
    });
})(MyBase);


*/
