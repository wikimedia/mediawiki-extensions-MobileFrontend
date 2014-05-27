Given(/^I visit my user profile page$/) do
  visit(SpecialUserProfilePage)
end

Then(/^I am on my user profile page$/) do
  on(SpecialUserProfilePage).activity_heading_element.should exist
end

Then(/^I can see my last edit$/) do
  on(SpecialUserProfilePage).last_edit_element.should exist
end

Then(/^there is a link to my user page$/) do
  on(SpecialUserProfilePage).user_page_link_element.should exist
end

Then(/^there is a link to my talk page$/) do
  on(SpecialUserProfilePage).talk_link_element.should exist
end

Then(/^there is a link to my contributions$/) do
  on(SpecialUserProfilePage).contributions_link_element.should exist
end

Then(/^there is a link to my uploads$/) do
  on(SpecialUserProfilePage).uploads_link_element.should exist
end
