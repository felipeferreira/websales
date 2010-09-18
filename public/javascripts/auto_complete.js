/*  Prototype-UI, version trunk
 *
 *  Prototype-UI is freely distributable under the terms of an MIT-style license.
 *  For details, see the PrototypeUI web site: http://www.prototype-ui.com/
 *
 *--------------------------------------------------------------------------*/

if(typeof Prototype == 'undefined' || !Prototype.Version.match("1.6"))
  throw("Prototype-UI library require Prototype library >= 1.6.0");

if (Prototype.Browser.WebKit) {
  Prototype.Browser.WebKitVersion = parseFloat(navigator.userAgent.match(/AppleWebKit\/([\d\.\+]*)/)[1]);
  Prototype.Browser.Safari2 = (Prototype.Browser.WebKitVersion < 420);
}

if (Prototype.Browser.IE) {
  Prototype.Browser.IEVersion = parseFloat(navigator.appVersion.split(';')[1].strip().split(' ')[1]);
  Prototype.Browser.IE6 =  Prototype.Browser.IEVersion == 6;
  Prototype.Browser.IE7 =  Prototype.Browser.IEVersion == 7;
}

Prototype.falseFunction = function() { return false };
Prototype.trueFunction  = function() { return true  };

/*
Namespace: UI

  Introduction:
    Prototype-UI is a library of user interface components based on the Prototype framework.
    Its aim is to easilly improve user experience in web applications.

    It also provides utilities to help developers.

  Guideline:
    - Prototype conventions are followed
    - Everything should be unobstrusive
    - All components are themable with CSS stylesheets, various themes are provided

  Warning:
    Prototype-UI is still under deep development, this release is targeted to developers only.
    All interfaces are subjects to changes, suggestions are welcome.

    DO NOT use it in production for now.

  Authors:
    - Sébastien Gruhier, <http://www.xilinus.com>
    - Samuel Lebeau, <http://gotfresh.info>
*/

var UI = {
  Abstract: { },
  Ajax: { }
};
Object.extend(Class.Methods, {
  extend: Object.extend.methodize(),

  addMethods: Class.Methods.addMethods.wrap(function(proceed, source) {
    // ensure we are not trying to add null or undefined
    if (!source) return this;

    // no callback, vanilla way
    if (!source.hasOwnProperty('methodsAdded'))
      return proceed(source);

    var callback = source.methodsAdded;
    delete source.methodsAdded;
    proceed(source);
    callback.call(source, this);
    source.methodsAdded = callback;

    return this;
  }),

  addMethod: function(name, lambda) {
    var methods = {};
    methods[name] = lambda;
    return this.addMethods(methods);
  },

  method: function(name) {
    return this.prototype[name].valueOf();
  },

  classMethod: function() {
    $A(arguments).flatten().each(function(method) {
      this[method] = (function() {
        return this[method].apply(this, arguments);
      }).bind(this.prototype);
    }, this);
    return this;
  },

  // prevent any call to this method
  undefMethod: function(name) {
    this.prototype[name] = undefined;
    return this;
  },

  // remove the class' own implementation of this method
  removeMethod: function(name) {
    delete this.prototype[name];
    return this;
  },

  aliasMethod: function(newName, name) {
    this.prototype[newName] = this.prototype[name];
    return this;
  },

  aliasMethodChain: function(target, feature) {
    feature = feature.camelcase();

    this.aliasMethod(target+"Without"+feature, target);
    this.aliasMethod(target, target+"With"+feature);

    return this;
  }
});
Object.extend(Number.prototype, {
  // Snap a number to a grid
  snap: function(round) {
    return parseInt(round == 1 ? this : (this / round).floor() * round);
  }
});
/*
Interface: String

*/

