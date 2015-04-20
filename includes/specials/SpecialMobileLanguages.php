<?php
/**
 * SpecialMobileLanguages.php
 */

/**
 * Provides a list of languages available for a page
 */
class SpecialMobileLanguages extends MobileSpecialPage {
	/** @var Title $title Saves the title object to get languages for */
	private $title;

	/**
	 * Construct function
	 */
	public function __construct() {
		parent::__construct( 'MobileLanguages' );
	}

	/**
	 * Returns an array of languages that the page is available in
	 * @return array
	 */
	private function getLanguages() {
		$api = new ApiMain(
			new DerivativeRequest(
				$this->getRequest(),
				array(
					'action' => 'query',
					'prop' => 'langlinks',
					'llurl' => true,
					'lllimit' => 'max',
					'titles' => $this->title->getPrefixedText()
				)
			)
		);

		$api->execute();
		if ( defined( 'ApiResult::META_CONTENT' ) ) {
			$data = (array)$api->getResult()->getResultData( array( 'query', 'pages' ),
				array( 'Strip' => 'all' ) );
		} else {
			$data = $api->getResult()->getData();
			// Paranoia
			if ( !isset( $data['query']['pages'] ) ) {
				return array();
			}
			$data = $data['query']['pages'];
		}

		// Silly strict php
		$pages = array_values( $data );
		$page = array_shift( $pages );

		if ( isset( $page['langlinks'] ) ) {
			// Set the name of each lanugage based on the system list of language names
			$languageMap = Language::fetchLanguageNames();
			$languages = $page['langlinks'];
			foreach ( $page['langlinks'] as $code => $langObject ) {
				if ( !isset( $languageMap[$langObject['lang']] ) ) {
					// Bug T93500: DB might still have preantiquated rows with bogus languages
					unset( $languages[$code] );
					continue;
				}
				$langObject['langname'] = $languageMap[$langObject['lang']];
				$langObject['url'] = MobileContext::singleton()->getMobileUrl( $langObject['url'] );
				$languages[$code] = $langObject;
			}
			return $languages;
		} else {
			// No langlinks available
			return array();
		}
	}

	/**
	 * Returns an array of language variants that the page is available in
	 * @return array
	 */
	private function getLanguageVariants() {
		$pageLang = $this->title->getPageLanguage();
		$variants = $pageLang->getVariants();
		if ( count( $variants ) > 1 ) {
			$pageLangCode = $pageLang->getCode();
			$output = array();
			// Loops over each variant
			foreach ( $variants as $code ) {
				// Gets variant name from language code
				$varname = $pageLang->getVariantname( $code );
				// Don't list the current variant
				if ( $varname !== $pageLangCode ) {
					// Appends variant link
					$output[] = array(
						'langname' => $varname,
						'url' => $this->title->getLocalURL( array( 'variant' => $code ) ),
						'lang' => wfBCP47( $code )
					);
				}
			}
			return $output;
		} else {
			// No variants
			return array();
		}
	}

	/**
	 * Generates a <li> element for a particular language/variant
	 *
	 * @param array $langObject Array of data about the language link
	 * @return string
	 */
	private function makeLangListItem( $langObject ) {
		$html = Html::openElement( 'li' ) .
			Html::element( 'a', array(
				'href' => $langObject['url'],
				'hreflang' => $langObject['lang'],
				'lang' => $langObject['lang'],
				'title' => isset( $langObject['*'] ) ? $langObject['*'] : $langObject['langname']
			), $langObject['langname'] ) .
			Html::closeElement( 'li' );

		return $html;
	}

	/**
	 * Render the page with a list of languages the page is available in
	 * @param string $pagename The name of the page
	 */
	public function executeWhenAvailable( $pagename ) {
		if ( $pagename === '' ) {
			wfHttpError( 404, $this->msg( 'mobile-frontend-languages-404-title' )->text(),
				$this->msg( 'mobile-frontend-languages-404-desc' )->text()
			);

			return;
		}

		$this->title = Title::newFromText( $pagename );

		$output = $this->getOutput();

		$html = Html::openElement( 'div', array( 'class' => 'content' ) );

		if ( $this->title && $this->title->exists() ) {
			$titlename = $this->title->getPrefixedText();
			$pageTitle = $this->msg( 'mobile-frontend-languages-header-page',
				$titlename )->text();
			$languages = $this->getLanguages();
			$variants = $this->getLanguageVariants();
			$languagesCount = count( $languages );
			$variantsCount = count( $variants );

			$html .= Html::element( 'p', array(),
				$this->msg( 'mobile-frontend-languages-text' )
					->params( $titlename )->numParams( $languagesCount )->text()
			);
			$html .= Html::openElement( 'p' );
			$html .= Html::element( 'a',
				array( 'href' => $this->title->getLocalUrl() ),
				$this->msg( 'returnto', $titlename )->text()
			);
			$html .= Html::closeElement( 'p' );

			if ( $languagesCount > 0 || $variantsCount > 1 ) {
				// Language variants first
				if ( $variantsCount > 1 ) {
					$variantHeader = $variantsCount > 1
						? $this->msg( 'mobile-frontend-languages-variant-header' )->text()
						: '';
					$html .= Html::element( 'h2',
							array( 'id' => 'mw-mf-language-variant-header' ),
							$variantHeader
					);
					$html .= Html::openElement( 'ul',
						array( 'id' => 'mw-mf-language-variant-selection' )
					);

					foreach ( $variants as $val ) {
						$html .= $this->makeLangListItem( $val );
					}
					$html .= Html::closeElement( 'ul' );
				}

				// Then other languages
				if ( $languagesCount > 0 ) {
					$languageHeader = $this->msg( 'mobile-frontend-languages-header' )->text();
					$html .= Html::element( 'h2', array( 'id' => 'mw-mf-language-header' ), $languageHeader )
						. Html::openElement( 'ul', array( 'id' => 'mw-mf-language-selection' ) );
					foreach ( $languages as $val ) {
						$html .= $this->makeLangListItem( $val );
					}
					$html .= Html::closeElement( 'ul' );
				}
			}
		} else {
			$pageTitle = $this->msg( 'mobile-frontend-languages-header' )->text();
			$html .= Html::element( 'p', array(),
				$this->msg( 'mobile-frontend-languages-nonexistent-title' )->params( $pagename )->text() );
		}

		$html .= Html::closeElement( 'div' );

		$output->setPageTitle( $pageTitle );
		$output->addHTML( $html );
	}
}
