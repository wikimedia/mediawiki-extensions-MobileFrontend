When(/^I click on the history link in the last modified bar$/) do
  on(ArticlePage).last_modified_bar_history_link_element.when_present.click
  expect(on(SpecialHistoryPage).side_list_element.when_present(10)).to be_visible
end

Then(/^the text of the first heading should be "(.*)"$/) do |title|
  on(ArticlePage) do |page|
    page.wait_until do
      page.first_heading_element.when_present.text.include? title
    end
    expect(page.first_heading_element.when_present.text).to match title
  end
end
