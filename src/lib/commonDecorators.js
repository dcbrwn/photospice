export function bound(target, key, descriptor) {
  return {
    configurable: false,
    get: function() {
      return descriptor.value.bind(this);
    },
  };
}
