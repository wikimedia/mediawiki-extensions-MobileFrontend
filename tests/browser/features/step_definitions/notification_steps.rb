When /^I click on the notification icon$/ do
  on(ArticlePage).notifications_button_element.when_present.click
end

Then(/^I see the notifications overlay$/) do
  on(ArticlePage).notifications_overlay_element.should be_visible
end

When(/^I click the notifications overlay close button$/) do
  on(ArticlePage).notifications_overlay_close_button_element.click
end

Then(/^I don't see the notifications overlay$/) do
  on(ArticlePage).notifications_overlay_element.should_not be_visible
end
