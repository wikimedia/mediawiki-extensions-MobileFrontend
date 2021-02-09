const path = require( 'path' );

function getModuleRules() {
	return [
		{
			// in core some LESS imports don't specify filename
			test: /\.less$/,
			use: [
				require.resolve('style-loader'),
				require.resolve('css-loader'),
				{
					loader: require.resolve('less-loader'),
					options: {
						paths: [
							// allow relative urls
							path.resolve( __dirname, 'resolve-less-imports' )
						]
					}
				}
			]
		}
	];
}

// automatically import all files ending in *.stories.js

module.exports = {
	stories: [
		'../stories/**/*.stories.js'
	],
	addons: [
		'@storybook/addon-actions'
	],
	webpackFinal: async (config) => {
		config.module.rules = config.module.rules.concat(
			getModuleRules()
		);
		return config;
	},
};
