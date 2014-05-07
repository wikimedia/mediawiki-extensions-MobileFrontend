Given(/^I click the protect link on the desktop skin$/) do
  on(DesktopArticlePage).p_cactions_element.when_present.hover
  on(DesktopArticlePage).protect_element.click
end

Given(/^I select Allow only administrators on the protection page$/) do
  on(DesktopArticlePage).protect_level_element.select_value('sysop')
end

Given(/^I click the submit button on the protection page$/) do
  on(DesktopArticlePage).protect_submit_element.click
end

Given(/^I switch to the mobile site$/) do
  on(DesktopArticlePage).mobile_view_element.click
end
