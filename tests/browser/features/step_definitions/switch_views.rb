Given(/^I toggle the mobile view$/) do
  on(Page).toggle_mobile_view
end

Then(/^I should see the mobile view$/) do
  expect(on(Page).toggle_view_desktop_element).to be_visible
end

Given(/^I toggle the desktop view$/) do
  on(Page).toggle_desktop_view
end

Then(/^I should see the desktop view$/) do
  expect(on(Page).toggle_view_mobile_element).to be_visible
end
