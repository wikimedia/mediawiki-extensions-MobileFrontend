Then(/^I should see a wikidata description$/) do
  expect(on(ArticlePage).wikidata_description_element).to be_visible
end

Then(/^I should not see a wikidata description$/) do
  expect(on(ArticlePage).wikidata_description_element).not_to be_visible
end
