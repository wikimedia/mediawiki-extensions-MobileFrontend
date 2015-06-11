When(/^I click the talk button$/) do
  on(ArticlePage).talk_element.when_present.click
end

When(/^I click the add discussion button$/) do
  on(ArticlePage).talkadd_element.when_present.click
end

Then(/^I should see the talk overlay$/) do
  expect(on(ArticlePage).overlay_heading_element.when_present.text).to match 'Talk'
end

Then(/^there should be no talk button$/) do
  expect(on(ArticlePage).talk_element).not_to be_visible
end

Then(/^there should be an add discussion button$/) do
  # give overlay time to fully load
  expect(on(ArticlePage).talkadd_element.when_present(10)).to be_visible
end

Then(/^there should be no add discussion button$/) do
  except(on(ArticlePage).talkadd_element).not_to be_visible
end
