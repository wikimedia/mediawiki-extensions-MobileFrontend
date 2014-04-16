Then(/^I am on my user profile page$/) do
  on(SpecialUserProfilePage).activity_heading_element.should exist
end
