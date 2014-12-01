When(/^I click on a reference$/) do
  on(ArticlePage) do |page|
    page.reference_element.click
    page.reference_drawer_element.when_present
  end
end

Then(/^I should see the reference drawer$/) do
  expect(on(ArticlePage).reference_drawer_element).to be_visible
end

Then(/^I should not see the reference drawer$/) do
  expect(on(ArticlePage).reference_drawer_element.when_not_present).to be_nil
end
