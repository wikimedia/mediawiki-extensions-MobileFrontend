class CreateArticlePage
  include PageObject

  include URL
  page_url URL.url('<%=params[:article_name]%>')

  a(:doesnotexist_msg, text: 'Look for pages within Wikipedia that link to this title')
end
