Then(/^I should see a more button$/) do
  expect(on(SpecialHistoryPage).more_link_element).to be_visible
end

Then(/^the last contribution summary should not show the title of the page edited$/) do
  expect(on(SpecialHistoryPage).last_contribution_title_element).not_to be_visible
end

Then(/^the last contribution summary should show the edit summary$/) do
  expect(on(SpecialHistoryPage).last_contribution_edit_summary_element).to be_visible
end

Then(/^the last contribution summary should show the time of the last edit$/) do
  expect(on(SpecialHistoryPage).last_contribution_timestamp_element).to be_visible
end

Then(/^the last contribution summary should show the username who made the last edit$/) do
  expect(on(SpecialHistoryPage).last_contribution_username_element).to be_visible
end
