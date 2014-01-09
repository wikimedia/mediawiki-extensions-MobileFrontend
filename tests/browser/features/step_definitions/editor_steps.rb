When(/^I click the edit button$/) do
  on(ArticlePage).edit_button_element.when_present.click
end

Then(/^I see the editor$/) do
  on(ArticlePage).editor_overlay_element.should be_visible
end

When(/^I click the editor overlay close button$/) do
  on(ArticlePage).editor_overlay_close_button_element.click
end

Then(/^I don't see the editor$/) do
  on(ArticlePage).editor_overlay_element.should_not be_visible
end
