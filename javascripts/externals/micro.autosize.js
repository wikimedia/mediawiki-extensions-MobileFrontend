/**
 * micro.autosize
 * https://github.com/jgonera/micro.js
 */

;(function ($) {
  var $window = $(window);

  function resize() {
    var $el = $(this), scrollTop, maxHeight;

    if ($el.prop('scrollHeight')) {
      scrollTop = $window.scrollTop();
      height = $el.prop('scrollHeight');
      maxHeight = $( window ).height() - 2 - $el.offset().top;
      // prevent textarea growing bigger than the window.
      if (height > maxHeight) {
        height = maxHeight;
      }
      $el.
        css('height', 'auto').
        // can't reuse prop('scrollHeight') because we need the current value
        css('height', (height + 2) + 'px');
      $window.scrollTop(scrollTop);
    }
  }

  $.fn.microAutosize = function () {
    // setTimeout to let the textarea redraw if used just after val()
    setTimeout($.proxy(resize, this), 0);
    this.on('input', resize);
    return this;
  };
}(jQuery));

