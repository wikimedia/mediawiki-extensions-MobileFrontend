When(/^I go to uploads page$/) do
  visit(UploadsPage)
end

Then(/^I see a blue tutorial screen$/) do
  on(UploadsPage).tutorial_element.when_present.should exist
end

Then(/^I see a next button$/) do
  on(UploadsPage).next_button_element.when_present.should exist
end
