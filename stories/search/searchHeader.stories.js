import { wrap } from '../utils';
import searchHeader from '../../src/mobile.startup/search/searchHeader';
import '../../resources/mobile.startup/search/SearchOverlay.less';
import '../../.storybook/mediawiki-skins-MinervaNeue/skinStyles/mobile.startup/search/SearchOverlay.less';
import { action } from '@storybook/addon-actions';

export default {
	title: 'search'
};

export const SearchHeader = () =>
	wrap(
		searchHeader(
			'Type in the box to search',
			'/w/api.php',
			action( 'onInput' )
		),
		'overlay search-overlay visible'
	);

SearchHeader.story = {
	name: 'searchHeader'
};
