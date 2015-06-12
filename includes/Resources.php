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

	// FIXME: Remove when cache has cleared
	'skins.minerva.chrome.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.base.reset/reset.less',
			'resources/skins.minerva.base.styles/ui.less',
			'resources/skins.minerva.base.styles/pageactions.less',
			'resources/skins.minerva.base.styles/footer.less',
			'resources/skins.minerva.base.styles/common.less',
			'resources/skins.minerva.base.styles/icons.less',
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
			'resources/skins.minerva.content.styles/main.less',
			'resources/skins.minerva.content.styles/thumbnails.less',
			'resources/skins.minerva.content.styles/images.less',
			'resources/skins.minerva.content.styles/galleries.less',
			'resources/skins.minerva.content.styles/headings.less',
			'resources/skins.minerva.content.styles/blockquotes.less',
			'resources/skins.minerva.content.styles/lists.less',
			'resources/skins.minerva.content.styles/links.less',
			'resources/skins.minerva.content.styles/text.less',
			'resources/skins.minerva.content.styles/tables.less',
			'resources/skins.minerva.content.styles/hacks.less',
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
	'skins.minerva.tablet.beta.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.tablet.beta.styles/common.less',
			'resources/skins.minerva.tablet.beta.styles/hacks.less',
		),
	),
	'skins.minerva.tablet.alpha.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.tablet.alpha.styles/common.alpha.less'
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

	'skins.minerva.icons.images.js' => $wgMFResourceFileModuleBoilerplate + array(
		'class' => 'ResourceLoaderImageModule',
		'prefix' => 'mw-ui',
		'selectorWithoutVariant' => '.mw-ui-icon-{name}:before',
		// Not used yet, see FIXME below
		'selectorWithVariant' => '.mw-ui-icon-{name}-{variant}:before',
		'variants' => array(
			'invert' => array(
				'color' => '#FFFFFF',
				'global' => true,
			)
		),
		'position' => 'bottom',
		'images' => array(
			// chrome
			'search-white' => 'images/icons/search-white.svg',

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

			// Editor
			'edit-source' => 'images/icons/editSourceNormal.svg',
			'edit-ve' => 'images/icons/editVeNormal.svg',
			'edit-switch' => 'images/icons/editToggle.svg',

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

			// overlay
			'close' => 'images/icons/close.svg',
		),
	),

	'skins.minerva.mainPage.beta.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'group' => 'other',
		'styles' => array(
			'resources/skins.minerva.mainPage.beta.styles/common.less',
		),
	),

	'skins.minerva.mainPage.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'group' => 'other',
		'styles' => array(
			'resources/skins.minerva.mainPage.styles/common.less',
		),
	),

	'skins.minerva.alpha.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.alpha.styles/ui.alpha.less',
		),
	),

	'skins.minerva.beta.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.beta.styles/common.less',
			'resources/skins.minerva.beta.styles/pageactions.less',
			'resources/skins.minerva.beta.styles/footer.less',
			'resources/skins.minerva.beta.styles/main.less',
			'resources/skins.minerva.beta.styles/hacks.less',
		),
	),
	'skins.minerva.beta.images' => $wgMFResourceFileModuleBoilerplate + array(
		'position' => 'bottom',
		'class' => 'ResourceLoaderImageModule',
		'selectorWithoutVariant' => '.mw-ui-icon-{name}:before',
		'selectorWithVariant' => '.mw-ui-icon-{name}-{variant}:before',
		'variants' => array(
			'invert' => array(
				'color' => '#FFFFFF',
				'global' => true,
			)
		),
		'images' => array(
			// page actions
			'watch' => 'images/icons/beta/watch.svg',
			'watched' => 'images/icons/beta/watched.svg',
			'edit' => 'images/icons/beta/editLocked.svg',
			'edit-enabled' => 'images/icons/beta/edit.svg',
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
	'skins.minerva.alpha.images' => $wgMFResourceFileModuleBoilerplate + array(
			'position' => 'bottom',
			'class' => 'ResourceLoaderImageModule',
			'selector' => '.mw-ui-icon-{name}:before',
			'images' => array(
				// Special:MobileMenu-specific back icon
				'back-mobilemenu' => 'images/icons/alpha/back-ltr.svg',
				'search' => 'images/icons/magnifying-glass.svg',
			),
		),
);

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
	'mobile.browse' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.loggingSchemas'
		),
		'scripts' => array(
			'resources/mobile.browse/init.js',
		),
		'styles' => array(
			'resources/mobile.browse/tags.less',
		)
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
			'resources/mobile.microAutoSize/externals/micro.autosize.js',
		),
	),

	'mediawiki.template.hogan' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mediawiki.template',
		),
		'scripts' => array(
			'resources/mediawiki.template.hogan/externals/hogan.js',
			'resources/mediawiki.template.hogan/hogan.js',
		),
	),

	'mobile.pagelist' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.view',
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

	// Backwards compability for Zero and other extensions that may still use this
	// FIXME: Remove when https://phabricator.wikimedia.org/T94462 resolved.
	'mobile.templates' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mediawiki.template.hogan',
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
		'messages' => array(
			'mobile-frontend-watchlist-modified'
		)
	),

	'mobile.watchlist' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.infiniteScroll',
			'mobile.pagelist.scripts',
		),
		'scripts' => array(
			'resources/mobile.watchlist/WatchListApi.js',
			'resources/mobile.watchlist/WatchList.js',
		),
		'messages' => array(
			'mobile-frontend-watchlist-modified',
			'minutes-ago',
			'seconds-ago',
			'hours-ago',
			'mobile-frontend-months-ago',
			'mobile-frontend-days-ago',
			'mobile-frontend-years-ago',
		),
	),

	'mobile.toc' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.loggingSchemas',
			'mobile.toggling',
		),
		'scripts' => array(
			'resources/mobile.toc/TableOfContents.js',
			'resources/mobile.toc/init.js',
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
			'mobile.head',
			'jquery.cookie',
		),
		'scripts' => array(
			'resources/mobile.settings/settings.js',
		),
	),

	// FIXME: Split this module into different features.
	'mobile.startup' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.head',
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
		),
		'styles' => array(
			'resources/mobile.startup/panel.less',
		),
		'scripts' => array(
			'resources/mobile.startup/Router.js',
			'resources/mobile.startup/OverlayManager.js',
			// FIXME: Remove api code to mobile.ajax
			'resources/mobile.startup/api.js',
			'resources/mobile.startup/PageApi.js',
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
			'resources/mobile.startup/init.js',
		),
		'position' => 'bottom',
	),

	'mobile.foreignApi' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
		),
		'scripts' => array(
			'resources/mobile.foreignApi/ForeignApi.js',
		),
	),

	'mobile.user' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mediawiki.user',
			// Ensure M.define exists
			'mobile.head',
		),
		'scripts' => array(
			'resources/mobile.user/user.js',
		),
	),

	'mobile.editor' => $wgMFResourceParsedMessageModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.drawers',
			'mediawiki.ui.input',
			'mobile.settings',
			'mobile.toast',
			// Let's ensure toggle styles have loaded before adding edit section links
			'mobile.toggling',
			// Route needs moduleLoader
			'mobile.overlays',
			'mediawiki.jqueryMsg',
		),
		'messages' => array(
			// editor.js
			'mobile-frontend-editor-unavailable',
			'mobile-frontend-editor-uploadenable',
			'mobile-frontend-editor-blocked-info-loggedin' => array( 'parse' ),
			'mobile-frontend-editor-blocked-info',
			'mobile-frontend-editor-cta',
			'mobile-frontend-editor-anon',
			'mobile-frontend-editor-undo-unsupported',
			// edit link
			'mobile-frontend-editor-edit',
			'mobile-frontend-editor-redlink-create',
			'mobile-frontend-editor-redlink-leave',
			'mobile-frontend-editor-redlink-explain' => array( 'parse' ),
			'mobile-frontend-editor-protected',
			'mobile-frontend-editor-showhistory',
			'cancel',
		),
		'scripts' => array(
			'resources/mobile.editor/init.js',
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
			'resources/mobile.editor.api/EditorApi.js',
		),
	),

	'mobile.editor.common' => $wgMFResourceParsedMessageModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.loggingSchemas',
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
			'mobile-frontend-editor-licensing',
			'mobile-frontend-editor-licensing-with-terms',
			'mobile-frontend-editor-terms-link',
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
			'mobile-frontend-editor-visual-editor',
			'mobile-frontend-editor-source-editor',
			'mobile-frontend-editor-switch-editor',
			'mobile-frontend-editor-anonwarning',
		),
	),

	'mobile.editor.overlay' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.editor.common',
			'mobile.microAutoSize',
		),
		'scripts' => array(
			'resources/mobile.editor.overlay/EditorOverlay.js',
		),
		'templates' => array(
			'content.hogan' => 'resources/mobile.editor.overlay/content.hogan',
		),
		'messages' => array(
			'mobile-frontend-editor-viewing-source-page',
		),
	),

	'mobile.talk' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
		),
		'styles' => array(
			'resources/mobile.talk/talk.less',
		),
		'scripts' => array(
			'resources/mobile.talk/init.js',
		),
		'messages' => array(
			'mobile-frontend-talk-overlay-header',
			'mobile-frontend-talk-add-overlay-submit',
			'mobile-frontend-editor-licensing',
			'mobile-frontend-editor-licensing-with-terms',
			// FIXME: Remove after cache is cleared
			'talk',
		),
		'group' => 'other'
	),

	'mobile.preferredLanguages' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.settings',
		),
		'scripts' => array(
			'resources/mobile.preferredLanguages/init.js',
		),
	),

	'mobile.search' => $wgMFResourceParsedMessageModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.pagelist.scripts',
			'mobile.overlays',
			'mobile.loggingSchemas',
			'mediawiki.Title',
		),
		'styles' => array(
			'resources/mobile.search/SearchOverlay.less',
		),
		'scripts' => array(
			'resources/mobile.search/SearchApi.js',
			'resources/mobile.search/SearchOverlay.js',
			'resources/mobile.search/MobileWebSearchLogger.js',
			'resources/mobile.search/init.js',
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
		),
	),

	'mobile.talk.overlays' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.talk',
			'mediawiki.ui.anchor',
			'mobile.editor.common',
		),
		'scripts' => array(
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
			'mobile-frontend-editor-terms-link',
		),
	),

	'mobile.mediaViewer' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			// for Api.js
			'mobile.startup',
		),
		'styles' => array(
			'resources/mobile.mediaViewer/mediaViewer.less',
		),
		'scripts' => array(
			'resources/mobile.mediaViewer/ImageApi.js',
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
		'templates' => array(
			'Overlay.hogan' => 'resources/mobile.mediaViewer.beta/ImageOverlayNew.hogan',
		),
		'scripts' => array(
			'resources/mobile.mediaViewer.beta/ImageOverlayNew.js',
		),
	),

	'mobile.categories' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
		),
		'scripts' => array(
			'resources/mobile.categories/init.js',
		),
	),

	'mobile.categories.overlays' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mediawiki.Title',
			'mobile.overlays',
			'mobile.loggingSchemas',
			'mobile.toast',
			'mobile.search',
			// needed for saveHeader.hogan
			'mobile.editor.common',
			'oojs-ui',
		),
		'scripts' => array(
			'resources/mobile.categories.overlays/CategoryApi.js',
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
			'resources/mobile.toast/toast.js',
		),
		'styles' => array(
			'resources/mobile.toast/toast.less',
		),
	),

	// This module remembers that desktop site is your preference for viewing on a mobile phone
	'mobile.redirect' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.toast',
			'mobile.settings',
		),
		'scripts' => array(
			'resources/mobile.redirect/init.js',
		),
		'messages' => array(
			// mf-stop-mobile-redirect.js
			'mobile-frontend-cookies-required',
		),
	),

	'mobile.references.beta' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.references',
		),
		'messages' => array(
			'mobile-frontend-references-citation',
		),
		'templates' => array(
			'DrawerBeta.hogan' => 'resources/mobile.references.beta/ReferencesDrawerBeta.hogan',
		),
		'scripts' => array(
			'resources/mobile.references.beta/ReferencesDrawerBeta.js',
		),
	),

	'mobile.references' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.drawers',
			'mobile.loggingSchemas',
		),
		'styles' => array(
			'resources/mobile.references/references.less',
		),
		'templates' => array(
			'Drawer.hogan' => 'resources/mobile.references/ReferencesDrawer.hogan',
		),
		'scripts' => array(
			'resources/mobile.references/ReferencesDrawer.js',
			'resources/mobile.references/init.js',
		),
	),

	'mobile.toggling' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.settings',
		),
		'styles' => array(
			'resources/mobile.toggling/toggle.less',
		),
		'scripts' => array(
			'resources/mobile.toggling/init.js',
		),
	),

	'mobile.contentOverlays' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
		),
		'messages' => array(
			// PageActionOverlay.js
			'cancel',
		),
		'styles' => array(
			'resources/mobile.contentOverlays/tutorials.less',
		),
		'scripts' => array(
			'resources/mobile.contentOverlays/PageActionOverlay.js',
		),
		'templates' => array(
			'PageActionOverlay.hogan' => 'resources/mobile.contentOverlays/PageActionOverlay.hogan',
		),
	),

	'mobile.newusers' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.editor',
			'mobile.contentOverlays',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'resources/mobile.newusers/init.js',
		),
		'messages' => array(
			// newbieEditor.js
			'mobile-frontend-editor-tutorial-summary',
			'mobile-frontend-editor-tutorial-confirm',
			'mobile-frontend-editor-tutorial-cancel',
		),
		'group' => 'user',
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
			'resources/mobile.watchstar/WatchstarApi.js',
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

	'mobile.watchstar.init' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.watchstar',
		),
		'scripts' => array(
			'resources/mobile.watchstar.init/init.js',
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

	'mobile.errorReport' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.overlays',
			'mobile.buttonWithSpinner',
		),
		'scripts' => array(
			'resources/mobile.errorReport/init.js',
		),
		'messages' => array(
			'mobile-frontend-errorreport-button-label',
		),
	),

	'mobile.errorReport.overlay' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			'mobile.toast',
		),
		'scripts' => array(
			'resources/mobile.errorReport.overlay/ErrorReportOverlay.js',
		),
		'styles' => array(
			'resources/mobile.errorReport.overlay/errorReportOverlay.less',
		),
		'messages' => array(
			'mobile-frontend-editor-licensing',
			'mobile-frontend-errorreport-error',
			'mobile-frontend-errorreport-feedback',
			'mobile-frontend-errorreport-heading',
			'mobile-frontend-errorreport-instructions',
			'mobile-frontend-errorreport-placeholder',
			'mobile-frontend-errorreport-section-title',
			'mobile-frontend-errorreport-submit',
			'mobile-frontend-errorreport-summary',
		),
		'templates' => array(
			'ErrorReportOverlay.hogan' => 'resources/mobile.errorReport.overlay/ErrorReportOverlay.hogan',
		),
	),

	'mobile.quickLookup' => $wgMFResourceParsedMessageModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.drawers',
			'mobile.toast',
			'mobile.swipe',
		),
		'scripts' => array(
			'resources/mobile.quickLookup/QuickLookupDrawer.js',
			'resources/mobile.quickLookup/init.js',
		),
		'templates' => array(
			'Drawer.hogan' => 'resources/mobile.quickLookup/Drawer.hogan',
		),
		'styles' => array(
			'resources/mobile.quickLookup/quickLookup.less',
		),
		'messages' => array(
			"mobile-frontend-quick-lookup-looking",
			"mobile-frontend-quick-lookup-no-results",
			"mobile-frontend-quick-lookup-not-internal",
		),
	),

	'mobile.languages' => $wgMFResourceParsedMessageModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
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
			'resources/mobile.issues/init.js',
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
			// NearbyApi.js
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
			'resources/mobile.nearby/NearbyApi.js',
			'resources/mobile.nearby/Nearby.js',
		),
		'templates' => array(
			'Nearby.hogan' => 'resources/mobile.nearby/nearby.hogan',
		),
	),

	'mobile.gallery' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.toast',
			'mobile.foreignApi',
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
			'resources/mobile.gallery/PhotoListApi.js',
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

	'mobile.wikidata.api' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.foreignApi',
		),
		'scripts' => array(
			'resources/mobile.wikidata.api/WikiDataApi.js'
		),
	),

	'mobile.betaoptin' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.context',
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

	'mobile.hexmd5' => $wgMFResourceFileModuleBoilerplate + array(
		'scripts' => array(
			// FIXME: This library shouldn't be needed. Wikidata api
			// should return these thumbnail urls for us.
			'resources/mobile.hexmd5/externals/md5.js',
		),
		'position' => 'top',
	),

	'mobile.infobox' => $wgMFResourceParsedMessageModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.wikidata.api',
			'mobile.ajax',
			'mobile.hexmd5',
			'mobile.overlays',
			'oojs-ui',
		),
		'templates' => array(
			'Infobox.hogan' => 'resources/mobile.infobox/Infobox.hogan',
			'EditorOverlayHeader.hogan' => 'resources/mobile.infobox/EditorOverlayHeader.hogan',
			'EditorOverlayContent.hogan' => 'resources/mobile.infobox/EditorOverlayContent.hogan',
		),
		'messages' => array(
			'mobile-frontend-wikidata-editor-description-label' => array( 'parse' ),
			'mobile-frontend-time-precision-Gannum',
			'mobile-frontend-time-precision-Mannum',
			'mobile-frontend-time-precision-annum',
			'mobile-frontend-time-precision-millennium',
			'mobile-frontend-time-precision-century',
			'mobile-frontend-time-precision-10annum',
			'mobile-frontend-time-precision-0annum',
			'mobile-frontend-time-precision-BCE-Gannum',
			'mobile-frontend-time-precision-BCE-Mannum',
			'mobile-frontend-time-precision-BCE-annum',
			'mobile-frontend-time-precision-BCE-millennium',
			'mobile-frontend-time-precision-BCE-century',
			'mobile-frontend-time-precision-BCE-10annum',
			'mobile-frontend-time-precision-BCE-0annum',
			'january-date',
			'february-date',
			'march-date',
			'april-date',
			'may-date',
			'june-date',
			'july-date',
			'august-date',
			'september-date',
			'october-date',
			'november-date',
			'december-date'
		),
		'scripts' => array(
			'resources/mobile.infobox/Infobox.js',
			'resources/mobile.infobox/WikiDataItemLookupInputWidget.js',
			'resources/mobile.infobox/InfoboxEditorOverlay.js',
		),
		'styles' => array(
			'resources/mobile.infobox/infobox.less',
		),
		'position' => 'top',
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

	// FIXME: disable font changer, until there is a better place - see task T95198
	'mobile.fontchanger' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.settings',
			'mobile.drawers',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'resources/mobile.fontchanger/FontChanger.js',
			'resources/mobile.fontchanger/init.js',
		),
		'styles' => array(
			'resources/mobile.fontchanger/FontChanger.less'
		),
		'templates' => array(
			'FontChanger.hogan' => 'resources/mobile.fontchanger/FontChanger.hogan',
		),
		'messages' => array(
			'mobile-frontend-fontchanger-desc'
		),
		'position' => 'top',
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
	'mobile.usermodule' => array(
		'dependencies' => array( 'mobile.startup' ),
		'class' => 'MobileUserModule',
	),
) );

