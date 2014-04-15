Then(/^I see a list of search results$/) do
  on(SearchPage).list_of_results_element.when_present.should be_visible
end
