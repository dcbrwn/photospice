import _ from 'lodash';

export function bound(target, key, descriptor) {
  return {
    configurable: false,
    get: function() {
      return descriptor.value.bind(this);
    },
  };
}

export function throttle(delay) {
  return function(target, key, descriptor) {
    return {
      configurable: false,
      get: function() {
        return _.throttle(descriptor.value, delay);
      },
    };
  }
}

export function toCssColor(color) {
  return `rgb(${color[0] * 255 | 0}, ${color[1] * 255 | 0}, ${color[2] * 255 | 0})`;
}

export function classes(...classes) {
  return classes.reduce((acc, value) => {
    if (typeof value === 'string') {
      acc.push(value);
      return acc;
    } else if (_.isObject(value)) {
      return acc.concat(_(value)
        .pickBy()
        .keys()
        .value());
    }
  }, [])
  .join(' ');
}
