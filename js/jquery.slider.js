/**
 *  slidie() slider plugin
 *
 *  Generates thumbnails and slides continuously through slides.
 *  @TODO: setInterval() for auto sliding on page load
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
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ($, window, document, undefined) {
  "use strict";

  // undefined is used here as the undefined global variable in ECMAScript 3 is
  // mutable (ie. it can be changed by someone else). undefined isn't really being
  // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
  // can no longer be modified.

  // window and document are passed through as local variable rather than global
  // as this (slightly) quickens the resolution process and can be more efficiently
  // minified (especially when both are regularly referenced in your plugin).

  // Create the defaults once
  var pluginName = "slidie",
    defaults = {
      max_slide_thumbs: 5,
      active_class: "active",
      previous_button_class: "prev",
      next_button_class: "next",
      thumbs_class: "thumbs",
      onAdLoaded: $.noop
    };

  // The actual plugin constructor
  function Plugin(element, options) {
    this.element = element;

    // jQuery has an extend method which merges the contents of two or
    // more objects, storing the result in the first object. The first object
    // is generally empty as we don't want to alter the default options for
    // future instances of the plugin
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  // Avoid Plugin.prototype conflicts
  $.extend(Plugin.prototype, {
    init: function () {
      var self = this,
        $el = $(this.element),
        ul = $el.find("ul"),
        slide_count = ul.children().length, // array of slides
        slide_width = slide_count * 100.00, // sets the UL width to a multiple of each slide * 100%
        slide_height = 400, // max height of the slide images
        new_slide_height = slide_height,
        thumb_height = slide_height,
        slide_width_pc = 100.0 / slide_count, // % width of each slide
        slide_index, // will be used to define the active slide
        first_slide = ul.find("li:first-child"),
        last_slide = ul.find("li:last-child"),
        thumbsArray = [], // initially empty thumbs array

        previous_button_class = self.settings.previous_button_class,
        next_button_class = self.settings.next_button_class,
        thumbs_class = self.settings.thumbs_class,
        max_slide_thumbs = self.settings.max_slide_thumbs, // will decide the widths of each thumb
        active_class = self.settings.active_class;


      // Slide function
      // ==========================
      var slide = function (new_slide_index) {

        // Set animate the left margin of the ul by a multiple of 100%
        // and the integer passed in, (ie 1 = -100%;)
        var margin_left_pc = (new_slide_index * (-100) - 100) + "%";

        console.log('New slide index passed in: ' + new_slide_index);
        console.log('Margin left percentage of ul: ' + margin_left_pc);

        // only call the callback function after the animatiin slide has complete
        // this is why we append and prepend slides to the slide array
        // so that the animation can appear smmoth because the slide exists
        // - otherwise there will be a white background flash without image
        // then the ul margin left gets reset to the actual relevent slide (first/last)
        ul.animate({"margin-left": margin_left_pc}, 400, function () {

          console.log('Initial animation complete');

          // if the index is the first slide [0]
          // - at the first slide and click previous button
          // ul margin left set to slide array length * -100%
          // and set integer to the last slide (not the appended slide)
          // ie, 3 slides, margin-left -300%;
          if (new_slide_index < 0) {
            var leftMagrinSetTo = (slide_count) * (-100);
            ul.css("margin-left", leftMagrinSetTo + '%');
            new_slide_index = slide_count - 1;

            console.log('New margin left set to: ' + leftMagrinSetTo);
          }

          // if the index is e1ual to the length of the index array
          // - at the last slide and click the next button
          // reset the ul margin left to -100% (first slide)
          // and reset integer to 0
          else if (new_slide_index >= slide_count) {
            ul.css("margin-left", "-100%");
            new_slide_index = 0;
            console.log('New left margin set to: -100%');
          }

          // reset the slide index to the new passed in slide index
          slide_index = new_slide_index;
          console.log('Global slide index reset to: ' + slide_index);

          styleActiveThumb(slide_index);

        });
      };


      // Set active thumb function
      // ==========================
      // style the thumb which matches the slide array index
      var styleActiveThumb = function (newIndex) {

        // loop through thumbs and compare index with passed in newIndex
        thumbItem.each(function (i) {

          // Style the active thumb
          // active thumb is the thumb index which matches the slide index
          if (i === newIndex) {
            thumbItem.css("opacity", ".7");
            $(this).css("opacity", "1");
          }
        });
      };

      // Slider init
      // ==================================================
      // Clone the last slide and add as first li element
      last_slide.clone().prependTo(ul);

      // Clone the first slide and add as last li element
      first_slide.clone().appendTo(ul);

      // remove the active class from the newly cloned last slide
      // if the first slide html class was set to active
      last_slide = ul.find("li:last-child");
      if (last_slide.attr("class") === active_class) {
        last_slide.removeAttr("class");
      }

      // move the ul to the left equal to the width of the newly prepended
      // first slide, so that the first slide is hidden to the left of the view
      ul.css({
        "margin-left": "-100%",
        "width": slide_width + "%"
      });

      // set the left position of each slide percentage
      // based on the % width of each index in the loop
      // which matches the slide width array
      // - this removes the need for a width in CSS
      ul.find("li").each(function (indx) {

        // store the images in a thumbs array
        var image = $(this).find('img').attr('src');
        thumbsArray.push(image);

        var left_percent = (slide_width_pc * indx) + "%";
        $(this).css({left: left_percent});
        $(this).css({width: (100 / slide_count) + "%"});

        // Set the active slide index
        if ($(this).hasClass(self.settings.active_class)) {
          slide_index = indx - 1;
        }

        // find the height of each slide image
        var slideImageHeight = $(this).find("img").height();

        if (slideImageHeight < new_slide_height) {
          new_slide_height = slideImageHeight;
        }

        if (new_slide_height < slide_height) {
          $el.height(new_slide_height);
        }

        else {
          $el.height(slide_height);
        }

      });

      // Prev/next buttons init
      // ==========================
      // Pass in negative 1 to index integer to slide()
      $("." + previous_button_class).click(function () {
        console.log("-- prev button clicked");
        slide(slide_index - 1);
      });

      // Pass in positive 1 to index integer to slide()
      $("." + next_button_class).click(function () {
        console.log("++ next button clicked");
        slide(slide_index + 1);
      });

      // Thumbnail Init
      // ==========================
      // slice the first and last items from the thumbs array
      // because we cloned them above and we dont need them for the thumbs
      thumbsArray = thumbsArray.slice(1, -1);

      // Build the thumbs markup from the thumbs array
      var thumbList = "<div class='" + thumbs_class + "'><ul class='" + thumbs_class + "__list'>";
      for (var i = 0; i < thumbsArray.length; i++) {
        thumbList += "<li class='" + thumbs_class + "__item'>";
        thumbList += "<img src='" + thumbsArray[i] + "' class='" + thumbs_class + "__image'>";
        thumbList += "</li>";
      }
      thumbList += "</ul></div>";

      // Add the thumbs to the DOM
      $el.after(thumbList);


      // set the width of each thumb item
      var $thumbs = $("." + thumbs_class),
        thumbItem = $thumbs.find("li"),
        thumbWidth = 100.0 / max_slide_thumbs;

      // Set the width of each thumb
      thumbItem.css("width", thumbWidth + "%");


      // pass the thumb index as new slide index
      // to the slide() function
      thumbItem.click(function () {
        var thumbIndex = $(this).index();
        slide(thumbIndex);
        console.log('clicked ' + thumbIndex);
      });

      // Find the shortest thumbnail image and sets the parent div height
      // get the height of each image
      thumbItem.each(function () {
        // get the height of each image
        var imageHeight = $(this).find("img").height();
        if (imageHeight < thumb_height) {
          thumb_height = imageHeight;
        }

        // Set the thumbs height
        $thumbs.css("height", thumb_height);

      });


      slide(slide_index);
      // pass default slide Index to style correct thumb on page load
      styleActiveThumb(slide_index);
    }

  });

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" +
          pluginName, new Plugin(this, options));
      }
    });
  };

})(jQuery, window, document);
