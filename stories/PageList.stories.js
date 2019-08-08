import { storiesOf } from '@storybook/html';
import PageList from '../src/mobile.startup/PageList';
import '../resources/mobile.pagelist.styles/pagelist.less';
import '../resources/mobile.pagesummary.styles/pagesummary.less';

storiesOf( 'PageList' )
	.add( 'default',
		() => {
			return new PageList( {
				pages: [
					{
						title: 'London',
						id: 1,
						isMissing: true,
						url: 'https://en.wikipedia.org/wiki/London',
						latitude: 1,
						longitude: 1,
						thumbnail: {
							isLandscape: false,
							source: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/London_Montage_L.jpg/53px-London_Montage_L.jpg'
						},
						displayTitle: 'LoNdOn',
						wikidataDescription: 'A city',
						lastModified: 'Information about London',
						proximity: '10km'
					},
					{
						title: 'Paris',
						displayTitle: 'Paris',
						id: 2,
						isMissing: true,
						url: 'https://en.wikipedia.org/wiki/Paris',
						latitude: 1,
						longitude: 1,
						wikidataDescription: 'Another city'
					},
					{
						title: 'Singapore',
						displayTitle: 'Singapore',
						id: 2,
						isMissing: true,
						url: 'https://en.wikipedia.org/wiki/Barcelona',
						latitude: 1,
						longitude: 1,
						thumbnail: {
							isLandscape: true,
							source: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Singapore.svg/80px-Flag_of_Singapore.svg.png'
						},
						wikidataDescription: 'And another city'
					}
				]
			} ).$el[0];
		}
	);
