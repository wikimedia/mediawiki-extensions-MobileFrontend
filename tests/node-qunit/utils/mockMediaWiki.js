var
	/* eslint-disable camelcase */
	namespaceIDs = {
		special: -1,
		talk: 1,
		user_talk: 3,
		project: 4,
		project_talk: 5
	}; /* eslint-enable camelcase */

function Api() {}
Api.prototype.get = function () {};
Api.prototype.post = function () {};
Api.prototype.getToken = function () {};
Api.prototype.postWithToken = function () {};

module.exports = function newMockMediaWiki() {
	var config = { wgNamespaceIds: namespaceIDs };
	return {
		Api: Api,
		Title: {
			makeTitle: function () {}
		},
		config: {
			get: function ( name, fallback ) {
				return config[name] || fallback;
			}
		},
		confirmCloseWindow: function () {},
		hook: function () {
			return {
				fire: function () {}
			};
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
		jqueryMsg: {
			parser: function () {}
		},
		language: {
			convertNumber: function () {}
		},
		log: {
			deprecate: function () {},
			warn: function () {}
		},
		msg: function ( id ) { return id; },
		message: function ( id ) {
			return {
				parse: function () {
					return id;
				}
			};
		},
		now: Date.now.bind( Date ),
		user: {
			tokens: {
				get: function () {}
			},
			options: {
				get: function () {}
			},
			isAnon: function () {},
			generateRandomSessionId: function () { return Math.random().toString(); }
		},
		track: function () {},
		util: { getUrl: function ( title ) { return title; } },
		loader: {
			load: function () {},
			using: function () {},
			require: function () {
				return {};
			}
		},
		requestIdleCallback: function ( fn ) {
			return fn();
		},
		storage: {
			get: function () {},
			set: function () {},
			remove: function () {}
		},
		notify: function () {}
	};
};
