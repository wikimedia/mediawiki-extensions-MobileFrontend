<?php
/**
 * ResourceLoaderModule subclass for mobile
 * Allows basic parsing of messages without arguments
 */
class MFResourceLoaderModule extends ResourceLoaderModule {
	protected $parsedMessages = array();
	protected $messages = array();
	protected $localBasePath;

	/**
	 * Registers core modules and runs registration hooks.
	 */
	public function __construct( $options ) {
		if ( isset( $options[ 'messages' ] ) ) {
			$this->processMessages( $options[ 'messages'] );
		}
		if ( isset( $options[ 'localBasePath' ] ) ) {
			$this->localBasePath = $options[ 'localBasePath' ];
		}
	}

	/**
	 * Processes messages which have been marked as needing parsing
	 *
	 * @return String: JavaScript code
	 */
	public function addParsedMessages() {
		$js = "\n";
		foreach( $this->parsedMessages as $key ) {
			$value = wfMessage( $key )->parse();
			$js .= Xml::encodeJsCall( 'mw.messages.set', array( $key, $value ) );
		}
		return $js;
	}

	/**
	 * Separates messages which have been marked as needing parsing from standard messages
	 *
	 */
	public function processMessages( $messages ) {
		foreach( $messages as $key => $value ) {
			if ( is_array( $value ) ) {
				foreach( $value as $directive ) {
					if ( $directive == 'parse' ) {
						$this->parsedMessages[] = $key;
					}
				}
			} else {
				$this->messages[] = $value;
			}
		}
	}

	/**
	 * Gets list of message keys used by this module.
	 *
	 * @return Array: List of message keys
	 */
	public function getMessages() {
		return $this->messages;
	}

	/**
	 * Gets all scripts for a given context concatenated together including processed messages
	 *
	 * @param $context ResourceLoaderContext: Context in which to generate script
	 * @return String: JavaScript code for $context
	 */
	public function getScript( ResourceLoaderContext $context ) {
		return $this->addParsedMessages();
	}

	/**
	 * Checks whether any resources used by module have changed
	 *
	 * @param $context ResourceLoaderContext: Context in which to generate script
	 * @return Integer: UNIX timestamp
	 */
	public function getModifiedTime( ResourceLoaderContext $context ) {
		global $IP;
		return max(
			filemtime( "$IP/extensions/MobileFrontend/MobileFrontend.php" ),
			filemtime( "$IP/extensions/MobileFrontend/MobileFrontend.i18n.php" )
		);
	}
}
