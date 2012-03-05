<?php

class ApiQueryExcerpts extends ApiQueryBase {
	/**
	 * @var ParserOptions
	 */
	private $parserOptions;

	public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName, 'ex' );
	}

	public function execute() {
		wfProfileIn( __METHOD__ );
		$titles = $this->getPageSet()->getGoodTitles();
		if ( count( $titles ) == 0 ) {
			wfProfileOut( __METHOD__ );
			return;
		}
		$params = $this->extractRequestParams();
		$continue = 0;
		if ( isset( $params['continue'] ) ) {
			$continue = intval( $params['continue'] );
			if ( $continue < 0 || $continue > count( $titles ) ) {
				$this->dieUsageMsg( '_badcontinue' );
			}
			$titles = array_slice( $titles, $continue, null, true );
		}
		$count = 0;
		foreach ( $titles as $id => $t ) {
			if ( ++$count > $params['limit'] ) {
				$this->setContinueEnumParameter( 'continue', $continue + $count - 1 );
				break;
			}
			$text = $this->getExcerpt( $t, $params['plaintext'] );
			if ( isset( $params['length'] ) ) {
				$text = $this->trimText( $text, $params['length'], $params['plaintext'] );
			}
			$fit = $this->addPageSubItem( $id, $text );
			if ( !$fit ) {
				$this->setContinueEnumParameter( 'continue', $continue + $count - 1 );
				break;
			}
		}
		wfProfileOut( __METHOD__ );
	}

	/**
	 * Returns a processed, but not trimmed excerpt
	 * @param Title $title
	 * @return string 
	 */
	private function getExcerpt( Title $title, $plainText ) {
		global $wgMemc;

		wfProfileIn( __METHOD__ );
		$page = WikiPage::factory( $title );
		$key = wfMemcKey( 'mf', 'excerpt', $plainText, $title->getArticleID(), $page->getLatest() );
		$text = $wgMemc->get( $key );
		if ( $text !== false ) {
			wfProfileOut( __METHOD__ );
			return $text;
		}
		$text = $this->parse( $page );
		$text = $this->convertText( $text, $title, $plainText );
		$wgMemc->set( $key, $text );
		wfProfileOut( __METHOD__ );
		return $text;
	}

	/**
	 * Returns HTML of page's zeroth section
	 * @param WikiPage $page
	 * @return string
	 */
	private function parse( WikiPage $page ) {
		wfProfileIn( __METHOD__ );
		if ( !$this->parserOptions ) {
			$this->parserOptions = new ParserOptions( new User( '127.0.0.1' ) );
		}
		// first try finding full page in parser cache
		if ( $page->isParserCacheUsed( $this->parserOptions, 0 ) ) {
			$pout = ParserCache::singleton()->get( $page, $this->parserOptions );
			if ( $pout ) {
				$text = $pout->getText();
				$s = preg_replace( '/<h[1-6].*$/s', '', $text );
				wfProfileOut( __METHOD__ );
				return $s;
			}
		}
		// in case of cache miss, render just the needed section
		$apiMain = new ApiMain( new FauxRequest(
			array( 'page' => $page->getTitle()->getPrefixedText(), 'section' => 0, 'prop' => 'text' ) )
		);
		$apiParse = new ApiParse( $apiMain, 'parse' );
		$apiParse->execute();
		$data = $apiParse->getResultData();
		wfProfileOut( __METHOD__ );
		return $data['parse']['text']['*'];
	}

	/**
	 * Converts page HTML into an excerpt
	 * @param string $text
	 * @param Title $title
	 * @param bool $plainText
	 * @return string 
	 */
	private function convertText( $text, Title $title, $plainText ) {
		wfProfileIn( __METHOD__ );
		$mf = new MobileFormatter( MobileFormatter::wrapHTML( $text, false ), $title, 'XHTML' );
		$mf->removeImages();
		$mf->remove( array( 'table', 'div', 'sup.reference', 'span.coordinates',
			'span.geo-multi-punct', 'span.geo-nondefault', '.noexcerpt' )
		);
		if ( $plainText ) {
			$mf->flatten( '[?!]?[a-z0-9]+' );
		} else {
			$mf->flatten( array( 'span', 'a' ) );
		}
		$mf->filterContent();
		$text = $mf->getText();
		$text = preg_replace( '/<!--.*?-->|^.*?<body>|<\/body>.*$/s', '', $text );
		if ( $plainText ) {
			$text = html_entity_decode( $text );
		}
		wfProfileOut( __METHOD__ );
		return trim( $text );
	}

	/**
	 * 
	 * @param string $text
	 * @param int $requestedLength
	 * @param bool $plainText
	 * @return string
	 */
	private function trimText( $text, $requestedLength, $plainText ) {
		global $wgUseTidy;

		wfProfileIn( __METHOD__ );
		$length = mb_strlen( $text );
		if ( $length <= $requestedLength ) {
			wfProfileOut( __METHOD__ );
			return $text;
		}
		$pattern = "#^.{{$requestedLength}}[\\w/]*>?#su";
		preg_match( $pattern, $text, $m );
		$text = $m[0];
		// Fix possibly unclosed tags
		if ( $wgUseTidy && !$plainText ) {
			$text = trim ( MWTidy::tidy( $text ) );
		}
		$text .= wfMessage( 'ellipsis' )->inContentLanguage()->text();
		wfProfileOut( __METHOD__ );
		return $text;
	}

	public function getAllowedParams() {
		return array(
			'length' => array(
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_MIN => 1,
			),
			'limit' => array(
				ApiBase::PARAM_DFLT => 1,
				ApiBase::PARAM_TYPE => 'limit',
				ApiBase::PARAM_MIN => 1,
				ApiBase::PARAM_MAX => 10,
				ApiBase::PARAM_MAX2 => 20,
			),
			'plaintext' => false,
			'continue' => array(
				ApiBase::PARAM_TYPE => 'integer',
			),
		);
	}

	public function getParamDescription() {
		return array(
			'length' => 'How many characters to return, actual text returned might be slightly longer.',
			'limit' => 'How many excerpts to return',
			'plaintext' => 'Return excerpts as plaintext instead of limited HTML',
			'continue' => 'When more results are available, use this to continue',
		);
	}

	public function getDescription() {
		return 'Returns excerpts of the given page(s)';
	}

	public function getPossibleErrors() {
		return array_merge( parent::getPossibleErrors(), array(
			array( 'code' => '_badcontinue', 'info' => 'Invalid continue param. You should pass the original value returned by the previous query' ),
		) );
	}

	public function getExamples() {
		return array(
			'api.php?action=query&prop=excerpt&length=175&titles=Therion' => 'Get a 175-character excerpt',
		);
	}


	public function getHelpUrls() {
		return 'https://www.mediawiki.org/wiki/Extension:MobileFrontend#New_API';
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}
}


