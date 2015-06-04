Asx.define('asx/http/index', function (module) {
  with (this) {
    return {
      imports: {
        'node/http': {
          '#': 'Http'
        }
      },
      execute: function (asx) {
        function main(args) {
          console.info(Http);
        }

        return {
          main: main
        };
      }
    };
  }
});