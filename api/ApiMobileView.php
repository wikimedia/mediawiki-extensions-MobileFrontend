<?php

class ApiMobileView extends ApiBase {
	/**
	 * Increment this when changing the format of cached data
	 */
	const CACHE_VERSION = 1;

	public function __construct( $main, $action ) {
		parent::__construct( $main, $action );
	}

	public function execute() {
		wfProfileIn( __METHOD__ );
		// Enough '*' keys in JSON!!!
		$textElement = $this->getMain()->getPrinter()->getFormat() == 'XML' ? '*' : 'text';
		$params = $this->extractRequestParams();
		$requestedSections = isset( $params['section'] )
			? $this->parseSections( $params['section'] )
			: array();
		$prop = array_flip( $params['prop'] );
		$sectionProp = array_flip( $params['sectionprop'] );

		$title = Title::newFromText( $params['page'] );
		if ( !$title || !$title->exists() || $title->getNamespace() < 0 || !$title->isLocal() ) {
			$this->dieUsageMsg( array( 'invalidtitle', $params['page'] ) );
		}
		$data = $this->getData( $title, $params['noimages'] );
		$result = array();
		if ( isset( $prop['sections'] ) ) {
			$requestedSections = array_flip( $requestedSections );
			for ( $i = 0; $i <= count( $data['sections'] ); $i++ ) {
				$section = array();
				if ( $i > 0 ) {
					$section = array_intersect_key( $data['sections'][$i - 1], $sectionProp );
				}
				$section['id'] = $i;
				if ( isset( $requestedSections[$i] ) && isset( $data['text'][$i] ) ) {
					$section[$textElement] = $data['text'][$i];
				}
				$result[] = $section;
			}
		} else {
			foreach ( $requestedSections as $index ) {
				$section = array( 'id' => $index );
				if ( isset( $data['text'][$index] ) ) {
					$section[$textElement] = $data['text'][$index];
				}
				$result[] = $section;
			}
		}
		$this->getResult()->setIndexedTagName( $result, 'section' );
		$this->getResult()->addValue( null, $this->getModuleName(), array( 'sections' => $result ) );
	}

	public function getAllowedParams() {
		return array(
			'page' => array(
				ApiBase::PARAM_REQUIRED => true,
			),
			'section' => null,
			'prop' => array(
				ApiBase::PARAM_DFLT => 'text|sections',
				ApiBase::PARAM_ISMULTI => true,
				ApiBase::PARAM_TYPE => array(
					'text',
					'sections',
				)
			),
			'sectionprop' => array(
				ApiBase::PARAM_TYPE => array(
					'toclevel',
					'level',
					'line',
					'number',
					'index',
					'fromtitle',
					'anchor',
				),
				ApiBase::PARAM_ISMULTI => true,
				ApiBase::PARAM_DFLT => 'toclevel|line',
			),
			'noimages' => false,
		);
	}

	private function parseSections( $str ) {
		$sections = array_map( 'intval', explode( '|', $str ) );
		return $sections;
	}

	private function getData( $title, $noImages ) {
		global $wgMemc, $wgUseTidy;

		wfProfileIn( __METHOD__ );
		$wp = WikiPage::factory( $title );
		$parserOptions = ParserOptions::newFromContext( $this );
		$latest = $wp->getLatest();
		$parserCacheKey = ParserCache::singleton()->getKey( $wp, $parserOptions );
		$key = wfMemcKey( 'mf', 'mobileview', self::CACHE_VERSION, $noImages, $parserCacheKey );
		$data = $wgMemc->get( $key );
		if ( $data ) {
			wfProfileOut( __METHOD__ );
			return $data;
		}
		$parserOutput = $wp->getParserOutput( $parserOptions );
		$mf = new MobileFormatter( '<html><body><div id="content">' . $parserOutput->getText() . '</div></body></html>',
			$title,
			'XHTML'
		);
		$mf->removeImages( $noImages );
		$mf->filterContent();
		$html = $mf->getText( 'content' );
		$data = array();
		$data['sections'] = $parserOutput->getSections();
		$chunks = preg_split( '/<h(?=[1-6]\b)/i', $html );
		$data['text'] = array();
		foreach ( $chunks as $chunk ) {
			if ( count( $data['text'] ) ) {
				$chunk = "<h$chunk";
			}
			if ( $wgUseTidy && count( $chunks ) > 1 ) {
				$chunk = MWTidy::tidy( $chunk );
			}
			$data['text'][] = $chunk;
		}
		if ( count( $chunks ) != count( $data['sections'] ) + 1 ) {
			wfDebug( __METHOD__ . "(): mismatching number of sections from parser and split. oldid=$latest\n" );
		}
		// store for the same time as original parser output
		$wgMemc->set( $key, $data, $parserOutput->getCacheTime() );
		wfProfileOut( __METHOD__ );
		return $data;
	}

	public function getParamDescription() {
		return array(
			
		);
	}

	public function getDescription() {
		return 'Returns data needed for mobile views';
	}

	public function getPossibleErrors() {
		return array_merge( parent::getPossibleErrors(),
			array(
				array( 'code' => 'invalid-section', 'info' => '' ),
			) 
		);
	}

	public function getExamples() {
		return array(
			'api.php?action=mobileview&page=Doom_metal&section=0'
		);
	}

	public function getHelpUrls() {
		return 'https://www.mediawiki.org/wiki/Extension:MobileFrontend#New_API';
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}

}
