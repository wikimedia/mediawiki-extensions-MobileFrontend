Given /^I am on the home page$/ do
  visit(HomePage).text.should include "Today's featured article"
end

When /^I type (.+)$/ do |search_term|
  on(HomePage).search_box= search_term
end

Then /^Search box should be there$/ do
  on(HomePage).search_box_element.should exist
end
Then /^Search results should contain (.+)$/ do |text|
  on(HomePage).search_result_element.when_present.text.should == text
end
