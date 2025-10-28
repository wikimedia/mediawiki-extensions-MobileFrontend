<?php

use MediaWiki\Config\Config;
use MediaWiki\Context\IContextSource;
use MediaWiki\Hook\CustomEditorHook;
use MediaWiki\MediaWikiServices;
use MediaWiki\Output\Hook\MakeGlobalVariablesScriptHook;
use MediaWiki\Output\OutputPage;
use MediaWiki\Page\Article;
use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\User\User;

class MobileFrontendEditorHooks implements
	CustomEditorHook,
	MakeGlobalVariablesScriptHook
{

	/**
	 * Return messages in content language, for use in a ResourceLoader module.
	 *
	 * @param Context $context
	 * @param Config $config
	 * @param array $messagesKeys
	 * @return array
	 */
	public static function getContentLanguageMessages(
		Context $context, Config $config, array $messagesKeys = []
	): array {
		return array_combine(
			$messagesKeys,
			array_map( static function ( $key ) {
				return wfMessage( $key )->inContentLanguage()->text();
			}, $messagesKeys )
		);
	}

	/**
	 * Generate config for usage inside MobileFrontend
	 * This should be used for variables which:
	 *  - vary with the html
	 *  - should work cross skin including anonymous users.
	 *
	 * @return array
	 */
	public static function getResourceLoaderMFConfigVars() {
		$config = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Config' );

		return [
			'wgMFDefaultEditor' => $config->get( 'MFDefaultEditor' ),
			'wgMFFallbackEditor' => $config->get( 'MFFallbackEditor' ),
			'wgMFEnableVEWikitextEditor' => $config->get( 'MFEnableVEWikitextEditor' ),
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
	public function onMakeGlobalVariablesScript( &$vars, $out ): void {
		/** @var MobileContext $mobileContext */
		$mobileContext = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$config = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Config' );

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
	public function onCustomEditor( $article, $user ) {
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
			$out->setPageTitleMsg( wfMessage( $titleMsg, $title->getPrefixedText() ) );

			$msgParams = [];
			if ( $title->inNamespace( NS_FILE ) && !$title->exists() ) {
				// Is a new file page (enable upload image only) T60311
				$msg = 'mobile-frontend-editor-uploadenable';
			} else {
				$msg = 'mobile-frontend-editor-toload';
				$urlUtils = MediaWikiServices::getInstance()->getUrlUtils();
				$msgParams[] = $urlUtils->expand( $url, PROTO_CURRENT );
			}
			// @phan-suppress-next-line PhanTypeMismatchArgumentNullable Only null for invalid URL, shouldn't happen
			$out->showPendingTakeover( $url, $msg, ...$msgParams );

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
		/** @var MobileContext $mobileContext */
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
		if ( $req->getRawVal( 'action' ) === 'submit' ) {
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
		if ( $req->getCheck( 'undo' ) || $req->getCheck( 'undoafter' ) ) {
			// Undo needs to show a diff above the editor
			return false;
		}
		if ( $req->getRawVal( 'section' ) === 'new' ) {
			// New sections need a title field
			return false;
		}
		return true;
	}

}
