Asx.define('asx/core/index', function (module) {
  with (this) {
    return {
      'imports': {
        './core-one': '*',
        './core-two': '*'
      },
      'execute': function (asx) {
        asx.c$(function c$Core(_class) {
          return {
            '#constructor': function Core() {}
          };
        })

        console.info(One, Two);
        return {
          Core: Core
        };
      }
    };
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hc3gvY29yZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3FDQUdhLElBQUk7Ozs7QUFHakIsZUFBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLENBQUEiLCJmaWxlIjoiYXN4L2NvcmUvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vY29yZS1vbmUnO1xuaW1wb3J0ICcuL2NvcmUtdHdvJztcblxuZXhwb3J0IGNsYXNzIENvcmUge1xuXG59XG5jb25zb2xlLmluZm8oT25lLFR3bylcbiJdfQ==