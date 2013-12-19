Given /^I am on the (.+) article$/ do |article|
  begin
    # put the page into the Varnish cache, avoid 503 errors
    visit(ArticlePage, :using_params => {:article_name => article})
  rescue
  end
  visit(ArticlePage, :using_params => {:article_name => article})
end

When /^I expand External Links Section$/ do
  on(ArticlePage).external_links_section_element.when_present.click
end

When /^I click on the White House official website link$/ do
  on(ArticlePage).ext_whitehouse_link_element.when_present.click
end

Then /^I receive White House official website page$/ do
  @browser.url.should match Regexp.escape("whitehouse.gov")
end
