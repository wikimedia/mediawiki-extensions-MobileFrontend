Given(/^I am on my contributions page$/) do
  visit(SpecialContributionsPage)
end

When(/^I click the link in the header bar$/) do
  on(SpecialContributionsPage).content_header_bar_link_element.click
end

Then(/^I should see a list of page contributions$/) do
  expect(on(SpecialContributionsPage).side_list_element).to be_visible
end

Then(/^I should see a summary of the last contribution$/) do
  expect(on(SpecialContributionsPage).last_contribution_element).to be_visible
end

Then(/^the last contribution summary should not show the username$/) do
  expect(on(SpecialHistoryPage).last_contribution_username_element).not_to be_visible
end

Then(/^the last contribution summary should show the title of the page edited$/) do
  expect(on(SpecialContributionsPage).last_contribution_title_element).to be_visible
end
