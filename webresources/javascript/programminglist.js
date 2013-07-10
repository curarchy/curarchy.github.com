(function() {
	window._$ = window._$ || {};

	var listTemplate = "<pre>" +
		"<h4 class='listtitle'><a>{{title}}</a></h4>" +
		"<p>{{summary}}</p>" +
		"<p class='listbottom clearfix'></p>"+
		"</pre>";

	var tagTemplate = "<span style='float:right;margin:0 4px;' class='label label-info'>{0}</span>";

	_$.programminglist = {
		init: function() {
			var data = _$.programmingres.getList();
			$.each(data, function(index, item) {
				var str = _$.stringFormat(listTemplate, item);
				var _str = $(str);
				if (item.tag && item.tag.length) {
					$.each(item.tag, function(index1, item1) {
						_str.find(".listbottom").append($(_$.stringFormat(tagTemplate, item1)));
					});
				}
				$("#listarea").append(_str);
			});
		}
	};
})();