/**
 * Extension:Echo related modules
 */
$wgMobileEchoModules = array(
	'mobile.notifications' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			'mediawiki.ui.anchor',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'resources/mobile.notifications/init.js',
		),
		'group' => 'user',
	),

	'mobile.notifications.overlay' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			'ext.echo.base',
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
			'ext.visualEditor.mobileViewTarget',
			'mobile.editor.common',
			'mobile.overlays',
		),
		'styles' => array(
			'resources/mobile.editor.ve/VisualEditorOverlay.less',
		),
		'scripts' => array(
			'resources/mobile.editor.ve/VisualEditorOverlay.js',
		),
		'templates' => array(
			'contentVE.hogan' => 'resources/mobile.editor.ve/contentVE.hogan',
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
 * Mobile CodeMirror related modules
 */
$wgMobileCodeMirrorModules = array(
	'mobile.editor.overlay.codemirror' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.editor.overlay',
			'ext.CodeMirror.lib',
		),
		'scripts' => array(
			'resources/mobile.editor.overlay.codemirror/EditorOverlayCodeMirror.js',
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

	'mobile.special.nearby.beta.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'styles' => array(
			'resources/mobile.special.nearby.beta.styles/specialNearby.less',
		),
		'position' => 'top',
	),

	'mobile.special.userlogin.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.head',
		),
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

	'mobile.special.notifications.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'resources/mobile.special.notifications.styles/notifications.less',
		),
		'position' => 'top',
	),

	'mobile.special.notifications.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
		),
		'scripts' => array(
			'resources/mobile.special.notifications.scripts/notifications.js',
		),
		'messages' => array(
			// defined in Echo
			'echo-load-more-error',
		),
	),

	'mobile.special.history.beta.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'resources/mobile.special.history.beta.styles/default.less',
		),
		'position' => 'top',
	),
	// These are NOT empty see $wgResourceModuleSkinStyles.
	'mobile.special.history.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'position' => 'top',
	),
	'mobile.special.userprofile.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'position' => 'top',
	),

	'mobile.special.uploads.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.gallery',
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

	'mobile.special.browse.topicTag.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'resources/mobile.browse/special/topicTag.less',
		),
		'position' => 'top',
	),

	'mobile.special.browse.topicTag.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.loggingSchemas'
		),
		'scripts' => array(
			'resources/mobile.browse/special/topicTag.js',
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

	'skins.minerva.special.watchlist.beta.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'position' => 'top',
		'styles' => array(
			'resources/skins.minerva.special.watchlist.beta.styles/specialWatchlist.less',
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
	// Important: This module is loaded on both mobile and desktop skin
	// This JavaScript is loaded at the top of the page so be cautious what you put in it.
	'mobile.head' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.modifiedBar',
			'mobile.mainMenu',
			'mobile.browser',
			// 'mobile.oo' rather than 'mobile.modules' is need because lastEdited/init.js listens
			// to an event, thus needs eventemitter.js to be loaded before it. Feel free to swap
			// 'mobile.oo' below with 'mobile.modules' once none of the script files below need
			// to use eventemitter.js, for example when the last edited bar is moved to the bottom
			// of the page.
			'mobile.oo',
			'mobile.context',
		),
		'scripts' => array(
			'resources/mobile.head/init.js',
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
		'position' => 'top',
	),

	// By mode. This should only ever be loaded in Minerva skin.
	'skins.minerva.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.loggingSchemas',
			'skins.minerva.icons.images.js',
			// Feature modules that should be loaded in stable.
			// These modules should only setup routes/events or
			// load code under certain conditions.
			'mobile.issues',
			'mobile.search',
			'mobile.references',
			'mobile.redirect',
			'mobile.betaoptin',
		),
		'scripts' => array(
			'resources/skins.minerva.scripts/init.js',
		),
	),
	// By mode. This should only ever be loaded in Minerva skin.
	'skins.minerva.beta.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'skins.minerva.scripts',
			'skins.minerva.beta.images',
			// Feature modules that should be loaded in beta should be listed below here.
			// These modules should only setup routes/events or
			// load code under certain conditions.
			'mobile.preferredLanguages',
			'mobile.references.beta',
			'mobile.bannerImage',
		),
		'scripts' => array(
			'resources/skins.minerva.beta.scripts/bannerImage.js',
		),
	),
	// By mode. This should only ever be loaded in Minerva skin.
	'skins.minerva.alpha.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'skins.minerva.beta.scripts',
			// Feature modules that should be loaded in alpha should be listed below here.
			'mobile.infobox',
			'mobile.errorReport',
			'mobile.quickLookup',
			'mobile.fontchanger',
		),
		'scripts' => array(
			'resources/skins.minerva.alpha.scripts/commonsCategory.js',
			'resources/skins.minerva.alpha.scripts/infobox.js',
		)
	),
	'tablet.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			// Feature modules that should be loaded on tablets should be listed below here.
			'mobile.toc',
		),
	),
	'mobile.experiments' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.user',
		),
		'scripts' => array(
			'resources/mobile.experiments/experiments.js',
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

$wgResourceModuleSkinStyles['minerva'] = $wgMFResourceBoilerplate + array(
	'mediawiki.notification' => '',
	'mediawiki.sectionAnchor' => array(
		'resources/skins.minerva.content.styles/sectionAnchor.less',
	),
	'mediawiki.skinning.content.parsoid' => array(),
	'mobile.special.userprofile.styles' => array(
		'resources/mobile.special.userprofile.styles/minerva.less',
	),
	'mobile.special.history.styles' => array(),
);
