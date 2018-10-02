module.exports = function newMockMediaWiki() {
	return {
		user: {},
		log: {
			deprecate: function () {}
		}
	};
};
