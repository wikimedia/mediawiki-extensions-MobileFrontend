class SpecialUserProfilePage < ArticlePage
  include URL
  include PageObject
  page_url URL.url("Special:UserProfile/" + ENV["MEDIAWIKI_USER"])
  h2(:activity_heading, text:"Recent activity")
end
