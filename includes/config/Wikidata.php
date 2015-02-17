<?php
// Needs to be called within MediaWiki; not standalone
if ( !defined( 'MEDIAWIKI' ) ) {
	echo "This is a MediaWiki extension and cannot run standalone.\n";
	die( -1 );
}

/**
 * API for querying Wikidata instance.
 * e.g. https://en.m.wikipedia.org/w/api.php
 *
 * @var String
 */
$wgMFWikiDataEndpoint = 'https://m.wikidata.org/w/api.php';

/**
 * If set to true and running alpha, will add Wikidata description to page JS as
 * wgMFDescription variable
 */
$wgMFUseWikibaseDescription = false;

/**
 * Property to use for instance of claim.
 */
$wgWikiBasePropertyConfig = array(
	'instanceOf' => 'P31',
	'bannerImage' => 'P18',
	'commonsCategory' => 'P373',
);

/**
 * Configuration for Infobox experiment
 */
$wgMFInfoboxConfig = array(
	// movie
	11424 => array(
		'rows' => array(
				// Director
				array( 'id' => 'P57' ),
				// Produced by
				array( 'id' => 'P162' ),
				// Story by
				array( 'id' => 'P58' ),
				// Based on
				array( 'id' => 'P144' ),
				// Starring
				array( 'id' => 'P161' ),
				// Music by
				array( 'id' => 'P86' ),
				// Cinematography
				array( 'id' => 'P344' ),
				// Film editor
				array( 'id' => 'P1040' ),
				// Production company
				array( 'id' => 'P272' ),
				// Distributor
				array( 'id' => 'P750' ),
				// Released'
				array( 'id' => 'P577' ),
			// FIXME=> running time is not available on Wikidata
				//Country of origin
				array( 'id' => 'P495' ),
				//Original language
				array( 'id' => 'P364' ),
			// FIXME=> budget is not available on Wikidata
			// FIXME=> box office is not available on Wikidata
		),
	),
	16521 => array(
		'rows' => array(
				// Conservation status
				array( 'id' => 'P141' ),
				// Genus
				array( 'id' => 'P171' ),
				// Species
				array( 'id' => 'P225' ),
				// Geographic distribution
				array( 'id' => 'P181' ),
		),
	),
	// country
	6256 => array(
		'rows' => array(
				// Flag
				array( 'id' => 'P41' ),
				// Coat of arms
				array( 'id' => 'P94' ),
			// FIXME=> add motto
				// Anthem
				array( 'id' => 'P85' ),
				// Location
				array( 'id' => 'P242' ),
				// Languages
				array( 'id' => 'P37' ),
				// Capital
				array( 'id' => 'P36' ),
				// FIXME=> Add ethnic groups
				// Basic form of government
				array( 'id' => 'P122' ),
				// Legislature
				array( 'id' => 'P194' ),
				// FIXME=> Add Area
				// Population
				array( 'id' => 'P1082' ),
				// FIXME: Add GDP
				// Currency
				array( 'id' => 'P38' ),
				// Timezone
				array( 'id' => 'P421' ),
				// FIXME=> add Date format
				// FIXME=> add Drives on the (left/right)
				// Country calling code
				array( 'id' => 'P474' ),
				// ISO 3166 code
				array( 'id' => 'P297' ),
				// Internet TLD
				array( 'id' => 'P78' ),
		),
	),
	// university
	3918 => array(
		'rows' => array(
			// logo
			array( 'id' => 'P154' ),
			// motto
			array( 'id' => 'P1451' ),
			// inception
			array( 'id' => 'P571' ),
			// location
			array( 'id' => 'P276' ),
			// coords
			array( 'id' => 'P625' ),
			// staff
			array( 'id' => 'P1128' ),
			// affliations
			array( 'id' => 'P1416' ),
			// coat of arms
			array( 'id' => 'P94' ),
		),
	),
	// television
	5398426 => array(
		'rows' => array(
			// genre
			array( 'id' => 'P136' ),
			// creator
			array( 'id' => 'P170' ),
			// writer
			array( 'id' => 'P58' ),
			// director
			array( 'id' => 'P57' ),
			// cast members
			array( 'id' => 'P1' ),
			// music
			array( 'id' => 'P86' ),
			// origin
			array( 'id' => 'P495' ),
			// original language
			array( 'id' => 'P364' ),
			// location
			array( 'id' => 'P276' ),
			// production
			array( 'id' => 'P272' ),
			// distributor
			array( 'id' => 'P750' ),
			// time of publication
			array( 'id' => 'P577' ),
		),
	),
	// city
	515 => array(
		'rows' => array(
				// Flag
				array( 'id' => 'P41' ),
				// Coat of arms
				array( 'id' => 'P94' ),
				// Coordinates
				array( 'id' => 'P625' ),
				// State
				array( 'id' => 'P131' ),
				// Country
				array( 'id' => 'P17' ),
				// Founded
				array( 'id' => 'P571' ),
				// Population
				array( 'id' => 'P1082' ),
				// Timezone
				array( 'id' => 'P421' ),
				// Born
				array( 'id' => 'P569' ),

		),
	),
	// human
	5 => array(
		'rows' => array(
				// Born
				array( 'id' => 'P569' ),
				// Birthplace
				array( 'id' => 'P19' ),
				// Died
				array( 'id' => 'P570' ),
				// Place of death
				array( 'id' => 'P20' ),
				// Country of citizenship
				array( 'id' => 'P27' ),
			// FIXME=> Add political party
				// Spouse(s)
				array( 'id' => 'P26' ),
				// Mother(s)
				array( 'id' => 'P25' ),
				// Father(s)
				array( 'id' => 'P22' ),
				//FIXME=> Add Stepfather(s) (P43) and step mothers?
				// Sister(s)
				array( 'id' => 'P9' ),
				// Brother(s)
				array( 'id' => 'P7' ),
				// Child(ren)
				array( 'id' => 'P40' ),
				// FIXME=> add residence?
				// Alma mater
				array( 'id' => 'P69' ),
				// Occupation
				array( 'id' => 'P106' ),
				// Employer(s)
				array( 'id' => 'P108' ),
				// Religion
				array( 'id' => 'P140' ),
				// FIXME=> add awards?
				// Signature
				array( 'id' => 'P109' ),
				// Official website
				array( 'id' => 'P856' ),
		),
	),
	'default' => array(
		'rows' => array(
				// Official website
				array( 'id' => 'P856' ),
		),
	),
);
