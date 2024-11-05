const util = require( '../mobile.startup/util' );

/**
 * @param {string} blockinfo
 * @return {Object}
 */
module.exports = function parseBlockInfo( blockinfo ) {
	const blockInfo = {
		partial: blockinfo.blockpartial || false,
		noCreateAccount: blockinfo.blocknocreate || false,
		anonOnly: blockinfo.blockanononly === undefined ? true : blockinfo.blockanononly,
		creator: {
			name: blockinfo.blockedby,
			url: null
		},
		expiry: null,
		duration: null,
		reason: '',
		blockId: blockinfo.blockid
	};

	// Workaround to parse a message parameter for mw.message, see T96885
	function jqueryMsgParse( wikitext ) {
		const parser = new mw.jqueryMsg.Parser();
		try {
			const ast = parser.wikiTextToAst( wikitext );
			return parser.emitter.emit( ast ).html();
		} catch ( e ) {
			// Ignore error as it's probably the parser error. Usually this is because we
			// can't parse templates.
			return false;
		}
	}

	// URL only useful if block creator is a local user
	if ( blockinfo.blockedbyid === 0 ) {
		blockInfo.creator.url = '';
	} else {
		blockInfo.creator.url = mw.Title.makeTitle(
			mw.config.get( 'wgNamespaceIds' ).user,
			blockInfo.creator.name
		).getUrl();
	}

	if ( [ 'infinite', 'indefinite', 'infinity', 'never' ].indexOf( blockinfo.blockexpiry ) === -1 ) {
		blockInfo.expiry = mw.message( 'parentheses', blockinfo.blockexpiryformatted ).escaped();
		blockInfo.duration = blockinfo.blockexpiryrelative;
	}

	const reason = blockinfo.blockreason;
	if ( reason ) {
		blockInfo.reason = jqueryMsgParse( reason ) || mw.html.escape( reason );
		blockInfo.parsedReason = ( new mw.Api() ).get( {
			action: 'parse',
			formatversion: 2,
			text: reason,
			contentmodel: 'wikitext'
		} ).then( ( result ) => result.parse.text ).catch( () => jqueryMsgParse( reason ) || mw.html.escape( reason ) );
	} else {
		blockInfo.reason = mw.message( 'mobile-frontend-editor-generic-block-reason' ).escaped();
		blockInfo.parsedReason = util.Deferred().resolve( blockInfo.reason ).promise();
	}

	return blockInfo;
};