Object.extend(String.prototype, {
  camelcase: function() {
    var string = this.dasherize().camelize();
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  /*
    Method: makeElement
      toElement is unfortunately already taken :/

      Transforms html string into an extended element or null (when failed)

      > '<li><a href="#">some text</a></li>'.makeElement(); // => LI href#
      > '<img src="foo" id="bar" /><img src="bar" id="bar" />'.makeElement(); // => IMG#foo (first one)

    Returns:
      Extended element

  */
  makeElement: function() {
    var wrapper = new Element('div'); wrapper.innerHTML = this;
    return wrapper.down();
  }
});
Object.extend(Array.prototype, {
  empty: function() {
    return !this.length;
  },

  extractOptions: function() {
    return this.last().constructor === Object ? this.pop() : { };
  },

  removeAt: function(index) {
    var object = this[index];
    this.splice(index, 1);
    return object;
  },

  remove: function(object) {
    var index;
    while ((index = this.indexOf(object)) != -1)
      this.removeAt(index);
    return object;
  },

  insert: function(index) {
    var args = $A(arguments);
    args.shift();
    this.splice.apply(this, [ index, 0 ].concat(args));
    return this;
  }
});
Element.addMethods({
  getScrollDimensions: function(element) {
    return {
      width:  element.scrollWidth,
      height: element.scrollHeight
    }
  },

  getScrollOffset: function(element) {
    return Element._returnOffset(element.scrollLeft, element.scrollTop);
  },

  setScrollOffset: function(element, offset) {
    element = $(element);
    if (arguments.length == 3)
      offset = { left: offset, top: arguments[2] };
    element.scrollLeft = offset.left;
    element.scrollTop  = offset.top;
    return element;
  },

  // returns "clean" numerical style (without "px") or null if style can not be resolved
  // or is not numeric
  getNumStyle: function(element, style) {
    var value = parseFloat($(element).getStyle(style));
    return isNaN(value) ? null : value;
  },

  // with courtesy of Tobie Langel
  //   (http://tobielangel.com/2007/5/22/prototype-quick-tip)
  appendText: function(element, text) {
    element = $(element);
    element.appendChild(document.createTextNode(String.interpret(text)));
    return element;
  }
});

document.whenReady = (function() {
  var callbacks = [ ];

  document.observe('dom:loaded', function() {
    callbacks.invoke('call', document);
  });

  return function(callback) {
    document.loaded ? callback.bind(document).defer() : callbacks.push(callback);
  }
})();

Object.extend(document.viewport, {
  // Alias this method for consistency
  getScrollOffset: document.viewport.getScrollOffsets,

  setScrollOffset: function(offset) {
    Element.setScrollOffset(Prototype.Browser.WebKit ? document.body : document.documentElement, offset);
  },

  getScrollDimensions: function() {
    return Element.getScrollDimensions(Prototype.Browser.WebKit ? document.body : document.documentElement);
  }
});
/*
Interface: UI.Options
  Mixin to handle *options* argument in initializer pattern.

  TODO: find a better example than Circle that use an imaginary Point function,
        this example should be used in tests too.

  It assumes class defines a property called *options*, containing
  default options values.

  Instances hold their own *options* property after a first call to <setOptions>.

  Example:
    > var Circle = Class.create(UI.Options, {
    >
    >   // default options
    >   options: {
    >     radius: 1,
    >     origin: Point(0, 0)
    >   },
    >
    >   // common usage is to call setOptions in initializer
    >   initialize: function(options) {
    >     this.setOptions(options);
    >   }
    > });
    >
    > var circle = new Circle({ origin: Point(1, 4) });
    >
    > circle.options
    > // => { radius: 1, origin: Point(1,4) }

  Accessors:
    There are builtin methods to automatically write options accessors. All those
    methods can take either an array of option names nor option names as arguments.
    Notice that those methods won't override an accessor method if already present.

     * <optionsGetter> creates getters
     * <optionsSetter> creates setters
     * <optionsAccessor> creates both getters and setters

    Common usage is to invoke them on a class to create accessors for all instances
    of this class.
    Invoking those methods on a class has the same effect as invoking them on the class prototype.
    See <classMethod> for more details.

    Example:
    > // Creates getter and setter for the "radius" options of circles
    > Circle.optionsAccessor('radius');
    >
    > circle.setRadius(4);
    > // 4
    >
    > circle.getRadius();
    > // => 4 (circle.options.radius)

  Inheritance support:
    Subclasses can refine default *options* values, after a first instance call on setOptions,
    *options* attribute will hold all default options values coming from the inheritance hierarchy.
*/

(function() {
  UI.Options = {
    methodsAdded: function(klass) {
      klass.classMethod($w(' setOptions allOptions optionsGetter optionsSetter optionsAccessor '));
    },

    // Group: Methods

    /*
      Method: setOptions
        Extends object's *options* property with the given object
    */
    setOptions: function(options) {
      if (!this.hasOwnProperty('options'))
        this.options = this.allOptions();

      this.options = Object.extend(this.options, options || {});
    },

    /*
      Method: allOptions
        Computes the complete default options hash made by reverse extending all superclasses
        default options.

        > Widget.prototype.allOptions();
    */
    allOptions: function() {
      var superclass = this.constructor.superclass, ancestor = superclass && superclass.prototype;
      return (ancestor && ancestor.allOptions) ?
          Object.extend(ancestor.allOptions(), this.options) :
          Object.clone(this.options);
    },

    /*
      Method: optionsGetter
        Creates default getters for option names given as arguments.
        With no argument, creates getters for all option names.
    */
    optionsGetter: function() {
      addOptionsAccessors(this, arguments, false);
    },

    /*
      Method: optionsSetter
        Creates default setters for option names given as arguments.
        With no argument, creates setters for all option names.
    */
    optionsSetter: function() {
      addOptionsAccessors(this, arguments, true);
    },

    /*
      Method: optionsAccessor
        Creates default getters/setters for option names given as arguments.
        With no argument, creates accessors for all option names.
    */
    optionsAccessor: function() {
      this.optionsGetter.apply(this, arguments);
      this.optionsSetter.apply(this, arguments);
    }
  };

  // Internal
  function addOptionsAccessors(receiver, names, areSetters) {
    names = $A(names).flatten();

    if (names.empty())
      names = Object.keys(receiver.allOptions());

    names.each(function(name) {
      var accessorName = (areSetters ? 'set' : 'get') + name.camelcase();

      receiver[accessorName] = receiver[accessorName] || (areSetters ?
        // Setter
        function(value) { return this.options[name] = value } :
        // Getter
        function()      { return this.options[name]         });
    });
  }
})();
/*
Namespace: CSS

  Utility functions for CSS/StyleSheet files access

  Authors:
    - Sébastien Gruhier, <http://www.xilinus.com>
    - Samuel Lebeau, <http://gotfresh.info>
*/

var CSS = (function() {
  // Code based on:
  //   - IE5.5+ PNG Alpha Fix v1.0RC4 (c) 2004-2005 Angus Turnbull http://www.twinhelix.com
  //   - Whatever:hover - V2.02.060206 - hover, active & focus (c) 2005 - Peter Nederlof * Peterned - http://www.xs4all.nl/~peterned/
  function fixPNG() {
   parseStylesheet.apply(this, $A(arguments).concat(fixRule));
  };

  function parseStylesheet() {
    var patterns = $A(arguments);
    var method = patterns.pop();

    // To avoid flicking background
    //document.execCommand("BackgroundImageCache", false, true);
    // Parse all document stylesheets
    var styleSheets = $A(document.styleSheets);
    if (patterns.length > 1) {
      styleSheets = styleSheets.select(function(css) {
        return patterns.any(function(pattern) {
          return css.href && css.href.match(pattern)
          });
      });
    }
    styleSheets.each(function(styleSheet) {fixStylesheet.call(this, styleSheet, method)});
  };

  // Fixes a stylesheet
  function fixStylesheet(stylesheet, method) {
    // Parse import files
    if (stylesheet.imports)
      $A(stylesheet.imports).each(fixStylesheet);

    var href = stylesheet.href || document.location.href;
    var docPath = href.substr(0, href.lastIndexOf('/'));
	  // Parse all CSS Rules
    $A(stylesheet.rules || stylesheet.cssRules).each(function(rule) { method.call(this, rule, docPath) });
  };

  var filterPattern = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="#{src}",sizingMethod="#{method}")';

  // Fixes a rule if it has a PNG background
  function fixRule(rule, docPath) {
    var bgImg = rule.style.backgroundImage;
    // Rule with PNG background image
    if (bgImg && bgImg != 'none' && bgImg.match(/^url[("']+(.*\.png)[)"']+$/i)) {
      var src = RegExp.$1;
      var bgRepeat = rule.style.backgroundRepeat;
      // Relative path
      if (src[0] != '/')
        src = docPath + "/" + src;
      // Apply filter
      rule.style.filter = filterPattern.interpolate({
        src:    src,
        method: bgRepeat == "no-repeat" ? "crop" : "scale" });
      rule.style.backgroundImage = "none";
    }
  };

  var preloadedImages = new Hash();

  function preloadRule(rule, docPath) {
    var bgImg = rule.style.backgroundImage;
    if (bgImg && bgImg != 'none'  && bgImg != 'initial' ) {
      if (!preloadedImages.get(bgImg)) {
        bgImg.match(/^url[("']+(.*)[)"']+$/i);
        var src = RegExp.$1;
        // Relative path
        if (!(src[0] == '/' || src.match(/^file:/) || src.match(/^https?:/)))
          src = docPath + "/" + src;
        preloadedImages.set(bgImg, true);
        var image = new Image();
        image.src = src;
      }
    }
  }

  return {
    /*
       Method: fixPNG
         Fix transparency of PNG background of document stylesheets.
         (only on IE version<7, otherwise does nothing)

         Warning: All png background will not work as IE filter use for handling transparency in PNG
         is not compatible with all background. It does not support top/left position (so no CSS sprite)

         I recommend to create a special CSS file with png that needs to be fixed and call CSS.fixPNG on this CSS

         Examples:
          > CSS.fixPNG() // To fix all css
          >
          > CSS.fixPNG("mac_shadow.css") // to fix all css files with mac_shadow.css so mainly only on file
          >
          > CSS.fixPNG("shadow", "vista"); // To fix all css files with shadow or vista in their names

       Parameters
         patterns: (optional) list of pattern to filter css files
    */
    fixPNG: (Prototype.Browser.IE && Prototype.Browser.IEVersion < 7) ? fixPNG : Prototype.emptyFunction,

    // By Tobie Langel (http://tobielangel.com)
    //   inspired by http://yuiblog.com/blog/2007/06/07/style/
    addRule: function(css, backwardCompatibility) {
      if (backwardCompatibility) css = css + '{' + backwardCompatibility + '}';
      var style = new Element('style', { type: 'text/css', media: 'screen' });
      $(document.getElementsByTagName('head')[0]).insert(style);
      if (style.styleSheet) style.styleSheet.cssText = css;
      else style.appendText(css);
      return style;
    },

    preloadImages: function() {
      parseStylesheet.apply(this, $A(arguments).concat(preloadRule));
    }
  };
})();
UI.Benchmark = {
  benchmark: function(lambda, iterations) {
    var date = new Date();
    (iterations || 1).times(lambda);
    return (new Date() - date) / 1000;
  }
};
/*
  Group: Drag
    UI provides Element#enableDrag method that allow elements to fire drag-related events.

    Events fired:
      - drag:started : fired when a drag is started (mousedown then mousemove)
      - drag:updated : fired when a drag is updated (mousemove)
      - drag:ended   : fired when a drag is ended (mouseup)

    Notice it doesn't actually move anything, drag behavior has to be implemented
    by attaching handlers to drag events.

    Drag-related informations:
      event.memo contains useful information about the drag occuring:
        - dx         : difference between pointer x position when drag started
                       and actual x position
        - dy         : difference between pointer y position when drag started
                       and actual y position
        - mouseEvent : the original mouse event, useful to know pointer absolute position,
                       or if key were pressed.

    Example, with event handling for a specific element:

    > // Now "resizable" will fire drag-related events
    > $('resizable').enableDrag();
    >
    > // Let's observe them
    > $('resizable').observe('drag:started', function(event) {
    >   this._dimensions = this.getDimensions();
    > }).observe('drag:updated', function(event) {
    >   var drag = event.memo;
    >
    >   this.setStyle({
    >     width:  this._dimensions.width  + drag.dx + 'px',
    >     height: this._dimensions.height + drag.dy + 'px'
    >   });
    > });

    Example, with event delegating on the whole document:

    > // All elements in the having the "draggable" class name will fire drag events.
    > $$('.draggable').invoke('enableDrag');
    >
    > document.observe('drag:started', function(event) {
    >   UI.logger.info('trying to drag ' + event.element().id);
    > }):
*/
(function() {
  var initPointer, currentDraggable, dragging;

  document.observe('mousedown', onMousedown);

  function onMousedown(event) {
    var draggable = event.findElement('[ui:draggable="true"]');

    if (draggable) {
      // prevent default browser action
      event.stop();
      currentDraggable = draggable;
      initPointer = event.pointer();

      document.observe("mousemove", onMousemove)
              .observe("mouseup",   onMouseup);
    }
  };

  function onMousemove(event) {
    event.stop();

    if (dragging)
      fire('drag:updated', event);
    else {
      dragging = true;
      fire('drag:started', event);
    }
  };

  function onMouseup(event) {
    document.stopObserving('mousemove', onMousemove)
            .stopObserving('mouseup',   onMouseup);

    if (dragging) {
      dragging = false;
      fire('drag:ended', event);
    }
  };

  function fire(eventName, mouseEvent) {
    var pointer = mouseEvent.pointer();

    currentDraggable.fire(eventName, {
      dx: pointer.x - initPointer.x,
      dy: pointer.y - initPointer.y,
      mouseEvent: mouseEvent
    })
  };

  Element.addMethods({
    enableDrag: function(element) {
      element = $(element);
      element.writeAttribute('ui:draggable', 'true');
      return element;
    },

    disableDrag: function(element){
      element = $(element);
      element.writeAttribute('ui:draggable', null);
      return element;
    },

    isDraggable: function(element) {
      return $(element).readAttribute('ui:draggable') == 'true';
    }
  });
})();
/*
  Class: UI.IframeShim
    Handles IE6 bug when <select> elements overlap other elements with higher z-index

  Example:
    > // creates iframe and positions it under "contextMenu" element
    > this.iefix = new UI.IframeShim().positionUnder('contextMenu');
    > ...
    > document.observe('click', function(e) {
    >   if (e.isLeftClick()) {
    >     this.contextMenu.hide();
    >
    >     // hides iframe when left click is fired on a document
    >     this.iefix.hide();
    >   }
    > }.bind(this))
    > ...
*/

// TODO:
//
// Maybe it makes sense to bind iframe to an element
// so that it automatically calls positionUnder method
// when the element it's binded to is moved or resized
// Not sure how this might affect overall perfomance...

UI.IframeShim = Class.create(UI.Options, {

  /*
    Method: initialize
    Constructor

      Creates iframe shim and appends it to the body.
      Note that this method does not perform proper positioning and resizing of an iframe.
      To do that use positionUnder method

    Returns:
      this
  */
  initialize: function() {
    this.element = new Element('iframe', {
      style: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none',
      src: 'javascript:false;',
      frameborder: 0
    });
    $(document.body).insert(this.element);
  },

  /*
    Method: hide
      Hides iframe shim leaving its position and dimensions intact

    Returns:
      this
  */
  hide: function() {
    this.element.hide();
    return this;
  },

  /*
    Method: show
      Show iframe shim leaving its position and dimensions intact

    Returns:
      this
  */
  show: function() {
    this.element.show();
    return this;
  },

  /*
    Method: positionUnder
      Positions iframe shim under the specified element
      Sets proper dimensions, offset, zIndex and shows it
      Note that the element should have explicitly specified zIndex

    Returns:
      this
  */
  positionUnder: function(element) {
    var element = $(element),
        offset = element.cumulativeOffset(),
        dimensions = element.getDimensions(),
        style = {
          left: offset[0] + 'px',
          top: offset[1] + 'px',
          width: dimensions.width + 'px',
          height: dimensions.height + 'px',
          zIndex: element.getStyle('zIndex') - 1
        };
    this.element.setStyle(style).show();

    return this;
  },

  /*
    Method: setBounds
      Sets element's width, height, top and left css properties using 'px' as units

    Returns:
      this
  */
  setBounds: function(bounds) {
    for (prop in bounds) {
      bounds[prop] += 'px';
    }
    this.element.setStyle(bounds);
    return this;
  },

  /*
    Method: setSize
      Sets element's width, height

    Returns:
      this
  */
  setSize: function(width, height) {
    this.element.style.width  = parseInt(width) + "px";
    this.element.style.height = parseInt(height) + "px";
    return this;
  },

  /*
    Method: setPosition
      Sets element's top and left

    Returns:
      this
  */
  setPosition: function(top, left) {
    this.element.style.top  = parseInt(top) + "px";
    this.element.style.left = parseInt(left) + "px";
    return this;
  },

  /*
    Method: destroy
      Completely removes the iframe shim from the document

    Returns:
      this
  */
  destroy: function() {
    if (this.element)
      this.element.remove();

    return this;
  }
});
/*
Class: UI.Logger
*/

/*
  Group: Logging Facilities
    Prototype UI provides a facility to log message with levels.
    Levels are in order "debug", "info", "warn" and "error".

    As soon as the DOM is loaded, a default logger is present in UI.logger.

    This logger is :
    * an <ElementLogger> if $('log') is present
    * a <ConsoleLogger> if window.console is defined
    * a <MemLogger> otherwise

    See <AbstractLogger> to learn how to use it.

    Example:

    > UI.logger.warn('something bad happenned !');
*/

// Class: AbstractLogger

UI.Abstract.Logger = Class.create({
  /*
    Property: level
      The log level, default value is debug  <br/>
  */
  level: 'debug'
});

(function() {
  /*
    Method: debug
      Logs with "debug" level

    Method: info
      Logs with "info" level

    Method: warn
      Logs with "warn" level

    Method: error
      Logs with "error" level
  */
  var levels = $w(" debug info warn error ");

  levels.each(function(level, index) {
    UI.Abstract.Logger.addMethod(level, function(message) {
      // filter lower level messages
      if (index >= levels.indexOf(this.level))
        this._log({ level: level, message: message, date: new Date() });
    });
  });
})();

/*
  Class: NullLogger
    Does nothing
*/
UI.NullLogger = Class.create(UI.Abstract.Logger, {
  _log: Prototype.emptyFunction
});

/*
  Class: MemLogger
    Logs in memory

    Property: logs
      An array of logs, objects with "date", "level", and "message" properties
*/
UI.MemLogger = Class.create(UI.Abstract.Logger, {
  initialize: function() {
    this.logs = [ ];
  },

  _log: function(log) {
    this.logs.push(log);
  }
});

/*
  Class: ConsoleLogger
    Logs using window.console
*/
UI.ConsoleLogger = Class.create(UI.Abstract.Logger, {
  _log: function(log) {
    console[log.level || 'log'](log.message);
  }
});

/*
  Class: ElementLogger
    Logs in a DOM element
*/
UI.ElementLogger = Class.create(UI.Abstract.Logger, {
  /*
    Method: initialize
      Constructor, takes a DOM element to log into as argument
  */
  initialize: function(element) {
    this.element = $(element);
  },

  /*
    Property: format
      A format string, will be interpolated with "date", "level" and "message"

      Example:
        > "<p>(#{date}) #{level}: #{message}</p>"
  */
  format: '<p>(<span class="date">#{date}</span>) ' +
              '<span class="level">#{level}</span> : ' +
              '<span class="message">#{message}</span></p>',

  _log: function(log) {
    var entry = this.format.interpolate({
      level:   log.level.toUpperCase(),
      message: log.message.escapeHTML(),
      date:    log.date.toLocaleTimeString()
    });
    this.element.insert({ top: entry });
  }
});

document.observe('dom:loaded', function() {
  if ($('log'))             UI.logger = new UI.ElementLogger('log');
  else if (window.console)  UI.logger = new UI.ConsoleLogger();
  else                      UI.logger = new UI.MemLogger();
});
/*
Class: UI.Shadow
  Add shadow around a DOM element. The element MUST BE in ABSOLUTE position.

  Shadow can be skinned by CSS (see mac_shadow.css or drop_shadow.css).
  CSS must be included to see shadow.

  A shadow can have two states: focused and blur.
  Shadow shifts are set in CSS file as margin and padding of shadow_container to add visual information.

  Example:
    > new UI.Shadow("element_id");
*/
UI.Shadow = Class.create(UI.Options, {
  options: {
    theme: "mac_shadow",
    focus: false,
    zIndex: 100
  },

  /*
    Method: initialize
      Constructor, adds shadow elements to the DOM if element is in the DOM.
      Element MUST BE in ABSOLUTE position.

    Parameters:
      element - DOM element
      options - Hashmap of options
        - theme (default: mac_shadow)
        - focus (default: true)
        - zIndex (default: 100)

    Returns:
      this
  */
  initialize: function(element, options) {
    this.setOptions(options);

    this.element = $(element);
    this.create();
    this.iframe = Prototype.Browser.IE ? new UI.IframeShim() : null;

    if (Object.isElement(this.element.parentNode))
      this.render();
  },

  /*
    Method: destroy
      Destructor, removes elements from the DOM
  */
  destroy: function() {
    if (this.shadow.parentNode)
      this.remove();
  },

  // Group: Size and Position
  /*
    Method: setPosition
      Sets top/left shadow position in pixels

    Parameters:
      top -  top position in pixel
      left - left position in pixel

    Returns:
      this
  */
  setPosition: function(top, left) {
    if (this.shadowSize) {
      var shadowStyle = this.shadow.style;
      top =  parseInt(top)  - this.shadowSize.top  + this.shadowShift.top;
      left = parseInt(left) - this.shadowSize.left + this.shadowShift.left;
      shadowStyle.top  = top + 'px';
      shadowStyle.left = left + 'px';
      if (this.iframe)
        this.iframe.setPosition(top, left);
    }
    return this;
  },

  /*
    Method: setSize
      Sets width/height shadow in pixels

    Parameters:
      width  - width in pixel
      height - height in pixel

    Returns:
      this
  */
  setSize: function(width, height) {
    if (this.shadowSize) {
      try {
        var w = Math.max(0, parseInt(width) + this.shadowSize.width - this.shadowShift.width) + "px";
        this.shadow.style.width = w;
        var h = Math.max(0, parseInt(height) - this.shadowShift.height) + "px";

        // this.shadowContents[1].style.height = h;
        this.shadowContents[1].childElements().each(function(e) {e.style.height = h});
        this.shadowContents.each(function(item){ item.style.width = w});
        if (this.iframe)
          this.iframe.setSize(width + this.shadowSize.width - this.shadowShift.width, height + this.shadowSize.height - this.shadowShift.height);

      }
      catch(e) {
        // IE could throw an exception if called to early
      }
    }
    return this;
  },

  /*
    Method: setBounds
      Sets shadow bounds in pixels

    Parameters:
      bounds - an Hash {top:, left:, width:, height:}

    Returns:
      this
  */
  setBounds: function(bounds) {
    return this.setPosition(bounds.top, bounds.left).setSize(bounds.width, bounds.height);
  },

  /*
    Method: setZIndex
      Sets shadow z-index

    Parameters:
      zIndex - zIndex value

    Returns:
      this
  */
  setZIndex: function(zIndex) {
    this.shadow.style.zIndex = zIndex;
    return this;
  },

   // Group: Render
  /*
    Method: show
      Displays shadow

    Returns:
      this
  */
  show: function() {
    this.render();
    this.shadow.show();
    if (this.iframe)
      this.iframe.show();
    return this;
  },

  /*
    Method: hide
      Hides shadow

    Returns:
      this
  */
  hide: function() {
    this.shadow.hide();
    if (this.iframe)
      this.iframe.hide();
    return this;
  },

  /*
    Method: remove
      Removes shadow from the DOM

    Returns:
      this
  */
  remove: function() {
    this.shadow.remove();
    return this;
  },

  // Group: Status
  /*
    Method: focus
      Focus shadow.

      Change shadow shift. Shift values are set in CSS file as margin and padding of shadow_container
      to add visual information of shadow status.

    Returns:
      this
  */
  focus: function() {
    this.options.focus = true;
    this.updateShadow();
    return this;
  },

  /*
    Method: blur
      Blurs shadow.

      Change shadow shift. Shift values are set in CSS file as margin and padding of shadow_container
      to add visual information of shadow status.

    Returns:
      this
  */
  blur: function() {
    this.options.focus = false;
    this.updateShadow();
    return this;
  },

  // Private Functions
  // Adds shadow elements to DOM, computes shadow size and displays it
  render: function() {
    if (this.element.parentNode && !Object.isElement(this.shadow.parentNode)) {
      this.element.parentNode.appendChild(this.shadow);
      this.computeSize();
      this.setBounds(Object.extend(this.element.getDimensions(), this.getElementPosition()));
      this.shadow.show();
    }
    return this;
  },

  // Creates HTML elements without inserting them into the DOM
  create: function() {
    var zIndex = this.element.getStyle('zIndex');
    if (!zIndex)
      this.element.setStyle({zIndex: this.options.zIndex});
    zIndex = (zIndex || this.options.zIndex) - 1;

    this.shadowContents = new Array(3);
    this.shadowContents[0] = new Element("div")
      .insert(new Element("div", {className: "shadow_center_wrapper"}).insert(new Element("div", {className: "n_shadow"})))
      .insert(new Element("div", {className: "shadow_right ne_shadow"}))
      .insert(new Element("div", {className: "shadow_left nw_shadow"}));

    this.shadowContents[1] = new Element("div")
      .insert(new Element("div", {className: "shadow_center_wrapper c_shadow"}))
      .insert(new Element("div", {className: "shadow_right e_shadow"}))
      .insert(new Element("div", {className: "shadow_left w_shadow"}));
    this.centerElements = this.shadowContents[1].childElements();

    this.shadowContents[2] = new Element("div")
      .insert(new Element("div", {className: "shadow_center_wrapper"}).insert(new Element("div", {className: "s_shadow"})))
      .insert(new Element("div", {className: "shadow_right se_shadow"}))
      .insert(new Element("div", {className: "shadow_left sw_shadow"}));

    this.shadow = new Element("div", {className: "shadow_container " + this.options.theme,
                                      style: "position:absolute; top:-10000px; left:-10000px; display:none; z-index:" + zIndex })
      .insert(this.shadowContents[0])
      .insert(this.shadowContents[1])
      .insert(this.shadowContents[2]);
  },

  // Compute shadow size
  computeSize: function() {
    if (this.focusedShadowShift)
      return;
    this.shadow.show();

    // Trick to get shadow shift designed in CSS as padding
    var content = this.shadowContents[1].select("div.c_shadow").first();
    this.unfocusedShadowShift = {};
    this.focusedShadowShift = {};

    $w("top left bottom right").each(function(pos) {this.unfocusedShadowShift[pos] = content.getNumStyle("padding-" + pos) || 0}.bind(this));
    this.unfocusedShadowShift.width  = this.unfocusedShadowShift.left + this.unfocusedShadowShift.right;
    this.unfocusedShadowShift.height = this.unfocusedShadowShift.top + this.unfocusedShadowShift.bottom;

    $w("top left bottom right").each(function(pos) {this.focusedShadowShift[pos] = content.getNumStyle("margin-" + pos) || 0}.bind(this));
    this.focusedShadowShift.width  = this.focusedShadowShift.left + this.focusedShadowShift.right;
    this.focusedShadowShift.height = this.focusedShadowShift.top + this.focusedShadowShift.bottom;

    this.shadowShift = this.options.focus ? this.focusedShadowShift : this.unfocusedShadowShift;

    // Get shadow size
    this.shadowSize  = {top:    this.shadowContents[0].childElements()[1].getNumStyle("height"),
                        left:   this.shadowContents[0].childElements()[1].getNumStyle("width"),
                        bottom: this.shadowContents[2].childElements()[1].getNumStyle("height"),
                        right:  this.shadowContents[0].childElements()[2].getNumStyle("width")};

    this.shadowSize.width  = this.shadowSize.left + this.shadowSize.right;
    this.shadowSize.height = this.shadowSize.top + this.shadowSize.bottom;

    // Remove padding
    content.setStyle("padding:0; margin:0");
    this.shadow.hide();
  },

  // Update shadow size (called when it changes from focused to blur and vice-versa)
  updateShadow: function() {
    this.shadowShift = this.options.focus ? this.focusedShadowShift : this.unfocusedShadowShift;
    var shadowStyle = this.shadow.style, pos  = this.getElementPosition(), size = this.element.getDimensions();

    shadowStyle.top  =  pos.top    - this.shadowSize.top   + this.shadowShift.top   + 'px';
    shadowStyle.left  = pos.left   - this.shadowSize.left  + this.shadowShift.left  + 'px';
    shadowStyle.width = size.width + this.shadowSize.width - this.shadowShift.width + "px";
    var h = size.height - this.shadowShift.height + "px";
    this.centerElements.each(function(e) {e.style.height = h});

    var w = size.width + this.shadowSize.width - this.shadowShift.width+ "px";
    this.shadowContents.each(function(item) { item.style.width = w });
  },

  // Get element position in integer values
  getElementPosition: function() {
    return {top: this.element.getNumStyle("top"), left: this.element.getNumStyle("left")}
  }
});

// Set theme and focus as read/write accessor
document.whenReady(function() { CSS.fixPNG("shadow") });
/*
  Class: UI.IframeShim
    Handles IE6 bug when <select> elements overlap other elements with higher z-index
  
  Example:
    > // creates iframe and positions it under "contextMenu" element
    > this.iefix = new UI.IframeShim().positionUnder('contextMenu');
    > ...
    > document.observe('click', function(e) {
    >   if (e.isLeftClick()) {
    >     this.contextMenu.hide();
    >     
    >     // hides iframe when left click is fired on a document
    >     this.iefix.hide();
    >   }
    > }.bind(this))
    > ...
*/

// TODO:
//  
// Maybe it makes sense to bind iframe to an element 
// so that it automatically calls positionUnder method 
// when the element it's binded to is moved or resized
// Not sure how this might affect overall perfomance...

UI.IframeShim = Class.create(UI.Options, {
  
  /*
    Method: initialize
    Constructor
      
      Creates iframe shim and appends it to the body.
      Note that this method does not perform proper positioning and resizing of an iframe.
      To do that use positionUnder method
      
    Returns:
      this
  */
  initialize: function() {
    this.element = new Element('iframe', {
      style: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none',
      src: 'javascript:false;',
      frameborder: 0
    });
    $(document.body).insert(this.element);
  },
  
  /*
    Method: hide
      Hides iframe shim leaving its position and dimensions intact
      
    Returns:
      this
  */
  hide: function() {
    this.element.hide();
    return this;
  },
  
  /*
    Method: show
      Show iframe shim leaving its position and dimensions intact
      
    Returns:
      this
  */
  show: function() {
    this.element.show();
    return this;
  },
  
  /*
    Method: positionUnder
      Positions iframe shim under the specified element 
      Sets proper dimensions, offset, zIndex and shows it
      Note that the element should have explicitly specified zIndex
      
    Returns:
      this
  */
  positionUnder: function(element) {
    var element = $(element),
        offset = element.cumulativeOffset(),
        dimensions = element.getDimensions(),
        style = { 
          left: offset[0] + 'px', 
          top: offset[1] + 'px',
          width: dimensions.width + 'px',
          height: dimensions.height + 'px',
          zIndex: element.getStyle('zIndex') - 1
        };
    this.element.setStyle(style).show();
    
    return this;
  },
  
  /*
    Method: setBounds
      Sets element's width, height, top and left css properties using 'px' as units
    
    Returns:
      this
  */
  setBounds: function(bounds) {
    for (prop in bounds) {
      bounds[prop] += 'px';
    }
    this.element.setStyle(bounds);
    return this;
  },
  
  /*
    Method: setSize
      Sets element's width, height
    
    Returns:
      this
  */
  setSize: function(width, height) {   
    this.element.style.width  = parseInt(width) + "px";
    this.element.style.height = parseInt(height) + "px"; 
    return this;
  },
  
  /*
    Method: setPosition
      Sets element's top and left 
    
    Returns:
      this
  */
  setPosition: function(top, left) {
    this.element.style.top  = parseInt(top) + "px";
    this.element.style.left = parseInt(left) + "px";
    return this;
  },
  
  /*
    Method: destroy
      Completely removes the iframe shim from the document
      
    Returns:
      this
  */
  destroy: function() {
    if (this.element)
      this.element.remove();
    
    return this;
  }
});
/*
  Credits:
  - Idea: Facebook + Apple Mail
  - Guillermo Rauch: Original MooTools script
  - InteRiders: Prototype version  <http://interiders.com/>
*/


UI.AutoComplete = Class.create(UI.Options, {
  // Group: Options
  options: {
    className: "pui-autocomplete",   // CSS class name prefix
    maxItem: 10,                     // Max items in autocomplete
    url: false,                      // Url for ajax completion
    delay: 0.2,                      // Delay before running ajax request
    infoMessage: false,              // Message to display when input field is empty
    progressMessage: false,          // Message to display when ajax request is running
    noMatchMessage: false,           // Message to display when nothing match entry
    shadow: false                    // Shadow theme name (false = no shadow)
  },

  initialize: function(element, options) {
    this.setOptions(options);
    this.element = $(element).hide();

    this.render();

    this.updateInputSize();
    this.list = [];
    document.observe('keypress', this.removeSelected.bind(this));
  },

  add: function(text, options) {
    // Create a new li
    var li = new Element("li", Object.extend({className: this.getClassName("box")}, options || {}));
    li.observe("click",     this.focus.bind(this, li))
      .observe("mouseover", this.over.bind(this, li))
      .observe("mouseout",  this.out.bind(this, li));

    // Close button
    var close = new Element('a', {'href': '#', 'class': 'closebutton'});
    li.insert(new Element("span").update(text).insert(close));
    close.observe("click", this.remove.bind(this, li));

    this.input.parentNode.insert({before: li});
    this.updateInputSize();
    return this.fire("element:added", {element: li});
  },

  remove: function(element) {
    element.remove();
    this.updateInputSize();
    return this.fire("element:removed", {element: element});
  },

  removeSelected: function(event) {
    if (event.element().readAttribute("type") != "text" && event.keyCode == Event.KEY_BACKSPACE) {
      this.container.select("li." + this.getClassName("box")).each(function(element) {
        if (this.isSelected(element))
          this.remove(element);
      }.bind(this));
      if (event)
        event.stop();
    }
    return this;
  },

  focus: function(element, event) {
    if (event)
      event.stop();

    // Multi selection with shift
    if (event && !event.shiftKey)
      this.deselectAll();

    element = element || this.input;
    if (element == this.input) {
      this.input.focus();
      this.displayCompletion();
    }
    else {
      this.out(element, event);
      element.addClassName(this.getClassName("selected"));

      // Blur input field
      if (element != this.input)
        this.blur();
    }
    return this.fire("element:focus", {element: element});
  },

  blur: function(element, event) {
    if (event)
      event.stop();

    if (!element)
      this.input.blur();

    this.hideAutocomplete();
    return this.fire("element:blur", {element: element});
  },

  over: function(element, event) {
    if (!this.isSelected(element))
      element.addClassName(this.getClassName("over"));
    if (event)
      event.stop();
    return this.fire("element:over", {element: element});
  },

  out: function(element, event) {
    if (!this.isSelected(element))
      element.removeClassName(this.getClassName("over"));
    if (event)
      event.stop();
    return this.fire("element:out", {element: element});
  },

  isSelected: function(element) {
    return element.hasClassName(this.getClassName("selected"));
  },

  deselectAll: function() {
   this.container.select("li." + this.getClassName("box")).invoke("removeClassName", this.getClassName("selected"));
   return this;
  },

  setAutocompleteList: function(list) {
    this.list = list;
    return this;
  },

  /*
    Method: fire
      Fires a autocomplete custom event automatically namespaced in "autocomplete:" (see Prototype custom events).
      The memo object contains a "autocomplete" property referring to the autocomplete.


    Parameters:
      eventName - an event name
      memo      - a memo object

    Returns:
      fired event
  */
  fire: function(eventName, memo) {
    memo = memo || { };
    memo.autocomplete = this;
    return this.element.fire('autocomplete:' + eventName, memo);
  },

  /*
    Method: observe
      Observe a autocomplete event with a handler function automatically bound to the autocomplete

    Parameters:
      eventName - an event name
      handler   - a handler function

    Returns:
      this
  */
  observe: function(eventName, handler) {
    this.element.observe('autocomplete:' + eventName, handler.bind(this));
    return this;
  },

  /*
    Method: stopObserving
      Unregisters a autocomplete event, it must take the same parameters as this.observe (see Prototype stopObserving).

    Parameters:
      eventName - an event name
      handler   - a handler function

    Returns:
      this
  */
  stopObserving: function(eventName, handler) {
	  this.element.stopObserving('autocomplete:' + eventName, handler);
	  return this;
  },

  // PRIVATE METHOD
  // Move selection. element = nil (highlight first),  "previous"/"next" or selected element
  moveSelection: function(element) {
    var current = null;
    // Seletc first
    if (!this.current)
      current = this.autocompletionContainer.firstDescendant();
    else if (element == "next") {
      current = this.current[element]() || this.autocompletionContainer.firstDescendant();
    }
    else if (element == "previous") {
      current = this.current[element]() || this.autocompletionContainer.childElements().last();
    }
    else
      current = element;

    if (this.current)
      this.current.removeClassName(this.getClassName("current"));

    this.current = current;

    if (this.current)
      this.current.addClassName(this.getClassName("current"));
  },

  // Add current selected element from completion to input
  addCurrent: function() {
    if (this.current) {
      // Get selected text
      var index = this.autocompletionContainer.childElements().indexOf(this.current);
      this.add(this.selectedList[index].text);
      // Clear input
      this.current = null;
      this.input.clear();
      // Refocus input

      (function() {this.input.focus()}.bind(this)).defer();
      // Clear completion (force render)
      this.displayCompletion();
    }
  },

  // Display message (info or progress)
  showMessage: function(text) {
    if (text) {
      this.message.update(text);
      this.message.show();
      this.showAutocomplete();
    }
    else
      this.hideAutocomplete();
  },

  // Run ajax request to get completion values
  runRequest: function(search) {
    this.autocompletionContainer.hide();
    this.showMessage(this.options.progressMessage);
    new Ajax.Request(this.options.url, {parameters: {search: search, max: this.options.maxItem}, onComplete: function(transport) {
      this.setAutocompleteList(transport.responseText.evalJSON());
      this.timer = null;
      this.displayCompletion();
    }.bind(this)});
  },

  // Get a "namespaced" class name
  getClassName: function(className) {
    return  this.options.className + "-" + className;
  },

  // Key down (for up/down and return key)
  keydown: function(event) {
   switch(event.keyCode) {
     case Event.KEY_UP:
       this.moveSelection('previous');
       event.stop();
       return false;
     case Event.KEY_DOWN:
       this.moveSelection('next');
       event.stop();
       return false;
     case Event.KEY_RETURN:
       this.addCurrent();
       event.stop();
       return false;
    }
  },

  // Key to handle completion
  keyup: function(event) {
   switch(event.keyCode) {
     case Event.KEY_UP:
     case Event.KEY_DOWN:
     case Event.KEY_RETURN:
      break;
     default:
      this.displayCompletion(event);
    }
  },

  // Update input filed size to fit available width space
  updateInputSize: function() {
    // Get added elements width
    var top;
    var w = this.container.select("li." + this.getClassName("box")).inject(0, function(sum, element) {
      // First element
      if (Object.isUndefined(top))
        top = element.cumulativeOffset().top;
      // New line
      else if (top != element.cumulativeOffset().top) {
        top = element.cumulativeOffset().top;
        sum = 0;
      }
      return sum + element.getWidth() + element.getMarginDimensions().width + element.getBorderDimensions().width;
    });
    var margin = this.container.getMarginDimensions().width + this.container.getBorderDimensions().width + this.container.getPaddingDimensions().width;
    var width = this.container.getWidth() - w - margin;

    if (width < 50)
      width =   this.container.getWidth() - margin;

    this.input.parentNode.style.width = width + "px";
    this.input.style.width = width + "px";
  },

  // Display completion. It could display info or progress message if need be. Info when input field is empty
  // progress when ajax request is running
  displayCompletion: function(event) {
    var value = this.input.value.strip();
    this.current = null;
    if (!value.empty()) {
      // Run ajax reqest if need be
      if (event && this.options.url) {
        if (this.timer)
          clearTimeout(this.timer);
        this.timer = this.runRequest.bind(this, value).delay(this.options.delay);
      }
      else {
        this.message.hide();
        this.selectedList = this.list.findAll(function(entry) {return entry.text.match(value)}).slice(0, this.options.maxItem);
        this.autocompletionContainer.update("");
        if (this.selectedList.empty())
          this.showMessage(this.options.noMatchMessage);
        else {
          this.selectedList.each(function(entry) {
            var li = new Element("li").update(entry.text.gsub(value, "<em>" + value + "</em>"));
            li.observe("mouseover", this.moveSelection.bind(this, li))
              .observe("mousedown", this.addCurrent.bind(this));
            this.autocompletionContainer.insert(li);
          }.bind(this));
          this.autocompletionContainer.show();
          this.moveSelection("next");
          this.showAutocomplete();
        }
      }
    }
    else {
      this.showMessage(this.options.infoMessage);
      this.autocompletionContainer.hide();
      this.showAutocomplete();
    }
  },

  showAutocomplete: function() {
    var pos = this.container.cumulativeOffset();
    var top =  pos.top + this.container.getHeight();
    var left = pos.left;
    var w = this.autocompletion.getWidth();
    var h = this.autocompletion.getHeight();
    this.autocompletion.style.top =  top + "px";
    this.autocompletion.style.left = left + "px";
    if (this.shadow) {
      this.shadow.setBounds({top: top, left: left, width: w, height:h});
      this.shadow.show();
    }
    if (this.iframe)
      this.iframe.show().setPosition(top, left).setSize(w, h);

    this.autocompletion.show();
  },

  hideAutocomplete: function() {
    if (this.shadow)
      this.shadow.hide();
    if (this.iframe)
      this.iframe.hide();

    this.autocompletion.hide();
  },

  // Create HTML code
  render: function() {
    // GENERATED HTML CODE:
    // <ul class="pui-autocomplete-holder">
    //   <li class="pui-autocomplete-input">
    //     <input type="text"/>
    //   </li>
    // </ul>
    // <div class="pui-autocomplete-result">
    //   <div class="pui-autocomplete-message"></div>
    //   <ul class="pui-autocomplete-results">
    //   </ul>
    // </div>
    //
    this.autocompletion = new Element("div", {className: this.getClassName("result")}).hide();
    this.autocompletionContainer = new Element("ul",{className: this.getClassName("results")}).hide();
    this.message  = new Element("div", {className: this.getClassName("message")}).hide();
    this.element.insert({after: this.autocompletion.insert(this.message).insert(this.autocompletionContainer)});

    this.input = new Element("input", {type: "text"});

    this.input.observe("focus",    this.focus.bind(this, this.input))
              .observe("blur",     this.blur.bind(this, this.input))
              .observe("keyup",    this.keyup.bind(this))
              .observe("keydown",  this.keydown.bind(this));
    this.container = new Element('ul',    {className: this.getClassName("holder")})
                       .insert(new Element("li", {className: this.getClassName("input")}).insert(this.input));

    this.element.insert({before: this.container});
    this.autocompletion.style.width = this.container.getWidth() - this.container.getBorderDimensions().width + "px";
    if (this.options.shadow)
      this.shadow = new UI.Shadow(this.autocompletion, {theme: this.options.shadow}).hide();
    else
      // Shadow already handles iframe shim, we need it onlu without shadow
      this.iframe = Prototype.Browser.IE ? new UI.IframeShim() : null;
  }
});

Element.addMethods({
  getAttributeDimensions: function(element, attribut ) {
    var dim = $w('top bottom left right').inject({}, function(dims, key) {
      dims[key] = element.getNumStyle(attribut + "-" + key + (attribut == "border" ? "-width" : ""));
      return dims;
    });
    dim.width  = dim.left + dim.right;
    dim.height = dim.top + dim.bottom;
    return dim;
  },

  getBorderDimensions:  function(element) {return element.getAttributeDimensions("border")},
  getMarginDimensions:  function(element) {return element.getAttributeDimensions("margin")},
  getPaddingDimensions: function(element) {return element.getAttributeDimensions("padding")}
});
