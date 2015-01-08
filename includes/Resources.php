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
	'skins.minerva.chrome.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'styles' => array(
			'less/reset.less',
			'less/ui.less',
			'less/pageactions.less',
			'less/footer.less',
			'less/common.less',
			'less/icons.less',
			'less/mainpage.less',
		),
	),
	'skins.minerva.content.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'styles' => array(
			'less/content/main.less',
			'less/content/thumbnails.less',
			'less/content/images.less',
			'less/content/galleries.less',
			'less/content/headings.less',
			'less/content/blockquotes.less',
			'less/content/lists.less',
			'less/content/links.less',
			'less/content/text.less',
			'less/content/tables.less',
			'less/content/hacks.less',
		),
	),
	// FIXME: When moving this to core simply migrate content of less files into corresponding
	// skins.minerva.content.styles files to avoid caching issues.
	'skins.minerva.content.styles.beta' => $wgMFResourceFileModuleBoilerplate + array(
		'styles' => array(
			'less/content/tables.beta.less',
			'less/content/hacks.beta.less',
		),
	),
	'skins.minerva.drawers.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'styles' => array(
			'less/drawer.less',
		),
	),
	'mobile.pagelist.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'styles' => array(
			'less/pagelist.less',
		),
	),
	'skins.minerva.tablet.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'styles' => array(
			'less/tablet/common.less',
			'less/tablet/hacks.less',
		),
	),
	// FIXME: When moving this to core simply migrate content of less files into corresponding
	// skins.minerva.tablet.styles files to avoid caching issues.
	'skins.minerva.tablet.styles.beta' => $wgMFResourceFileModuleBoilerplate + array(
		'styles' => array(
			'less/tablet/hacks.beta.less',
		),
	),
	'skins.minerva.icons.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'styles' => array(
			'less/iconsNew.less',
		),
	),
	'skins.minerva.icons.images' => $wgMFResourceFileModuleBoilerplate + array(
		'class' => 'ResourceLoaderImageModule',
		'prefix' => 'mw-ui',
		'images' => array(
			// FIXME: ':before' suffix should be configurable in image module.
			'icon' => array(
				// chrome
				'notifications:before' => 'images/icons/bell.svg',
				'mainmenu:before' => 'images/icons/hamburger.svg',
				'search:before' => 'images/icons/magnifying-glass.svg',

				// toggling
				'arrow-down:before' => 'images/icons/arrow-down.svg',
				'arrow-up:before' => 'images/icons/arrow-up.svg',

				// page actions
				'talk:before' => 'images/icons/talk.svg',
				'watch:before' => 'images/icons/watch.svg',
				'watched:before' => 'images/icons/watched.svg',
				'edit:before' => 'images/icons/editLocked.svg',
				'edit-enabled:before' => 'images/icons/edit.svg',
				'addimage:before' => 'images/icons/uploadLocked.svg',
				'addimage-enabled:before' => 'images/icons/upload.svg',

				// Editor
				'edit-source:before' => 'images/icons/editSourceNormal.svg',
				'edit-ve:before' => 'images/icons/editVeNormal.svg',
				'edit-switch:before' => 'images/icons/editToggle.svg',

				// TOC
				'toc:before' => 'images/icons/contents-ltr.svg',

				// Issues
				'cleanup:before' => 'images/icons/blue-triangle.svg',
				// FIXME: make this a variant of cleanup
				'cleanup-gray:before' => 'images/icons/gray-triangle.svg',

				// User
				'user:before' => 'images/icons/userNormal.svg',
				'anonymous:before' => 'images/icons/userAnonymous.svg',

				// cite
				'citation:before' => 'images/icons/cite.svg',
			),
		),
	),
	'skins.minerva.alpha.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'styles' => array(
			'less/content/links.alpha.less',
			'less/pageactions.alpha.less',
			'less/footer.alpha.less',
		),
	),
);

