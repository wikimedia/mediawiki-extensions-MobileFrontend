Given /^I am logged in as a new user$/ do
  log_in
end

Given(/^I am logged in as a user with a > (\d+) edit count$/) do |count|
  api.meta(:userinfo, uiprop: 'editcount').data['editcount'].upto(count.to_i) do |n|
    api.create_page("Ensure #{user} edit count - #{n + 1}", 'foo')
  end
  log_in
end

Given(/^I am logged into the mobile website$/) do
  step 'I am using the mobile site'
  log_in
  # avoids login failing (see https://phabricator.wikimedia.org/T109593)
  expect(on(ArticlePage).is_authenticated_element.when_present(20)).to exist
end

Given(/^I am on the "(.+)" page$/) do |article|
  # Ensure we do not cause a redirect
  article = article.gsub(/ /, '_')
  visit(ArticlePage, using_params: { article_name: article })
end

Given(/^I am using the mobile site$/) do
  visit(MainPage) do |page|
    page_uri = URI.parse(page.page_url_value)

    domain = page_uri.host == 'localhost' ? nil : page_uri.host
    browser.cookies.add 'mf_useformat', 'true', domain: domain

    page.refresh
  end
end

Given(/^my browser doesn't support JavaScript$/) do
  browser_factory.override(browser_user_agent: 'Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (S60; SymbOS; Opera Mobi/23.348; U; en) Presto/2.5.25 Version/10.54')
end
