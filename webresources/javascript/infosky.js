/*************************************************************
* infosky.core
*------------------------------------------------------------
* Author: Chenhy(curarpiktchen@hotmail.com)
* Create Date: 2013-04-11
************************************************************/

(function () {

    window.usingNamespace = function (a) {
        if (!(typeof (a) === "string" && a.length !== 0)) {
            throw Error("param error");
        }
        var co = window;
        var nsp = a.split(".");
        for (var i = 0; i < nsp.length; i++) {
            var cp = nsp[i];
            co = co[cp] = co[cp] || {};
        }
        return co;
    };

    var infosky = function () {
        return new infosky.fn.init();
    };

    $.extend(infosky, {

        infosky: "1.0",

        // buildurl from environment or envir
        buildUrl: function (name, timeStamp, envir) {
            var url = (envir || Environment)[name];
            if (timeStamp) {
                if (url.indexOf('?') === -1) {
                    url += ("?" + timeStamp + "=" + infosky.random(10000000));
                } else {
                    url += ("&" + timeStamp + "=" + infosky.random(10000000));
                }
            }
            return url;
        },

        trimLeft: function (str) {
            return str === null ? "" : str.toString().replace(/^\s+/, "");
        },

        trimRight: function (str) {
            return str === null ? "" : str.toString().replace(/\s+$/, "");
        },

        trim: function (str) {
            return str === null ? "" : ("" + str).replace(/^\s+|\s+$/g, "");
        },

        //多个空格合并成一个
        resetBlank: function (str) {
            var regEx = /\s+/g;
            return str === null ? "" : ("" + str).replace(regEx, ' ');
        },

        padLeft: function (str, c, count) {
            while (str.length < count) {
                str = c + str;
            }
            return str;
        },

        padRight: function (str, c, count) {
            while (str.length < count) {
                str += c;
            }
            return str;
        },

        hrefTo: function (url, newwin) {
            return newwin ? open(url) : (location.href = url);
        },

        isNullOrEmpty: function (str) {
            return !(typeof (str) === "string" && str.replace(/^\s+|\s+$/g, "").length !== 0);
        },

        isNumeric: function (obj) {
            return !isNaN(parseFloat(obj)) && isFinite(obj);
        },

        keyCode: {
            BackSpace: 8,
            Tab: 9,
            Enter: 13,
            A: 65,
            Z: 90,
            Shift_A: 97,
            Shift_Z: 122
        },

        // _$.stringFormat("{0} xxx {1}","a","b")  =>> "a xxx b"
        // _$.stringFormat("{0} xxx {1}",["a","b"]) =>> "a xxx b"
        // _$.stringFormat("{{0}} xxx {{1}}",{"0":"hello","1":"world"}) =>> "hello xxx world"
        stringFormat: function (source, params) {
            if (arguments.length === 1) return function () {
                var args = $.makeArray(arguments);
                args.unshift(source);
                return infosky.stringFormat.apply(this, args);
            };
            if (arguments.length === 2 && typeof (arguments[1]) == "object" && (arguments[1] === null || arguments[1].constructor != Array)) {
                var obj;
                if (arguments[1] === null)
                    obj = [""];
                else if (arguments[1].constructor != Array)
                    obj = arguments[1];

                var beginchar = "{{";
                var endchar = "}}";
                return source.replace(new RegExp(beginchar + "([^\\[\\]]*?)" + endchar, "igm"), function ($, $1) {
                    return obj[$1] ? obj[$1] : $;
                });
            }
            if (arguments.length > 2 && (params || "").constructor != Array) {
                params = $.makeArray(arguments).slice(1);
            }
            if ((params || "").constructor != Array) {
                params = [params];
            }
            $.each(params || "", function (i, n) {
                source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
            });
            return source;
        },

        upFirst: function (str) {
            var reg = /\b(\w)|\s(\w)/g;
            return str.replace(reg, function (m) {
                return m.toUpperCase();
            });
        },

        caret: function (elem, begin, end) {
            if (!elem) return;
            var range;
            if (typeof begin === 'number') {
                end = (typeof end === 'number') ? end : begin;
                if (elem.setSelectionRange) {
                    elem.setSelectionRange(begin, end);
                } else if (elem.createTextRange) {
                    range = elem.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', end);
                    range.moveStart('character', begin);
                    range.select();
                }
            } else {
                if (elem.setSelectionRange) {
                    begin = elem.selectionStart;
                    end = elem.selectionEnd;
                } else if (document.selection && document.selection.createRange) {
                    // to fix ie6,7,8
                    // magic code ,modify carefully
                    if ($(elem).is("textarea")) {
                        range = document.selection.createRange();
                        var range_textarea = document.body.createTextRange();
                        range_textarea.moveToElementText(elem);
                        for (var sel_start = 0; range_textarea.compareEndPoints('StartToStart', range) < 0; sel_start++)
                            range_textarea.moveStart('character', 1);
                        begin = sel_start;
                        end = begin + range.text.length;
                    } else if ($(elem).is("input")) {
                        range = document.selection.createRange();
                        begin = 0 - range.duplicate().moveStart('character', -100000);
                        end = begin + range.text.length;
                    }
                }
                return {
                    begin: begin,
                    end: end
                };
            }
        },

        //cookie相关操作
        cookie: {
            get: function (name) {
                var cookieName = encodeURIComponent(name) + "=",
                    cookieStart = document.cookie.indexOf(cookieName),
                    cookieValue = null;
                if (cookieStart > -1) {
                    var cookieEnd = document.cookie.indexOf(";", cookieStart);
                    if (cookieEnd == -1) {
                        cookieEnd = document.cookie.length;
                    }
                    cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
                }
                return cookieValue;
            },
            set: function (name, value, expires, path, domain, secure) {
                var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
                if (expires instanceof Date) cookieText += "; expires=" + expires.toGMTString();
                if (path) cookieText += "; path=" + path;
                if (domain) cookieText += "; domain=" + domain;
                if (secure) cookieText += "; secure";
                document.cookie = cookieText;
            }
        },

        //数组过滤重复数据
        unique: function (arr) {
            var hash = {}, result = [];
            for (var i = 0, l = arr.length; i < l; ++i) {
                if (!hash.hasOwnProperty(arr[i])) {
                    hash[arr[i]] = true;
                    result.push(arr[i]);
                }
            }
            return result;
        },

        //创建一个对象，其原型为p
        inherit: function (p) {
            if (p === null) throw TypeError();
            if (Object.create) return Object.create(p);
            var t = typeof p;
            if (t !== "object" && t !== "function") throw TypeError();

            var f = function () { };
            f.prototype = p;
            return new f();
        },

        //0至(length-1)的随机数
        random: function (length) {
            return Math.floor(Math.random() * (infosky.isNumeric(length) ? length : 65535));
        },


        //记录错误日志
        error: (function () {
            var maxError = 3;
            return function (msg, url) {
                if (!maxError) return;
                maxError--;
                var img = new Image();
                img.src = (url + "?stmp=" + infosky.random() + "&error=" + encodeURIComponent(msg));
            };
        })(),


        //获取querystring
        getParameterByName: function (name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.search);
            if (results === null) {
                return "";
            } else {
                return decodeURIComponent(results[1].replace(/\+/g, " "));
            }
        },

        //获取json对象
        //obj:填充对象，没有则传null
        //ids:控件的ID数组
        //cfg:配置       {
        //                  dftval : "key"      当取到值为空时，用该属性赋值
        //               }
        buildDataByIDs: function (obj, ids, cfg) {
            var _cfg = {
                dftval: ""
            };
            $.extend(_cfg, cfg);
            obj = obj || {};
            $.each(ids, function (i, n) {
                var item = $("#" + n);
                if (item.is("[type=checkbox]")) {
                    obj[n] = item.is(":checked");
                } else {
                    var val = infosky.trim(item.val());
                    if (val) {
                        obj[n] = val;
                    } else if (_cfg.dftval) {
                        obj[n] = item.attr(_cfg.dftval);
                    } else {
                        obj[n] = "";
                    }
                }
            });
            return obj;
        },

        //获取json对象
        //area:搜索区域
        //names:控件的name数组
        //cfg:配置        {
        //                   dftval : "key"      当取到值为空时（null,undefined,false,"",0），用该属性赋值
        //                }
        buildDataByNames: function (area, names, cfg) {
            var _cfg = {
                dftval: ""
            };
            area = area || $("body");
            var result = [];
            var obj = {};
            $.each($(area).find("[name=" + names[0] + "]"), function (index) {
                $.each(names, function (i, n) {
                    var item = $(area).find("[name=" + n + "]:eq(" + index + ")");
                    var val = infosky.trim(item.val());
                    if (val) {
                        obj[n] = val;
                    } else if (_cfg.dftval) {
                        obj[n] = item.attr(_cfg.dftval);
                    } else {
                        obj[n] = "";
                    }
                });
                result.push(obj);
                obj = {};
            });
            return results;
        },

        //阻塞线程（浏览器无响应的）
        sleep: function (second) {
            var current = new Date().setSeconds(new Date().getSeconds() + second);
            while (new Date() < current) { }
        }
    });

    infosky.fn = infosky.prototype = {
        init: function () {
            return this;
        }
    };

    window._$ = window.infosky = infosky;

})();


