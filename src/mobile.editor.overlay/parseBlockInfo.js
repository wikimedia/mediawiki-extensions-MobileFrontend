var util = require( '../mobile.startup/util' );

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
		},
		expiry = blockinfo.blockexpiry,
		reason = blockinfo.blockreason,
		moment = window.moment;

	// Workaround to parse a message parameter for mw.message, see T96885
	function jqueryMsgParse( wikitext ) {
		// eslint-disable-next-line new-cap
		const parser = new mw.jqueryMsg.parser();
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

	if ( [ 'infinite', 'indefinite', 'infinity', 'never' ].indexOf( expiry ) === -1 && moment ) {
		if ( moment( expiry ).diff( moment(), 'seconds' ) <= 86400 ) {
			// For 24 hour blocks/or remaining expiry time and less, show both date and time
			blockInfo.expiry = mw.message( 'parentheses', moment( expiry ).format( 'LL, LT' ) ).escaped();
		} else {
			blockInfo.expiry = mw.message( 'parentheses', moment( expiry ).format( 'LL' ) ).escaped();
		}
		blockInfo.duration = moment().to( expiry, true );
	}

	if ( reason ) {
		blockInfo.reason = jqueryMsgParse( reason ) || mw.html.escape( reason );
		blockInfo.parsedReason = ( new mw.Api() ).get( {
			action: 'parse',
			formatversion: 2,
			text: reason,
			contentmodel: 'wikitext'
		} ).then( function ( result ) {
			return result.parse.text;
		} ).catch( function () {
			return jqueryMsgParse( reason ) || mw.html.escape( reason );
		} );
	} else {
		blockInfo.reason = mw.message( 'mobile-frontend-editor-generic-block-reason' ).escaped();
		blockInfo.parsedReason = util.Deferred().resolve( blockInfo.reason ).promise();
	}

	return blockInfo;
};
