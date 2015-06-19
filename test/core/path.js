var transform = require("../../lib/babel/transformation");
var Plugin    = require("../../lib/babel/transformation/plugin");
var babel     = require("../../lib/babel/api/node");
var chai      = require("chai");

suite("traversal path", function () {
  test("replaceWithSourceString", function () {
    var expectCode = "function foo() {}";

    var actualCode = transform(expectCode, {
      blacklist: "strict",
      plugins: [new Plugin("foobar", {
        visitor: {
          FunctionDeclaration: function () {
            return "console.whatever()";
          }
        }
      })]
    }).code;

    chai.expect(actualCode).to.be.equal("console.whatever();");
  });
});