/*************************************************************
* infosky.ui
*------------------------------------------------------------
* Author: Chenhy(curarpiktchen@hotmail.com)
* Create Date: 2013-04-15
************************************************************/

(function () {
    _$ = _$ || {};
    _$.ui = _$.ui || {};

    //scrollto the element or top by animate
    _$.ui.scrollto = function (param, time, callback) {
        callback = callback || $.noop;
        $("html,body").animate({
            scrollTop: _$.isNumeric(param) ? param : param.offset().top
        }, /^\d*$/.test(time) ? time : 400, callback);
        return param;
    };

    _$.ui.scrollHelper = function (parent, child, position, delta) {
        if (position === "top") {
            data = child.offset().top - parent.offset().top + parent.scrollTop();
            if (_$.isNumeric(delta)) {
                data += +delta;
            }
            parent.scrollTop(data);
        }
        if (position === "bottom") {
            data = child.offset().top - parent.offset().top + parent.scrollTop();
            data = data - parent.height() + child.outerHeight();
            if (_$.isNumeric(delta)) {
                data += +delta;
            }
            parent.scrollTop(data);
        }
    };

    //require jqueryui or jquery.color
    //do not add too many items into parameter "items"
    _$.ui.blink = function (items, colors, oricolors) {
        colors = colors || [];
        oricolors = oricolors || [];
        $(items).each(function (index, item) {
            $(item).first().queue(function (next) { //due to getting the oricolor,the animation should be added into a queue
                var color = colors[index] || "#FF7171";
                var oricolor = oricolors[index] || $(item).css("backgroundColor");
                $(item).first().animate({
                    backgroundColor: color
                }, "fast").animate({
                    backgroundColor: oricolor
                }, "fast").animate({
                    backgroundColor: color
                }, "fast").animate({
                    backgroundColor: oricolor
                }, "fast");
                next();
            });
        });
        return items;
    };

    //items can be shaked
    _$.ui.shake = function (item, size, speed) {
        size = size || 10;
        speed = speed || 150;
        return $(item).animate({
            marginLeft: '-=' + size + 'px'
        }, speed).animate({
            marginLeft: '+=' + 2 * size + 'px'
        }, speed).animate({
            marginLeft: '-=' + 2 * size + 'px'
        }, speed).animate({
            marginLeft: '+=' + size + 'px'
        }, speed);
    };

})();

/*************************************************************
* infosky.vali
*------------------------------------------------------------
* Author: Chenhy(curarpiktchen@hotmail.com)
* Create Date: 2013-04-15
************************************************************/

(function () {
    _$ = _$ || {};
    _$.vali = function (item) {
        //TODO 初始化。。。
        this.item = item;
    };
    _$.vali.rules = _$.vali.rules || {};

    $.extend(_$.vali.rules, {
        IsOr: {
            method: function (value) {
                return (/^\|\|/).test(value);
            },
            msg: "以||开头"
        },
        Required: {
            method: function (value) {
                return (value === null || value === undefined || value === "undefined") ? false : (value.length > 0);
            },
            msg: "该字段必填"
        },
        NotRequired: {
            method: function (value) {
                return value.length === 0;
            },
            msg: "该处无需填写"
        },
        MinLength: {
            method: function (value, param) {
                return value.length >= param[0];
            },
            msg: "不能少于{0}位"
        },
        MaxLength: {
            method: function (value, param) {
                return value.length <= param[0];
            },
            msg: "不能超过{0}位"
        },
        LengthRange: {
            method: function (value, param) {
                return value.length >= param[0] && value.length <= param[1];
            },
            msg: "请输入{0}至{1}位之间"
        },
        Min: {
            method: function (value, param) {
                return value >= param[0];
            },
            msg: "最小值为{0}"
        },
        Max: {
            method: function (value, param) {
                return value <= param[0];
            },
            msg: "最大值为{0}"
        },
        Range: {
            method: function (value, param) {
                if (/^((\d+\.)?\d+)?d*$/.test(value) && value !== "") {
                    return value >= param[0] && value <= param[1];
                }
                return false;
            },
            msg: "请输入{0}至{1}之间"
        },
        IsASCII: {
            method: function (value) {
                return (/^[\u0021-\u007E]*$/).test(value);
            },
            msg: "只能输入英文或半角符号"
        },
        IsInt: {
            method: function (value) {
                return (/^\d*$/).test(value);
            },
            msg: "请输入整数"
        },
        IsFloat: {
            method: function (value) {
                return (/^((\d+\.)?\d+)?d*$/).test(value);
            },
            msg: "请输入数字"
        },
        IsDigits: {
            method: function (value) {
                return (/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/).test(value);
            },
            msg: "请输入数字"
        },
        IsEmail: {
            method: function (value) {
                return (/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/).test(value);
            },
            msg: "email格式不正确"
        },
        IsCharacter: {
            method: function (value) {
                return (/^([a-zA-Z])*$/).test(value);
            },
            msg: "请输入字母"
        },
        IsCharacterOrInteger: {
            method: function (value) {
                return (/^([A-Za-z0-9])*$/).test(value);
            },
            msg: "请输入字母或整数"
        },
        EqualTo: {
            method: function (value, param) {
                return value == $(param[0]).val();
            },
            msg: "两次输入不一致"
        },
        Ajax: {
            method: function () { }
        },
        IsUrl: {
            method: function (value) {
                return (/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/).test(value);
            },
            msg: "请输入合法的网址，以http(s)开头"
        },
        IsPhone: {
            method: function (value) {
                return (/^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/).test(value);
            },
            msg: "电话号码不正确，格式:区号-号码"
        }
    });

    var _errors = [],
        _cache = {},
        _option = {
            group: "default-group",
            target: ":visible", //only visible:":visible"
            //only in dom:"html *"
            autoScroll: true, //if autoFocus is used, the animate of autoScroll is useless
            autoFocus: true,
            autoBlink: true, //jquery.color is required
            autoShake: true, //due to the same animate queue , it's better not to use autoShake and autoBlink at once
            autoAlert: 4
        };

    var _init = function (item) {
        var element = $(item);
        if (!element.data("vali.validation")) {
            var option = $.extend({}, _option, $.parseJSON(element.attr("validation")));
            element.data("vali.validation", option);
            _cache[option.group] = _cache[option.group] || [];
            if ($.inArray(element.get(0), _cache[option.group]) === -1) {
                _cache[option.group].push(element.get(0));
            }
        }
    };

    var _destory = function (item) {
        var element = $(item);
        element.removeData("vali.validation", null);
        for (var group in _cache) {
            $.each(_cache[group], function (index, target) {
                if (target === item) {
                    _cache[group].splice(index, 1);
                    return false;
                }
            });
        }
    };

    var _validate = function (obj, callback) {
        var result = true,
            msg = "",
            element = $(obj),
            option = element.data("vali.validation");
        if (!option) return true;
        $(option.rules).each(function (index, item) {
            var isOr = _$.vali.test("IsOr", item[0]);
            if (isOr && result) return false;
            else if (!isOr && !result) return true;
            else {
                if (isOr) result = true;
                var rule = isOr ? _$.vali.rules[item[0].slice(2)] : _$.vali.rules[item[0]];
                if (rule === undefined) {
                    return true;
                }
                var resultFlag = rule.method.call(element, element.val(), item.concat().slice(1));
                if (!resultFlag) {
                    result = false;
                    msg = option.msg === undefined ? undefined : option.msg[isOr ? item[0].slice(2) : item[0]];
                    msg = _$.stringFormat(msg === undefined ? _$.vali.rules[isOr ? item[0].slice(2) : item[0]].msg : msg, item.concat().slice(1));
                }
            }
        });
        if (!result) {
            _errors.push({
                "item": element,
                "msg": msg,
                "tag": option.tag
            });
        }
        return result;
    };

    var _processError = function () {
        if (!_errors[0]) {
            return;
        }
        var element = $(_errors[0].item);
        if (!element.length) {
            return;
        }
        option = element.data("vali.validation");
        if (option.autoFocus) {
            element.focus();
        }
        if (option.autoScroll) {
            _$.ui.scrollto(element);
        }
        if (option.autoBlink) {
            _$.ui.blink(element);
        }
        if (option.autoShake) {
            _$.ui.shake(element);
        }
    };

    var _processErrors = function () {
        var msg = "";
        if (_errors.length && _option.autoAlert) {
            var count = _option.autoAlert;
            $.each(_errors, function (index, item) {
                if (item.msg && count) {
                    msg += (item.tag || "错误") + ":    " + (item.msg) + "\r\n";
                    count--;
                } else if (count === 0) {
                    msg += "等共计  " + _errors.length + "  个错误......";
                    return false;
                }
            });
            alert(msg);
        }
    };

    $.extend(_$.vali, {
        //只有初始化之前有效
        valiSetup: function (params) {
            $.extend(_option, params);
        },
        appendNewRule: function (name, fun, msg) {
            _$.vali.rules[name] = {
                method: fun,
                msg: msg
            };
        },
        test: function (name, value, params) {
            var rule = _$.vali.rules[name];
            if (!rule || !$.isFunction(rule.method)) return false;
            return rule.method.call(this, value, params);
        },
        //jquery元素(组)、区域或不传
        init: function (area) {
            var items = (area instanceof jQuery) ? area.find("[validation]").andSelf("[validation]") : $("*[validation]");
            items.each(function (index, item) {
                _init(item);
            });
        },

        //jquery元素(组)、区域、group、不传
        destory: function (area) {
            var items;
            if (area instanceof jQuery) {
                items = area.find("[validation]").andSelf("[validation]");
            } else if (typeof area === "string") {
                items = $(_cache[area]);
            } else {
                items = $("*[validation]");
            }
            items.each(function (index, item) {
                _destory(item);
            });
            return items.length;
        },

        getLastErrors: function (item) {
            return _errors;
        },
        validate: function (items, callback) {
            _errors = [];
            if (items instanceof jQuery) {
                //vali by element
                items.each(function (index, item) {
                    _validate(item);
                });
            } else {
                //vali by group
                var group = items ? items : _option.group;
                $(_cache[group]).filter(_option.target).each(function (index, item) {
                    _validate(item);
                });
            }
            _processErrors();
            _processError();
            return _errors.length;
        }
    });

})();

