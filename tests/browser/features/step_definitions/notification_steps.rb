When /^I click on the notification icon$/ do
  sleep 1
  on(ArticlePage).notifications_button_element.when_present.click
end

When(/^I click the notifications overlay close button$/) do
  sleep 1
  on(ArticlePage).notifications_overlay_close_button_element.when_present.click
end

When(/^the notifications overlay appears$/) do
  on(ArticlePage).notifications_overlay_element.when_present
end

Then(/^after (.+) seconds I should not see the notifications overlay$/) do |seconds|
  sleep seconds.to_i
  expect(on(ArticlePage).notifications_overlay_element).not_to be_visible
end

Then(/^I should see the notifications overlay$/) do
  expect(on(ArticlePage).notifications_overlay_element.when_present).to be_visible
end
