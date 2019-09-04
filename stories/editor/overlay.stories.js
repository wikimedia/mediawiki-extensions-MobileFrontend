import { storiesOf } from '@storybook/html';
import '../../node_modules/oojs-ui/dist/oojs-ui-core.js';
import '../../node_modules/oojs-ui/dist/oojs-ui-toolbars.js';
import '../../.storybook/resolve-less-imports/mediawiki.ui/components/inputs.less';
import Drawer from '../../src/mobile.startup/Drawer';
import { wrap } from '../utils';
import SourceEditorOverlay from '../../src/mobile.editor.overlay/SourceEditorOverlay';
import VisualEditorOverlay from '../../src/mobile.editor.overlay/VisualEditorOverlay';
import AbuseFilterOverlay from '../../src/mobile.editor.overlay/AbuseFilterOverlay';
import '../../resources/mobile.editor.overlay/editor.less';
import '../../resources/mobile.startup/panel.less';
import '../../resources/mobile.editor.overlay/BlockMessageDetails.less';
import { fakeApi, fakeFailToSaveApi, blockedApi } from './utils';

Drawer.prototype.appendToElement = '.drawer-container';

window.ve = {
	init: {
		mw: {
			targetFactory: {
				create: () => {
					return {
						load: () => Promise.resolve( {} ),
						once: () => {}
					};
				}
			}
		}
	}
};

storiesOf( 'editor' )
	.add( 'AbuseFilterOverlay', () => {
		const overlay = new AbuseFilterOverlay( {
			message: 'There is a problem. <strong>Oh no!</strong> Any <A href="/wiki/Banana">links</a> will open in new tabs.'
		} );
		overlay.show();
		return overlay.$el[0];
	} )
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
	.add( 'SourceEditorOverlay (sad path)',
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