$wgResourceModules = array_merge( $wgResourceModules, array(
	'mobile.templates' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'ext.mantle.hogan',
		),
		'scripts' => array(
			'javascripts/template.js',
		),
	),

	'mobile.pagelist.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.watchstar',
		),
		'templates' => array(
			'PageList.hogan' => 'templates/modules/PageList.hogan',
		),
		'scripts' => array(
			'javascripts/modules/PageList.js',
		),
	),

	'mobile.toc' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.templates',
			'mobile.loggingSchemas',
			'mobile.toggling',
		),
		'scripts' => array(
			'javascripts/modules/toc/TableOfContents.js',
			'javascripts/modules/toc/init.js',
		),
		'styles' => array(
			'less/modules/toc/toc.less',
		),
		'templates' => array(
			'toc.hogan' => 'templates/modules/toc/toc.hogan',
			'heading.hogan' => 'templates/modules/toc/tocHeading.hogan'
		),
		'messages' => array(
			'toc'
		),
	),

	'mobile.ajax' => $wgMFResourceFileModuleBoilerplate + array(
		'styles' => array(
			'less/spinner.less',
		),
	),

	'mobile.settings' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.head',
			'jquery.cookie',
		),
		'scripts' => array(
			'javascripts/settings.js',
		),
	),

	// FIXME: Split this module into different features.
	'mobile.startup' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.head',
			'mobile.templates',
			'mobile.user',
			'mediawiki.api',
			'mobile.redlinks',
			'ext.mantle.views',
		),
		'templates' => array(
			'icon.hogan' => 'templates/icon.hogan',
			'Section.hogan' => 'templates/Section.hogan',
		),
		'messages' => array(
			// icons.js
			'mobile-frontend-loading-message',
		),
		'scripts' => array(
			'javascripts/Router.js',
			'javascripts/OverlayManager.js',
			// FIXME: Remove api code to mobile.ajax
			'javascripts/api.js',
			'javascripts/PageApi.js',
			'javascripts/Icon.js',
			'javascripts/icons.js',
			'javascripts/Panel.js',
			'javascripts/Section.js',
			'javascripts/Page.js',
			'javascripts/Skin.js',
			'javascripts/Schema.js',
			'javascripts/util.js',
			'javascripts/application.js',
		),
		'position' => 'bottom',
	),

	'mobile.redlinks' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.head',
			'mediawiki.user',
		),
		'scripts' => array(
			'javascripts/modules/redlinks/init.js',
		),
	),

	'mobile.user' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mediawiki.user',
			// Ensure M.define exists
			'mobile.head',
		),
		'scripts' => array(
			'javascripts/user.js',
		),
	),

	'mobile.leadPhotoUploader' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.user',
			'mobile.upload.ui',
		),
		'scripts' => array(
			'javascripts/modules/uploads/init.js',
		),
		// This is a logged in user feature only.
		'group' => 'user',
	),

	'mobile.editor' => $wgMFResourceFileModuleBoilerplate + array(
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
		),
		'messages' => array(
			// editor.js
			'mobile-frontend-editor-disabled',
			'mobile-frontend-editor-unavailable',
			'mobile-frontend-editor-uploadenable',
			'mobile-frontend-editor-blocked',
			'mobile-frontend-editor-cta',
			'mobile-frontend-editor-anon',
			'mobile-frontend-editor-undo-unsupported',
			// edit link
			'mobile-frontend-editor-edit',
		),
		'scripts' => array(
			'javascripts/modules/editor/init.js',
		),
	),

	'mobile.abusefilter' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			'mobile.startup',
			'mobile.templates',
		),
		'templates' => array(
			'Overlay.hogan' => 'templates/modules/editor/AbuseFilterOverlay.hogan',
			'Panel.hogan' => 'templates/modules/editor/AbuseFilterPanel.hogan',
		),
		'scripts' => array(
			'javascripts/modules/editor/AbuseFilterOverlay.js',
			'javascripts/modules/editor/AbuseFilterPanel.js',
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
			'mobile.stable',
			'mobile.abusefilter',
		),
		'scripts' => array(
			'javascripts/modules/editor/EditorApi.js',
		),
	),

	'mobile.editor.common' => $wgMFResourceFileModuleBoilerplate + array(
		'class' => 'ResourceLoaderParsedMessageModule',
		'dependencies' => array(
			'mobile.stable',
			'mobile.templates',
			'mobile.editor.api',
			'mobile.settings',
			'mobile.drawers',
		),
		'scripts' => array(
			'javascripts/modules/editor/EditorOverlayBase.js',
		),
		'styles' => array(
			'less/modules/editor/editor.less',
		),
		'templates' => array(
			'switcher.hogan' => 'templates/modules/editor/switcher.hogan',
			'editHeader.hogan' => 'templates/modules/editor/editHeader.hogan',
			'previewHeader.hogan' => 'templates/modules/editor/previewHeader.hogan',
			'saveHeader.hogan' => 'templates/modules/editor/saveHeader.hogan',
			'EditorOverlayBase.hogan' => 'templates/modules/editor/EditorOverlayBase.hogan',
			'EditorOverlayAnonWarning.hogan' => 'templates/modules/editor/EditorOverlayAnonWarning.hogan',
		),
		'messages' => array(
			// modules/editor/EditorOverlay.js
			'mobile-frontend-editor-continue',
			'mobile-frontend-editor-cancel',
			'mobile-frontend-editor-keep-editing',
			'mobile-frontend-editor-licensing',
			'mobile-frontend-editor-licensing-with-terms',
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
			'mobile-frontend-editor-anoneditwarning' => array( 'parse' ),
		),
	),

	'mobile.editor.overlay' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.editor.common',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'javascripts/modules/editor/EditorOverlay.js',
		),
		'templates' => array(
			'content.hogan' => 'templates/modules/editor/content.hogan',
		),
		'messages' => array(
			'mobile-frontend-editor-viewing-source-page',
		),
	),

	'mobile.uploads' => $wgMFResourceFileModuleBoilerplate + array(
		'class' => 'ResourceLoaderParsedMessageModule',
		'dependencies' => array(
			'mobile.stable',
			'mobile.templates',
			'mobile.editor.api',
			'mobile.contentOverlays',
		),
		'scripts' => array(
			'javascripts/modules/uploads/PhotoApi.js',
			'javascripts/modules/uploads/LeadPhoto.js',
			'javascripts/modules/uploads/UploadTutorial.js',
			'javascripts/modules/uploads/PhotoUploadProgress.js',
			'javascripts/modules/uploads/PhotoUploadOverlay.js',
			'javascripts/externals/exif-js/binaryajax.js',
			'javascripts/externals/exif-js/exif.js',
		),
		'styles' => array(
			'less/modules/uploads/UploadTutorial.less',
			'less/modules/uploads/PhotoUploadOverlay.less',
			'less/modules/uploads/PhotoUploadProgress.less',
		),
		'templates' => array(
			'LeadPhoto.hogan' => 'templates/modules/uploads/LeadPhoto.hogan',
			'UploadTutorial.hogan' => 'templates/modules/uploads/UploadTutorial.hogan',
			'PhotoUploadOverlay.hogan' => 'templates/modules/uploads/PhotoUploadOverlay.hogan',
			'PhotoUploadProgress.hogan' => 'templates/modules/uploads/PhotoUploadProgress.hogan',
		),
		'messages' => array(
			'mobile-frontend-photo-upload-success-article',
			'mobile-frontend-photo-upload-error',

			// PhotoApi.js
			'mobile-frontend-photo-article-edit-comment',
			'mobile-frontend-photo-article-donate-comment',
			'mobile-frontend-photo-upload-error-filename',
			'mobile-frontend-photo-upload-comment',

			// UploadTutorial.js
			'mobile-frontend-first-upload-wizard-new-page-1-header',
			'mobile-frontend-first-upload-wizard-new-page-1',
			'mobile-frontend-first-upload-wizard-new-page-2-header',
			'mobile-frontend-first-upload-wizard-new-page-2',
			'mobile-frontend-first-upload-wizard-new-page-3-header',
			'mobile-frontend-first-upload-wizard-new-page-3',
			'mobile-frontend-first-upload-wizard-new-page-3-ok',

			// PhotoUploadOverlay.js
			'mobile-frontend-image-heading-describe' => array( 'parse' ),
			'mobile-frontend-photo-ownership',
			'mobile-frontend-photo-ownership-help',
			'mobile-frontend-photo-caption-placeholder',
			'mobile-frontend-photo-submit',
			'mobile-frontend-photo-upload-error-file-type',
			'mobile-frontend-photo-licensing',
			'mobile-frontend-photo-licensing-with-terms',
			'mobile-frontend-photo-upload-copyvio',

			// PhotoUploadProgress.js
			'mobile-frontend-image-uploading' => array( 'parse' ),
			'mobile-frontend-image-cancel-confirm' => array( 'parse' ),
		),
	),

	'mobile.talk' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.beta',
		),
		'styles' => array(
			'less/modules/talk.less',
		),
		'scripts' => array(
			'javascripts/modules/talk/talk.js',
		),
		'messages' => array(
			// for talk.js
			'mobile-frontend-talk-overlay-header',
		),
		'group' => 'other'
	),

	'mobile.preferredLanguages' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.settings',
		),
		'scripts' => array(
			'javascripts/modules/preferredLanguages/init.js',
		),
	),

	'mobile.search' => $wgMFResourceFileModuleBoilerplate + array(
		'class' => 'ResourceLoaderParsedMessageModule',
		'dependencies' => array(
			'mobile.pagelist.scripts',
			'mobile.overlays',
			'mobile.templates',
			'mobile.loggingSchemas',
		),
		'styles' => array(
			'less/modules/search/SearchOverlay.less',
		),
		'scripts' => array(
			'javascripts/modules/search/SearchApi.js',
			'javascripts/modules/search/SearchOverlay.js',
			'javascripts/modules/search/init.js',
		),
		'templates' => array(
			'SearchOverlay.hogan' => 'templates/modules/search/SearchOverlay.hogan',
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
			'mobile.templates',
			'mediawiki.ui.anchor',
		),
		'scripts' => array(
			'javascripts/modules/talk/TalkSectionOverlay.js',
			'javascripts/modules/talk/TalkSectionAddOverlay.js',
			'javascripts/modules/talk/TalkOverlay.js',
		),
		'templates' => array(
			// talk.js
			'content.hogan' => 'templates/modules/talk/talk.hogan',
			'SectionAddOverlay/header.hogan' => 'templates/modules/talk/talkSectionAddHeader.hogan',
			'SectionAddOverlay/content.hogan' => 'templates/modules/talk/talkSectionAdd.hogan',
			'Section/header.hogan' => 'templates/modules/talk/talkSectionHeader.hogan',
			'Section/content.hogan' => 'templates/modules/talk/talkSection.hogan',
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
			'mobile-frontend-talk-add-overlay-submit',
			'mobile-frontend-talk-reply-success',
			'mobile-frontend-talk-reply',
			'mobile-frontend-talk-reply-info',
			'mobile-frontend-talk-topic-feedback',
			'mobile-frontend-talk-topic-error',
			'mobile-frontend-talk-topic-error-protected',
			'mobile-frontend-talk-topic-error-permission',
			'mobile-frontend-talk-topic-error-spam',
			'mobile-frontend-talk-topic-error-badtoken',
			// @todo FIXME: Gets loaded twice if editor and talk both loaded.
			'mobile-frontend-editor-cancel',
			'mobile-frontend-editor-cancel-confirm',
			'mobile-frontend-editor-licensing',
			'mobile-frontend-editor-licensing-with-terms',
		),
	),

	'mobile.mediaViewer' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			// for Api.js
			'mobile.startup',
			'mobile.templates',
		),
		'styles' => array(
			'less/modules/mediaViewer.less',
		),
		'scripts' => array(
			'javascripts/modules/mediaViewer/ImageApi.js',
			'javascripts/modules/mediaViewer/ImageOverlay.js',
		),
		'templates' => array(
			'Overlay.hogan' => 'templates/modules/mediaViewer/ImageOverlay.hogan',
		),
		'messages' => array(
			// mediaViewer.js
			'mobile-frontend-media-details',
			'mobile-frontend-media-license-link',
		),
	),

	'mobile.categories' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mediawiki.Title',
			'mobile.overlays',
			'mobile.templates',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'javascripts/modules/categories/CategoryOverlay.js',
			'javascripts/modules/categories/init.js',
		),
		'templates' => array(
			'CategoryOverlay.hogan' => 'templates/modules/categories/CategoryOverlay.hogan',
		),
		'messages' => array(
			'mobile-frontend-categories-heading',
			'mobile-frontend-categories-subheading',
			'mobile-frontend-categories-nocat',
		),
	),

	'mobile.wikigrok.abTest' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.user',
			'jquery.cookie',
		),
		'scripts' => array(
			'javascripts/modules/wikigrok/wikigrokuser.js',
			'javascripts/modules/wikigrok/WikiGrokAbTest.js',
		),
	),

	'mobile.wikigrok' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.wikigrok.abTest',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'javascripts/modules/wikigrok/wikiGrokCampaigns.js',
			'javascripts/modules/wikigrok/init.js',
		),
	),

	'mobile.overlays' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.templates',
			'mobile.startup',
			'mobile.ajax',
		),
		'scripts' => array(
			'javascripts/Overlay.js',
			'javascripts/LoadingOverlay.js',
			'javascripts/moduleLoader.js',
		),
		'messages' => array(
			'mobile-frontend-editor-save',
			'mobile-frontend-overlay-close',
			'mobile-frontend-overlay-continue',
		),
		'templates' => array(
			'header.hogan' => 'templates/OverlayHeader.hogan',
			'Overlay.hogan' => 'templates/Overlay.hogan',
			'LoadingOverlay.hogan' => 'templates/LoadingOverlay.hogan',
			'OverlayFooterLink.hogan' => 'templates/OverlayFooterLink.hogan',
		),
		'styles' => array(
			'less/Overlay.less',
		)
	),

	'mobile.drawers' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
		),
		'templates' => array(
			'Cta.hogan' => 'templates/ctaDrawer.hogan',
		),
		'scripts' => array(
			'javascripts/Drawer.js',
			'javascripts/CtaDrawer.js',
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
			'javascripts/toast.js',
		),
		'styles' => array(
			'less/toast.less',
		),
	),

	'mobile.upload.ui' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.ajax',
			'mobile.overlays',
		),
		'templates' => array(
			// FIXME: This should not be a hogan template. Use a txt template.
			'template.hogan' => 'templates/modules/uploads/commons-upload.hogan',
			// PhotoUploaderButton.js
			'LeadButton.hogan' => 'templates/modules/uploads/LeadPhotoUploaderButton.hogan',
			// @todo FIXME: this should be in special.uploads (need to split
			// code in PhotoUploaderButton.js into separate files too)
			'Button.hogan' => 'templates/modules/uploads/PhotoUploaderButton.hogan',
		),
		'scripts' => array(
			'javascripts/modules/uploads/ProgressBar.js',
			'javascripts/modules/uploads/PhotoUploaderButton.js',
			'javascripts/modules/uploads/LeadPhotoUploaderButton.js',
			// FIXME: this seems to be uploads only, code should be moved to uploads folder.
			'javascripts/modules/routes.js',
		),
		'messages' => array(
			// LeadPhotoUploaderButton.js
			'mobile-frontend-photo-upload',
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
			'javascripts/modules/mf-stop-mobile-redirect.js',
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
			'DrawerBeta.hogan' => 'templates/modules/references/ReferencesDrawerBeta.hogan',
		),
		'scripts' => array(
			'javascripts/modules/references/ReferencesDrawerBeta.js',
		),
	),

	'mobile.references' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.drawers',
			'mobile.loggingSchemas',
		),
		'styles' => array(
			'less/modules/references.less',
		),
		'templates' => array(
			'Drawer.hogan' => 'templates/modules/references/ReferencesDrawer.hogan',
		),
		'scripts' => array(
			'javascripts/modules/references/ReferencesDrawer.js',
			'javascripts/modules/references/init.js',
		),
	),

	'mobile.toggling' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.settings',
		),
		'styles' => array(
			'less/modules/toggle.less',
		),
		'scripts' => array(
			'javascripts/modules/toggling/init.js',
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
			'less/modules/tutorials.less',
		),
		'scripts' => array(
			'javascripts/modules/tutorials/ContentOverlay.js',
			'javascripts/modules/tutorials/PageActionOverlay.js',
		),
		'templates' => array(
			'PageActionOverlay.hogan' => 'templates/modules/tutorials/PageActionOverlay.hogan',
		),
	),

	'mobile.newusers' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.templates',
			'mobile.editor',
			'mobile.contentOverlays',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'javascripts/modules/tutorials/init.js',
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
			'mobile.templates',
			'mobile.drawers',
			'mobile.ajax',
			'mobile.toast',
		),
		'scripts' => array(
			'javascripts/modules/watchstar/WatchstarApi.js',
			'javascripts/modules/watchstar/Watchstar.js',
			'javascripts/modules/watchstar/init.js',
		),
		'styles' => array(
			'less/modules/watchstar.less',
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

	'mobile.errorReport' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.overlays',
		),
		'scripts' => array(
			'javascripts/modules/errorReport/init.js',
		),
		'messages' => array(
			'mobile-frontend-errorreport-button-label',
		),
	),

	'mobile.errorReport.overlay' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.templates',
			'mobile.overlays',
			'mobile.toast',
		),
		'scripts' => array(
			'javascripts/modules/errorReport/ErrorReportOverlay.js',
		),
		'styles' => array(
			'less/modules/errorReport/errorReportOverlay.less',
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
			'ErrorReportOverlay.hogan' => 'templates/modules/errorReport/ErrorReportOverlay.hogan',
		),
	),

	'mobile.languages' => $wgMFResourceFileModuleBoilerplate + array(
		'class' => 'ResourceLoaderParsedMessageModule',
		'dependencies' => array(
			'mobile.overlays',
			'mobile.templates',
		),
		'scripts' => array(
			'javascripts/modules/languages/LanguageOverlay.js',
		),
		'templates' => array(
			'LanguageOverlay.hogan' => 'templates/modules/languages/LanguageOverlay.hogan',
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
			'OverlayContent.hogan' => 'templates/modules/issues/cleanup.hogan',
		),
		'styles' => array(
			'less/modules/issues.less',
		),
		'scripts' => array(
			'javascripts/modules/issues/CleanupOverlay.js',
			'javascripts/modules/issues/init.js',
		),
		'messages' => array(
			// issues.js
			'mobile-frontend-meta-data-issues',
			'mobile-frontend-meta-data-issues-alpha',
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
			'mobile.templates',
			'mobile.loggingSchemas',
			'mobile.pagelist.scripts',
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
			'javascripts/modules/nearby/NearbyApi.js',
			'javascripts/modules/nearby/Nearby.js',
		),
		'templates' => array(
			'Nearby.hogan' => 'templates/modules/nearby/nearby.hogan',
		),
	),

	'mobile.notifications' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			'mediawiki.ui.anchor',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'javascripts/modules/notifications/notifications.js',
		),
		'group' => 'user',
	),

	'mobile.notifications.overlay' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'ext.echo.base',
		),
		'scripts' => array(
			'javascripts/modules/notifications/NotificationsOverlay.js',
		),
		'styles' => array(
			'less/modules/NotificationsOverlay.less',
		),
		'templates' => array(
			'content.hogan' => 'templates/modules/notifications/NotificationsOverlayContent.hogan',
		),
		'messages' => array(
			// defined in Echo
			'echo-none',
			'notifications',
			'echo-overlay-link',
			'echo-notification-count',
		),
	),

	'mobile.wikigrok.roulette' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
			'mobile.wikigrok.dialog.b',
		),
		'scripts' => array(
			'javascripts/modules/wikiGrokRoulette/ErrorDrawer.js',
			'javascripts/modules/wikiGrokRoulette/wikiGrokRoulette.js',
			'javascripts/modules/wikiGrokRoulette/init.js',
		),
		'templates' => array(
			'Error.hogan' => 'templates/modules/wikiGrokRoulette/error.hogan',
		)
	),

	'mobile.wikigrok.dialog.c' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.wikigrok.roulette',
			'mobile.wikigrok.dialog.b',
		),
		'scripts' => array(
			'javascripts/modules/wikigrok/WikiGrokDialogC.js',
		),
	),

	'mobile.wikigrok.dialog.b' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.wikigrok.dialog',
			'mediawiki.ui.checkbox',
		),
		'styles' => array(
			'less/modules/wikigrok/tagButton.less',
		),
		'templates' => array(
			'Dialog.hogan' => 'templates/modules/wikigrok/WikiGrokDialogB.hogan',
			'tagButton.hogan' => 'templates/modules/wikigrok/tagButton.hogan',
		),
		'scripts' => array(
			'javascripts/modules/wikigrok/WikiGrokDialogB.js',
		),
	),

	'mobile.wikidata.api' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
		),
		'scripts' => array(
			'javascripts/modules/wikigrok/WikiDataApi.js'
		),
	),

	'mobile.wikigrok.api' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
		),
		'scripts' => array(
			'javascripts/modules/wikigrok/WikiGrokResponseApi.js',
		),
	),

	// See https://www.mediawiki.org/wiki/Extension:MobileFrontend/WikiGrok
	'mobile.wikigrok.dialog' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.overlays',
			'mobile.loggingSchemas',
			'mobile.wikigrok.api',
		),
		'templates' => array(
			'Error.hogan' => 'templates/modules/wikigrok/WikiGrokError.hogan',
			'Dialog.hogan' => 'templates/modules/wikigrok/WikiGrokDialog.hogan',
			'WikiGrokMoreInfo/content.hogan' => 'templates/modules/wikigrok/WikiGrokMoreInfo.hogan',
		),
		'scripts' => array(
			'javascripts/modules/wikigrok/WikiGrokDialog.js',
			'javascripts/modules/wikigrok/WikiGrokMoreInfo.js',
		),
		'styles' => array(
			'less/modules/wikigrok/WikiGrokDialog.less',
		),
	),

	'mobile.hexmd5' => $wgMFResourceFileModuleBoilerplate + array(
		'scripts' => array(
			// FIXME: This library shouldn't be needed. Wikidata api
			// should return these thumbnail urls for us.
			'javascripts/externals/md5.js',
		),
		'position' => 'top',
	),

	'mobile.infobox' => $wgMFResourceFileModuleBoilerplate + array(
		'class' => 'ResourceLoaderParsedMessageModule',
		'dependencies' => array(
			'mobile.wikidata.api',
			'mobile.ajax',
			'mobile.hexmd5',
		),
		'templates' => array(
			'Infobox.hogan' => 'templates/modules/infobox/Infobox.hogan',
			'EditorOverlayHeader.hogan' => 'templates/modules/infobox/EditorOverlayHeader.hogan',
			'EditorOverlayContent.hogan' => 'templates/modules/infobox/EditorOverlayContent.hogan',
		),
		'messages' => array(
			'mobile-frontend-wikidata-editor-description-label' => array( 'parse' ),
		),
		'scripts' => array(
			'javascripts/modules/infobox/Infobox.js',
			'javascripts/modules/infobox/InfoboxEditorOverlay.js',
		),
		'styles' => array(
			'less/modules/infobox.less',
		),
		'position' => 'top',
	),

	'mobile.bannerImage' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.wikidata.api',
			'mobile.ajax',
			'mobile.hexmd5',
		),
		'scripts' => array(
			'javascripts/modules/bannerImage/BannerImage.js',
		),
		'styles' => array(
			'less/modules/bannerImage.less',
		),
		'position' => 'top',
	),

	'mobile.fontchanger' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.settings',
			'mobile.templates',
			'mobile.drawers',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'javascripts/modules/fontchanger/FontChanger.js',
			'javascripts/modules/fontchanger/init.js',
		),
		'styles' => array(
			'less/modules/fontchanger/FontChanger.less'
		),
		'templates' => array(
			'FontChanger.hogan' => 'templates/modules/fontchanger/FontChanger.hogan',
		),
		'messages' => array(
			'mobile-frontend-fontchanger-desc'
		),
		'position' => 'top',
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
 * Mobile VisualEditor related modules
 */
