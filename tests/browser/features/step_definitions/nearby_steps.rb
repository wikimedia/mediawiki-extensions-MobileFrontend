When(/^I navigate to the nearby page$/) do
  if !ENV["NEARBY_FIREFOX"]
    puts "NEARBY_FIREFOX environment variable is not defined. This test won't work without it!"
  end
  visit(NearbyPage)
end

Then(/^I should see at least one result in the nearby items list$/) do
  on(NearbyPage) do |page|
    page.a_nearby_list_item_element.when_present(20).should be_visible
    page.nearby_items_list_element.should be_visible
  end
end
