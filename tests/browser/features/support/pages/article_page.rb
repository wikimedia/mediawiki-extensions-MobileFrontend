class ArticlePage
  include PageObject

  include URL
  page_url URL.url("<%=params[:article_name]%>")

  span(:external_links_section, id:"External_links")
  span(:pres_campaign_section, id:"Presidential_campaigns")
  a(:ext_whitehouse_link, href: "http://www.whitehouse.gov/administration/president_obama/")
  a(:springfield_image, href: "/wiki/File:Flickr_Obama_Springfield_01.jpg")

end
