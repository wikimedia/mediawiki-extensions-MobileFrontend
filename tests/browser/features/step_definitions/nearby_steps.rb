Given(/^I give permission for the page to access my location$/) do
  unless ENV['NEARBY_FIREFOX']
    puts "NEARBY_FIREFOX environment variable is not defined. This test won't work without it!"
  end
end

When(/^I click a nearby result$/) do
  on(ArticlePage).page_list_element.when_present(20).link_element(class: 'title').click
end

Then(/^I should see at least one result in the nearby items list$/) do
  on(ArticlePage) do |page|
    expect(page.page_list_element.when_present(20)).to be_visible
    expect(page.page_list_element.link_element(class: 'title')).to be_visible
  end
end

Then(/^I should see the page preview overlay$/) do
  expect(on(ArticlePage).overlay_element.when_present(20).div_element(class: 'content')).to be_visible
end
