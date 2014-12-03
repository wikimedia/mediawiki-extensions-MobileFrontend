When(/^I click the more link$/) do
  on(SpecialHistoryPage).more_link_element.click
end

When(/^I open the latest diff$/) do
  on(SpecialHistoryPage).last_contribution_link_element.click
end

Then(/^I should see a more button$/) do
  on(SpecialHistoryPage).more_link_element.should exist
end

Then(/^the last contribution summary should not show the title of the page edited$/) do
  on(SpecialHistoryPage).last_contribution_title_element.should_not exist
end

Then(/^the last contribution summary should show the edit summary$/) do
  on(SpecialHistoryPage).last_contribution_edit_summary_element.should exist
end

Then(/^the last contribution summary should show the time of the last edit$/) do
  on(SpecialHistoryPage).last_contribution_timestamp_element.should exist
end

Then(/^the last contribution summary should show the username who made the last edit$/) do
  on(SpecialHistoryPage).last_contribution_username_element.should exist
end
