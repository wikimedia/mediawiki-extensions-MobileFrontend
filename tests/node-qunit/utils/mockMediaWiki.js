/* eslint-disable camelcase */
var namespaceIDs = {
	special: -1,
	talk: 1,
	user_talk: 3,
	project: 4,
	project_talk: 5
};
/* eslint-enable camelcase */

module.exports = function newMockMediaWiki() {
	var config = { wgNamespaceIds: namespaceIDs };
	return {
		config: {
			get: function ( name ) {
				return config[name];
			},
			set: function ( name, val ) {
				config[name] = val;
			}
		},
		html: {
			escape: function ( str ) {
				return str.replace( /['"<>&]/g, function ( char ) {
					switch ( char ) {
						case '\'': return '&#039;';
						case '"': return '&quot;';
						case '<': return '&lt;';
						case '>': return '&gt;';
						case '&': return '&amp;';
					}
				} );
			}
		},
		log: {
			deprecate: function () {}
		},
		msg: function ( id ) { return id; },
		now: Date.now.bind( Date ),
		template: { get: function () {} },
		user: {},
		util: { getUrl: function ( title ) { return title; } },
		loader: {
			using: function () {}
		}
	};
};
