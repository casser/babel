import DefaultFormatter from "./_default";
import CommonFormatter from "./common";
import includes from "lodash/collection/includes";
import values from "lodash/object/values";
import * as util from  "../../util";
import * as t from "../../types";

export default class AsxFormatter extends DefaultFormatter {
  static options(ast){
    var options = {};
    if(ast.comments && ast.comments.length){
      var comment = ast.comments.shift();
      if(comment.type == 'Block'){
        options = comment.value.match(/\*\s*@module\s+(\{[^}]*\})/g);
        if(options){
          options = options[0].split('\n').map(l=>{
            return l.replace(/\s*\*(.*)/,'$1').trim()
          });
          options = options.join(' ').replace(/\s*\@module\s*/,'');
          options = (new Function('return '+options+';'))();
        }
      }else{
        ast.comments.unshift(comment);
      }
    }
    return options;
  }
  init() {
    CommonFormatter.prototype._init.call(this, this.hasNonDefaultExports);
  }

  buildDependencyLiterals() {
    var names = [];
    for (var name in this.ids) {
      names.push(t.literal(name));
    }
    return names;
  }

  /**
   * Wrap the entire body in a `define` wrapper.
   */

  transform(program) {
    var options = AsxFormatter.options(this.file.ast);
    DefaultFormatter.prototype.transform.apply(this, arguments);

    var body = program.body;
    body.shift();
    // build an array of module names



    //var call = ;
    console.info(options);
    var definer = t.functionExpression(null, [t.identifier("module")], t.blockStatement(body));
    if(options.bind){
      definer = t.callExpression(
        t.memberExpression(
          definer,
          t.identifier("bind")
        ),[
          t.callExpression(t.identifier("eval"),[t.literal("this.global=this")])
        ]
      );
    }
    if(options.execute){
      definer = t.callExpression(definer,[]);
    }
    if(options.runtime){
      body.unshift(t.expressionStatement(util.template("asx-runtime")))
    }
    program.body = [t.expressionStatement(definer)];
  }

  /**
   * Get the AMD module name that we'll prepend to the wrapper
   * to define this module
   */

  getModuleName() {
    if (this.file.opts.moduleIds) {
      return super.getModuleName();
    } else {
      return null;
    }
  }

  _getExternalReference(node) {
    return this.scope.generateUidIdentifier(node.source.value);
  }

  importDeclaration(node) {
    this.getExternalReference(node);
  }

  importSpecifier(specifier, node, nodes) {
    var key = node.source.value;
    var ref = this.getExternalReference(node);

    if (t.isImportNamespaceSpecifier(specifier) || t.isImportDefaultSpecifier(specifier)) {
      this.defaultIds[key] = specifier.local;
    }

    if (this.isModuleType(node, "absolute")) {
      // absolute module reference
    } else if (this.isModuleType(node, "absoluteDefault")) {
      // prevent unnecessary renaming of dynamic imports
      this.ids[node.source.value] = ref;
      ref = t.memberExpression(ref, t.identifier("default"));
    } else if (t.isImportNamespaceSpecifier(specifier)) {
      // import * as bar from "foo";
    } else if (!includes(this.file.dynamicImported, node) && t.isSpecifierDefault(specifier) && !this.noInteropRequireImport) {
      // import foo from "foo";
      var uid = this.scope.generateUidIdentifier(specifier.local.name);
      nodes.push(t.variableDeclaration("var", [
        t.variableDeclarator(uid, t.callExpression(this.file.addHelper("interop-require"), [ref]))
      ]));
      ref = uid;
    } else {
      // import { foo } from "foo";
      var imported = specifier.imported;
      if (t.isSpecifierDefault(specifier)) imported = t.identifier("default");
      ref = t.memberExpression(ref, imported);
    }

    this.internalRemap[specifier.local.name] = ref;
  }

  exportSpecifier(specifier, node, nodes) {
    if (this.doDefaultExportInterop(specifier)) {
      this.passModuleArg = true;
      nodes.push(util.template("exports-default-assign", {
        VALUE: specifier.local
      }, true));
    } else {
      CommonFormatter.prototype.exportSpecifier.apply(this, arguments);
    }
  }

  exportDeclaration(node, nodes) {
    if (this.doDefaultExportInterop(node)) {
      this.passModuleArg = true;

      var declar = node.declaration;
      var assign = util.template("exports-default-assign", {
        VALUE: this._pushStatement(declar, nodes)
      }, true);

      if (t.isFunctionDeclaration(declar)) {
        // we can hoist this assignment to the top of the file
        assign._blockHoist = 3;
      }

      nodes.push(assign);
      return;
    }

    DefaultFormatter.prototype.exportDeclaration.apply(this, arguments);
  }
}
