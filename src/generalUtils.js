//unlike core/utils, we'll put stateless utils here.

class BaseClass {}
class MixinBuilder {
  constructor(superclass){
    this.superclass = superclass;
  }
  with(...mixins){
    return mixins.reduce((c,mixin) => mixin(c), this.superclass);
  }
}
// class MyClass extends mix(MyBaseClass).with(Mixin1, Mixin2) { ... }
const mix = (superclass) => new MixinBuilder(superclass);

export {
  BaseClass,
  mix,
};