$wgMobileVEModules = array(
	'mobile.editor.ve' => $wgMFResourceBoilerplate + array(
		'dependencies' => array(
			'ext.visualEditor.mobileViewTarget',
			'mobile.stable',
			'mobile.templates',
			'mobile.editor.common',
			'mobile.overlays',
		),
		'styles' => array(
			'less/modules/editor/VisualEditorOverlay.less',
		),
		'scripts' => array(
			'javascripts/modules/editor/VisualEditorOverlay.js',
		),
		'templates' => array(
			'contentVE.hogan' => 'templates/modules/editor/contentVE.hogan',
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
			'less/specials/mobilemenu.less',
		),
		'skinStyles' => array(
			'vector' => 'less/desktop/special/mobilemenu.less',
		)
	),
	'mobile.special.mobileoptions.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/mobileoptions.less',
		),
	),
	'mobile.special.mobileoptions.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'position' => 'top',
		'dependencies' => array(
			'mobile.startup',
			'mobile.settings',
			'mobile.templates',
		),
		'scripts' => array(
			'javascripts/specials/mobileoptions.js',
		),
		'templates' => array(
			'Checkbox.hogan' => 'templates/specials/checkbox.hogan',
		),
		'messages' => array(
			'mobile-frontend-expand-sections-description',
			'mobile-frontend-expand-sections-status',
		),
	),
	'mobile.special.mobileeditor.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'scripts' => array(
				'javascripts/specials/redirectmobileeditor.js',
		),
	),

	'mobile.special.nearby.styles' => $wgMFResourceFileModuleBoilerplate + array(
		'styles' => array(
			'less/specials/nearby.less',
		),
		'skinStyles' => array(
			'vector' => 'less/desktop/special/nearby.less',
			'monobook' => 'less/desktop/special/nearby.less',
		),
	),

	'mobile.special.nearby.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.nearby',
		),
		'messages' => array(
			'mobile-frontend-nearby-refresh',
		),
		'scripts' => array(
			'javascripts/specials/nearby.js',
		),
		// stop flash of unstyled content when loading from cache
		'position' => 'top',
	),

	'mobile.special.notifications.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/notifications.less',
		),
		'position' => 'top',
	),

	'mobile.special.notifications.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable'
		),
		'scripts' => array(
			'javascripts/specials/notifications.js',
		),
		'messages' => array(
			// defined in Echo
			'echo-load-more-error',
		),
	),

	'mobile.special.userprofile.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		// This is NOT empty see $wgResourceModuleSkinStyles.
	),

	'mobile.special.uploads.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.upload.ui',
			'mobile.startup',
			'mobile.toast',
		),
		'templates' => array(
			'PhotoItem.hogan' => 'templates/specials/photo.hogan',
			'PhotoList.hogan' => 'templates/specials/userGallery.hogan',
		),
		'messages' => array(
			'mobile-frontend-donate-image-nouploads',
			'mobile-frontend-photo-upload-generic',
			'mobile-frontend-donate-photo-upload-success',
			'mobile-frontend-donate-photo-first-upload-success',
			'mobile-frontend-listed-image-no-description',
			'mobile-frontend-photo-upload-user-count',
		),
		'scripts' => array(
			'javascripts/specials/uploads/UserGalleryApi.js',
			'javascripts/specials/uploads/PhotoItem.js',
			'javascripts/specials/uploads/PhotoList.js',
			'javascripts/specials/uploads/init.js',
		),
		'position' => 'top',
	),

	'mobile.special.uploads.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/uploads.less',
			'less/modules/uploads/PhotoUploaderButton.less',
		),
	),

	'mobile.special.pagefeed.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/pagefeed.less',
		),
	),

	'mobile.special.mobilediff.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/mobilediff.less',
		),
	),

	// Note that this module is declared as a dependency in the Thanks extension (for the
	// mobile diff thanks button code). Keep the module name there in sync with this one.
	'mobile.special.mobilediff.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'javascripts/specials/mobilediff.js',
		),
	),
);

