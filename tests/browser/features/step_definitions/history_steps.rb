When(/^I open the latest diff$/) do
  # FIXME: replace this when we have a mobile history page in stable
  on(HistoryPage).compare_selected_revisions_button_element.click
end
