import { storiesOf } from '@storybook/html';
import '../../node_modules/oojs-ui/dist/oojs-ui-core.js';
import '../../node_modules/oojs-ui/dist/oojs-ui-widgets.js';
import '../../node_modules/oojs-ui/dist/oojs-ui-core-wikimediaui.css';
import CategoryAddOverlay from '../../src/mobile.categories.overlays/CategoryAddOverlay';
import CategoryTabs from '../../src/mobile.categories.overlays/CategoryTabs';
import categoryOverlay from '../../src/mobile.categories.overlays/categoryOverlay';
import '../../resources/mobile.categories.overlays/categories.less';
import { categoriesResponse } from './data';
import util from '../../src/mobile.startup/util';
import { fakeEventBus } from '../utils';

storiesOf( 'categories' )
	.add( 'CategoryTabs',
		() => {
			return new CategoryTabs( {
				title: 'Foo',
				eventBus: fakeEventBus,
				subheading: 'Look at these categories',
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
