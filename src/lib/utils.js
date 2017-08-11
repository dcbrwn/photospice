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

function mapPointerEvent(event) {
  const pointDataKeys = ['pageX', 'pageY', 'clientX', 'clientY'];
  const result = {};
  result.isTouchEvent = !!event.touches;
  if (result.isTouchEvent) {
    _.assign(result, _.pick(event.touches[0], pointDataKeys));
  } else {
    _.assign(result, _.pick(event, pointDataKeys));
  }
  result.target = event.target;
  result.originalEvent = event;
  return result;
}

export function dragHelper(options) {
  const onStart = typeof options.onStart === 'function' ? options.onStart : _.identity;
  const onMove = typeof options.onMove === 'function' ? options.onMove : _.identity;
  const onEnd = typeof options.onEnd === 'function' ? options.onEnd : _.identity;

  return function onDragStart(event) {
    const mappedEvent = mapPointerEvent(event);
    const init = onStart(mappedEvent);
    const eventNames = mappedEvent.isTouchEvent
      ? ['touchmove', 'touchend']
      : ['mousemove', 'mouseup'];

    if (!mappedEvent.isTouchEvent) event.preventDefault();

    if (options.moveOnStart) {
      onDragMove(event);
    }

    function onDragMove(event) {
      event.preventDefault();
      const mappedEvent = mapPointerEvent(event);
      onMove(init, mappedEvent);
    }

    function onDragEnd(event) {
      onEnd(event);
      document.removeEventListener(eventNames[0], onDragMove, { passive: false });
      document.removeEventListener(eventNames[1], onDragEnd);
    }

    document.addEventListener(eventNames[0], onDragMove, { passive: false });
    document.addEventListener(eventNames[1], onDragEnd);
  }
}
