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
			// MFDefaultEditor should be `source`, `visual`, or `preference`
			// `preference` means to fall back on the desktop `visualeditor-editor` setting (if VE has been used)
			// editor.js
			'wgMFDefaultEditor' => $config->get( 'MFDefaultEditor' ),
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
		$mobileContext = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );

		if ( $mobileContext->shouldDisplayMobileView() ) {
			// mobile.init
			$vars['wgMFIsSupportedEditRequest'] = self::isSupportedEditRequest( $out->getContext() );
		}
	}

	/**
	 * Decide whether to bother showing the wikitext editor at all.
	 * If not, we expect the editor initialisation JS to activate.
	 *
	 * @param Article $article The article being viewed.
	 * @param User $user The user-specific settings.
	 * @return bool Whether to show the wikitext editor or not.
	 */
	public static function onCustomEditor( Article $article, User $user ) {
		$req = $article->getContext()->getRequest();
		$title = $article->getTitle();
		if (
			!$req->getVal( 'mfnoscript' ) &&
			self::isSupportedEditRequest( $article->getContext() )
		) {
			$params = $req->getValues();
			$params['mfnoscript'] = '1';
			$url = wfScript() . '?' . wfArrayToCgi( $params );
			$escapedUrl = htmlspecialchars( $url );

			$out = $article->getContext()->getOutput();
			$titleMsg = $title->exists() ? 'editing' : 'creating';
			$out->setPageTitle( wfMessage( $titleMsg, $title->getPrefixedText() ) );

			if ( $title->inNamespace( NS_FILE ) && !$title->exists() ) {
				// Is a new file page (enable upload image only) T60311
				$out->addWikiMsg( 'mobile-frontend-editor-uploadenable' );
			} else {
				$out->addWikiMsg( 'mobile-frontend-editor-toload', wfExpandUrl( $url ) );
			}

			// Redirect if the user has no JS (<noscript>)
			$out->addHeadItem(
				'mf-noscript-fallback',
				"<noscript><meta http-equiv=\"refresh\" content=\"0; url=$escapedUrl\"></noscript>"
			);
			// Redirect if the user has no ResourceLoader
			$out->addScript( Html::inlineScript(
				"(window.NORLQ=window.NORLQ||[]).push(" .
					"function(){" .
						"location.href=\"$url\";" .
					"}" .
				");"
			) );
			$out->setRevisionId( $req->getInt( 'oldid', $article->getRevIdFetched() ) );
			return false;
		}
		return true;
	}

	/**
	 * Whether the custom editor override should occur
	 *
	 * @param IContextSource $context
	 * @return bool Whether the frontend JS should try to display an editor
	 */
	protected static function isSupportedEditRequest( IContextSource $context ) {
		$mobileContext = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		if ( !$mobileContext->shouldDisplayMobileView() ) {
			return false;
		}

		$extensionRegistry = ExtensionRegistry::getInstance();
		$editorAvailableSkins = $extensionRegistry->getAttribute( 'MobileFrontendEditorAvailableSkins' );
		if ( !in_array( $context->getSkin()->getSkinName(), $editorAvailableSkins ) ) {
			// Mobile editor commonly doesn't work well with other skins than Minerva (it looks horribly
			// broken without some styles that are only defined by Minerva). So we only enable it for the
			// skin that wants it.
			return false;
		}

		$req = $context->getRequest();
		$title = $context->getTitle();

		// Various things fall back to WikiEditor
		if ( $req->getVal( 'action' ) == 'submit' ) {
			// Don't try to take over if the form has already been submitted
			return false;
		}
		if ( $title->inNamespace( NS_SPECIAL ) ) {
			return false;
		}
		if ( $title->getContentModel() !== 'wikitext' ) {
			// Only load the wikitext editor on wikitext. Otherwise we'll rely on the fallback behaviour
			// (You can test this on MediaWiki:Common.css) ?action=edit url (T173800)
			return false;
		}
		if ( $req->getVal( 'undo' ) !== null || $req->getVal( 'undoafter' ) !== null ) {
			// Undo needs to show a diff above the editor
			return false;
		}
		if ( $req->getVal( 'section' ) == 'new' ) {
			// New sections need a title field
			return false;
		}
		return true;
	}

}
