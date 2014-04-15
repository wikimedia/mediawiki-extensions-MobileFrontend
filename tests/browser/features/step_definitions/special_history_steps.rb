Then(/^I see a list of page contributions$/) do
  on(SpecialHistoryPage).side_list_element.should exist
end

Then(/^I see a summary of the last contribution to the page$/) do
  on(SpecialHistoryPage).last_contribution_element.should exist
end

Then(/^The last contribution summary shows the username who made the last edit$/) do
  on(SpecialHistoryPage).last_contribution_username_element.should exist
end

Then(/^The last contribution summary does not show the title of the page edited$/) do
  on(SpecialHistoryPage).last_contribution_title_element.should_not exist
end

Then(/^The last contribution summary shows the edit summary$/) do
  on(SpecialHistoryPage).last_contribution_edit_summary_element.should exist
end

Then(/^The last contribution summary shows the time of the last edit$/) do
  on(SpecialHistoryPage).last_contribution_timestamp_element.should exist
end
