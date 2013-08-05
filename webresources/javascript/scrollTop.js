(function(){
	var item = $("<a id='scrollTop'>&nbsp;</a>");
	item.on("click",function(){
		_$.ui.scrollto(0);
	});
	$("body").append(item);
})();