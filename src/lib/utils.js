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

export function dragHelper(options) {
  const onStart = (_.isFunction(options.onStart) && options.onStart) || _.identity;
  const onMove = (_.isFunction(options.onMove) && options.onMove) || _.identity;
  const onEnd = (_.isFunction(options.onMove) && options.onEnd) || _.identity;

  return function onDragStart(event) {
    const init = onStart(event);
    const isTouchEvent = !!event.touches;
    const eventNames = isTouchEvent
      ? ['touchmove', 'touchend']
      : ['mousemove', 'mouseup'];

    function onDragMove(event) {
      if (!isTouchEvent) event.preventDefault();
      const data = isTouchEvent
        ? event.touches[0]
        : event;
      onMove(init, data, event);
    }

    function onDragEnd(event) {
      onEnd(event);
      document.removeEventListener(eventNames[0], onDragMove);
      document.removeEventListener(eventNames[1], onDragEnd);
    }

    document.addEventListener(eventNames[0], onDragMove);
    document.addEventListener(eventNames[1], onDragEnd);
  }
}
