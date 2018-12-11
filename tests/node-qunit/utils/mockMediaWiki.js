var
	/* eslint-disable camelcase */
	namespaceIDs = {
		special: -1,
		talk: 1,
		user_talk: 3,
		project: 4,
		project_talk: 5
	}, /* eslint-enable camelcase */
	hogan = require( 'hogan.js' ),
	path = require( 'path' ),
	fs = require( 'fs' ),
	resourceLoaderModules = require( '../../../extension.json' ).ResourceModules;

module.exports = function newMockMediaWiki() {
	var config = { wgNamespaceIds: namespaceIDs };
	return {
		Api: function () {
			return {
				get: function () {},
				postWithToken: function () {}
			};
		},
		config: {
			get: function ( name, fallback ) {
				return config[name] || fallback;
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
		template: {
			// This template stub assumes templates will all be hogan files
			// and locatable.
			get: function ( rlModule, name ) {
				var templatePath = resourceLoaderModules[ rlModule ].templates[ name ],
					rootPath = path.resolve( __dirname, '../../../' ),
					templateString = fs.readFileSync(
						path.join( rootPath, templatePath ),
						'utf8'
					);
				return hogan.compile( templateString );
			},
			compile: function () {}
		},
		user: {
			isAnon: function () {}
		},
		util: { getUrl: function ( title ) { return title; } },
		loader: {
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
