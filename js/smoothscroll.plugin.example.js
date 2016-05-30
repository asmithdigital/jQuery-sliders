(function ($) {
  "use strict";

  var pluginName = 'ua_smoothscroll';
  var defaults = {
    speed: 1000,
    filter: '[href*=#]:not([href=#])',
    offset: 0
  };

  function Plugin(element, options) {
    this.element = element;
    this.settings = $.extend({}, defaults, options);
    this.defaults = defaults;
    this.name = pluginName;
    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function () {
      var self = this;
      var $el = $(this.element);
      // Test to ensure elements provided match against the filter.
      if ($el.is(self.settings.filter)) {
        $el.on('click', function (event) {
          event.preventDefault();
          self.click(this);
        });
      }
    },
    click: function (element) {
      var self = this;
      if (location.pathname.replace(/^\//, '') === element.pathname.replace(/^\//, '') && location.hostname === element.hostname) {
        var target = $(element.hash);
        target = target.length ? target : $('[name=' + element.hash.slice(1) + ']');
        if (target.length) {
          $('html,body').animate({
            scrollTop: target.offset().top - self.settings.offset
          }, self.settings.speed);
          return false;
        }
      }
    }
  });

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      }
    });
  };
})(jQuery);
