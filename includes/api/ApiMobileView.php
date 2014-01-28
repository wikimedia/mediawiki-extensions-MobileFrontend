<?php

class ApiMobileView extends ApiBase {
	/**
	 * Increment this when changing the format of cached data
	 */
	const CACHE_VERSION = 7;

	private $followRedirects, $noHeadings, $mainPage, $noTransform, $variant, $offset, $maxlen,
		$usePageImages;

	/**
	 * @var File
	 */
	private $file;

	public function __construct( $main, $action ) {
		$this->usePageImages = defined( 'PAGE_IMAGES_INSTALLED' );
		parent::__construct( $main, $action );
	}

	/**
	 * FIXME: Write some unit tests for API results
	 */
	public function execute() {
		wfProfileIn( __METHOD__ );

		// Logged-in users' parser options depend on preferences
		$this->getMain()->setCacheMode( 'anon-public-user-private' );

		// Enough '*' keys in JSON!!!
		$isXml = $this->getMain()->isInternalMode()
			|| $this->getMain()->getPrinter()->getFormat() == 'XML';
		$textElement = $isXml ? '*' : 'text';
		$params = $this->extractRequestParams();

		$prop = array_flip( $params['prop'] );
		$sectionProp = array_flip( $params['sectionprop'] );
		$this->variant = $params['variant'];
		$this->followRedirects = $params['redirect'] == 'yes';
		$this->noHeadings = $params['noheadings'];
		$this->noTransform = $params['notransform'];
		$onlyRequestedSections = $params['onlyrequestedsections'];
		$this->offset = $params['offset'];
		$this->maxlen = $params['maxlen'];

		if ( $this->offset === 0 && $this->maxlen === 0 ) {
			$this->offset = -1; // Disable text splitting
		} elseif ( $this->maxlen === 0 ) {
			$this->maxlen = PHP_INT_MAX;
		}

		$title = $this->makeTitle( $params['page'] );
		$this->mainPage = $title->isMainPage();
		if ( $this->mainPage && $this->noHeadings ) {
			$this->noHeadings = false;
			$this->setWarning( "``noheadings'' makes no sense on the main page, ignoring" );
		}
		if ( isset( $prop['normalizedtitle'] ) && $title->getPrefixedText() != $params['page'] ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'normalizedtitle' => $title->getPageLanguage()->convert( $title->getPrefixedText() ) )
			);
		}
		$data = $this->getData( $title, $params['noimages'] );
		if ( isset( $prop['lastmodified'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'lastmodified' => $data['lastmodified'] )
			);
		}
		if ( isset( $prop['lastmodifiedby'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'lastmodifiedby' => $data['lastmodifiedby'] )
			);
		}
		if ( isset( $prop['revision'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'revision' => $data['revision'] )
			);
		}
		if ( isset( $prop['id'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'id' => $data['id'] )
			);
		}
		if ( isset( $prop['languagecount'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'languagecount' => $data['languagecount'] )
			);
		}
		if ( isset( $prop['hasvariants'] ) && isset( $data['hasvariants'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'hasvariants' => $data['hasvariants'] )
			);
		}
		if ( isset( $prop['displaytitle'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'displaytitle' => $data['displaytitle'] )
			);
		}
		if ( $this->usePageImages ) {
			$this->addPageImage( $data, $prop, $params['thumbsize'] );
		}
		$result = array();
		$missingSections = array();
		if ( $this->mainPage ) {
			$requestedSections = array( 0 );
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'mainpage' => '' )
			);
		} elseif ( isset( $params['sections'] ) ) {
			$requestedSections = self::parseSections( $params['sections'], $data, $missingSections );
		} else {
			$requestedSections = array();
		}
		if ( isset( $prop['sections'] ) ) {
			$sectionCount = count( $data['sections'] );
			for ( $i = 0; $i <= $sectionCount; $i++ ) {
				if ( !isset( $requestedSections[$i] ) && $onlyRequestedSections ) {
					continue;
				}
				$section = array();
				if ( $i > 0 ) {
					$section = array_intersect_key( $data['sections'][$i - 1], $sectionProp );
				}
				$section['id'] = $i;
				if ( isset( $prop['text'] ) && isset( $requestedSections[$i] ) && isset( $data['text'][$i] ) ) {
					$section[$textElement] = $this->stringSplitter( $this->prepareSection( $data['text'][$i] ) );
					unset( $requestedSections[$i] );
				}
				if ( isset( $data['refsections'][$i] ) ) {
					$section['references'] = '';
				}
				$result[] = $section;
			}
			$missingSections = array_keys( $requestedSections );
		} else {
			foreach ( array_keys( $requestedSections ) as $index ) {
				$section = array( 'id' => $index );
				if ( isset( $data['text'][$index] ) ) {
					$section[$textElement] =
						$this->stringSplitter( $this->prepareSection( $data['text'][$index] ) );
				} else {
					$missingSections[] = $index;
				}
				$result[] = $section;
			}
		}

		if ( isset( $prop['protection'] ) ) {
			$this->addProtection( $title );
		}
		if ( isset( $prop['editable'] ) ) {
			$user = $this->getUser();
			if ( $user->isAnon() ) {
				// HACK: Anons receive cached information, so don't check blocked status for them
				// to avoid them receiving false positives. Currently there is no way to check
				// all permissions except blocked status from the Title class.
				$req = new FauxRequest();
				$req->setIP( '127.0.0.1' );
				$user = User::newFromSession( $req );
			}
			$editable = $title->quickUserCan( 'edit', $user );
			if ( $isXml ) {
				$editable = intval( $editable );
			}
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'editable' => $editable )
			);
		}
		// https://bugzilla.wikimedia.org/show_bug.cgi?id=51586
		// Inform ppl if the page is infested with LiquidThreads but that's the
		// only thing we support about it.
		if ( class_exists( 'LqtDispatch' ) && LqtDispatch::isLqtPage( $title ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'liquidthreads' => '' )
			);
		}
		if ( count( $missingSections ) && isset( $prop['text'] ) ) {
			$this->setWarning( 'Section(s) ' . implode( ', ', $missingSections ) . ' not found' );
		}
		if ( $this->maxlen < 0 ) {
			// There is more data available
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'continue-offset' => $params['offset'] + $params['maxlen'] )
			);
		}
		$this->getResult()->setIndexedTagName( $result, 'section' );
		$this->getResult()->addValue( null, $this->getModuleName(), array( 'sections' => $result ) );

		wfProfileOut( __METHOD__ );
	}

	/**
	 * Creates and validates a title
	 *
	 * @param string $name
	 * @return Title
	 */
	protected function makeTitle( $name ) {
		$title = Title::newFromText( $name );
		if ( !$title ) {
			$this->dieUsageMsg( array( 'invalidtitle', $name ) );
		}
		if ( $title->inNamespace( NS_FILE ) ) {
			$this->file = wfFindFile( $title );
		}
		if ( !$title->exists() && !$this->file ) {
			$this->dieUsageMsg( array( 'notanarticle', $name ) );
		}
		return $title;
	}

	private function stringSplitter( $text ) {
		if ( $this->offset < 0  ) {
			return $text; // NOOP - string splitting mode is off
		} elseif ( $this->maxlen < 0 ) {
			return ''; // Limit exceeded
		}
		$textLen = mb_strlen( $text );
		$start = $this->offset;
		$len = $textLen - $start;
		if ( $len > 0 ) {
			// At least part of the $text should be included
			if ( $len > $this->maxlen ) {
				$len = $this->maxlen;
				$this->maxlen = -1;
			} else {
				$this->maxlen -= $len;
			}
			$this->offset = 0;
			return mb_substr( $text, $start, $len );
		}
		$this->offset -= $textLen;
		return '';
	}

	private function prepareSection( $html ) {
		if ( $this->noHeadings ) {
			$html = preg_replace( '#<(h[1-6])\b.*?<\s*/\s*\\1>#', '', $html );
		}
		return trim( $html );
	}

	/**
	 * Parses requested sections string into a list of sections
	 *
	 * @param string $str String to parse
	 * @param array $data Processed parser output
	 * @param array $missingSections Upon return, contains the list of sections that were
	 *                                requested but are not present in parser output
	 *
	 * @return array
	 */
	public static function parseSections( $str, $data, &$missingSections ) {
		$str = trim( $str );
		$sectionCount = count( $data['sections'] );
		if ( $str === 'all' ) {
			return range( 0, $sectionCount );
		}
		$sections = array_map( 'trim', explode( '|', $str ) );
		$ret = array();
		foreach ( $sections as $sec ) {
			if ( $sec === '' ) {
				continue;
			}
			if ( $sec === 'references' ) {
				$ret = array_merge( $ret, array_keys( $data['refsections'] ) );
				continue;
			}
			$val = intval( $sec );
			if ( strval( $val ) === $sec ) {
				if ( $val >= 0 && $val <= $sectionCount ) {
					$ret[] = $val;
					continue;
				}
			} else {
				$parts = explode( '-', $sec );
				if ( count( $parts ) === 2 ) {
					$from = intval( $parts[0] );
					if ( strval( $from ) === $parts[0] && $from >= 0 && $from <= $sectionCount ) {
						if ( $parts[1] === '' ) {
							$ret = array_merge( $ret, range( $from, $sectionCount ) );
							continue;
						}
						$to = intval( $parts[1] );
						if ( strval( $to ) === $parts[1] ) {
							$ret = array_merge( $ret, range( $from, $to ) );
							continue;
						}
					}
				}
			}
			$missingSections[] = $sec;
		}
		$ret = array_unique( $ret );
		sort( $ret );
		return array_flip( $ret );
	}

	/**
	 * Performs a page parse
	 *
	 * @param WikiPage $wp
	 * @param ParserOptions $parserOptions
	 * @return ParserOutput
	 */
	protected function getParserOutput( WikiPage $wp, ParserOptions $parserOptions ) {
		wfProfileIn( __METHOD__ );
		$time = microtime( true );
		$parserOutput = $wp->getParserOutput( $parserOptions );
		$time = microtime( true ) - $time;
		if ( !$parserOutput ) {
			wfDebugLog( 'mobile', "Empty parser output on '{$wp->getTitle()->getPrefixedText()}'" .
				": rev {$wp->getId()}, time $time" );
			throw new MWException( __METHOD__ . ": PoolCounter didn't return parser output" );
		}
		$parserOutput->setTOCEnabled( false );
		wfProfileOut( __METHOD__ );
		return $parserOutput;
	}

	/**
	 * Creates a WikiPage from title
	 *
	 * @param Title $title
	 * @return WikiPage
	 */
	protected function makeWikiPage( Title $title ) {
		return WikiPage::factory( $title );
	}

	/**
	 * Creates a ParserOptions instance
	 *
	 * @param WikiPage $wp
	 *
	 * @return ParserOptions
	 */
	protected function makeParserOptions( WikiPage $wp ) {
		return $wp->makeParserOptions( $this );
	}

	private function getData( Title $title, $noImages ) {
		global $wgMemc, $wgUseTidy, $wgMFTidyMobileViewSections, $wgMFMinCachedPageSize;

		wfProfileIn( __METHOD__ );
		$wp = $this->makeWikiPage( $title );
		if ( $this->followRedirects && $wp->isRedirect() ) {
			$newTitle = $wp->getRedirectTarget();
			if ( $newTitle ) {
				$wp = $this->makeWikiPage( $newTitle );
				$this->getResult()->addValue( null, $this->getModuleName(),
					array( 'redirected' => $newTitle->getPrefixedText() )
				);
				$title = $newTitle;
			}
		}
		$latest = $wp->getLatest();
		if ( !$latest ) {
			// https://bugzilla.wikimedia.org/show_bug.cgi?id=53378
			// Title::exists() above doesn't seem to always catch recently deleted pages
			$this->dieUsageMsg( array( 'notanarticle', $title->getPrefixedText() ) );
		}
		if ( $this->file ) {
			$key = wfMemcKey( 'mf', 'mobileview', self::CACHE_VERSION, $noImages,
				$latest, $this->noTransform, $this->file->getSha1(), $this->variant );
			$cacheExpiry = 3600;
		} else {
			$parserOptions = $this->makeParserOptions( $wp );
			$parserCacheKey = ParserCache::singleton()->getKey( $wp, $parserOptions );
			$key = wfMemcKey(
				'mf',
				'mobileview',
				self::CACHE_VERSION,
				$noImages,
				$latest,
				$this->noTransform,
				$parserCacheKey
			);
		}
		$data = $wgMemc->get( $key );
		if ( $data ) {
			wfIncrStats( 'mobile.view.cache-hit' );
			wfProfileOut( __METHOD__ );
			return $data;
		}
		wfIncrStats( 'mobile.view.cache-miss' );
		if ( $this->file ) {
			$html = $this->getFilePage( $title );
		} else {
			$parserOutput = $this->getParserOutput( $wp, $parserOptions );
			$html = $parserOutput->getText();
			$cacheExpiry = $parserOutput->getCacheExpiry();
		}

		wfProfileIn( __METHOD__ . '-MobileFormatter' );
		if ( !$this->noTransform ) {
			$mf = new MobileFormatter( MobileFormatter::wrapHTML( $html ), $title );
			$mf->setRemoveMedia( $noImages );
			$mf->filterContent();
			$mf->setIsMainPage( $this->mainPage );
			$html = $mf->getText();
		}
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
			$sectionCount = count( $data['sections'] );
			for ( $i = 0; $i < $sectionCount; $i++ ) {
				$data['sections'][$i]['line'] =
					$title->getPageLanguage()->convert( $data['sections'][$i]['line'] );
			}
			$chunks = preg_split( '/<h(?=[1-6]\b)/i', $html );
			if ( count( $chunks ) != count( $data['sections'] ) + 1 ) {
				wfDebugLog( 'mobile', __METHOD__ . "(): mismatching number of " .
					"sections from parser and split on page {$title->getPrefixedText()}, oldid=$latest" );
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
				if ( $wgUseTidy && $wgMFTidyMobileViewSections && count( $chunks ) > 1 ) {
					wfProfileIn( __METHOD__ . '-tidy' );
					$chunk = MWTidy::tidy( $chunk );
					wfProfileOut( __METHOD__ . '-tidy' );
				}
				if ( preg_match( '/<ol\b[^>]*?class="references"/', $chunk ) ) {
					$data['refsections'][count( $data['text'] )] = true;
				}
				$data['text'][] = $chunk;
			}
			if ( $this->usePageImages ) {
				$image = PageImages::getPageImage( $title );
				if ( $image ) {
					$data['image'] = $image->getTitle()->getText();
				}
			}
			wfProfileOut( __METHOD__ . '-sections' );
		}

		$data['lastmodified'] = wfTimestamp( TS_ISO_8601, $wp->getTimestamp() );

		// Page id
		$data['id'] = $wp->getId();
		$user = User::newFromId( $wp->getUser() );
		if( !$user->isAnon() ) {
			$data['lastmodifiedby'] = array(
				'name' => $wp->getUserText(),
				'gender' => $user->getOption( 'gender' ),
			);
		}
		$data['revision'] = $title->getLatestRevID();

		if ( $parserOutput ) {
			$languages = $parserOutput->getLanguageLinks();
			$data['languagecount'] = count( $languages );
		} else {
			$data['languagecount'] = 0;
		}

		if ( $title->getPageLanguage()->hasVariants() ) {
			$data['hasvariants'] = true;
		}

		if ( $parserOutput ) {
			$data['displaytitle'] = $parserOutput->getDisplayTitle();
		} else {
			$data['displaytitle'] = $title->getPrefixedText();
		}

		// Don't store small pages to decrease cache size requirements
		if ( strlen( $html ) >= $wgMFMinCachedPageSize ) {
			// store for the same time as original parser output
			$wgMemc->set( $key, $data, $cacheExpiry );
		}
		wfProfileOut( __METHOD__ );
		return $data;
	}

	private function getFilePage( Title $title ) {
		//HACK: HACK: HACK:
		wfProfileIn( __METHOD__ );
		$page = new ImagePage( $title );
		$page->setContext( $this->getContext() );
		$page->view();
		global $wgOut;
		$html = $wgOut->getHTML();
		wfProfileOut( __METHOD__ );
		return $html;
	}

	/**
	 * Adds PageImages information
	 * @param array $data: whatever getData() returned
	 * @param array $prop: prop parameter value
	 * @param int $size: thumbnail size
	 */
	private function addPageImage( array $data, array $prop, $size ) {
		if ( !isset( $prop['image'] ) && !isset( $prop['thumb'] ) ) {
			return;
		}
		if ( !isset( $data['image'] ) ) {
			return;
		}
		$file = wfFindFile( $data['image'] );
		if ( !$file ) {
			return;
		}
		$result = $this->getResult();
		if ( isset( $prop['image'] ) ) {
			$result->addValue( null, $this->getModuleName(),
				array( 'image' =>
					array(
						'file' => $data['image'],
						'width' => $file->getWidth(),
						'height' => $file->getHeight(),
					)
				)
			);
		}
		if ( isset( $prop['thumb'] ) ) {
			$thumb = $file->transform( array( 'width' => $size, 'height' => $size ) );
			if ( !$thumb ) {
				return;
			}
			$result->addValue( null, $this->getModuleName(),
				array( 'thumb' =>
					array(
						'url' => $thumb->getUrl(),
						'width' => $thumb->getWidth(),
						'height' => $thumb->getHeight(),
					)
				)
			);
		}
	}

	/**
	 * Adds protection information
	 * @param Title $title
	 */
	private function addProtection( Title $title ) {
		$result = $this->getResult();
		$protection = array();
		foreach ( $title->getRestrictionTypes() as $type ) {
			$levels = $title->getRestrictions( $type );
			if ( $levels ) {
				$protection[$type] = $levels;
				$result->setIndexedTagName( $protection[$type], 'level' );
			}
		}
		$result->addValue( null, $this->getModuleName(),
			array( 'protection' => $protection )
		);
	}

	public function getAllowedParams() {
		$res = array(
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
					'id',
					'text',
					'sections',
					'normalizedtitle',
					'lastmodified',
					'lastmodifiedby',
					'revision',
					'protection',
					'editable',
					'languagecount',
					'hasvariants',
					'displaytitle',
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
			'variant' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_DFLT => false,
			),
			'noimages' => false,
			'noheadings' => false,
			'notransform' => false,
			'onlyrequestedsections' => false,
			'offset' => array(
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_MIN => 0,
				ApiBase::PARAM_DFLT => 0,
			),
			'maxlen' => array(
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_MIN => 0,
				ApiBase::PARAM_DFLT => 0,
			),
		);
		if ( $this->usePageImages ) {
			$res['prop'][ApiBase::PARAM_TYPE][] = 'image';
			$res['prop'][ApiBase::PARAM_TYPE][] = 'thumb';
			$res['thumbsize'] = array(
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_MIN => 0,
				ApiBase::PARAM_DFLT => 50,
			);
		}
		return $res;
	}

	public function getParamDescription() {
		$res = array(
			'id' => 'Id of the page',
			'page' => 'Title of page to process',
			'redirect' => 'Whether redirects should be followed',
			'sections' => array(
				'Pipe-separated list of section numbers for which to return text.',
				" `all' can be used to return for all. Ranges in format '1-4' mean get sections 1,2,3,4.",
				" Ranges without second number, e.g. '1-' means get all until the end.",
				" `references' can be used to specify that all sections containing references",
				" should be returned."
			),
			'prop' => array(
				'Which information to get',
				' text            - HTML of selected section(s)',
				' sections        - information about all sections on page',
				' normalizedtitle - normalized page title',
				' lastmodified    - MW timestamp for when the page was last modified, e.g. "20130730174438"',
				' lastmodifiedby  - information about the user who modified the page last',
				' revision        - return the current revision id of the page',
				' protection      - information about protection level',
				' editable        - whether current user can edit this page. This includes '
					. 'all factors for logged-in users but not blocked status for anons.',
				' languagecount   - number of languages that the page is available in',
				' hasvariants     - whether or not the page is available in other language variants',
				' displaytitle    - the rendered title of the page, with {{DISPLAYTITLE}} and such applied'
			),
			'sectionprop' => 'What information about sections to get',
			'variant' => "Convert content into this language variant",
			'noimages' => 'Return HTML without images',
			'noheadings' => "Don't include headings in output",
			'notransform' => "Don't transform HTML into mobile-specific version",
			'onlyrequestedsections' => 'Return only requested sections even with prop=sections',
			'offset' =>
				'Pretend all text result is one string, and return the substring starting at this point',
			'maxlen' => 'Pretend all text result is one string, and limit result to this length',
		);
		if ( $this->usePageImages ) {
			$res['prop'][] = ' image           - information about an image associated with this page';
			$res['prop'][] = ' thumb           - thumbnail of an image associated with this page';
			$res['thumbsize'] = 'Maximum thumbnail dimensions';
		}
		return $res;
	}

	public function getDescription() {
		return 'Returns data needed for mobile views';
	}

	public function getExamples() {
		return array(
			'api.php?action=mobileview&page=Doom_metal&sections=0',
			'api.php?action=mobileview&page=Candlemass&sections=0|references',
			'api.php?action=mobileview&page=Candlemass&sections=1-|references',
		);
	}

	public function getHelpUrls() {
		return 'https://www.mediawiki.org/wiki/Extension:MobileFrontend#action.3Dmobileview';
	}
}
