Given(/^I am on the home page$/) do
  visit(HomePage)
end

When(/^I click the placeholder search box$/) do
  on(SearchPage).search_box_placeholder_element.when_present.click
end


When(/^I type into search box (.+)$/) do |search_term|
  on(SearchPage).search_box2=search_term
end

Then(/^Search results should contain (.+)$/) do |text|
  on(SearchPage).search_result_element.when_present.text.should == text
end
