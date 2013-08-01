(function() {
	var programmingcontent = [{
		title: "大数据量XML解析",
		summary: "自动完成控件数据源为1.8M的XML",
		time: "2013-08-01",
		key: "201308011",
		tag: ["jquery","插件","xml","性能"]
	},{
		title: "ie8,table中input的宽度bug",
		summary: "修复ie8,table中input的宽度随输入撑开的bug",
		time: "2013-07-31",
		key: "201307311",
		tag: ["css","ie8"]
	},{
		title: "初试Avalon",
		summary: "试水一下Avalon",
		time: "2013-07-26",
		key: "mvvm/avalon/201307261",
		tag: ["javascript","Avalon","MVVM"]
	},{
		title: "中介者模式",
		summary: "javascript设计模式————中介者模式",
		time: "2013-07-24",
		key: "designPattern/TheMediatorPattern",
		tag: ["javascript","设计模式"]
	},{
		title: "发布、订阅",
		summary: "javascript设计模式————发布、订阅",
		time: "2013-07-23",
		key: "designPattern/ThePubSubPattern",
		tag: ["javascript","设计模式"]
	},{
		title: "观察者模式",
		summary: "javascript设计模式————观察者模式",
		time: "2013-07-22",
		key: "designPattern/TheObserverPattern",
		tag: ["javascript","设计模式"]
	},{
		title: "MutiSelect插件",
		summary: "下拉框多选插件",
		time: "2013-07-15",
		key: "201307151",
		tag: ["jquery","插件"]
	},{
		title: "标签插件",
		summary: "标签插件，用于输入多个标签",
		time: "2013-07-12",
		key: "201307121",
		tag: ["jquery","插件"]
	},{
		title: "自动完成插件",
		summary: "航站选择的自动完成插件",
		time: "2013-07-11",
		key: "201307111",
		tag: ["jquery","插件"]
	}, {
		title: "文章发布系统完成",
		summary: "目前已经初步完成文章发布系统。",
		time: "2013-07-10",
		key: "201307101",
		tag: ["website"]
	}, {
		title: "这是测试的第三篇文章",
		summary: "主要测试List/Block切换,测试正文是否可以显示",
		time: "2013-07-09",
		key: "201307091",
		tag: ["test", "website"]
	}, {
		title: "这是测试的第二篇文章,title比较长，不知道会发生啥。。。。。。。。。。。。。。。。",
		summary: "主要测试超长的title和summary，所以这里会长一点长一点长一点长一点长一点长一点长一点长一点长一点",
		time: "2013-07-08",
		key: "201307081",
		tag: ["test", "website"]
	}, {
		title: "这是测试的第一篇文章",
		summary: "主要测试跳转是否正常，列表是否显示正常。",
		time: "2013-07-08",
		key: "201307082",
		tag: ["test", "website"]
	}];

	window._$ = window._$ || {};

	_$.programmingres = {
		getList: function(count, begin) {
			count = count || 10;
			begin = begin || 0;
			return programmingcontent.slice(begin, count + begin);
		},
		getArticleById: function(id) {
			var result = null;
			$.each(programmingcontent, function(index, item) {
				if (item.key === id) {
					result = item;
					return false;
				}
			});
			return result;
		}
	};
})();