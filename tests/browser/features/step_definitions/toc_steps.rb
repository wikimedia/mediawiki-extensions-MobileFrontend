Then(/^I should not see the table of contents$/) do
  on(ArticlePage) do |page|
    page.toc_element.when_not_visible
    page.toc_element.should_not be_visible
  end
end

Then(/^I should see the table of contents$/) do
  on(ArticlePage).toc_element.when_present(10).should be_visible
end
