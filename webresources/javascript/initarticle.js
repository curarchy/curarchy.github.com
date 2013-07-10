(function() {
	var title = "<h2>{{title}}</h2><p>{{time}}</p>";
	var id = _$.getParameterByName("id");
	var article = _$.programmingres.getArticleById(id);
	title = _$.stringFormat(title, article);
	$("#articleTitle").append(title);
})();