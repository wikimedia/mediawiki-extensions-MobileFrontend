<?php
/**
 * ApiMobileView.php
 */

/**
 * Extends Api of MediaWiki with actions for mobile devices. For further information see
 * https://www.mediawiki.org/wiki/Extension:MobileFrontend#API
 */
class ApiMobileView extends ApiBase {
	/**
	 * Increment this when changing the format of cached data
	 */
	const CACHE_VERSION = 8;

	/** @var boolean Saves whether redirects has to be followed or not */
	private $followRedirects;
	/** @var boolean Saves whether sections have the header name or not */
	private $noHeadings;
	/** @var boolean Saves whether the requested page is the main page */
	private $mainPage;
	/** @var boolean Saves whether the output is formatted or not */
	private $noTransform;
	/** @var boolean Saves whether page images should be added or not */
	private $usePageImages;
	/** @var string Saves in which language the content should be output */
	private $variant;
	/** @var Integer Saves at which character the section content start at */
	private $offset;
	/** @var Integer Saves value to specify the max length of a sections content */
	private $maxlen;
	/** @var file|boolean Saves a File Object, or false if no file exist */
	private $file;

	/**
	 * Run constructor of ApiBase
	 * @param ApiMain $main Instance of class ApiMain
	 * @param string $action Name of this module
	 */
	public function __construct( $main, $action ) {
		$this->usePageImages = defined( 'PAGE_IMAGES_INSTALLED' );
		parent::__construct( $main, $action );
	}

