/**
 *  slidie() slider plugin
 *
 *  Generates thumbnails and slides continuously through slides.
 *
 *  @TODO:
 *  - setInterval() for auto sliding on page load
 *  - add touch events http://hammerjs.github.io/getting-started/
 *  - use CSS transitions for animations
 *  - resolve responsive layouts
 *
 *  Options:
 *  - max_number_slides (integer): max number of slides and thumbs
 *  - active_class (string): sets the active slide and thumb
 *  - previous_button_class (string): previous button class name
 *  - next_button_class (string): next button class name
 *  - thumbs_class (string): class name for generated thumbs markup
 *  - onAdLoaded: (object): @TODO
 *
 *  Made by Andrew Smith andrew.smith03@adelaide.edu.au
 *
 *  jquery-boilerplate - v4.0.0
 *  A jump-start for jQuery plugins development.
 *  http://jqueryboilerplate.com
 *
 *  Made by Zeno Rocha
 *  Under MIT License
 */
;(function ($) {
  "use strict";
  var pluginName = "ua_slidie";
  var defaults = {
    max_slide_thumbs: 5,
    auto_slide: true,
    autoslide_speed: 3000,
    active_class: "is-active",
    previous_button_class: "c-banner-slider__button-previous",
    next_button_class: "c-banner-slider__button-next",
    thumbs_class: "thumbs"
  };

  // The actual plugin constructor
  function Plugin(element, options) {
    this.element = element;
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  // Avoid Plugin.prototype conflicts
  $.extend(Plugin.prototype, {
    init: function () {
      var self = this;
      var $el = $(this.element);
      var $ul = $el.find("ul");
      var $first_slide = $ul.find("li:first-child");
      var $last_slide = $ul.find("li:last-child");
      var slide_width = self.settings.max_slide_thumbs * 100.00;
      var slide_height = 400;
      var slide_width_pc = 100.0 / self.settings.max_slide_thumbs;
      var slide_index = 0;
      var new_slide_height = slide_height;
      var thumb_height = slide_height;
      var thumbs_array = [];
      var tag_class_RE = /^[A-Za-z][-_A-Za-z0-9]+$/;


      // Basic user validation
      // ==========================

      // ensure class names are string
      if (typeof self.settings.active_class !== 'string' || self.settings.active_class.match(tag_class_RE) === null) {
        self.settings.active_class = self._defaults.active_class;
      }
      if (typeof self.settings.previous_button_class !== 'string' || self.settings.active_class.match(tag_class_RE) === null) {
        self.settings.previous_button_class = self._defaults.previous_button_class;
      }
      if (typeof self.settings.next_button_class !== 'string' || self.settings.active_class.match(tag_class_RE) === null) {
        self.settings.next_button_class = self._defaults.next_button_class;
      }
      if (typeof self.settings.thumbs_class !== 'string' || self.settings.active_class.match(tag_class_RE) === null) {
        self.settings.thumbs_class = self._defaults.thumbs_class;
      }

      // ensure max slides is integer and not greater than the default
      if (!$.isNumeric(self.settings.max_slide_thumbs) || (self.settings.max_slide_thumbs > self._defaults.max_slide_thumbs)) {
        self.settings.max_slide_thumbs = self._defaults.max_slide_thumbs;
        slide_width = self.settings.max_slide_thumbs * 100.00;
        slide_width_pc = 100.0 / self.settings.max_slide_thumbs;
      }

      // ensure auto-slide speed is integer
      if (!$.isNumeric(self.settings.autoslide_speed)) {
        self.settings.autoslide_speed = self._defaults.autoslide_speed;
      }

      // ensure auto_slide is boolean
      if (typeof self.settings.auto_slide !== 'boolean') {
        self.settings.auto_slide = self._defaults.auto_slide;
      }


      // Slide function
      // ==========================
      function slide(new_slide_index) {
        var margin_left_pc = (new_slide_index * (-100) - 100) + "%";
        $ul.animate({"margin-left": margin_left_pc}, 400, function () {
          if (new_slide_index < 0) {
            var left_magrin_set_to = (self.settings.max_slide_thumbs) * (-100);
            $ul.css("margin-left", left_magrin_set_to + '%');
            new_slide_index = self.settings.max_slide_thumbs - 1;
          }
          else if (new_slide_index >= self.settings.max_slide_thumbs) {
            $ul.css("margin-left", "-100%");
            new_slide_index = 0;
          }
          slide_index = new_slide_index;
          styleActiveThumb(slide_index);
        });

      }

      // Set active thumb function
      // ==========================
      function styleActiveThumb(new_index) {
        $thumb_item.each(function (i) {
          if (i === new_index) {
            $thumb_item.removeClass(self.settings.active_class);
            $(this).addClass(self.settings.active_class);
          }
        });
      }

      // Remove any slides outside the defined max_number_slides settings default variable
      $ul.find("li:nth-child(n+" + (self.settings.max_slide_thumbs + 1) + ")").remove();

      // Clone the first and last slide for smooth animation and remove the active class
      $last_slide.clone().prependTo($ul).removeClass(self.settings.active_class);
      $first_slide.clone().appendTo($ul).removeClass(self.settings.active_class);

      // set the initial slide margin and width
      $ul.css({
        marginLeft: "-100%",
        width: slide_width + "%"
      });


      // Loop each image and set index,
      // positioning and build thumbs array
      // ==================================================
      $ul.find("li").each(function (index) {
        var $image = $(this).find('img');
        var image_src = $image.attr('src');
        var slide_left_percent = (slide_width_pc * index) + "%";

        // Add each image src to the thumbs array
        thumbs_array.push(image_src);

        // Give each slide its margin left %
        $(this).css({
          left: slide_left_percent,
          width: (100 / self.settings.max_slide_thumbs) + "%"
        });

        // Set the initial index to the element with "active" class
        if ($(this).hasClass(self.settings.active_class)) {
          slide_index = index - 1;
        }

        // set the initial height of slide image height variable
        if ($image.height() < new_slide_height) {
          new_slide_height = $image.height();
        }

        // set the slide list height to the shortest slide image
        if (new_slide_height < slide_height) {
          $el.height(new_slide_height);
        }
        else {
          $el.height(slide_height);
        }

      });

      // Set up autoslide
      var auto_slide = setInterval(function () {
        if (self.settings.auto_slide) {
          slide(slide_index + 1);
        }
      }, self.settings.autoslide_speed);

      // Generate thumbnail images
      // ==========================
      // remove the cloned slides from the thumbs
      thumbs_array = thumbs_array.slice(1, -1);

      // Build the thumbs markup
      var thumb_list = "<div class='" + self.settings.thumbs_class + "'><ul class='" + self.settings.thumbs_class + "__list'>";
      for (var i = 0; i < thumbs_array.length; i++) {
        thumb_list += "<li class='" + self.settings.thumbs_class + "__item'>";
        thumb_list += "<img src='" + thumbs_array[i] + "' class='" + self.settings.thumbs_class + "__image'>";
        thumb_list += "</li>";
      }
      thumb_list += "</ul></div>";
      $el.after(thumb_list);

      // variables defined after thumb markup generated
      var $thumbs = $("." + self.settings.thumbs_class);
      var $thumb_item = $thumbs.find("li");
      var thumb_width = 100.0 / self.settings.max_slide_thumbs;

      $thumb_item.css("width", thumb_width + "%");

      // set the height of each thumb image
      $thumb_item.each(function () {
        var image_height = $(this).find("img").height();
        if (image_height < thumb_height) {
          thumb_height = image_height;
        }
        $thumbs.css("height", thumb_height);
      });

      // Click a thumb
      $thumb_item.click(function () {
        var thumb_index = $(this).index();
        slide(thumb_index);
        clearInterval(auto_slide);
      });

      // Prev/next buttons
      // ==========================
      $("." + self.settings.previous_button_class).click(function () {
        slide(slide_index - 1);
        clearInterval(auto_slide);
      });

      $("." + self.settings.next_button_class).click(function () {
        slide(slide_index + 1);
        clearInterval(auto_slide);
      });

      // Add swipe functionality
      // ==========================
      $el.swipe({
        //Single swipe handler for left swipes
        swipeLeft: function () {
          slide(slide_index + 1);
          clearInterval(auto_slide);
        },
        swipeRight: function () {
          slide(slide_index - 1);
          clearInterval(auto_slide);
        }
      });

      slide(slide_index);
    }
  });

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" +
          pluginName, new Plugin(this, options));
      }
    });
  };

})(jQuery);
