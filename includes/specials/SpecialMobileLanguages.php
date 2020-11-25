<?php

use MediaWiki\Languages\LanguageConverterFactory;
use MediaWiki\Languages\LanguageNameUtils;

/**
 * Provides a list of languages available for a page
 */
class SpecialMobileLanguages extends MobileSpecialPage {
	/** @var Title Saves the title object to get languages for */
	private $title;

	/** @var ILanguageConverter */
	private $languageConverter;

	/** @var LanguageNameUtils */
	private $languageNameUtils;

	/**
	 * @param LanguageConverterFactory $languageConverterFactory
	 * @param LanguageNameUtils $languageNameUtils
	 */
	public function __construct(
		LanguageConverterFactory $languageConverterFactory,
		LanguageNameUtils $languageNameUtils
	) {
		parent::__construct( 'MobileLanguages' );
		$this->languageConverter = $languageConverterFactory->getLanguageConverter( $this->getContentLanguage() );
		$this->languageNameUtils = $languageNameUtils;
	}

	/**
	 * Returns an array of languages that the page is available in
	 * @return array
	 */
	private function getLanguages() {
		$api = new ApiMain(
			new DerivativeRequest(
				$this->getRequest(),
				[
					'action' => 'query',
					'prop' => 'langlinks',
					'llprop' => 'url',
					'lllimit' => 'max',
					'titles' => $this->title->getPrefixedText()
				]
			)
		);

		$api->execute();
		$data = (array)$api->getResult()->getResultData( [ 'query', 'pages' ],
			[ 'Strip' => 'all' ] );

		return $this->processLanguages( $data );
	}

	/**
	 * Processes languages to add 'langname' property, update 'url' property to mobile domain,
	 * and sort languages in case-insensitive order.
	 *
	 * @param array $data list of languages to process
	 * @return array list of processed languages
	 */
	protected function processLanguages( $data ) {
		// Silly strict php
		$pages = array_values( $data );
		$page = array_shift( $pages );

		if ( isset( $page['langlinks'] ) ) {
			// Set the name of each language based on the system list of language names
			$languageMap = $this->languageNameUtils->getLanguageNames();
			$languages = $page['langlinks'];
			foreach ( $page['langlinks'] as $index => $langObject ) {
				if ( !$this->isLanguageObjectValid( $languageMap, $langObject ) ) {
					unset( $languages[$index] );
					continue;
				}
				$langObject['langname'] = $languageMap[$langObject['lang']];
				$langObject['url'] = $this->mobileContext->getMobileUrl( $langObject['url'] );
				$languages[$index] = $langObject;
			}
			$compareLanguage = function ( $a, $b ) {
				return strcasecmp( $a['langname'], $b['langname'] );
			};
			usort( $languages, $compareLanguage );
			return $languages;
		} else {
			// No langlinks available
			return [];
		}
	}

	/**
	 * Verify if passed language object contains all necessary information
	 *
	 * @see https://phabricator.wikimedia.org/T93500
	 * @see https://phabricator.wikimedia.org/T172316
	 * @param array $languageMap array of language names, indexed by code.
	 * @param array $langObject with lang and url keys. If url key is not present a warning
	 *   will be logged.
	 * @return bool
	 */
	private function isLanguageObjectValid( $languageMap, $langObject ) {
		if ( !isset( $languageMap[$langObject['lang']] ) ) {
			// Bug T93500: DB might still have preantiquated rows with bogus languages
			return false;
		}
		if ( !array_key_exists( 'url', $langObject ) ) {
			// Bug T172316: Some lang objects do not have url. We would like to log those instances
			\MediaWiki\Logger\LoggerFactory::getInstance( MobileContext::LOGGER_CHANNEL )->warning(
				'`url` key is undefined in language object',
				[
					'uri' => $this->getRequest()->getFullRequestURL(),
					'langObject' => $langObject,
				]
			);
			return false;
		}
		return true;
	}

