<?php
/**
 * ResourceLoaderModule subclass for mobile
 * Allows basic parsing of messages without arguments
 */
class MFResourceLoaderParsedMessageModule extends ResourceLoaderFileModule {
	/** @var array Saves a list of messages which have been marked as needing parsing. */
	protected $parsedMessages = array();
	/** @var array Saves a list of message keys used by this module. */
	protected $messages = array();
	/** @var array Saves the target for the module (e.g. desktop and mobile). */
	protected $targets = array( 'mobile', 'desktop' );
	/** @var boolean Whether the module abuses getScripts. */
	protected $hasHackedScriptMode = false;

	/**
	 * Registers core modules and runs registration hooks.
	 * @param $options List of options; if not given or empty, an empty module will be constructed
	 */
	public function __construct( $options ) {
		foreach ( $options as $member => $option ) {
			switch ( $member ) {
				case 'messages':
					$this->processMessages( $option );
					$this->hasHackedScriptMode = true;
					// Prevent them being reinitialised when parent construct is called.
					unset( $options[$member] );
					break;
			}
		}

		parent::__construct( $options );
	}

	/**
	 * Processes messages which have been marked as needing parsing
	 *
	 * @return string JavaScript code
	 */
	public function addParsedMessages() {
		$js = "\n";
		foreach ( $this->parsedMessages as $key ) {
			$value = wfMessage( $key )->parse();
			$js .= Xml::encodeJsCall( 'mw.messages.set', array( $key, $value ) );
		}
		return $js;
	}

	/**
	 * Separates messages which have been marked as needing parsing from standard messages
	 * @param array $messages Array of messages to process
	 */
	public function processMessages( $messages ) {
		foreach ( $messages as $key => $value ) {
			if ( is_array( $value ) ) {
				foreach ( $value as $directive ) {
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
	 * @return array List of message keys
	 */
	public function getMessages() {
		return $this->messages;
	}

	/**
	 * Gets all scripts for a given context concatenated together including processed messages
	 *
	 * @param ResourceLoaderContext $context Context in which to generate script
	 * @return string JavaScript code for $context
	 */
	public function getScript( ResourceLoaderContext $context ) {
		$script = parent::getScript( $context );
		return $this->addParsedMessages() . $script;
	}

	/**
	 * Get the URL or URLs to load for this module's JS in debug mode.
	 * @param ResourceLoaderContext $context
	 * @return array list of urls
	 * @see ResourceLoaderModule::getScriptURLsForDebug
	 */
	public function getScriptURLsForDebug( ResourceLoaderContext $context ) {
		if ( $this->hasHackedScriptMode ) {
			$derivative = new DerivativeResourceLoaderContext( $context );
			$derivative->setDebug( true );
			$derivative->setModules( array( $this->getName() ) );
			// @todo FIXME: Make this templates and update
			// makeModuleResponse so that it only outputs template code.
			// When this is done you can merge with parent array and
			// retain file names.
			$derivative->setOnly( 'scripts' );
			$rl = $derivative->getResourceLoader();
			$urls = array(
				$rl->createLoaderURL( $this->getSource(), $derivative ),
			);
		} else {
			$urls = parent::getScriptURLsForDebug( $context );
		}
		return $urls;
	}
}
