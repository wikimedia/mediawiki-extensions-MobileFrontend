Then(/^I see "(.*?)" as added content$/) do |text|
  on(DiffPage).inserted_content_element.text.should eq text
end

Then(/^I see "(.*?)" as removed content$/) do |text|
  on(DiffPage).deleted_content_element.text.should eq text
end
