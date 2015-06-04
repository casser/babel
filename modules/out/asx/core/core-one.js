Asx.define('asx/core/core-one', function (module) {
  with (this) {
    return {
      imports: {
        './utils/u1': '*'
      },
      execute: function (asx) {
        asx.c$(function c$One(_class) {
          return {
            '#constructor': function One() {}
          };
        });

        console.info('ONE');
        return {
          One: One
        };
      }
    };
  }
});