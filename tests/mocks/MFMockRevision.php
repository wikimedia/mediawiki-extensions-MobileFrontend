<?php
class MFMockRevision extends Revision {
	private $id;

	public function getId() {
		return $this->id;
	}

	public function __construct( $revisionId ) {
		if ( $revisionId > 200 ) {
			throw new MWException( 'Unknown revision ID' );
		}
		$this->id = $revisionId;
	}

	public static function newFromId( $revisionId, $flags = 0 ) {
		if ( $revisionId <= 200 ) {
			return new MFMockRevision( $revisionId );
		}
	}

	public function getTitle() {
		return new Title( "page_$this->id" );
	}

	public function getPrevious() {
		return new MFMockRevision( $this->id - 1 );
	}

	/**
	 * Get next revision for this title
	 *
	 * @return Revision or null
	 */
	public function getNext() {
		return new MFMockRevision( $this->id + 1 );
	}
}
?>
