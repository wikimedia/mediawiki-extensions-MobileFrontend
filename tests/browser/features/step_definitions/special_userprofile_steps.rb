Given(/^I visit my user profile page$/) do
  visit(SpecialUserProfilePage)
end

Then(/^I should be on my user profile page$/) do
  expect(on(SpecialUserProfilePage).activity_heading_element).to be_visible
end

Then(/^I should see my last edit$/) do
  expect(on(SpecialUserProfilePage).last_edit_element).to be_visible
end

Then(/^there should be a link to my contributions$/) do
  expect(on(SpecialUserProfilePage).contributions_link_element).to be_visible
end

Then(/^there should be a link to my talk page$/) do
  expect(on(SpecialUserProfilePage).talk_link_element).to be_visible
end

Then(/^there should be a link to my uploads$/) do
  expect(on(SpecialUserProfilePage).uploads_link_element).to be_visible
end

Then(/^there should be a link to my user page$/) do
  expect(on(SpecialUserProfilePage).user_page_link_element).to be_visible
end
