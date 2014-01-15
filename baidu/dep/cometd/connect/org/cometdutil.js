/**
 * 
 * @file cometd需要的一些工具对象
 * @author wangyaqiong
 */

define(
    function () {
    	var cometdutil = {};

		cometdutil.isString = function (value) {
		    if (value === undefined || value === null) {
		        return false;
		    }
		    return typeof value === 'string' ||  value instanceof String;
		};

		cometdutil.isArray = function (value) {
		    if (value === undefined || value === null) {
		        return false;
		    }
		    return value instanceof Array;
		};

		
		cometdutil.inArray = function (element, array) {
		    for (var i = 0; i < array.length; ++i) {
		        if (element === array[i]) {
		            return i;
		        }
		    }
		    return -1;
		};

		cometdutil.setTimeout = function (cometd, funktion, delay) {
		    return window.setTimeout(function ()
		    {
		        try
		        {
		            funktion();
		        }
		        catch (x)
		        {
		            
		        }
		    }, delay);
		};

		cometdutil.clearTimeout = function (timeoutHandle) {
		    window.clearTimeout(timeoutHandle);
		};

		cometdutil.derive = function (baseObject) {
		    function F() {}
		    F.prototype = baseObject;
		    return new F();
		};

		return cometdutil;
    }
);