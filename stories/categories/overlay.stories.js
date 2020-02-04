import { storiesOf } from '@storybook/html';
import '../../node_modules/oojs-ui/dist/oojs-ui-core.js';
import '../../node_modules/oojs-ui/dist/oojs-ui-widgets.js';
import '../../node_modules/oojs-ui/dist/oojs-ui-core-wikimediaui.css';
import CategoryAddOverlay from '../../src/mobile.categories.overlays/CategoryAddOverlay';
import CategoryTabs from '../../src/mobile.categories.overlays/CategoryTabs';
import categoryOverlay from '../../src/mobile.startup/categoryOverlay';
import '../../resources/mobile.categories.overlays/categories.less';
import { categoriesResponse } from './data';
import util from '../../src/mobile.startup/util';
import { fakeEventBus } from '../utils';
import m from '../../src/mobile.startup/moduleLoaderSingleton';

m.define( 'mobile.categories.overlays', {
	CategoryTabs,
	CategoryAddOverlay
} );

storiesOf( 'categories' )
	.add( 'CategoryTabs',
		() => {
			return new CategoryTabs( {
				title: 'Foo',
				eventBus: fakeEventBus,
				api: {
					get: () => Promise.resolve( categoriesResponse )
				}
			} ).$el[0];
		}
	)
	.add( 'categoryOverlay',
		() => {
			const o = categoryOverlay( {
				title: 'Foo',
				eventBus: fakeEventBus,
				api: {
					get: () => Promise.resolve( categoriesResponse )
				}
			} );

			o.show();
			return o.$el[0];
		}
	)
	.add( 'CategoryAddOverlay',
		() => {
			const o = new CategoryAddOverlay( {
				title: '`Title of page`',
				eventBus: fakeEventBus,
				api: {
					get: () => util.Deferred().resolve( categoriesResponse )
				}
			} );
			// provided by mw.config. Needed for search to work.
			o.gateway.generator = { prefix: '/' };
			o.show();
			return o.$el[0];
		}
	);
