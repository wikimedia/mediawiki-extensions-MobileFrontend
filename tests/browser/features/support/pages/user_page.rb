class UserPage < ArticlePage
  include PageObject

  page_url 'User:<%= params[:user] %>'

  h1(:heading, css: '#section_0')
  a(:talk_link, href: /User_talk:/)
  a(:contributions_link, href: /Special:Contributions\//)
  a(:uploads_link, href: /Special:Uploads\//)
end
