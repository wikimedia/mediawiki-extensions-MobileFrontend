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
 * A boilerplate for RL script modules
*/
$wgMFMobileSpecialPageResourceScriptBoilerplate = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'dependencies' => array( 'mobile.stable' ),
);

$wgResourceModules = array_merge( $wgResourceModules, array(
	// @todo FIXME: Upstream to core
	'mobile.templates' => $wgMFMobileResourceBoilerplate + array(
		'scripts' => array(
			'javascripts/externals/hogan.js',
			'javascripts/common/templates.js'
		),
		'targets' => array( 'mobile', 'desktop' ),
	),

	// @todo FIXME: Remove need for this module
	// Mobile Bridge - Tweaks the desktop UI so mobile code can run on it
	'mobile.bridge' => $wgMFMobileResourceBoilerplate + array(
		'skinStyles' => array(
			'vector' => array(
				'less/desktop/mobileBridge.less',
			),
		),
		'scripts' => array(
			'javascripts/desktop/mobileBridge.js',
		),
	),

	'mobile.file.scripts' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array( 'mobile.startup' ),
		'scripts' => array(
			'javascripts/file/filepage.js'
		),
	),

	'mobile.styles.mainpage' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/mainpage.less'
		),
		'group' => 'other',
	),

	'mobile.pagelist.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/pagelist.less',
		),
		'position' => 'top',
	),

	'tablet.styles' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array( 'mobile.startup' ),
		'styles' => array(
			'less/tablet/common.less',
			'less/tablet/hacks.less',
		),
	),

	'mobile.toc' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.templates',
		),
		'scripts' => array(
			'javascripts/modules/toc/toc.js',
		),
		'styles' => array(
			'less/modules/toc/toc.less',
		),
		'templates' => array(
			'modules/toc/toc',
			'modules/toc/tocHeading'
		),
		'messages' => array(
			'toc'
		),
	),

	'tablet.scripts' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.toc',
		),
	),

	// @todo FIXME: Remove in favour of mediawiki ui
	'skins.minerva.buttons.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/buttons.less',
		),
	),

	'skins.minerva.chrome.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/reset.less',
			'less/common/ui.less',
			'less/common/pageactions.less',
			'less/common/footer.less',
		),
		'position' => 'top',
	),

	'skins.minerva.content.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/common.less',
			'less/common/typography.less',
			'less/modules/toggle.less',
			'less/common/hacks.less',
		),
		'position' => 'top',
	),

	'skins.minerva.drawers.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/drawer.less',
		),
		'position' => 'top',
	),

	'mobile.styles.beta' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/uiNew.less',
			'less/common/commonNew.less',
			'less/common/typographyNew.less',
			'less/common/secondaryPageActions.less',
		),
		'position' => 'top',
	),

	// Important: This module is loaded on both mobile and desktop skin
	'mobile.head' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mediawiki.language',
			'mediawiki.jqueryMsg',
		),
		'scripts' => array(
			'javascripts/common/modules.js',
			'javascripts/common/Class.js',
			'javascripts/common/eventemitter.js',
			'javascripts/common/mainmenu.js',
			'javascripts/modules/lastEdited/time.js',
			'javascripts/modules/lastEdited/lastEdited.js',
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

	'mobile.head.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.head',
		),
		'scripts' => array(
			'javascripts/common/matchMedia.js',
		),
		'position' => 'top',
	),

	'mobile.startup' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.head',
			'mobile.templates',
			'mobile.user',
			'mediawiki.api',
			'jquery.cookie',
			'mobile.redlinks',
		),
		'templates' => array(
			'page',
			'section',
		),
		'messages' => array(
			'mobile-frontend-language-article-heading',
		),
		'scripts' => array(
			'javascripts/common/Router.js',
			'javascripts/common/OverlayManager.js',
			'javascripts/common/api.js',
			'javascripts/common/PageApi.js',
			'javascripts/common/View.js',
			'javascripts/common/Section.js',
			'javascripts/common/Page.js',
			'javascripts/common/application.js',
			'javascripts/common/settings.js',
		),
		'position' => 'bottom',
	),

	'mobile.redlinks' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.head',
			'mediawiki.user',
		),
		'scripts' => array(
			'javascripts/modules/redlinks/redlinks.js',
		),
	),

	'mobile.user' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mediawiki.user',
			// Ensure M.define exists
			'mobile.head',
		),
		'scripts' => array(
			'javascripts/common/user.js',
		),
	),

	'mobile.editor' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable.common',
			'mobile.overlays',
		),
		'scripts' => array(
			'javascripts/modules/editor/editor.js',
		),
	),

	'mobile.editor.api' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
		),
		'scripts' => array(
			'javascripts/modules/editor/EditorApi.js',
			'javascripts/modules/editor/AbuseFilterOverlay.js',
			'javascripts/modules/editor/AbuseFilterPanel.js',
		),
		'templates' => array(
			'modules/editor/AbuseFilterOverlay',
			'modules/editor/AbuseFilterPanel',
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

	'mobile.editor.common' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'mobile.templates',
			'mobile.editor.api',
			'jquery.cookie',
		),
		'scripts' => array(
			'javascripts/modules/editor/EditorOverlayBase.js',
		),
		'styles' => array(
			'less/modules/editor/editor.less',
		),
		'templates' => array(
			'modules/editor/EditorOverlayBase',
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
		),
	),

	'mobile.editor.ve' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'ext.visualEditor.mobileViewTarget',
			'mobile.beta',
			'mobile.editor.common',
			'mobile.stable.common',
		),
		'styles' => array(
			'less/modules/editor/VisualEditorOverlay.less',
		),
		'scripts' => array(
			'javascripts/modules/editor/VisualEditorOverlay.js',
		),
		'styles' => array(
			'less/modules/editor/VisualEditorOverlay.less',
		),
		'templates' => array(
			'modules/editor/VisualEditorOverlayHeader',
			'modules/editor/VisualEditorOverlay',
		),
		'messages' => array(
			'mobile-frontend-page-saving',
		),
	),

	'mobile.editor.overlay' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.editor.common',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'javascripts/modules/editor/EditorOverlay.js',
		),
		'templates' => array(
			'modules/editor/EditorOverlayHeader',
			'modules/editor/EditorOverlay',
		),
		'messages' => array(
			'mobile-frontend-editor-viewing-source-page',
		),
	),

	'mobile.uploads' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'mobile.templates',
			'mobile.editor.api',
		),
		'scripts' => array(
			'javascripts/loggingSchemas/mobileWebUploads.js',
			'javascripts/modules/uploads/PhotoApi.js',
			'javascripts/modules/uploads/LeadPhoto.js',
			'javascripts/modules/uploads/UploadTutorial.js',
			'javascripts/modules/uploads/PhotoUploadProgress.js',
			'javascripts/modules/uploads/PhotoUploadOverlay.js',
		),
		'styles' => array(
			'less/modules/uploads/UploadTutorial.less',
			'less/modules/uploads/PhotoUploadOverlay.less',
		),
		'templates' => array(
			'uploads/LeadPhoto',
			'uploads/UploadTutorial',
			'uploads/PhotoUploadOverlay',
			'uploads/PhotoUploadProgress',
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

	// FIXME: move if EXIF checks go to stable
	'mobile.uploads.exif' => $wgMFMobileResourceBoilerplate + array(
		'scripts' => array(
			'javascripts/externals/exif-js/binaryajax.js',
			'javascripts/externals/exif-js/exif.js',
		),
	),

	'mobile.uploads.stable' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.uploads',
		),
	),

	'mobile.uploads.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.uploads.exif',
			'mobile.uploads',
		),
	),

	'mobile.beta.common' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable.common',
			'mobile.loggingSchemas',
			'mobile.templates',
		),
	),

	'mobile.keepgoing' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.beta',
			'mobile.templates',
			'mobile.overlays',
		),
		'templates' => array(
			'keepgoing/KeepGoingDrawer',
			'keepgoing/KeepGoingOverlay',
		),
		'messages' => array(
			'mobilefrontend-keepgoing-suggest',
			'mobilefrontend-keepgoing-suggest-again',
			'mobilefrontend-keepgoing-cancel',
			'mobilefrontend-keepgoing-ask',
			'mobilefrontend-keepgoing-ask-first',
			'mobilefrontend-keepgoing-explain',
			'mobilefrontend-keepgoing-saved-title',
			'mobilefrontend-keepgoing-links-title',
			'mobilefrontend-keepgoing-links-ask-first',
			'mobilefrontend-keepgoing-links-ask-again',
			'mobilefrontend-keepgoing-links-explain',
			'mobilefrontend-keepgoing-links-example'
		),
		'scripts' => array(
			'javascripts/loggingSchemas/mobileWebCta.js',
			'javascripts/modules/keepgoing/KeepGoingDrawer.js',
			'javascripts/modules/keepgoing/KeepGoingOverlay.js',
		),
	),

	'mobile.geonotahack' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.loggingSchemas',
			// Needs LoadingOverlay
			'mobile.stable.common',
			'mobile.overlays',
		),
		'messages' => array(
			'mobile-frontend-geonotahack',
		),
		'scripts' => array(
			'javascripts/modules/nearbypages.js',
		)
	),

	'mobile.talk' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'mobile.beta.common',
			'mobile.overlays',
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
	),

	'mobile.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'mobile.beta.common',
			'mobile.overlays',
		),
		'styles' => array(
			'less/common/mainmenuAnimation.less',
		),
		'scripts' => array(
			'javascripts/externals/micro.tap.js',
			'javascripts/modules/mf-toggle-dynamic.js',
			'javascripts/modules/mediaViewer/init.js',
			'javascripts/modules/keepgoing/keepgoing.js',
			'javascripts/modules/languages/preferred.js',
		),
		'position' => 'bottom',
	),

	'mobile.search' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			// Make sure we have articleList template
			'mobile.stable.common',
			'mobile.overlays'
		),
		'styles' => array(
			'less/modules/search/SearchOverlay.less',
		),
		'scripts' => array(
			'javascripts/modules/search/SearchApi.js',
			'javascripts/modules/search/SearchOverlay.js',
			'javascripts/modules/search/search.js',
			'javascripts/modules/search/pageImages.js',
		),
		'templates' => array(
			'modules/search/SearchOverlay',
		),
		'messages' => array(
			// for search.js
			'mobile-frontend-clear-search',
			'mobile-frontend-search-content',
			'mobile-frontend-search-no-results',
			'mobile-frontend-search-content-no-results' => array( 'parse' ),
		),
	),

	// @todo FIXME: remove when cache expires
	'mobile.search.stable' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.search'
		),
	),

	'mobile.talk.common' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.talk',
			'mobile.templates',
		),
		'scripts' => array(
			'javascripts/modules/talk/TalkSectionOverlay.js',
			'javascripts/modules/talk/TalkSectionAddOverlay.js',
			'javascripts/modules/talk/TalkOverlay.js',
		),
		'templates' => array(
			// talk.js
			'overlays/talk',
			'overlays/talkSectionAdd',
			'talkSection',
		),
		'messages' => array(
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
			// @todo FIXME: Gets loaded twice if editor and talk both loaded.
			'mobile-frontend-editor-cancel',
			'mobile-frontend-editor-licensing',
			'mobile-frontend-editor-licensing-with-terms',
		),
	),

	'mobile.ajaxpages' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			// Requires the Page.js JavaScript file
			'mobile.startup',
		),
		'scripts' => array(
			'javascripts/externals/epoch.js',
			'javascripts/common/history-alpha.js',
			'javascripts/modules/lazyload.js',
		),
	),

	'mobile.mediaViewer' => $wgMFMobileResourceBoilerplate + array(
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
			'modules/ImageOverlay',
		),
		'messages' => array(
			// mediaViewer.js
			'mobile-frontend-media-details',
			'mobile-frontend-media-license-link',
		),
	),

	'mobile.alpha' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.beta',
			'mobile.ajaxpages',
			// For random.js
			'mobile.keepgoing',
		),
		'messages' => array(
			// for random.js
			'mobilefrontend-random-explain',
			'mobilefrontend-random-cancel',
		),
		'scripts' => array(
			'javascripts/modules/mf-translator.js',
			'javascripts/modules/random/random.js',
		),
	),

	'mobile.toast.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/toast.less',
		),
		'position' => 'top',
	),

	'mobile.stable.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/common-js.less',
			'less/modules/watchstar.less',
			'less/modules/tutorials.less',
		),
		'position' => 'top',
	),

	'mobile.overlays' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.templates',
			'mobile.startup',
		),
		'scripts' => array(
			'javascripts/common/Overlay.js',
			'javascripts/common/LoadingOverlayNew.js',
		),
		'messages' => array(
			'mobile-frontend-overlay-close',
			'mobile-frontend-overlay-continue',
		),
		'templates' => array(
			'OverlayNew',
			'LoadingOverlay',
		),
		'styles' => array(
			'less/common/OverlayNew.less',
		)
	),

	// Important: This module is loaded on both mobile and desktop skin
	'mobile.stable.common' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.toast.styles',
			'mediawiki.jqueryMsg',
			'mediawiki.util',
			'mobile.templates',
			'mobile.overlays',
		),
		'templates' => array(
			'wikitext/commons-upload',
			// SearchOverlay.js and Nearby.js
			'articleList',
			// PhotoUploaderButton.js
			// For new page action menu
			'uploads/LeadPhotoUploaderButton',
			// @todo FIXME: this should be in special.uploads (need to split
			// code in PhotoUploaderButton.js into separate files too)
			'uploads/PhotoUploaderButton',

			'ctaDrawer',
		),
		'scripts' => array(
			'javascripts/modules/routes.js',
			'javascripts/common/Drawer.js',
			'javascripts/common/CtaDrawer.js',
			'javascripts/widgets/progress-bar.js',
			'javascripts/common/toast.js',
			'javascripts/modules/uploads/PhotoUploaderButton.js',
			'javascripts/modules/uploads/LeadPhotoUploaderButton.js',
			'javascripts/modules/mf-stop-mobile-redirect.js',
		),
		'messages' => array(
			// mf-navigation.js
			'mobile-frontend-watchlist-cta-button-signup',
			'mobile-frontend-watchlist-cta-button-login',
			'mobile-frontend-drawer-cancel',

			// newbie.js
			'cancel',

			// page.js
			'mobile-frontend-talk-overlay-header',
			// editor.js
			'mobile-frontend-editor-disabled',
			'mobile-frontend-editor-unavailable',
			'mobile-frontend-editor-blocked',
			'mobile-frontend-editor-cta',
			'mobile-frontend-editor-edit',
			'mobile-frontend-editor-undo-unsupported',
			// modules/editor/EditorOverlay.js
			// modules/talk.js
			// modules/uploads/PhotoUploadProgress.js
			'mobile-frontend-editor-save',
			// PageApi.js
			'mobile-frontend-last-modified-with-user-date',
			// mf-stop-mobile-redirect.js
			'mobile-frontend-cookies-required',
		),
	),

	'mobile.references' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.templates',
			'mobile.startup',
			'mobile.stable.common',
		),
		'styles' => array(
			'less/modules/references.less',
		),
		'templates' => array(
			// references.js
			'ReferencesDrawer',
		),
		'scripts' => array(
			'javascripts/modules/references/references.js',
		),
	),

	'mobile.toggling' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
		),
		'scripts' => array(
			'javascripts/modules/toggling/toggle.js',
		),
	),

	'mobile.toggling.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.toggling',
		),
		'scripts' => array(
			'javascripts/modules/toggling/accessibility.js',
			'javascripts/modules/mf-toggle-dynamic.js',
		),
	),

	'mobile.contentOverlays' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
		),
		'scripts' => array(
			'javascripts/modules/tutorials/ContentOverlay.js',
			'javascripts/modules/tutorials/PageActionOverlay.js',
		),
		'templates' => array(
			'modules/tutorials/PageActionOverlay',
		),
	),

	'mobile.newusers' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.templates',
			'mobile.editor',
			'mobile.contentOverlays',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'javascripts/modules/tutorials/newbieEditor.js',
		),
		'messages' => array(
			// newbieEditor.js
			'mobile-frontend-editor-tutorial-summary',
			'mobile-frontend-editor-tutorial-alt-summary',
			'mobile-frontend-editor-tutorial-confirm',
			'mobile-frontend-editor-tutorial-cancel',
		),
	),

	'mobile.stable' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.user',
			'mobile.stable.common',
			'mediawiki.util',
			'mobile.stable.styles',
			'mobile.templates',
			'mobile.references',
			'mediawiki.language',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'javascripts/externals/micro.autosize.js',
			'javascripts/modules/uploads/lead-photo-init.js',
			'javascripts/modules/mainmenutweaks.js',
			'javascripts/modules/mf-watchstar.js',
		),
		'messages' => array(
			// lastEdited.js
			'mobile-frontend-last-modified-seconds',
			'mobile-frontend-last-modified-hours',
			'mobile-frontend-last-modified-minutes',
			'mobile-frontend-last-modified-hours',
			'mobile-frontend-last-modified-days',
			'mobile-frontend-last-modified-months',
			'mobile-frontend-last-modified-years',
			'mobile-frontend-last-modified-just-now',

			// leadphoto.js
			'mobile-frontend-photo-upload-disabled',
			'mobile-frontend-photo-upload-protected',
			'mobile-frontend-photo-upload-anon',
			'mobile-frontend-photo-upload-unavailable',
			'mobile-frontend-photo-upload',

			// mf-watchstar.js
			'mobile-frontend-watchlist-add',
			'mobile-frontend-watchlist-removed',
			'mobile-frontend-watchlist-cta',
		),
	),

	'mobile.languages' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
		),
		'scripts' => array(
			'javascripts/modules/languages/LanguageOverlay.js',
			'javascripts/modules/languages/languages.js',
		),
		'templates' => array(
			'modules/languages/LanguageOverlay',
		),
		'messages' => array(
			'mobile-frontend-language-heading',
			'mobile-frontend-language-header',
			'mobile-frontend-language-variant-header' => array( 'parse' ),
			'mobile-frontend-language-site-choose',
		),
	),

	'mobile.issues' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
		),
		'templates' => array(
			'overlays/cleanup',
		),
		'styles' => array(
			'less/modules/issues.less',
		),
		'scripts' => array(
			'javascripts/modules/issues/issues.js',
		),
		'messages' => array(
			// issues.js
			'mobile-frontend-meta-data-issues',
			'mobile-frontend-meta-data-issues-header',
		),
	),

	'mobile.nearby' => $wgMFMobileResourceBoilerplate + array(
		'templates' => array(
			'articleList',
			'overlays/pagePreview',
		),
		'dependencies' => array(
			'mobile.stable.common',
			// @todo FIXME: Kill this dependency!
			'mobile.special.nearby.styles',
			'jquery.json',
			'mediawiki.language',
			'mobile.templates',
			'mobile.loggingSchemas',
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
	),

	'mobile.notifications' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
		),
		'scripts' => array(
			'javascripts/modules/notifications/notifications.js',
		),
	),

	'mobile.notifications.overlay' => $wgMFMobileResourceBoilerplate + array(
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
			'modules/notifications/NotificationsOverlay',
		),
		'messages' => array(
			// defined in Echo
			'echo-none',
			'notifications',
			'echo-overlay-link',
			'echo-notification-count',
		),
	),

	'mobile.site' => array(
		'dependencies' => array( 'mobile.startup' ),
		'class' => 'MobileSiteModule',
	),

	// Resources to be loaded on desktop version of site
	'mobile.desktop' => $wgMFResourceBoilerplate + array(
		'scripts' => array( 'javascripts/desktop/unset_stopmobileredirect.js' ),
		'dependencies' => array( 'jquery.cookie' ),
		'targets' => 'desktop',
	),
) );

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
	'mobile.special.app.scripts' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.ajaxpages',
			'mobile.startup',
			'mobile.search',
			// Make sure loader styles etc are present
			'mobile.stable.styles',
		),
		'scripts' => array(
			'javascripts/app/startup.js',
		),
	),

	'mobile.special.app.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/app/common.less',
		),
	),

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
	'mobile.special.mobileoptions.scripts' => $wgMFMobileResourceBoilerplate + array(
		'position' => 'top',
		'dependencies' => array(
			'mobile.startup',
			'mobile.templates',
		),
		'scripts' => array(
			'javascripts/specials/mobileoptions.js',
		),
		'templates' => array(
			'specials/mobileoptions/checkbox',
		),
		'messages' => array(
			'mobile-frontend-off',
			'mobile-frontend-on',
			'mobile-frontend-expand-sections-description',
			'mobile-frontend-expand-sections-status',
		),
	),
	'mobile.special.mobileeditor.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
			'scripts' => array(
					'javascripts/specials/redirectmobileeditor.js',
			),
	),

	'mobile.special.nearby.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/specials/nearby.less',
		),
		'skinStyles' => array(
			'vector' => 'less/desktop/special/nearby.less',
		),
	),

	// @todo FIXME: Merge with mobile.nearby when geonotahack moves to  stable
	'mobile.special.nearby.beta' => $wgMFMobileResourceBoilerplate + array(
		'messages' => array(
			// NearbyOverlay.js
			'mobile-frontend-nearby-to-page',
			'mobile-frontend-nearby-title',

			// PagePreviewOverlay
			'mobile-frontend-nearby-directions',
			'mobile-frontend-nearby-link',
		),
		'templates' => array(
			'overlays/nearby',
		),
		'dependencies' => array(
			'mobile.stable.common',
			'mobile.nearby',
			'mobile.beta.common',
		),
		'scripts' => array(
			'javascripts/modules/nearby/PagePreviewOverlay.js',
			'javascripts/modules/nearby/NearbyOverlay.js',
		)
	),

	'mobile.special.nearby.scripts' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.nearby',
		),
		'messages' => array(
			// specials/nearby.js
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

	'mobile.special.notifications.scripts' => $wgMFMobileSpecialPageResourceScriptBoilerplate + array(
		'scripts' => array(
			'javascripts/specials/notifications.js',
		),
		'messages' => array(
			// defined in Echo
			'echo-load-more-error',
		),
	),

	'mobile.special.userprofile.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/userprofile.less',
		),
	),

	'mobile.special.uploads.scripts' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable.styles',
			'mobile.stable.common',
			'mobile.templates',
		),
		'templates' => array(
			'specials/uploads/photo',
			'specials/uploads/userGallery',
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
			'javascripts/specials/uploads.js',
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
	'mobile.special.mobilediff.scripts' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.loggingSchemas',
			'mobile.stable.common',
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
		),
	),

	'skins.minerva.special.preferences.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'scripts' => array(
			'javascripts/specials/preferences.js',
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
			'mobile.stable',
		),
		'scripts' => array(
			'javascripts/specials/watchlist.js',
		),
	),

	'skins.minerva.special.userlogin.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/userlogin.less',
		),
	),
);

$wgResourceModules = array_merge( $wgResourceModules, $wgMobileSpecialPageModules );
$wgResourceModules = array_merge( $wgResourceModules, $wgMinervaSpecialPageModules );
