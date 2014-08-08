Then('I should see the error "$message"') do |message|
  expect(on(ArticlePage).error_message).to match(message)
end
