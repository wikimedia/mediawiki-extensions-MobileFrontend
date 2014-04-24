When(/^I click the talk button$/) do
  on(ArticlePage).talk_element.when_present.click
end

Then(/^I see the talk overlay$/) do
  on(ArticlePage).overlay_heading_element.when_present.text.should match "Talk"
end

Then(/^There is no talk button$/) do
  on(ArticlePage).talk_element.should_not be_visible
end
