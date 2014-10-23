/**
 * micro.tap
 * Makes tap event available in jQuery.
 * This can be used to beat the 300ms delay that plagues iOS Safari.
 * @see https://developers.google.com/mobile/articles/fast_buttons
 * Note: Surplus in Chrome 32 (http://updates.html5rocks.com/2013/12/300ms-tap-delay-gone-away)
 * https://github.com/jgonera/micro.tap
 */

;(function ($) {
  var $window = $(window), moved, tapEv;

  function handleTap(ev) {
    tapEv = $.Event('tap');
    if (!moved) $(ev.target).trigger(tapEv);
  }

  // FIXME: jQuery's on() doesn't allow useCapture argument (last argument, true)
  window.addEventListener('click', function (ev) {
    // a tap event might be fired programmatically so ensure tapEv has been defined
    if (tapEv && tapEv.isDefaultPrevented()) {
      ev.stopPropagation();
      ev.preventDefault();
    }
  }, true);

  if ('ontouchstart' in window) {
    $window.
      on('touchstart', function (ev) {
        moved = false;
      }).
      on('touchmove', function () {
        moved = true;
      }).
      on('touchend', handleTap);
  } else {
    // FIXME: jQuery's on() doesn't allow useCapture argument (last argument, true)
    window.addEventListener('mouseup', handleTap, true);
  }
}(jQuery));

