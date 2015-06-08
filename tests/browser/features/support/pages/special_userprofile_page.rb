class SpecialUserProfilePage < ArticlePage
  include PageObject

  page_url 'Special:UserProfile/<%= params[:user] %>'

  h2(:activity_heading, text: 'Recent activity')
  a(:contributions_link, href: /Special:Contributions\//)
  a(:uploads_link, href: /Special:Uploads\//)
  a(:talk_link, href: /User_talk:/)
  a(:user_page_link, href: /User:/)
  a(:user_page_link, href: /User:/)
  div(:last_edit, class: 'card', index: 0)
end
