/**
 * ColorPicker - pure JavaScript color picker without using images, external CSS or 1px divs.
 * Copyright © 2011 David Durman, All rights reserved.
 */
(function(window, document, undefined) {

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
        return { x: evt.layerX, y: evt.layerY };
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
     * @param {DOMElement} container container of the slider and the picker.
     * @param {Function} callback Called whenever the color is changed provided chosen color in RGB HEX format as the only argument.
     */
    function ColorPicker(container, callback) {
        if (!(this instanceof ColorPicker)) return new ColorPicker(container, callback);
        var self = this;

        /**
         * Mouse move event handler for the slider.
         * Sets picker background color and calls ctx.callback if provided.
        */
        this.pickerElement = document.createElement("div");
        this.pickerElement.style.width = "80%";
        this.pickerElement.style.height = "100%";
        this.pickerElement.style.cssFloat = "left";
        this.pickerElement.style.styleFloat = "left";
        this.pickerElement.style.backgroundColor = "red";
        this.pickerElement.style.cursor = "crosshair";
        container.appendChild(this.pickerElement);
        this.slideElement = document.createElement("div");
        this.slideElement.style.width = "18%";
        this.slideElement.style.marginLeft = "2%";
        this.slideElement.style.height = "100%";
        this.slideElement.style.cssFloat = "left";
        this.slideElement.style.styleFloat = "left";
        this.slideElement.style.cursor = "crosshair";
        container.appendChild(this.slideElement);

        this.slideMouseMove = function(evt) {
            if (window.event) {
                evt = window.event;
            } else {
                evt.preventDefault();
            }
            var mouse = mousePosition(evt);
            this.h = mouse.y / this.slideElement.offsetHeight * 360 + hueOffset;
            this.s = this.v = 1;
            var c = hsv2rgb(this.h, 1, 1);
            this.pickerElement.style.backgroundColor = c.hex;
            this.callback && this.callback(c.hex, { h: this.h - hueOffset, s: this.s, v: this.v }, { r: c.r, g: c.g, b: c.b });
            this.positionIndicators(mouse);
        }

        this.slideMoveListener = function(evt) {
            if (self.sliding) {
                self.slideMouseMove(evt);
            }
        };

        this.slideDownListener = function(evt) {
            self.sliding = true;
            self.slideMouseMove(evt);
        };

        this.slideUpListener = function(evt) {
            self.sliding = false;
        };

        /**
         * Mouse move event handler for the picker.
         * Calls this.callback if provided.
         */
        this.pickerMouseMove = function(evt) {
            if (window.event) {
                evt = window.event;
            } else {
                evt.preventDefault();
            }
            var mouse = mousePosition(evt),
                width = this.pickerElement.offsetWidth,
                height = this.pickerElement.offsetHeight;

            this.s = mouse.x / width;
            this.v = (height - mouse.y) / height;
            var c = hsv2rgb(this.h, this.s, this.v);
            this.callback && this.callback(c.hex, { h: this.h - hueOffset, s: this.s, v: this.v }, { r: c.r, g: c.g, b: c.b });
            this.positionIndicators(undefined, mouse);
        }

        this.pickerMoveListener = function(evt) {
            if (self.picking) {
                self.pickerMouseMove(evt);
            }
        };

        this.pickerDownListener = function(evt) {
            self.picking = true;
            self.pickerMouseMove(evt);
        };

        this.pickerUpListener = function(evt) {
            self.picking = false;
        };

        this.callback = callback;
        this.sliding = false;
        this.picking = false;
        this.h = 0;
        this.s = 1;
        this.v = 1;
        this.slideElement.style.position = "relative";
        this.pickerElement.style.position = "relative";
        function applyIndicatorStyle(element) {
            element.style.width = "5px";
            element.style.height = "5px";
            element.style.border = "1px solid black";
            element.style.backgroundColor = "white";
            element.style.position = "absolute";
            element.style.borderRadius = "4px";
        }

        this.slideIndicatorElement = document.createElement("div");
        applyIndicatorStyle(this.slideIndicatorElement);
        this.slideIndicatorElement.style.width = "100%";
        this.slideIndicatorElement.style.height = "10px";
        this.slideIndicatorElement.style.left = "-2px";
        this.slideIndicatorElement.style.opacity = ".3";
        //-ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=30)";
        this.slideIndicatorElement.style.filter = "progid:DXImageTransform.Microsoft.Alpha(Opacity=30)";
        this.slideIndicatorElement.style.filter = "alpha(opacity=30)";
        this.slideIndicatorElement.style.border = "2px solid black";
        this.slideElement.appendChild(this.slideIndicatorElement);

        this.pickerIndicatorElement = document.createElement("div");
        applyIndicatorStyle(this.pickerIndicatorElement);
        this.pickerElement.appendChild(this.pickerIndicatorElement);

        if (type == 'SVG') {
            this.slideElement.appendChild(slide.cloneNode(true));
            this.pickerElement.appendChild(picker.cloneNode(true));
        } else {
            this.slideElement.innerHTML = slide;
            this.pickerElement.innerHTML = picker;
        }

    /**
     * Helper to position indicators.
     * @param {object} mouseSlide Coordinates of the mouse cursor in the slide area.
     * @param {object} mousePicker Coordinates of the mouse cursor in the picker area.
     */
    this.positionIndicators = function(mouseSlide, mousePicker) {
        this.slideIndicatorElement.style.pointerEvents = "none";
        this.pickerIndicatorElement.style.pointerEvents = "none";
        if (mouseSlide) {
            this.pickerIndicatorElement.style.left = 'auto';
            this.pickerIndicatorElement.style.right = '0px';
            this.pickerIndicatorElement.style.top = '0px';
            this.slideIndicatorElement.style.top = (mouseSlide.y - this.slideIndicatorElement.offsetHeight/2) + 'px';
        }
        if (mousePicker) {
            this.pickerIndicatorElement.style.top = (mousePicker.y - this.pickerIndicatorElement.offsetHeight/2) + 'px';
            this.pickerIndicatorElement.style.left = (mousePicker.x - this.pickerIndicatorElement.offsetWidth/2) + 'px';
        }
    };

        if (this.slideElement.attachEvent) {
            this.slideElement.attachEvent('onmousedown', this.slideDownListener);
            this.slideElement.attachEvent('onmousemove', this.slideMoveListener);
            this.slideElement.attachEvent('onmouseout', this.slideUpListener);
            this.slideElement.attachEvent('onmouseup', this.slideUpListener);
            this.pickerElement.attachEvent('onmousedown', this.pickerDownListener);
            this.pickerElement.attachEvent('onmousemove', this.pickerMoveListener);
            this.pickerElement.attachEvent('onmouseout', this.pickerUpListener);
            this.pickerElement.attachEvent('onmouseup', this.pickerUpListener);
        } else if (this.slideElement.addEventListener) {
            this.slideElement.addEventListener('mousedown', this.slideDownListener, false);
            this.slideElement.addEventListener('mousemove', this.slideMoveListener, false);
            this.slideElement.addEventListener('mouseup', this.slideUpListener, false);
            this.slideElement.addEventListener('mouseout', this.slideUpListener, false);
            this.pickerElement.addEventListener('mousedown', this.pickerDownListener, false);
            this.pickerElement.addEventListener('mousemove', this.pickerMoveListener, false);
            this.pickerElement.addEventListener('mouseup', this.pickerUpListener, false);
            this.pickerElement.addEventListener('mouseout', this.pickerUpListener, false);
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
        ctx.callback && ctx.callback(hex || c.hex, { h: ctx.h, s: ctx.s, v: ctx.v }, rgb || { r: c.r, g: c.g, b: c.b });
        ctx.positionIndicators(mouseSlide, mousePicker);
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

    window.ColorPicker = ColorPicker;

})(window, window.document);
