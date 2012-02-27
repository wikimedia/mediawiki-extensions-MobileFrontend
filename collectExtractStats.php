<?php

$IP = getenv( 'MW_INSTALL_PATH' );
if ( $IP === false ) {
	$IP = dirname( __FILE__ ) . '/../..';
}
require_once( "$IP/maintenance/Maintenance.php" );

class CollectStats extends Maintenance {
	public function __construct() {
		parent::__construct();
		$this->mDescription = 'Developer script that calculates average full extract size';
		$this->addArg( 'rate', 'Check excerpt length for one page of this number', true );
	}

	public function execute() {
		if ( !class_exists( 'ApiQueryExcerpt' ) ) {
			$this->error( 'This script requires MobileFrontend to be properly installed', true );
		}
		$rate = $this->getArg( 0 );
		$ns = array( NS_MAIN );
		$pageId = 0;
		$dbr = $this->getDB( DB_SLAVE );
		$total = 0;
		$calls = 0;
		$html = 0;
		$plain = 0;
		do {
			$res = $dbr->select( 'page',
				array( 'page_id', 'page_namespace', 'page_title' ),
				array( 'page_namespace' => $ns, 'page_is_redirect' => 0, "page_id > $pageId" ),
				__METHOD__,
				array( 'ORDER BY' => 'page_id', 'LIMIT' => 500 )
			);
			foreach ( $res as $row ) {
				$pageId = $row->page_id;
				if ( $total++ % $rate == 0 ) {
					$title = Title::newFromRow( $row );
					$html += $this->getLength( $title, false );
					$plain += $this->getLength( $title, true );
					if ( ++$calls % 10 == 0 ) {
						$this->output( "$calls\n" );
					}
				}
			}
		} while( $res->numRows() > 0 );
		
		$this->output( "Total pages processed: $calls\n" );
		if ( $calls > 0 ) {
			$html /= $calls;
			$plain /= $calls;
			$this->output( "   Average HTML length: $html\n   Average plaintext length: $plain\n" );
		}
	}

	private function getLength( Title $title, $plainText ) {
		$params = array(
			'action' => 'query',
			'prop' => 'excerpt',
			'titles' => $title->getPrefixedText(),
		);
		if ( $plainText ) {
			$params['explaintext'] = 1;
		}
		$main = new ApiMain( new FauxRequest( $params ) );
		$main->execute();
		$data = $main->getResultData();
		return strlen( $data['query']['pages'][$title->getArticleID()]['excerpt'][0] );
	}
}

$maintClass = 'CollectStats';
require_once( DO_MAINTENANCE );