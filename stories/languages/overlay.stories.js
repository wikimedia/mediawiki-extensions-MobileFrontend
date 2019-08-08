import { storiesOf } from '@storybook/html';
import languageOverlay from '../../src/mobile.startup/languageOverlay/languageOverlay';
import LanguageSearcher from '../../src/mobile.languages.structured/LanguageSearcher';
import m from '../../src/mobile.startup/moduleLoaderSingleton';
import { languageApiResponse } from './data';
import '../../resources/mobile.languages.structured/LanguageSearcher.less';
import '../../resources/mobile.startup/panel.less';
import '../../resources/mobile.pagelist.styles/pagelist.less';
import '../../resources/mobile.pagesummary.styles/pagesummary.less';

m.define( 'mobile.languages.structured/LanguageSearcher', LanguageSearcher );

storiesOf( 'languages' )
	.add( 'overlay',
		() => {
			const o = languageOverlay( {
				getPageLanguages: () => Promise.resolve( languageApiResponse )
			} );
			o.show();
			return o.$el[0];
		}
	);
