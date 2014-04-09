When(/^I click on a reference$/) do
  on(ArticlePage).reference_element.click
end

Then(/^I see the reference drawer$/) do
  on(ArticlePage).reference_drawer_element.when_present.should be_visible
end

Then(/^I do not see the reference drawer$/) do
  on(ArticlePage).reference_drawer_element.when_not_present
end
