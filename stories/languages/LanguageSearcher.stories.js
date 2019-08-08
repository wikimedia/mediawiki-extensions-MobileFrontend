import { storiesOf } from '@storybook/html';
import { wrap } from '../utils';
import LanguageSearcher from '../../src/mobile.languages.structured/LanguageSearcher';
import '../../resources/mobile.languages.structured/LanguageSearcher.less';
import '../../resources/mobile.startup/panel.less';
import '../../resources/mobile.pagelist.styles/pagelist.less';
import '../../resources/mobile.pagesummary.styles/pagesummary.less';
import { languageApiResponse } from './data';

storiesOf( 'languages' )
	.add( 'LanguageSearcher',
		() => wrap(
			new LanguageSearcher( languageApiResponse ),
			'language-overlay overlay visible'
		)
	);
