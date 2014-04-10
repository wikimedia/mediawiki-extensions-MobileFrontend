Then(/^I should see that this page has issues$/) do
  on(ArticlePage).issues_stamp_element.when_present.should be_visible
end

When(/^I click the page issues stamp$/) do
  on(ArticlePage).issues_stamp_element.when_present.click
end

Then(/^I see the issues overlay$/) do
  on(ArticlePage).overlay_element.when_present.should be_visible
end

When(/^I click the overlay issue close button$/) do
  on(ArticlePage).overlay_close_button_element.when_present.click
end

Then(/^I don't see the issues overlay$/) do
  on(ArticlePage).overlay_element.when_not_present(2)
end
