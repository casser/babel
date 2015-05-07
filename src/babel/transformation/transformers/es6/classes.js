import memoiseDecorators from "../../helpers/memoise-decorators";
import ReplaceSupers from "../../helpers/replace-supers";
import * as nameMethod from "../../helpers/name-method";
import * as defineMap from "../../helpers/define-map";
import * as messages from "../../../messages";
import * as util from  "../../../util";
import traverse from "../../../traversal";
import each from "lodash/collection/each";
import has from "lodash/object/has";
import * as t from "../../../types";

const PROPERTY_COLLISION_METHOD_NAME = "__initializeProperties";

export var shouldVisit = t.isClass;
export function ClassDeclaration(node, parent, scope, file) {
  var shim = Decorator.take(node, 'shim');
  if (shim) {
    return new ClassPolyfillTransformer(this, file).run();
  } else {
    return new ClassDeclarationTransformer(this, file).run();
  }
}
export function ClassExpression(node, parent, scope, file) {
  return new ClassExpressionTransformer(this, file).run();
}

var collectPropertyReferencesVisitor = {
  Identifier: {
    enter(node, parent, scope, state) {
      if (this.parentPath.isClassProperty({key: node})) {
        return;
      }
      if (this.isReferenced() && scope.getBinding(node.name) === state.scope.getBinding(node.name)) {
        state.references[node.name] = true;
      }
    }
  }
};
var constructorVisitor = traverse.explode({
  ThisExpression: {
    enter(node, parent, scope, ref) {
      return ref;
    }
  },

  Function: {
    enter(node) {
      if (!node.shadow) {
        this.skip();
      }
    }
  }
});
var verifyConstructorVisitor = traverse.explode({
  MethodDefinition: {
    enter() {
      this.skip();
    }
  },

  Property: {
    enter(node) {
      if (node.method) this.skip();
    }
  },

  CallExpression: {
    exit(node, parent, scope, state) {
      if (this.get("callee").isSuper()) {
        state.hasBareSuper = true;
        state.bareSuper = this;

        if (!state.hasSuper) {
          throw this.errorWithNode("super call is only allowed in derived constructor");
        }
      }
    }
  },

  FunctionDeclaration: {
    enter() {
      this.skip();
    }
  },

  FunctionExpression: {
    enter() {
      this.skip();
    }
  },

  ThisExpression: {
    enter(node, parent, scope, state) {
      if (state.hasSuper && !state.hasBareSuper) {
        throw this.errorWithNode("'this' is not allowed before super()");
      }

      if (state.isNativeSuper) {
        return state.nativeSuperRef;
      }
    }
  }
});

class Decorator {
  static has(node, name) {
    return !!Decorator.get(node, name);
  }

  static get(node, name) {
    if (node.decorators) {
      for (var i = 0; i < node.decorators.length; i++) {
        if (node.decorators[i].name == name) {
          return node.decorators[i];
        }
      }
    }
  }

  static take(node, name) {
    return Decorator.remove(node, name)[0];
  }

  static remove(node, name) {
    return Decorator.all(node, name, true);
  }

  static all(node, name, remove) {
    var removed = [];
    if (node.decorators) {
      node.decorators = node.decorators.filter(decorator=> {
        var match = decorator.expression.name == name;
        if (match) {
          removed.push(decorator);
        }
        return remove ? !match : true;
      });
    }
    return removed;
  }
}

class ClassTransformer {
  static MODIFIERS = {
    HIDDEN    : 0b0000000001,//!@hidden
    FINAL     : 0b0000000010,//!@final
    CONSTANT  : 0b0000000100 //!@constant
  };

  static getMask(node) {
    var flags = 0;
    flags = flags | ((!!Decorator.take(node, 'hidden'))   ? ClassTransformer.MODIFIERS.HIDDEN:0);//enum
    flags = flags | ((!!Decorator.take(node, 'final'))    ? ClassTransformer.MODIFIERS.FINAL:0);//conf
    flags = flags | ((!!Decorator.take(node, 'constant')) ? ClassTransformer.MODIFIERS.CONSTANT:0);//wr
    if(flags>0){
      flags = flags.toString(32);
      if (flags.length < 2) {
        flags = '0' + flags;
      }
      return flags;
    }
  }

