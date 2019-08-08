import { storiesOf } from '@storybook/html';
import { wrap } from '../utils';
import BetaOptInPanel from '../../src/mobile.init/BetaOptInPanel';
import '../../resources/mobile.init/BetaOptInPanel.less';
import '../../resources/mobile.startup/panel.less';
import { action } from '@storybook/addon-actions';

storiesOf( 'mobile' )
	.add( 'BetaOptInPanel',
		() => wrap(
			new BetaOptInPanel( {
				onCancel: action( 'onCancel' ),
				postUrl: '/w/api.php'
			} ),
			'content',
			'bodyContent'
		)
	);
