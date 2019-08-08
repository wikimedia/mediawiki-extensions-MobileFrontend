const path = require( 'path' );

module.exports = {
		module: {
		rules: [ {
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					// Beware of https://github.com/babel/babel-loader/issues/690. Changes to browsers require
					// manual invalidation.
					cacheDirectory: true
				}
			}
		}, {
						// in core some LESS imports don't specify filename
			test: /\.less$/,
			use: [ {
				loader: 'style-loader'
			}, {
				loader: 'css-loader'
			}, {
				loader: 'less-loader',
				options: {
					paths: [
						// allow relative urls
						path.resolve( __dirname, 'resolve-less-imports' ),
						/**
						 * Less files are resolved to this path,
						 * which contain less files that essentially
						 * just reach into mediawiki core fo the
						 * appropriate files.
						 * This path is also specified in stories/index.stories.less
						 * when importing '../../src/ui/index.less'.
						 */
						path.resolve(
								__dirname, '../../../resources/src/mediawiki.less'
						)
					]
				}
			} ]
		} ]
	}
};
