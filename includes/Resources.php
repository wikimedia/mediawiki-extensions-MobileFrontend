<?php
/**
 * Definition of MobileFrontend's ResourceLoader modules.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 *
 * @file
 */

if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

/**
 * An array of modules that should be loaded at the top of the page via addModuleStyles
 * These modules should not contain any scripts or templates and care should be taken with
 * these with respect to caching.
**/
$wgMinervaStyleModules = array(
	'skins.minerva.base.reset' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.base.reset/reset.less',
		),
	),

	'skins.minerva.base.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.base.styles/ui.less',
			'resources/skins.minerva.base.styles/pageactions.less',
			'resources/skins.minerva.base.styles/footer.less',
			'resources/skins.minerva.base.styles/common.less',
			'resources/skins.minerva.base.styles/icons.less',
		),
	),

	'skins.minerva.content.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.content.styles/styles.less',
		),
	),
	'mobile.pagelist.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/mobile.pagelist.styles/pagelist.less',
		),
	),
	'mobile.pagesummary.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/mobile.pagesummary.styles/pagesummary.less',
		),
	),
	'skins.minerva.tablet.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.tablet.styles/common.less',
			'resources/skins.minerva.tablet.styles/hacks.less',
		),
	),
	'skins.minerva.icons.images' => $wgMFResourceFileModuleBoilerplate + array(
		'class' => 'ResourceLoaderImageModule',
		'prefix' => 'mw-ui',
		'selector' => '.mw-ui-icon-{name}:before',
		// Note: currently doesn't do anything due to T97410
		'position' => 'bottom',
		'images' => array(
			// IMPORTANT: Do not add anything here unless it's necessary to be loaded without
			// JavaScript (e.g. menu chrome).
			// CAUTION: Anything added here will greatly increase the first paint time until
			// T97410 is resolved.
			'notifications' => 'images/icons/bell.svg',
			'mainmenu' => 'images/icons/hamburger.svg',
		)
	),

	'skins.minerva.icons.images.legacy' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.icons.images.legacy/icons.less',
		),
	),

	'skins.minerva.icons.variants.js' => $wgMFResourceFileModuleBoilerplate + array(
		'class' => 'ResourceLoaderImageModule',
		'prefix' => 'mw-ui',
		'selectorWithoutVariant' => '.mw-ui-icon-{name}:before',
		'selectorWithVariant' => '.mw-ui-icon-{name}-{variant}:before',
		'variants' => array(
			'gray' => array(
				'color' => '#BBB',
				'global' => true,
			),
			'invert' => array(
				'color' => '#FFFFFF',
				'global' => true,
			)
		),
		'position' => 'bottom',
		'images' => array(
			// overlay
			'close' => 'images/icons/close.svg',
		),
	),

	'skins.minerva.icons.images.js' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'skins.minerva.icons.variants.js',
		),
		'class' => 'ResourceLoaderImageModule',
		'prefix' => 'mw-ui',
		'selector' => '.mw-ui-icon-{name}:before',
		'position' => 'bottom',
		'images' => array(
			// toggling
			'arrow-down' => 'images/icons/arrow-down.svg',
			'arrow-up' => 'images/icons/arrow-up.svg',

			// page actions
			'talk' => 'images/icons/talk.svg',
			'watch' => 'images/icons/watch.svg',
			'watched' => 'images/icons/watched.svg',
			'edit' => 'images/icons/editLocked.svg',
			'edit-enabled' => 'images/icons/edit.svg',
			'addimage' => 'images/icons/uploadLocked.svg',
			'addimage-enabled' => 'images/icons/upload.svg',

			// TOC
			'toc' => 'images/icons/contents-ltr.svg',

			// Issues
			'cleanup' => 'images/icons/blue-triangle.svg',
			// FIXME: make this a variant of cleanup
			'cleanup-gray' => 'images/icons/gray-triangle.svg',

			// User
			'user' => 'images/icons/userNormal.svg',
			'anonymous' => 'images/icons/userAnonymous.svg',

			// cite
			'citation' => 'images/icons/cite.svg',
		),
	),

	'skins.minerva.mainPage.beta.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.mainPage.beta.styles/common.less',
		),
	),

	'skins.minerva.mainPage.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.mainPage.styles/common.less',
		),
	),

	'skins.minerva.beta.images' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'bottom',
		'class' => 'ResourceLoaderImageModule',
		'selectorWithoutVariant' => '.mw-ui-icon-{name}:before',
		'selectorWithVariant' => '.mw-ui-icon-{name}-{variant}:before',
		'variants' => array(
			'gray' => array(
				'color' => '#555555',
			),
		),
		'images' => array(
			// page actions
			'watch' => 'images/icons/beta/watch.svg',
			'watched' => 'images/icons/beta/watched.svg',
			'edit' => 'images/icons/beta/editLocked.svg',
			'edit-enabled' => 'images/icons/beta/edit.svg',
			// Special:MobileMenu-specific back icon
			'back-mobilemenu' => 'images/icons/beta/back-ltr.svg',
			'search' => array(
				'file' => array(
					'default' => 'images/icons/magnifying-glass.svg',
				),
				'variants' => array( 'gray', 'invert' ),
			)
		),
	),
);

