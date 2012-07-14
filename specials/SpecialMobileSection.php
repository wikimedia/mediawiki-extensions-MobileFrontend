<?php

class SpecialMobileSection extends UnlistedSpecialPage {

	public function __construct() {
		parent::__construct( 'MobileSection' );
	}

	public function execute( $par = '' ) {
		$context = MobileContext::singleton();
		$out = $this->getOutput();

		$this->setHeaders();
		$context->setForceMobileView( true );
		
		if( $par ) {
			$args = explode( '/', $par );
			$length = count( $args );
			$section = $args[ $length - 1 ];
			$pageTitle = implode( '/', array_slice( $args, 0, $length - 1 ) );
			return $this->renderSection( $pageTitle, $section );
		} else { // page doesn't exist
			$out->showErrorPage( 'error', 'mobile-frontend-unknown-option', array( $par ) );
			return;
		}
	}

	private function renderSection( $pageTitle, $section ) {
		$out = $this->getOutput();
		$user = $this->getUser();
		$context = MobileContext::singleton();
		$out->setPageTitle( $pageTitle );
		$title = Title::newFromText( $pageTitle );
		$wp = WikiPage::factory( $title );

		$id = $title->getArticleID(); //Get the id for the article called Test_page
		$article = Article::newFromId( $id ); //Make an article object from that id
		$parserOutput = $wp->getParserOutput( $article->getParserOptions() );
		$body = $parserOutput->getText();

		$mf = new MobileFormatter( MobileFormatter::wrapHTML( $body ), $title, 'HTML', null, array( ""=> $section ) );
		$body = $mf->getText();
		$html =  <<<HTML
$body
HTML;
		$out->addHTML( $html );
	}
}
