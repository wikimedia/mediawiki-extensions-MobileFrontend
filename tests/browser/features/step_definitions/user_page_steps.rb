Given(/^I visit my user page$/) do
  visit(UserPage, using_params: { user: user })
end

Then(/^I should be on my user page$/) do
  on(UserPage) do |page|
    page.wait_until do
      page.heading_element.when_present
    end
    expect(page.heading_element).to be_visible
  end
end

Then(/^there should be a link to create my user page$/) do
  expect(on(UserPage).cta_edit_link_element).to be_visible
end
