Given(/^I am on a page that transcludes content from a special page$/) do
  api.create_page 'T129600', '{{Special:PrefixIndex/User:Admin/}}'

  step 'I am on the "T129600" page'
end
