<?php

class ApiMobileView extends ApiBase {
	/**
	 * Increment this when changing the format of cached data
	 */
	const CACHE_VERSION = 3;

	private $followRedirects, $noHeadings, $mainPage, $noTransform;
	/**
	 * @var File
	 */
	private $file;

	public function __construct( $main, $action ) {
		parent::__construct( $main, $action );
	}

	public function execute() {
		wfProfileIn( __METHOD__ );

		// Logged-in users' parser options depend on preferences
		$this->getMain()->setCacheMode( 'anon-public-user-private' );

		// Enough '*' keys in JSON!!!
		$textElement = $this->getMain()->getPrinter()->getFormat() == 'XML' ? '*' : 'text';
		$params = $this->extractRequestParams();

		$prop = array_flip( $params['prop'] );
		$sectionProp = array_flip( $params['sectionprop'] );
		$this->followRedirects = $params['redirect'] == 'yes';
		$this->noHeadings = $params['noheadings'];
		$this->noTransform = $params['notransform'];

		$title = Title::newFromText( $params['page'] );
		if ( !$title ) {
			$this->dieUsageMsg( array( 'invalidtitle', $params['page'] ) );
		}
		if ( $title->getNamespace() == NS_FILE ) {
			$this->file = wfFindFile( $title );
		}
		if ( !$title->exists() && !$this->file ) {
			$this->dieUsageMsg( array( 'missingtitle', $params['page'] ) );
		}
		$this->mainPage = $title->isMainPage();
		if ( $this->mainPage && $this->noHeadings ) {
			$this->noHeadings = false;
			$this->setWarning( "``noheadings'' makes no sense on the main page, ignoring" );
		}
		if ( isset( $prop['normalizedtitle'] ) && $title->getPrefixedText() != $params['page'] ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'normalizedtitle' => $title->getPrefixedText() )
			);
		}
		$data = $this->getData( $title, $params['noimages'] );
		$result = array();
		$missingSections = array();
		$requestedSections = isset( $params['sections'] )
			? $this->parseSections( $params['sections'], $data )
			: array();
		if ( $this->mainPage ) {
			$requestedSections = array( 0 );
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'mainpage' => '' )
			);
		}
		if ( isset( $prop['sections'] ) ) {
			for ( $i = 0; $i <= count( $data['sections'] ); $i++ ) {
				$section = array();
				if ( $i > 0 ) {
					$section = array_intersect_key( $data['sections'][$i - 1], $sectionProp );
				}
				$section['id'] = $i;
				if ( isset( $prop['text'] ) && isset( $requestedSections[$i] ) && isset( $data['text'][$i] ) ) {
					$section[$textElement] = $this->prepareSection( $data['text'][$i] );
					unset( $requestedSections[$i] );
				}
				if ( isset( $data['refsections'][$i] ) ) {
					$section['references'] = '';
				}
				$result[] = $section;
			}
			$missingSections = $requestedSections;
		} else {
			foreach ( array_keys( $requestedSections ) as $index ) {
				$section = array( 'id' => $index );
				if ( isset( $data['text'][$index] ) ) {
					$section[$textElement] = $data['text'][$index];
				} else {
					$missingSections[] = $index;
				}
				$result[] = $section;
			}
		}
		if ( count( $missingSections ) && isset( $prop['text'] ) ) {
			$this->setWarning( 'Section(s) ' . implode( ', ', $missingSections ) . ' not found' );
		}
		$this->getResult()->setIndexedTagName( $result, 'section' );
		$this->getResult()->addValue( null, $this->getModuleName(), array( 'sections' => $result ) );
		wfProfileOut( __METHOD__ );
	}

	private function prepareSection( $html ) {
		if ( $this->noHeadings ) {
			$html = preg_replace( '#<(h[1-6])\b.*?<\s*/\s*\\1>#', '', $html );
		}
		return trim( $html );
	}

	private function parseSections( $str, $data ) {
		if ( trim( $str ) == 'all' ) {
			return range( 0, count( $data['sections'] ) );
		}
		$sections = array_flip( array_map( 'trim', explode( '|', $str ) ) );
		if ( isset( $sections['references'] ) ) {
			unset( $sections['references'] );
			$sections += $data['refsections'];
		}
		return $sections;
	}

	private function getData( Title $title, $noImages ) {
		global $wgMemc, $wgUseTidy;

		wfProfileIn( __METHOD__ );
		$wp = WikiPage::factory( $title );
		if ( $this->followRedirects && $wp->isRedirect() ) {
			$newTitle = $wp->getRedirectTarget();
			if ( $newTitle ) {
				$wp = WikiPage::factory( $newTitle );
				$this->getResult()->addValue( null, $this->getModuleName(),
					array( 'redirected' => $newTitle->getPrefixedText() )
				);
				$title = $newTitle;
			}
		}
		$latest = $wp->getLatest();
		if ( $this->file ) {
			$key = wfMemcKey( 'mf', 'mobileview', self::CACHE_VERSION, $noImages, $latest, $this->noTransform, $this->file->getSha1() );
			$cacheExpiry = 3600;
		} else {
			$parserOptions = $wp->makeParserOptions( $this );
			$parserCacheKey = ParserCache::singleton()->getKey( $wp, $parserOptions );
			$key = wfMemcKey( 'mf', 'mobileview', self::CACHE_VERSION, $noImages, $latest, $this->noTransform, $parserCacheKey );
		}
		$data = $wgMemc->get( $key );
		if ( $data ) {
			wfProfileOut( __METHOD__ );
			return $data;
		}
		if ( $this->file ) {
			$html = $this->getFilePage( $title );
		} else {
			$parserOutput = $wp->getParserOutput( $parserOptions );
			if ( !$parserOutput ) {
				throw new MWException( __METHOD__ . ": PoolCounter didn't return parser output" );
			}
			$html = $parserOutput->getText();
			$cacheExpiry = $parserOutput->getCacheExpiry();
		}

		wfProfileIn( __METHOD__ . '-MobileFormatter' );
		$mf = new MobileFormatter( MobileFormatter::wrapHTML( $html ),
			$title,
			'HTML'
		);
		$mf->removeImages( $noImages );
		if ( !$this->noTransform ) {
			$mf->filterContent();
			$mf->setIsMainPage( $this->mainPage );
		}
		$html = $mf->getText();
		wfProfileOut( __METHOD__ . '-MobileFormatter' );

		if ( $this->mainPage || $this->file ) {
			$data = array(
				'sections' => array(),
				'text' => array( $html ),
				'refsections' => array(),
			);
		} else {
			wfProfileIn( __METHOD__ . '-sections' );
			$data = array();
			$data['sections'] = $parserOutput->getSections();
			$chunks = preg_split( '/<h(?=[1-6]\b)/i', $html );
			if ( count( $chunks ) != count( $data['sections'] ) + 1 ) {
				wfDebug( __METHOD__ . "(): mismatching number of sections from parser and split. oldid=$latest\n" );
				// We can't be sure about anything here, return all page HTML as one big section
				$chunks = array( $html );
				$data['sections'] = array();
			}
			$data['text'] = array();
			$data['refsections'] = array();
			foreach ( $chunks as $chunk ) {
				if ( count( $data['text'] ) ) {
					$chunk = "<h$chunk";
				}
				if ( $wgUseTidy && count( $chunks ) > 1 ) {
					$chunk = MWTidy::tidy( $chunk );
				}
				if ( preg_match( '/<ol\b[^>]*?class="references"/', $chunk ) ) {
					$data['refsections'][count( $data['text'] )] = true;
				}
				$data['text'][] = $chunk;
			}
			wfProfileOut( __METHOD__ . '-sections' );
		}
		// store for the same time as original parser output
		$wgMemc->set( $key, $data, $cacheExpiry );
		wfProfileOut( __METHOD__ );
		return $data;
	}

	private function getFilePage( Title $title ) {
		//HACK: HACK: HACK:
		$page = new ImagePage( $title );
		$page->setContext( $this->getContext() );
		$page->view();
		global $wgOut;
		return $wgOut->getHTML();
	}

	public function getAllowedParams() {
		return array(
			'page' => array(
				ApiBase::PARAM_REQUIRED => true,
			),
			'redirect' => array(
				ApiBase::PARAM_TYPE => array( 'yes', 'no' ),
				ApiBase::PARAM_DFLT => 'yes',
			),
			'sections' => null,
			'prop' => array(
				ApiBase::PARAM_DFLT => 'text|sections|normalizedtitle',
				ApiBase::PARAM_ISMULTI => true,
				ApiBase::PARAM_TYPE => array(
					'text',
					'sections',
					'normalizedtitle',
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
			'noheadings' => false,
			'notransform' => false,
		);
	}

	public function getParamDescription() {
		return array(
			'page' => 'Title of page to process',
			'redirect' => 'Whether redirects should be followed',
			'sections' => "Pipe-separated list of section numbers for which to return text or `all' to return for all. "
				. "`references' can be used to specify that all sections containing references should be returned.",
			'prop' => array(
				'Which information to get',
				' text            - HTML of selected section(s)',
				' sections        - information about all sections on page',
				' normalizedtitle - normalized page title',
			),
			'sectionprop' => 'What information about sections to get',
			'noimages' => 'Return HTML without images',
			'noheadings' => "Don't include headings in output",
			'notransform' => "Don't transform HTML into mobile-specific version",
		);
	}

	public function getDescription() {
		return 'Returns data needed for mobile views';
	}

	public function getPossibleErrors() {
		return array_merge( parent::getPossibleErrors(),
			array(
				array( 'missingtitle' ),
				array( 'invalidtitle' ),
			)
		);
	}

	public function getExamples() {
		return array(
			'api.php?action=mobileview&page=Doom_metal&sections=0',
			'api.php?action=mobileview&page=Candlemass&sections=0|references',
		);
	}

	public function getHelpUrls() {
		return 'https://www.mediawiki.org/wiki/Extension:MobileFrontend#action.3Dmobileview';
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}

}
