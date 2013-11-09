/**
 * micro.autosize
 * https://github.com/jgonera/micro.js
 */

;(function($) {
  var $window = $(window);

  $.fn.microAutosize = function() {
    var $el = this;

    $el.on('input', function() {
      var scrollTop;

      if ($el.prop('scrollHeight')) {
        scrollTop = $window.scrollTop();
        $el.
          css('height', 'auto').
          // can't reuse prop('scrollHeight') because we need the current value
          css('height', ($el.prop('scrollHeight') + 2) + 'px');
        $window.scrollTop(scrollTop);
      }
    });

    return $el;
  };
}(jQuery));

