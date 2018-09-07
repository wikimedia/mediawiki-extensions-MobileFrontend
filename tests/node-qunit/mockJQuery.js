function MockJQuery() {
	this.arr = [];
	this.arr.find = function () {
		return [];
	};

	return this.arr;
}

module.exports = function () {
	return new MockJQuery();
};
