import { storiesOf } from '@storybook/html';
import { wrap } from '../utils';
import SearchResultsView from '../../src/mobile.startup/search/SearchResultsView';
import SearchOverlay from '../../src/mobile.startup/search/SearchOverlay';
import '../../resources/mobile.startup/search/SearchOverlay.less';
import '../../.storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/search/SearchOverlay.less';
import { searchGateway, watchstarApi } from './utils';

storiesOf( 'search' )
	.add( 'SearchResultsView',
		() => wrap(
			new SearchResultsView( {
				searchContentLabel: 'Want to do a full text search?',
				noResultsMsg: 'No results',
				searchContentNoResultsMsg: '<strong>Got nothing</strong>. Want to do a full text search?'
			} ),
			'overlay search-overlay visible'
		)
	)
	.add( 'overlay', () => {
		const overlay = new SearchOverlay( {
			placeholderMsg: 'Search for bananas',
			api: watchstarApi,
			gateway: searchGateway
		} );
		overlay.show();
		return wrap(
			overlay,
			'overlay-enabled'
		);
	} );
