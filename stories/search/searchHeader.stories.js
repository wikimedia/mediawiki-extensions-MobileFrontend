import { storiesOf } from '@storybook/html';
import { wrap } from '../utils';
import searchHeader from '../../src/mobile.startup/search/searchHeader';
import '../../resources/mobile.startup/search/SearchOverlay.less';
import '../../.storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/search/SearchOverlay.less';
import { action } from '@storybook/addon-actions';

// Note quiet and block
storiesOf( 'search' )
	.add( 'searchHeader',
		() => wrap(
			searchHeader( 'Type in the box to search',
				'/w/api.php',
				action( 'onInput' )
			),
			'overlay search-overlay visible'
		)
	);