	/**
	 * Returns an array of language variants that the page is available in
	 * @return array
	 */
	private function getLanguageVariants() {
		$pageLang = $this->title->getPageLanguage();
		if ( $this->languageConverter->hasVariants() ) {
			$pageLangCode = $pageLang->getCode();
			$output = [];
			// Loops over each variant
			$variants = $this->languageConverter->getVariants();
			foreach ( $variants as $code ) {
				// Gets variant name from language code
				$varname = $pageLang->getVariantname( $code );
				// Don't list the current variant
				if ( $varname !== $pageLangCode ) {
					// Appends variant link
					$output[] = [
						'langname' => $varname,
						'url' => $this->title->getLocalURL( [ 'variant' => $code ] ),
						'lang' => LanguageCode::bcp47( $code ),
					];
				}
			}
			return $output;
		}

		// No variants
		return [];
	}

	/**
	 * Generates a <li> element for a particular language/variant
	 *
	 * @param array $langObject Array of data about the language link
	 * @return string
	 */
	private function makeLangListItem( $langObject ) {
		$html = Html::openElement( 'li' ) .
			Html::element( 'a', [
				'href' => $langObject['url'],
				'hreflang' => $langObject['lang'],
				'lang' => $langObject['lang'],
				'title' => $langObject['*'] ?? $langObject['langname']
			], $langObject['langname'] ) .
			Html::closeElement( 'li' );

		return $html;
	}

	/**
	 * Render the page with a list of languages the page is available in
	 * @param string|null $pagename The name of the page
	 * @throws ErrorPageError
	 */
	public function executeWhenAvailable( $pagename ) {
		$output = $this->getOutput();
		if ( !is_string( $pagename ) || $pagename === '' ) {
			$output->setStatusCode( 404 );
			throw new ErrorPageError(
				$this->msg( 'mobile-frontend-languages-404-title' ),
				$this->msg( 'mobile-frontend-languages-404-desc' )
			);
		}

		$this->title = Title::newFromText( $pagename );

		$html = '';
		if ( $this->title && $this->title->exists() ) {
			$titlename = $this->title->getPrefixedText();
			$pageTitle = $this->msg( 'mobile-frontend-languages-header-page',
				$titlename )->text();
			$languages = $this->getLanguages();
			$variants = $this->getLanguageVariants();
			$languagesCount = count( $languages );
			$variantsCount = count( $variants );

			$html .= Html::element( 'p', [],
				$this->msg( 'mobile-frontend-languages-text' )
					->params( $titlename )->numParams( $languagesCount )->text()
			);
			$html .= Html::openElement( 'p' );
			$html .= Html::element( 'a',
				[ 'href' => $this->title->getLocalURL() ],
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
							[ 'id' => 'mw-mf-language-variant-header' ],
							$variantHeader
					);
					$html .= Html::openElement( 'ul',
						[ 'id' => 'mw-mf-language-variant-selection' ]
					);

					foreach ( $variants as $val ) {
						$html .= $this->makeLangListItem( $val );
					}
					$html .= Html::closeElement( 'ul' );
				}

				// Then other languages
				if ( $languagesCount > 0 ) {
					$languageHeader = $this->msg( 'mobile-frontend-languages-header' )->text();
					$html .= Html::element( 'h2', [ 'id' => 'mw-mf-language-header' ], $languageHeader )
						. Html::openElement( 'ul', [ 'id' => 'mw-mf-language-selection' ] );
					foreach ( $languages as $val ) {
						$html .= $this->makeLangListItem( $val );
					}
					$html .= Html::closeElement( 'ul' );
				}
			}
		} else {
			$pageTitle = $this->msg( 'mobile-frontend-languages-header' )->text();
			$html .= Html::element( 'p', [],
				$this->msg( 'mobile-frontend-languages-nonexistent-title' )->params( $pagename )->text() );
		}

		$output->setPageTitle( $pageTitle );
		$output->addHTML( $html );
	}
}
