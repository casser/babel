
class Object extends Object {
  static
  commonTest(){
   return "Object.test "+this.name;
  }
  commonTest(){
    return "Object.prototype.test "+this.constructor.name;
  }
  static
  objectTest(){
    return "Object.objectTest "+this.name;
  }
  objectTest(){
    return "Object.prototype.objectTest "+this.constructor.name;
  }
}
class Array extends Array {
  static
  commonTest(){
    return "Array.test "+this.name;
  }
  commonTest(){
    return "Array.prototype.test "+this.constructor.name;
  }
  static
  arrayTest(){
    return "Array.arrayTest "+this.name;
  }
  arrayTest(){
    return "Array.prototype.arrayTest "+this.constructor.name;
  }
}


assert.equal(Object.commonTest(), 'Object.test Object');
assert.equal(({A:1}).commonTest(), 'Object.prototype.test Object');

assert.equal(Object.objectTest(), 'Object.objectTest Object');
assert.equal(({B:2}).objectTest(), 'Object.prototype.objectTest Object');

assert.equal(Array.commonTest(), 'Array.test Array');
assert.equal(['A','1'].commonTest(), 'Array.prototype.test Array');

assert.equal(Array.arrayTest(), 'Array.arrayTest Array');
assert.equal(['B','2'].arrayTest(), 'Array.prototype.arrayTest Array');

assert.equal(Array.objectTest(), 'Object.prototype.objectTest Function');
assert.equal(['C','3'].objectTest(), 'Object.prototype.objectTest Array');

