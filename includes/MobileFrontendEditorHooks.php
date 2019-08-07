<?php

use MediaWiki\MediaWikiServices;

class MobileFrontendEditorHooks {
	/**
	 * Generate config for usage inside MobileFrontend
	 * This should be used for variables which:
	 *  - vary with the html
	 *  - variables that should work cross skin including anonymous users
	 *  - used for both, stable and beta mode (don't use
	 *    MobileContext::isBetaGroupMember in this function - T127860)
	 *
	 * @return array
	 */
	public static function getResourceLoaderMFConfigVars() {
		$config = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Config' );

		return [
			// EditorOverlayBase.js
			'wgMFEditorOptions' => $config->get( 'MFEditorOptions' ),
			// schemaEditAttemptStep.js
			'wgMFSchemaEditAttemptStepOversample' => $config->get( 'MFSchemaEditAttemptStepOversample' ),

		];
	}

	/**
	 * Handler for MakeGlobalVariablesScript hook.
	 * For values that depend on the current page, user or request state.
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/MakeGlobalVariablesScript
	 * @param array &$vars Variables to be added into the output
	 * @param OutputPage $out OutputPage instance calling the hook
	 */
	public static function onMakeGlobalVariablesScript( array &$vars, OutputPage $out ) {
		$title = $out->getTitle();
		$services = MediaWikiServices::getInstance();
		$config = $services->getService( 'MobileFrontend.Config' );
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );

		if ( $context->shouldDisplayMobileView() ) {
			// MFDefaultEditor should be `source`, `visual`, `preference`, or `abtest`.
			// `preference` means to fall back on the desktop `visualeditor-editor` setting.
			// `abtest` means to split between source and visual 50/50
			$defaultEditor = $config->get( 'MFDefaultEditor' );
			// Handle the ABTest case
			if ( $defaultEditor === 'abtest' ) {
				$user = $context->getUser();
				if ( $user->isAnon() ) {
					$cookie = $context->getRequest()->getCookie( 'MFDefaultEditorABToken' );
					if ( !$cookie ) {
						$cookie = MWCryptRand::generateHex( 32 );
						$context->getRequest()->response()->setCookie(
							'MFDefaultEditorABToken', $cookie, time() + ( 90 * 86400 )
						);
					}
					$vars['wgMFSchemaEditAttemptStepAnonymousUserId'] = $cookie;
					$anonid = base_convert( substr( $cookie, 0, 8 ), 16, 10 );
					$defaultEditor = $anonid % 2 === 0 ? 'source' : 'visual';
					$vars['wgMFSchemaEditAttemptStepBucket'] = 'default-' . $defaultEditor;
				} elseif ( $user->getEditCount() <= 100 ) {
					$defaultEditor = $user->getId() % 2 === 0 ? 'source' : 'visual';
					$vars['wgMFSchemaEditAttemptStepBucket'] = 'default-' . $defaultEditor;
				} else {
					$defaultEditor = 'source';
				}
			}

			// editor.js
			$vars['wgMFDefaultEditor'] = $defaultEditor;

			// mobile.init
			$vars['wgMFIsPageContentModelEditable'] = self::isPageContentModelEditable( $title );
			// Accesses getBetaGroupMember so does not belong in onResourceLoaderGetConfigVars
		}
	}

	/**
	 * On login, if user has a MFDefaultEditorABToken cookie, clear it
	 *
	 * @param User $user The user-specific settings.
	 */
	public static function onUserLoggedIn( $user ) {
		RequestContext::getMain()->getRequest()->response()->clearCookie( 'MFDefaultEditorABToken' );
	}

	/**
	 * ResourceLoaderRegisterModules hook handler.
	 *
	 * Registers:
	 *
	 * * Modules for the Visual Editor overlay, if the VisualEditor extension is loaded
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderRegisterModules
	 *
	 * @param ResourceLoader &$resourceLoader
	 */
	public static function onResourceLoaderRegisterModules( ResourceLoader &$resourceLoader ) {
		$resourceBoilerplate = [
			'localBasePath' => dirname( __DIR__ ),
			'remoteExtPath' => 'MobileFrontend',
		];

		// add VisualEditor related modules only, if VisualEditor seems to be installed - T85007
		if ( ExtensionRegistry::getInstance()->isLoaded( 'VisualEditor' ) ) {
			$resourceLoader->register( [
				'mobile.editor.ve' => $resourceBoilerplate + [
					'dependencies' => [
						'ext.visualEditor.mobileArticleTarget',
						'mobile.editor.overlay',
						'mobile.startup',
					],
					'scripts' => 'resources/dist/mobile.editor.ve.js',
					'targets' => [
						'mobile',
					],
				],
			] );
		}

		// If using MFContentProviderScriptPath, register contentProviderApi module to
		// fix cors issues with visual editor
		$config = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Config' );
		$contentProviderApi = $config->get( 'MFContentProviderScriptPath' );
		if ( $contentProviderApi ) {
			$resourceLoader->register( [
				'mobile.contentProviderApi' => $resourceBoilerplate + [
					'targets' => [ 'mobile', 'desktop' ],
					'scripts' => 'resources/mobile.contentProviderApi.js'
				]
			] );
		}
	}

	/**
	 * Checks whether the editor can handle the existing content handler type.
	 *
	 * @param Title $title
	 * @return bool
	 */
	protected static function isPageContentModelEditable( Title $title ) {
		$contentHandler = ContentHandler::getForTitle( $title );

		return $contentHandler->supportsDirectEditing()
			&& $contentHandler->supportsDirectApiEditing();
	}

}
