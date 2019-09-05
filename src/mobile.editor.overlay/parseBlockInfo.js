/**
 * @param {string} blockinfo
 * @return {Object}
 */
module.exports = function parseBlockInfo( blockinfo ) {
	var blockInfo, expiry, reason,
		moment = window.moment;

	// Workaround to parse a message parameter for mw.message, see T96885
	function jqueryMsgParse( wikitext ) {
		var parser, ast;
		// eslint-disable-next-line new-cap
		parser = new mw.jqueryMsg.parser();
		try {
			ast = parser.wikiTextToAst( wikitext );
			return parser.emitter.emit( ast ).html();
		} catch ( e ) {
			// Ignore error as it's probably the parser error. Usually this is because we
			// can't parse templates.
			return false;
		}
	}

	blockInfo = {
		partial: blockinfo.blockpartial || false,
		creator: {
			name: blockinfo.blockedby,
			url: mw.Title.makeTitle(
				mw.config.get( 'wgNamespaceIds' ).user,
				blockinfo.blockedby
			).getUrl()
		},
		expiry: null,
		duration: null,
		reason: '',
		blockId: blockinfo.blockid
	};

	expiry = blockinfo.blockexpiry;
	if ( [ 'infinite', 'indefinite', 'infinity', 'never' ].indexOf( expiry ) === -1 ) {
		blockInfo.expiry = moment( expiry ).format( 'LLL' );
		blockInfo.duration = moment().to( expiry, true );
	}

	reason = blockinfo.blockreason;
	if ( reason ) {
		blockInfo.reason = jqueryMsgParse( reason ) || mw.html.escape( reason );
	} else {
		blockInfo.reason = mw.message( 'mobile-frontend-editor-generic-block-reason' ).escaped();
	}

	return blockInfo;
};
