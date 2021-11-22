import '../../node_modules/oojs-ui/dist/oojs-ui-core.js';
import '../../node_modules/oojs-ui/dist/oojs-ui-toolbars.js';
import '../../.storybook/resolve-less-imports/mediawiki.ui.input/input.less';
import { wrap } from '../utils';
import SourceEditorOverlay from '../../src/mobile.editor.overlay/SourceEditorOverlay';
import VisualEditorOverlay from '../../src/mobile.editor.overlay/VisualEditorOverlay';
import '../../resources/mobile.editor.overlay/editor.less';
import '../../resources/mobile.startup/panel.less';
import '../../resources/mobile.editor.overlay/BlockMessageDetails.less';
import {
	fakeApi,
	fakeFailToSaveApi,
	blockedApi,
	abuseFilterDisallowedApi,
	abuseFilterSpamApi,
	editConflictApi,
	readOnlyApi,
	triggerCaptchaApi,
	abuseFilterWarningApi
} from './utils';

window.ve = {
	init: {
		mw: {
			targetFactory: {
				create: () => {
					return {
						getSurface: () => {
							return {
								getMode: () => {}
							};
						},
						restoreEditSection: () => {},
						adjustContentPadding: () => {},
						load: () => Promise.resolve( {} ),
						once: () => {}
					};
				}
			}
		}
	}
};

export default {
	title: 'editor'
};

export const _VisualEditorOverlay = () => {
	const overlay = new VisualEditorOverlay( {
		title: 'Banana',
		visualEditorConfig: {},
		dataPromise: Promise.resolve( {} ),
		editorOptions: {}
	} );
	overlay.show();
	return overlay.$el[0];
};

_VisualEditorOverlay.story = {
	name: 'VisualEditorOverlay'
};

export const VisualEditorOverlayWithAnonWarning = () => {
	const overlay = new VisualEditorOverlay( {
		isAnon: true,
		visualEditorConfig: {},
		dataPromise: Promise.resolve( {} ),
		editorOptions: {
			title: 'Banana',
			mode: 'visual'
		}
	} );
	overlay.show();
	return overlay.$el[0];
};

VisualEditorOverlayWithAnonWarning.story = {
	name: 'VisualEditorOverlay (with anon warning)'
};

export const SourceEditorOverlayWithAnonWarning = () => {
	const overlay = new SourceEditorOverlay( {
		title: 'Banana',
		isAnon: true,
		api: fakeApi,
		editorOptions: {},
		visualEditorConfig: {}
	} );
	overlay.show();
	return overlay.$el[0];
};

SourceEditorOverlayWithAnonWarning.story = {
	name: 'SourceEditorOverlay (with anon warning)'
};

export const SourceEditorOverlayBlockedUser = () => {
	const overlay = new SourceEditorOverlay( {
		title: 'Banana',
		api: blockedApi,
		editorOptions: {},
		visualEditorConfig: {}
	} );
	overlay.show();
	// FIXME: This although weird reflects how this actually works.
	// This behaviour should be passed in as a callback or use an eventEmitter.
	// e.g. onErrorLoadingContent
	overlay.getLoadingPromise().then( null, ( drawer ) => {
		overlay.hide();
		drawer.show();
	} );

	return wrap( overlay.$el[0], 'drawer-container' );
};

SourceEditorOverlayBlockedUser.story = {
	name: 'SourceEditorOverlay (blocked user)'
};

export const SourceEditorOverlayHappyPath = () => {
	const overlay = new SourceEditorOverlay( {
		title: 'Banana',
		api: fakeApi,
		editorOptions: {},
		visualEditorConfig: {}
	} );
	overlay.show();
	return overlay.$el[0];
};

SourceEditorOverlayHappyPath.story = {
	name: 'SourceEditorOverlay (happy path)'
};

export const SourceEditorOverlayAbuseFilterWarning = () => {
	const overlay = new SourceEditorOverlay( {
		title: 'Banana',
		api: abuseFilterWarningApi,
		editorOptions: {},
		visualEditorConfig: {}
	} );
	overlay.show();
	return overlay.$el[0];
};

SourceEditorOverlayAbuseFilterWarning.story = {
	name: 'SourceEditorOverlay (AbuseFilter warning)'
};

export const SourceEditorOverlayAbuseFilterDisallowed = () => {
	const overlay = new SourceEditorOverlay( {
		title: 'Banana',
		api: abuseFilterDisallowedApi,
		editorOptions: {},
		visualEditorConfig: {}
	} );
	overlay.show();
	return overlay.$el[0];
};

SourceEditorOverlayAbuseFilterDisallowed.story = {
	name: 'SourceEditorOverlay (AbuseFilter disallowed)'
};

export const SourceEditorOverlayAbuseFilterSpam = () => {
	const overlay = new SourceEditorOverlay( {
		title: 'Banana',
		api: abuseFilterSpamApi,
		editorOptions: {},
		visualEditorConfig: {}
	} );
	overlay.show();
	return overlay.$el[0];
};

SourceEditorOverlayAbuseFilterSpam.story = {
	name: 'SourceEditorOverlay (AbuseFilter spam)'
};

export const _SourceEditorOverlayAbuseFilterSpam = () => {
	const overlay = new SourceEditorOverlay( {
		title: 'Banana',
		api: abuseFilterSpamApi,
		editorOptions: {},
		visualEditorConfig: {}
	} );
	overlay.show();
	return overlay.$el[0];
};

_SourceEditorOverlayAbuseFilterSpam.story = {
	name: 'SourceEditorOverlay (AbuseFilter spam)'
};

export const SourceEditorOverlayEditConflict = () => {
	const overlay = new SourceEditorOverlay( {
		title: 'Banana',
		api: editConflictApi,
		editorOptions: {},
		visualEditorConfig: {}
	} );
	overlay.show();
	return overlay.$el[0];
};

SourceEditorOverlayEditConflict.story = {
	name: 'SourceEditorOverlay (edit conflict)'
};

export const SourceEditorOverlayWikiIsReadonly = () => {
	const overlay = new SourceEditorOverlay( {
		title: 'Banana',
		api: readOnlyApi,
		editorOptions: {},
		visualEditorConfig: {}
	} );
	overlay.show();
	return overlay.$el[0];
};

SourceEditorOverlayWikiIsReadonly.story = {
	name: 'SourceEditorOverlay (wiki is readonly)'
};

export const SourceEditorOverlayTriggerCaptcha = () => {
	const overlay = new SourceEditorOverlay( {
		title: 'Banana',
		api: triggerCaptchaApi,
		editorOptions: {},
		visualEditorConfig: {}
	} );
	overlay.show();
	return overlay.$el[0];
};

SourceEditorOverlayTriggerCaptcha.story = {
	name: 'SourceEditorOverlay (trigger captcha)'
};

export const SourceEditorOverlayGenericError = () => {
	const overlay = new SourceEditorOverlay( {
		title: 'Banana',
		api: fakeFailToSaveApi,
		editorOptions: {},
		visualEditorConfig: {}
	} );
	overlay.show();
	return overlay.$el[0];
};

SourceEditorOverlayGenericError.story = {
	name: 'SourceEditorOverlay (generic error)'
};
