/**
 *  slidie() slider plugin
 *
 *  Generates thumbnails and slides continuously through slides.
 *
 *  Options:
 *  - max_number_slides (integer): max number of slides and thumbs
 *  - auto_slide (boolean): whether to auto slide
 *  - auto_slide_speed (integer): the speed of the slide
 *  - auto_slide_delay (integer): the delay of the slider
 *  - max_slide_height (integer): the max height of the slider
 *  - active_class (string): sets the active slide and thumb
 *  - previous_button_class (string): previous button class name
 *  - next_button_class (string): next button class name
 *  - thumbs_class (string): class name for generated thumbs markup
 *
 *  Made by Andrew Smith andrew.smith03@adelaide.edu.au
 *
 */
(function ($) {
  "use strict";
  var pluginName = "ua_slidie";
  var defaults = {
    max_slide_thumbs: 5,
    auto_slide: true,
    auto_slide_speed: 700,
    auto_slide_delay: 2000,
    max_slide_height: 400,
    active_class: "is-active",
    previous_button_class: "c-banner-slider__button-previous",
    next_button_class: "c-banner-slider__button-next",
    pause_button_class: "c-banner-slider__button-pause",
    play_button_class: "c-banner-slider__button-play",
    thumbs_class: "c-banner-slider-thumbs"
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
      var slide_width = self.settings.max_slide_thumbs * 100.00;
      var slide_width_pc = 100.0 / self.settings.max_slide_thumbs;
      var slide_index = 0;
      var thumbs_array = [];
      var tag_class_RE = /^[A-Za-z][-_A-Za-z0-9]+$/;
      var resize_event;
      var autoTimer = null;
      var $pauseButton = $("." + self.settings.pause_button_class);
      var $playButton = $("." + self.settings.play_button_class);

      // Auto Slide functions
      // ==========================
      function autoSlide() {
        self.slide(self.slide_index + 1);
        startAutoSlide();
      }
      function startAutoSlide() {  // use a one-off timer
        autoTimer = setTimeout(autoSlide, self.settings.auto_slide_delay);
      }
      function stopAutoSlide() {
        clearTimeout(autoTimer);
        $playButton.show();
        $pauseButton.hide();
      }

      // Basic user validation
      // ==========================
      // ensure class names are string and follow CSS BEM
      function validateClassString($class) {
        $.each($class, function (index, value) {
          if (typeof self.settings[value] !== 'string' || self.settings[value].match(tag_class_RE) === null) {
            var resetClass = self.settings[value] = self._defaults[value];
            return resetClass;
          }
        });
      }

      validateClassString([
        "active_class",
        "previous_button_class",
        "next_button_class",
        "thumbs_class"
      ]);

      // ensure max slides is an integer and not greater than the default
      if (!$.isNumeric(self.settings.max_slide_thumbs) || (self.settings.max_slide_thumbs > self._defaults.max_slide_thumbs)) {
        self.settings.max_slide_thumbs = self._defaults.max_slide_thumbs;
        slide_width = self.settings.max_slide_thumbs * 100.00;
        slide_width_pc = 100.0 / self.settings.max_slide_thumbs;
      }

      // ensure auto_slide is boolean
      if (typeof self.settings.auto_slide !== 'boolean') {
        self.settings.auto_slide = self._defaults.auto_slide;
      }

      // ensure auto-slide speed, delay and max_slide_height is an integer
      if (!$.isNumeric(self.settings.auto_slide_speed)) {
        self.settings.auto_slide_speed = self._defaults.auto_slide_speed;
      }
      if (!$.isNumeric(self.settings.auto_slide_delay)) {
        self.settings.auto_slide_delay = self._defaults.auto_slide_delay;
      }
      if (!$.isNumeric(self.settings.max_slide_height)) {
        self.settings.max_slide_height = self._defaults.max_slide_height;
      }

      // Remove and clone slides
      // ==========================

      // Remove any slides outside the defined max_number_slides settings default variable
      $ul.find("li:nth-child(n+" + (self.settings.max_slide_thumbs + 1) + ")").remove();

      // Clone the first and last slide for smooth animation and remove the active class
      var $first_slide = $ul.find("li:first-child");
      var $last_slide = $ul.find("li:last-child");
      $first_slide.clone().appendTo($ul).removeClass(self.settings.active_class);
      $last_slide.clone().prependTo($ul).removeClass(self.settings.active_class);

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
        self.thumbs_array = thumbs_array;
        self.thumbs_array.push(image_src);

        // Give each slide its margin left %
        $(this).css({
          left: slide_left_percent,
          width: (100 / self.settings.max_slide_thumbs) + "%"
        });

        // Set the initial index to the element with "active" class
        if ($(this).hasClass(self.settings.active_class)) {
          self.settings.slide_index = index - 1;
          slide_index = self.settings.slide_index;
        }

      });

      // Recalculate slide and thumb height after resize event
      $(window).on("resize", function () {
        clearTimeout(resize_event);
        resize_event = setTimeout(function () {
          self.setDimensions();
        }, 250);
      });

      // Build the thumbs first
      self.buildThumbs();
      // Set the slide and thumb list heights
      self.setDimensions();
      // Init the slide
      self.slide(slide_index);
      // Listen for keyboard events
      $(document).keydown(function (key) {
        // stopAutoSlide();
        self.keyBoardEvent(key);
      });

      // All the sliding
      // ==========================
      // show/hide the play/pause buttons and start/pause autoSlide
      if (self.settings.auto_slide) {
        $pauseButton.show();
        $playButton.hide();
        startAutoSlide();
      }
      else {
        $playButton.show();
        $pauseButton.hide();
        stopAutoSlide();
      }
      $playButton.click(function () {
        $(this).hide();
        $pauseButton.show();
        startAutoSlide();
      });
      $pauseButton.click(function () {
        $(this).hide();
        $playButton.show();
        stopAutoSlide();
      });

      // Prev/next buttons
      $("." + self.settings.previous_button_class).click(function () {
        self.slide(self.slide_index - 1);
        stopAutoSlide();
      });
      $("." + self.settings.next_button_class).click(function () {
        self.slide(self.slide_index + 1);
        stopAutoSlide();
      });

      // Swipe
      if ($.fn.swipe) {
        $el.swipe({
          swipeLeft: function () {
            self.slide(self.slide_index + 1);
            stopAutoSlide();
          },
          swipeRight: function () {
            self.slide(self.slide_index - 1);
            stopAutoSlide();
          }
        });
      }

      // Click a thumb
      self.thumbs.find("li").click(function () {
        var thumb_index = $(this).index();
        self.slide(thumb_index);
        self.setActive(thumb_index);
        stopAutoSlide();
      });

    },
    slide: function (new_slide_index) {
      var self = this;
      var $el = $(this.element);
      var $ul = $el.find("ul");
      var margin_left_pc = (new_slide_index * (-100) - 100) + "%";

      $ul.animate({"margin-left": margin_left_pc}, self.settings.auto_slide_speed, function () {
        if (new_slide_index < 0) {
          var left_magrin_set_to = (self.settings.max_slide_thumbs) * (-100);
          $ul.css("margin-left", left_magrin_set_to + '%');
          new_slide_index = self.settings.max_slide_thumbs - 1;
        }
        else if (new_slide_index >= self.settings.max_slide_thumbs) {
          $ul.css("margin-left", "-100%");
          new_slide_index = 0;
        }
        self.slide_index = new_slide_index;

        self.setActive(new_slide_index);

        return this;
      });
    },
    setActive: function (new_index) {
      var self = this;
      var $el = $(this.element);
      var $ul = $el.find('ul');
      var new_slide_index = new_index + 1;

      self.thumbs.find("li").each(function (i) {
        if (i === new_index) {
          self.thumbs.find("li").removeClass(self.settings.active_class);
          $(this).addClass(self.settings.active_class);
        }
      });
      $ul.find("li").each(function (i) {
        if (i === new_slide_index) {
          $ul.find("li").removeClass(self.settings.active_class);
          $(this).addClass(self.settings.active_class);
        }
      });

      self.slide_index = new_index;

      return this;
    },
    buildThumbs: function () {
      var self = this;
      var $el = $(this.element);
      var thumbs_array = self.thumbs_array;

      // Generate thumbs
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
      // ==========================

      // variables defined after thumb markup generated
      self.thumbs = $("." + self.settings.thumbs_class);

      return this;
    },
    setDimensions: function () {
      var self = this;
      var $el = $(this.element);
      var $ul = $el.find('ul');
      var thumb_height = self.settings.max_slide_height;
      var $thumbs = self.thumbs;
      var $thumb_item = $thumbs.find("li");
      var thumb_width = 100.0 / self.settings.max_slide_thumbs;

      // Remove the style
      $el.removeAttr("style");

      // Set the height of the slide list
      $ul.find("li").each(function () {
        var $image = $(this).find('img');
        var new_slide_height = self.settings.max_slide_height;

        if ($image.height() < new_slide_height) {
          new_slide_height = $image.height();
        }
        if (new_slide_height < self.settings.max_slide_height) {
          $el.css("height", new_slide_height);
        }
        else {
          $el.css("height", self.settings.max_slide_height);
        }

        // set the height of the thumb list
        self.thumbs.find("li").each(function () {
          var image_height = $(this).find("img").height();
          if (image_height < thumb_height) {
            thumb_height = image_height;
          }
          self.thumbs.css({
            "height": thumb_height,
            "width": $el.width()
          });
        });
        // Set the width of each thumb
        $thumb_item.css("width", thumb_width + "%");
      });
      return this;
    },
    keyBoardEvent: function (key) {
      var self = this;
      var key_code = parseInt(key.which, 10);
      switch (key_code) {
        // left
        case 37:
          self.slide(self.slide_index - 1);
          break;
        // right
        case 39:
          self.slide(self.slide_index + 1);
          break;
      }
      return this;
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
