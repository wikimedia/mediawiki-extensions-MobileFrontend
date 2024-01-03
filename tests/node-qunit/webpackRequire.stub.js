module.exports = ( module ) => {
	switch ( module ) {
		case 'mediawiki.router':
			return {
				on: () => {},
				getPath: () => {}
			};
		case 'mediawiki.page.watch.ajax':
			return {
				watchstar: () => {}
			};
		default:
			return {};
	}
};
