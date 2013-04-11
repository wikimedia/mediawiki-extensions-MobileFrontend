class LoginPage
  include PageObject

  def self.url
    if ENV['MEDIAWIKI_URL']
      mediawiki_url = ENV['MEDIAWIKI_URL']
    else
      mediawiki_url = 'http://127.0.0.1:80/wiki/'
    end
    "#{mediawiki_url}Special:UserLogin"
  end
  page_url url

  div(:feedback, class: 'errorbox')
  button(:login, id: 'wpLoginAttempt')
  text_field(:password, id: 'wpPassword1')
  a(:phishing, text: 'phishing')
  a(:password_strength, text: 'password strength')
  text_field(:username, id: 'wpName1')
  a(:login_wl, class: 'button')

  def logged_in_as_element
    @browser.div(id: 'mw-content-text').p.b
  end
  def login_with(username, password)
    self.username = username
    self.password = password
    login
  end
end


