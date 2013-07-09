(function() {
	window._$ = window._$ || {};

	var listTemplate = "<pre>" +
		"<p>{{title}}</p>" +
		"<p>{{summary}}</p>" +
		"</pre>";

	_$.programminglist = {
		init: function() {
			var data = _$.programmingres.getList();
			$.each(data, function(index, item) {
				var str = _$.stringFormat(listTemplate, item);
				$("#listarea").append($(str));
			});
		}
	};
})();