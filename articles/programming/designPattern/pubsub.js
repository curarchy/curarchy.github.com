var pubsub = {};

(function(q) {
	var topics = {},
		subUid = -1;

	q.publish = function(topic, args) {
		if (!topics[topic]) {
			return false;
		}
		var sub = topics[topic],
			len = sub ? sub.length : 0;
		while (len--) {
			sub[len].func(topic, args);
		}
	};

	q.subscribe = function(topic, func) {
		topics[topic] = topics[topic] || [];
		var token = (++subUid) + "";
		topics[topic].push({
			token: token,
			func: func
		});
		return token;
	};

	q.unsubscribe = function(token) {
		for (var m in topics) {
			if (topics[m]) {
				for (var i = 0, j = topics[m].length; i < j; i++) {
					if (topics[m][i].token === token) {
						topics[m].splice(i, 1);
						return token;
					}
				}
			}
		}
		return this;
	};
})(pubsub);