When /^I click on the notification icon$/ do
  on(ArticlePage).notifications_button_element.when_present.click
end

When(/^the notifications overlay appears$/) do
  on(ArticlePage).notifications_overlay_element.when_present
end

Then(/^I should see the notifications overlay$/) do
  on(ArticlePage).notifications_overlay_element.when_present.should be_visible
end

When(/^I click the notifications overlay close button$/) do
  on(ArticlePage).notifications_overlay_close_button_element.when_present.click
end

Then(/^after (.+) seconds I should not see the notifications overlay$/) do |seconds|
  sleep seconds.to_i
  on(ArticlePage).notifications_overlay_element.should_not be_visible
end
