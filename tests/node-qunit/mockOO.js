function newMockOO() {
	return {
		EventEmitter: function () {},
		mixinClass: function ( c ) {
			return c;
		}
	};
}

module.exports = newMockOO;
