<?php
/**
 * ApiWebappManifest.php
 */

/**
 * Return the webapp manifest for this wiki
 */
class ApiWebappManifest extends ApiBase {

	/**
	 * Execute the requested Api actions.
	 */
	public function execute() {
		$config = $this->getConfig();
		$resultObj = $this->getResult();
		$resultObj->addValue( null, 'name', $config->get( 'Sitename' ) );
		$resultObj->addValue( null, 'orientation', 'portrait' );
		$resultObj->addValue( null, 'dir', $config->get( 'ContLang' )->getDir() );
		$resultObj->addValue( null, 'lang', $config->get( 'LanguageCode' ) );
		$resultObj->addValue( null, 'display', 'browser' );
		$resultObj->addValue( null, 'theme_color', $config->get( 'MFManifestThemeColor' ) );
		$resultObj->addValue( null, 'background_color', $config->get( 'MFManifestBackgroundColor' ) );
		$resultObj->addValue( null, 'start_url', Title::newMainPage()->getLocalUrl() );

		$icons = [];

		$appleTouchIcon = $config->get( 'AppleTouchIcon' );
		if ( $appleTouchIcon !== false ) {
			$appleTouchIconUrl = wfExpandUrl( $appleTouchIcon, PROTO_RELATIVE );
			$request = MWHttpRequest::factory( $appleTouchIconUrl );
			$request->execute();
			$appleTouchIconContent = $request->getContent();
			if ( !empty( $appleTouchIconContent ) ) {
				$appleTouchIconSize = getimagesizefromstring( $appleTouchIconContent );
			}
			$icon = [
				'src' => $appleTouchIcon
			];
			if ( isset( $appleTouchIconSize ) && $appleTouchIconSize !== false ) {
				$icon['sizes'] = $appleTouchIconSize[0].'x'.$appleTouchIconSize[1];
				$icon['type'] = $appleTouchIconSize['mime'];
			}
			$icons[] = $icon;
		}

		$resultObj->addValue( null, 'icons', $icons );

		$main = $this->getMain();
		$main->setCacheControl( [ 's-maxage'=>86400, 'max-age'=>86400 ] );
		$main->setCacheMode( 'public' );
	}

	public function getCustomPrinter() {
		return new ApiFormatJson( $this->getMain(), 'json' );
	}

}
