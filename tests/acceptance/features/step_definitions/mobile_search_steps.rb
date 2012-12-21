Given /^I am on the mobile website$/ do
  visit(MobilePage).text.should include "Today's featured article"
end

When /^I type (.+)$/ do |search_term|
  on(MobilePage).search_box= search_term
end

Then /^Search box should be there$/ do
  on(MobilePage).search_box_element.should exist
end
Then /^Search results should contain (.+)$/ do |text|
  # http://www.mediawiki.org/wiki/Mobile/Testing_process#SmartPhone
  pending if ENV['BROWSER_LABEL'] and ENV['BROWSER_LABEL'].match /internet_explorer_(6|7|10)/

  on(MobilePage).search_result_element.when_present.text.should == text
end
