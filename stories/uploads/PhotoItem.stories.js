import { storiesOf } from '@storybook/html';
import PhotoItem from '../../src/mobile.special.uploads.scripts/PhotoItem';
import '../../resources/mobile.special.uploads.scripts/gallery.less';
import '../../resources/mobile.special.uploads.styles/default.less';

storiesOf( 'uploads' )
	.add( 'PhotoItem',
		() => {
			// FIXME: `ul` shouldn't be necessary but PhotoItem is a `li` element.
			const ul = document.createElement( 'ul' );
			// FIXME: this also shouldn't be necessary.
			ul.setAttribute( 'class', 'image-list' );
			ul.appendChild(
				new PhotoItem( {
					descriptionUrl: 'https://commons.wikimedia.org/wiki/File:Bananas.jpg',
					description: 'A photo of bananas',
					width: 400,
					url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bananas.jpg/800px-Bananas.jpg'
				} ).$el[0]
			);
			return ul;
		}
	);
