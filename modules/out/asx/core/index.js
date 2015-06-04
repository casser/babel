Asx.define('asx/core/index', function (module) {
  with (this) {
    return {
      imports: {
        './core-one': '*',
        './core-two': '*'
      },
      execute: function (asx) {
        asx.c$(function c$Core(_class) {
          return {
            '#constructor': function Core() {}
          };
        });

        console.info(One, Two, Tree, Four);
        return {
          Core: Core
        };
      }
    };
  }
});