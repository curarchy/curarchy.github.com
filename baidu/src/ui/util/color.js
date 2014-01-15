/**
 * ADM 2.0
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 颜色计算类
 * @author zhanglili(otakustay@gmail.com)
 * @date $DATE$
 */
define(
    function (require) {
        function toHex(number) {
            var hex = (+number).toString(16);
            if (hex.length === 1) {
                hex = '0' + hex;
            }
            return hex;
        }

        function hueToRGB(p, q, t) {
            if (t < 0) {
                t += 1;
            }
            if (t > 1) {
                t -= 1;
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2/3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        }

        var colorUtil = {
            hslToRGB: function (hue, saturation, light) {
                if (typeof hue === 'object') {
                    light = hue.light || hue.l;
                    saturation = hue.saturation || hue.s;
                    hue = hue.hue || hue.h;
                }

                hue /= 360;
                // Saturation值可能是按小数算，也可能给百分比值
                if (saturation > 1) {
                    saturation = saturation / 100;
                }
                // Light值可能是按小数算，也可能给百分比值
                if (light > 1) {
                    light = light / 100;
                }

                var rgb = {};

                if (saturation === 0) {
                    rgb.red = light;
                    rgb.green = light;
                    rgb.blue = light;
                }
                else {
                    var q = light < 0.5 ?
                        light * (1 + saturation) :
                        light + saturation - light * saturation;
                    var p = 2 * light - q;
                    rgb.red = hueToRGB(p, q, hue + 1 / 3) * 255;
                    rgb.green = hueToRGB(p, q, hue) * 255;
                    rgb.blue = hueToRGB(p, q, hue - 1 / 3) * 255;
                }

                rgb.red = Math.round(rgb.red);
                rgb.green = Math.round(rgb.green);
                rgb.blue = Math.round(rgb.blue);

                rgb.r = rgb.red;
                rgb.g = rgb.green;
                rgb.b = rgb.blue;

                return rgb;
            },

            rgbToHex: function (red, green, blue) {
                if (typeof red === 'object') {
                    blue = red.blue || red.b;
                    green = red.green || red.g;
                    red = red.red || red.r;
                }

                var hex = [toHex(red), toHex(green), toHex(blue)];
                return hex.join('');
            },

            hslToHex: function (hue, saturation, light) {
                var rgb = colorUtil.hslToRGB(hue, saturation, light);
                var hex = colorUtil.rgbToHex(rgb);
                return hex;
            },

            rgbToHSL: function (red, green, blue) {
                if (typeof red === 'object') {
                    blue = red.blue || red.b;
                    green = red.green || red.g;
                    red = red.red || red.r;
                }

                red /= 255;
                green /= 255;
                blue /= 255;
                var max = Math.max(red, green, blue);
                var min = Math.min(red, green, blue);
                var hue = 0;
                var saturation = 0;
                var light = (max + min) / 2;

                if (max === min){
                    hue = 0;
                    light = 0;
                }
                else {
                    var diff = max - min;
                    saturation = light > 0.5
                        ? diff / (2 - max - min)
                        : diff / (max + min);

                    switch (max) {
                        case red:
                            hue = (green - blue) / diff 
                                + (green < blue ? 6 : 0);
                            break;
                        case green:
                            hue = (blue - red) / diff + 2;
                            break;
                        case blue:
                            hue = (red - green) / diff + 4;
                            break;
                    }
                    hue /= 6;
                }

                // 转换为度数
                hue *= 360;

                var hsl = {
                    hue: hue,
                    saturation: saturation,
                    light: light,
                    h: hue,
                    s: saturation,
                    l: light
                };

                return hsl;
            },

            hexToRGB: function (hex) {
                if (hex.indexOf('#') === 0) {
                    hex = hex.substring(1);
                }

                if (hex.length === 3) {
                    hex = hex.charAt(0) + hex.charAt(0)
                        + hex.charAt(1) + hex.charAt(1)
                        + hex.charAt(2) + hex.charAt(2);
                }

                var rgb = {
                    red: parseInt(hex.charAt(0) + hex.charAt(1), 16) || 0,
                    green: parseInt(hex.charAt(2) + hex.charAt(3), 16) || 0,
                    blue: parseInt(hex.charAt(4) + hex.charAt(5), 16) || 0
                };

                rgb.r = rgb.red;
                rgb.g = rgb.green;
                rgb.b = rgb.blue;

                return rgb;
            },

            hexToHSL: function (hex) {
                var rgb = colorUtil.hexToRGB(hex);
                var hsl = colorUtil.rgbToHSL(rgb);
                return hsl;
            },

            isValidRGB: function (input) {
                return (/^#?[0-9a-fA-Z]{3}$/).test(input)
                    || (/^#?[0-9a-fA-Z]{6}$/).test(input);
            }
        };

        return colorUtil;
    }
);        
