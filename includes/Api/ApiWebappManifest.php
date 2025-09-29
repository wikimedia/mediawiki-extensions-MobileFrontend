<?php

namespace MobileFrontend\Api;

use MediaWiki\Api\ApiBase;
use MediaWiki\Api\ApiFormatJson;
use MediaWiki\Api\ApiMain;
use MediaWiki\Http\HttpRequestFactory;
use MediaWiki\Language\Language;
use MediaWiki\Title\Title;
use MediaWiki\Utils\UrlUtils;

/**
 * Return the webapp manifest for this wiki
 */
class ApiWebappManifest extends ApiBase {

	public function __construct(
		ApiMain $main,
		string $action,
		private readonly Language $contentLanguage,
		private readonly HttpRequestFactory $httpRequestFactory,
		private readonly UrlUtils $urlUtils,
	) {
		parent::__construct( $main, $action );
	}

	/**
	 * Execute the requested Api actions.
	 */
	public function execute() {
		$config = $this->getConfig();
		$resultObj = $this->getResult();
		$resultObj->addValue( null, 'name', $config->get( 'Sitename' ) );
		$resultObj->addValue( null, 'orientation', 'portrait' );
		$resultObj->addValue( null, 'dir', $this->contentLanguage->getDir() );
		$resultObj->addValue( null, 'lang', $config->get( 'LanguageCode' ) );
		$resultObj->addValue( null, 'display', 'minimal-ui' );
		$resultObj->addValue( null, 'theme_color', $config->get( 'MFManifestThemeColor' ) );
		$resultObj->addValue( null, 'background_color', $config->get( 'MFManifestBackgroundColor' ) );
		$resultObj->addValue( null, 'start_url', Title::newMainPage()->getLocalURL() );

		$icons = [];

		$appleTouchIcon = $config->get( 'AppleTouchIcon' );
		if ( $appleTouchIcon !== false ) {
			$appleTouchIconUrl = $this->urlUtils->expand( $appleTouchIcon, PROTO_CURRENT ) ?? '';
			$request = $this->httpRequestFactory->create( $appleTouchIconUrl, [], __METHOD__ );
			$request->execute();
			$appleTouchIconContent = $request->getContent();
			if ( $appleTouchIconContent !== '' ) {
				$appleTouchIconSize = getimagesizefromstring( $appleTouchIconContent );
			}
			$icon = [
				'src' => $appleTouchIcon
			];
			if ( isset( $appleTouchIconSize ) && $appleTouchIconSize !== false ) {
				$icon['sizes'] = $appleTouchIconSize[0] . 'x' . $appleTouchIconSize[1];
				$icon['type'] = $appleTouchIconSize['mime'];
			}
			$icons[] = $icon;
		}

		$resultObj->addValue( null, 'icons', $icons );

		$main = $this->getMain();
		$main->setCacheControl( [ 's-maxage' => 86400, 'max-age' => 86400 ] );
		$main->setCacheMode( 'public' );
	}

	/**
	 * Get the JSON printer
	 *
	 * @return ApiFormatJson
	 */
	public function getCustomPrinter() {
		return new ApiFormatJson( $this->getMain(), 'json' );
	}

}
