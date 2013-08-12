(function() {
	_$.api = _$.api || {};
	_$.api.weather = _$.api.weather || {};

	var urls = {
		proxy: "http://query.yahooapis.com/v1/public/yql",
		provincial: "\"http://www.weather.com.cn/data/list3/city.xml?level=1\"",
		_city: "\"http://www.weather.com.cn/data/list3/city{0}.xml?level=2\"",
		district: "\"http://www.weather.com.cn/data/list3/city{0}.xml?level=3\"",
		weather: "\"http://m.weather.com.cn/data/{0}.html\"",
		current: "\"http://www.weather.com.cn/data/sk/{0}.html\"",

		//----------------------
		china: "\"http://flash.weather.com.cn/wmaps/xml/{0}.xml\"",
		small: "http://m.weather.com.cn/img/c{0}.gif",
		smallPicBaseUrl:"http://m.weather.com.cn/img/c"
	};

	var _processData = function(data, callback) {
		if (callback && data.query.results && data.query.results.body.p.length) {
			var result = [];
			var array = data.query.results.body.p.split(',');
			$.each(array, function(index, item) {
				result.push({
					key: item.split('|')[0],
					val: item.split('|')[1]
				});
			});
			callback(result);
		}
	};

	$.extend(_$.api.weather, {

		getPic: function(key, size) {
			key = key || 0;
			size = size || "small";
			return _$.stringFormat(urls[size], key);
		},

		getPicBase:function(){
			return urls.smallPicBaseUrl;
		},

		//获取区域天气
		getChina: function(callback, pinyin) {
			var url = _$.stringFormat(urls.china, pinyin || "china");
			$.getJSON(urls.proxy, {
				q: "select * from xml where url=" + url,
				format: "json"
			}, function(data, type) {
				if (data && type === "success" && callback) {
					if (data.query.count) {
						for (var a in data.query.results) {
							callback(data.query.results[a].city);
						}
					} else {
						callback();
					}
				}
			});
		},

		//获取天气详细
		getWeather: function(id, callback) {
			$.getJSON(urls.proxy, {
				q: "select * from json where url=" + _$.stringFormat(urls.weather, id),
				format: "json"
			}, function(data) {
				if (data && callback) {
					if (data.query.count) {
						callback(data.query.results.weatherinfo);
					} else {

					}
				}
			});
		},

		//获取当前天气
		getCurrent: function(id, callback) {
			$.getJSON(urls.proxy, {
				q: "select * from json where url=" + _$.stringFormat(urls.current, id),
				format: "json"
			}, function(data) {
				if (data && callback) {
					callback(data.query.results.weatherinfo);
				}
			});
		}
	});
})();