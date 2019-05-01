<?php

use MediaWiki\MediaWikiServices;

class MockApiMobileView extends ApiMobileView {
	/** @var PHPUnit_Framework_MockObject_MockObject */
	public $mockFile;

	public function __construct( ApiMain $main, $action ) {
		parent::__construct( $main, $action );
		// Force usePageImages = true
		$this->usePageImages = true;
	}

	protected function makeTitle( $name ) {
		$t = Title::newFromText( $name );
		$row = new stdClass();
		$row->page_id = 1;
		$row->page_title = $t->getDBkey();
		$row->page_namespace = $t->getNamespace();

		return Title::newFromRow( $row );
	}

	protected function getParserOutput(
		WikiPage $wikiPage,
		ParserOptions $parserOptions,
		$oldid = null
	) {
		$params = $this->extractRequestParams();
		if ( !isset( $params['text'] ) ) {
			throw new Exception( 'Must specify page text' );
		}
		$po = MediaWikiServices::getInstance()->getParser()->getFreshParser()->parse(
			$params['text'], $wikiPage->getTitle(), $parserOptions );
		$po->setText( str_replace( [ "\r", "\n" ], '', $po->getText( [
			'allowTOC' => false, 'unwrap' => true,
		] ) ) );

		return $po;
	}

	protected function makeWikiPage( Title $title ) {
		return new MockWikiPage( $title );
	}

	protected function makeParserOptions( WikiPage $wikiPage ) {
		$popt = new ParserOptions( $this->getUser() );
		return $popt;
	}

	public function getAllowedParams() {
		return array_merge( parent::getAllowedParams(), [ 'text' => null ] );
	}

	protected function findFile( $title, $options = [] ) {
		return $this->mockFile;
	}

	protected function getPageImage( Title $title ) {
		return $this->findFile( $title );
	}
}