/*
Any modules defined here should come without side effects.
A module prefixed with 'mobile.' should be reusable in any context e.g.
any skin. If you are writing an initialisation script please define it with
the skin.minerva. prefix along with all the others below.
*/
$wgResourceModules = array_merge( $wgResourceModules, array(
	'mobile.modules' => $wgMFResourceFileModuleBoilerplate + array(
		'scripts' => array(
			'resources/mobile.modules/modules.js',
		),
	),
	'mobile.oo' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.modules',
			'oojs',
		),
		'scripts' => array(
			'resources/mobile.oo/Class.js',
			'resources/mobile.oo/eventemitter.js',
		),
	),
	'mobile.view' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.oo',
		),
		'scripts' => array(
			'resources/mobile.view/View.js',
		),
	),
	'mobile.context' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.modules',
		),
		'scripts' => array(
			'resources/mobile.context/context.js',
		),
	),
	'mobile.browser' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.view',
		),
		'scripts' => array(
			'resources/mobile.browser/browser.js',
		),
	),
	'mobile.mainMenu' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.view',
			'mobile.browser',
		),
		'position' => 'bottom',
		'styles' => array(
			'resources/mobile.mainMenu/mainmenu.less',
			'resources/mobile.mainMenu/icons.less',
		),
		'templates' => array(
			'menu.hogan' => 'resources/mobile.mainMenu/menu.mustache',
		),
		'scripts' => array(
			'resources/mobile.mainMenu/MainMenu.js',
		),
	),
	'mobile.messageBox' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.view',
		),
		'position' => 'top',
		'styles' => array(
			'resources/mobile.messageBox/messageBox.less',
		),
		'templates' => array(
			'MessageBox.hogan' => 'resources/mobile.messageBox/MessageBox.mustache',
		),
		'scripts' => array(
			'resources/mobile.messageBox/MessageBox.js',
		),
	),
	'mobile.modifiedBar' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.modules',
			'mediawiki.language',
			'mediawiki.jqueryMsg',
		),
		'scripts' => array(
			'resources/mobile.modifiedBar/time.js',
		),
		'messages' => array(
			// lastEdited.js
			'mobile-frontend-last-modified-with-user-seconds',
			'mobile-frontend-last-modified-with-user-minutes',
			'mobile-frontend-last-modified-with-user-hours',
			'mobile-frontend-last-modified-with-user-days',
			'mobile-frontend-last-modified-with-user-months',
			'mobile-frontend-last-modified-with-user-years',
			'mobile-frontend-last-modified-with-user-just-now',
		),
	),

	'mobile.microAutoSize' => $wgMFResourceFileModuleBoilerplate + array(
		'scripts' => array(
			'libs/micro.js/micro.autosize.js',
		),
	),

	'mediawiki.template.hogan' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mediawiki.template',
		),
		'scripts' => array(
			'libs/hogan.js/hogan.js',
			'resources/mediawiki.template.hogan/hogan.js',
		),
	),

	'mobile.pagelist' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.view',
			'mobile.browser',
			'mobile.pagelist.styles',
			'mobile.pagesummary.styles',
		),
		'scripts' => array(
			'resources/mobile.pagelist/PageList.js',
		),
		'templates' => array(
			'PageListItem.hogan' => 'resources/mobile.pagelist/PageListItem.hogan',
			'PageList.hogan' => 'resources/mobile.pagelist/PageList.hogan',
		),
	),

	'mobile.pagelist.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.watchstar',
			'mobile.pagelist',
		),
		'scripts' => array(
			'resources/mobile.pagelist.scripts/WatchstarPageList.js',
		),
	),

	'mobile.watchlist' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.infiniteScroll',
			'mobile.modifiedBar',
			'mobile.pagelist.scripts',
			'mobile.modifiedBar',
		),
		'scripts' => array(
			'resources/mobile.watchlist/WatchListGateway.js',
			'resources/mobile.watchlist/WatchList.js',
		),
	),

	'mobile.toc' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.loggingSchemas',
			'mobile.toggle',
		),
		'scripts' => array(
			'resources/mobile.toc/TableOfContents.js',
		),
		'styles' => array(
			'resources/mobile.toc/toc.less',
		),
		'templates' => array(
			'toc.hogan' => 'resources/mobile.toc/toc.hogan',
			'heading.hogan' => 'resources/mobile.toc/tocHeading.hogan'
		),
		'messages' => array(
			'toc'
		),
	),

	'mobile.ajax' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'skins.minerva.icons.images.legacy',
		),
		'styles' => array(
			'resources/mobile.ajax/spinner.less',
		),
	),

	'mobile.settings' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'jquery.cookie',
			// Allow use of define
			'mobile.modules',
			'mediawiki.storage',
		),
		'scripts' => array(
			'resources/mobile.settings/settings.js',
		),
	),

	'mobile.backtotop' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.toggle',
		),
		'scripts' => array(
			'resources/mobile.backtotop/BackToTopOverlay.js',
			'resources/mobile.backtotop/backtotop.js',
		),
		'styles' => array(
			'resources/mobile.backtotop/backtotop.less',
		),
		'templates' => array(
			'BackToTopOverlay.hogan' => 'resources/mobile.backtotop/BackToTopOverlay.hogan',
		),
	),

	// FIXME: Split this module into different features.
	'mobile.startup' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.context',
			'mobile.modifiedBar',
			'mobile.browser',
			'mobile.oo',
			'mobile.user',
			'mediawiki.api',
			'mobile.settings',
			'jquery.throttle-debounce',
			'skins.minerva.icons.images.legacy',
		),
		'templates' => array(
			'anchor.hogan' => 'resources/mobile.startup/anchor.hogan',
			'icon.hogan' => 'resources/mobile.startup/icon.hogan',
			'Section.hogan' => 'resources/mobile.startup/Section.hogan',
			'button.hogan' => 'resources/mobile.startup/button.hogan',
		),
		'messages' => array(
			// icons.js
			'mobile-frontend-loading-message',
			'mobile-frontend-console-recruit',
			// Skin.js
			'mobile-frontend-editor-licensing',
			'mobile-frontend-editor-licensing-with-terms',
			'mobile-frontend-editor-terms-link',
		),
		'styles' => array(
			'resources/mobile.startup/panel.less',
		),
		'scripts' => array(
			'resources/mobile.startup/Router.js',
			'resources/mobile.startup/OverlayManager.js',
			// FIXME: Remove api code to mobile.ajax
			'resources/mobile.startup/api.js',
			// FIXME: Move out of mobile.startup
			'resources/mobile.startup/PageGateway.js',
			'resources/mobile.startup/Anchor.js',
			'resources/mobile.startup/Button.js',
			'resources/mobile.startup/Icon.js',
			'resources/mobile.startup/icons.js',
			'resources/mobile.startup/Panel.js',
			'resources/mobile.startup/Section.js',
			'resources/mobile.startup/Thumbnail.js',
			'resources/mobile.startup/Page.js',
			'resources/mobile.startup/Skin.js',
			'resources/mobile.startup/Schema.js',
			'resources/mobile.startup/util.js',
		),
		'position' => 'bottom',
	),

	'mobile.foreignApi' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mediawiki.ForeignApi.core',
		),
		'scripts' => array(
			'resources/mobile.foreignApi/JSONPForeignApi.js',
		),
	),

	'mobile.user' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mediawiki.user',
			'mediawiki.storage',
			// Ensure M.define exists
			'mobile.modules',
		),
		'scripts' => array(
			'resources/mobile.user/user.js',
		),
	),

	'mobile.abusefilter' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			'mobile.startup',
		),
		'templates' => array(
			'Overlay.hogan' => 'resources/mobile.abusefilter/AbuseFilterOverlay.hogan',
			'Panel.hogan' => 'resources/mobile.abusefilter/AbuseFilterPanel.hogan',
		),
		'scripts' => array(
			'resources/mobile.abusefilter/AbuseFilterOverlay.js',
			'resources/mobile.abusefilter/AbuseFilterPanel.js',
		),
		'messages' => array(
			// AbuseFilterOverlay
			'mobile-frontend-photo-ownership-confirm',
			// AbuseFilterPanel
			'mobile-frontend-editor-abusefilter-warning',
			'mobile-frontend-editor-abusefilter-disallow',
			'mobile-frontend-editor-abusefilter-read-more',
		),
	),

	'mobile.editor.api' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			// Api
			'mobile.startup',
			'mobile.abusefilter',
		),
		'scripts' => array(
			'resources/mobile.editor.api/EditorGateway.js',
		),
	),

	'mobile.editor.common' => $wgMFResourceParsedMessageModuleBoilerplate + array(
		'dependencies' => array(
			'oojs-ui',
			'mobile.overlays',
			'mobile.editor.api',
			'mobile.settings',
			'mobile.drawers',
			'mobile.toast',
			'mobile.messageBox',
			'mediawiki.confirmCloseWindow',
		),
		'scripts' => array(
			'resources/mobile.editor.common/EditorOverlayBase.js',
		),
		'styles' => array(
			'resources/mobile.editor.common/editor.less',
		),
		'templates' => array(
			'editHeader.hogan' => 'resources/mobile.editor.common/editHeader.hogan',
			'previewHeader.hogan' => 'resources/mobile.editor.common/previewHeader.hogan',
			'saveHeader.hogan' => 'resources/mobile.editor.common/saveHeader.hogan',
			'EditorOverlayBase.hogan' => 'resources/mobile.editor.common/EditorOverlayBase.hogan',
			'EditorOverlayAnonWarning.hogan' =>
				'resources/mobile.editor.common/EditorOverlayAnonWarning.hogan',
		),
		'messages' => array(
			// modules/editor/EditorOverlay.js
			'mobile-frontend-editor-continue',
			'mobile-frontend-editor-cancel',
			'mobile-frontend-editor-keep-editing',
			'mobile-frontend-editor-placeholder',
			'mobile-frontend-editor-placeholder-new-page',
			'mobile-frontend-editor-summary',
			'mobile-frontend-editor-summary-request',
			'mobile-frontend-editor-summary-placeholder',
			'mobile-frontend-editor-cancel-confirm',
			'mobile-frontend-editor-new-page-confirm',
			'mobile-frontend-editor-wait',
			'mobile-frontend-editor-success',
			'mobile-frontend-editor-success-landmark-1' => array( 'parse' ),
			'mobile-frontend-editor-success-new-page',
			'mobile-frontend-editor-refresh',
			'mobile-frontend-editor-error',
			'mobile-frontend-editor-error-conflict',
			'mobile-frontend-editor-error-loading',
			'mobile-frontend-editor-error-preview',
			'mobile-frontend-account-create-captcha-placeholder',
			'mobile-frontend-editor-captcha-try-again',
			'mobile-frontend-editor-editing-page',
			'mobile-frontend-editor-previewing-page',
			'mobile-frontend-editor-switch-confirm',
			'mobile-frontend-editor-switch-editor',
			'mobile-frontend-editor-switch-visual-editor',
			'mobile-frontend-editor-anonwarning',
		),
	),

	'mobile.editor.overlay' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.editor.common',
			'mobile.microAutoSize',
			'oojs-ui.styles.icons-editing-core',
		),
		'scripts' => array(
			'resources/mobile.editor.overlay/EditorOverlay.js',
		),
		'templates' => array(
			'content.hogan' => 'resources/mobile.editor.overlay/content.hogan',
		),
		'messages' => array(
			'mobile-frontend-editor-blocked-info',
			'mobile-frontend-editor-viewing-source-page',
		),
	),

	'mobile.editor.overlay.withtoolbar' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.editor.overlay',
			'mobile.loggingSchemas',
			'oojs-ui.styles.icons-editing-styling',
			'jquery.textSelection',
			'mobile.editor.overlay.withtoolbar.images',
		),
		'scripts' => array(
			'resources/mobile.editor.overlay.withtoolbar/AddReferenceOverlay.js',
			'resources/mobile.editor.overlay.withtoolbar/EditorOverlayWithToolbar.js',
		),
		'styles' => array(
			'resources/mobile.editor.overlay.withtoolbar/EditorOverlayWithToolbar.less'
		),
		'templates' => array(
			'editorFooter.hogan' => 'resources/mobile.editor.overlay.withtoolbar/editorFooter.hogan',
			'contentAddReference.hogan' =>
				'resources/mobile.editor.overlay.withtoolbar/contentAddReference.hogan',
		),
		'messages' => array(
			'mobile-frontend-editor-bold',
			'mobile-frontend-editor-italic',
			'mobile-frontend-editor-reference',
			'mobile-frontend-editor-insert-reference',
			'mobile-frontend-editor-reference-placeholder',
			'mobile-frontend-editor-italic-text',
			'mobile-frontend-editor-bold-text',
			'mobile-frontend-editor-add-reference',
		),
	),

	'mobile.editor.overlay.withtoolbar.images' => $wgMFResourceFileModuleBoilerplate + array(
		'class' => 'ResourceLoaderImageModule',
		'prefix' => 'oo-ui-icon',
		'selector' => '.oo-ui-icon-{name}',
		'position' => 'bottom',
		'images' => array(
			'reference' => array(
				'file' => array(
					/**
					 * Reference-icons taken from VisualEditor team:
					 * https://github.com/wikimedia/mediawiki-extensions-VisualEditor/blob/
					 * 3e2f7f07285cf361adf8563667ff602ca938a859/modules/ve-mw/ui/styles/ve.ui.Icons.css
					 */
					'rtl' => 'images/icons/reference-rtl.svg',
					'ltr' => 'images/icons/reference-ltr.svg',
				),
			),
		)
	),

	'mobile.search' => $wgMFResourceParsedMessageModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.pagelist.scripts',
			'mobile.overlays',
			'mobile.loggingSchemas',
		),
		'styles' => array(
			'resources/mobile.search/SearchOverlay.less',
		),
		'scripts' => array(
			'resources/mobile.search/SearchOverlay.js',
			'resources/mobile.search/MobileWebSearchLogger.js',
		),
		'templates' => array(
			'SearchOverlay.hogan' => 'resources/mobile.search/SearchOverlay.hogan',
		),
		'messages' => array(
			// for search.js
			'mobile-frontend-clear-search',
			'mobile-frontend-search-content',
			'mobile-frontend-search-no-results',
			'mobile-frontend-search-content-no-results' => array( 'parse' ),
			'mobile-frontend-search-feedback-prompt',
			'mobile-frontend-search-feedback-link-text',
			'mobile-frontend-placeholder',
			'mobile-frontend-placeholder-beta',
		),
	),

	'mobile.search.api' => $wgMFResourceParsedMessageModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mediawiki.Title',
		),
		'scripts' => array(
			'resources/mobile.search.api/SearchGateway.js',
		),
	),

	'mobile.talk.overlays' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mediawiki.ui.anchor',
			'mobile.editor.common',
		),
		'scripts' => array(
			'resources/mobile.talk.overlays/TalkOverlayBase.js',
			'resources/mobile.talk.overlays/TalkSectionOverlay.js',
			'resources/mobile.talk.overlays/TalkSectionAddOverlay.js',
			'resources/mobile.talk.overlays/TalkOverlay.js',
		),
		'templates' => array(
			// talk.js
			'content.hogan' => 'resources/mobile.talk.overlays/content.hogan',
			'SectionAddOverlay/contentHeader.hogan' =>
				'resources/mobile.talk.overlays/talkSectionAddContentHeader.hogan',
			'SectionAddOverlay.hogan' => 'resources/mobile.talk.overlays/talkSectionAdd.hogan',
			'Section/header.hogan' => 'resources/mobile.talk.overlays/talkSectionHeader.hogan',
			'Section/content.hogan' => 'resources/mobile.talk.overlays/talkSection.hogan',
		),
		'messages' => array(
			'mobile-frontend-talk-overlay-header',
			'mobile-frontend-talk-fullpage',
			'mobile-frontend-talk-explained',
			'mobile-frontend-talk-explained-empty',
			'mobile-frontend-talk-overlay-lead-header',
			'mobile-frontend-talk-add-overlay-subject-placeholder',
			'mobile-frontend-talk-add-overlay-content-placeholder',
			'mobile-frontend-talk-edit-summary',
			'mobile-frontend-talk-reply-success',
			'mobile-frontend-talk-reply',
			'mobile-frontend-talk-reply-info',
			'mobile-frontend-talk-topic-feedback',
			'mobile-frontend-talk-topic-error',
			'mobile-frontend-talk-topic-error-protected',
			'mobile-frontend-talk-topic-error-permission',
			'mobile-frontend-talk-topic-error-spam',
			'mobile-frontend-talk-topic-error-badtoken',
			'mobile-frontend-talk-topic-wait',
			// @todo FIXME: Gets loaded twice if editor and talk both loaded.
			'mobile-frontend-editor-cancel',
			'mobile-frontend-editor-cancel-confirm',
			'mobile-frontend-editor-error',
			'mobile-frontend-editor-error-conflict',
		),
	),

	'mobile.mediaViewer' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			// for Api.js
			'mobile.startup',
			'mobile.swipe.images',
		),
		'styles' => array(
			'resources/mobile.mediaViewer/mediaViewer.less',
		),
		'scripts' => array(
			'resources/mobile.mediaViewer/ImageGateway.js',
			'resources/mobile.mediaViewer/ImageOverlay.js',
		),
		'templates' => array(
			'Overlay.hogan' => 'resources/mobile.mediaViewer/ImageOverlay.hogan',
		),
		'messages' => array(
			// mediaViewer.js
			'mobile-frontend-media-details',
			'mobile-frontend-media-license-link',
		),
	),

	'mobile.mediaViewer.beta' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.mediaViewer',
			'mobile.swipe',
		),
		'scripts' => array(
			'resources/mobile.mediaViewer.beta/ImageOverlayBeta.js',
		),
	),

	/** provides next and previous images, e.g. for a swipe left and right module */
	'mobile.swipe.images' => $wgMFResourceFileModuleBoilerplate + array(
		'class' => 'ResourceLoaderImageModule',
		'selectorWithVariant' => '.mw-ui-icon-{name}-{variant}:before',
		'selectorWithoutVariant' => '.mw-ui-icon-{name}:before',
		'prefix' => 'mw-ui',
		'variants' => array(
			'invert' => array(
				'color' => '#FFFFFF',
				'global' => true,
			)
		),
		'images' => array(
			'previous' => array(
				'file' => array(
					'ltr' => 'images/icons/move-rtl.svg',
					'rtl' => 'images/icons/move-ltr.svg',
				),
			),
			'next' => array(
				'file' => array(
					'ltr' => 'images/icons/move-ltr.svg',
					'rtl' => 'images/icons/move-rtl.svg',
				),
			),
		),
	),

	'mobile.categories.overlays' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mediawiki.Title',
			'mobile.overlays',
			'mobile.loggingSchemas',
			'mobile.toast',
			'mobile.search.api',
			'mobile.search',
			// needed for saveHeader.hogan
			'mobile.editor.common',
			'oojs-ui',
		),
		'scripts' => array(
			'resources/mobile.categories.overlays/CategoryGateway.js',
			'resources/mobile.categories.overlays/CategoryLookupInputWidget.js',
			'resources/mobile.categories.overlays/CategoryOverlay.js',
			'resources/mobile.categories.overlays/CategoryAddOverlay.js',
		),
		'styles' => array(
			'resources/mobile.categories.overlays/categories.less',
		),
		'templates' => array(
			'CategoryOverlay.hogan' => 'resources/mobile.categories.overlays/CategoryOverlay.hogan',
			'CategoryAddOverlay.hogan' => 'resources/mobile.categories.overlays/CategoryAddOverlay.hogan',
			'CategoryAddOverlayHeader.hogan' =>
				'resources/mobile.categories.overlays/CategoryAddOverlayHeader.hogan',
		),
		'messages' => array(
			'mobile-frontend-categories-heading',
			'mobile-frontend-categories-subheading',
			'mobile-frontend-categories-nocat',
			'mobile-frontend-categories-add',
			'mobile-frontend-categories-nomatch',
			'mobile-frontend-categories-search',
			'mobile-frontend-categories-nodata',
			'mobile-frontend-categories-summary',
			'mobile-frontend-categories-add-heading',
			'mobile-frontend-categories-add-wait',
			'mobile-frontend-categories-normal',
			'mobile-frontend-categories-hidden',
		),
	),

	'mobile.overlays' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'skins.minerva.icons.variants.js',
			'mobile.ajax',
		),
		'scripts' => array(
			'resources/mobile.overlays/Overlay.js',
			'resources/mobile.overlays/ContentOverlay.js',
			'resources/mobile.overlays/LoadingOverlay.js',
			'resources/mobile.overlays/moduleLoader.js',
		),
		'messages' => array(
			'mobile-frontend-editor-save',
			'mobile-frontend-overlay-close',
			'mobile-frontend-overlay-continue',
		),
		'templates' => array(
			'header.hogan' => 'resources/mobile.overlays/OverlayHeader.hogan',
			'Overlay.hogan' => 'resources/mobile.overlays/Overlay.hogan',
			'LoadingOverlay.hogan' => 'resources/mobile.overlays/LoadingOverlay.hogan',
		),
		'styles' => array(
			'resources/mobile.overlays/Overlay.less',
		)
	),

	'mobile.drawers' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
		),
		'templates' => array(
			'Cta.hogan' => 'resources/mobile.drawers/CtaDrawer.hogan',
		),
		'styles' => array(
			'resources/mobile.drawers/drawer.less',
		),
		'scripts' => array(
			'resources/mobile.drawers/Drawer.js',
			'resources/mobile.drawers/CtaDrawer.js',
		),
		'messages' => array(
			// CtaDrawer.js
			'mobile-frontend-watchlist-cta-button-signup',
			'mobile-frontend-watchlist-cta-button-login',
		),
	),

	'mobile.toast' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.drawers',
		),
		'scripts' => array(
			'resources/mobile.toast/ToastDrawer.js',
			'resources/mobile.toast/toast.js',
		),
		'skinStyles' => array(
			'minerva' => 'resources/mobile.toast/toast.less',
		),
	),

	'mobile.references' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.drawers',
			'mobile.loggingSchemas',
		),
		'messages' => array(
			'mobile-frontend-references-citation',
		),
		'styles' => array(
			'resources/mobile.references/references.less',
		),
		'templates' => array(
			'Drawer.hogan' => 'resources/mobile.references/ReferencesDrawer.hogan',
		),
		'scripts' => array(
			'resources/mobile.references/ReferencesDrawer.js',
			'resources/mobile.references/references.js',
		),
	),

	'mobile.toggle' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.settings',
			// uses util.js
			'mobile.startup',
		),
		'styles' => array(
			'resources/mobile.toggle/toggle.less',
		),
		'scripts' => array(
			'resources/mobile.toggle/toggle.js',
		),
	),

	'mobile.contentOverlays' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
		),
		'messages' => array(
			// PageActionOverlay.js
			'mobile-frontend-pointer-dismiss',
		),
		'styles' => array(
			'resources/mobile.contentOverlays/tutorials.less',
		),
		'scripts' => array(
			'resources/mobile.contentOverlays/PointerOverlay.js',
		),
		'templates' => array(
			'PointerOverlay.hogan' => 'resources/mobile.contentOverlays/PointerOverlay.hogan',
		),
	),

	'mobile.watchstar' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.drawers',
			'mobile.ajax',
			'mobile.toast',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'resources/mobile.watchstar/WatchstarGateway.js',
			'resources/mobile.watchstar/Watchstar.js',
		),
		'styles' => array(
			'resources/mobile.watchstar/watchstar.less',
		),
		'messages' => array(
			'watchthispage',
			'unwatchthispage',
			// mf-watchstar.js
			'mobile-frontend-watchlist-add',
			'mobile-frontend-watchlist-removed',
			'mobile-frontend-watchlist-cta',
			'mobile-frontend-watchlist-please-wait',
		),
	),

	// Note: Take care with loading this module as it will pull down OOJS UI in addition
	// to our own code.
	'mobile.buttonWithSpinner' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'oojs-ui',
		),
		'styles' => array(
			'resources/mobile.buttonWithSpinner/buttonWithSpinner.less',
		),
		'scripts' => array(
			'resources/mobile.buttonWithSpinner/ButtonWithSpinner.js',
		),
	),

	'mobile.languages' => $wgMFResourceParsedMessageModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			'mobile.settings',
			'mobile.browser',
		),
		'scripts' => array(
			'resources/mobile.languages/LanguageOverlay.js',
		),
		'templates' => array(
			'LanguageOverlay.hogan' => 'resources/mobile.languages/LanguageOverlay.hogan',
		),
		'messages' => array(
			'mobile-frontend-language-heading',
			'mobile-frontend-language-header',
			'mobile-frontend-language-variant-header' => array( 'parse' ),
			'mobile-frontend-language-site-choose',
		),
	),

	'mobile.issues' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
		),
		'templates' => array(
			'OverlayContent.hogan' => 'resources/mobile.issues/cleanup.hogan',
		),
		'styles' => array(
			'resources/mobile.issues/issues.less',
		),
		'scripts' => array(
			'resources/mobile.issues/CleanupOverlay.js',
			'resources/mobile.issues/cleanuptemplates.js',
		),
		'messages' => array(
			// issues.js
			'mobile-frontend-meta-data-issues',
			'mobile-frontend-meta-data-issues-beta',
			'mobile-frontend-meta-data-issues-talk',
			'mobile-frontend-meta-data-issues-header',
			'mobile-frontend-meta-data-issues-header-talk',
			'mobile-frontend-meta-data-issues-categories',
		),
	),

	'mobile.nearby' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.ajax',
			// @todo FIXME: Kill this dependency!
			'mobile.special.nearby.styles',
			'mediawiki.language',
			'mobile.loggingSchemas',
			'mobile.pagelist.scripts',
			'mobile.foreignApi',
			'mobile.messageBox',
		),
		'messages' => array(
			// NearbyGateway.js
			'mobile-frontend-nearby-distance',
			'mobile-frontend-nearby-distance-meters',
			// Nearby.js
			'mobile-frontend-nearby-requirements',
			'mobile-frontend-nearby-requirements-guidance',
			'mobile-frontend-nearby-error',
			'mobile-frontend-nearby-error-guidance',
			'mobile-frontend-nearby-loading',
			'mobile-frontend-nearby-noresults',
			'mobile-frontend-nearby-noresults-guidance',
			'mobile-frontend-nearby-lookup-ui-error',
			'mobile-frontend-nearby-lookup-ui-error-guidance',
			'mobile-frontend-nearby-permission',
			'mobile-frontend-nearby-permission-guidance',
		),
		'scripts' => array(
			'resources/mobile.nearby/NearbyGateway.js',
			'resources/mobile.nearby/Nearby.js',
		),
		'templates' => array(
			'Nearby.hogan' => 'resources/mobile.nearby/nearby.hogan',
		),
	),

	'mobile.gallery' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.toast',
			'mobile.infiniteScroll',
		),
		'templates' => array(
			'PhotoItem.hogan' => 'resources/mobile.gallery/PhotoItem.hogan',
			'PhotoList.hogan' => 'resources/mobile.gallery/PhotoList.hogan',
		),
		'messages' => array(
			'mobile-frontend-donate-image-nouploads',
		),
		'styles' => array(
			'resources/mobile.gallery/gallery.less',
		),
		'scripts' => array(
			'resources/mobile.gallery/PhotoListGateway.js',
			'resources/mobile.gallery/PhotoItem.js',
			'resources/mobile.gallery/PhotoList.js',
		),
	),

	'mobile.commonsCategory' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.gallery',
		),
		'scripts' => array(
			'resources/mobile.commonsCategory/CommonsCategoryOverlay.js',
		),
	),

	'mobile.betaoptin' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.context',
			'mediawiki.experiments',
			'jquery.cookie',
		),
		'messages' => array(
			'mobile-frontend-panel-betaoptin-msg',
			'mobile-frontend-panel-ok',
			'mobile-frontend-panel-cancel',
		),
		'templates' => array(
			'Panel.hogan' => 'resources/mobile.betaoptin/Panel.hogan',
		),
		'styles' => array(
			'resources/mobile.betaoptin/panel.less',
		),
		'scripts' => array(
			'resources/mobile.betaoptin/BetaOptinPanel.js',
		),
	),

	'mobile.bannerImage' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mediawiki.Title',
			'mobile.startup',
			'mobile.ajax',
		),
		'scripts' => array(
			'resources/mobile.bannerImage/Image.js',
			'resources/mobile.bannerImage/MobileViewBannerImageRepository.js',
			'resources/mobile.bannerImage/BannerImage.js',
		),
		'styles' => array(
			'resources/mobile.bannerImage/bannerImage.less',
		),
		'position' => 'top',
	),

	'mobile.fontchanger' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.settings',
			'mobile.drawers',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'resources/mobile.fontchanger/FontChanger.js',
		),
		'styles' => array(
			'resources/mobile.fontchanger/FontChanger.less'
		),
		'templates' => array(
			'FontChanger.hogan' => 'resources/mobile.fontchanger/FontChanger.hogan',
		),
		'messages' => array(
			'mobile-frontend-fontchanger-desc',
			'mobile-frontend-fontchanger-link',
		),
	),

	'mobile.infiniteScroll' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.oo',
		),
		'scripts' => array(
			'resources/mobile.infiniteScroll/InfiniteScroll.js',
		),
	),

	'mobile.swipe' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.oo',
		),
		'scripts' => array(
			'resources/mobile.swipe/Swipe.js',
		),
	),

	// Custom ResourceLoaderModule classes
	'mobile.site' => array(
		'dependencies' => array( 'mobile.startup' ),
		'class' => 'MobileSiteModule',
	),
	'mobile.usermodule.styles' => array(
		'class' => 'MobileUserModule',
		'position' => 'top',
	),
	'mobile.usermodule' => array(
		'class' => 'MobileUserModule',
		'position' => 'bottom',
	),
) );

