(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    /**
     * dat-gui JavaScript Controller Library
     * http://code.google.com/p/dat-gui
     *
     * Copyright 2011 Data Arts Team, Google Creative Lab
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     */

    function ___$insertStyle(css) {
      if (!css) {
        return;
      }
      if (typeof window === 'undefined') {
        return;
      }

      var style = document.createElement('style');

      style.setAttribute('type', 'text/css');
      style.innerHTML = css;
      document.head.appendChild(style);

      return css;
    }

    function colorToString (color, forceCSSHex) {
      var colorFormat = color.__state.conversionName.toString();
      var r = Math.round(color.r);
      var g = Math.round(color.g);
      var b = Math.round(color.b);
      var a = color.a;
      var h = Math.round(color.h);
      var s = color.s.toFixed(1);
      var v = color.v.toFixed(1);
      if (forceCSSHex || colorFormat === 'THREE_CHAR_HEX' || colorFormat === 'SIX_CHAR_HEX') {
        var str = color.hex.toString(16);
        while (str.length < 6) {
          str = '0' + str;
        }
        return '#' + str;
      } else if (colorFormat === 'CSS_RGB') {
        return 'rgb(' + r + ',' + g + ',' + b + ')';
      } else if (colorFormat === 'CSS_RGBA') {
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
      } else if (colorFormat === 'HEX') {
        return '0x' + color.hex.toString(16);
      } else if (colorFormat === 'RGB_ARRAY') {
        return '[' + r + ',' + g + ',' + b + ']';
      } else if (colorFormat === 'RGBA_ARRAY') {
        return '[' + r + ',' + g + ',' + b + ',' + a + ']';
      } else if (colorFormat === 'RGB_OBJ') {
        return '{r:' + r + ',g:' + g + ',b:' + b + '}';
      } else if (colorFormat === 'RGBA_OBJ') {
        return '{r:' + r + ',g:' + g + ',b:' + b + ',a:' + a + '}';
      } else if (colorFormat === 'HSV_OBJ') {
        return '{h:' + h + ',s:' + s + ',v:' + v + '}';
      } else if (colorFormat === 'HSVA_OBJ') {
        return '{h:' + h + ',s:' + s + ',v:' + v + ',a:' + a + '}';
      }
      return 'unknown format';
    }

    var ARR_EACH = Array.prototype.forEach;
    var ARR_SLICE = Array.prototype.slice;
    var Common = {
      BREAK: {},
      extend: function extend(target) {
        this.each(ARR_SLICE.call(arguments, 1), function (obj) {
          var keys = this.isObject(obj) ? Object.keys(obj) : [];
          keys.forEach(function (key) {
            if (!this.isUndefined(obj[key])) {
              target[key] = obj[key];
            }
          }.bind(this));
        }, this);
        return target;
      },
      defaults: function defaults(target) {
        this.each(ARR_SLICE.call(arguments, 1), function (obj) {
          var keys = this.isObject(obj) ? Object.keys(obj) : [];
          keys.forEach(function (key) {
            if (this.isUndefined(target[key])) {
              target[key] = obj[key];
            }
          }.bind(this));
        }, this);
        return target;
      },
      compose: function compose() {
        var toCall = ARR_SLICE.call(arguments);
        return function () {
          var args = ARR_SLICE.call(arguments);
          for (var i = toCall.length - 1; i >= 0; i--) {
            args = [toCall[i].apply(this, args)];
          }
          return args[0];
        };
      },
      each: function each(obj, itr, scope) {
        if (!obj) {
          return;
        }
        if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
          obj.forEach(itr, scope);
        } else if (obj.length === obj.length + 0) {
          var key = void 0;
          var l = void 0;
          for (key = 0, l = obj.length; key < l; key++) {
            if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
              return;
            }
          }
        } else {
          for (var _key in obj) {
            if (itr.call(scope, obj[_key], _key) === this.BREAK) {
              return;
            }
          }
        }
      },
      defer: function defer(fnc) {
        setTimeout(fnc, 0);
      },
      debounce: function debounce(func, threshold, callImmediately) {
        var timeout = void 0;
        return function () {
          var obj = this;
          var args = arguments;
          function delayed() {
            timeout = null;
            if (!callImmediately) func.apply(obj, args);
          }
          var callNow = callImmediately || !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(delayed, threshold);
          if (callNow) {
            func.apply(obj, args);
          }
        };
      },
      toArray: function toArray(obj) {
        if (obj.toArray) return obj.toArray();
        return ARR_SLICE.call(obj);
      },
      isUndefined: function isUndefined(obj) {
        return obj === undefined;
      },
      isNull: function isNull(obj) {
        return obj === null;
      },
      isNaN: function (_isNaN) {
        function isNaN(_x) {
          return _isNaN.apply(this, arguments);
        }
        isNaN.toString = function () {
          return _isNaN.toString();
        };
        return isNaN;
      }(function (obj) {
        return isNaN(obj);
      }),
      isArray: Array.isArray || function (obj) {
        return obj.constructor === Array;
      },
      isObject: function isObject(obj) {
        return obj === Object(obj);
      },
      isNumber: function isNumber(obj) {
        return obj === obj + 0;
      },
      isString: function isString(obj) {
        return obj === obj + '';
      },
      isBoolean: function isBoolean(obj) {
        return obj === false || obj === true;
      },
      isFunction: function isFunction(obj) {
        return obj instanceof Function;
      }
    };

    var INTERPRETATIONS = [
    {
      litmus: Common.isString,
      conversions: {
        THREE_CHAR_HEX: {
          read: function read(original) {
            var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
            if (test === null) {
              return false;
            }
            return {
              space: 'HEX',
              hex: parseInt('0x' + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString(), 0)
            };
          },
          write: colorToString
        },
        SIX_CHAR_HEX: {
          read: function read(original) {
            var test = original.match(/^#([A-F0-9]{6})$/i);
            if (test === null) {
              return false;
            }
            return {
              space: 'HEX',
              hex: parseInt('0x' + test[1].toString(), 0)
            };
          },
          write: colorToString
        },
        CSS_RGB: {
          read: function read(original) {
            var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
            if (test === null) {
              return false;
            }
            return {
              space: 'RGB',
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3])
            };
          },
          write: colorToString
        },
        CSS_RGBA: {
          read: function read(original) {
            var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
            if (test === null) {
              return false;
            }
            return {
              space: 'RGB',
              r: parseFloat(test[1]),
              g: parseFloat(test[2]),
              b: parseFloat(test[3]),
              a: parseFloat(test[4])
            };
          },
          write: colorToString
        }
      }
    },
    {
      litmus: Common.isNumber,
      conversions: {
        HEX: {
          read: function read(original) {
            return {
              space: 'HEX',
              hex: original,
              conversionName: 'HEX'
            };
          },
          write: function write(color) {
            return color.hex;
          }
        }
      }
    },
    {
      litmus: Common.isArray,
      conversions: {
        RGB_ARRAY: {
          read: function read(original) {
            if (original.length !== 3) {
              return false;
            }
            return {
              space: 'RGB',
              r: original[0],
              g: original[1],
              b: original[2]
            };
          },
          write: function write(color) {
            return [color.r, color.g, color.b];
          }
        },
        RGBA_ARRAY: {
          read: function read(original) {
            if (original.length !== 4) return false;
            return {
              space: 'RGB',
              r: original[0],
              g: original[1],
              b: original[2],
              a: original[3]
            };
          },
          write: function write(color) {
            return [color.r, color.g, color.b, color.a];
          }
        }
      }
    },
    {
      litmus: Common.isObject,
      conversions: {
        RGBA_OBJ: {
          read: function read(original) {
            if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b) && Common.isNumber(original.a)) {
              return {
                space: 'RGB',
                r: original.r,
                g: original.g,
                b: original.b,
                a: original.a
              };
            }
            return false;
          },
          write: function write(color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b,
              a: color.a
            };
          }
        },
        RGB_OBJ: {
          read: function read(original) {
            if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b)) {
              return {
                space: 'RGB',
                r: original.r,
                g: original.g,
                b: original.b
              };
            }
            return false;
          },
          write: function write(color) {
            return {
              r: color.r,
              g: color.g,
              b: color.b
            };
          }
        },
        HSVA_OBJ: {
          read: function read(original) {
            if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v) && Common.isNumber(original.a)) {
              return {
                space: 'HSV',
                h: original.h,
                s: original.s,
                v: original.v,
                a: original.a
              };
            }
            return false;
          },
          write: function write(color) {
            return {
              h: color.h,
              s: color.s,
              v: color.v,
              a: color.a
            };
          }
        },
        HSV_OBJ: {
          read: function read(original) {
            if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v)) {
              return {
                space: 'HSV',
                h: original.h,
                s: original.s,
                v: original.v
              };
            }
            return false;
          },
          write: function write(color) {
            return {
              h: color.h,
              s: color.s,
              v: color.v
            };
          }
        }
      }
    }];
    var result = void 0;
    var toReturn = void 0;
    var interpret = function interpret() {
      toReturn = false;
      var original = arguments.length > 1 ? Common.toArray(arguments) : arguments[0];
      Common.each(INTERPRETATIONS, function (family) {
        if (family.litmus(original)) {
          Common.each(family.conversions, function (conversion, conversionName) {
            result = conversion.read(original);
            if (toReturn === false && result !== false) {
              toReturn = result;
              result.conversionName = conversionName;
              result.conversion = conversion;
              return Common.BREAK;
            }
          });
          return Common.BREAK;
        }
      });
      return toReturn;
    };

    var tmpComponent = void 0;
    var ColorMath = {
      hsv_to_rgb: function hsv_to_rgb(h, s, v) {
        var hi = Math.floor(h / 60) % 6;
        var f = h / 60 - Math.floor(h / 60);
        var p = v * (1.0 - s);
        var q = v * (1.0 - f * s);
        var t = v * (1.0 - (1.0 - f) * s);
        var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];
        return {
          r: c[0] * 255,
          g: c[1] * 255,
          b: c[2] * 255
        };
      },
      rgb_to_hsv: function rgb_to_hsv(r, g, b) {
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var delta = max - min;
        var h = void 0;
        var s = void 0;
        if (max !== 0) {
          s = delta / max;
        } else {
          return {
            h: NaN,
            s: 0,
            v: 0
          };
        }
        if (r === max) {
          h = (g - b) / delta;
        } else if (g === max) {
          h = 2 + (b - r) / delta;
        } else {
          h = 4 + (r - g) / delta;
        }
        h /= 6;
        if (h < 0) {
          h += 1;
        }
        return {
          h: h * 360,
          s: s,
          v: max / 255
        };
      },
      rgb_to_hex: function rgb_to_hex(r, g, b) {
        var hex = this.hex_with_component(0, 2, r);
        hex = this.hex_with_component(hex, 1, g);
        hex = this.hex_with_component(hex, 0, b);
        return hex;
      },
      component_from_hex: function component_from_hex(hex, componentIndex) {
        return hex >> componentIndex * 8 & 0xFF;
      },
      hex_with_component: function hex_with_component(hex, componentIndex, value) {
        return value << (tmpComponent = componentIndex * 8) | hex & ~(0xFF << tmpComponent);
      }
    };

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };











    var classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    var createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();







    var get = function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);

      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);

        if (parent === null) {
          return undefined;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;

        if (getter === undefined) {
          return undefined;
        }

        return getter.call(receiver);
      }
    };

    var inherits = function (subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    };











    var possibleConstructorReturn = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };

    var Color = function () {
      function Color() {
        classCallCheck(this, Color);
        this.__state = interpret.apply(this, arguments);
        if (this.__state === false) {
          throw new Error('Failed to interpret color arguments');
        }
        this.__state.a = this.__state.a || 1;
      }
      createClass(Color, [{
        key: 'toString',
        value: function toString() {
          return colorToString(this);
        }
      }, {
        key: 'toHexString',
        value: function toHexString() {
          return colorToString(this, true);
        }
      }, {
        key: 'toOriginal',
        value: function toOriginal() {
          return this.__state.conversion.write(this);
        }
      }]);
      return Color;
    }();
    function defineRGBComponent(target, component, componentHexIndex) {
      Object.defineProperty(target, component, {
        get: function get$$1() {
          if (this.__state.space === 'RGB') {
            return this.__state[component];
          }
          Color.recalculateRGB(this, component, componentHexIndex);
          return this.__state[component];
        },
        set: function set$$1(v) {
          if (this.__state.space !== 'RGB') {
            Color.recalculateRGB(this, component, componentHexIndex);
            this.__state.space = 'RGB';
          }
          this.__state[component] = v;
        }
      });
    }
    function defineHSVComponent(target, component) {
      Object.defineProperty(target, component, {
        get: function get$$1() {
          if (this.__state.space === 'HSV') {
            return this.__state[component];
          }
          Color.recalculateHSV(this);
          return this.__state[component];
        },
        set: function set$$1(v) {
          if (this.__state.space !== 'HSV') {
            Color.recalculateHSV(this);
            this.__state.space = 'HSV';
          }
          this.__state[component] = v;
        }
      });
    }
    Color.recalculateRGB = function (color, component, componentHexIndex) {
      if (color.__state.space === 'HEX') {
        color.__state[component] = ColorMath.component_from_hex(color.__state.hex, componentHexIndex);
      } else if (color.__state.space === 'HSV') {
        Common.extend(color.__state, ColorMath.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
      } else {
        throw new Error('Corrupted color state');
      }
    };
    Color.recalculateHSV = function (color) {
      var result = ColorMath.rgb_to_hsv(color.r, color.g, color.b);
      Common.extend(color.__state, {
        s: result.s,
        v: result.v
      });
      if (!Common.isNaN(result.h)) {
        color.__state.h = result.h;
      } else if (Common.isUndefined(color.__state.h)) {
        color.__state.h = 0;
      }
    };
    Color.COMPONENTS = ['r', 'g', 'b', 'h', 's', 'v', 'hex', 'a'];
    defineRGBComponent(Color.prototype, 'r', 2);
    defineRGBComponent(Color.prototype, 'g', 1);
    defineRGBComponent(Color.prototype, 'b', 0);
    defineHSVComponent(Color.prototype, 'h');
    defineHSVComponent(Color.prototype, 's');
    defineHSVComponent(Color.prototype, 'v');
    Object.defineProperty(Color.prototype, 'a', {
      get: function get$$1() {
        return this.__state.a;
      },
      set: function set$$1(v) {
        this.__state.a = v;
      }
    });
    Object.defineProperty(Color.prototype, 'hex', {
      get: function get$$1() {
        if (this.__state.space !== 'HEX') {
          this.__state.hex = ColorMath.rgb_to_hex(this.r, this.g, this.b);
          this.__state.space = 'HEX';
        }
        return this.__state.hex;
      },
      set: function set$$1(v) {
        this.__state.space = 'HEX';
        this.__state.hex = v;
      }
    });

    var Controller = function () {
      function Controller(object, property) {
        classCallCheck(this, Controller);
        this.initialValue = object[property];
        this.domElement = document.createElement('div');
        this.object = object;
        this.property = property;
        this.__onChange = undefined;
        this.__onFinishChange = undefined;
      }
      createClass(Controller, [{
        key: 'onChange',
        value: function onChange(fnc) {
          this.__onChange = fnc;
          return this;
        }
      }, {
        key: 'onFinishChange',
        value: function onFinishChange(fnc) {
          this.__onFinishChange = fnc;
          return this;
        }
      }, {
        key: 'setValue',
        value: function setValue(newValue) {
          this.object[this.property] = newValue;
          if (this.__onChange) {
            this.__onChange.call(this, newValue);
          }
          this.updateDisplay();
          return this;
        }
      }, {
        key: 'getValue',
        value: function getValue() {
          return this.object[this.property];
        }
      }, {
        key: 'updateDisplay',
        value: function updateDisplay() {
          return this;
        }
      }, {
        key: 'isModified',
        value: function isModified() {
          return this.initialValue !== this.getValue();
        }
      }]);
      return Controller;
    }();

    var EVENT_MAP = {
      HTMLEvents: ['change'],
      MouseEvents: ['click', 'mousemove', 'mousedown', 'mouseup', 'mouseover'],
      KeyboardEvents: ['keydown']
    };
    var EVENT_MAP_INV = {};
    Common.each(EVENT_MAP, function (v, k) {
      Common.each(v, function (e) {
        EVENT_MAP_INV[e] = k;
      });
    });
    var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
    function cssValueToPixels(val) {
      if (val === '0' || Common.isUndefined(val)) {
        return 0;
      }
      var match = val.match(CSS_VALUE_PIXELS);
      if (!Common.isNull(match)) {
        return parseFloat(match[1]);
      }
      return 0;
    }
    var dom = {
      makeSelectable: function makeSelectable(elem, selectable) {
        if (elem === undefined || elem.style === undefined) return;
        elem.onselectstart = selectable ? function () {
          return false;
        } : function () {};
        elem.style.MozUserSelect = selectable ? 'auto' : 'none';
        elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
        elem.unselectable = selectable ? 'on' : 'off';
      },
      makeFullscreen: function makeFullscreen(elem, hor, vert) {
        var vertical = vert;
        var horizontal = hor;
        if (Common.isUndefined(horizontal)) {
          horizontal = true;
        }
        if (Common.isUndefined(vertical)) {
          vertical = true;
        }
        elem.style.position = 'absolute';
        if (horizontal) {
          elem.style.left = 0;
          elem.style.right = 0;
        }
        if (vertical) {
          elem.style.top = 0;
          elem.style.bottom = 0;
        }
      },
      fakeEvent: function fakeEvent(elem, eventType, pars, aux) {
        var params = pars || {};
        var className = EVENT_MAP_INV[eventType];
        if (!className) {
          throw new Error('Event type ' + eventType + ' not supported.');
        }
        var evt = document.createEvent(className);
        switch (className) {
          case 'MouseEvents':
            {
              var clientX = params.x || params.clientX || 0;
              var clientY = params.y || params.clientY || 0;
              evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0,
              0,
              clientX,
              clientY,
              false, false, false, false, 0, null);
              break;
            }
          case 'KeyboardEvents':
            {
              var init = evt.initKeyboardEvent || evt.initKeyEvent;
              Common.defaults(params, {
                cancelable: true,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                keyCode: undefined,
                charCode: undefined
              });
              init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
              break;
            }
          default:
            {
              evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
              break;
            }
        }
        Common.defaults(evt, aux);
        elem.dispatchEvent(evt);
      },
      bind: function bind(elem, event, func, newBool) {
        var bool = newBool || false;
        if (elem.addEventListener) {
          elem.addEventListener(event, func, bool);
        } else if (elem.attachEvent) {
          elem.attachEvent('on' + event, func);
        }
        return dom;
      },
      unbind: function unbind(elem, event, func, newBool) {
        var bool = newBool || false;
        if (elem.removeEventListener) {
          elem.removeEventListener(event, func, bool);
        } else if (elem.detachEvent) {
          elem.detachEvent('on' + event, func);
        }
        return dom;
      },
      addClass: function addClass(elem, className) {
        if (elem.className === undefined) {
          elem.className = className;
        } else if (elem.className !== className) {
          var classes = elem.className.split(/ +/);
          if (classes.indexOf(className) === -1) {
            classes.push(className);
            elem.className = classes.join(' ').replace(/^\s+/, '').replace(/\s+$/, '');
          }
        }
        return dom;
      },
      removeClass: function removeClass(elem, className) {
        if (className) {
          if (elem.className === className) {
            elem.removeAttribute('class');
          } else {
            var classes = elem.className.split(/ +/);
            var index = classes.indexOf(className);
            if (index !== -1) {
              classes.splice(index, 1);
              elem.className = classes.join(' ');
            }
          }
        } else {
          elem.className = undefined;
        }
        return dom;
      },
      hasClass: function hasClass(elem, className) {
        return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(elem.className) || false;
      },
      getWidth: function getWidth(elem) {
        var style = getComputedStyle(elem);
        return cssValueToPixels(style['border-left-width']) + cssValueToPixels(style['border-right-width']) + cssValueToPixels(style['padding-left']) + cssValueToPixels(style['padding-right']) + cssValueToPixels(style.width);
      },
      getHeight: function getHeight(elem) {
        var style = getComputedStyle(elem);
        return cssValueToPixels(style['border-top-width']) + cssValueToPixels(style['border-bottom-width']) + cssValueToPixels(style['padding-top']) + cssValueToPixels(style['padding-bottom']) + cssValueToPixels(style.height);
      },
      getOffset: function getOffset(el) {
        var elem = el;
        var offset = { left: 0, top: 0 };
        if (elem.offsetParent) {
          do {
            offset.left += elem.offsetLeft;
            offset.top += elem.offsetTop;
            elem = elem.offsetParent;
          } while (elem);
        }
        return offset;
      },
      isActive: function isActive(elem) {
        return elem === document.activeElement && (elem.type || elem.href);
      }
    };

    var BooleanController = function (_Controller) {
      inherits(BooleanController, _Controller);
      function BooleanController(object, property) {
        classCallCheck(this, BooleanController);
        var _this2 = possibleConstructorReturn(this, (BooleanController.__proto__ || Object.getPrototypeOf(BooleanController)).call(this, object, property));
        var _this = _this2;
        _this2.__prev = _this2.getValue();
        _this2.__checkbox = document.createElement('input');
        _this2.__checkbox.setAttribute('type', 'checkbox');
        function onChange() {
          _this.setValue(!_this.__prev);
        }
        dom.bind(_this2.__checkbox, 'change', onChange, false);
        _this2.domElement.appendChild(_this2.__checkbox);
        _this2.updateDisplay();
        return _this2;
      }
      createClass(BooleanController, [{
        key: 'setValue',
        value: function setValue(v) {
          var toReturn = get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'setValue', this).call(this, v);
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
          this.__prev = this.getValue();
          return toReturn;
        }
      }, {
        key: 'updateDisplay',
        value: function updateDisplay() {
          if (this.getValue() === true) {
            this.__checkbox.setAttribute('checked', 'checked');
            this.__checkbox.checked = true;
            this.__prev = true;
          } else {
            this.__checkbox.checked = false;
            this.__prev = false;
          }
          return get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'updateDisplay', this).call(this);
        }
      }]);
      return BooleanController;
    }(Controller);

    var OptionController = function (_Controller) {
      inherits(OptionController, _Controller);
      function OptionController(object, property, opts) {
        classCallCheck(this, OptionController);
        var _this2 = possibleConstructorReturn(this, (OptionController.__proto__ || Object.getPrototypeOf(OptionController)).call(this, object, property));
        var options = opts;
        var _this = _this2;
        _this2.__select = document.createElement('select');
        if (Common.isArray(options)) {
          var map = {};
          Common.each(options, function (element) {
            map[element] = element;
          });
          options = map;
        }
        Common.each(options, function (value, key) {
          var opt = document.createElement('option');
          opt.innerHTML = key;
          opt.setAttribute('value', value);
          _this.__select.appendChild(opt);
        });
        _this2.updateDisplay();
        dom.bind(_this2.__select, 'change', function () {
          var desiredValue = this.options[this.selectedIndex].value;
          _this.setValue(desiredValue);
        });
        _this2.domElement.appendChild(_this2.__select);
        return _this2;
      }
      createClass(OptionController, [{
        key: 'setValue',
        value: function setValue(v) {
          var toReturn = get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'setValue', this).call(this, v);
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
          return toReturn;
        }
      }, {
        key: 'updateDisplay',
        value: function updateDisplay() {
          if (dom.isActive(this.__select)) return this;
          this.__select.value = this.getValue();
          return get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'updateDisplay', this).call(this);
        }
      }]);
      return OptionController;
    }(Controller);

    var StringController = function (_Controller) {
      inherits(StringController, _Controller);
      function StringController(object, property) {
        classCallCheck(this, StringController);
        var _this2 = possibleConstructorReturn(this, (StringController.__proto__ || Object.getPrototypeOf(StringController)).call(this, object, property));
        var _this = _this2;
        function onChange() {
          _this.setValue(_this.__input.value);
        }
        function onBlur() {
          if (_this.__onFinishChange) {
            _this.__onFinishChange.call(_this, _this.getValue());
          }
        }
        _this2.__input = document.createElement('input');
        _this2.__input.setAttribute('type', 'text');
        dom.bind(_this2.__input, 'keyup', onChange);
        dom.bind(_this2.__input, 'change', onChange);
        dom.bind(_this2.__input, 'blur', onBlur);
        dom.bind(_this2.__input, 'keydown', function (e) {
          if (e.keyCode === 13) {
            this.blur();
          }
        });
        _this2.updateDisplay();
        _this2.domElement.appendChild(_this2.__input);
        return _this2;
      }
      createClass(StringController, [{
        key: 'updateDisplay',
        value: function updateDisplay() {
          if (!dom.isActive(this.__input)) {
            this.__input.value = this.getValue();
          }
          return get(StringController.prototype.__proto__ || Object.getPrototypeOf(StringController.prototype), 'updateDisplay', this).call(this);
        }
      }]);
      return StringController;
    }(Controller);

    function numDecimals(x) {
      var _x = x.toString();
      if (_x.indexOf('.') > -1) {
        return _x.length - _x.indexOf('.') - 1;
      }
      return 0;
    }
    var NumberController = function (_Controller) {
      inherits(NumberController, _Controller);
      function NumberController(object, property, params) {
        classCallCheck(this, NumberController);
        var _this = possibleConstructorReturn(this, (NumberController.__proto__ || Object.getPrototypeOf(NumberController)).call(this, object, property));
        var _params = params || {};
        _this.__min = _params.min;
        _this.__max = _params.max;
        _this.__step = _params.step;
        if (Common.isUndefined(_this.__step)) {
          if (_this.initialValue === 0) {
            _this.__impliedStep = 1;
          } else {
            _this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(_this.initialValue)) / Math.LN10)) / 10;
          }
        } else {
          _this.__impliedStep = _this.__step;
        }
        _this.__precision = numDecimals(_this.__impliedStep);
        return _this;
      }
      createClass(NumberController, [{
        key: 'setValue',
        value: function setValue(v) {
          var _v = v;
          if (this.__min !== undefined && _v < this.__min) {
            _v = this.__min;
          } else if (this.__max !== undefined && _v > this.__max) {
            _v = this.__max;
          }
          if (this.__step !== undefined && _v % this.__step !== 0) {
            _v = Math.round(_v / this.__step) * this.__step;
          }
          return get(NumberController.prototype.__proto__ || Object.getPrototypeOf(NumberController.prototype), 'setValue', this).call(this, _v);
        }
      }, {
        key: 'min',
        value: function min(minValue) {
          this.__min = minValue;
          return this;
        }
      }, {
        key: 'max',
        value: function max(maxValue) {
          this.__max = maxValue;
          return this;
        }
      }, {
        key: 'step',
        value: function step(stepValue) {
          this.__step = stepValue;
          this.__impliedStep = stepValue;
          this.__precision = numDecimals(stepValue);
          return this;
        }
      }]);
      return NumberController;
    }(Controller);

    function roundToDecimal(value, decimals) {
      var tenTo = Math.pow(10, decimals);
      return Math.round(value * tenTo) / tenTo;
    }
    var NumberControllerBox = function (_NumberController) {
      inherits(NumberControllerBox, _NumberController);
      function NumberControllerBox(object, property, params) {
        classCallCheck(this, NumberControllerBox);
        var _this2 = possibleConstructorReturn(this, (NumberControllerBox.__proto__ || Object.getPrototypeOf(NumberControllerBox)).call(this, object, property, params));
        _this2.__truncationSuspended = false;
        var _this = _this2;
        var prevY = void 0;
        function onChange() {
          var attempted = parseFloat(_this.__input.value);
          if (!Common.isNaN(attempted)) {
            _this.setValue(attempted);
          }
        }
        function onFinish() {
          if (_this.__onFinishChange) {
            _this.__onFinishChange.call(_this, _this.getValue());
          }
        }
        function onBlur() {
          onFinish();
        }
        function onMouseDrag(e) {
          var diff = prevY - e.clientY;
          _this.setValue(_this.getValue() + diff * _this.__impliedStep);
          prevY = e.clientY;
        }
        function onMouseUp() {
          dom.unbind(window, 'mousemove', onMouseDrag);
          dom.unbind(window, 'mouseup', onMouseUp);
          onFinish();
        }
        function onMouseDown(e) {
          dom.bind(window, 'mousemove', onMouseDrag);
          dom.bind(window, 'mouseup', onMouseUp);
          prevY = e.clientY;
        }
        _this2.__input = document.createElement('input');
        _this2.__input.setAttribute('type', 'text');
        dom.bind(_this2.__input, 'change', onChange);
        dom.bind(_this2.__input, 'blur', onBlur);
        dom.bind(_this2.__input, 'mousedown', onMouseDown);
        dom.bind(_this2.__input, 'keydown', function (e) {
          if (e.keyCode === 13) {
            _this.__truncationSuspended = true;
            this.blur();
            _this.__truncationSuspended = false;
            onFinish();
          }
        });
        _this2.updateDisplay();
        _this2.domElement.appendChild(_this2.__input);
        return _this2;
      }
      createClass(NumberControllerBox, [{
        key: 'updateDisplay',
        value: function updateDisplay() {
          this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
          return get(NumberControllerBox.prototype.__proto__ || Object.getPrototypeOf(NumberControllerBox.prototype), 'updateDisplay', this).call(this);
        }
      }]);
      return NumberControllerBox;
    }(NumberController);

    function map(v, i1, i2, o1, o2) {
      return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
    }
    var NumberControllerSlider = function (_NumberController) {
      inherits(NumberControllerSlider, _NumberController);
      function NumberControllerSlider(object, property, min, max, step) {
        classCallCheck(this, NumberControllerSlider);
        var _this2 = possibleConstructorReturn(this, (NumberControllerSlider.__proto__ || Object.getPrototypeOf(NumberControllerSlider)).call(this, object, property, { min: min, max: max, step: step }));
        var _this = _this2;
        _this2.__background = document.createElement('div');
        _this2.__foreground = document.createElement('div');
        dom.bind(_this2.__background, 'mousedown', onMouseDown);
        dom.bind(_this2.__background, 'touchstart', onTouchStart);
        dom.addClass(_this2.__background, 'slider');
        dom.addClass(_this2.__foreground, 'slider-fg');
        function onMouseDown(e) {
          document.activeElement.blur();
          dom.bind(window, 'mousemove', onMouseDrag);
          dom.bind(window, 'mouseup', onMouseUp);
          onMouseDrag(e);
        }
        function onMouseDrag(e) {
          e.preventDefault();
          var bgRect = _this.__background.getBoundingClientRect();
          _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
          return false;
        }
        function onMouseUp() {
          dom.unbind(window, 'mousemove', onMouseDrag);
          dom.unbind(window, 'mouseup', onMouseUp);
          if (_this.__onFinishChange) {
            _this.__onFinishChange.call(_this, _this.getValue());
          }
        }
        function onTouchStart(e) {
          if (e.touches.length !== 1) {
            return;
          }
          dom.bind(window, 'touchmove', onTouchMove);
          dom.bind(window, 'touchend', onTouchEnd);
          onTouchMove(e);
        }
        function onTouchMove(e) {
          var clientX = e.touches[0].clientX;
          var bgRect = _this.__background.getBoundingClientRect();
          _this.setValue(map(clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
        }
        function onTouchEnd() {
          dom.unbind(window, 'touchmove', onTouchMove);
          dom.unbind(window, 'touchend', onTouchEnd);
          if (_this.__onFinishChange) {
            _this.__onFinishChange.call(_this, _this.getValue());
          }
        }
        _this2.updateDisplay();
        _this2.__background.appendChild(_this2.__foreground);
        _this2.domElement.appendChild(_this2.__background);
        return _this2;
      }
      createClass(NumberControllerSlider, [{
        key: 'updateDisplay',
        value: function updateDisplay() {
          var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
          this.__foreground.style.width = pct * 100 + '%';
          return get(NumberControllerSlider.prototype.__proto__ || Object.getPrototypeOf(NumberControllerSlider.prototype), 'updateDisplay', this).call(this);
        }
      }]);
      return NumberControllerSlider;
    }(NumberController);

    var FunctionController = function (_Controller) {
      inherits(FunctionController, _Controller);
      function FunctionController(object, property, text) {
        classCallCheck(this, FunctionController);
        var _this2 = possibleConstructorReturn(this, (FunctionController.__proto__ || Object.getPrototypeOf(FunctionController)).call(this, object, property));
        var _this = _this2;
        _this2.__button = document.createElement('div');
        _this2.__button.innerHTML = text === undefined ? 'Fire' : text;
        dom.bind(_this2.__button, 'click', function (e) {
          e.preventDefault();
          _this.fire();
          return false;
        });
        dom.addClass(_this2.__button, 'button');
        _this2.domElement.appendChild(_this2.__button);
        return _this2;
      }
      createClass(FunctionController, [{
        key: 'fire',
        value: function fire() {
          if (this.__onChange) {
            this.__onChange.call(this);
          }
          this.getValue().call(this.object);
          if (this.__onFinishChange) {
            this.__onFinishChange.call(this, this.getValue());
          }
        }
      }]);
      return FunctionController;
    }(Controller);

    var ColorController = function (_Controller) {
      inherits(ColorController, _Controller);
      function ColorController(object, property) {
        classCallCheck(this, ColorController);
        var _this2 = possibleConstructorReturn(this, (ColorController.__proto__ || Object.getPrototypeOf(ColorController)).call(this, object, property));
        _this2.__color = new Color(_this2.getValue());
        _this2.__temp = new Color(0);
        var _this = _this2;
        _this2.domElement = document.createElement('div');
        dom.makeSelectable(_this2.domElement, false);
        _this2.__selector = document.createElement('div');
        _this2.__selector.className = 'selector';
        _this2.__saturation_field = document.createElement('div');
        _this2.__saturation_field.className = 'saturation-field';
        _this2.__field_knob = document.createElement('div');
        _this2.__field_knob.className = 'field-knob';
        _this2.__field_knob_border = '2px solid ';
        _this2.__hue_knob = document.createElement('div');
        _this2.__hue_knob.className = 'hue-knob';
        _this2.__hue_field = document.createElement('div');
        _this2.__hue_field.className = 'hue-field';
        _this2.__input = document.createElement('input');
        _this2.__input.type = 'text';
        _this2.__input_textShadow = '0 1px 1px ';
        dom.bind(_this2.__input, 'keydown', function (e) {
          if (e.keyCode === 13) {
            onBlur.call(this);
          }
        });
        dom.bind(_this2.__input, 'blur', onBlur);
        dom.bind(_this2.__selector, 'mousedown', function ()        {
          dom.addClass(this, 'drag').bind(window, 'mouseup', function ()        {
            dom.removeClass(_this.__selector, 'drag');
          });
        });
        dom.bind(_this2.__selector, 'touchstart', function ()        {
          dom.addClass(this, 'drag').bind(window, 'touchend', function ()        {
            dom.removeClass(_this.__selector, 'drag');
          });
        });
        var valueField = document.createElement('div');
        Common.extend(_this2.__selector.style, {
          width: '122px',
          height: '102px',
          padding: '3px',
          backgroundColor: '#222',
          boxShadow: '0px 1px 3px rgba(0,0,0,0.3)'
        });
        Common.extend(_this2.__field_knob.style, {
          position: 'absolute',
          width: '12px',
          height: '12px',
          border: _this2.__field_knob_border + (_this2.__color.v < 0.5 ? '#fff' : '#000'),
          boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
          borderRadius: '12px',
          zIndex: 1
        });
        Common.extend(_this2.__hue_knob.style, {
          position: 'absolute',
          width: '15px',
          height: '2px',
          borderRight: '4px solid #fff',
          zIndex: 1
        });
        Common.extend(_this2.__saturation_field.style, {
          width: '100px',
          height: '100px',
          border: '1px solid #555',
          marginRight: '3px',
          display: 'inline-block',
          cursor: 'pointer'
        });
        Common.extend(valueField.style, {
          width: '100%',
          height: '100%',
          background: 'none'
        });
        linearGradient(valueField, 'top', 'rgba(0,0,0,0)', '#000');
        Common.extend(_this2.__hue_field.style, {
          width: '15px',
          height: '100px',
          border: '1px solid #555',
          cursor: 'ns-resize',
          position: 'absolute',
          top: '3px',
          right: '3px'
        });
        hueGradient(_this2.__hue_field);
        Common.extend(_this2.__input.style, {
          outline: 'none',
          textAlign: 'center',
          color: '#fff',
          border: 0,
          fontWeight: 'bold',
          textShadow: _this2.__input_textShadow + 'rgba(0,0,0,0.7)'
        });
        dom.bind(_this2.__saturation_field, 'mousedown', fieldDown);
        dom.bind(_this2.__saturation_field, 'touchstart', fieldDown);
        dom.bind(_this2.__field_knob, 'mousedown', fieldDown);
        dom.bind(_this2.__field_knob, 'touchstart', fieldDown);
        dom.bind(_this2.__hue_field, 'mousedown', fieldDownH);
        dom.bind(_this2.__hue_field, 'touchstart', fieldDownH);
        function fieldDown(e) {
          setSV(e);
          dom.bind(window, 'mousemove', setSV);
          dom.bind(window, 'touchmove', setSV);
          dom.bind(window, 'mouseup', fieldUpSV);
          dom.bind(window, 'touchend', fieldUpSV);
        }
        function fieldDownH(e) {
          setH(e);
          dom.bind(window, 'mousemove', setH);
          dom.bind(window, 'touchmove', setH);
          dom.bind(window, 'mouseup', fieldUpH);
          dom.bind(window, 'touchend', fieldUpH);
        }
        function fieldUpSV() {
          dom.unbind(window, 'mousemove', setSV);
          dom.unbind(window, 'touchmove', setSV);
          dom.unbind(window, 'mouseup', fieldUpSV);
          dom.unbind(window, 'touchend', fieldUpSV);
          onFinish();
        }
        function fieldUpH() {
          dom.unbind(window, 'mousemove', setH);
          dom.unbind(window, 'touchmove', setH);
          dom.unbind(window, 'mouseup', fieldUpH);
          dom.unbind(window, 'touchend', fieldUpH);
          onFinish();
        }
        function onBlur() {
          var i = interpret(this.value);
          if (i !== false) {
            _this.__color.__state = i;
            _this.setValue(_this.__color.toOriginal());
          } else {
            this.value = _this.__color.toString();
          }
        }
        function onFinish() {
          if (_this.__onFinishChange) {
            _this.__onFinishChange.call(_this, _this.__color.toOriginal());
          }
        }
        _this2.__saturation_field.appendChild(valueField);
        _this2.__selector.appendChild(_this2.__field_knob);
        _this2.__selector.appendChild(_this2.__saturation_field);
        _this2.__selector.appendChild(_this2.__hue_field);
        _this2.__hue_field.appendChild(_this2.__hue_knob);
        _this2.domElement.appendChild(_this2.__input);
        _this2.domElement.appendChild(_this2.__selector);
        _this2.updateDisplay();
        function setSV(e) {
          if (e.type.indexOf('touch') === -1) {
            e.preventDefault();
          }
          var fieldRect = _this.__saturation_field.getBoundingClientRect();
          var _ref = e.touches && e.touches[0] || e,
              clientX = _ref.clientX,
              clientY = _ref.clientY;
          var s = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
          var v = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
          if (v > 1) {
            v = 1;
          } else if (v < 0) {
            v = 0;
          }
          if (s > 1) {
            s = 1;
          } else if (s < 0) {
            s = 0;
          }
          _this.__color.v = v;
          _this.__color.s = s;
          _this.setValue(_this.__color.toOriginal());
          return false;
        }
        function setH(e) {
          if (e.type.indexOf('touch') === -1) {
            e.preventDefault();
          }
          var fieldRect = _this.__hue_field.getBoundingClientRect();
          var _ref2 = e.touches && e.touches[0] || e,
              clientY = _ref2.clientY;
          var h = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
          if (h > 1) {
            h = 1;
          } else if (h < 0) {
            h = 0;
          }
          _this.__color.h = h * 360;
          _this.setValue(_this.__color.toOriginal());
          return false;
        }
        return _this2;
      }
      createClass(ColorController, [{
        key: 'updateDisplay',
        value: function updateDisplay() {
          var i = interpret(this.getValue());
          if (i !== false) {
            var mismatch = false;
            Common.each(Color.COMPONENTS, function (component) {
              if (!Common.isUndefined(i[component]) && !Common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
                mismatch = true;
                return {};
              }
            }, this);
            if (mismatch) {
              Common.extend(this.__color.__state, i);
            }
          }
          Common.extend(this.__temp.__state, this.__color.__state);
          this.__temp.a = 1;
          var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
          var _flip = 255 - flip;
          Common.extend(this.__field_knob.style, {
            marginLeft: 100 * this.__color.s - 7 + 'px',
            marginTop: 100 * (1 - this.__color.v) - 7 + 'px',
            backgroundColor: this.__temp.toHexString(),
            border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip + ')'
          });
          this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + 'px';
          this.__temp.s = 1;
          this.__temp.v = 1;
          linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toHexString());
          this.__input.value = this.__color.toString();
          Common.extend(this.__input.style, {
            backgroundColor: this.__color.toHexString(),
            color: 'rgb(' + flip + ',' + flip + ',' + flip + ')',
            textShadow: this.__input_textShadow + 'rgba(' + _flip + ',' + _flip + ',' + _flip + ',.7)'
          });
        }
      }]);
      return ColorController;
    }(Controller);
    var vendors = ['-moz-', '-o-', '-webkit-', '-ms-', ''];
    function linearGradient(elem, x, a, b) {
      elem.style.background = '';
      Common.each(vendors, function (vendor) {
        elem.style.cssText += 'background: ' + vendor + 'linear-gradient(' + x + ', ' + a + ' 0%, ' + b + ' 100%); ';
      });
    }
    function hueGradient(elem) {
      elem.style.background = '';
      elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);';
      elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
      elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
      elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
      elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    }

    var css = {
      load: function load(url, indoc) {
        var doc = indoc || document;
        var link = doc.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = url;
        doc.getElementsByTagName('head')[0].appendChild(link);
      },
      inject: function inject(cssContent, indoc) {
        var doc = indoc || document;
        var injected = document.createElement('style');
        injected.type = 'text/css';
        injected.innerHTML = cssContent;
        var head = doc.getElementsByTagName('head')[0];
        try {
          head.appendChild(injected);
        } catch (e) {
        }
      }
    };

    var saveDialogContents = "<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n\n    </div>\n\n  </div>\n\n</div>";

    var ControllerFactory = function ControllerFactory(object, property) {
      var initialValue = object[property];
      if (Common.isArray(arguments[2]) || Common.isObject(arguments[2])) {
        return new OptionController(object, property, arguments[2]);
      }
      if (Common.isNumber(initialValue)) {
        if (Common.isNumber(arguments[2]) && Common.isNumber(arguments[3])) {
          if (Common.isNumber(arguments[4])) {
            return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4]);
          }
          return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
        }
        if (Common.isNumber(arguments[4])) {
          return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3], step: arguments[4] });
        }
        return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });
      }
      if (Common.isString(initialValue)) {
        return new StringController(object, property);
      }
      if (Common.isFunction(initialValue)) {
        return new FunctionController(object, property, '');
      }
      if (Common.isBoolean(initialValue)) {
        return new BooleanController(object, property);
      }
      return null;
    };

    function requestAnimationFrame$1(callback) {
      setTimeout(callback, 1000 / 60);
    }
    var requestAnimationFrame$1$1 = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimationFrame$1;

    var CenteredDiv = function () {
      function CenteredDiv() {
        classCallCheck(this, CenteredDiv);
        this.backgroundElement = document.createElement('div');
        Common.extend(this.backgroundElement.style, {
          backgroundColor: 'rgba(0,0,0,0.8)',
          top: 0,
          left: 0,
          display: 'none',
          zIndex: '1000',
          opacity: 0,
          WebkitTransition: 'opacity 0.2s linear',
          transition: 'opacity 0.2s linear'
        });
        dom.makeFullscreen(this.backgroundElement);
        this.backgroundElement.style.position = 'fixed';
        this.domElement = document.createElement('div');
        Common.extend(this.domElement.style, {
          position: 'fixed',
          display: 'none',
          zIndex: '1001',
          opacity: 0,
          WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s linear',
          transition: 'transform 0.2s ease-out, opacity 0.2s linear'
        });
        document.body.appendChild(this.backgroundElement);
        document.body.appendChild(this.domElement);
        var _this = this;
        dom.bind(this.backgroundElement, 'click', function () {
          _this.hide();
        });
      }
      createClass(CenteredDiv, [{
        key: 'show',
        value: function show() {
          var _this = this;
          this.backgroundElement.style.display = 'block';
          this.domElement.style.display = 'block';
          this.domElement.style.opacity = 0;
          this.domElement.style.webkitTransform = 'scale(1.1)';
          this.layout();
          Common.defer(function () {
            _this.backgroundElement.style.opacity = 1;
            _this.domElement.style.opacity = 1;
            _this.domElement.style.webkitTransform = 'scale(1)';
          });
        }
      }, {
        key: 'hide',
        value: function hide() {
          var _this = this;
          var hide = function hide() {
            _this.domElement.style.display = 'none';
            _this.backgroundElement.style.display = 'none';
            dom.unbind(_this.domElement, 'webkitTransitionEnd', hide);
            dom.unbind(_this.domElement, 'transitionend', hide);
            dom.unbind(_this.domElement, 'oTransitionEnd', hide);
          };
          dom.bind(this.domElement, 'webkitTransitionEnd', hide);
          dom.bind(this.domElement, 'transitionend', hide);
          dom.bind(this.domElement, 'oTransitionEnd', hide);
          this.backgroundElement.style.opacity = 0;
          this.domElement.style.opacity = 0;
          this.domElement.style.webkitTransform = 'scale(1.1)';
        }
      }, {
        key: 'layout',
        value: function layout() {
          this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + 'px';
          this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + 'px';
        }
      }]);
      return CenteredDiv;
    }();

    var styleSheet = ___$insertStyle(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");

    css.inject(styleSheet);
    var CSS_NAMESPACE = 'dg';
    var HIDE_KEY_CODE = 72;
    var CLOSE_BUTTON_HEIGHT = 20;
    var DEFAULT_DEFAULT_PRESET_NAME = 'Default';
    var SUPPORTS_LOCAL_STORAGE = function () {
      try {
        return !!window.localStorage;
      } catch (e) {
        return false;
      }
    }();
    var SAVE_DIALOGUE = void 0;
    var autoPlaceVirgin = true;
    var autoPlaceContainer = void 0;
    var hide = false;
    var hideableGuis = [];
    var GUI = function GUI(pars) {
      var _this = this;
      var params = pars || {};
      this.domElement = document.createElement('div');
      this.__ul = document.createElement('ul');
      this.domElement.appendChild(this.__ul);
      dom.addClass(this.domElement, CSS_NAMESPACE);
      this.__folders = {};
      this.__controllers = [];
      this.__rememberedObjects = [];
      this.__rememberedObjectIndecesToControllers = [];
      this.__listening = [];
      params = Common.defaults(params, {
        closeOnTop: false,
        autoPlace: true,
        width: GUI.DEFAULT_WIDTH
      });
      params = Common.defaults(params, {
        resizable: params.autoPlace,
        hideable: params.autoPlace
      });
      if (!Common.isUndefined(params.load)) {
        if (params.preset) {
          params.load.preset = params.preset;
        }
      } else {
        params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };
      }
      if (Common.isUndefined(params.parent) && params.hideable) {
        hideableGuis.push(this);
      }
      params.resizable = Common.isUndefined(params.parent) && params.resizable;
      if (params.autoPlace && Common.isUndefined(params.scrollable)) {
        params.scrollable = true;
      }
      var useLocalStorage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, 'isLocal')) === 'true';
      var saveToLocalStorage = void 0;
      var titleRow = void 0;
      Object.defineProperties(this,
      {
        parent: {
          get: function get$$1() {
            return params.parent;
          }
        },
        scrollable: {
          get: function get$$1() {
            return params.scrollable;
          }
        },
        autoPlace: {
          get: function get$$1() {
            return params.autoPlace;
          }
        },
        closeOnTop: {
          get: function get$$1() {
            return params.closeOnTop;
          }
        },
        preset: {
          get: function get$$1() {
            if (_this.parent) {
              return _this.getRoot().preset;
            }
            return params.load.preset;
          },
          set: function set$$1(v) {
            if (_this.parent) {
              _this.getRoot().preset = v;
            } else {
              params.load.preset = v;
            }
            setPresetSelectIndex(this);
            _this.revert();
          }
        },
        width: {
          get: function get$$1() {
            return params.width;
          },
          set: function set$$1(v) {
            params.width = v;
            setWidth(_this, v);
          }
        },
        name: {
          get: function get$$1() {
            return params.name;
          },
          set: function set$$1(v) {
            params.name = v;
            if (titleRow) {
              titleRow.innerHTML = params.name;
            }
          }
        },
        closed: {
          get: function get$$1() {
            return params.closed;
          },
          set: function set$$1(v) {
            params.closed = v;
            if (params.closed) {
              dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
            } else {
              dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
            }
            this.onResize();
            if (_this.__closeButton) {
              _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
            }
          }
        },
        load: {
          get: function get$$1() {
            return params.load;
          }
        },
        useLocalStorage: {
          get: function get$$1() {
            return useLocalStorage;
          },
          set: function set$$1(bool) {
            if (SUPPORTS_LOCAL_STORAGE) {
              useLocalStorage = bool;
              if (bool) {
                dom.bind(window, 'unload', saveToLocalStorage);
              } else {
                dom.unbind(window, 'unload', saveToLocalStorage);
              }
              localStorage.setItem(getLocalStorageHash(_this, 'isLocal'), bool);
            }
          }
        }
      });
      if (Common.isUndefined(params.parent)) {
        this.closed = params.closed || false;
        dom.addClass(this.domElement, GUI.CLASS_MAIN);
        dom.makeSelectable(this.domElement, false);
        if (SUPPORTS_LOCAL_STORAGE) {
          if (useLocalStorage) {
            _this.useLocalStorage = true;
            var savedGui = localStorage.getItem(getLocalStorageHash(this, 'gui'));
            if (savedGui) {
              params.load = JSON.parse(savedGui);
            }
          }
        }
        this.__closeButton = document.createElement('div');
        this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
        dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
        if (params.closeOnTop) {
          dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_TOP);
          this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
        } else {
          dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BOTTOM);
          this.domElement.appendChild(this.__closeButton);
        }
        dom.bind(this.__closeButton, 'click', function () {
          _this.closed = !_this.closed;
        });
      } else {
        if (params.closed === undefined) {
          params.closed = true;
        }
        var titleRowName = document.createTextNode(params.name);
        dom.addClass(titleRowName, 'controller-name');
        titleRow = addRow(_this, titleRowName);
        var onClickTitle = function onClickTitle(e) {
          e.preventDefault();
          _this.closed = !_this.closed;
          return false;
        };
        dom.addClass(this.__ul, GUI.CLASS_CLOSED);
        dom.addClass(titleRow, 'title');
        dom.bind(titleRow, 'click', onClickTitle);
        if (!params.closed) {
          this.closed = false;
        }
      }
      if (params.autoPlace) {
        if (Common.isUndefined(params.parent)) {
          if (autoPlaceVirgin) {
            autoPlaceContainer = document.createElement('div');
            dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
            dom.addClass(autoPlaceContainer, GUI.CLASS_AUTO_PLACE_CONTAINER);
            document.body.appendChild(autoPlaceContainer);
            autoPlaceVirgin = false;
          }
          autoPlaceContainer.appendChild(this.domElement);
          dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
        }
        if (!this.parent) {
          setWidth(_this, params.width);
        }
      }
      this.__resizeHandler = function () {
        _this.onResizeDebounced();
      };
      dom.bind(window, 'resize', this.__resizeHandler);
      dom.bind(this.__ul, 'webkitTransitionEnd', this.__resizeHandler);
      dom.bind(this.__ul, 'transitionend', this.__resizeHandler);
      dom.bind(this.__ul, 'oTransitionEnd', this.__resizeHandler);
      this.onResize();
      if (params.resizable) {
        addResizeHandle(this);
      }
      saveToLocalStorage = function saveToLocalStorage() {
        if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, 'isLocal')) === 'true') {
          localStorage.setItem(getLocalStorageHash(_this, 'gui'), JSON.stringify(_this.getSaveObject()));
        }
      };
      this.saveToLocalStorageIfPossible = saveToLocalStorage;
      function resetWidth() {
        var root = _this.getRoot();
        root.width += 1;
        Common.defer(function () {
          root.width -= 1;
        });
      }
      if (!params.parent) {
        resetWidth();
      }
    };
    GUI.toggleHide = function () {
      hide = !hide;
      Common.each(hideableGuis, function (gui) {
        gui.domElement.style.display = hide ? 'none' : '';
      });
    };
    GUI.CLASS_AUTO_PLACE = 'a';
    GUI.CLASS_AUTO_PLACE_CONTAINER = 'ac';
    GUI.CLASS_MAIN = 'main';
    GUI.CLASS_CONTROLLER_ROW = 'cr';
    GUI.CLASS_TOO_TALL = 'taller-than-window';
    GUI.CLASS_CLOSED = 'closed';
    GUI.CLASS_CLOSE_BUTTON = 'close-button';
    GUI.CLASS_CLOSE_TOP = 'close-top';
    GUI.CLASS_CLOSE_BOTTOM = 'close-bottom';
    GUI.CLASS_DRAG = 'drag';
    GUI.DEFAULT_WIDTH = 245;
    GUI.TEXT_CLOSED = 'Close Controls';
    GUI.TEXT_OPEN = 'Open Controls';
    GUI._keydownHandler = function (e) {
      if (document.activeElement.type !== 'text' && (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)) {
        GUI.toggleHide();
      }
    };
    dom.bind(window, 'keydown', GUI._keydownHandler, false);
    Common.extend(GUI.prototype,
    {
      add: function add(object, property) {
        return _add(this, object, property, {
          factoryArgs: Array.prototype.slice.call(arguments, 2)
        });
      },
      addColor: function addColor(object, property) {
        return _add(this, object, property, {
          color: true
        });
      },
      remove: function remove(controller) {
        this.__ul.removeChild(controller.__li);
        this.__controllers.splice(this.__controllers.indexOf(controller), 1);
        var _this = this;
        Common.defer(function () {
          _this.onResize();
        });
      },
      destroy: function destroy() {
        if (this.parent) {
          throw new Error('Only the root GUI should be removed with .destroy(). ' + 'For subfolders, use gui.removeFolder(folder) instead.');
        }
        if (this.autoPlace) {
          autoPlaceContainer.removeChild(this.domElement);
        }
        var _this = this;
        Common.each(this.__folders, function (subfolder) {
          _this.removeFolder(subfolder);
        });
        dom.unbind(window, 'keydown', GUI._keydownHandler, false);
        removeListeners(this);
      },
      addFolder: function addFolder(name) {
        if (this.__folders[name] !== undefined) {
          throw new Error('You already have a folder in this GUI by the' + ' name "' + name + '"');
        }
        var newGuiParams = { name: name, parent: this };
        newGuiParams.autoPlace = this.autoPlace;
        if (this.load &&
        this.load.folders &&
        this.load.folders[name]) {
          newGuiParams.closed = this.load.folders[name].closed;
          newGuiParams.load = this.load.folders[name];
        }
        var gui = new GUI(newGuiParams);
        this.__folders[name] = gui;
        var li = addRow(this, gui.domElement);
        dom.addClass(li, 'folder');
        return gui;
      },
      removeFolder: function removeFolder(folder) {
        this.__ul.removeChild(folder.domElement.parentElement);
        delete this.__folders[folder.name];
        if (this.load &&
        this.load.folders &&
        this.load.folders[folder.name]) {
          delete this.load.folders[folder.name];
        }
        removeListeners(folder);
        var _this = this;
        Common.each(folder.__folders, function (subfolder) {
          folder.removeFolder(subfolder);
        });
        Common.defer(function () {
          _this.onResize();
        });
      },
      open: function open() {
        this.closed = false;
      },
      close: function close() {
        this.closed = true;
      },
      hide: function hide() {
        this.domElement.style.display = 'none';
      },
      show: function show() {
        this.domElement.style.display = '';
      },
      onResize: function onResize() {
        var root = this.getRoot();
        if (root.scrollable) {
          var top = dom.getOffset(root.__ul).top;
          var h = 0;
          Common.each(root.__ul.childNodes, function (node) {
            if (!(root.autoPlace && node === root.__save_row)) {
              h += dom.getHeight(node);
            }
          });
          if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
            dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
            root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + 'px';
          } else {
            dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
            root.__ul.style.height = 'auto';
          }
        }
        if (root.__resize_handle) {
          Common.defer(function () {
            root.__resize_handle.style.height = root.__ul.offsetHeight + 'px';
          });
        }
        if (root.__closeButton) {
          root.__closeButton.style.width = root.width + 'px';
        }
      },
      onResizeDebounced: Common.debounce(function () {
        this.onResize();
      }, 50),
      remember: function remember() {
        if (Common.isUndefined(SAVE_DIALOGUE)) {
          SAVE_DIALOGUE = new CenteredDiv();
          SAVE_DIALOGUE.domElement.innerHTML = saveDialogContents;
        }
        if (this.parent) {
          throw new Error('You can only call remember on a top level GUI.');
        }
        var _this = this;
        Common.each(Array.prototype.slice.call(arguments), function (object) {
          if (_this.__rememberedObjects.length === 0) {
            addSaveMenu(_this);
          }
          if (_this.__rememberedObjects.indexOf(object) === -1) {
            _this.__rememberedObjects.push(object);
          }
        });
        if (this.autoPlace) {
          setWidth(this, this.width);
        }
      },
      getRoot: function getRoot() {
        var gui = this;
        while (gui.parent) {
          gui = gui.parent;
        }
        return gui;
      },
      getSaveObject: function getSaveObject() {
        var toReturn = this.load;
        toReturn.closed = this.closed;
        if (this.__rememberedObjects.length > 0) {
          toReturn.preset = this.preset;
          if (!toReturn.remembered) {
            toReturn.remembered = {};
          }
          toReturn.remembered[this.preset] = getCurrentPreset(this);
        }
        toReturn.folders = {};
        Common.each(this.__folders, function (element, key) {
          toReturn.folders[key] = element.getSaveObject();
        });
        return toReturn;
      },
      save: function save() {
        if (!this.load.remembered) {
          this.load.remembered = {};
        }
        this.load.remembered[this.preset] = getCurrentPreset(this);
        markPresetModified(this, false);
        this.saveToLocalStorageIfPossible();
      },
      saveAs: function saveAs(presetName) {
        if (!this.load.remembered) {
          this.load.remembered = {};
          this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
        }
        this.load.remembered[presetName] = getCurrentPreset(this);
        this.preset = presetName;
        addPresetOption(this, presetName, true);
        this.saveToLocalStorageIfPossible();
      },
      revert: function revert(gui) {
        Common.each(this.__controllers, function (controller) {
          if (!this.getRoot().load.remembered) {
            controller.setValue(controller.initialValue);
          } else {
            recallSavedValue(gui || this.getRoot(), controller);
          }
          if (controller.__onFinishChange) {
            controller.__onFinishChange.call(controller, controller.getValue());
          }
        }, this);
        Common.each(this.__folders, function (folder) {
          folder.revert(folder);
        });
        if (!gui) {
          markPresetModified(this.getRoot(), false);
        }
      },
      listen: function listen(controller) {
        var init = this.__listening.length === 0;
        this.__listening.push(controller);
        if (init) {
          updateDisplays(this.__listening);
        }
      },
      updateDisplay: function updateDisplay() {
        Common.each(this.__controllers, function (controller) {
          controller.updateDisplay();
        });
        Common.each(this.__folders, function (folder) {
          folder.updateDisplay();
        });
      }
    });
    function addRow(gui, newDom, liBefore) {
      var li = document.createElement('li');
      if (newDom) {
        li.appendChild(newDom);
      }
      if (liBefore) {
        gui.__ul.insertBefore(li, liBefore);
      } else {
        gui.__ul.appendChild(li);
      }
      gui.onResize();
      return li;
    }
    function removeListeners(gui) {
      dom.unbind(window, 'resize', gui.__resizeHandler);
      if (gui.saveToLocalStorageIfPossible) {
        dom.unbind(window, 'unload', gui.saveToLocalStorageIfPossible);
      }
    }
    function markPresetModified(gui, modified) {
      var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
      if (modified) {
        opt.innerHTML = opt.value + '*';
      } else {
        opt.innerHTML = opt.value;
      }
    }
    function augmentController(gui, li, controller) {
      controller.__li = li;
      controller.__gui = gui;
      Common.extend(controller,                                   {
        options: function options(_options) {
          if (arguments.length > 1) {
            var nextSibling = controller.__li.nextElementSibling;
            controller.remove();
            return _add(gui, controller.object, controller.property, {
              before: nextSibling,
              factoryArgs: [Common.toArray(arguments)]
            });
          }
          if (Common.isArray(_options) || Common.isObject(_options)) {
            var _nextSibling = controller.__li.nextElementSibling;
            controller.remove();
            return _add(gui, controller.object, controller.property, {
              before: _nextSibling,
              factoryArgs: [_options]
            });
          }
        },
        name: function name(_name) {
          controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
          return controller;
        },
        listen: function listen() {
          controller.__gui.listen(controller);
          return controller;
        },
        remove: function remove() {
          controller.__gui.remove(controller);
          return controller;
        }
      });
      if (controller instanceof NumberControllerSlider) {
        var box = new NumberControllerBox(controller.object, controller.property, { min: controller.__min, max: controller.__max, step: controller.__step });
        Common.each(['updateDisplay', 'onChange', 'onFinishChange', 'step', 'min', 'max'], function (method) {
          var pc = controller[method];
          var pb = box[method];
          controller[method] = box[method] = function () {
            var args = Array.prototype.slice.call(arguments);
            pb.apply(box, args);
            return pc.apply(controller, args);
          };
        });
        dom.addClass(li, 'has-slider');
        controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
      } else if (controller instanceof NumberControllerBox) {
        var r = function r(returned) {
          if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
            var oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
            var wasListening = controller.__gui.__listening.indexOf(controller) > -1;
            controller.remove();
            var newController = _add(gui, controller.object, controller.property, {
              before: controller.__li.nextElementSibling,
              factoryArgs: [controller.__min, controller.__max, controller.__step]
            });
            newController.name(oldName);
            if (wasListening) newController.listen();
            return newController;
          }
          return returned;
        };
        controller.min = Common.compose(r, controller.min);
        controller.max = Common.compose(r, controller.max);
      } else if (controller instanceof BooleanController) {
        dom.bind(li, 'click', function () {
          dom.fakeEvent(controller.__checkbox, 'click');
        });
        dom.bind(controller.__checkbox, 'click', function (e) {
          e.stopPropagation();
        });
      } else if (controller instanceof FunctionController) {
        dom.bind(li, 'click', function () {
          dom.fakeEvent(controller.__button, 'click');
        });
        dom.bind(li, 'mouseover', function () {
          dom.addClass(controller.__button, 'hover');
        });
        dom.bind(li, 'mouseout', function () {
          dom.removeClass(controller.__button, 'hover');
        });
      } else if (controller instanceof ColorController) {
        dom.addClass(li, 'color');
        controller.updateDisplay = Common.compose(function (val) {
          li.style.borderLeftColor = controller.__color.toString();
          return val;
        }, controller.updateDisplay);
        controller.updateDisplay();
      }
      controller.setValue = Common.compose(function (val) {
        if (gui.getRoot().__preset_select && controller.isModified()) {
          markPresetModified(gui.getRoot(), true);
        }
        return val;
      }, controller.setValue);
    }
    function recallSavedValue(gui, controller) {
      var root = gui.getRoot();
      var matchedIndex = root.__rememberedObjects.indexOf(controller.object);
      if (matchedIndex !== -1) {
        var controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];
        if (controllerMap === undefined) {
          controllerMap = {};
          root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
        }
        controllerMap[controller.property] = controller;
        if (root.load && root.load.remembered) {
          var presetMap = root.load.remembered;
          var preset = void 0;
          if (presetMap[gui.preset]) {
            preset = presetMap[gui.preset];
          } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
            preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
          } else {
            return;
          }
          if (preset[matchedIndex] && preset[matchedIndex][controller.property] !== undefined) {
            var value = preset[matchedIndex][controller.property];
            controller.initialValue = value;
            controller.setValue(value);
          }
        }
      }
    }
    function _add(gui, object, property, params) {
      if (object[property] === undefined) {
        throw new Error('Object "' + object + '" has no property "' + property + '"');
      }
      var controller = void 0;
      if (params.color) {
        controller = new ColorController(object, property);
      } else {
        var factoryArgs = [object, property].concat(params.factoryArgs);
        controller = ControllerFactory.apply(gui, factoryArgs);
      }
      if (params.before instanceof Controller) {
        params.before = params.before.__li;
      }
      recallSavedValue(gui, controller);
      dom.addClass(controller.domElement, 'c');
      var name = document.createElement('span');
      dom.addClass(name, 'property-name');
      name.innerHTML = controller.property;
      var container = document.createElement('div');
      container.appendChild(name);
      container.appendChild(controller.domElement);
      var li = addRow(gui, container, params.before);
      dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
      if (controller instanceof ColorController) {
        dom.addClass(li, 'color');
      } else {
        dom.addClass(li, _typeof(controller.getValue()));
      }
      augmentController(gui, li, controller);
      gui.__controllers.push(controller);
      return controller;
    }
    function getLocalStorageHash(gui, key) {
      return document.location.href + '.' + key;
    }
    function addPresetOption(gui, name, setSelected) {
      var opt = document.createElement('option');
      opt.innerHTML = name;
      opt.value = name;
      gui.__preset_select.appendChild(opt);
      if (setSelected) {
        gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
      }
    }
    function showHideExplain(gui, explain) {
      explain.style.display = gui.useLocalStorage ? 'block' : 'none';
    }
    function addSaveMenu(gui) {
      var div = gui.__save_row = document.createElement('li');
      dom.addClass(gui.domElement, 'has-save');
      gui.__ul.insertBefore(div, gui.__ul.firstChild);
      dom.addClass(div, 'save-row');
      var gears = document.createElement('span');
      gears.innerHTML = '&nbsp;';
      dom.addClass(gears, 'button gears');
      var button = document.createElement('span');
      button.innerHTML = 'Save';
      dom.addClass(button, 'button');
      dom.addClass(button, 'save');
      var button2 = document.createElement('span');
      button2.innerHTML = 'New';
      dom.addClass(button2, 'button');
      dom.addClass(button2, 'save-as');
      var button3 = document.createElement('span');
      button3.innerHTML = 'Revert';
      dom.addClass(button3, 'button');
      dom.addClass(button3, 'revert');
      var select = gui.__preset_select = document.createElement('select');
      if (gui.load && gui.load.remembered) {
        Common.each(gui.load.remembered, function (value, key) {
          addPresetOption(gui, key, key === gui.preset);
        });
      } else {
        addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
      }
      dom.bind(select, 'change', function () {
        for (var index = 0; index < gui.__preset_select.length; index++) {
          gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
        }
        gui.preset = this.value;
      });
      div.appendChild(select);
      div.appendChild(gears);
      div.appendChild(button);
      div.appendChild(button2);
      div.appendChild(button3);
      if (SUPPORTS_LOCAL_STORAGE) {
        var explain = document.getElementById('dg-local-explain');
        var localStorageCheckBox = document.getElementById('dg-local-storage');
        var saveLocally = document.getElementById('dg-save-locally');
        saveLocally.style.display = 'block';
        if (localStorage.getItem(getLocalStorageHash(gui, 'isLocal')) === 'true') {
          localStorageCheckBox.setAttribute('checked', 'checked');
        }
        showHideExplain(gui, explain);
        dom.bind(localStorageCheckBox, 'change', function () {
          gui.useLocalStorage = !gui.useLocalStorage;
          showHideExplain(gui, explain);
        });
      }
      var newConstructorTextArea = document.getElementById('dg-new-constructor');
      dom.bind(newConstructorTextArea, 'keydown', function (e) {
        if (e.metaKey && (e.which === 67 || e.keyCode === 67)) {
          SAVE_DIALOGUE.hide();
        }
      });
      dom.bind(gears, 'click', function () {
        newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
        SAVE_DIALOGUE.show();
        newConstructorTextArea.focus();
        newConstructorTextArea.select();
      });
      dom.bind(button, 'click', function () {
        gui.save();
      });
      dom.bind(button2, 'click', function () {
        var presetName = prompt('Enter a new preset name.');
        if (presetName) {
          gui.saveAs(presetName);
        }
      });
      dom.bind(button3, 'click', function () {
        gui.revert();
      });
    }
    function addResizeHandle(gui) {
      var pmouseX = void 0;
      gui.__resize_handle = document.createElement('div');
      Common.extend(gui.__resize_handle.style, {
        width: '6px',
        marginLeft: '-3px',
        height: '200px',
        cursor: 'ew-resize',
        position: 'absolute'
      });
      function drag(e) {
        e.preventDefault();
        gui.width += pmouseX - e.clientX;
        gui.onResize();
        pmouseX = e.clientX;
        return false;
      }
      function dragStop() {
        dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
        dom.unbind(window, 'mousemove', drag);
        dom.unbind(window, 'mouseup', dragStop);
      }
      function dragStart(e) {
        e.preventDefault();
        pmouseX = e.clientX;
        dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
        dom.bind(window, 'mousemove', drag);
        dom.bind(window, 'mouseup', dragStop);
        return false;
      }
      dom.bind(gui.__resize_handle, 'mousedown', dragStart);
      dom.bind(gui.__closeButton, 'mousedown', dragStart);
      gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
    }
    function setWidth(gui, w) {
      gui.domElement.style.width = w + 'px';
      if (gui.__save_row && gui.autoPlace) {
        gui.__save_row.style.width = w + 'px';
      }
      if (gui.__closeButton) {
        gui.__closeButton.style.width = w + 'px';
      }
    }
    function getCurrentPreset(gui, useInitialValues) {
      var toReturn = {};
      Common.each(gui.__rememberedObjects, function (val, index) {
        var savedValues = {};
        var controllerMap = gui.__rememberedObjectIndecesToControllers[index];
        Common.each(controllerMap, function (controller, property) {
          savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
        });
        toReturn[index] = savedValues;
      });
      return toReturn;
    }
    function setPresetSelectIndex(gui) {
      for (var index = 0; index < gui.__preset_select.length; index++) {
        if (gui.__preset_select[index].value === gui.preset) {
          gui.__preset_select.selectedIndex = index;
        }
      }
    }
    function updateDisplays(controllerArray) {
      if (controllerArray.length !== 0) {
        requestAnimationFrame$1$1.call(window, function () {
          updateDisplays(controllerArray);
        });
      }
      Common.each(controllerArray, function (c) {
        c.updateDisplay();
      });
    }
    var GUI$1 = GUI;

    const CUBE_SIDE_FRONT = 'front';
    const CUBE_SIDE_BACK = 'back';
    const CUBE_SIDE_TOP = 'top';
    const CUBE_SIDE_BOTTOM = 'bottom';
    const CUBE_SIDE_LEFT = 'left';
    const CUBE_SIDE_RIGHT = 'right';

    /**
     * Common utilities
     * @module glMatrix
     */
    // Configuration Constants
    var EPSILON = 0.000001;
    var ARRAY_TYPE$1 = typeof Float32Array !== 'undefined' ? Float32Array : Array;
    if (!Math.hypot) Math.hypot = function () {
      var y = 0,
          i = arguments.length;

      while (i--) {
        y += arguments[i] * arguments[i];
      }

      return Math.sqrt(y);
    };

    /**
     * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
     * @module mat4
     */

    /**
     * Creates a new identity mat4
     *
     * @returns {mat4} a new 4x4 matrix
     */

    function create$2() {
      var out = new ARRAY_TYPE$1(16);

      if (ARRAY_TYPE$1 != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
      }

      out[0] = 1;
      out[5] = 1;
      out[10] = 1;
      out[15] = 1;
      return out;
    }
    /**
     * Copy the values from one mat4 to another
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the source matrix
     * @returns {mat4} out
     */

    function copy(out, a) {
      out[0] = a[0];
      out[1] = a[1];
      out[2] = a[2];
      out[3] = a[3];
      out[4] = a[4];
      out[5] = a[5];
      out[6] = a[6];
      out[7] = a[7];
      out[8] = a[8];
      out[9] = a[9];
      out[10] = a[10];
      out[11] = a[11];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
      return out;
    }
    /**
     * Set a mat4 to the identity matrix
     *
     * @param {mat4} out the receiving matrix
     * @returns {mat4} out
     */

    function identity$1(out) {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    }
    /**
     * Translate a mat4 by the given vector
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to translate
     * @param {ReadonlyVec3} v vector to translate by
     * @returns {mat4} out
     */

    function translate$1(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      var a00, a01, a02, a03;
      var a10, a11, a12, a13;
      var a20, a21, a22, a23;

      if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
      } else {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;
        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
      }

      return out;
    }
    /**
     * Scales the mat4 by the dimensions in the given vec3 not using vectorization
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to scale
     * @param {ReadonlyVec3} v the vec3 to scale the matrix by
     * @returns {mat4} out
     **/

    function scale$1(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      out[0] = a[0] * x;
      out[1] = a[1] * x;
      out[2] = a[2] * x;
      out[3] = a[3] * x;
      out[4] = a[4] * y;
      out[5] = a[5] * y;
      out[6] = a[6] * y;
      out[7] = a[7] * y;
      out[8] = a[8] * z;
      out[9] = a[9] * z;
      out[10] = a[10] * z;
      out[11] = a[11] * z;
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the X axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateX$1(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a10 = a[4];
      var a11 = a[5];
      var a12 = a[6];
      var a13 = a[7];
      var a20 = a[8];
      var a21 = a[9];
      var a22 = a[10];
      var a23 = a[11];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[4] = a10 * c + a20 * s;
      out[5] = a11 * c + a21 * s;
      out[6] = a12 * c + a22 * s;
      out[7] = a13 * c + a23 * s;
      out[8] = a20 * c - a10 * s;
      out[9] = a21 * c - a11 * s;
      out[10] = a22 * c - a12 * s;
      out[11] = a23 * c - a13 * s;
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the Y axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateY$1(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a00 = a[0];
      var a01 = a[1];
      var a02 = a[2];
      var a03 = a[3];
      var a20 = a[8];
      var a21 = a[9];
      var a22 = a[10];
      var a23 = a[11];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[0] = a00 * c - a20 * s;
      out[1] = a01 * c - a21 * s;
      out[2] = a02 * c - a22 * s;
      out[3] = a03 * c - a23 * s;
      out[8] = a00 * s + a20 * c;
      out[9] = a01 * s + a21 * c;
      out[10] = a02 * s + a22 * c;
      out[11] = a03 * s + a23 * c;
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the Z axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateZ$1(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a00 = a[0];
      var a01 = a[1];
      var a02 = a[2];
      var a03 = a[3];
      var a10 = a[4];
      var a11 = a[5];
      var a12 = a[6];
      var a13 = a[7];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[0] = a00 * c + a10 * s;
      out[1] = a01 * c + a11 * s;
      out[2] = a02 * c + a12 * s;
      out[3] = a03 * c + a13 * s;
      out[4] = a10 * c - a00 * s;
      out[5] = a11 * c - a01 * s;
      out[6] = a12 * c - a02 * s;
      out[7] = a13 * c - a03 * s;
      return out;
    }
    /**
     * Generates a perspective projection matrix with the given bounds.
     * Passing null/undefined/no value for far will generate infinite projection matrix.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} fovy Vertical field of view in radians
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum, can be null or Infinity
     * @returns {mat4} out
     */

    function perspective(out, fovy, aspect, near, far) {
      var f = 1.0 / Math.tan(fovy / 2),
          nf;
      out[0] = f / aspect;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = f;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = -1;
      out[12] = 0;
      out[13] = 0;
      out[15] = 0;

      if (far != null && far !== Infinity) {
        nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = 2 * far * near * nf;
      } else {
        out[10] = -1;
        out[14] = -2 * near;
      }

      return out;
    }
    /**
     * Generates a orthogonal projection matrix with the given bounds
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} left Left bound of the frustum
     * @param {number} right Right bound of the frustum
     * @param {number} bottom Bottom bound of the frustum
     * @param {number} top Top bound of the frustum
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @returns {mat4} out
     */

    function ortho(out, left, right, bottom, top, near, far) {
      var lr = 1 / (left - right);
      var bt = 1 / (bottom - top);
      var nf = 1 / (near - far);
      out[0] = -2 * lr;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = -2 * bt;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 2 * nf;
      out[11] = 0;
      out[12] = (left + right) * lr;
      out[13] = (top + bottom) * bt;
      out[14] = (far + near) * nf;
      out[15] = 1;
      return out;
    }
    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis.
     * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {ReadonlyVec3} eye Position of the viewer
     * @param {ReadonlyVec3} center Point the viewer is looking at
     * @param {ReadonlyVec3} up vec3 pointing up
     * @returns {mat4} out
     */

    function lookAt(out, eye, center, up) {
      var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
      var eyex = eye[0];
      var eyey = eye[1];
      var eyez = eye[2];
      var upx = up[0];
      var upy = up[1];
      var upz = up[2];
      var centerx = center[0];
      var centery = center[1];
      var centerz = center[2];

      if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
        return identity$1(out);
      }

      z0 = eyex - centerx;
      z1 = eyey - centery;
      z2 = eyez - centerz;
      len = 1 / Math.hypot(z0, z1, z2);
      z0 *= len;
      z1 *= len;
      z2 *= len;
      x0 = upy * z2 - upz * z1;
      x1 = upz * z0 - upx * z2;
      x2 = upx * z1 - upy * z0;
      len = Math.hypot(x0, x1, x2);

      if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
      } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
      }

      y0 = z1 * x2 - z2 * x1;
      y1 = z2 * x0 - z0 * x2;
      y2 = z0 * x1 - z1 * x0;
      len = Math.hypot(y0, y1, y2);

      if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
      } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
      }

      out[0] = x0;
      out[1] = y0;
      out[2] = z0;
      out[3] = 0;
      out[4] = x1;
      out[5] = y1;
      out[6] = z1;
      out[7] = 0;
      out[8] = x2;
      out[9] = y2;
      out[10] = z2;
      out[11] = 0;
      out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
      out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
      out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
      out[15] = 1;
      return out;
    }

    /**
     * 3 Dimensional Vector
     * @module vec3
     */

    /**
     * Creates a new, empty vec3
     *
     * @returns {vec3} a new 3D vector
     */

    function create$1$1() {
      var out = new ARRAY_TYPE$1(3);

      if (ARRAY_TYPE$1 != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
      }

      return out;
    }
    /**
     * Creates a new vec3 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} a new 3D vector
     */

    function fromValues(x, y, z) {
      var out = new ARRAY_TYPE$1(3);
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }
    /**
     * Set the components of a vec3 to the given values
     *
     * @param {vec3} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} out
     */

    function set$1(out, x, y, z) {
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }
    /**
     * Adds two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the first operand
     * @param {ReadonlyVec3} b the second operand
     * @returns {vec3} out
     */

    function add(out, a, b) {
      out[0] = a[0] + b[0];
      out[1] = a[1] + b[1];
      out[2] = a[2] + b[2];
      return out;
    }
    /**
     * Subtracts vector b from vector a
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the first operand
     * @param {ReadonlyVec3} b the second operand
     * @returns {vec3} out
     */

    function subtract(out, a, b) {
      out[0] = a[0] - b[0];
      out[1] = a[1] - b[1];
      out[2] = a[2] - b[2];
      return out;
    }
    /**
     * Scales a vec3 by a scalar number
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @returns {vec3} out
     */

    function scale$2(out, a, b) {
      out[0] = a[0] * b;
      out[1] = a[1] * b;
      out[2] = a[2] * b;
      return out;
    }
    /**
     * Normalize a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {ReadonlyVec3} a vector to normalize
     * @returns {vec3} out
     */

    function normalize(out, a) {
      var x = a[0];
      var y = a[1];
      var z = a[2];
      var len = x * x + y * y + z * z;

      if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
      }

      out[0] = a[0] * len;
      out[1] = a[1] * len;
      out[2] = a[2] * len;
      return out;
    }
    /**
     * Alias for {@link vec3.subtract}
     * @function
     */

    var sub = subtract;
    /**
     * Perform some operation over an array of vec3s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    (function () {
      var vec = create$1$1();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 3;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];
          vec[1] = a[i + 1];
          vec[2] = a[i + 2];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
          a[i + 2] = vec[2];
        }

        return a;
      };
    })();

    /**
     * 2 Dimensional Vector
     * @module vec2
     */

    /**
     * Creates a new, empty vec2
     *
     * @returns {vec2} a new 2D vector
     */

    function create$3() {
      var out = new ARRAY_TYPE$1(2);

      if (ARRAY_TYPE$1 != Float32Array) {
        out[0] = 0;
        out[1] = 0;
      }

      return out;
    }
    /**
     * Perform some operation over an array of vec2s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    (function () {
      var vec = create$3();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 2;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];
          vec[1] = a[i + 1];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
        }

        return a;
      };
    })();

    /**
     * Base transform class to handle vectors and matrices
     *
     * @public
     */
    class Transform {
        constructor() {
            this.position = fromValues(0, 0, 0);
            this.rotation = fromValues(0, 0, 0);
            this.scale = fromValues(1, 1, 1);
            this.modelMatrix = create$2();
            this.shouldUpdate = true;
        }
        /**
         * @returns {this}
         */
        copyFromMatrix(matrix) {
            copy(this.modelMatrix, matrix);
            this.shouldUpdate = false;
            return this;
        }
        /**
         * @returns {this}
         */
        setPosition(position) {
            const { x = this.position[0], y = this.position[1], z = this.position[2], } = position;
            set$1(this.position, x, y, z);
            this.shouldUpdate = true;
            return this;
        }
        /**
         * Sets scale
         * @returns {this}
         */
        setScale(scale) {
            const { x = this.scale[0], y = this.scale[1], z = this.scale[2] } = scale;
            set$1(this.scale, x, y, z);
            this.shouldUpdate = true;
            return this;
        }
        /**
         * Sets rotation
         * @returns {this}
         */
        setRotation(rotation) {
            const { x = this.rotation[0], y = this.rotation[1], z = this.rotation[2], } = rotation;
            set$1(this.rotation, x, y, z);
            this.shouldUpdate = true;
            return this;
        }
        /**
         * Update model matrix with scale, rotation and translation
         * @returns {this}
         */
        updateModelMatrix() {
            identity$1(this.modelMatrix);
            translate$1(this.modelMatrix, this.modelMatrix, this.position);
            rotateX$1(this.modelMatrix, this.modelMatrix, this.rotation[0]);
            rotateY$1(this.modelMatrix, this.modelMatrix, this.rotation[1]);
            rotateZ$1(this.modelMatrix, this.modelMatrix, this.rotation[2]);
            scale$1(this.modelMatrix, this.modelMatrix, this.scale);
            this.shouldUpdate = false;
            return this;
        }
    }
    /**
     * Normalizes a number
     * @param {number} min
     * @param {number} max
     * @param {number} val
     * @returns {number}
     */
    const normalizeNumber = (min, max, val) => (val - min) / (max - min);
    /**
     *
     * @param {number} t
     * @returns {number}
     */
    const triangleWave = (t) => {
        t -= Math.floor(t * 0.5) * 2;
        t = Math.min(Math.max(t, 0), 2);
        return 1 - Math.abs(t - 1);
    };

    class PerspectiveCamera {
        constructor(fieldOfView, aspect, near, far) {
            this.position = [0, 0, 0];
            this.lookAtPosition = [0, 0, 0];
            this.projectionMatrix = create$2();
            this.viewMatrix = create$2();
            this.zoom = 1;
            this.fieldOfView = fieldOfView;
            this.aspect = aspect;
            this.near = near;
            this.far = far;
            this.updateProjectionMatrix();
        }
        setPosition({ x = this.position[0], y = this.position[1], z = this.position[2], }) {
            this.position = [x, y, z];
            return this;
        }
        updateViewMatrix() {
            lookAt(this.viewMatrix, this.position, this.lookAtPosition, PerspectiveCamera.UP_VECTOR);
            return this;
        }
        updateProjectionMatrix() {
            perspective(this.projectionMatrix, this.fieldOfView, this.aspect, this.near, this.far);
            return this;
        }
        lookAt(target) {
            this.lookAtPosition = target;
            this.updateViewMatrix();
            return this;
        }
    }
    PerspectiveCamera.UP_VECTOR = [0, 1, 0];

    class OrthographicCamera {
        constructor(left, right, top, bottom, near, far) {
            this.left = -1;
            this.right = 1;
            this.top = 1;
            this.bottom = -1;
            this.near = 0.1;
            this.far = 2000;
            this.zoom = 1;
            this.position = [0, 0, 0];
            this.lookAtPosition = [0, 0, 0];
            this.projectionMatrix = create$2();
            this.viewMatrix = create$2();
            this.left = left;
            this.right = right;
            this.top = top;
            this.bottom = bottom;
            this.near = near;
            this.far = far;
            this.updateProjectionMatrix();
        }
        setPosition({ x = this.position[0], y = this.position[1], z = this.position[2], }) {
            this.position = [x, y, z];
            return this;
        }
        updateViewMatrix() {
            lookAt(this.viewMatrix, this.position, this.lookAtPosition, OrthographicCamera.UP_VECTOR);
            return this;
        }
        updateProjectionMatrix() {
            ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
            return this;
        }
        lookAt(target) {
            this.lookAtPosition = target;
            this.updateViewMatrix();
            return this;
        }
    }
    OrthographicCamera.UP_VECTOR = [0, 1, 0];

    /**
     * @private
     */
    function buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, u = 0, v = 1, w = 2, uDir = 1, vDir = -1, i = 0, ii = 0) {
        const io = i;
        const segW = width / wSegs;
        const segH = height / hSegs;
        for (let iy = 0; iy <= hSegs; iy++) {
            const y = iy * segH - height / 2;
            for (let ix = 0; ix <= wSegs; ix++, i++) {
                const x = ix * segW - width / 2;
                vertices[i * 3 + u] = x * uDir;
                vertices[i * 3 + v] = y * vDir;
                vertices[i * 3 + w] = depth / 2;
                normal[i * 3 + u] = 0;
                normal[i * 3 + v] = 0;
                normal[i * 3 + w] = depth >= 0 ? 1 : -1;
                uv[i * 2] = ix / wSegs;
                uv[i * 2 + 1] = 1 - iy / hSegs;
                if (iy === hSegs || ix === wSegs)
                    continue;
                const a = io + ix + iy * (wSegs + 1);
                const b = io + ix + (iy + 1) * (wSegs + 1);
                const c = io + ix + (iy + 1) * (wSegs + 1) + 1;
                const d = io + ix + iy * (wSegs + 1) + 1;
                indices[ii * 6] = a;
                indices[ii * 6 + 1] = b;
                indices[ii * 6 + 2] = d;
                indices[ii * 6 + 3] = b;
                indices[ii * 6 + 4] = c;
                indices[ii * 6 + 5] = d;
                ii++;
            }
        }
    }

    /**
     * Generates geometry data for a box
     * @param {Box} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createBox(params = {}) {
        const { width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const dSegs = depthSegments;
        const num = (wSegs + 1) * (hSegs + 1) * 2 +
            (wSegs + 1) * (dSegs + 1) * 2 +
            (hSegs + 1) * (dSegs + 1) * 2;
        const numIndices = (wSegs * hSegs * 2 + wSegs * dSegs * 2 + hSegs * dSegs * 2) * 6;
        const vertices = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
        let i = 0;
        let ii = 0;
        {
            // RIGHT
            buildPlane(vertices, normal, uv, indices, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii);
        }
        {
            // LEFT
            buildPlane(vertices, normal, uv, indices, depth, height, -width, dSegs, hSegs, 2, 1, 0, 1, -1, (i += (dSegs + 1) * (hSegs + 1)), (ii += dSegs * hSegs));
        }
        {
            // TOP
            buildPlane(vertices, normal, uv, indices, width, depth, height, dSegs, hSegs, 0, 2, 1, 1, 1, (i += (dSegs + 1) * (hSegs + 1)), (ii += dSegs * hSegs));
        }
        {
            // BOTTOM
            buildPlane(vertices, normal, uv, indices, width, depth, -height, dSegs, hSegs, 0, 2, 1, 1, -1, (i += (wSegs + 1) * (dSegs + 1)), (ii += wSegs * dSegs));
        }
        {
            // BACK
            buildPlane(vertices, normal, uv, indices, width, height, -depth, wSegs, hSegs, 0, 1, 2, -1, -1, (i += (wSegs + 1) * (dSegs + 1)), (ii += wSegs * dSegs));
        }
        {
            // FRONT
            buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, 0, 1, 2, 1, -1, (i += (wSegs + 1) * (hSegs + 1)), (ii += wSegs * hSegs));
        }
        return {
            vertices,
            normal,
            uv,
            indices,
        };
    }

    /**
     * Generates geometry data for a box
     * @param {Box} params
     * @returns {[{ vertices, normal, uv, indices, orientation }]}
     */
    function createBoxSeparateFace(params = {}) {
        const { width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const dSegs = depthSegments;
        const sidesData = [];
        const i = 0;
        const ii = 0;
        {
            // RIGHT
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, depth, height, width, dSegs, hSegs, 2, 1, 0, -1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_RIGHT,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // LEFT
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, depth, height, -width, dSegs, hSegs, 2, 1, 0, 1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_LEFT,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // TOP
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, depth, height, dSegs, hSegs, 0, 2, 1, 1, 1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_TOP,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // BOTTOM
            const num = (dSegs + 1) * (hSegs + 1);
            const numIndices = dSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, depth, -height, dSegs, hSegs, 0, 2, 1, 1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_BOTTOM,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // BACK
            const num = (wSegs + 1) * (dSegs + 1);
            const numIndices = wSegs * dSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, height, -depth, wSegs, hSegs, 0, 1, 2, -1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_BACK,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        {
            // FRONT
            const num = (wSegs + 1) * (hSegs + 1);
            const numIndices = wSegs * hSegs * 6;
            const vertices = new Float32Array(num * 3);
            const normal = new Float32Array(num * 3);
            const uv = new Float32Array(num * 2);
            const indices = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
            buildPlane(vertices, normal, uv, indices, width, height, depth, wSegs, hSegs, 0, 1, 2, 1, -1, i, ii);
            sidesData.push({
                orientation: CUBE_SIDE_FRONT,
                vertices,
                normal,
                uv,
                indices,
            });
        }
        return sidesData;
    }

    // @ts-nocheck
    // Handle Simple 90 Degree Rotations without the use of Quat,Trig,Matrices
    class VRot90 {
        // #region SINGLE AXIS ROTATION
        static xp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = x;
            o[1] = -z;
            o[2] = y;
            return o;
        } // x-zy rot x+90
        static xn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = x;
            o[1] = z;
            o[2] = -y;
            return o;
        } // xz-y rot x-90
        static yp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -z;
            o[1] = y;
            o[2] = x;
            return o;
        } // -zyx rot y+90
        static yn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = z;
            o[1] = y;
            o[2] = -x;
            return o;
        } // zy-x rot y-90
        static zp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = y;
            o[1] = -x;
            o[2] = z;
            return o;
        } // y-xz rot z+90
        static zn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -y;
            o[1] = x;
            o[2] = z;
            return o;
        } // -yxz rot z-90
        // #endregion
        // #region COMBINATIONS
        static xp_yn(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -y;
            o[1] = -z;
            o[2] = x;
            return o;
        } // -y-zx rot x+90, y-90
        static xp_yp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = y;
            o[1] = -z;
            o[2] = -x;
            return o;
        } // y-z-x rot x+90, y+90
        static xp_yp_yp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = -x;
            o[1] = -z;
            o[2] = -y;
            return o;
        } // -x-z-y rot x+90, y+90, y+90
        static xp_xp(v, o) {
            const x = v[0], y = v[1], z = v[2];
            o[0] = x;
            o[1] = -y;
            o[2] = -z;
            return o;
        } // x-y-z rot x+90, x+90
    }
    const createRoundedBox = ({ width = 1, height = 1, depth = 1, radius = 0.5, div = 4, }) => {
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const panel = edge_grid$1(width, height, depth, radius, div); // Creates the Geo of just the Top Plane of the
        const geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // TODO, Knowing the Plane's Vert Count, It would be better to pre-allocate all the space
        // in TypedArrays then fill in all the data. Using Javascript arrays makes things simple
        // for programming but isn't as efficent.
        // Rotate and Merge the Panel Data into one Geo to form a Rounded Quad
        geo_rot_merge$1(geo, panel, (v, o) => {
            o[0] = v[0];
            o[1] = v[1];
            o[2] = v[2];
            return o;
        }); // Top - No Rotation, Kind of a Waste
        geo_rot_merge$1(geo, panel, VRot90.xp); // Front
        geo_rot_merge$1(geo, panel, VRot90.xp_yp); // Left
        geo_rot_merge$1(geo, panel, VRot90.xp_yp_yp); // Back
        geo_rot_merge$1(geo, panel, VRot90.xp_yn); // Right
        geo_rot_merge$1(geo, panel, VRot90.xp_xp); // Bottom
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return {
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        };
    };
    // Generate a Plane where all its vertices are focus onto the corners
    // Then those corners are sphere-ified to create rounded corners on the plane
    function edge_grid$1(width = 2, height = 2, depth = 2, radius = 0.5, div = 4) {
        const mx = width / 2, my = height / 2, mz = depth / 2, len = div * 2;
        const verts = [];
        const uv = [];
        const norm = [];
        const v = create$1$1();
        let bit, j, i, t, s, x, y, z;
        y = my;
        // Use corners kinda like Marching Squares
        const corners = [
            fromValues(radius - mx, my - radius, radius - mz),
            fromValues(mx - radius, my - radius, radius - mz),
            fromValues(radius - mx, my - radius, mz - radius),
            fromValues(mx - radius, my - radius, mz - radius),
        ];
        const row = (z, zbit) => {
            let t, bit;
            const uv_z = normalizeNumber(-mz, mz, z); // Map Z and Normalize the Value
            for (i = 0; i <= len; i++) {
                bit = i <= div ? 0 : 1;
                t = triangleWave(i / div); // 0 > 1 > 0
                s = i <= div ? -1 : 1; // Sign
                x = mx * s + radius * t * -s; // Flip Signs based if i <= div
                set$1(v, x, y, z);
                sub(v, v, corners[bit | zbit]);
                normalize(v, v);
                norm.push(v[0], v[1], v[2]); // Save it
                scale$2(v, v, radius);
                add(v, v, corners[bit | zbit]);
                verts.push(v[0], v[1], v[2]); // Save Vert
                uv.push(normalizeNumber(-mx, mx, x), uv_z);
                //App.Debug.pnt( v );
                // Start the mirror side when done with the first side
                if (t == 1) {
                    set$1(v, mx - radius, y, z);
                    sub(v, v, corners[1 | zbit]);
                    normalize(v, v);
                    norm.push(v[0], v[1], v[2]);
                    scale$2(v, v, radius);
                    add(v, v, corners[1 | zbit]);
                    verts.push(v[0], v[1], v[2]);
                    uv.push(normalizeNumber(-mx, mx, mx - radius), uv_z);
                    // App.Debug.pnt( v );
                }
            }
        };
        for (j = 0; j <= len; j++) {
            // Compute Z Position
            bit = j <= div ? 0 : 2;
            t = triangleWave(j / div); // 0 > 1 > 0
            s = j <= div ? -1 : 1; // Sign
            z = mz * s + radius * t * -s; // Flip Signs based if i <= div
            row(z, bit); // Draw Row
            if (t == 1)
                row(mz - radius, 2); // Start Mirror Side
        }
        return { verts, uv, norm, indices: grid_tri_idx$1(len + 1, len + 1) };
    }
    // Rotate Vertices/Normals, then Merge All the Vertex Attributes into One Geo
    function geo_rot_merge$1(geo, obj, fn_rot) {
        const offset = geo.verts.length / 3;
        const len = obj.verts.length;
        const v = create$1$1(), o = create$1$1();
        for (let i = 0; i < len; i += 3) {
            // Rotate Vertices
            set$1(v, obj.verts[i], obj.verts[i + 1], obj.verts[i + 2]);
            fn_rot(v, o);
            geo.verts.push(o[0], o[1], o[2]);
            // Rotate Normal
            set$1(v, obj.norm[i], obj.norm[i + 1], obj.norm[i + 2]);
            fn_rot(v, o);
            geo.norm.push(o[0], o[1], o[2]);
        }
        for (const v of obj.uv) {
            geo.uv.push(v);
        }
        for (const v of obj.indices) {
            geo.indices.push(offset + v);
        }
    }
    // Generate Indices for a Grid Mesh
    function grid_tri_idx$1(x_cells, y_cells) {
        let ary = [], col_cnt = x_cells + 1, x, y, a, b, c, d;
        for (y = 0; y < y_cells; y++) {
            for (x = 0; x < x_cells; x++) {
                a = y * col_cnt + x;
                b = a + col_cnt;
                c = b + 1;
                d = a + 1;
                ary.push(a, b, c, c, d, a);
            }
        }
        return ary;
    }

    // @ts-nocheck
    const createRoundedBoxSeparateFace = ({ width = 1, height = 1, depth = 1, radius = 0.5, div = 4, }) => {
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const panel = edge_grid(width, height, depth, radius, div); // Create
        const sidesData = [];
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // TODO, Knowing the Plane's Vert Count, It would be better to pre-allocate all the space
        // in TypedArrays then fill in all the data. Using Javascript arrays makes things simple
        // for programming but isn't as efficent.
        // Rotate and Merge the Panel Data into one Geo to form a Rounded Quad
        let geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge(geo, panel, (v, o) => {
            o[0] = v[0];
            o[1] = v[1];
            o[2] = v[2];
            return o;
        }); // Top - No Rotation, Kind of a Waste
        sidesData.push({
            orientation: 'top',
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge(geo, panel, VRot90.xp); // Front
        sidesData.push({
            orientation: CUBE_SIDE_FRONT,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge(geo, panel, VRot90.xp_yp); // Left
        sidesData.push({
            orientation: CUBE_SIDE_LEFT,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge(geo, panel, VRot90.xp_yp_yp); // Back
        sidesData.push({
            orientation: CUBE_SIDE_BACK,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge(geo, panel, VRot90.xp_yn); // Right
        sidesData.push({
            orientation: CUBE_SIDE_RIGHT,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        geo = {
            verts: [],
            indices: [],
            uv: [],
            norm: [],
        };
        geo_rot_merge(geo, panel, VRot90.xp_xp); // Bottom
        sidesData.push({
            orientation: CUBE_SIDE_BOTTOM,
            vertices: new Float32Array(geo.verts),
            normal: new Float32Array(geo.norm),
            uv: new Float32Array(geo.uv),
            indices: new Uint16Array(geo.indices),
        });
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return sidesData;
    };
    // Generate a Plane where all its vertices are focus onto the corners
    // Then those corners are sphere-ified to create rounded corners on the plane
    function edge_grid(width = 2, height = 2, depth = 2, radius = 0.5, div = 4) {
        const mx = width / 2, my = height / 2, mz = depth / 2, len = div * 2;
        const verts = [];
        const uv = [];
        const norm = [];
        const v = create$1$1();
        let bit, j, i, t, s, x, y, z;
        y = my;
        // Use corners kinda like Marching Squares
        const corners = [
            fromValues(radius - mx, my - radius, radius - mz),
            fromValues(mx - radius, my - radius, radius - mz),
            fromValues(radius - mx, my - radius, mz - radius),
            fromValues(mx - radius, my - radius, mz - radius),
        ];
        const row = (z, zbit) => {
            let t, bit;
            const uv_z = normalizeNumber(-mz, mz, z); // Map Z and Normalize the Value
            for (i = 0; i <= len; i++) {
                bit = i <= div ? 0 : 1;
                t = triangleWave(i / div); // 0 > 1 > 0
                s = i <= div ? -1 : 1; // Sign
                x = mx * s + radius * t * -s; // Flip Signs based if i <= div
                set$1(v, x, y, z);
                sub(v, v, corners[bit | zbit]);
                normalize(v, v);
                norm.push(v[0], v[1], v[2]); // Save it
                scale$2(v, v, radius);
                add(v, v, corners[bit | zbit]);
                verts.push(v[0], v[1], v[2]); // Save Vert
                uv.push(normalizeNumber(-mx, mx, x), uv_z);
                //App.Debug.pnt( v );
                // Start the mirror side when done with the first side
                if (t == 1) {
                    set$1(v, mx - radius, y, z);
                    sub(v, v, corners[1 | zbit]);
                    normalize(v, v);
                    norm.push(v[0], v[1], v[2]);
                    scale$2(v, v, radius);
                    add(v, v, corners[1 | zbit]);
                    verts.push(v[0], v[1], v[2]);
                    uv.push(normalizeNumber(-mx, mx, mx - radius), uv_z);
                    // App.Debug.pnt( v );
                }
            }
        };
        for (j = 0; j <= len; j++) {
            // Compute Z Position
            bit = j <= div ? 0 : 2;
            t = triangleWave(j / div); // 0 > 1 > 0
            s = j <= div ? -1 : 1; // Sign
            z = mz * s + radius * t * -s; // Flip Signs based if i <= div
            row(z, bit); // Draw Row
            if (t == 1)
                row(mz - radius, 2); // Start Mirror Side
        }
        return { verts, uv, norm, indices: grid_tri_idx(len + 1, len + 1) };
    }
    // Rotate Vertices/Normals, then Merge All the Vertex Attributes into One Geo
    function geo_rot_merge(geo, obj, fn_rot) {
        const offset = geo.verts.length / 3;
        const len = obj.verts.length;
        const v = create$1$1(), o = create$1$1();
        for (let i = 0; i < len; i += 3) {
            // Rotate Vertices
            set$1(v, obj.verts[i], obj.verts[i + 1], obj.verts[i + 2]);
            fn_rot(v, o);
            geo.verts.push(o[0], o[1], o[2]);
            // Rotate Normal
            set$1(v, obj.norm[i], obj.norm[i + 1], obj.norm[i + 2]);
            fn_rot(v, o);
            geo.norm.push(o[0], o[1], o[2]);
        }
        for (const v of obj.uv) {
            geo.uv.push(v);
        }
        for (const v of obj.indices) {
            geo.indices.push(offset + v);
        }
    }
    // Generate Indices for a Grid Mesh
    function grid_tri_idx(x_cells, y_cells) {
        let ary = [], col_cnt = x_cells + 1, x, y, a, b, c, d;
        for (y = 0; y < y_cells; y++) {
            for (x = 0; x < x_cells; x++) {
                a = y * col_cnt + x;
                b = a + col_cnt;
                c = b + 1;
                d = a + 1;
                ary.push(a, b, c, c, d, a);
            }
        }
        return ary;
    }

    /**
     * @description Generate circle geometry
     * @param {Circle} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createCircle(params = {}) {
        const { radius = 1, segments = 8, thetaStart = 0, thetaLength = Math.PI * 2, } = params;
        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];
        // helper variables
        const vertex = create$1$1();
        const uv = create$3();
        // center point
        vertices.push(0, 0, 0);
        normals.push(0, 0, 1);
        uvs.push(0.5, 0.5);
        for (let s = 0, i = 3; s <= segments; s++, i += 3) {
            const segment = thetaStart + s / segments * thetaLength;
            // vertex
            vertex[0] = radius * Math.cos(segment);
            vertex[1] = radius * Math.sin(segment);
            vertices.push(...vertex);
            // normal
            normals.push(0, 0, 1);
            // uvs
            uv[0] = (vertices[i] / radius + 1) / 2;
            uv[1] = (vertices[i + 1] / radius + 1) / 2;
            uvs.push(uv[0], uv[1]);
        }
        // indices
        for (let i = 1; i <= segments; i++) {
            indices.push(i, i + 1, 0);
        }
        return {
            indices: segments > 65536 ? new Uint32Array(indices) : new Uint16Array(indices),
            vertices: new Float32Array(vertices),
            normal: new Float32Array(normals),
            uv: new Float32Array(uvs),
        };
    }

    /**
     * Generates geometry data for a quad
     * @param {PlaneInterface} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createPlane(params = {}) {
        const { width = 1, height = 1, widthSegments = 1, heightSegments = 1, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        // Determine length of arrays
        const num = (wSegs + 1) * (hSegs + 1);
        const numIndices = wSegs * hSegs * 6;
        // Generate empty arrays once
        const position = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
        buildPlane(position, normal, uv, index, width, height, 0, wSegs, hSegs);
        return {
            vertices: position,
            normal,
            uv,
            indices: index,
        };
    }

    /**
     * Generates geometry data for a sphere
     * @param {Sphere} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createSphere(params = {}) {
        const { radius = 0.5, widthSegments = 16, heightSegments = Math.ceil(widthSegments * 0.5), phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI, } = params;
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const pStart = phiStart;
        const pLength = phiLength;
        const tStart = thetaStart;
        const tLength = thetaLength;
        const num = (wSegs + 1) * (hSegs + 1);
        const numIndices = wSegs * hSegs * 6;
        const position = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);
        let i = 0;
        let iv = 0;
        let ii = 0;
        const te = tStart + tLength;
        const grid = [];
        const n = create$1$1();
        for (let iy = 0; iy <= hSegs; iy++) {
            const vRow = [];
            const v = iy / hSegs;
            for (let ix = 0; ix <= wSegs; ix++, i++) {
                const u = ix / wSegs;
                const x = -radius *
                    Math.cos(pStart + u * pLength) *
                    Math.sin(tStart + v * tLength);
                const y = radius * Math.cos(tStart + v * tLength);
                const z = radius * Math.sin(pStart + u * pLength) * Math.sin(tStart + v * tLength);
                position[i * 3] = x;
                position[i * 3 + 1] = y;
                position[i * 3 + 2] = z;
                set$1(n, x, y, z);
                normalize(n, n);
                normal[i * 3] = n[0];
                normal[i * 3 + 1] = n[1];
                normal[i * 3 + 2] = n[2];
                uv[i * 2] = u;
                uv[i * 2 + 1] = 1 - v;
                vRow.push(iv++);
            }
            grid.push(vRow);
        }
        for (let iy = 0; iy < hSegs; iy++) {
            for (let ix = 0; ix < wSegs; ix++) {
                const a = grid[iy][ix + 1];
                const b = grid[iy][ix];
                const c = grid[iy + 1][ix];
                const d = grid[iy + 1][ix + 1];
                if (iy !== 0 || tStart > 0) {
                    index[ii * 3] = a;
                    index[ii * 3 + 1] = b;
                    index[ii * 3 + 2] = d;
                    ii++;
                }
                if (iy !== hSegs - 1 || te < Math.PI) {
                    index[ii * 3] = b;
                    index[ii * 3 + 1] = c;
                    index[ii * 3 + 2] = d;
                    ii++;
                }
            }
        }
        return {
            vertices: position,
            normal,
            uv,
            indices: index,
        };
    }

    /**
     * @description Generate torus geometry
     * @param {Torus} params
     * @returns {{ vertices, normal, uv, indices }}
     */
    function createTorus(params = {}) {
        const { radius = 0.5, tube = 0.35, arc = Math.PI * 2, radialSegments: inputRadialSegments = 8, tubularSegments: inputTubularSegments = 6, } = params;
        const radialSegments = Math.floor(inputRadialSegments);
        const tubularSegments = Math.floor(inputTubularSegments);
        const indices = [];
        const vertices = [];
        const normals = [];
        const uvs = [];
        const center = create$1$1();
        const vertex = create$1$1();
        const normal = create$1$1();
        for (let j = 0; j <= radialSegments; j++) {
            for (let i = 0; i <= tubularSegments; i++) {
                const u = (i / tubularSegments) * arc;
                const v = (j / radialSegments) * Math.PI * 2;
                // vertex
                vertex[0] = (radius + tube * Math.cos(v)) * Math.cos(u);
                vertex[1] = (radius + tube * Math.cos(v)) * Math.sin(u);
                vertex[2] = tube * Math.sin(v);
                vertices.push(vertex[0], vertex[1], vertex[2]);
                // normal
                center[0] = radius * Math.cos(u);
                center[1] = radius * Math.sin(u);
                sub(normal, vertex, center);
                normalize(normal, normal);
                normals.push(normal[0], normal[1], normal[0]);
                // uv
                uvs.push(i / tubularSegments, j / radialSegments);
            }
        }
        // generate indices
        for (let j = 1; j <= radialSegments; j++) {
            for (let i = 1; i <= tubularSegments; i++) {
                // indices
                const a = (tubularSegments + 1) * j + i - 1;
                const b = (tubularSegments + 1) * (j - 1) + i - 1;
                const c = (tubularSegments + 1) * (j - 1) + i;
                const d = (tubularSegments + 1) * j + i;
                // faces
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
        const num = (radialSegments + 1) * (tubularSegments + 1);
        return {
            indices: num > 65536 ? new Uint32Array(indices) : new Uint16Array(indices),
            vertices: new Float32Array(vertices),
            normal: new Float32Array(normals),
            uv: new Float32Array(uvs),
        };
    }

    /**
     * @namespace GeometryUtils
     */
    const GeometryUtils = {
        createBox,
        createBoxSeparateFace,
        createRoundedBoxSeparateFace,
        createRoundedBox,
        createCircle,
        createPlane,
        createSphere,
        createTorus,
    };

    var index = /*#__PURE__*/Object.freeze({
      __proto__: null,
      createBox: createBox,
      createBoxSeparateFace: createBoxSeparateFace,
      createRoundedBoxSeparateFace: createRoundedBoxSeparateFace,
      createRoundedBox: createRoundedBox,
      createCircle: createCircle,
      createPlane: createPlane,
      createSphere: createSphere,
      createTorus: createTorus,
      GeometryUtils: GeometryUtils
    });

    /**
     * Common utilities
     * @module glMatrix
     */
    var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
    if (!Math.hypot) Math.hypot = function () {
      var y = 0,
          i = arguments.length;

      while (i--) {
        y += arguments[i] * arguments[i];
      }

      return Math.sqrt(y);
    };

    /**
     * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
     * @module mat4
     */

    /**
     * Creates a new identity mat4
     *
     * @returns {mat4} a new 4x4 matrix
     */

    function create$1() {
      var out = new ARRAY_TYPE(16);

      if (ARRAY_TYPE != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
      }

      out[0] = 1;
      out[5] = 1;
      out[10] = 1;
      out[15] = 1;
      return out;
    }
    /**
     * Set a mat4 to the identity matrix
     *
     * @param {mat4} out the receiving matrix
     * @returns {mat4} out
     */

    function identity(out) {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    }
    /**
     * Transpose the values of a mat4
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the source matrix
     * @returns {mat4} out
     */

    function transpose(out, a) {
      // If we are transposing ourselves we can skip a few steps but have to cache some values
      if (out === a) {
        var a01 = a[1],
            a02 = a[2],
            a03 = a[3];
        var a12 = a[6],
            a13 = a[7];
        var a23 = a[11];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
      } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
      }

      return out;
    }
    /**
     * Inverts a mat4
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the source matrix
     * @returns {mat4} out
     */

    function invert(out, a) {
      var a00 = a[0],
          a01 = a[1],
          a02 = a[2],
          a03 = a[3];
      var a10 = a[4],
          a11 = a[5],
          a12 = a[6],
          a13 = a[7];
      var a20 = a[8],
          a21 = a[9],
          a22 = a[10],
          a23 = a[11];
      var a30 = a[12],
          a31 = a[13],
          a32 = a[14],
          a33 = a[15];
      var b00 = a00 * a11 - a01 * a10;
      var b01 = a00 * a12 - a02 * a10;
      var b02 = a00 * a13 - a03 * a10;
      var b03 = a01 * a12 - a02 * a11;
      var b04 = a01 * a13 - a03 * a11;
      var b05 = a02 * a13 - a03 * a12;
      var b06 = a20 * a31 - a21 * a30;
      var b07 = a20 * a32 - a22 * a30;
      var b08 = a20 * a33 - a23 * a30;
      var b09 = a21 * a32 - a22 * a31;
      var b10 = a21 * a33 - a23 * a31;
      var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

      var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

      if (!det) {
        return null;
      }

      det = 1.0 / det;
      out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
      out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
      out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
      out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
      out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
      out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
      out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
      out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
      out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
      return out;
    }
    /**
     * Translate a mat4 by the given vector
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to translate
     * @param {ReadonlyVec3} v vector to translate by
     * @returns {mat4} out
     */

    function translate(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      var a00, a01, a02, a03;
      var a10, a11, a12, a13;
      var a20, a21, a22, a23;

      if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
      } else {
        a00 = a[0];
        a01 = a[1];
        a02 = a[2];
        a03 = a[3];
        a10 = a[4];
        a11 = a[5];
        a12 = a[6];
        a13 = a[7];
        a20 = a[8];
        a21 = a[9];
        a22 = a[10];
        a23 = a[11];
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;
        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
      }

      return out;
    }
    /**
     * Scales the mat4 by the dimensions in the given vec3 not using vectorization
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to scale
     * @param {ReadonlyVec3} v the vec3 to scale the matrix by
     * @returns {mat4} out
     **/

    function scale(out, a, v) {
      var x = v[0],
          y = v[1],
          z = v[2];
      out[0] = a[0] * x;
      out[1] = a[1] * x;
      out[2] = a[2] * x;
      out[3] = a[3] * x;
      out[4] = a[4] * y;
      out[5] = a[5] * y;
      out[6] = a[6] * y;
      out[7] = a[7] * y;
      out[8] = a[8] * z;
      out[9] = a[9] * z;
      out[10] = a[10] * z;
      out[11] = a[11] * z;
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the X axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateX(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a10 = a[4];
      var a11 = a[5];
      var a12 = a[6];
      var a13 = a[7];
      var a20 = a[8];
      var a21 = a[9];
      var a22 = a[10];
      var a23 = a[11];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[4] = a10 * c + a20 * s;
      out[5] = a11 * c + a21 * s;
      out[6] = a12 * c + a22 * s;
      out[7] = a13 * c + a23 * s;
      out[8] = a20 * c - a10 * s;
      out[9] = a21 * c - a11 * s;
      out[10] = a22 * c - a12 * s;
      out[11] = a23 * c - a13 * s;
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the Y axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateY(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a00 = a[0];
      var a01 = a[1];
      var a02 = a[2];
      var a03 = a[3];
      var a20 = a[8];
      var a21 = a[9];
      var a22 = a[10];
      var a23 = a[11];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged rows
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[0] = a00 * c - a20 * s;
      out[1] = a01 * c - a21 * s;
      out[2] = a02 * c - a22 * s;
      out[3] = a03 * c - a23 * s;
      out[8] = a00 * s + a20 * c;
      out[9] = a01 * s + a21 * c;
      out[10] = a02 * s + a22 * c;
      out[11] = a03 * s + a23 * c;
      return out;
    }
    /**
     * Rotates a matrix by the given angle around the Z axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @returns {mat4} out
     */

    function rotateZ(out, a, rad) {
      var s = Math.sin(rad);
      var c = Math.cos(rad);
      var a00 = a[0];
      var a01 = a[1];
      var a02 = a[2];
      var a03 = a[3];
      var a10 = a[4];
      var a11 = a[5];
      var a12 = a[6];
      var a13 = a[7];

      if (a !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      } // Perform axis-specific matrix multiplication


      out[0] = a00 * c + a10 * s;
      out[1] = a01 * c + a11 * s;
      out[2] = a02 * c + a12 * s;
      out[3] = a03 * c + a13 * s;
      out[4] = a10 * c - a00 * s;
      out[5] = a11 * c - a01 * s;
      out[6] = a12 * c - a02 * s;
      out[7] = a13 * c - a03 * s;
      return out;
    }

    /**
     * 3 Dimensional Vector
     * @module vec3
     */

    /**
     * Creates a new, empty vec3
     *
     * @returns {vec3} a new 3D vector
     */

    function create() {
      var out = new ARRAY_TYPE(3);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
      }

      return out;
    }
    /**
     * Set the components of a vec3 to the given values
     *
     * @param {vec3} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} out
     */

    function set(out, x, y, z) {
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }
    /**
     * Perform some operation over an array of vec3s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    (function () {
      var vec = create();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 3;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];
          vec[1] = a[i + 1];
          vec[2] = a[i + 2];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
          a[i + 2] = vec[2];
        }

        return a;
      };
    })();

    const instanceMoveVector = create();
    const instanceModelMatrix = create$1();
    const normalMatrix = create$1();
    const generateInstanceMatrices = (count, onItemCallback) => {
        const instanceModelMatrixData = new Float32Array(count * 16);
        const instanceNormalMatrixData = new Float32Array(count * 16);
        for (let i = 0; i < count * 16; i += 16) {
            const { randX, randY, randZ, randRotX, randRotY, randRotZ, randScaleX, randScaleY, randScaleZ, } = onItemCallback(i);
            identity(instanceModelMatrix);
            set(instanceMoveVector, randX, randY, randZ);
            translate(instanceModelMatrix, instanceModelMatrix, instanceMoveVector);
            rotateX(instanceModelMatrix, instanceModelMatrix, randRotX);
            rotateY(instanceModelMatrix, instanceModelMatrix, randRotY);
            rotateZ(instanceModelMatrix, instanceModelMatrix, randRotZ);
            set(instanceMoveVector, randScaleX, randScaleY, randScaleZ);
            scale(instanceModelMatrix, instanceModelMatrix, instanceMoveVector);
            invert(normalMatrix, instanceModelMatrix);
            transpose(normalMatrix, normalMatrix);
            for (let n = 0; n < 16; n++) {
                instanceModelMatrixData[i + n] = instanceModelMatrix[n];
                instanceNormalMatrixData[i + n] = normalMatrix[n];
            }
        }
        return {
            instanceModelMatrixData,
            instanceNormalMatrixData,
        };
    };
    const generateGPUBuffersFromGeometry = (device, geometry) => {
        const { vertices, uv, normal, indices } = geometry;
        const verticesBuffer = device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(verticesBuffer.getMappedRange()).set(vertices);
        verticesBuffer.unmap();
        const uvsBuffer = device.createBuffer({
            size: uv.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(uvsBuffer.getMappedRange()).set(uv);
        uvsBuffer.unmap();
        const normalsBuffer = device.createBuffer({
            size: normal.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(normalsBuffer.getMappedRange()).set(normal);
        normalsBuffer.unmap();
        const indexBuffer = device.createBuffer({
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        if (indices instanceof Uint16Array) {
            new Uint16Array(indexBuffer.getMappedRange()).set(indices);
        }
        else {
            new Uint32Array(indexBuffer.getMappedRange()).set(indices);
        }
        indexBuffer.unmap();
        return {
            verticesBuffer,
            normalsBuffer,
            uvsBuffer,
            indexBuffer,
            indices,
        };
    };

    const testForWebGPUSupport = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const adapter = yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
        const errorHTMLFragment = `
    <div id="no-webgpu-wrapper">
      <div id="no-webgpu">
        WebGPU is not supported on this browser. Please try modern Google Chrome (Canary) or Firefox Nightly.
      </div>
    </div>
  `;
        window.addEventListener('unhandledrejection', (e) => {
            document.body.innerHTML += errorHTMLFragment;
        });
        window.addEventListener('error', (e) => {
            document.body.innerHTML += errorHTMLFragment;
        });
        if (!adapter) {
            document.body.innerHTML += errorHTMLFragment;
        }
    });

    var INSTANCED_MESH_VERTEX_SHADER = "\n[[block]]\nstruct Camera {\n  projectionMatrix: mat4x4<f32>;\n  viewMatrix: mat4x4<f32>;\n};\n\n[[group(0), binding(0)]]\nvar<uniform> camera: Camera;\n\nstruct Input {\n  [[location(0)]] position: vec4<f32>;\n  [[location(1)]] normal: vec3<f32>;\n\n  [[location(2)]] instanceModelMatrix0: vec4<f32>;\n  [[location(3)]] instanceModelMatrix1: vec4<f32>;\n  [[location(4)]] instanceModelMatrix2: vec4<f32>;\n  [[location(5)]] instanceModelMatrix3: vec4<f32>;\n\n  [[location(6)]] instanceNormalMatrix0: vec4<f32>;\n  [[location(7)]] instanceNormalMatrix1: vec4<f32>;\n  [[location(8)]] instanceNormalMatrix2: vec4<f32>;\n  [[location(9)]] instanceNormalMatrix3: vec4<f32>;\n};\n\nstruct Output {\n  [[builtin(position)]] Position: vec4<f32>;\n  [[location(0)]] normal: vec4<f32>;\n  [[location(1)]] pos: vec4<f32>;\n};\n\n[[stage(vertex)]]\nfn main (input: Input) -> Output {\n  var output: Output;\n\n  let instanceModelMatrix: mat4x4<f32> = mat4x4<f32>(\n    input.instanceModelMatrix0,\n    input.instanceModelMatrix1,\n    input.instanceModelMatrix2,\n    input.instanceModelMatrix3\n  );\n\n  let instanceModelInverseTransposeMatrix: mat4x4<f32> = mat4x4<f32>(\n    input.instanceNormalMatrix0,\n    input.instanceNormalMatrix1,\n    input.instanceNormalMatrix2,\n    input.instanceNormalMatrix3\n  );\n\n  let worldPosition: vec4<f32> = instanceModelMatrix * input.position;\n\n  output.Position = camera.projectionMatrix *\n                    camera.viewMatrix *\n                    worldPosition;\n                    \n  output.normal = instanceModelInverseTransposeMatrix * vec4<f32>(input.normal, 0.0);\n  output.pos = worldPosition;\n\n  return output;\n}\n"; // eslint-disable-line

    var INSTANCED_MESH_FRAGMENT_SHADER = "\n[[block]]\nstruct Lighting {\n  position: vec3<f32>;\n};\n\n[[group(1), binding(0)]]\nvar <uniform> lighting: Lighting;\n\n[[block]]\nstruct Material {\n  baseColor: vec3<f32>;\n};\n\n[[group(2), binding(0)]]\nvar <uniform> material: Material;\n\nstruct Input {\n  [[location(0)]] normal: vec4<f32>;\n  [[location(1)]] pos: vec4<f32>;\n};\n\n[[stage(fragment)]]\n\nfn main (input: Input) -> [[location(0)]] vec4<f32> {\n  let normal: vec3<f32> = normalize(input.normal.rgb);\n  let lightColor: vec3<f32> = vec3<f32>(1.0);\n\n  // ambient light\n  let ambientFactor: f32 = 0.1;\n  let ambientLight: vec3<f32> = lightColor * ambientFactor;\n\n  // diffuse light\n  let lightDirection: vec3<f32> = normalize(lighting.position - input.pos.rgb);\n  let diffuseStrength: f32 = max(dot(normal, lightDirection), 0.0);\n  let diffuseLight: vec3<f32> = lightColor * diffuseStrength;\n\n  // combine lighting\n  let finalLight: vec3<f32> = diffuseLight + ambientLight;\n\n  return vec4<f32>(material.baseColor * finalLight, 1.0);\n}\n"; // eslint-disable-line

    var QUAD_VERTEX_SHADER = "\n[[block]]\nstruct Camera {\n  projectionMatrix: mat4x4<f32>;\n  viewMatrix: mat4x4<f32>;\n};\n\n[[group(0), binding(0)]]\nvar<uniform> camera: Camera;\n\n[[block]]\nstruct Transform {\n  modelMatrix: mat4x4<f32>;\n};\n\n[[group(1), binding(0)]]\nvar<uniform> transform: Transform;\n\nstruct Input {\n  [[location(0)]] position: vec4<f32>;\n  [[location(1)]] uv: vec2<f32>;\n};\n\nstruct Output {\n  [[builtin(position)]] Position: vec4<f32>;\n  [[location(0)]] uv: vec2<f32>;\n};\n\n[[stage(vertex)]]\nfn main (input: Input) -> Output {\n  var output: Output;\n\n  output.Position = camera.projectionMatrix *\n                    camera.viewMatrix *\n                    transform.modelMatrix *\n                    input.position;\n                    \n  output.uv = input.uv;\n\n  return output;\n}\n"; // eslint-disable-line

    var QUAD_FRAGMENT_SHADER = "\nstruct Input {\n  [[location(0)]] uv: vec2<f32>;\n};\n\n[[group(2), binding(0)]] var mySampler: sampler;\n[[group(2), binding(1)]] var postFX0Texture: texture_2d<f32>;\n[[group(2), binding(2)]] var postFX1Texture: texture_2d<f32>;\n[[group(2), binding(3)]] var cutOffTexture: texture_2d<f32>;\n\n[[block]]\nstruct Tween {\n  factor: f32;\n};\n\n[[group(3), binding(0)]]\nvar <uniform> tween: Tween;\n\n[[stage(fragment)]]\n\nfn main (input: Input) -> [[location(0)]] vec4<f32> {\n  let result0: vec4<f32> = textureSample(postFX0Texture, mySampler, input.uv);\n  let result1: vec4<f32> = textureSample(postFX1Texture, mySampler, input.uv);\n\n  let cutoffResult: vec4<f32> = textureSample(cutOffTexture, mySampler, input.uv);\n\n  let mixFactor: f32 = step(tween.factor * 1.05, cutoffResult.r);\n\n  return mix(result0, result1, mixFactor);\n}\n"; // eslint-disable-line

    const INSTANCES_COUNT = 500;
    const WORLD_SIZE_X = 20;
    const WORLD_SIZE_Y = 20;
    const WORLD_SIZE_Z = 20;
    const gui = new GUI$1();
    const OPTIONS = {
        animatable: true,
        tweenFactor: 0,
    };
    gui.add(OPTIONS, 'animatable');
    gui.add(OPTIONS, 'tweenFactor').min(0).max(1).step(0.01).listen();
    let oldTime = 0;
    function getRandPositionScaleRotation(scaleUniformly = true) {
        const randX = (Math.random() * 2 - 1) * WORLD_SIZE_X;
        const randY = (Math.random() * 2 - 1) * WORLD_SIZE_Y;
        const randZ = (Math.random() * 2 - 1) * WORLD_SIZE_Z;
        const randRotX = Math.random() * Math.PI * 2;
        const randRotY = Math.random() * Math.PI * 2;
        const randRotZ = Math.random() * Math.PI * 2;
        const randScaleX = Math.random() + 0.25;
        const randScaleY = scaleUniformly ? randScaleX : Math.random() + 0.25;
        const randScaleZ = scaleUniformly ? randScaleX : Math.random() + 0.25;
        return {
            randX,
            randY,
            randZ,
            randRotX,
            randRotY,
            randRotZ,
            randScaleX,
            randScaleY,
            randScaleZ,
        };
    }
    testForWebGPUSupport();
    (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const canvas = document.getElementById('gpu-c');
        canvas.width = innerWidth * devicePixelRatio;
        canvas.height = innerHeight * devicePixelRatio;
        canvas.style.setProperty('width', `${innerWidth}px`);
        canvas.style.setProperty('height', `${innerHeight}px`);
        const adapter = yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
        const device = yield (adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice());
        const context = canvas.getContext('webgpu');
        const presentationFormat = context.getPreferredFormat(adapter);
        const presentationSize = [canvas.width, canvas.height];
        const primitiveType = 'triangle-list';
        context.configure({
            device,
            format: presentationFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
            size: presentationSize,
        });
        // Set up cameras for the demo
        const perspCamera = new PerspectiveCamera((45 * Math.PI) / 180, canvas.width / canvas.height, 0.1, 100);
        const orthoCamera = new OrthographicCamera(-canvas.width / 2, canvas.width / 2, canvas.height / 2, -canvas.height / 2, 0.1, 3);
        orthoCamera.setPosition({
            x: 0,
            y: 0,
            z: 2,
        });
        orthoCamera.lookAt([0, 0, 0]);
        orthoCamera.updateProjectionMatrix();
        orthoCamera.updateViewMatrix();
        //
        // Prepare geometries
        //
        // Prepare fullscreen quad gpu buffers
        const { verticesBuffer: quadVertexBuffer, uvsBuffer: quadUvBuffer, indexBuffer: quadIndexBuffer, indices: quadIndices, } = generateGPUBuffersFromGeometry(device, index.createPlane({
            width: innerWidth,
            height: innerHeight,
        }));
        // Prepare cube gpu buffers
        const { verticesBuffer: cubeVertexBuffer, normalsBuffer: cubeNormalBuffer, indexBuffer: cubeIndexBuffer, indices: cubeIndices, } = generateGPUBuffersFromGeometry(device, index.createBox());
        // Prepare instanced cube model matrices as gpu buffers
        const { instanceModelMatrixData: cubeInstanceModelMatrixData, instanceNormalMatrixData: cubeInstanceNormalMatrixData, } = generateInstanceMatrices(INSTANCES_COUNT, getRandPositionScaleRotation.bind(null, false));
        const cubeInstanceModelMatrixBuffer = device.createBuffer({
            size: cubeInstanceModelMatrixData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(cubeInstanceModelMatrixBuffer.getMappedRange()).set(cubeInstanceModelMatrixData);
        cubeInstanceModelMatrixBuffer.unmap();
        const cubeInstanceNormalMatrixBuffer = device.createBuffer({
            size: cubeInstanceNormalMatrixData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(cubeInstanceNormalMatrixBuffer.getMappedRange()).set(cubeInstanceNormalMatrixData);
        cubeInstanceNormalMatrixBuffer.unmap();
        // Prepare sphere gpu buffers
        const { verticesBuffer: sphereVertexBuffer, normalsBuffer: sphereNormalBuffer, indexBuffer: sphereIndexBuffer, indices: sphereIndices, } = generateGPUBuffersFromGeometry(device, index.createSphere());
        // Prepare instanced sphere model matrices as gpu buffers
        const { instanceModelMatrixData: sphereInstanceModelMatrixData, instanceNormalMatrixData: sphereInstanceNormalMatrixData, } = generateInstanceMatrices(INSTANCES_COUNT, getRandPositionScaleRotation);
        const sphereInstanceModelMatrixBuffer = device.createBuffer({
            size: sphereInstanceModelMatrixData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(sphereInstanceModelMatrixBuffer.getMappedRange()).set(sphereInstanceModelMatrixData);
        sphereInstanceModelMatrixBuffer.unmap();
        const sphereInstanceNormalMatrixBuffer = device.createBuffer({
            size: sphereInstanceNormalMatrixData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(sphereInstanceNormalMatrixBuffer.getMappedRange()).set(sphereInstanceNormalMatrixData);
        sphereInstanceNormalMatrixBuffer.unmap();
        //
        // Set up needed render pipelines for both scenes and fullscreen quad
        //
        // Fullscreen quad pipeline
        const quadPipeline = device.createRenderPipeline({
            vertex: {
                module: device.createShaderModule({
                    code: QUAD_VERTEX_SHADER,
                }),
                entryPoint: 'main',
                buffers: [
                    // position attribute
                    {
                        arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
                        attributes: [
                            {
                                shaderLocation: 0,
                                format: 'float32x3',
                                offset: 0,
                            },
                        ],
                    },
                    // uv attribute
                    {
                        arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
                        attributes: [
                            {
                                shaderLocation: 1,
                                format: 'float32x2',
                                offset: 0,
                            },
                        ],
                    },
                ],
            },
            fragment: {
                module: device.createShaderModule({
                    code: QUAD_FRAGMENT_SHADER,
                }),
                entryPoint: 'main',
                targets: [
                    {
                        format: presentationFormat,
                    },
                ],
            },
            primitive: {
                topology: primitiveType,
                stripIndexFormat: undefined,
            },
        });
        // Instanced meshes pipeline
        const sceneMeshesPipeline = device.createRenderPipeline({
            vertex: {
                module: device.createShaderModule({
                    code: INSTANCED_MESH_VERTEX_SHADER,
                }),
                entryPoint: 'main',
                buffers: [
                    // position attribute
                    {
                        arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
                        attributes: [
                            {
                                shaderLocation: 0,
                                format: 'float32x3',
                                offset: 0,
                            },
                        ],
                    },
                    // normal attribute
                    {
                        arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
                        attributes: [
                            {
                                shaderLocation: 1,
                                format: 'float32x3',
                                offset: 0,
                            },
                        ],
                    },
                    // We need to pass the mat4x4<f32> instance world matrix as 4 vec4<f32>() components
                    // It will occupy 4 input slots
                    {
                        arrayStride: 16 * Float32Array.BYTES_PER_ELEMENT,
                        stepMode: 'instance',
                        attributes: [
                            {
                                shaderLocation: 2,
                                format: 'float32x4',
                                offset: 0,
                            },
                            {
                                shaderLocation: 3,
                                format: 'float32x4',
                                offset: 4 * Float32Array.BYTES_PER_ELEMENT,
                            },
                            {
                                shaderLocation: 4,
                                format: 'float32x4',
                                offset: 8 * Float32Array.BYTES_PER_ELEMENT,
                            },
                            {
                                shaderLocation: 5,
                                format: 'float32x4',
                                offset: 12 * Float32Array.BYTES_PER_ELEMENT,
                            },
                        ],
                    },
                    // We need to pass the mat4x4<f32> instance normal matrix as 4 vec4<f32>() components
                    // It will occupy 4 input slots
                    {
                        arrayStride: 16 * Float32Array.BYTES_PER_ELEMENT,
                        stepMode: 'instance',
                        attributes: [
                            {
                                shaderLocation: 6,
                                format: 'float32x4',
                                offset: 0,
                            },
                            {
                                shaderLocation: 7,
                                format: 'float32x4',
                                offset: 4 * Float32Array.BYTES_PER_ELEMENT,
                            },
                            {
                                shaderLocation: 8,
                                format: 'float32x4',
                                offset: 8 * Float32Array.BYTES_PER_ELEMENT,
                            },
                            {
                                shaderLocation: 9,
                                format: 'float32x4',
                                offset: 12 * Float32Array.BYTES_PER_ELEMENT,
                            },
                        ],
                    },
                ],
            },
            fragment: {
                module: device.createShaderModule({
                    code: INSTANCED_MESH_FRAGMENT_SHADER,
                }),
                entryPoint: 'main',
                targets: [
                    {
                        format: presentationFormat,
                    },
                ],
            },
            primitive: {
                topology: primitiveType,
                stripIndexFormat: undefined,
                // cullMode: 'back',
            },
            depthStencil: {
                format: 'depth24plus',
                depthWriteEnabled: true,
                depthCompare: 'less',
            },
        });
        //
        // Set up all uniform blocks needed for rendering
        //
        // Perspective camera uniform block
        const perspCameraUniformBuffer = device.createBuffer({
            size: 16 * 2 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const perspCameraUniformBindGroup = device.createBindGroup({
            layout: sceneMeshesPipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: perspCameraUniformBuffer,
                        offset: 0,
                        size: 16 * 2 * Float32Array.BYTES_PER_ELEMENT,
                    },
                },
            ],
        });
        // Orthographic camera uniform block
        const orthoCameraUniformBuffer = device.createBuffer({
            size: 16 * 2 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const orthoCameraUniformBindGroup = device.createBindGroup({
            layout: quadPipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: orthoCameraUniformBuffer,
                        offset: 0,
                        size: 16 * 2 * Float32Array.BYTES_PER_ELEMENT,
                    },
                },
            ],
        });
        // Fullscreen quad transform uniform block
        const quadTransform = new Transform();
        const quadTransformUniformBuffer = device.createBuffer({
            size: 16 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const quadTransformUniformBindGroup = device.createBindGroup({
            layout: quadPipeline.getBindGroupLayout(1),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: quadTransformUniformBuffer,
                        offset: 0,
                        size: 16 * Float32Array.BYTES_PER_ELEMENT,
                    },
                },
            ],
        });
        //
        // Set up texture and sampler needed for postprocessing
        //
        // We will copy the frame's rendering results into this texture and
        // sample it on the next frame.
        const postfx0Texture = device.createTexture({
            size: presentationSize,
            format: presentationFormat,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
        const postfx1Texture = device.createTexture({
            size: presentationSize,
            format: presentationFormat,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
        const sampler = device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });
        // Load cutoff mask transition texture
        const image = new Image();
        image.src = `${window['ASSETS_BASE_URL']}/transition2.png`;
        yield image.decode();
        const imageBitmap = yield createImageBitmap(image);
        const cutoffMaskTexture = device.createTexture({
            size: [imageBitmap.width, imageBitmap.height, 1],
            format: presentationFormat,
            usage: GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });
        device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture: cutoffMaskTexture }, [imageBitmap.width, imageBitmap.height]);
        const quadSamplerUniformBindGroup = device.createBindGroup({
            layout: quadPipeline.getBindGroupLayout(2),
            entries: [
                {
                    binding: 0,
                    resource: sampler,
                },
                {
                    binding: 1,
                    resource: postfx0Texture.createView(),
                },
                {
                    binding: 2,
                    resource: postfx1Texture.createView(),
                },
                {
                    binding: 3,
                    resource: cutoffMaskTexture.createView(),
                },
            ],
        });
        const tweenFactorUniformBuffer = device.createBuffer({
            size: Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const tweenFactor = new Float32Array([OPTIONS.tweenFactor]);
        let tweenFactorTarget = OPTIONS.tweenFactor;
        const quadTweenUniformBindGroup = device.createBindGroup({
            layout: quadPipeline.getBindGroupLayout(3),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: tweenFactorUniformBuffer,
                    },
                },
            ],
        });
        //
        // Set up instanced scenes lighting and basecolor
        //
        // Light position as a typed 32 bit array
        const lightPosition = new Float32Array([0.5, 0.5, 0.5]);
        const lightingUniformBuffer = device.createBuffer({
            size: 4 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const lightingUniformBindGroup = device.createBindGroup({
            layout: sceneMeshesPipeline.getBindGroupLayout(1),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: lightingUniformBuffer,
                        offset: 0,
                        size: 4 * Float32Array.BYTES_PER_ELEMENT,
                    },
                },
            ],
        });
        // Basecolor0
        const baseColor0UniformBuffer = device.createBuffer({
            size: 4 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const baseColor0UniformBindGroup = device.createBindGroup({
            layout: sceneMeshesPipeline.getBindGroupLayout(2),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: baseColor0UniformBuffer,
                        offset: 0,
                        size: 4 * Float32Array.BYTES_PER_ELEMENT,
                    },
                },
            ],
        });
        device.queue.writeBuffer(baseColor0UniformBuffer, 0, new Float32Array([0.3, 0.6, 0.7]));
        // Basecolor1
        const baseColor1UniformBuffer = device.createBuffer({
            size: 4 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const baseColor1UniformBindGroup = device.createBindGroup({
            layout: sceneMeshesPipeline.getBindGroupLayout(2),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: baseColor1UniformBuffer,
                        offset: 0,
                        size: 4 * Float32Array.BYTES_PER_ELEMENT,
                    },
                },
            ],
        });
        device.queue.writeBuffer(baseColor1UniformBuffer, 0, new Float32Array([1, 0.2, 0.25]));
        // Pass light position to gpu
        device.queue.writeBuffer(lightingUniformBuffer, 0, lightPosition);
        const textureDepth = device.createTexture({
            size: [canvas.width, canvas.height, 1],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        // Instanced scene render pass descriptor
        const sceneRenderPassDescriptor = {
            colorAttachments: [
                {
                    view: null,
                    loadValue: null,
                    storeOp: 'store',
                },
            ],
            depthStencilAttachment: {
                view: textureDepth.createView(),
                depthLoadValue: 1,
                depthStoreOp: 'store',
                stencilLoadValue: 0,
                stencilStoreOp: 'store',
            },
        };
        setTimeout(() => {
            tweenFactorTarget = tweenFactorTarget === 1 ? 0 : 1;
        }, 100);
        setInterval(() => {
            if (OPTIONS.animatable) {
                tweenFactorTarget = tweenFactorTarget === 1 ? 0 : 1;
            }
        }, 4000);
        requestAnimationFrame(drawFrame);
        function drawFrame(ts) {
            requestAnimationFrame(drawFrame);
            ts /= 1000;
            const dt = ts - oldTime;
            oldTime = ts;
            const swapChainTexture = context.getCurrentTexture();
            const commandEncoder = device.createCommandEncoder();
            sceneRenderPassDescriptor.colorAttachments[0].view =
                swapChainTexture.createView();
            sceneRenderPassDescriptor.colorAttachments[0].loadValue = [
                0.1, 0.1, 0.1, 1.0,
            ];
            const renderPass = commandEncoder.beginRenderPass(sceneRenderPassDescriptor);
            // Write perspective camera projection and view matrix to uniform block
            perspCamera.setPosition({
                x: Math.cos(ts * 0.2) * WORLD_SIZE_X,
                y: 0,
                z: Math.sin(ts * 0.2) * WORLD_SIZE_Z,
            });
            perspCamera.lookAt([0, 0, 0]);
            perspCamera.updateProjectionMatrix();
            perspCamera.updateViewMatrix();
            device.queue.writeBuffer(perspCameraUniformBuffer, 0, perspCamera.projectionMatrix);
            device.queue.writeBuffer(perspCameraUniformBuffer, 16 * Float32Array.BYTES_PER_ELEMENT, perspCamera.viewMatrix);
            // Write ortho camera projection and view matrix to uniform block
            device.queue.writeBuffer(orthoCameraUniformBuffer, 0, orthoCamera.projectionMatrix);
            device.queue.writeBuffer(orthoCameraUniformBuffer, 16 * Float32Array.BYTES_PER_ELEMENT, orthoCamera.viewMatrix);
            // Write fullscreen quad model matrix to uniform block
            quadTransform.setRotation({ x: Math.PI }).updateModelMatrix();
            device.queue.writeBuffer(quadTransformUniformBuffer, 0, quadTransform.modelMatrix);
            //
            // Render time
            //
            // Render instanced cubes scene to default swapchainTexture
            renderPass.setPipeline(sceneMeshesPipeline);
            renderPass.setBindGroup(0, perspCameraUniformBindGroup);
            renderPass.setBindGroup(1, lightingUniformBindGroup);
            renderPass.setBindGroup(2, baseColor0UniformBindGroup);
            renderPass.setVertexBuffer(0, cubeVertexBuffer);
            renderPass.setVertexBuffer(1, cubeNormalBuffer);
            renderPass.setVertexBuffer(2, cubeInstanceModelMatrixBuffer);
            renderPass.setVertexBuffer(3, cubeInstanceNormalMatrixBuffer);
            renderPass.setIndexBuffer(cubeIndexBuffer, cubeIndices instanceof Uint16Array ? 'uint16' : 'uint32');
            // Use basecolo0 as baseColor for cubes
            // device.queue.writeBuffer(lightingUniformBuffer, 0, baseColor0)
            renderPass.drawIndexed(cubeIndices.length, INSTANCES_COUNT);
            renderPass.endPass();
            // Copy swapchainTexture to another texture that will be outputted on the fullscreen quad
            commandEncoder.copyTextureToTexture({
                texture: swapChainTexture,
            }, {
                texture: postfx0Texture,
            }, presentationSize);
            sceneRenderPassDescriptor.colorAttachments[0].loadValue = [
                0.225, 0.225, 0.225, 1.0,
            ];
            const renderPass0 = commandEncoder.beginRenderPass(sceneRenderPassDescriptor);
            renderPass0.setPipeline(sceneMeshesPipeline);
            renderPass0.setBindGroup(0, perspCameraUniformBindGroup);
            renderPass0.setBindGroup(1, lightingUniformBindGroup);
            renderPass0.setBindGroup(2, baseColor1UniformBindGroup);
            renderPass0.setVertexBuffer(0, sphereVertexBuffer);
            renderPass0.setVertexBuffer(1, sphereNormalBuffer);
            renderPass0.setVertexBuffer(2, sphereInstanceModelMatrixBuffer);
            renderPass0.setVertexBuffer(3, sphereInstanceNormalMatrixBuffer);
            renderPass0.setIndexBuffer(sphereIndexBuffer, sphereIndices instanceof Uint16Array ? 'uint16' : 'uint32');
            // Use basecolo1 as baseColor for spheres
            // device.queue.writeBuffer(lightingUniformBuffer, 0, baseColor1)
            renderPass0.drawIndexed(sphereIndices.length, INSTANCES_COUNT);
            renderPass0.endPass();
            commandEncoder.copyTextureToTexture({
                texture: swapChainTexture,
            }, {
                texture: postfx1Texture,
            }, presentationSize);
            // Render postfx fullscreen quad to screen
            const postfxPass = commandEncoder.beginRenderPass({
                colorAttachments: [
                    {
                        view: swapChainTexture.createView(),
                        loadValue: [0.1, 0.1, 0.1, 1.0],
                        storeOp: 'store',
                    },
                ],
            });
            if (OPTIONS.animatable) {
                OPTIONS.tweenFactor += (tweenFactorTarget - tweenFactor[0]) * (dt * 2);
            }
            tweenFactor[0] = OPTIONS.tweenFactor;
            device.queue.writeBuffer(tweenFactorUniformBuffer, 0, tweenFactor);
            postfxPass.setPipeline(quadPipeline);
            postfxPass.setBindGroup(0, orthoCameraUniformBindGroup);
            postfxPass.setBindGroup(1, quadTransformUniformBindGroup);
            postfxPass.setBindGroup(2, quadSamplerUniformBindGroup);
            postfxPass.setBindGroup(3, quadTweenUniformBindGroup);
            postfxPass.setVertexBuffer(0, quadVertexBuffer);
            postfxPass.setVertexBuffer(1, quadUvBuffer);
            postfxPass.setIndexBuffer(quadIndexBuffer, quadIndices instanceof Uint16Array ? 'uint16' : 'uint32');
            postfxPass.drawIndexed(quadIndices.length);
            postfxPass.endPass();
            device.queue.submit([commandEncoder.finish()]);
        }
    }))();

}());
