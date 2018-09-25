Then(/^I should be on my user page$/) do
  on(UserPage) do |page|
    page.wait_until do
      page.heading_element.when_present
    end
    expect(page.heading_element).to be_visible
  end
end