/**
 * Extension:Echo related modules
 */
$wgMobileEchoModules = array(
	'skins.minerva.notifications' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			'skins.minerva.scripts',
			'mediawiki.ui.anchor',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'resources/skins.minerva.notifications/init.js',
		),
	),

	'mobile.notifications.overlay' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			'ext.echo.logger',
		),
		'scripts' => array(
			'resources/mobile.notifications.overlay/NotificationsOverlay.js',
		),
		'styles' => array(
			'resources/mobile.notifications.overlay/NotificationsOverlay.less',
		),
		'templates' => array(
			'content.hogan' => 'resources/mobile.notifications.overlay/NotificationsOverlayContent.hogan',
		),
		'messages' => array(
			// defined in Echo
			'echo-none',
			'notifications',
			'echo-overlay-link',
			'echo-notification-count',
		),
	),
);
/**
 * Mobile VisualEditor related modules
 */
$wgMobileVEModules = array(
	'mobile.editor.ve' => $wgMFResourceBoilerplate + array(
		'dependencies' => array(
			'ext.visualEditor.mobileArticleTarget',
			'mobile.editor.common',
			'mobile.overlays',
		),
		'styles' => array(
			'resources/mobile.editor.ve/VisualEditorOverlay.less',
		),
		'scripts' => array(
			'resources/mobile.editor.ve/ve.init.mw.MobileFrontendArticleTarget.js',
			'resources/mobile.editor.ve/VisualEditorOverlay.js',
		),
		'templates' => array(
			'contentVE.hogan' => 'resources/mobile.editor.ve/contentVE.hogan',
			'toolbarVE.hogan' => 'resources/mobile.editor.ve/toolbarVE.hogan',
		),
		'messages' => array(
			'mobile-frontend-page-edit-summary',
			'mobile-frontend-editor-editing',
		),
		'targets' => array(
			'mobile',
		),
	),
);

