/**
 * ColorPicker - pure JavaScript color picker without using images, external CSS or 1px divs.
 * Copyright © 2011 David Durman, All rights reserved.
 */
(function(window, document, undefined) {

    function add_on_clicked_mouse_move_listener(element, callback) {
        var down = false;
        function mouse_down(evt) {down = true; mouse_move(evt);}
        function mouse_up(evt) {down = false; evt.preventDefault && evt.preventDefault();}
        function mouse_move(evt) {down && callback(mousePosition(evt))}
        function attach(element, event_name, callback) {
            if (element.attachEvent) {
                element.attachEvent('on' + event_name, callback);
            } else if (element.addEventListener) {
                element.addEventListener(event_name, callback, false);
            }
        }
        attach(element, 'mousedown', mouse_down);
        attach(element, 'mousemove', mouse_move);
        attach(document, 'mouseup', mouse_up);
    }

    var type = (window.SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML"),
        picker, slide, hueOffset = 15, svgNS = 'http://www.w3.org/2000/svg';

    /**
     * Return mouse position relative to the element el.
     */
    function mousePosition(evt) {
        // IE:
        if (window.event && window.event.contentOverflow !== undefined) {
            return { x: window.event.offsetX, y: window.event.offsetY };
        }
        // Webkit:
        if (evt.offsetX !== undefined && evt.offsetY !== undefined) {
            return { x: evt.offsetX, y: evt.offsetY };
        }
        // Firefox:
        evt.preventDefault();
        var wrapper = evt.target.parentNode.parentNode;
        return { x: evt.layerX - wrapper.offsetLeft, y: evt.layerY - wrapper.offsetTop };
    }

    /**
     * Create SVG element.
     */
    function $(el, attrs, children) {
        el = document.createElementNS(svgNS, el);
        for (var key in attrs)
            el.setAttribute(key, attrs[key]);
        if (Object.prototype.toString.call(children) != '[object Array]') children = [children];
        var i = 0, len = (children[0] && children.length) || 0;
        for (; i < len; i++)
            el.appendChild(children[i]);
        return el;
    }

    /**
     * Create slide and picker markup depending on the supported technology.
     */
    if (type == 'SVG') {

        slide = $('svg', { xmlns: 'http://www.w3.org/2000/svg', version: '1.1', width: '100%', height: '100%' },
                  [
                      $('defs', {},
                        $('linearGradient', { id: 'gradient-hsv', x1: '0%', y1: '100%', x2: '0%', y2: '0%'},
                          [
                              $('stop', { offset: '0%', 'stop-color': '#FF0000', 'stop-opacity': '1' }),
                              $('stop', { offset: '13%', 'stop-color': '#FF00FF', 'stop-opacity': '1' }),
                              $('stop', { offset: '25%', 'stop-color': '#8000FF', 'stop-opacity': '1' }),
                              $('stop', { offset: '38%', 'stop-color': '#0040FF', 'stop-opacity': '1' }),
                              $('stop', { offset: '50%', 'stop-color': '#00FFFF', 'stop-opacity': '1' }),
                              $('stop', { offset: '63%', 'stop-color': '#00FF40', 'stop-opacity': '1' }),
                              $('stop', { offset: '75%', 'stop-color': '#0BED00', 'stop-opacity': '1' }),
                              $('stop', { offset: '88%', 'stop-color': '#FFFF00', 'stop-opacity': '1' }),
                              $('stop', { offset: '100%', 'stop-color': '#FF0000', 'stop-opacity': '1' })
                          ]
                         )
                       ),
                      $('rect', { x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-hsv)'})
                  ]
                 );

        picker = $('svg', { xmlns: 'http://www.w3.org/2000/svg', version: '1.1', width: '100%', height: '100%' },
                   [
                       $('defs', {},
                         [
                             $('linearGradient', { id: 'gradient-black', x1: '0%', y1: '100%', x2: '0%', y2: '0%'},
                               [
                                   $('stop', { offset: '0%', 'stop-color': '#000000', 'stop-opacity': '1' }),
                                   $('stop', { offset: '100%', 'stop-color': '#CC9A81', 'stop-opacity': '0' })
                               ]
                              ),
                             $('linearGradient', { id: 'gradient-white', x1: '0%', y1: '100%', x2: '100%', y2: '100%'},
                               [
                                   $('stop', { offset: '0%', 'stop-color': '#FFFFFF', 'stop-opacity': '1' }),
                                   $('stop', { offset: '100%', 'stop-color': '#CC9A81', 'stop-opacity': '0' })
                               ]
                              )
                         ]
                        ),
                       $('rect', { x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-white)'}),                       
                       $('rect', { x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-black)'})
                   ]
                  );

    } else if (type == 'VML') {
        slide = [
            '<DIV style="position: relative; width: 100%; height: 100%">',
            '<v:rect style="position: absolute; top: 0; left: 0; width: 100%; height: 100%" stroked="f" filled="t">',
            '<v:fill type="gradient" method="none" angle="0" color="red" color2="red" colors="8519f fuchsia;.25 #8000ff;24903f #0040ff;.5 aqua;41287f #00ff40;.75 #0bed00;57671f yellow"></v:fill>',
            '</v:rect>',
            '</DIV>'
        ].join('');

        picker = [
            '<DIV style="position: relative; width: 100%; height: 100%">',
            '<v:rect style="position: absolute; left: -1px; top: -1px; width: 101%; height: 101%" stroked="f" filled="t">',
            '<v:fill type="gradient" method="none" angle="270" color="#FFFFFF" opacity="100%" color2="#CC9A81" o:opacity2="0%"></v:fill>',
            '</v:rect>',
            '<v:rect style="position: absolute; left: 0px; top: 0px; width: 100%; height: 101%" stroked="f" filled="t">',
            '<v:fill type="gradient" method="none" angle="0" color="#000000" opacity="100%" color2="#CC9A81" o:opacity2="0%"></v:fill>',
            '</v:rect>',
            '</DIV>'
        ].join('');
        
        if (!document.namespaces['v'])
            document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
    }

    /**
     * Convert HSV representation to RGB HEX string.
     * Credits to http://www.raphaeljs.com
     */
    function hsv2rgb(h, s, v) {
        var R, G, B, X, C;
        h = (h % 360) / 60;
            C = v * s;
        X = C * (1 - Math.abs(h % 2 - 1));
        R = G = B = v - C;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];

        var r = R * 255,
            g = G * 255,
            b = B * 255;
        return { r: r, g: g, b: b, hex: "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1) };
    }

    /**
     * Convert RGB representation to HSV.
     * r, g, b can be either in <0,1> range or <0,255> range.
     * Credits to http://www.raphaeljs.com
     */
    function rgb2hsv(r, g, b) {
        if (r > 1 || g > 1 || b > 1) {
            r /= 255;
            g /= 255;
            b /= 255;
        }
        var H, S, V, C;
        V = Math.max(r, g, b);
        C = V - Math.min(r, g, b);
        H = (C == 0 ? null :
             V == r ? (g - b) / C + (g < b ? 6 : 0) :
             V == g ? (b - r) / C + 2 :
                      (r - g) / C + 4);
        H = (H % 6) * 60;
        S = C == 0 ? 0 : C / V;
        return { h: H, s: S, v: V };
    }

    /**
     * ColorPicker.
     * @param {DOMElement} slideElement HSV slide element.
     * @param {DOMElement} pickerElement HSV picker element.
     * @param {Function} callback Called whenever the color is changed provided chosen color in RGB HEX format as the only argument.
     */
    function ColorPicker(slideElement, pickerElement, callback) {
        if (!(this instanceof ColorPicker)) return new ColorPicker(slideElement, pickerElement, callback);
        var self = this;

        /**
         * Mouse move event handler for the slider.
         * Sets picker background color and calls ctx.callback if provided.
        */
        self = this;

        slideMouseMove = function(mouse) {
            self.h = mouse.y / self.slideElement.offsetHeight * 360 + hueOffset;
            self.s = self.v = 1;
            var c = hsv2rgb(self.h, 1, 1);
            self.pickerElement.style.backgroundColor = c.hex;
            self.callback && self.callback(c.hex, { h: self.h - hueOffset, s: self.s, v: self.v }, { r: c.r, g: c.g, b: c.b }, undefined, mouse);
        }

        add_on_clicked_mouse_move_listener(slideElement, slideMouseMove);

        /**
         * Mouse move event handler for the picker.
         * Calls this.callback if provided.
         */
        pickerMouseMove = function(mouse) {
            var width = self.pickerElement.offsetWidth,
                height = self.pickerElement.offsetHeight;

            self.s = mouse.x / width;
            self.v = (height - mouse.y) / height;
            var c = hsv2rgb(self.h, self.s, self.v);
            self.callback && self.callback(c.hex, { h: self.h - hueOffset, s: self.s, v: self.v }, { r: c.r, g: c.g, b: c.b }, mouse);
        }

        add_on_clicked_mouse_move_listener(pickerElement, pickerMouseMove);

        this.callback = callback;
        this.h = 0;
        this.s = 1;
        this.v = 1;
        this.pickerElement = pickerElement;
        this.slideElement = slideElement;

        if (type == 'SVG') {
            slideElement.appendChild(slide.cloneNode(true));
            pickerElement.appendChild(picker.cloneNode(true));
        } else {
            slideElement.innerHTML = slide;
            pickerElement.innerHTML = picker;
        }
    };

    /**
     * Sets color of the picker in hsv/rgb/hex format.
     * @param {object} ctx ColorPicker instance.
     * @param {object} hsv Object of the form: { h: <hue>, s: <saturation>, v: <value> }.
     * @param {object} rgb Object of the form: { r: <red>, g: <green>, b: <blue> }.
     * @param {string} hex String of the form: #RRGGBB.
     */
     function setColor(ctx, hsv, rgb, hex) {
        ctx.h = hsv.h % 360;
        ctx.s = hsv.s;
        ctx.v = hsv.v;
        var c = hsv2rgb(ctx.h, ctx.s, ctx.v),
            mouseSlide = {
                y: (ctx.h * ctx.slideElement.offsetHeight) / 360,
                x: 0    // not important
            },
            pickerHeight = ctx.pickerElement.offsetHeight,
            mousePicker = {
                x: ctx.s * ctx.pickerElement.offsetWidth,
                y: pickerHeight - ctx.v * pickerHeight
            };
        ctx.pickerElement.style.backgroundColor = hsv2rgb(ctx.h, 1, 1).hex;
        ctx.callback && ctx.callback(hex || c.hex, { h: ctx.h, s: ctx.s, v: ctx.v }, rgb || { r: c.r, g: c.g, b: c.b }, mousePicker, mouseSlide);
    };

    /**
     * Sets color of the picker in rgb format.
     * @param {object} rgb Object of the form: { r: <red>, g: <green>, b: <blue> }.
     */
    ColorPicker.prototype.setHsv = function(hsv) {
        setColor(this, hsv);
    };
    
    /**
     * Sets color of the picker in rgb format.
     * @param {object} rgb Object of the form: { r: <red>, g: <green>, b: <blue> }.
     */
    ColorPicker.prototype.setRgb = function(rgb) {
        setColor(this, rgb2hsv(rgb.r, rgb.g, rgb.b), rgb);
    };

    /**
     * Sets color of the picker in hex format.
     * @param {string} hex Hex color format #RRGGBB.
     */
    ColorPicker.prototype.setHex = function(hex) {
        setColor(this, rgb2hsv(parseInt(hex.substr(1, 2), 16), parseInt(hex.substr(3, 2), 16), parseInt(hex.substr(5, 2), 16)), undefined, hex);
    };

    ColorPicker.hsv2rgb = hsv2rgb;
    ColorPicker.rgb2hsv = rgb2hsv;

    /**
     * Helper to position indicators.
     * @param {HTMLElement} slideIndicator DOM element representing the indicator of the slide area.
     * @param {HTMLElement} pickerIndicator DOM element representing the indicator of the picker area.
     * @param {object} mouseSlide Coordinates of the mouse cursor in the slide area.
     * @param {object} mousePicker Coordinates of the mouse cursor in the picker area.
     */
    ColorPicker.positionIndicators = function(slideIndicator, pickerIndicator, mouseSlide, mousePicker) {
        slideIndicator.style.pointerEvents = "none";
        pickerIndicator.style.pointerEvents = "none";
        if (mouseSlide) {
            pickerIndicator.style.left = 'auto';
            pickerIndicator.style.right = '0px';
            pickerIndicator.style.top = '0px';
            slideIndicator.style.top = (mouseSlide.y - slideIndicator.offsetHeight/2) + 'px';
        }
        if (mousePicker) {
            pickerIndicator.style.top = (mousePicker.y - pickerIndicator.offsetHeight/2) + 'px';
            pickerIndicator.style.left = (mousePicker.x - pickerIndicator.offsetWidth/2) + 'px';
        } 
    };
    
    window.ColorPicker = ColorPicker;

})(window, window.document);
