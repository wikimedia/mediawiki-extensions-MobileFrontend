class SpecialUserProfilePage < ArticlePage
  include URL
  include PageObject
  page_url URL.url("Special:UserProfile/#{ENV['MEDIAWIKI_USER']}")
  h2(:activity_heading, text: 'Recent activity')
  a(:contributions_link, href: /Special:Contributions\//)
  a(:uploads_link, href: /Special:Uploads\//)
  a(:talk_link, href: /User_talk:/)
  a(:user_page_link, href: /User:/)
  a(:user_page_link, href: /User:/)
  div(:last_edit, class: 'card', index: 0)
end
