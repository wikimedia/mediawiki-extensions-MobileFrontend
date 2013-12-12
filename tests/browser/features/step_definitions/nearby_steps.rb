Given(/^I am on the nearby page$/) do
  visit(NearbyPage)
end

Then(/^I should see at least one result in the nearby items list$/) do
  on(NearbyPage) do |page|
    page.wait_until(15) do
      sleep 1  # This is ugly, but test fails without it.
      page.a_nearby_list_item_element.should exist
    end
    page.nearby_items_list_element.should be_visible
  end
end