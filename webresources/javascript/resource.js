(function() {
	//var baseUrl = "http://curarchy.github.io";
	var baseUrl = "http://localhost:8712";

	var urls = {
		header: "/usercontrols/header.htm",
		footer: "/usercontrols/footer.htm",
		nav: "/usercontrols/nav.htm",
		weiboshow: "/usercontrols/weiboshow.htm",
		"2013070401": "/usercontrols/mainarea/2013070401.htm",
		xiami: "/usercontrols/xiami.htm",
		programmingnav: "/usercontrols/programming/nav.htm",
		programminglist: "/usercontrols/programming/list.htm",
		programming: "/articles/programming/",
		entertainment: "/articles/entertainment/",
		comment: "/usercontrols/comment.htm",
		local:"/usercontrols/tools/weather/local.htm"
	};

	window._$ = window._$ || {};

	_$.resource = {
		get: function(key, noprefix) {
			if (urls[key])
				return (noprefix ? "" : baseUrl) + urls[key];
			else
				return "";
		},
		loadHtml: function(key, area, param) {
			var url = this.get(key);
			if (url) {
				switch (key) {
					case "header":
						area.load(url, function() {
							$("#header .nav .active").removeClass("active");
							$("#header .nav").find("." + param).addClass("active");
						});
						break;
					default:
						area.load(url);
				}
			}
		},
		loadArticle: function(key, area, type) {
			var url = this.get(type);
			if (url) {
				url = url + key + ".htm";
				area.load(url, function() {
					$.getScript("/webresources/javascript/initarticle.js");
				});
			}
		},
		extendUrl: function(data) {
			if (data) {
				$.extend(urls, data);
			}
		}
	};
})();