/**
	* Special page modules  that are specific to minerva.
	* @todo FIXME: With the exception of skins.minerva.special.styles these should not exist.
	*/
$wgMinervaSpecialPageModules = array(
	'skins.minerva.special.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/common.less',
			'less/specials/forms.less',
		),
	),

	'skins.minerva.special.search.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/search.less',
		),
	),

	'skins.minerva.special.watchlist.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.loggingSchemas',
			'mobile.startup',
			'mobile.pagelist.scripts',
		),
		'scripts' => array(
			'javascripts/modules/watchlist/WatchList.js',
			'javascripts/specials/watchlist.js',
		),
	),

	'skins.minerva.special.userlogin.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/userlogin.less',
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
			'mediawiki.language',
			'mediawiki.jqueryMsg',
			'mobile.templates',
			'ext.mantle.modules',
			'ext.mantle.oo',
		),
		'scripts' => array(
			'javascripts/modes.js',
			'javascripts/browser.js',
			'javascripts/mainmenu.js',
			'javascripts/modules/lastEdited/time.js',
			'javascripts/modules/lastEdited/init.js',
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

	// By mode.
	'mobile.stable' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.loggingSchemas',
			// FIXME: Review the modules that follow. Ensure they are in the correct module definition.
			'mobile.user',
			'mediawiki.util',
			'mobile.templates',
			'mediawiki.language',
			'mobile.pagelist.scripts',
			// Feature modules that should be loaded in stable.
			// These modules should only setup routes/events or
			// load code under certain conditions.
			'mobile.watchstar',
			'mobile.issues',
			'mobile.search',
			'mobile.references',
			'mobile.redirect',
			'mobile.wikigrok',
			// FIXME: only load when uploads enabled
			'mobile.upload.ui',
		),
		'scripts' => array(
			'javascripts/externals/micro.autosize.js',
			'javascripts/modules/mediaViewer/init.js',
			'javascripts/modules/languages/init.js',
		),
	),
	'mobile.beta' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			// Feature modules that should be loaded in beta should be listed below here.
			// These modules should only setup routes/events or
			// load code under certain conditions.
			'mobile.preferredLanguages',
			'mobile.references.beta',
		),
	),
	'mobile.alpha' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			'mobile.beta',
			// Feature modules that should be loaded in alpha should be listed below here.
			'mobile.infobox',
			'mobile.bannerImage',
			'mobile.fontchanger',
			'mobile.wikigrok.roulette',
			'mobile.errorReport',
		),
		'scripts' => array(
			'javascripts/modules/infobox/init.js',
			'javascripts/modules/bannerImage/init.js',
		)
	),
	'tablet.scripts' => $wgMFResourceFileModuleBoilerplate + array(
		'dependencies' => array(
			// Feature modules that should be loaded on tablets should be listed below here.
			'mobile.toc',
		),
	),
);

$wgResourceModules = array_merge( $wgResourceModules, $wgMobileSpecialPageModules );
$wgResourceModules = array_merge( $wgResourceModules, $wgMinervaSpecialPageModules );
$wgResourceModules = array_merge( $wgResourceModules, $wgMinervaStyleModules );
$wgResourceModules = array_merge( $wgResourceModules, $wgMinervaBootstrapModules );

// Module customizations
$wgResourceModuleSkinStyles['minerva'] = $wgMFResourceBoilerplate + array(
	'mediawiki.skinning.content.parsoid' => array(),
	'mobile.special.userprofile.styles' => array(
		'less/specials/userprofile.less',
	),
);
