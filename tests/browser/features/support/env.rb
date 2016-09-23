require 'mediawiki_selenium/cucumber'
require 'mediawiki_selenium/pages'
require 'mediawiki_selenium/step_definitions'

require_relative 'extensions/resource_loader'

module PageObject
  include MobileFrontend::Extensions::ResourceLoader
end
