class UserPage < ArticlePage
  include PageObject

  page_url 'User:<%= params[:user] %>'

  h1(:heading, css: '#section_0')
  ul(:user_links, css: '.user-links')
  div(:cta_holder, css: '.cta-holder')
  a(:talk_link) do |page|
    page.user_links_element.element.a(href: /User_talk:/)
  end
  a(:contributions_link) do |page|
    page.user_links_element.element.a(href: /Special:Contributions\//)
  end
  a(:uploads_link) do |page|
    page.user_links_element.element.a(href: /Special:Uploads\//)
  end
  a(:edit_link) do |page|
    page.cta_holder_element.element.a(href: %r{#/editor/0})
  end
end
