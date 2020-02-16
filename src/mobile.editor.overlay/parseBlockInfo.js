/**
 * @param {string} blockinfo
 * @return {Object}
 */
module.exports = function parseBlockInfo( blockinfo ) {
	var blockInfo, expiry, reason, expiryInSeconds,
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
			url: null
		},
		expiry: null,
		duration: null,
		reason: '',
		blockId: blockinfo.blockid
	};

	// URL only useful if block creator is a local user
	if ( blockinfo.blockedbyid === 0 ) {
		blockInfo.creator.url = '';
	} else {
		blockInfo.creator.url = mw.Title.makeTitle(
			mw.config.get( 'wgNamespaceIds' ).user,
			blockInfo.creator.name
		).getUrl();
	}

	expiry = blockinfo.blockexpiry;
	if ( [ 'infinite', 'indefinite', 'infinity', 'never' ].indexOf( expiry ) === -1 ) {
		expiryInSeconds = moment( expiry ).diff( moment(), 'seconds' );

		if ( expiryInSeconds <= 86400 ) {
			// For 24 hour blocks/or remaining expiry time and less, show both date and time
			blockInfo.expiry = mw.message( 'parentheses', moment( expiry ).format( 'LL, LT' ) ).escaped();
		} else {
			blockInfo.expiry = mw.message( 'parentheses', moment( expiry ).format( 'LL' ) ).escaped();
		}
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