/*************************************************************
* infosky.rules
*------------------------------------------------------------
* Author: Chenhy(curarpiktchen@hotmail.com)
* Create Date: 2013-04-15
************************************************************/

(function () {
    _$.vali.appendNewRule("IsMoney", function (value) {
        return (/^(-)?(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/).test(value);
    }, "请输入货币格式");
    _$.vali.appendNewRule("IsTime", function (value) {
        return (/^([01]\d|2[0-3])(:[0-5]\d){0,2}$/).test(value);
    }, "请输入时间格式，00:00 至 23:59");
    _$.vali.appendNewRule("IsAWBNo", function (value) {
        var array = value.split("-");
        if (array[0].length != 3) {
            return false;
        }
        var awbNo = array[1].replace(" ", "");
        if (awbNo.length != 8) {
            return false;
        }
        return (awbNo.substr(0, 7) % 7 == awbNo.substr(7, 1));
    }, "请输入正确的运单格式");
    _$.vali.appendNewRule("IsFloat2", function (value) {
        return (/^\d*(\d(\.\d{1,2})?)?$/).test(value);
    }, "请输入整数或者最多2位小数");
    _$.vali.appendNewRule("IsDate", function (value) {
        return (/((^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([3579][26]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)$)|(^\s{0}$))/).test(value);
    }, "日期格式不正确");
})();


/*************************************************************
* infosky.tag
*------------------------------------------------------------
* Author: Chenhy(curarpiktchen@hotmail.com)
* Create Date: 2013-05-13
************************************************************/

(function () {
    _$ = _$ || {};
    _$.tag = function (item) {
        this.item = item;
    };

    var _option = {
        element: "<span class='tag-span'>{0}<span class='tag-delete'>x</span></span>",
        wordWidth: 8,
        repeatable: false,
        repeatclear: true
    };

    var _init = function (obj, option) {
        $(obj).data("tag.option", option)
            .on("keydown.tag", function (e) {
                switch (e.keyCode) {
                    case 8:
                        //退格
                    case 37:
                        _toLeft(obj, e, option);
                        break;
                    case 39:
                        _toRight(obj, option);
                        break;
                    case 9:
                        _tabClick(obj, e, option);
                        break;
                    case 13:
                    case 32:
                        //回车，空格
                        _add(obj, null, option);
                        e.preventDefault();
                        break;
                    case 59:
                        _add(obj, null, option);
                        e.preventDefault();
                        break;
                    default:
                        break;
                }
                _setWidth($(this), option);
            }).on("keyup.tag", function () {
                _setWidth($(this), option);
            }).on("blur.tag", function () {
                // _add($(this));
                // _setInputAtLast($(this));
                if ($(obj).val().length === 0) {
                    _setInputAtLast($(obj), option);
                }
            }).parent().on("click.tag", function (e) {
                if ($(obj).val().length === 0) {
                    _setInputAtLast($(obj), option);
                }
                $(obj).focus();
                if (option.onfocus) {
                    option.onfocus(e);
                }
            });
    };

    var _toLeft = function (obj, e, option) {
        var caret = _$.caret(obj);
        if (caret.begin === 0 && caret.end === 0) {
            if ($(obj).prev().is(".tag-span")) {
                _setToEdit($(obj).prev(), option);
                e.preventDefault();
            }
        }
    };

    var _toRight = function (obj, option) {
        var caret = _$.caret(obj);
        if (caret.begin === $(obj).val().length) {
            if ($(obj).next().is(".tag-span")) {
                _setToEdit($(obj).next(), option);
            } else {
                _add(obj, null, option);
            }
        }
    };

    var _tabClick = function (obj, e, option) {
        if ($(obj).next().is(".tag-span")) {
            _setToEdit($(obj).next(), option);
            e.preventDefault();
        } else {
            if ($(obj).val())
                e.preventDefault();
            _add(obj, null, option);
        }
    };

    var _add = function (obj, text, option) {
        option = option || $(obj).data("tag.option");
        text = text || $.trim($(obj).val());
        if (!option.repeatable) {
            var objs = _getTag(obj, text);
            if (objs.length) {
                _$.ui.blink(objs);
                if (option.repeatclear)
                    $(obj).val("");
                return;
            }
        }
        if (text.length) {
            $(obj).before($(_$.stringFormat(option.element, text)).data("tag.val", text));
            $(obj).val("").prev()
                .on("click.tag", function () {
                    _setToEdit(this, option);
                }).find(".tag-delete")
                .on("click.tag", function (event) {
                    $(this).parent().siblings("input").focus();
                    $(this).parent().remove();
                    event.stopPropagation();
                });
        }
    };

    var _remove = function (obj, text) {
        var objs = _getTag(obj, text);
        $(objs).remove();
        return objs.length;
    };

    var _getTag = function (obj, text) {
        return $.grep($(obj).siblings(".tag-span").toArray(), function (item, index) {
            return $(item).data("tag.val") === text;
        });
    };

    var _delete = function (obj) {
        var text = $(obj).val();
        if (text.length === 0) $(obj).prev(".tag-container span").remove();
    };

    var _setWidth = function (obj, option) {
        if ($(obj).is("input")) {
            var text = $(obj).val();
            var count = text.replace(/[^\u0000-\u00ff]/g, "aa").length;
            $(obj).css("width", (count * option.wordWidth + 12) + "px");
        }
    };

    var _destory = function (obj) {
        $(obj).siblings(".tag-span").remove();
        $(obj).off(".tag");
    };

    var _setToEdit = function (span, option) {
        var input = $(span).siblings("input");
        _add(input, null, option);
        input.detach();
        var text = $(span).data("tag.val");
        $(span).replaceWith(input.val(text));
        _setWidth(input, option);
        _$.caret(input.get(0), text ? text.length : 0);
        input.focus();
    };

    var _setInputAtLast = function (obj) {
        if ($(obj).next().is(".tag-span")) {
            $(obj).siblings().last().after($(obj).detach());
        }
    };

    $.extend(_$.tag, {
        tagSetup: function (params) {
            $.extend(_option, params);
        },
        init: function (obj, option) {
            if (obj instanceof jQuery) {
                obj.filter("input").each(function (index, item) {
                    var opt = $.extend({}, _option, option);
                    _init(item, opt);
                    _$.tag.setValue(item);
                });
            }
        },
        destory: function (obj) {
            if (obj instanceof jQuery) {
                obj.each(function (index, item) {
                    _destory($(item));
                });
            }
        },
        getValue: function (obj, format) {
            var result = [];
            $(obj).siblings(".tag-span").each(function (index, item) {
                result.push($(item).data("tag.val"));
            });
            return format ? result.join(format) : result;
        },
        setValue: function (obj, values, sp) {
            values = values || $(obj).val();
            if (values) {
                sp = sp; //|| ' ';
                var array = values.split(sp);
                $.each(array, function (index, item) {
                    _add(obj, item);
                });
            }
        },
        add: function (obj, text) {
            _add(obj, text);
        },
        remove: function (obj, text) {
            return _remove(obj, text);
        }
    });
})();


/*************************************************************
* infosky.auto
*------------------------------------------------------------
* Author: Chenhy(curarpiktchen@hotmail.com)
* Create Date: 2013-05-13
************************************************************/

(function () {
    _$ = _$ || {};
    _$.auto = function (item) {
        this.item = item;
    };

    var _item = "<li class='{3}'><span class='spanRight'>{4}</br>{2}</span><span>{0}</br>{1}</span></li>",
        _title = "<div class='autoTitle'><span class='autoSummary'>共匹配到<b>{2}</b>项</span><span class='autoValue'><b>{0}</b></span><span class='autoType'>{1}</span></div>",
        _sortArea = "<div class='autoSort'><a class='sortContent'><span>排序</span><ul></ul></a></div>",
        _sortItem = "<li class='{1}'>{0}</li>",
        _paginationArea = "<div class='autoPagination'><ul></ul></div>",
        _paginationItem = "<li class='{1}'><a>{0}</a></li>",
        _option = {
            popID: "autoDiv",
            popClass: "autoDiv",
            optChar: ['@', '|', '^'], //分隔符、匹配符、非匹配符
            pagination: {
                pageSize: 10, //每页个数
                pageIndex: 1, //当前页数
                pageCount: 0, //总页数
                totalCount: 0, //总匹配数
                paginationSize: 5 //显示分页个数,请选择奇数
            },
            sort: 4,
            sortGroup: [{
                title: "默认排序", //不排序(ie6,7推荐关闭排序功能)
                index: 0
            }, {
                title: "按中文排序",
                index: 1
            }, {
                title: "按英文排序",
                index: 2
            }, {
                title: "按拼音排序",
                index: 3
            }, {
                title: "按三字码排序",
                index: 4
            }
            ],
            sortEnable: true,
            showFormat: [1, 2, 4],
            directThreeWord: 4,
            hint: "全拼、三字码、英文、中文",
            keyFocus: -1
        };

    var _init = function (option) {
        var obj = option.element;
        $(document).off("click.auto").on("click.auto", function (e) {
            $("#" + option.popID).hide();
        });
        $(obj).on("click.auto", function (e) {
            //return false;
        }).on("keydown.auto", function (e) {
            switch (e.keyCode) {
                case 9: //tab
                    if ($("#" + option.popID + ":visible").length) {
                        _setVal(option, $("#" + option.popID).find(".keyFocus").first().data("autoData"), "tab");
                        e.preventDefault();
                    }
                    return;
                case 13:
                    //enter
                    if ($("#" + option.popID + ":visible").length) {
                        _setVal(option, $("#" + option.popID).find(".keyFocus").first().data("autoData"), "enter");
                        e.preventDefault();
                    }
                    return;
                case 38:
                    //↑
                    _toUp(option);
                    break;
                case 40:
                    //↓
                    _toDown(option);
                    break;
                case 33:
                    //pageUp
                    _prevPage(option);
                    break;
                case 34:
                    //pageDown
                    _nextPage(option);
                    break;
                default:
                    break;
            }
        }).on("keyup.auto", function (e) {
            switch (e.keyCode) {
                case 9:
                case 38:
                case 40:
                case 33:
                case 34:
                    //tab
                    //pageUp pageDown
                    //↑↓
                    return;
                case 13:
                    //enter
                    //_setVal(option, $("#" + option.popID).find(".keyFocus").data("autoData"), "enter");
                    return;
                default:
                    break;
            }
            var value = _$.trim($(this).val());
            option.value = value;
            option.keyFocus = -1;
            if (value) {
                option.filteredData = _filter(option, value);
                option.filteredData = _sort(option);
                _buildDirectVal(option);
                option.showData = _pagination(option);
                _show(option);
            } else {
                $("#" + option.popID).hide();
            }
        }).on("destory.auto", function () {
            _destory(option);
        });
    };

    var _setVal = function (option, data, eventType) {
        if (data) {
            $(option.element).val(data[4]);
            if (typeof option.callback === "function") {
                option.callback(data);
            }
        } else {
            var dir = $("#" + option.popID).find(".autoDataLi:visible").first();
            if ((eventType === "tab" || eventType === "enter") && dir.length) {
                $(option.element).val(dir.data("autoData")[4]);
                if (typeof option.callback === "function") {
                    option.callback(data);
                }
            }
        }
        $("#" + option.popID).hide();
    };

    var _toUp = function (option) {
        option.keyFocus--;
        if (option.keyFocus < 0) {
            var toPage = 0;
            if (!$("#" + option.popID).find(".keyFocus").length) {
                toPage = option.pagination.pageIndex;
            } else if (option.pagination.pageIndex > 1) {
                toPage = option.pagination.pageIndex - 1;
            } else if (option.pagination.pageCount > 1) {
                toPage = option.pagination.pageCount;
            } else {
                toPage = 1;
            }
            if (option.pagination.pageIndex === toPage) {
                $("#" + option.popID).find(".autoDataLi").last().addClass("keyFocus").siblings("li").removeClass("keyFocus");
                option.keyFocus = $("#" + option.popID).find(".autoDataLi").length - 1;
            } else {
                option.pagination.pageIndex = toPage;
                option.showData = _pagination(option);
                _show(option);
                $("#" + option.popID).find(".autoDataLi").last().addClass("keyFocus");
                option.keyFocus = $("#" + option.popID).find(".autoDataLi").length - 1;
            }
        } else {
            $("#" + option.popID).find(".autoDataLi").eq(option.keyFocus).addClass("keyFocus").siblings("li").removeClass("keyFocus");
        }
    };

    var _toDown = function (option) {
        option.keyFocus++;
        if (option.keyFocus > ($("#" + option.popID).find(".autoDataLi").length - 1)) {
            var toPage = 0;
            if (option.pagination.pageIndex < option.pagination.pageCount) {
                toPage = option.pagination.pageIndex + 1;
            } else if (option.pagination.pageCount >= 1) {
                toPage = 1;
            }
            if (option.pagination.pageIndex === toPage) {
                $("#" + option.popID).find(".autoDataLi").first().addClass("keyFocus").siblings("li").removeClass("keyFocus");
                option.keyFocus = 0;
            } else {
                option.pagination.pageIndex = toPage;
                option.showData = _pagination(option);
                _show(option);
                $("#" + option.popID).find(".autoDataLi").first().addClass("keyFocus");
                option.keyFocus = 0;
            }
        } else {
            $("#" + option.popID).find(".autoDataLi").eq(option.keyFocus).addClass("keyFocus").siblings("li").removeClass("keyFocus");
        }
    };

    var _nextPage = function (option) {
        if (option.pagination.pageCount <= 1) {
            $("#" + option.popID).find(".autoDataLi").last().addClass("keyFocus").siblings("li").removeClass("keyFocus");
        } else {
            option.pagination.pageIndex < option.pagination.pageCount ? (option.pagination.pageIndex++) : (option.pagination.pageIndex = 1);
            option.showData = _pagination(option);
            _show(option);
            option.keyFocus = 0;
        }
    };

    var _prevPage = function (option) {
        if (option.pagination.pageCount <= 1) {
            $("#" + option.popID).find(".autoDataLi").first().addClass("keyFocus").siblings("li").removeClass("keyFocus");
        } else {
            option.pagination.pageIndex !== 1 ? (option.pagination.pageIndex--) : (option.pagination.pageIndex = option.pagination.pageCount);
            option.showData = _pagination(option);
            _show(option);
            option.keyFocus = 0;
        }
    };

    var _buildSort = function (option) {
        if (option.sortEnable) {
            var sortArea = $(_sortArea);
            $.each(option.sortGroup, function (index, item) {
                var sortli = _$.stringFormat(_sortItem, item.title, item.index === option.sort ? "spli" : "");
                sortli = $(sortli).on("click", function () {
                    _sortTo(option, item.index);
                });
                sortArea.find("ul").append(sortli);
            });
            return sortArea;
        }
    };

    var _getReg = function (option, value, spchar) {
        try {
            if (value) {
                value = value.replace(/\s/, "\\s");
                return new RegExp("\\" + option.optChar[1] + value, "i");
            } else {
                return new RegExp("[\\" + option.optChar.join("\\") + "]");
            }
        } catch (e) {
            return new RegExp("[\\b]");
        }
    };

    var _destory = function (option) {
        $(option.element).off(".auto");
        $("#" + option.popID).remove();
    };

    var _filter = function (option, value) { //fastest
        var reg = _getReg(option, value);
        var array = [];
        for (var i = 0, j = option.oriData.length; i < j; i++) { //for loop fast than $.filter
            if (reg.test(option.oriData[i])) { //reg faster than indexOf
                array.push(option.oriData[i]);
            }
        }
        option.pagination.pageCount = Math.ceil(array.length / option.pagination.pageSize);
        return array;
    };

    var _buildDirectVal = function (option) {
        option.directVal = null;
        if (option.directThreeWord && option.value.length === 3) {
            var reg = _getReg(option);
            for (var i = 0, j = option.filteredData.length; i < j; i++) {
                var array = option.filteredData[i].split(reg);
                if (array[option.directThreeWord].toUpperCase() === option.value.toUpperCase()) {
                    option.directVal = option.filteredData[i];
                    return false;
                }
            }
        }
    };

    var _sort = function (option) {
        option.pagination.pageIndex = 1;
        if (!option.sortEnable || option.sort <= 0) { //sort is slowest in this plugin. 
            return option.filteredData; //if data is large and use ie6, please turn off sort. (set sortEnable false)
        }
        var reg = _getReg(option);
        return option.filteredData.sort(function (s, t) {
            var a = (s.split(reg)[option.sortGroup[option.sort].index]).toUpperCase();
            var b = (t.split(reg)[option.sortGroup[option.sort].index]).toUpperCase();
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        });
    };

    var _sortTo = function (option, sort) {
        if (option.sort === sort) {
            return;
        } else {
            option.sort = sort;
            option.filteredData = _sort(option);
            option.showData = _pagination(option);
            _buildDirectVal(option);
            _show(option);
        }
    };

    var _pagination = function (option) {
        var startIndex = (option.pagination.pageIndex - 1) * option.pagination.pageSize;
        var endIndex = startIndex + option.pagination.pageSize;
        startIndex = Math.max(0, startIndex);
        endIndex = Math.min(endIndex, option.filteredData.length);
        return option.filteredData.slice(startIndex, endIndex);
    };

    var _buildPagination = function (option) {
        var paginationArea = $(_paginationArea);
        var ulArea = paginationArea.find("ul");
        var index = option.pagination.pageIndex;
        var count = option.pagination.pageCount;
        var size = Math.min(option.pagination.paginationSize, count);
        if (count <= 1)
            return;
        ulArea.append(_bindPageFun(
            $(_$.stringFormat(_paginationItem, "<<", index === 1 ? "autoPagDis" : "")), 1, option, index !== 1));
        ulArea.append(_bindPageFun(
            $(_$.stringFormat(_paginationItem, "<", index === 1 ? "autoPagDis" : "")), index - 1, option, index !== 1));
        var shows = [index];
        while (shows.length < size) {
            var start = shows[0];
            var end = shows[shows.length - 1];
            if ((start - 1) > 0)
                shows.unshift(start - 1);
            if ((end + 1) <= count)
                shows.push(end + 1);
        }
        $.each(shows, function (num, item) {
            ulArea.append(_bindPageFun(
                $(_$.stringFormat(_paginationItem, item, item === index ? "autoPagDis num" : "")), item, option, item !== index));
        });
        ulArea.append(_bindPageFun(
            $(_$.stringFormat(_paginationItem, ">", index === count ? "autoPagDis" : "")), index + 1, option, index !== count));
        ulArea.append(_bindPageFun(
            $(_$.stringFormat(_paginationItem, ">>", index === count ? "autoPagDis" : "")), count, option, index !== count));
        return paginationArea;
    };

    var _bindPageFun = function (item, index, option, needed) {
        if (needed) {
            item.on("click.auto", function () {
                _goto(option, index);
            });
        }
        return item;
    };

    var _goto = function (option, index) {
        option.pagination.pageIndex = index;
        option.keyFocus = -1;
        option.showData = _pagination(option);
        _show(option);
    };

    var _replaceEM = function (str, option, format) {
        var val = option.value.replace(/\s/, "\\s");
        var reg = new RegExp("^" + val, "i");
        var result = str.replace(reg, function ($, $1) {
            return "<b>" + $ + "</b>";
        });
        return result;
    };

    var _show = function (option) {
        var popDiv = $("#" + option.popID);
        if (!popDiv.length) {
            popDiv = $("<div class='tptDiv " + option.popClass + "' id='" + option.popID + "'></div>");
            $("body").append(popDiv);
        }
        popDiv.on("click.auto", function (e) {
            option.element.focus();
            return false;
        });
        var position = $(option.element).offset();
        var top = position.top + $(option.element).height() + 5;
        var left = position.left;

        popDiv.css({
            "top": top + "px",
            "left": left + "px",
            "position": "absolute",
            "z-index": 200002
        });

        var data = $("<ul class='autoData'></ul>");
        data.append(_$.stringFormat(_title, option.value, option.sortEnable ? option.sortGroup[option.sort].title : "", option.filteredData.length));
        var reg = _getReg(option);
        if (option.directThreeWord && option.directVal) {
            var array = option.directVal.split(reg);
            var liItem = $(_$.stringFormat(_item,
                _replaceEM(option.showFormat[0] >= 0 ? array[option.showFormat[0]] : "", option),
                _replaceEM(option.showFormat[1] >= 0 ? array[option.showFormat[1]] : "", option),
                _replaceEM(option.showFormat[2] >= 0 ? array[option.showFormat[2]] : "", option),
                "spli autoDataLi", "三字码匹配"));
            liItem.data("autoData", array);
            data.append(liItem);
        }

        $.each(option.showData, function (index, item) {
            var array = item.split(reg);
            if (option.directThreeWord && option.directVal && option.directVal === item) {
                return;
            } else {
                var liItem = $(_$.stringFormat(_item,
                    _replaceEM(option.showFormat[0] >= 0 ? array[option.showFormat[0]] : "", option),
                    _replaceEM(option.showFormat[1] >= 0 ? array[option.showFormat[1]] : "", option),
                    _replaceEM(option.showFormat[2] >= 0 ? array[option.showFormat[2]] : "", option),
                    "autoDataLi", ""));
                liItem.data("autoData", array);
                data.append(liItem);
            }
        });
        data.find(".autoDataLi").on("click", function () {
            _setVal(option, $(this).data("autoData"), "click");
        });
        var sortArea = _buildSort(option);
        var paginationArea = _buildPagination(option);
        popDiv.html(data).prepend(sortArea).show().find(".autoData").append(paginationArea);
    };

    $.extend(_$.auto, {
        setup: function (params) {
            $.extend(_option, params);
        },
        init: function (obj, data, option) {
            option = $.extend({}, _option, option);
            if (data instanceof Array) {
                option.oriData = data;
            } else if (typeof data === "string") {
                option.oriData = data.split(option.optChar[0]);
            } else {
                return 0;
            }
            if (obj instanceof jQuery) {
                return obj.filter("input,textarea").each(function (index, item) {
                    option.element = item;
                    _init($.extend({}, option));
                }).length;
            }
        },
        destory: function (obj) {
            if (obj instanceof jQuery) {
                return obj.filter("input,textarea").each(function (index, item) {
                    $(item).trigger("destory.auto");
                }).length;
            }
        }
    });
})();

/*************************************************************
* infosky.select
*------------------------------------------------------------
* Author: Chenhy(curarpiktchen@hotmail.com)
* Create Date: 2013-05-24
************************************************************/

(function () {
    _$ = _$ || {};
    _$.select = function (item) {
        this.item = item;
    };

    var _liItem = "<li class='{1}'><span class='spanRight'>{2}{3}</span><span>{0}</span></li>",
        _menuArea = "<div class='autoSort'><a class='sortContent'><span>操作</span><ul></ul></a></div>",
        _menuItem = "<li class='{1}'>{0}</li>",
        _editArea = "<li class='editLi selectItem'><input type='text' class='editTxt'/><span><a class='editAdd'>添加</a></span></li>",
        _option = {
            editAble: true,
            muti: true,
            onchange: $.noop,
            optChar: ",",
            keyFocus: 0,
            clearAll: true,
            selectAll: true
        };

    var _init = function (option) {
        var element = option.input;
        var select = option.select;
        option.data = [];
        $(select).children().each(function (index, item) {
            if ($(item).is("optgroup")) {
                option.data.push({
                    nodeType: "group",
                    value: $(item).attr("label")
                });
                $(item).find("option").each(function (index, optItem) {
                    option.data.push({
                        nodeType: "option",
                        value: $(optItem).attr("value"),
                        key: $(optItem).html()
                    });
                });
            } else if ($(item).is("option")) {
                option.data.push({
                    nodeType: "option",
                    value: $(item).attr("value"),
                    key: $(item).html()
                });
            }
        });

        $(document).on("click.select", function (e) {
            if (option.popDiv) {
                if ($.contains(option.popDiv.get(0), e.target)) {
                    if ($(e.target).not(".editTxt")) {
                        return false;
                    }
                } else {
                    option.popDiv.hide();
                    $(option.menu).hide();
                }
            }
        });

        $(element).on("click.select", function () {
            _show(option);
            return false;
        }).on("keydown.select", function (e) {
            switch (e.keyCode) {
                case 9: //tab
                    option.popDiv.hide();
                    $(option.menu).hide();
                    return;
                case 38:
                    //↑
                    _toUp(option);
                    return false;
                case 40:
                    //↓
                    _toDown(option);
                    return false;
                case 13:
                    _enter(option);
                    break;
                case 27:
                    _esc(option);
                    break;
            }
        }).on("keyup.select", function (e) {
            switch (e.keyCode) {
                case 9: //tab
                    _show(option);
                    return;
            }
        }).attr({
            "readonly": "readonly",
            "autocomplete": "off"
        });
    };

    var _destory = function (input) {
        var data = $(input).data("select.option");
        if (data.popDiv)
            data.popDiv.hide();
        data = null;
        $(input).off(".select").removeData("select.option");
    };

    var _toUp = function (option) {
        if (!$(option.popDiv).is(":visible")) {
            _show(option);
        }
        option.keyFocus--;
        var items = option.popDiv.find(".selectItem");
        if (option.keyFocus <= 0) {
            option.keyFocus = items.length;
        }
        var item = items.removeClass("keyFocus").eq(option.keyFocus - 1).addClass("keyFocus");
        if (option.keyFocus === items.length) {
            _$.ui.scrollHelper(item.closest("div"), item, "bottom", "+2");
        } else {
            var height = item.offset().top - item.closest("div").offset().top;
            if (height < 0 || height > item.closest("div").height()) {
                _$.ui.scrollHelper(item.closest("div"), item, "top", "-2");
            }
        }
        if (item.is(".editLi")) {
            item.find(".editTxt").focus();
        }
    };

    var _toDown = function (option) {
        if (!$(option.popDiv).is(":visible")) {
            _show(option);
        }
        option.keyFocus++;
        var items = option.popDiv.find(".selectItem");
        if (option.keyFocus > items.length) {
            option.keyFocus = 1;
        }
        var item = items.removeClass("keyFocus").eq(option.keyFocus - 1).addClass("keyFocus");
        if (option.keyFocus === 1) {
            item.closest("div").scrollTop(0);
        } else {
            var height = item.offset().top - item.closest("div").offset().top;
            if ((height + 4) > item.closest("div").height()) {
                _$.ui.scrollHelper(item.closest("div"), item, "bottom", "+2");
            } else if (height < 0) {
                _$.ui.scrollHelper(item.closest("div"), item, "top", "-2");
            }
        }
        if (item.is(".editLi")) {
            item.find(".editTxt").focus();
        }
    };

    var _enter = function (option) {
        if (!$(option.popDiv).is(":visible")) {
            _show(option);
            return;
        }
        var items = option.popDiv.find(".selectItem");
        var item = items.eq(option.keyFocus - 1);
        item.trigger("click.select");
    };

    var _esc = function (option) {
        option.popDiv.hide();
        $(option.menu).hide();
    };

    var _bindLiItemEvent = function (option, liItem, e) {
        var data = null;
        if (option.muti) {
            $(option.input).val("");
            liItem.toggleClass("liSelected");
            var result = [];
            option.popDiv.find(".liSelected").each(function (index, item) {
                data = $(item).data("selectData");
                result.push(data.value);
                $(option.input).val(result.join(option.optChar));
            });
        } else {
            liItem.addClass("liSelected").siblings("li").removeClass("liSelected");
            data = liItem.data("selectData");
            $(option.input).val(data.value);
            option.popDiv.hide();
            $(option.menu).hide();
        }
        if (option.onchange) {
            option.onchange();
        }
    };

    var _bindLiEvent = function (option) {
        option.popDiv.find(".selectItem").on("click.select", function (e) {
            var liItem = $(this);
            _bindLiItemEvent(option, liItem, e);
        });
    };

    var _addLiItem = function (option, input) {
        var value = input.val();
        if (_$.isNullOrEmpty(value)) {
            _$.ui.blink(input);
            return;
        }
        input.val("");
        var liItem = $(_$.stringFormat(_liItem, value, "selectItem", value, ""));
        option.popDiv.find(">ul li:last").before(liItem);
        option.keyFocus++;
        liItem.on("click.select", function (e) {
            _bindLiItemEvent(option, liItem, e);
        }).data("selectData", {
            nodeType: "option",
            value: value,
            key: value
        }).trigger("click.select");
        _$.ui.scrollHelper(option.popDiv, input, "bottom", "+50");
        input.focus();
    };

    var _addLiItemWithoutTrigger = function (option, value) {
        var liItem = $(_$.stringFormat(_liItem, value, "selectItem", value, ""));
        option.popDiv.find("li:last").before(liItem);
        liItem.on("click.select", function (e) {
            _bindLiItemEvent(option, liItem, e);
        }).data("selectData", {
            nodeType: "option",
            value: value,
            key: value
        }).trigger("click.select");
    };

    var _bindEditEvent = function (option) {
        var addBtn = option.popDiv.find(".editAdd");
        var input = option.popDiv.find(".editTxt");
        addBtn.on("click.select", function (e) {
            _addLiItem(option, input);
        });
        input.on("keydown.select", function (e) {
            switch (e.keyCode) {
                case 13:
                    _addLiItem(option, input);
                    return;
                case 38:
                    //↑
                    _toUp(option);
                    option.input.focus();
                    return false;
                case 40:
                    //↓
                    _toDown(option);
                    option.input.focus();
                    return false;
                    //tab
                    //esc
                case 9:
                case 27:
                    option.input.focus();
                    option.popDiv.hide();
                    $(option.menu).hide();
                    break;
            }
        });
    };

    var _buildMenu = function (option, top, left, width) {
        var menu, menuItem;
        if (option.clearAll || option.selectAll) {
            option.menu = option.menu || $(_menuArea);
            option.menu.css({
                top: top + "px",
                left: left + width + 1 + "px",
                position: "absolute",
                "z-index": 200003
            }).addClass("tptDiv selectSort");
            var area = option.popDiv.find("ul");
            if (!$.contains($("body").get(0), option.menu.get(0))) {
                $("body").append(option.menu);
                if (option.clearAll) {
                    menuItem = $(_$.stringFormat(_menuItem, "全部取消", ""));
                    menuItem.on("click.select", function () {
                        area.find(".selectItem").removeClass("liSelected");
                        $(option.input).val("");
                    });
                    option.menu.find("ul").append(menuItem);
                }
                if (option.selectAll) {
                    menuItem = $(_$.stringFormat(_menuItem, "全部选中", ""));
                    menuItem.on("click.select", function () {
                        area.find(".selectItem").not(".editLi").addClass("liSelected");
                        var result = [];
                        option.popDiv.find(".liSelected").each(function (index, item) {
                            data = $(item).data("selectData");
                            result.push(data.value);
                            $(option.input).val(result.join(option.optChar));
                        });
                    });
                    option.menu.find("ul").append(menuItem);
                }
            }
            option.menu.show();
        }
    };

    var _show = function (option) {
        if (!option.popDiv) {
            option.keyFocus = 0;
            option.popDiv = $("<div class='tptDiv selectDiv'><ul></ul></div>");
            var ulArea = option.popDiv.find(">ul");
            $.each(option.data, function (index, item) {
                var li = null;
                if (item.nodeType === "group") {
                    li = _$.stringFormat(_liItem, item.value, "selectGroup spliHold", "", "");
                } else if (item.nodeType === "option") {
                    li = $(_$.stringFormat(_liItem, item.key, "selectItem", item.value, ""));
                    li.data("selectData", item);
                }
                ulArea.append(li);
            });
            option.popDiv.on("click.select", function (e) {
                if ($.contains(option.popDiv.find(".editLi").get(0), e.target)) {
                    $(".editTxt").focus();
                    return false;
                } else {
                    $(option.input).focus();
                }
            });
            _bindLiEvent(option);
            if (option.editAble) {
                var editTitle = _$.stringFormat(_liItem, "自定义值", "selectGroup spliHold", "", "");
                ulArea.append(editTitle).append($(_editArea));
                _bindEditEvent(option);
            }
            $("body").append(option.popDiv);
        }
        var position = option.position ? $(option.position).offset() : $(option.input).offset();
        var top = position.top + (option.position ? $(option.position).height() : $(option.input).height()) + 5;
        var left = position.left;

        $(".tptDiv.selectDiv,.autoSort.tptDiv.selectSort").not(option.popDiv).not(option.menu).hide();

        option.popDiv.css({
            "top": top + "px",
            "left": left + "px",
            "position": "absolute",
            "z-index": 200002
        }).show().find(".keyFocus").removeClass("keyFocus");

        var width = option.popDiv.width();
        _buildMenu(option, top, left, width);
    };

    var _triggerShow = function (input) {
        $(input).trigger("click.select");
    };

    var _setVal = function (input, value) {
        var varArray = value.split(",");
        var option = input.data("select.option");
        if (!option.popDiv) {
            _show(option);
            option.popDiv.hide();
            $(option.menu).hide();
        }
        var lis = option.popDiv.find(".selectItem").not(".editLi");
        if (option.muti) {
            $.each(varArray, function (index, item) {
                if (!item || _$.trim(item) === "")
                    return;
                var flag = false;
                lis.each(function (index, liItem) {
                    var li = $(liItem);
                    if (li.is(".liSelected")) {
                        return;
                    } else {
                        var data = li.data("selectData");
                        if (data.value === item) {
                            li.trigger("click.select");
                            flag = true;
                            return false;
                        }
                        return;
                    }
                });
                if (!flag && option.editAble) {
                    _addLiItemWithoutTrigger(option, item);
                }
            });
        } else {
            var flag = false;
            lis.each(function (index, liItem) {
                var li = $(liItem);
                var data = li.data("selectData");
                if (data.value === value) {
                    flag = true;
                    li.trigger("click.select");
                    option.keyFocus = li.prevAll(".selectItem").length + 1;
                    _$.ui.scrollHelper(li.closest("div"), li, "bottom", "+" + li.closest("div").outerHeight() / 2);
                    return false;
                }
            });
            if (!flag && option.editAble) {
                option.keyFocus = lis.length + 1;
                _addLiItemWithoutTrigger(option, value);
                _$.ui.scrollHelper(lis.first().closest("div"), lis.last(), "bottom", "+80");
            }
        }
    };

    $.extend(_$.select, {
        init: function (input, select, option) {
            option = $.extend({}, _option, option);
            if ($(select).is("select")) {
                if (input instanceof jQuery) {
                    return input.filter("input").each(function (index, item) {
                        var opt = $.extend({}, option);
                        opt.input = item;
                        opt.select = select;
                        $(input).data("select.option", opt);
                        _init(opt);
                    }).length;
                }
            }
            return 0;
        },
        destory: function (input) {
            if (input instanceof jQuery) {
                return input.filter("input").each(function (index, item) {
                    _destory($(item));
                });
            }
        },
        setValue: function (input, value) {
            if (input instanceof jQuery) {
                return input.filter("input").each(function (index, item) {
                    if (value === undefined)
                        value = $(item).val();
                    _setVal($(item), value);
                });
            }
        },
        show: function (input) {
            _triggerShow(input);
        }
    });
})();

/*************************************************************
* infosky.tree
*------------------------------------------------------------
* Author: Chenhy(curarpiktchen@hotmail.com)
* Create Date: 2013-06-05
************************************************************/

(function () {
    _$ = _$ || {};
    _$.tree = function (item) {
        this.item = item;
    };

    var _nodeTemp = "<li class='treeNode'></li>",
        _nodeIcon = "<div class='nodeIcon {0}'></div>",
        _containerTemp = "<ul></ul>",
        _nodeContent = "<a class='nodeTitle'>{0}</a>",
        _option = {
            container: null,
            checkbox: true,
            open: true,
            contextMenu: true,
            onDelete: null,
            onSelect: null,
            lazyLoad: false,
            lazyUp: true
        };

    var _init = function (option, data) {
        if (option.lazyLoad) {
            option.open = false;
        }
        var tree = _buildTree(option, data, null, 0);
        tree.data("tree.option", option);
        _bindEvent(option, tree);
        if (option.checkbox) {
            _bindCheckEvent(tree);
        }
        if (option.onSelect) {
            _bindClickEvent(option, tree);
        }
        if (option.contextMenu) {
            _bindContextMenu(option, tree);
        }
        option.container.append(tree);
    };

    var _hash = {}, _hashKey = 0;

    var _buildTree = function (option, nodes, parent, layer, lastTree, lazyTrick) {
        if (option.lazyLoad && layer >= 1 && !lazyTrick) {
            var key = _hashKey++;
            _hash["" + key] = nodes;
            parent.data("tree.lazyLoad", key);
            return;
        }
        var tree = $(_containerTemp);
        if (!option.open && layer >= 1 && !lazyTrick)
            tree.hide();
        if (parent)
            parent.append(tree.addClass("subTree"));
        else
            tree.addClass("rootTree");

        if (lastTree)
            tree.addClass("lastNode");

        for (var i = 0; i < nodes.length; i++) {
            _buildTreeNode(option, nodes[i], tree, layer, i === nodes.length - 1, i === 0);
        }
        tree.find(".checkOne").each(function (index, item) {
            _processParentCheck($(item));
        });
        return tree;
    };

    var _buildTreeNode = function (option, node, parent, layer, lastNode, firstNode) {
        var nodeItem = $(_nodeTemp);
        var hasChild = node.children && node.children.length;
        if (hasChild) {
            nodeIcon = _buildTreeNodePrefix(option.open ? "folderClose" : "folderOpen", lastNode, layer > 0 ? false : firstNode);
            nodeItem.append(nodeIcon);
            nodeIcon = _buildTreeNodePrefix(option.open ? "folderItemClose" : "folderItemOpen", lastNode);
        } else {
            nodeIcon = _buildTreeNodePrefix("leaf", lastNode);
            nodeItem.append(nodeIcon);
            nodeIcon = _buildTreeNodePrefix("leafItem", lastNode);
        }

        nodeItem.append(nodeIcon);

        if (option.checkbox) {
            if (hasChild) {
                nodeIcon = _buildTreeNodePrefix("checkNone");
            } else {
                nodeIcon = _buildTreeNodePrefix(node.checked ? "checkOne" : "checkNone");
            }
            nodeItem.append(nodeIcon);
        }

        nodeItem.append($(_$.stringFormat(_nodeContent, node.title)));
        nodeItem.data("tree.data", node);

        parent.append(nodeItem);

        if (hasChild) {
            _buildTree(option, node.children, nodeItem, layer + 1, lastNode);
        }
    };

    var _buildTreeNodePrefix = function (type, lastNode, firstNode) {
        result = $(_$.stringFormat(_nodeIcon, type));
        if (firstNode)
            result.addClass("first");
        if (lastNode)
            result.addClass("last");
        return result;
    };

    var _bindEvent = function (option, tree) {
        $(tree).on("click.tree", ".folderClose,.folderOpen", function () {
            if ($(this).is(".folderClose")) {
                $(this).removeClass("folderClose").addClass("folderOpen").next().removeClass("folderItemClose")
                    .addClass("folderItemOpen").siblings("ul").hide();
            } else {
                $(this).removeClass("folderOpen").addClass("folderClose").next().removeClass("folderItemOpen")
                    .addClass("folderItemClose").siblings("ul").show();
                if (option.lazyLoad) {
                    var item = $(this).parent();
                    var key = item.data("tree.lazyLoad");
                    data = _hash[key];
                    if (data) {
                        delete (_hash[key]);
                        _buildTree(option, data, item, 4, !item.next().is("li"), true);
                    }
                    if (option.checkbox) {
                        var box = $(this).siblings(".checkOne,.checkNone,.checkHalf");
                        option.lazyUp ?
                            _processSubCheck(box) :
                            _processParentCheck(box.siblings(".subTree")
                            .find(">.treeNode").first()
                            .find(".checkOne,.checkNone,.checkHalf"));
                    }
                }
            }
        });
    };

    var _bindCheckEvent = function (tree) {
        $(tree).on("click.tree", ".nodeTitle", function () {
            $(this).prev().trigger("click.tree");
        });
        $(tree).on("click.tree", ".checkNone,.checkOne,.checkHalf", function () {
            if ($(this).is(".checkNone,.checkHalf")) {
                $(this).addClass("checkOne").removeClass("checkNone checkHalf");
            } else {
                $(this).addClass("checkNone").removeClass("checkOne");
            }
            _processSubCheck($(this));
            _processParentCheck($(this));
        });
    };

    var _processSubCheck = function (node) {
        if (node.is(".checkNone")) {
            node.siblings("ul").find(".checkOne,.checkHalf").removeClass("checkOne checkHalf")
                .addClass("checkNone");
        } else if (node.is(".checkOne")) {
            node.siblings("ul").find(".checkNone,.checkHalf").removeClass("checkNone checkHalf")
                .addClass("checkOne");
        }
    };

    var _processParentCheck = function (node) {
        var parentNode = node.closest(".subTree").siblings(".checkOne,.checkNone,.checkHalf");
        if (parentNode.length) {
            parentNode.removeClass("checkOne checkNone checkHalf");
            var checkOne = parentNode.siblings("ul").find(".checkOne").length;
            var checkNone = parentNode.siblings("ul").find(".checkNone").length;
            if (checkOne === 0) {
                parentNode.addClass("checkNone");
            } else if (checkNone === 0) {
                parentNode.addClass("checkOne");
            } else {
                parentNode.addClass("checkHalf");
            }
            _processParentCheck(parentNode);
        }
    };

    var _bindClickEvent = function (option, tree) {
        $(tree).on("click.tree", ".nodeTitle,.leafItem", function () {
            var data = $(this).closest(".treeNode").data("tree.data");
            option.onSelect(data);
        });
    };

    var _bindContextMenu = function (option, tree) {
        _$.menu.init($(tree), ".treeNode", {
            menuData: [{
                title: "delete",
                onclick: function (liItem, target) {
                    var treeNode = null;
                    if ($(target).is(".treeNode")) {
                        treeNode = $(target);
                    } else {
                        treeNode = $(target).closest(".treeNode");
                    }
                    treeParent = treeNode.parent();
                    treeNode = treeNode.detach();
                    _repaintTree($(tree), treeParent);
                    _recheckTree($(tree), treeParent, option);
                    if (typeof option.onDelete === "function") {
                        option.onDelete(treeNode);
                    }
                }
            }
            ],
            onMenu: function (target) {
                $(tree).find(".keyFocus").removeClass("keyFocus");
                if ($(target).is(".treeNode"))
                    $(target).addClass("keyFocus");
                else
                    $(target).closest(".treeNode").addClass("keyFocus");
            },
            onMenuOff: function () {
                $(tree).find(".keyFocus").removeClass("keyFocus");
            }
        });
    };

    var _repaintTree = function (tree, node, option) {
        var siblLis = $(node).find(">.treeNode");
        siblLis.last().find(">.subTree").addClass("lastNode");
        siblLis.last().find(">.nodeIcon").addClass("last");

        siblLis.first().find(">.subTree").addClass("first");
        siblLis.first().find(">.nodeIcon").addClass("first");
    };

    var _recheckTree = function (tree, node) {
        var liItem = $(node).closest(".treeNode");

        var checked = liItem.find(".nodeIcon.checkOne:not(:has(div))").length;
        var unchecked = liItem.find(".nodeIcon.checkNone:not(:has(div))").length;
        if (checked === 0 && unchecked === 0)
            return;
        else {
            var nodeItem = liItem.find(">.checkOne,>.checkHalf,>.checkNone");
            nodeItem.removeClass("checkNone checkOne checkHalf");
            if (checked === 0 && unchecked > 0)
                nodeItem.addClass("checkNone");
            else if (checked > 0 && unchecked === 0)
                nodeItem.addClass("checkOne");
            else
                nodeItem.addClass("checkHalf");
        }
        _recheckTree(tree, liItem.closest(".subTree"));
    };

    var _recheckAllTree = function (option, tree) {
        $(tree).find(">.treeNode").each(function (index, item) {
            var liItem = $(item);
            var node = liItem.find(">.checkOne,>.checkHalf,>.checkNone");
            var checked = liItem.find(".nodeIcon.checkOne:not(:has(div))").length;
            var unchecked = liItem.find(".nodeIcon.checkNone:not(:has(div))").length;
            if (checked === 0 && unchecked === 0)
                return;
            else {
                node.removeClass("checkNone checkOne checkHalf");
                if (checked === 0 && unchecked > 0)
                    node.addClass("checkNone");
                else if (checked > 0 && unchecked === 0)
                    node.addClass("checkOne");
                else
                    node.addClass("checkHalf");
            }
            _recheckTree(option, liItem.find(">.subTree"));
        });
    };

    var _getValueForMuti = function (option, tree, ids) {
        var result = [];
        $(tree).find(".checkOne").each(function (index, item) {
            var target = $(item);
            if (target.prev().is(".leafItem")) {
                var data = target.closest("li").data("tree.data");
                result.push(ids ? data.id : data);
            }
        });
        return result;
    };

    var _getTree = function (tree, list) {
        list = list || [];
        $(tree).find(">.treeNode").each(function (index, item) {
            var data = $(item).data("tree.data");
            data.children = [];
            data.checked = $(item).find(".checkOne").length > 0;
            var subTree = $(item).find(">.subTree");

            list.push(data);
            if (subTree.length) {
                data.children = data.children || [];
                subTree.each(function (subIndex, subItem) {
                    _getTree($(subItem), data.children);
                });
            }
        });
        return list;
    };

    $.extend(_$.tree, {
        init: function (data, option) {
            option = $.extend({}, _option, option);
            var _data = null;
            if (data instanceof Array) {
                _data = $.extend(true, [], data);
            } else {
                _data = $.extend(true, {}, data);
            }
            _init(option, _data);
        },
        getValue: function (container, ids) {
            var tree = $(container).find(".rootTree");
            var opt = tree.data("tree.option");
            if (opt.checkbox) {
                return _getValueForMuti(opt, tree, ids);
            }
        },
        getTree: function (container) {
            var tree = $(container).find(".rootTree");
            return _getTree(tree);
        }
    });
})();

/*************************************************************
* infosky.menu
*------------------------------------------------------------
* Author: Chenhy(curarpiktchen@hotmail.com)
* Create Date: 2013-06-04
************************************************************/

(function () {
    _$ = _$ || {};
    _$.menu = function (item) {
        this.item = item;
    };

    var _menuArea = "<div class='tptDiv'><ul class='menuContainer'></ul></div>",
        _menuItem = "<li><span>{0}</span></li>",
        _option = {
            menuData: []
        };

    var _init = function (area, target, option) {
        var menu = $(_menuArea).hide();
        $.each(option.menuData, function (index, data) {
            var liItem = $(_$.stringFormat(_menuItem, data.title));
            liItem.on("click.menu", function (e) {
                if (data.onclick) {
                    data.onclick($(this), menu.data("menu.target"));
                }
                menu.hide();
            });
            menu.find("ul").append(liItem);
        });

        $("body").append(menu);

        area.on("contextmenu", target, function (e) {
            menu.css({
                "top": e.clientY + $(window).scrollTop() + "px",
                "left": e.clientX + $(window).scrollLeft() + "px",
                "position": "absolute",
                "z-index": 200002
            }).data("menu.target", e.target).show();
            if (option.onMenu) {
                option.onMenu(e.target);
            }
            return false;
        });

        $(document).on("click.menu", function () {
            menu.hide();
            if (option.onMenuOff) {
                option.onMenuOff();
            }
        });
    };

    $.extend(_$.menu, {
        init: function (area, target, option) {
            option = $.extend({}, _option, option);
            _init(area, target, option);
        }
    });
})();

/*************************************************************
* infosky.placeholder
*------------------------------------------------------------
* Author: Chenhy(curarpiktchen@hotmail.com)
* Create Date: 2013-06-08
************************************************************/

(function () {
    _$ = _$ || {};
    _$.placeholder = function (item) {
        this.item = item;
    };

    var _option = {
        placeholderClass: "placeholder"
    };

    var _init = function (element, option) {
        if (!element.is("input[type='text'],textarea"))
            return;
        var pdVal = element.attr("placeholder");
        if (element.val() === pdVal)
            element.addClass(option.placeholderClass);
        else if (element.val() === "")
            element.addClass(option.placeholderClass).val(pdVal);
        else
            element.removeClass(option.placeholderClass);
        element.on("focus.placeholder clear.placeholder", function () {
            element.removeClass(option.placeholderClass);
            if (element.val() === pdVal) {
                element.val("");
            }
        }).on("blur.placeholder reset.placeholder", function () {
            if (element.val() === "" || element.val() === pdVal) {
                element.addClass(option.placeholderClass).val(pdVal);
            }
        });
    };

    var _clear = function (element) {
        element.trigger("clear.placeholder");
    };

    var _reset = function (element) {
        element.trigger("reset.placeholder");
    };

    var _supportNative = function () {
        return 'placeholder' in document.createElement('input');
    };

    $.extend(_$.placeholder, {
        init: function (target, option) {
            if (_supportNative())
                return;
            option = $.extend({}, _option, option);
            $(target).each(function (index, item) {
                _init($(item), option);
            });
        },
        clear: function (target) {
            if (_supportNative())
                return;
            $(target).each(function (index, item) {
                _clear($(item));
            });
        },
        reset: function (target) {
            if (_supportNative())
                return;
            $(target).each(function (index, item) {
                _reset($(item));
            });
        }
    });
})();

/*************************************************************
* infosky.tip
*------------------------------------------------------------
* Author: Chenhy(curarpiktchen@hotmail.com)
* Create Date: 2013-06-05
************************************************************/

(function () {
    _$ = _$ || {};
    _$.tip = function (item) {
        this.item = item;
    };

    var _option = {},
        _tip = "<div class='tip'><p>{0}</p></div>";

    var _init = function (item, option) {
        var content = $(item).attr("title");
        if (content) {
            $(item).data("tip.title", content);
            _bindEvent($(item), content, option);
        }
    };

    var _bindEvent = function (item, content, option) {
        item.hover(function () {
            item.attr("title", "");
            _show(item, content, option);
        }, function () {
            item.attr("title", content);
            _hide(item);
        });
    };

    var _show = function (item, content, option) {
        var poptip = item.data("tip.poptip");
        if (!poptip) {
            poptip = $(_$.stringFormat(_tip, content));
            $("body").append(poptip);
            item.data("tip.poptip", poptip);
        }

        var position = item.offset();
        var top = position.top + item.height() + 5;
        var left = position.left;
        poptip.css({
            "top": top + "px",
            "left": left + "px",
            "position": "absolute",
            "z-index": 200002
        }).show();
    };

    var _hide = function (item) {
        var poptip = item.data("tip.poptip");
        poptip.hide();
    };

    $.extend(_$.tip, {
        init: function (area, option) {
            option = $.extend({}, _option, option);
            var items = (area instanceof jQuery) ? area.find("[title]").andSelf("[title]") : $("*[title]");
            items.each(function (index, item) {
                _init(item, option);
            });
        }
    });
})();

