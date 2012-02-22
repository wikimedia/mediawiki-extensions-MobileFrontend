<?php

class ApiQueryExcerpt extends ApiQueryBase {
	private $parserOptions;

	public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName, 'ex' );
	}

	public function execute() {
		$titles = $this->getPageSet()->getGoodTitles();
		if ( count( $titles ) == 0 ) {
			return;
		}
		$params = $this->extractRequestParams();
		foreach ( $titles as $id => $t ) {
			$text = $this->getExcerpt( $t );
			if ( isset( $params['length'] ) ) {
				$text = $this->trimText( $text, $params['length'] );
			}
			$this->addPageSubItem( $id, $text );
		}
	}

	private function getExcerpt( Title $title ) {
		global $wgMemc;

		$key = wfMemcKey( 'mf', 'excerpt', $title->getPrefixedDBkey(), $title->getArticleID() );
		$text = $wgMemc->get( $key );
		if ( $text !== false ) {
			return $text;
		}
		if ( !$this->parserOptions ) {
			$this->parserOptions = new ParserOptions( new User( '127.0.0.1' ) );
		}
		$wp = WikiPage::factory( $title );
		$pout = $wp->getParserOutput( $this->parserOptions );
		$text = $this->processText( $pout->getText(), $title );
		$wgMemc->set( $key, $text );
		return $text;
	}

	private function processText( $text, Title $title ) {
		$text = preg_replace( '/<h[1-6].*$/s', '', $text );
		$mf = new MobileFormatter( $text, $title, 'XHTML' );
		$mf->removeImages();
		$mf->remove( array( 'table', 'div', 'sup.reference', 'span.coordinates', 'span.geo-multi-punct', 'span.geo-nondefault' ) );
		$mf->flatten( array( 'span', 'a' ) );
		$mf->filterContent();
		$text = $mf->getText();
		$text = preg_replace( '/<!--.*?-->|^.*?<body>|<\/body>.*$/s', '', $text );
		return trim( $text );
	}

	private function trimText( $text, $requestedLength ) {
		$length = mb_strlen( $text );
		if ( $length <= $requestedLength ) {
			return $text;
		}
		$pattern = "#^.{{$requestedLength}}[\\w/]*>?#su";
		preg_match( $pattern, $text, $m );
		var_dump($pattern);var_dump($m);die;
		$text = $m[1];
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
			'continue' => array(
				ApiBase::PARAM_TYPE => 'string',
			),
		);
	}

	public function getParamDescription() {
		return array(
			'limit' => 'How many excerpts to return',
			'continue' => 'When more results are available, use this to continue',
		);
	}

	public function getDescription() {
		return 'Returns plain-text excerpts of the given page(s)';
	}

	public function getPossibleErrors() {
		return array_merge( parent::getPossibleErrors(), array(
			array( 'code' => '_badcontinue', 'info' => 'Invalid continue param. You should pass the original value returned by the previous query' ),
		) );
	}

	public function getExamples() {
		return false;//@todo:
	}


	public function getHelpUrls() {
		return 'https://www.mediawiki.org/wiki/Extension:MobileFrontend#New_API';
	}

	public function getVersion() {
		return __CLASS__ . ': $Id: ApiQueryCoordinates.php 110649 2012-02-03 10:18:20Z maxsem $';
	}
}


