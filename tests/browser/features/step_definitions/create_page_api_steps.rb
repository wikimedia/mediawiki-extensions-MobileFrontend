# export MEDIAWIKI_API_URL = http://en.wikipedia.beta.wmflabs.org/w/api.php

Given(/^I create a random page using the API$/) do
  abort "Environment variable MEDIAWIKI_API_URL must be set in order to create a target page for this test" if (ENV["MEDIAWIKI_API_URL"] == nil)
  client = MediawikiApi::Client.new(ENV["MEDIAWIKI_API_URL"])
  client.log_in(ENV["MEDIAWIKI_USER"], ENV["MEDIAWIKI_PASSWORD"])
  client.create_page(@random_string, @random_string)
end