/**
 * Special page modules
 * @todo FIXME: Remove the need for these by making more reusable CSS
 *
 * Note: Use correct names to ensure modules load on pages
 * Name must be the name of the special page lowercased prefixed by
 * 'mobile.special.' or 'skins.minerva.special.'
 * depending on where the module is used.
 * suffixed by '.styles' or '.scripts'
 */
$wgMobileSpecialPageModules = array(
	'mobile.special.mobilemenu.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'resources/mobile.special.mobilemenu.styles/mobilemenu.less',
		),
		'skinStyles' => array(
			'vector' => 'resources/mobile.special.mobilemenu.styles/mobilemenu.less',
		),
		'position' => 'top',
	),
	'mobile.special.mobileoptions.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'resources/mobile.special.mobileoptions.styles/mobileoptions.less',
		),
		'position' => 'top',
	),
	'mobile.special.mobileoptions.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'position' => 'top',
		'dependencies' => array(
			'mobile.startup',
			'mobile.settings',
			'mobile.fontchanger',
		),
		'scripts' => array(
			'resources/mobile.special.mobileoptions.scripts/mobileoptions.js',
		),
		'templates' => array(
			'Checkbox.hogan' => 'resources/mobile.special.mobileoptions.scripts/checkbox.mustache',
		),
		'messages' => array(
			'mobile-frontend-expand-sections-description',
			'mobile-frontend-expand-sections-status',
		),
	),
	'mobile.special.mobileeditor.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'scripts' => array(
				'resources/mobile.special.mobileeditor.scripts/redirectmobileeditor.js',
		),
	),

	'mobile.special.nearby.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'styles' => array(
			'resources/mobile.special.nearby.styles/specialNearby.less',
		),
		'skinStyles' => array(
			'vector' => 'resources/mobile.special.nearby.styles/specialNearbyDesktop.less',
			'monobook' => 'resources/mobile.special.nearby.styles/specialNearbyDesktop.less',
		),
		'position' => 'top',
	),

	'mobile.special.userlogin.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'scripts' => array(
			'resources/mobile.special.userlogin.scripts/userlogin.js',
		),
		'position' => 'top',
	),

	'mobile.special.nearby.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.nearby',
		),
		'messages' => array(
			'mobile-frontend-nearby-refresh',
		),
		'scripts' => array(
			'resources/mobile.special.nearby.scripts/nearby.js',
		),
		// stop flash of unstyled content when loading from cache
		'position' => 'top',
	),

	// These are NOT empty see $wgResourceModuleSkinStyles.
	'mobile.special.history.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'position' => 'top',
	),
	'mobile.special.userprofile.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'position' => 'top',
		'skinStyles' => array(
			'minerva' => 'resources/mobile.special.userprofile.styles/minerva.less',
		),
	),

	'mobile.special.uploads.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.gallery',
			'mobile.startup',
		),
		'messages' => array(
			'mobile-frontend-photo-upload-generic',
			'mobile-frontend-donate-photo-upload-success',
			'mobile-frontend-donate-photo-first-upload-success',
			'mobile-frontend-photo-upload-user-count',
		),
		'scripts' => array(
			'resources/mobile.special.uploads.scripts/uploads.js',
		),
		'position' => 'top',
	),

	'mobile.special.uploads.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'resources/mobile.special.uploads.styles/uploads.less',
		),
		'skinStyles' => array(
			'default' => 'resources/mobile.special.uploads.styles/default.less',
		),
		'position' => 'top',
	),

	'mobile.special.pagefeed.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/mobile.special.pagefeed.styles/pagefeed.less',
		),
	),

	'mobile.special.mobilediff.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'resources/mobile.special.mobilediff.styles/icons.less',
			'resources/mobile.special.mobilediff.styles/mobilediff.less',
		),
		'position' => 'top',
	),

	// Note that this module is declared as a dependency in the Thanks extension (for the
	// mobile diff thanks button code). Keep the module name there in sync with this one.
	'mobile.special.mobilediff.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'resources/mobile.special.mobilediff.scripts/mobilediff.js',
		),
	),
);

