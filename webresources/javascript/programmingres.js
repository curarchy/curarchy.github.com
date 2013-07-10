(function() {
	var programmingcontent = [{
			title: "这是测试的第三篇文章",
			summary: "主要测试List/Block切换",
			key: "201307091",
			tag: ["test", "website"],
			img: ""
		}, {
			title: "这是测试的第二篇文章,title比较长，不知道会发生啥。。。。。。。。。。。。。。。。",
			summary: "主要测试超长的title和summary，所以这里会长一点长一点长一点长一点长一点长一点长一点长一点长一点",
			key: "201307081",
			tag: ["test", "website"],
			img: ""
		}, {
			title: "这是测试的第一篇文章",
			summary: "主要测试跳转是否正常，列表是否显示正常。",
			key: "201307082",
			tag: ["test", "website"],
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