	/**
	 * Execute the requested Api actions.
	 * @todo: Write some unit tests for API results
	 */
	public function execute() {
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
		// See whether the actual page (or if enabled, the redirect target) is the main page
		$this->mainPage = $this->isMainPage( $title );
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
		// Bug 73109: #getData will return an empty array if the title redirects to
		// a page in a virtual namespace (NS_SPECIAL, NS_MEDIA), so make sure that
		// the requested data exists too.
		if ( isset( $prop['lastmodified'] ) && isset( $data['lastmodified'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'lastmodified' => $data['lastmodified'] )
			);
		}
		if ( isset( $prop['lastmodifiedby'] ) && isset( $data['lastmodifiedby'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array(
					'lastmodifiedby' => $data['lastmodifiedby'],
				)
			);
		}
		if ( isset( $prop['revision'] ) && isset( $data['revision'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'revision' => $data['revision'] )
			);
		}
		if ( isset( $prop['id'] ) && isset( $data['id'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'id' => $data['id'] )
			);
		}
		if ( isset( $prop['languagecount'] ) && isset( $data['languagecount'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'languagecount' => $data['languagecount'] )
			);
		}
		if ( isset( $prop['hasvariants'] ) && isset( $data['hasvariants'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'hasvariants' => $data['hasvariants'] )
			);
		}
		if ( isset( $prop['displaytitle'] ) && isset( $data['displaytitle'] ) ) {
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'displaytitle' => $data['displaytitle'] )
			);
		}
		if ( isset( $prop['pageprops'] ) ) {
			$propNames = $params['pageprops'];
			if ( $propNames == '*' && isset( $data['pageprops'] ) ) {
				$pageProps = $data['pageprops'];
			} else {
				$propNames = explode( '|', $propNames );
				$pageProps = array_intersect_key( $data['pageprops'], array_flip( $propNames ) );
			}
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'pageprops' => $pageProps )
			);
		}
		if ( isset( $prop['description'] ) && isset( $data['pageprops']['wikibase_item'] ) ) {
			$desc = ExtMobileFrontend::getWikibaseDescription(
				$data['pageprops']['wikibase_item']
			);
			if ( $desc ) {
				$this->getResult()->addValue( null, $this->getModuleName(),
					array( 'description' => $desc )
				);
			}
		}
		if ( $this->usePageImages ) {
			$this->addPageImage( $data, $params, $prop );
		}
		$result = array();
		$missingSections = array();
		if ( $this->mainPage ) {
			if ( $onlyRequestedSections ) {
				$requestedSections =
					self::parseSections( $params['sections'], $data, $missingSections );
			} else {
				$requestedSections = array( 0 );
			}
			$this->getResult()->addValue( null, $this->getModuleName(),
				array( 'mainpage' => '' )
			);
		} elseif ( isset( $params['sections'] ) ) {
			$requestedSections = self::parseSections( $params['sections'], $data, $missingSections );
		} else {
			$requestedSections = array();
		}
		if ( isset( $data['sections'] ) ) {
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
					if ( isset( $prop['text'] )
						&& isset( $requestedSections[$i] )
						&& isset( $data['text'][$i] )
					) {
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
			$this->getResult()->setIndexedTagName( $result, 'section' );
			$this->getResult()->addValue( null, $this->getModuleName(), array( 'sections' => $result ) );
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
	}

	/**
	 * Creates and validates a title
	 * @param string $name
	 * @return Title
	 */
	protected function makeTitle( $name ) {
		$title = Title::newFromText( $name );
		if ( !$title ) {
			$this->dieUsageMsg( array( 'invalidtitle', $name ) );
		}
		if ( $title->inNamespace( NS_FILE ) ) {
			$this->file = $this->findFile( $title );
		}
		if ( !$title->exists() && !$this->file ) {
			$this->dieUsageMsg( array( 'notanarticle', $name ) );
		}
		return $title;
	}

	/**
	 * Wrapper that returns a page image for a given title
	 *
	 * @param Title $title
	 * @return bool|File
	 */
	protected function getPageImage( Title $title ) {
		return PageImages::getPageImage( $title );
	}

	/**
	 * Wrapper for wfFindFile
	 *
	 * @param Title|string $title
	 * @param array $options
	 * @return bool|File
	 */
	protected function findFile( $title, $options = array() ) {
		return wfFindFile( $title, $options );
	}

	/**
	 * Check if page is the main page after follow redirect when followRedirects is true.
	 *
	 * @param Title $title Title object to check
	 * @return boolean
	 */
	protected function isMainPage( $title ) {
		if ( $title->isRedirect() && $this->followRedirects ) {
			$wp = $this->makeWikiPage( $title );
			$target = $wp->getRedirectTarget();
			if ( $target ) {
				return $target->isMainPage();
			}
		}
		return $title->isMainPage();
	}

	/**
	 * Splits a string (using $offset and $maxlen)
	 * @param string $text The text to split
	 * @return string
	 */
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

	/**
	 * Delete headings from page html
	 * @param string $html Page content
	 * @return string
	 */
	private function prepareSection( $html ) {
		if ( $this->noHeadings ) {
			$html = preg_replace( '#<(h[1-6])\b.*?<\s*/\s*\\1>#', '', $html );
		}
		return trim( $html );
	}

	/**
	 * Parses requested sections string into a list of sections
	 * @param string $str String to parse
	 * @param array $data Processed parser output
	 * @param array $missingSections Upon return, contains the list of sections that were
	 * requested but are not present in parser output
	 * @return array
	 */
	public static function parseSections( $str, $data, &$missingSections ) {
		$str = trim( $str );
		if ( !isset( $data['sections'] ) ) {
			return array();
		}
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
	 * @param WikiPage $wp
	 * @param ParserOptions $parserOptions
	 * @return ParserOutput
	 */
	protected function getParserOutput( WikiPage $wp, ParserOptions $parserOptions ) {
		$time = microtime( true );
		$parserOutput = $wp->getParserOutput( $parserOptions );
		$time = microtime( true ) - $time;
		if ( !$parserOutput ) {
			wfDebugLog( 'mobile', "Empty parser output on '{$wp->getTitle()->getPrefixedText()}'" .
				": rev {$wp->getId()}, time $time" );
			throw new Exception( __METHOD__ . ": PoolCounter didn't return parser output" );
		}
		$parserOutput->setTOCEnabled( false );

		return $parserOutput;
	}

	/**
	 * Creates a WikiPage from title
	 * @param Title $title
	 * @return WikiPage
	 */
	protected function makeWikiPage( Title $title ) {
		return WikiPage::factory( $title );
	}

	/**
	 * Creates a ParserOptions instance
	 * @param WikiPage $wp
	 * @return ParserOptions
	 */
	protected function makeParserOptions( WikiPage $wp ) {
		return $wp->makeParserOptions( $this );
	}

	/**
	 * Get data of requested article.
	 * @param Title $title
	 * @param boolean $noImages
	 * @return array
	 */
	private function getData( Title $title, $noImages ) {
		global $wgMemc, $wgUseTidy, $wgMFTidyMobileViewSections, $wgMFMinCachedPageSize,
			$wgMFSpecialCaseMainPage;

		$wp = $this->makeWikiPage( $title );
		if ( $this->followRedirects && $wp->isRedirect() ) {
			$newTitle = $wp->getRedirectTarget();
			if ( $newTitle ) {
				$title = $newTitle;
				$this->getResult()->addValue( null, $this->getModuleName(),
					array( 'redirected' => $title->getPrefixedText() )
				);
				if ( $title->getNamespace() < 0 ) {
					$this->getResult()->addValue( null, $this->getModuleName(),
						array( 'viewable' => 'no' )
					);
					return array();
				}
				$wp = $this->makeWikiPage( $title );
			}
		}
		$latest = $wp->getLatest();
		if ( $this->file ) {
			$key = wfMemcKey( 'mf', 'mobileview', self::CACHE_VERSION, $noImages,
				$latest, $this->noTransform, $this->file->getSha1(), $this->variant );
			$cacheExpiry = 3600;
		} else {
			if ( !$latest ) {
				// https://bugzilla.wikimedia.org/show_bug.cgi?id=53378
				// Title::exists() above doesn't seem to always catch recently deleted pages
				$this->dieUsageMsg( array( 'notanarticle', $title->getPrefixedText() ) );
			}
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

		if ( !$this->noTransform ) {
			$mf = new MobileFormatter( MobileFormatter::wrapHTML( $html ), $title );
			$mf->setRemoveMedia( $noImages );
			$mf->filterContent();
			$mf->setIsMainPage( $this->mainPage && $wgMFSpecialCaseMainPage );
			$html = $mf->getText();
		}

		if ( $this->mainPage || $this->file ) {
			$data = array(
				'sections' => array(),
				'text' => array( $html ),
				'refsections' => array(),
			);
		} else {
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
					$chunk = MWTidy::tidy( $chunk );
				}
				if ( preg_match( '/<ol\b[^>]*?class="references"/', $chunk ) ) {
					$data['refsections'][count( $data['text'] )] = true;
				}
				$data['text'][] = $chunk;
			}
			if ( $this->usePageImages ) {
				$image = $this->getPageImage( $title );
				if ( $image ) {
					$data['image'] = $image->getTitle()->getText();
				}
			}
		}

		$data['lastmodified'] = wfTimestamp( TS_ISO_8601, $wp->getTimestamp() );

		// Page id
		$data['id'] = $wp->getId();
		$user = User::newFromId( $wp->getUser() );
		if ( !$user->isAnon() ) {
			$data['lastmodifiedby'] = array(
				'name' => $wp->getUserText(),
				'gender' => $user->getOption( 'gender' ),
			);
		} else {
			$data['lastmodifiedby'] = null;
		}
		$data['revision'] = $title->getLatestRevID();

		if ( isset( $parserOutput ) ) {
			$languages = $parserOutput->getLanguageLinks();
			$data['languagecount'] = count( $languages );
			$data['displaytitle'] = $parserOutput->getDisplayTitle();
			// @fixme: Does no work for some extension properties that get added in LinksUpdate
			$data['pageprops'] = $parserOutput->getProperties();
		} else {
			$data['languagecount'] = 0;
			$data['displaytitle'] = $title->getPrefixedText();
			$data['pageprops'] = array();
		}

		if ( $title->getPageLanguage()->hasVariants() ) {
			$data['hasvariants'] = true;
		}

		// Don't store small pages to decrease cache size requirements
		if ( strlen( $html ) >= $wgMFMinCachedPageSize ) {
			// store for the same time as original parser output
			$wgMemc->set( $key, $data, $cacheExpiry );
		}

		return $data;
	}

	/**
	 * Get a Filepage as parsed HTML
	 * @param Title $title
	 * @return string
	 */
	private function getFilePage( Title $title ) {
		//HACK: HACK: HACK:
		$context = new DerivativeContext( $this->getContext() );
		$context->setTitle( $title );
		$context->setOutput( new OutputPage( $context ) );
		$page = new ImagePage( $title );
		$page->setContext( $context );
		$page->view();
		$html = $context->getOutput()->getHTML();

		return $html;
	}

	/**
	 * Adds Image information to Api result.
	 * @param array $data whatever getData() returned
	 * @param array $params parameters to this API module
	 * @param array $prop prop parameter value
	 */
	private function addPageImage( array $data, array $params, array $prop ) {
		if ( !isset( $prop['image'] ) && !isset( $prop['thumb'] ) ) {
			return;
		}
		if ( !isset( $data['image'] ) ) {
			return;
		}
		if ( isset( $params['thumbsize'] )
			&& ( isset( $params['thumbwidth'] ) || isset( $params['thumbheight'] ) )
		) {
			$this->dieUsage(
				"`thumbsize' is mutually exclusive with `thumbwidth' and `thumbheight'",
				'toomanysizeparams'
			);
		}

		$file = $this->findFile( $data['image'] );
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
			$resize = array();
			if ( isset( $params['thumbsize'] ) ) {
				$resize['width'] = $resize['height'] = $params['thumbsize'];
			}
			if ( isset( $params['thumbwidth'] ) ) {
				$resize['width'] = $params['thumbwidth'];
			}
			if ( isset( $params['thumbheight'] ) ) {
				$resize['height'] = $params['thumbheight'];
			}
			if ( isset( $resize['width'] ) && !isset( $resize['height'] ) ) {
				$resize['height'] = $file->getHeight(); // Limit by width
			}
			if ( !isset( $resize['width'] ) && isset( $resize['height'] ) ) {
				$resize['width'] = $file->getWidth(); // Limit by width
			}
			if ( !$resize ) {
				$resize['width'] = $resize['height'] = 50; // Default
			}
			$thumb = $file->transform( $resize );
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
	 * Adds protection information to the Api result
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

	/**
	 * Get allowed Api parameters.
	 * @return array
	 */
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
					'pageprops',
					'description',
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
			'pageprops' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_DFLT => 'notoc|noeditsection|wikibase_item'
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
			$res['thumbsize'] = $res['thumbwidth'] = $res['thumbheight'] = array(
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_MIN => 0,
			);
		}
		return $res;
	}

	/**
	 * Get the description for Api parameters.
	 * @deprecated since MediaWiki core 1.25
	 * @return array
	 */
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
				' lastmodified    - ISO 8601 timestamp for when the page was last modified, '
					. 'e.g. "2014-04-13T22:42:14Z"',
				' lastmodifiedby  - information about the user who modified the page last',
				' revision        - return the current revision id of the page',
				' protection      - information about protection level',
				' editable        - whether current user can edit this page. This includes '
					. 'all factors for logged-in users but not blocked status for anons.',
				' languagecount   - number of languages that the page is available in',
				' hasvariants     - whether or not the page is available in other language variants',
				' displaytitle    - the rendered title of the page, with {{DISPLAYTITLE}} and such applied',
				' pageprops       - page properties',
				' description     - page description from Wikidata',
			),
			'sectionprop' => 'What information about sections to get',
			'pageprops' => 'What page properties to return, a pipe (|) separated list or * for'
				. ' all properties',
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
			$res['thumbsize'] = 'Maximum thumbnail dimensions (either width or height)';
			$res['thumbwidth'] = 'Maximum thumbnail width';
			$res['thumbheight'] = 'Maximum thumbnail height';
		}
		return $res;
	}

	/**
	 * Get description of this Api.
	 * @deprecated since MediaWiki core 1.25
	 * @return string
	 */
	public function getDescription() {
		return 'Returns data needed for mobile views';
	}

	/**
	 * Returns some Api request examples for mobile Api.
	 * @deprecated since MediaWiki core 1.25
	 * @return array
	 */
	public function getExamples() {
		return array(
			'api.php?action=mobileview&page=Doom_metal&sections=0',
			'api.php?action=mobileview&page=Candlemass&sections=0|references',
			'api.php?action=mobileview&page=Candlemass&sections=1-|references',
		);
	}

	/**
	 * Returns usage examples for this module.
	 * @see ApiBase::getExamplesMessages()
	 */
	protected function getExamplesMessages() {
		return array(
			'action=mobileview&page=Doom_metal&sections=0'
				=> 'apihelp-mobileview-example-1',
			'action=mobileview&page=Candlemass&sections=0|references'
				=> 'apihelp-mobileview-example-2',
			'action=mobileview&page=Candlemass&sections=1-|references'
				=> 'apihelp-mobileview-example-3',
		);
	}

	/**
	 * Returns the Help URL for this Api
	 * @return string
	 */
	public function getHelpUrls() {
		return 'https://www.mediawiki.org/wiki/Extension:MobileFrontend#action.3Dmobileview';
	}
}
