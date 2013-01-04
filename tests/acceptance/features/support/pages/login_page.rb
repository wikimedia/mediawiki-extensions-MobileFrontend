class LoginPage
  include PageObject

  page_url '<%=params[:base_url]%>Special:UserLogin'

  div(:feedback, class: 'errorbox')
  button(:login, id: 'wpLoginAttempt')
  text_field(:password, id: 'wpPassword1')
  a(:phishing, text: 'phishing')
  a(:password_strength, text: 'password strength')
  text_field(:username, id: 'wpName1')

  def logged_in_as_element
    @browser.div(id: 'mw-content-text').p.b
  end
  def login_with(username, password)
    self.username = username
    self.password = password
    login
  end
end


