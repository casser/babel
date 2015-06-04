Asx.define('asx/core/core-two', function (module) {
  with (this) {
    return {
      imports: {
        './utils/u2': '*'
      },
      execute: function (asx) {
        asx.c$(function c$Two(_class) {
          return {
            '#constructor': function Two() {}
          };
        });

        console.info('TWO');
        return {
          Two: Two
        };
      }
    };
  }
});