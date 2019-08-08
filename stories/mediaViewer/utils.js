import Thumbnail from '../../src/mobile.startup/Thumbnail';

const thumbnailData = {
	'File:Pisang.jpg': {
		thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Pisang.jpg/963px-Pisang.jpg',
		thumbwidth: 963,
		thumbheight: 640,
		descriptionurl: 'https://commons.wikimedia.org/wiki/File:Pisang.jpg',
		extmetadata: {
			Artist: {
				value: '<a href=\'//commons.wikimedia.org/wiki/User:Hariadhi\' title=\'User:Hariadhi\'>Hariadhi</a>',
				source: 'commons-desc-page'
			},
			LicenseShortName: {
				value: 'CC BY-SA 4.0',
				source: 'commons-desc-page',
				hidden: ''
			}
		}
	},
	'File:Bananas.jpg': {
		descriptionurl: 'https://commons.wikimedia.org/wiki/File:Bananas.jpg',
		thumbWidth: 400,
		thumbHeight: 400,
		thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bananas.jpg/800px-Bananas.jpg',
		extmetadata: {
			Artist: {
				value: 'Steve Hopson, <a rel="nofollow" class="external text" href="http://www.stevehopson.com">www.stevehopson.com</a>',
				source: 'commons-desc-page'
			},
			LicenseShortName: {
				value: 'CC BY-SA 2.5',
				source: 'commons-desc-page',
				hidden: ''
			}
		}
	}
};

export const fakeRouter = {
	on: () => {},
	navigateTo: () => {},
	getPath: () => '#/media'
};

export const fakeGateway = {
	getThumb: function ( title ) {
		return new Promise( ( resolve, reject ) => {
			if ( !thumbnailData[title] ) {
				reject();
			} else {
				resolve( thumbnailData[ title ] );
			}
		} );
	}
};

export const thumbnails = [
	new Thumbnail( {
		filename: 'File:Pisang.jpg'
	} ),
	new Thumbnail( {
		filename: 'File:Bananas.jpg'
	} ),
	new Thumbnail( {
		filename: 'File:Image with loading error hashahahhas.jpg'
	} )
];
