Given(/^I give permission for the page to access my location$/) do
  if !ENV["NEARBY_FIREFOX"]
    puts "NEARBY_FIREFOX environment variable is not defined. This test won't work without it!"
  end
end

Then(/^I should see at least one result in the nearby items list$/) do
  on(ArticlePage) do |page|
    page.page_list_element.when_present(20).should be_visible
    page.page_list_element.link_element(class: "title").should be_visible
  end
end

When(/^I click a nearby result$/) do
  on(ArticlePage).page_list_element.when_present(20).link_element(class: "title").click
end

Then(/^I see the page preview overlay$/) do
  on(ArticlePage).overlay_element.when_present(20).div_element(class: "content").should be_visible
end
