(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.FelaLogger = factory());
}(this, function () { 'use strict';

    var babelHelpers = {};
    babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    babelHelpers.classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    babelHelpers.createClass = function () {
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

    babelHelpers.extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    babelHelpers.inherits = function (subClass, superClass) {
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

    babelHelpers.possibleConstructorReturn = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };

    babelHelpers;


    function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports), module.exports; }

    var cssbeautify = __commonjs(function (module, exports) {
    /*
     Copyright (C) 2013 Sencha Inc.
     Copyright (C) 2012 Sencha Inc.
     Copyright (C) 2011 Sencha Inc.

     Author: Ariya Hidayat.

     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights
     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:

     The above copyright notice and this permission notice shall be included in
     all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     THE SOFTWARE.
    */

    /*jslint continue: true, indent: 4 */
    /*global exports:true, module:true, window:true */

    (function () {

        'use strict';

        function cssbeautify(style, opt) {

            var options,
                index = 0,
                length = style.length,
                blocks,
                formatted = '',
                ch,
                ch2,
                str,
                state,
                State,
                depth,
                quote,
                comment,
                openbracesuffix = true,
                autosemicolon = false,
                trimRight;

            options = arguments.length > 1 ? opt : {};
            if (typeof options.indent === 'undefined') {
                options.indent = '    ';
            }
            if (typeof options.openbrace === 'string') {
                openbracesuffix = options.openbrace === 'end-of-line';
            }
            if (typeof options.autosemicolon === 'boolean') {
                autosemicolon = options.autosemicolon;
            }

            function isWhitespace(c) {
                return c === ' ' || c === '\n' || c === '\t' || c === '\r' || c === '\f';
            }

            function isQuote(c) {
                return c === '\'' || c === '"';
            }

            // FIXME: handle Unicode characters
            function isName(c) {
                return ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch >= '0' && ch <= '9' || '-_*.:#[]'.indexOf(c) >= 0;
            }

            function appendIndent() {
                var i;
                for (i = depth; i > 0; i -= 1) {
                    formatted += options.indent;
                }
            }

            function openBlock() {
                formatted = trimRight(formatted);
                if (openbracesuffix) {
                    formatted += ' {';
                } else {
                    formatted += '\n';
                    appendIndent();
                    formatted += '{';
                }
                if (ch2 !== '\n') {
                    formatted += '\n';
                }
                depth += 1;
            }

            function closeBlock() {
                var last;
                depth -= 1;
                formatted = trimRight(formatted);

                if (formatted.length > 0 && autosemicolon) {
                    last = formatted.charAt(formatted.length - 1);
                    if (last !== ';' && last !== '{') {
                        formatted += ';';
                    }
                }

                formatted += '\n';
                appendIndent();
                formatted += '}';
                blocks.push(formatted);
                formatted = '';
            }

            if (String.prototype.trimRight) {
                trimRight = function trimRight(s) {
                    return s.trimRight();
                };
            } else {
                // old Internet Explorer
                trimRight = function trimRight(s) {
                    return s.replace(/\s+$/, '');
                };
            }

            State = {
                Start: 0,
                AtRule: 1,
                Block: 2,
                Selector: 3,
                Ruleset: 4,
                Property: 5,
                Separator: 6,
                Expression: 7,
                URL: 8
            };

            depth = 0;
            state = State.Start;
            comment = false;
            blocks = [];

            // We want to deal with LF (\n) only
            style = style.replace(/\r\n/g, '\n');

            while (index < length) {
                ch = style.charAt(index);
                ch2 = style.charAt(index + 1);
                index += 1;

                // Inside a string literal?
                if (isQuote(quote)) {
                    formatted += ch;
                    if (ch === quote) {
                        quote = null;
                    }
                    if (ch === '\\' && ch2 === quote) {
                        // Don't treat escaped character as the closing quote
                        formatted += ch2;
                        index += 1;
                    }
                    continue;
                }

                // Starting a string literal?
                if (isQuote(ch)) {
                    formatted += ch;
                    quote = ch;
                    continue;
                }

                // Comment
                if (comment) {
                    formatted += ch;
                    if (ch === '*' && ch2 === '/') {
                        comment = false;
                        formatted += ch2;
                        index += 1;
                    }
                    continue;
                }
                if (ch === '/' && ch2 === '*') {
                    comment = true;
                    formatted += ch;
                    formatted += ch2;
                    index += 1;
                    continue;
                }

                if (state === State.Start) {

                    if (blocks.length === 0) {
                        if (isWhitespace(ch) && formatted.length === 0) {
                            continue;
                        }
                    }

                    // Copy white spaces and control characters
                    if (ch <= ' ' || ch.charCodeAt(0) >= 128) {
                        state = State.Start;
                        formatted += ch;
                        continue;
                    }

                    // Selector or at-rule
                    if (isName(ch) || ch === '@') {

                        // Clear trailing whitespaces and linefeeds.
                        str = trimRight(formatted);

                        if (str.length === 0) {
                            // If we have empty string after removing all the trailing
                            // spaces, that means we are right after a block.
                            // Ensure a blank line as the separator.
                            if (blocks.length > 0) {
                                formatted = '\n\n';
                            }
                        } else {
                            // After finishing a ruleset or directive statement,
                            // there should be one blank line.
                            if (str.charAt(str.length - 1) === '}' || str.charAt(str.length - 1) === ';') {

                                formatted = str + '\n\n';
                            } else {
                                // After block comment, keep all the linefeeds but
                                // start from the first column (remove whitespaces prefix).
                                while (true) {
                                    ch2 = formatted.charAt(formatted.length - 1);
                                    if (ch2 !== ' ' && ch2.charCodeAt(0) !== 9) {
                                        break;
                                    }
                                    formatted = formatted.substr(0, formatted.length - 1);
                                }
                            }
                        }
                        formatted += ch;
                        state = ch === '@' ? State.AtRule : State.Selector;
                        continue;
                    }
                }

                if (state === State.AtRule) {

                    // ';' terminates a statement.
                    if (ch === ';') {
                        formatted += ch;
                        state = State.Start;
                        continue;
                    }

                    // '{' starts a block
                    if (ch === '{') {
                        str = trimRight(formatted);
                        openBlock();
                        state = str === '@font-face' ? State.Ruleset : State.Block;
                        continue;
                    }

                    formatted += ch;
                    continue;
                }

                if (state === State.Block) {

                    // Selector
                    if (isName(ch)) {

                        // Clear trailing whitespaces and linefeeds.
                        str = trimRight(formatted);

                        if (str.length === 0) {
                            // If we have empty string after removing all the trailing
                            // spaces, that means we are right after a block.
                            // Ensure a blank line as the separator.
                            if (blocks.length > 0) {
                                formatted = '\n\n';
                            }
                        } else {
                            // Insert blank line if necessary.
                            if (str.charAt(str.length - 1) === '}') {
                                formatted = str + '\n\n';
                            } else {
                                // After block comment, keep all the linefeeds but
                                // start from the first column (remove whitespaces prefix).
                                while (true) {
                                    ch2 = formatted.charAt(formatted.length - 1);
                                    if (ch2 !== ' ' && ch2.charCodeAt(0) !== 9) {
                                        break;
                                    }
                                    formatted = formatted.substr(0, formatted.length - 1);
                                }
                            }
                        }

                        appendIndent();
                        formatted += ch;
                        state = State.Selector;
                        continue;
                    }

                    // '}' resets the state.
                    if (ch === '}') {
                        closeBlock();
                        state = State.Start;
                        continue;
                    }

                    formatted += ch;
                    continue;
                }

                if (state === State.Selector) {

                    // '{' starts the ruleset.
                    if (ch === '{') {
                        openBlock();
                        state = State.Ruleset;
                        continue;
                    }

                    // '}' resets the state.
                    if (ch === '}') {
                        closeBlock();
                        state = State.Start;
                        continue;
                    }

                    formatted += ch;
                    continue;
                }

                if (state === State.Ruleset) {

                    // '}' finishes the ruleset.
                    if (ch === '}') {
                        closeBlock();
                        state = State.Start;
                        if (depth > 0) {
                            state = State.Block;
                        }
                        continue;
                    }

                    // Make sure there is no blank line or trailing spaces inbetween
                    if (ch === '\n') {
                        formatted = trimRight(formatted);
                        formatted += '\n';
                        continue;
                    }

                    // property name
                    if (!isWhitespace(ch)) {
                        formatted = trimRight(formatted);
                        formatted += '\n';
                        appendIndent();
                        formatted += ch;
                        state = State.Property;
                        continue;
                    }
                    formatted += ch;
                    continue;
                }

                if (state === State.Property) {

                    // ':' concludes the property.
                    if (ch === ':') {
                        formatted = trimRight(formatted);
                        formatted += ': ';
                        state = State.Expression;
                        if (isWhitespace(ch2)) {
                            state = State.Separator;
                        }
                        continue;
                    }

                    // '}' finishes the ruleset.
                    if (ch === '}') {
                        closeBlock();
                        state = State.Start;
                        if (depth > 0) {
                            state = State.Block;
                        }
                        continue;
                    }

                    formatted += ch;
                    continue;
                }

                if (state === State.Separator) {

                    // Non-whitespace starts the expression.
                    if (!isWhitespace(ch)) {
                        formatted += ch;
                        state = State.Expression;
                        continue;
                    }

                    // Anticipate string literal.
                    if (isQuote(ch2)) {
                        state = State.Expression;
                    }

                    continue;
                }

                if (state === State.Expression) {

                    // '}' finishes the ruleset.
                    if (ch === '}') {
                        closeBlock();
                        state = State.Start;
                        if (depth > 0) {
                            state = State.Block;
                        }
                        continue;
                    }

                    // ';' completes the declaration.
                    if (ch === ';') {
                        formatted = trimRight(formatted);
                        formatted += ';\n';
                        state = State.Ruleset;
                        continue;
                    }

                    formatted += ch;

                    if (ch === '(') {
                        if (formatted.charAt(formatted.length - 2) === 'l' && formatted.charAt(formatted.length - 3) === 'r' && formatted.charAt(formatted.length - 4) === 'u') {

                            // URL starts with '(' and closes with ')'.
                            state = State.URL;
                            continue;
                        }
                    }

                    continue;
                }

                if (state === State.URL) {

                    // ')' finishes the URL (only if it is not escaped).
                    if (ch === ')' && formatted.charAt(formatted.length - 1 !== '\\')) {
                        formatted += ch;
                        state = State.Expression;
                        continue;
                    }
                }

                // The default action is to copy the character (to prevent
                // infinite loop).
                formatted += ch;
            }

            formatted = blocks.join('') + formatted;

            return formatted;
        }

        if (typeof exports !== 'undefined') {
            // Node.js module.
            module.exports = exports = cssbeautify;
        } else if ((typeof window === 'undefined' ? 'undefined' : babelHelpers.typeof(window)) === 'object') {
            // Browser loading.
            window.cssbeautify = cssbeautify;
        }
    })();
    });

    var cssbeautify$1 = (cssbeautify && typeof cssbeautify === 'object' && 'default' in cssbeautify ? cssbeautify['default'] : cssbeautify);

    /**
     * adds a logging tool which listens to renderer changes
     *
     * @param {Object} renderer - renderer which gets enhanced
     * @param {Object} options - logging options
     * @return {Object} enhanced renderer
     */
    function addLogger(renderer, options) {
      renderer.subscribe(function (change) {
        // log clearing
        if (change.type === 'clear') {
          console.log('Cleared renderer cache.'); // eslint-disable-line
          return true;
        }

        // log status of rehydration
        if (change.type === 'rehydrate') {
          console.log('Renderer rehydration ' + (change.done ? 'finished' : 'started') + '.'); // eslint-disable-line
          return true;
        }

        var selector = change.selector || change.font || change.name;
        var style = change.style || change.fontFace;
        var css = options.format ? cssbeautify$1(change.css) : change.css;
        var isMedia = change.media && change.media.length > 0;

        // logs all information in a group
        console.group(selector); // eslint-disable-line
        isMedia && console.log(change.media); // eslint-disable-line
        options.logStyleObject && console.log(style); // eslint-disable-line
        options.logCSS && console.log(css); // eslint-disable-line
        console.groupEnd(selector); // eslint-disable-line
      });

      return renderer;
    }

    var defaultOptions = {
      logStyleObject: true,
      logCSS: false,
      formatCSS: false
    };

    var logger = (function () {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return function (renderer) {
        return addLogger(renderer, babelHelpers.extends({}, defaultOptions, options));
      };
    });

    return logger;

}));
//# sourceMappingURL=fela-logger.js.map