/**
	* Special page modules  that are specific to minerva.
	* @todo FIXME: With the exception of skins.minerva.special.styles these should not exist.
	*/
$wgMinervaSpecialPageModules = array(
	'skins.minerva.special.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.special.styles/common.less',
			'resources/skins.minerva.special.styles/forms.less',
		),
	),

	// FIXME: Use skin Styles
	'skins.minerva.special.search.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.special.search.styles/search.less',
		),
	),

	'skins.minerva.special.watchlist.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.special.watchlist.styles/specialWatchlist.less',
		),
	),

	'skins.minerva.special.watchlist.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.loggingSchemas',
			'mobile.startup',
			'mobile.watchlist',
		),
		'scripts' => array(
			'resources/skins.minerva.special.watchlist.scripts/watchlist.js',
		),
	),

	'skins.minerva.special.userlogin.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.special.userlogin.styles/userlogin.less',
		),
	),
);

// These modules are the gateways to all other modules and will ensure the other modules get loaded
// on the page.
$wgMinervaBootstrapModules = array(
	// @todo FIXME: Remove when cache has cleared (T112315)
	'mobile.head' => $wgMFResourceFileModuleBoilerplate + array(),

	// @todo FIXME: Remove when cache has cleared (T112315)
	'skins.minerva.scripts.top' => $wgMFResourceFileModuleBoilerplate + array(),

	// By mode. This should only ever be loaded in Minerva skin.
	'skins.minerva.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.mainMenu',
			'mobile.loggingSchemas',
			'skins.minerva.icons.images.js',
			'mobile.issues',
			'mobile.search',
			'mobile.references',
			'mobile.betaoptin',
			'mobile.toast',
			'mobile.settings',
			'mobile.modifiedBar',
			'mobile.context',
		),
		'messages' => array(
			// lastEdited.js
			'mobile-frontend-last-modified-with-user-seconds',
			'mobile-frontend-last-modified-with-user-minutes',
			'mobile-frontend-last-modified-with-user-hours',
			'mobile-frontend-last-modified-with-user-days',
			'mobile-frontend-last-modified-with-user-months',
			'mobile-frontend-last-modified-with-user-years',
			'mobile-frontend-last-modified-with-user-just-now',
		),
		'scripts' => array(
			// FIXME: Merge preInit and init files.
			'resources/skins.minerva.scripts/preInit.js',
			'resources/skins.minerva.scripts/init.js',
			'resources/skins.minerva.scripts/initLogging.js',
			'resources/skins.minerva.scripts/mobileRedirect.js',
			'resources/skins.minerva.scripts/search.js',
		),
		'messages' => array(
			// mf-stop-mobile-redirect.js
			'mobile-frontend-cookies-required',
		),
	),
	// Remove when cache clears (https://phabricator.wikimedia.org/T113686)
	'skins.minerva.browse' => array(),
	'skins.minerva.newusers' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'skins.minerva.editor',
			'mobile.contentOverlays',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'resources/skins.minerva.newusers/init.js',
		),
		'messages' => array(
			// newbieEditor.js
			'mobile-frontend-editor-tutorial-summary',
			'mobile-frontend-editor-tutorial-confirm',
			'mobile-frontend-editor-tutorial-cancel',
		),
	),

	'skins.minerva.editor' => $wgMFResourceParsedMessageModuleBoilerplate + array(
		'dependencies' => array(
			'skins.minerva.scripts',
			'mobile.drawers',
			'mediawiki.ui.input',
			'mobile.settings',
			'mobile.toast',
			// Let's ensure toggle styles have loaded before adding edit section links
			'skins.minerva.toggling',
			// Route needs moduleLoader
			'mobile.overlays',
			'mediawiki.jqueryMsg',
		),
		'messages' => array(
			// editor.js
			'mobile-frontend-editor-disabled',
			'mobile-frontend-editor-unavailable',
			'mobile-frontend-editor-uploadenable',
			'mobile-frontend-editor-blocked-info-loggedin' => array( 'parse' ),
			'mobile-frontend-editor-cta',
			'mobile-frontend-editor-anon',
			'mobile-frontend-editor-undo-unsupported',
			// edit link
			'mobile-frontend-editor-edit',
			'mobile-frontend-editor-redlink-create',
			'mobile-frontend-editor-redlink-leave',
			'mobile-frontend-editor-redlink-explain' => array( 'parse' ),
		),
		'scripts' => array(
			'resources/skins.minerva.editor/init.js',
		),
	),

	'skins.minerva.categories' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'resources/skins.minerva.categories/init.js',
		),
	),

	'skins.minerva.talk' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'skins.minerva.scripts',
			'mobile.overlays',
		),
		'styles' => array(
			'resources/skins.minerva.talk/talk.less',
		),
		'scripts' => array(
			'resources/skins.minerva.talk/init.js',
		),
		'messages' => array(
			'mobile-frontend-talk-overlay-header',
			'mobile-frontend-talk-add-overlay-submit',
			'mobile-frontend-editor-licensing',
			'mobile-frontend-editor-licensing-with-terms',
		),
	),

	'skins.minerva.toggling' => $wgMFResourceParsedMessageModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.toggle',
			'skins.minerva.scripts',
		),
		'scripts' => array(
			'resources/skins.minerva.toggling/init.js',
		),
	),

	'skins.minerva.watchstar' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.watchstar',
			'skins.minerva.scripts',
		),
		'scripts' => array(
			'resources/skins.minerva.watchstar/init.js',
		),
		'messages' => array(
			'watchthispage',
			'unwatchthispage',
			// mf-watchstar.js
			'mobile-frontend-watchlist-add',
			'mobile-frontend-watchlist-removed',
			'mobile-frontend-watchlist-cta',
			'mobile-frontend-watchlist-please-wait',
		),
	),

	// By mode. This should only ever be loaded in Minerva skin.
	'skins.minerva.beta.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'skins.minerva.scripts',
			'mobile.settings',
			'mobile.foreignApi',
			// Feature modules that should be loaded in beta should be listed below here.
			// These modules should only setup routes/events or
			// load code under certain conditions.
			'mobile.backtotop',
		),
		'scripts' => array(
			'resources/skins.minerva.beta.scripts/commonsCategory.js',
			'resources/skins.minerva.beta.scripts/fontchanger.js',
		),
		'messages' => array(
			'mobile-frontend-commons-category-view',
		),
	),
	'skins.minerva.beta.banner.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'skins.minerva.scripts',
			'mobile.bannerImage',
		),
		'scripts' => array(
			'resources/skins.minerva.beta.banner.scripts/bannerImage.js',
		),
	),

	// By mode. This should only ever be loaded in Minerva skin.
	'skins.minerva.tablet.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			// Feature modules that should be loaded on tablets should be listed below here.
			'mobile.toc',
		),
		'scripts' => array(
			'resources/skins.minerva.tablet.scripts/toc.js',
		),
	),
);

$wgResourceModules = array_merge( $wgResourceModules,
	$wgMobileSpecialPageModules,
	$wgMinervaSpecialPageModules,
	$wgMinervaStyleModules,
	$wgMinervaBootstrapModules
);

// Module customizations
$wgResourceModuleSkinStyles['default'] = $wgMFResourceBoilerplate + array(
	'mobile.special.history.styles' => array(
		'resources/mobile.special.history.styles/default.less',
	),
);

// Don't load the mw.notification style in minerva, they use mobile.toast
$wgResourceModuleSkinStyles['minerva'] = $wgMFResourceBoilerplate + array(
	'mediawiki.notification' => 'resources/mobile.toast/toast.less',
);
