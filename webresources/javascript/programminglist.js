(function() {
	window._$ = window._$ || {};

	var listTemplate = "<pre>" +
		"<h4 class='listtitle'><a href='/programmingarticle.htm?id={{key}}'>{{title}}</a></h4>" +
		"<p>{{summary}}</p>" +
		"<p class='listbottom clearfix'><span style='float:right;margin:0 4px;' class='label label-warning pull-right'>{{time}}</span></p>" +
		"</pre>";

	var tagTemplate = "<span style='float:right;margin:0 4px;' class='label label-info pull-right'>{0}</span>";

	var paginationTemplate = "<div class='pagination'><ul>{0}</ul></div>'";
	var paginationItemTemplate = "<li class='{2}'><a href='{0}'>{1}</a></li>";

	_$.programminglist = {
		init: function() {
			var pageSize = 10;
			var pageIndex = (+_$.getParameterByName("index")) || 0;
			var totalPage = Math.ceil(_$.programmingres.length() / pageSize);

			var data = _$.programmingres.getList(pageSize, (pageIndex) * pageSize);


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

			var pagination = this.buildPagination(pageIndex, totalPage);
			$("#listarea").append(pagination.clone(true).css({float:"right"}));
			$("#listarea").before(pagination.clone(true).css({margin:0,float:"right"}));
		},
		buildPagination: function(index, total) {
			var pages = "";
			pages += _$.stringFormat(paginationItemTemplate, "programming.htm?index=0", "begin", index === 0 ? "disabled" : "");
			for (var i = 0; i < total; i++) {
				pages += _$.stringFormat(paginationItemTemplate, "programming.htm?index=" + i, i + 1, index === i ? "disabled" : "");
			}
			pages += _$.stringFormat(paginationItemTemplate, "programming.htm?index=" + (total - 1), "end", index === (total - 1) ? "disabled" : "");
			var pagination = _$.stringFormat(paginationTemplate, pages);
			return $(pagination);
		}
	};
})();