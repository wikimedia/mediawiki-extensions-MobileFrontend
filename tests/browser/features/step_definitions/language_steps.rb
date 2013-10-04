When /^I click the language button$/ do
  on(HomePage).language_button_element.when_present.click
end

Then /^I move to the language screen$/ do
  on(LanguagePage)  do |page|
  page.number_languages_element.element.should exist
  page.search_box_placeholder_element.element.when_present.set 'Esp'
  page.language_search_results_element.element.should exist
  end
end
