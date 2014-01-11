( function ( M, $ ) {

var module = M.require( 'modules/languages/languagesStable' );

QUnit.module( 'MobileFrontend: languages.js' );

QUnit.test( 'no results', function() {
	var i, list,
		examples = [
			[
				'<ul></ul>',
				0
			],
			[
				'<ul><li class="interwiki-de"><a href="//de.m.wikipedia.org/wiki/Unicorn" title="Unicorn" lang="de" hreflang="de">Deutsch</a></li><li class="interwiki-es"><a href="//es.m.wikipedia.org/wiki/Unicornio_(desambiguaci%C3%B3n)" title="Unicornio (desambiguación)" lang="es" hreflang="es">Español</a></li><li class="interwiki-fa"><a href="//fa.m.wikipedia.org/wiki/%D8%AA%DA%A9%E2%80%8C%D8%B4%D8%A7%D8%AE_(%D8%A7%D8%A8%D9%87%D8%A7%D9%85%E2%80%8C%D8%B2%D8%AF%D8%A7%DB%8C%DB%8C)" title="" lang="fa" hreflang="fa">فارسی</a></li><li class="interwiki-fr"><a href="//fr.m.wikipedia.org/wiki/Unicorn" title="Unicorn" lang="fr" hreflang="fr">Français</a></li><li class="interwiki-ko"><a href="//ko.m.wikipedia.org/wiki/%EC%9C%A0%EB%8B%88%EC%BD%98_(%EB%8F%99%EC%9D%8C%EC%9D%B4%EC%9D%98)" title="유니콘 (동음이의)" lang="ko" hreflang="ko">한국어</a></li><li class="interwiki-it"><a href="//it.m.wikipedia.org/wiki/Unicorn" title="Unicorn" lang="it" hreflang="it">Italiano</a></li><li class="interwiki-he"><a href="//he.m.wikipedia.org/wiki/%D7%97%D7%93-%D7%A7%D7%A8%D7%9F_(%D7%A4%D7%99%D7%A8%D7%95%D7%A9%D7%95%D7%A0%D7%99%D7%9D)" title="חד-קרן (פירושונים)" lang="he" hreflang="he">עברית</a></li><li class="interwiki-la"><a href="//la.m.wikipedia.org/wiki/Monoceros" title="Monoceros" lang="la" hreflang="la">Latina</a></li><li class="interwiki-lt"><a href="//lt.m.wikipedia.org/wiki/Vienaragis_(reik%C5%A1m%C4%97s)" title="Vienaragis (reikšmės)" lang="lt" hreflang="lt">Lietuvių</a></li><li class="interwiki-nl"><a href="//nl.m.wikipedia.org/wiki/Eenhoorn" title="Eenhoorn" lang="nl" hreflang="nl">Nederlands</a></li><li class="interwiki-ja"><a href="//ja.m.wikipedia.org/wiki/%E3%83%A6%E3%83%8B%E3%82%B3%E3%83%BC%E3%83%B3_(%E6%9B%96%E6%98%A7%E3%81%95%E5%9B%9E%E9%81%BF)" title="ユニコーン (曖昧さ回避)" lang="ja" hreflang="ja">日本語</a></li><li class="interwiki-pl"><a href="//pl.m.wikipedia.org/wiki/Jednoro%C5%BCec_(ujednoznacznienie)" title="Jednorożec (ujednoznacznienie)" lang="pl" hreflang="pl">Polski</a></li><li class="interwiki-pt"><a href="//pt.m.wikipedia.org/wiki/Unic%C3%B3rnio_(desambigua%C3%A7%C3%A3o)" title="Unicórnio (desambiguação)" lang="pt" hreflang="pt">Português</a></li><li class="interwiki-ru"><a href="//ru.m.wikipedia.org/wiki/%D0%95%D0%B4%D0%B8%D0%BD%D0%BE%D1%80%D0%BE%D0%B3_(%D0%B7%D0%BD%D0%B0%D1%87%D0%B5%D0%BD%D0%B8%D1%8F)" title="Единорог (значения)" lang="ru" hreflang="ru">Русский</a></li><li class="interwiki-fi"><a href="//fi.m.wikipedia.org/wiki/Unicorn" title="Unicorn" lang="fi" hreflang="fi">Suomi</a></li><li class="interwiki-uk"><a href="//uk.m.wikipedia.org/wiki/%D0%84%D0%B4%D0%B8%D0%BD%D0%BE%D1%80%D1%96%D0%B3_(%D0%B7%D0%BD%D0%B0%D1%87%D0%B5%D0%BD%D0%BD%D1%8F)" title="Єдиноріг (значення)" lang="uk" hreflang="uk">Українська</a></li></ul>',
				16,
				{ url: '//de.m.wikipedia.org/wiki/Unicorn', lang: 'de', langname: 'Deutsch', pageName: 'Unicorn' }
			],
			[
				'<ul><li><a href="//fr.m.wikipedia.org/wiki/Bonjour" lang="fr" title="Bonjour">French</a></li></ul>',
				1,
				{ url: '//fr.m.wikipedia.org/wiki/Bonjour', lang: 'fr', langname: 'French', pageName: 'Bonjour' }
			],
			[
				'<ul><li><a href="//klingon.m.wikipedia.org/wiki/MainPage" lang="klz">Klingon</a></li></ul>',
				1,
				{ url: '//klingon.m.wikipedia.org/wiki/MainPage', lang: 'klz', langname: 'Klingon' }
			]
		];
	QUnit.expect( examples.length * 2 );
	for( i = 0; i < examples.length; i++ ) {
		list = module.parseList(  $( examples[i][0] ) );
		strictEqual( list.length, examples[i][1], 'check the length was as expected' );
		deepEqual( list[0], examples[i][2], 'Check the first result' );
	}
} );

}( mw.mobileFrontend, jQuery ) );
