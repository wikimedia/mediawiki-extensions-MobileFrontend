import util from '../../src/mobile.startup/util';
import SearchGateway from '../../src/mobile.startup/search/SearchGateway';
import { searchApiResult, watchApiResult } from './data';

const searchGateway = new SearchGateway( {
	get: ( query ) => {
		const d = util.Deferred().resolve(
			query.gsearch.toLowerCase().indexOf( 'b' ) > -1 ? searchApiResult : {} );
		d.abort = () => {};
		return d;
	}
} );

const watchstarApi = {
	get: () => util.Deferred().resolve( watchApiResult )
};

searchGateway.generator = { prefix: '' };

export { searchGateway, watchstarApi };
