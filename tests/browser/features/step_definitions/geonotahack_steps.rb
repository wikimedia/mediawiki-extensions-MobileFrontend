Then(/^I see the nearby button$/) do
  on(ArticlePage).nearby_button_element.when_present.should be_visible
end

When(/^I click the nearby button$/) do
  on(ArticlePage).nearby_button_element.when_present.click
end

Then(/^I see the nearby overlay$/) do
  on(ArticlePage).overlay_heading_element.when_present.text.should match "Nearby"
end