  get isPolyfilled() {
    return false;
  }

  get className() {
    return Object.defineProperty(this, 'className', {
      value: this.node.id
    }).className;
  }

  get classReference() {
    return Object.defineProperty(this, 'classReference', {
      value: this.className
    }).classReference;
  }

  get superName() {
    return Object.defineProperty(this, 'superName', {
      value: this.node.superClass || t.identifier("Function")
    }).superName;
  }

  get superReference() {
    return Object.defineProperty(this, 'superReference', {
      value: t.identifier('E56P')
    }).superReference;
  }

  get classClosure() {
    return Object.defineProperty(this, 'classClosure', {
      value: t.callExpression(
        t.functionExpression(null, this.closureParameters, this.closureBody),
        this.closureArguments
      )
    }).classClosure;
  }

  get closureParameters() {
    return Object.defineProperty(this, 'closureParameters', {
      value: [this.superReference]
    }).closureParameters;
  }

  get closureArguments() {
    return Object.defineProperty(this, 'closureArguments', {
      value: []
    }).closureArguments;
  }

  get closureBody() {
    return Object.defineProperty(this, 'closureBody', {
      value: t.blockStatement([
        this.classConstructor,
        ... this.classMembers,
        t.returnStatement(this.classReference)
      ])
    }).closureBody;
  }

  get classInheritace() {
    return [t.expressionStatement(t.callExpression(
      t.memberExpression(t.identifier('E56'), t.identifier('IC')), [
        this.classReference,
        this.superReference
      ]))];
  }

  get classMembers() {
    return [t.expressionStatement(t.callExpression(
      t.memberExpression(t.identifier('Class'), t.identifier('define')), [
        this.classReference, t.objectExpression(this.members)
      ]))];
  }


  get classConstructor() {
    return Object.defineProperty(this, 'classConstructor', {
      value: t.variableDeclaration("var", [
        t.variableDeclarator(this.classReference,
          t.functionDeclaration(this.className, this.constructorParameters, this.constructorBody)
        )
      ])
    }).classConstructor;
  }

  get constructorParameters() {
    console.info(this.construct);
    return Object.defineProperty(this, 'constructorParameters', {
      value: this.construct ? this.construct.params : []
    }).constructorParameters;
  }

  get constructorBody() {
    return Object.defineProperty(this, 'constructorBody', {
      value: this.construct ? this.construct.body : t.blockStatement([])
    }).constructorBody;
  }

  /**
   * Description
   */
  constructor(path:TraversalPath, file:File) {
    this.file = file;
    this.path = path;
    this.parent = path.parent;
    this.scope = path.scope;
    this.node = path.node;
  }

  /**
   * Description
   *
   * @returns {Array}
   */

  run() {
    this.initMembers();
    this.initConstructor();
    return this.classClosure;
  }

  initConstructor() {
    if(this.construct){
      this.construct = this.construct.value;
    }
  }

  initMembers() {
    var p = this.members = [], members = {
      i: [],
      n: {s: {}, i: {}}
    };
    if (this.node.body.body) {
      for (var member of this.node.body.body) {
        if (member.computed) {
          members.i.push(member);
        } else
        if (member.kind == 'constructor') {
          if (!this.construct) {
            this.construct = member;
          } else {
            throw this.file.errorWithNode(member.key, messages.get("scopeDuplicateDeclaration", key));
          }
        } else {
          var s, holder;
          holder = member.static ? (s = ':', members.n.s) : (s = '.', members.n.i);
          var key = s + (member.key.name);
          if (!holder[key]) {
            holder = holder[key] = {}
          } else {
            holder = holder[key];
          }
          if (member.type == 'ClassProperty') {
            member.kind = 'field';
          }
          if (!member.kind) {
            console.info(member);
          }
          if (!holder[member.kind]) {
            holder[member.kind] = member;
          } else {
            console.info(member.kind, holder);
            throw this.file.errorWithNode(member.key, messages.get("scopeDuplicateDeclaration", key));
          }
          if (holder.method && (holder.get || holder.set || holder.field)) {
            throw this.file.errorWithNode(member.key, messages.get("scopeDuplicateDeclaration", key));
          }
        }
      }
    }
    Object.keys(members.n.s).forEach((key)=> {
      p.push(this.initMember(key,members.n.s[key]));
    });
    Object.keys(members.n.i).forEach((key)=> {
      p.push(this.initMember(key,members.n.i[key]));
    });
  }

