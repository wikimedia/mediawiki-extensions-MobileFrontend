/**
 * micro.tap
 * https://github.com/jgonera/micro.tap
 */

;(function($) {
  var $window = $(window), moved, tapEv;

  function handleTap(ev) {
    tapEv = $.Event('tap');
    if (!moved) $(ev.target).trigger(tapEv);
  }

  // jQuery's on() doesn't allow useCapture argument (last argument, true)
  window.addEventListener('click', function(ev) {
    if (tapEv.isDefaultPrevented()) {
      ev.stopPropagation();
      ev.preventDefault();
    }
  }, true);

  if ('ontouchstart' in window) {
    $window.
      on('touchstart', function(ev) {
        moved = false;
      }).
      on('touchmove', function() {
        moved = true;
      }).
      on('touchend', handleTap);
  } else {
    $window.on('mouseup', handleTap);
  }
}(jQuery));

