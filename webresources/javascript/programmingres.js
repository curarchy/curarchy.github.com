(function() {
	var programmingcontent = [{
			title: "自动完成",
			summary: "自动完成 summary",
			key: "201307081",
			tag: ["jquery", "javascript"],
			img: ""
		}, {
			title: "test",
			summary: "summary test",
			key: "201307082",
			tag: ["jquery", "html"],
			img: ""
		}
	];

	window._$ = window._$ || {};

	_$.programmingres = {
		getList: function(count, begin) {
			count = count || 10;
			begin = begin || 0;
			return programmingcontent.slice(begin, count + begin);
		}
	};
})();