  initMember(key,member) {
    var k,v;
    if (member.method) {
      k = t.literal('M'+key);
      v = this.initMethod(member.method);
    } else {
      k = t.literal('P'+key);
      v = this.initField(member.field, member.get, member.set);
    }
    return t.property("init",k,v);
  }

  initField(field, getter, setter) {
    var p = [], d = [],m;
    if (getter) {
      if(getter.decorators){
        d = d.concat(getter.decorators.map(d=>d.expression));
      }
      getter.value.id = t.identifier(getter.key.name + '_get');
      p.push(t.property("init", t.literal("g"), getter.value))
    }
    if (setter) {
      if(setter.decorators){
        d = d.concat(setter.decorators.map(d=>d.expression));
      }
      setter.value.id = t.identifier(setter.key.name + '_set');
      p.push(t.property("init", t.identifier("s"), setter.value))
    }
    if (field) {
      if(field.decorators){
        d = d.concat(field.decorators.map(d=>d.expression));
      }
      m = ClassTransformer.getMask(field);
      if(m){
        p.unshift(t.property("init", t.identifier("m"), t.literal(m)));
      }
      if(field.value){
        field.value = t.functionExpression(field.key, [], t.blockStatement([
          t.returnStatement(field.value)
        ]));
        p.push(t.property("init", t.identifier("v"), field.value));
      }
    }
    return t.objectExpression(p);
  }

  initMethod(member) {
    var p = [], m = ClassTransformer.getMask(member);
    member.value.id = member.key;
    if (member.decorators) {
      p.unshift(t.property("init", t.literal("a"), t.arrayExpression(
        member.decorators.map(d=>d.expression)
      )));
    }
    p.push(t.property("init", t.identifier("v"), member.value));
    if(m){
      p.unshift(t.property("init", t.identifier("m"), t.literal(m)));
    }
    if(p.length==1 && p[0].key.name=='v'){
      return p[0].value;
    }else{
      return t.objectExpression(p);
    }
  }


}

class ClassExpressionTransformer extends ClassTransformer {
  constructor(path:TraversalPath, file:File) {
    super(path,file);
  }
  buildClosure(body) {
    return t.expressionStatement(super.buildClosure(body));
  }
}
class ClassDeclarationTransformer extends ClassTransformer {
  constructor(path:TraversalPath, file:File) {
    super(path,file);
  }
  get closureParameters() {
    return [t.identifier('E56P')];
  }

  get classClosure() {
    var classClosure = Object.getOwnPropertyDescriptor(ClassTransformer.prototype, 'classClosure').get;
    return t.variableDeclaration("var", [
      t.variableDeclarator(this.className, classClosure.call(this))
    ]);
  }
}
class ClassPolyfillTransformer extends ClassTransformer {
  constructor(path:TraversalPath, file:File) {
    super(path,file);
  }

  get closureArguments() {
    return [this.namespace];
  }

  get namespace() {
    return Object.defineProperty(this, 'namespace', {
      value: t.memberExpression(t.identifier("global"), this.className)
    }).namespace;
  }

  get classConstructor() {
    return Object.defineProperty(this, 'classConstructor', {
      value: t.variableDeclaration("var", [
        t.variableDeclarator(this.classReference,
          t.logicalExpression('||',
            this.superReference,
            t.functionDeclaration(this.className, this.constructorParameters, this.constructorBody)
          )
        )
      ])
    }).classConstructor;
  }

  get classClosure() {
    var classClosure = Object.getOwnPropertyDescriptor(ClassTransformer.prototype, 'classClosure').get;
    return t.expressionStatement(t.assignmentExpression("=",
      this.namespace,
      classClosure.call(this)
    ));
  }
  get classMembers() {
    return [t.expressionStatement(t.callExpression(
      t.memberExpression(t.identifier('E56'), t.identifier('polyfill')), [
        this.classReference, t.objectExpression(this.members)
      ]))];
  }
}
