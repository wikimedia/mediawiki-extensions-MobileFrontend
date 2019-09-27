import { storiesOf } from '@storybook/html';
import '../../node_modules/oojs-ui/dist/oojs-ui-core.js';
import '../../node_modules/oojs-ui/dist/oojs-ui-toolbars.js';
import '../../.storybook/resolve-less-imports/mediawiki.ui/components/inputs.less';
import Drawer from '../../src/mobile.startup/Drawer';
import { wrap } from '../utils';
import SourceEditorOverlay from '../../src/mobile.editor.overlay/SourceEditorOverlay';
import VisualEditorOverlay from '../../src/mobile.editor.overlay/VisualEditorOverlay';
import '../../resources/mobile.editor.overlay/editor.less';
import '../../resources/mobile.startup/panel.less';
import '../../resources/mobile.editor.overlay/BlockMessageDetails.less';
import { fakeApi, fakeFailToSaveApi, blockedApi,
	abuseFilterDisallowedApi, abuseFilterSpamApi,
	editConflictApi, readOnlyApi, triggerCaptchaApi,
	abuseFilterWarningApi } from './utils';

Drawer.prototype.appendToElement = '.drawer-container';

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

storiesOf( 'editor' )
	.add( 'VisualEditorOverlay', () => {
		const overlay = new VisualEditorOverlay( {
			title: 'Banana',
			visualEditorConfig: {},
			dataPromise: Promise.resolve( {} ),
			editorOptions: {}
		} );
		overlay.show();
		return overlay.$el[0];
	} )
	.add( 'VisualEditorOverlay (with anon warning)',
		() => {
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
		}
	)
	.add( 'SourceEditorOverlay (with anon warning)',
		() => {
			const overlay = new SourceEditorOverlay( {
				title: 'Banana',
				isAnon: true,
				api: fakeApi,
				editorOptions: {},
				visualEditorConfig: {}
			} );
			overlay.show();
			return overlay.$el[0];
		}
	)
	.add( 'SourceEditorOverlay (blocked user)',
		() => {
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
		}
	)
	.add( 'SourceEditorOverlay (happy path)',
		() => {
			const overlay = new SourceEditorOverlay( {
				title: 'Banana',
				api: fakeApi,
				editorOptions: {},
				visualEditorConfig: {}
			} );
			overlay.show();
			return overlay.$el[0];
		}
	)
	.add( 'SourceEditorOverlay (AbuseFilter warning)',
		() => {
			const overlay = new SourceEditorOverlay( {
				title: 'Banana',
				api: abuseFilterWarningApi,
				editorOptions: {},
				visualEditorConfig: {}
			} );
			overlay.show();
			return overlay.$el[0];
		}
	)
	.add( 'SourceEditorOverlay (AbuseFilter disallowed)',
		() => {
			const overlay = new SourceEditorOverlay( {
				title: 'Banana',
				api: abuseFilterDisallowedApi,
				editorOptions: {},
				visualEditorConfig: {}
			} );
			overlay.show();
			return overlay.$el[0];
		}
	)
	.add( 'SourceEditorOverlay (AbuseFilter spam)',
		() => {
			const overlay = new SourceEditorOverlay( {
				title: 'Banana',
				api: abuseFilterSpamApi,
				editorOptions: {},
				visualEditorConfig: {}
			} );
			overlay.show();
			return overlay.$el[0];
		}
	)
	.add( 'SourceEditorOverlay (AbuseFilter spam)',
		() => {
			const overlay = new SourceEditorOverlay( {
				title: 'Banana',
				api: abuseFilterSpamApi,
				editorOptions: {},
				visualEditorConfig: {}
			} );
			overlay.show();
			return overlay.$el[0];
		}
	)
	.add( 'SourceEditorOverlay (edit conflict)',
		() => {
			const overlay = new SourceEditorOverlay( {
				title: 'Banana',
				api: editConflictApi,
				editorOptions: {},
				visualEditorConfig: {}
			} );
			overlay.show();
			return overlay.$el[0];
		}
	)
	.add( 'SourceEditorOverlay (wiki is readonly)',
		() => {
			const overlay = new SourceEditorOverlay( {
				title: 'Banana',
				api: readOnlyApi,
				editorOptions: {},
				visualEditorConfig: {}
			} );
			overlay.show();
			return overlay.$el[0];
		}
	)
	.add( 'SourceEditorOverlay (trigger captcha)',
		() => {
			const overlay = new SourceEditorOverlay( {
				title: 'Banana',
				api: triggerCaptchaApi,
				editorOptions: {},
				visualEditorConfig: {}
			} );
			overlay.show();
			return overlay.$el[0];
		}
	)
	.add( 'SourceEditorOverlay (generic error)',
		() => {
			const overlay = new SourceEditorOverlay( {
				title: 'Banana',
				api: fakeFailToSaveApi,
				editorOptions: {},
				visualEditorConfig: {}
			} );
			overlay.show();
			return overlay.$el[0];
		}
	);
