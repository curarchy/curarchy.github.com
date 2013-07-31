(function(root) {
	function guidGenerator() {
		return +new Date();
	}

	function Subscriber(fn, options, context) {
		if (!(this instanceof Subscriber)) {
			return new Subscriber(fn, options, context);
		} else {
			this.id = guidGenerator();
			this.fn = fn,
			this.options = options;
			this.topic = null;
		}
	}

	function Topic(namespace) {
		if (!(this instanceof Topic)) {
			return new Topic(namespace);
		} else {
			this.namespace = namespace || "";
			this._callbacks = [];
			this._topics = [];
			this.stopped = false;
		}
	}

	Topic.prototype = {
		AddSubscriber: function(fn, options, context) {
			var callbacks = new Subscriber(fn, options, context);
			this._callbacks.push(callbacks);
			callbacks.topic = this;
			return callbacks;
		},
		StopPropagation: function() {
			this.stopped = true;
		},
		GetSubscriber: function(identifier) {
			for (var x = 0, y = this._callbacks.length; x < y; x++) {
				if (this._callbacks[x].id == identifier || this._callbacks[x].fn == identifier) {
					return this._callbacks[x];
				}
			}

			for (var z in this._topics) {
				if (this._topics.hasOwnProperty(z)) {
					var sub = this._topics[z].GetSubscriber(identifier);
					if (sub !== undefined) {
						return sub;
					}

				}
			}
		},
		AddTopic: function(topic) {
			this._topics[topic] = new Topic((this.namespace ? this.namespace + ":" : "") + topic);
		},
		HasTopic: function(topic) {
			return this._topics.hasOwnProperty(topic);
		},
		ReturnTopic: function(topic) {
			return this._topics[topic];
		},
		RemoveSubscriber: function(identifier) {
			if (!identifier) {
				this._callbacks = [];
				for (var z in this._topics) {
					if (this._topics.hasOwnProperty(z))
						this._topics[z].RemoveSubscriber(identifier);
				}
			}
			for (var y = 0, x = this._callbacks.length; y < x; y++) {
				if (this._callbacks[y].fn == identifier || this.callback[y].id == identifier) {
					this._callbacks[y].topic = null;
					this._callbacks.splice(y, 1);
					x--;
					y--;
				}
			}
		},

		Publish: function(data) {
			for (var y = 0, x = this._callbacks.length; y < x; y++) {
				var callback = this._callbacks[y],
					l;
				callback.fn.apply(callback.context, data);
				l = this._callbacks.length;
				if (l < x) {
					y--;
					x = l;
				}
			}

			for (var z in this._topics) {
				if (!this.stopped) {
					if (this._topics.hasOwnProperty(z)) {
						this._topics[z].Publish(data);
					}
				}
			}
			this.stopped = false;
		}
	};

	function Mediator() {
		if (!(this instanceof Mediator)) {
			return new Mediator();
		} else {
			this._topics = new Topic("");
		}
	}

	Mediator.prototype = {
		GetTopic: function(namespace) {
			var topic = this._topics;
			var	namespaceHierarchy = namespace?(namespace+"").split(":"):"";

			if (namespace === "") {
				return topic;
			}

			if (namespaceHierarchy.length > 0) {
				for (var i = 0, j = namespaceHierarchy.length; i < j; i++) {

					if (!topic.HasTopic(namespaceHierarchy[i])) {
						topic.AddTopic(namespaceHierarchy[i]);
					}

					topic = topic.ReturnTopic(namespaceHierarchy[i]);
				}
			}

			return topic;
		},

		Subscribe: function(topicName, fn, options, context) {
			var options = options||{},
				context = context||{},
				topic = this.GetTopic(topicName),
				sub = topic.AddSubscriber(fn, options, context);
			return sub;
		},

		GetSubscriber: function(identifier, topic) {
			return this.GetTopic(topic || "").GetSubscriber(identifier);
		},

		Remove: function(topicName, identifier) {
			this.GetTopic(topicName).RemoveSubscriber(identifier);
		},

		Publish: function(topicName) {
			var args = Array.prototype.slice.call(arguments, 1),
				topic = this.GetTopic(topicName);
			args.push(topic);
			this.GetTopic(topicName).Publish(args);
		}
	};

	root.Mediator = Mediator;
	Mediator.Topic = Topic;
	Mediator.Subscriber = Subscriber;
})(window);