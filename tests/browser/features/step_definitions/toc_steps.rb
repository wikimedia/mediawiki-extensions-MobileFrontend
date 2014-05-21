Then(/^I do not see the table of contents$/) do
  # Give it time to load in case it accidentally was loaded.
  sleep(10)
  on(ArticlePage).toc_element.should_not be_visible
end

Then(/^I see the table of contents$/) do
  on(ArticlePage).toc_element.when_present(10).should be_visible
end
