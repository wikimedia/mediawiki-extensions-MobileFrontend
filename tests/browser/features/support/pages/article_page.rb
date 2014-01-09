class ArticlePage
  include PageObject

  include URL
  page_url URL.url("<%=params[:article_name]%>")

  a(:edit_button, text: "Edit")
  div(:editor_overlay, class: "editor-overlay")
  button(:editor_overlay_close_button) do |page|
    page.editor_overlay_element.button_element(class: "cancel")
  end

  li(:upload_button, id: "ca-upload")
  file_field(:select_file, name: 'file', type: 'file')
  div(:photo_overlay, class: "photo-overlay")
  button(:photo_overlay_close_button) do |page|
    page.photo_overlay_element.button_element(class: "cancel")
  end
  text_area(:photo_description) do |page|
    page.photo_overlay_element.text_area_element(name: "description")
  end
  a(:tutorial_link) do |page|
    page.upload_button_element.link_element(href: '#/upload-tutorial/article')
  end

  span(:external_links_section, id:"External_links")
  span(:pres_campaign_section, id:"Presidential_campaigns")
  a(:ext_whitehouse_link, href: "http://www.whitehouse.gov/administration/president_obama/")
  a(:springfield_image, href: "/wiki/File:Flickr_Obama_Springfield_01.jpg")

end
