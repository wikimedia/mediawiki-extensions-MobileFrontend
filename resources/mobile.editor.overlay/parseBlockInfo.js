const util = require( 'mobile.startup' ).util;

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

	function parseReason( wikitext ) {
		return ( new mw.Api() ).get( {
			action: 'parse',
			formatversion: 2,
			text: wikitext,
			contentmodel: 'wikitext'
		} )
			.then( ( result ) => result.parse.text )
			.catch( () => jqueryMsgParse( wikitext ) || mw.html.escape( wikitext ) );
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

	if ( !( [ 'infinite', 'indefinite', 'infinity', 'never' ].includes( blockinfo.blockexpiry ) ) ) {
		blockInfo.expiry = mw.message( 'parentheses', blockinfo.blockexpiryformatted ).escaped();
		blockInfo.duration = blockinfo.blockexpiryrelative;
	}

	const reason = blockinfo.blockreason;
	if ( reason ) {
		blockInfo.reason = jqueryMsgParse( reason ) || mw.html.escape( reason );
		blockInfo.parsedReason = parseReason( reason );
	} else {
		blockInfo.reason = mw.message( 'mobile-frontend-editor-generic-block-reason' ).escaped();
		blockInfo.parsedReason = util.Deferred().resolve( blockInfo.reason ).promise();
	}

	if ( blockinfo.blockcomponents ) {
		// This is a composite block. The block reason will be the very
		// unhelpful "There are multiple blocks against your account and/or
		// IP address". However, the blockcomponents should explain every
		// part of the composite block. As such we can construct a more
		// useful message to the user by combining these. It might be
		// awkward to display given limited screen space, but that's better
		// than just bouncing a user with no information.
		const parsedReasons = [ blockInfo.parsedReason ];
		for ( const component of blockinfo.blockcomponents ) {
			parsedReasons.push( component.blockreason ?
				parseReason( component.blockreason ) :
				util.Deferred().resolve( '<div>' + mw.message( 'mobile-frontend-editor-generic-block-reason' ).escaped() + '</div>' ).promise() );
		}
		blockInfo.parsedReason = util.Promise.all( parsedReasons ).then( ( ...results ) => (
			// Results will be an array of HTML strings
			results.join( '\n' )
		) );
	}

	return blockInfo;
};
