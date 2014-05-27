Given(/^I am on my contributions page$/) do
  visit(SpecialContributionsPage)
end

Then(/^I see a list of my contributions$/) do
  on(SpecialContributionsPage).side_list_element.should exist
end

Then(/^I see a summary of my last contribution$/) do
  on(SpecialContributionsPage).last_contribution_element.should exist
end

When(/^I click the link in the header bar$/) do
  on(SpecialContributionsPage).content_header_bar_link_element.click
end

Then(/^the last contribution summary shows the title of the page edited$/) do
  on(SpecialContributionsPage).last_contribution_title_element.should exist
end

Then(/^the last contribution summary does not show the username$/) do
  on(SpecialHistoryPage).last_contribution_username_element.should_not exist
end
