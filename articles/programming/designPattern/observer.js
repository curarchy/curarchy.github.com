//观察者
function Observer() {
	this.Update = function() {};
}

//被观察对象内的观察者队列
function ObserverList() {
	this.observerList = [];
}

ObserverList.prototype.Add = function(obj) {
	return this.observerList.push(obj);
};

ObserverList.prototype.Empty = function() {
	this.observerList = [];
};

ObserverList.prototype.Count = function() {
	return this.observerList.length;
};

ObserverList.prototype.RemoverAt = function(index) {
	this.observerList.splice(index, 1);
};

ObserverList.prototype.Get = function(index) {
	return this.observerList[index];
};

ObserverList.prototype.Insert = function(obj, index) {
	this.observerList.splice(index, 0, obj);
};

ObserverList.prototype.IndexOf = function(obj) {
	while (i < this.observerList.length) {
		if (this.observerList[i] === obj)
			return i;
		i++;
	}
	return -1;
};

//被观察对象

function Subject() {
	this.observers = new ObserverList();
}

Subject.prototype.AddObserver = function(observer) {
	this.observers.Add(observer);
};

Subject.prototype.RemoveObserver = function(observer) {
	this.observers.RemoverAt(this.observers.IndexOf(observer));
};

Subject.prototype.Notify = function(context) {
	var observerCount = this.observers.Count();
	for (var i = 0; i < observerCount; i++) {
		this.observers.Get(i).Update(context);
	}
};