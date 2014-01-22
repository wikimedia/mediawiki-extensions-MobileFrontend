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

  text_field(:search_box_placeholder, name: "search", index: 0)
  text_field(:search_box2, name: "search", index: 1)
  li(:search_results, title: "Barack Obama")
  a(:search_result) do |page|
    page.search_results_element.element.a
  end
  div(:search_overlay, class: "search-overlay")
  button(:search_overlay_close_button) do |page|
    page.search_overlay_element.button_element(class: "cancel")
  end

  a(:notifications_button, id: "secondary-button", class: "user-button")
  div(:notifications_overlay, class: "notifications-overlay")
  button(:notifications_overlay_close_button) do |page|
    page.notifications_overlay_element.button_element(class: "cancel")
  end

  span(:external_links_section, id:"External_links")
  span(:pres_campaign_section, id:"Presidential_campaigns")
  a(:ext_whitehouse_link, href: "http://www.whitehouse.gov/administration/president_obama/")
  a(:image_link, class:"image")

  # page-actions
  ul(:page_actions, id:"page-actions")

  # editor
  textarea(:editor_text_area, class:"wikitext-editor")
  button(:continue_button, class:"continue icon")
  button(:submit_button, class:"submit icon")

  # drawer
  div(:keep_going, class:'overlay-bottom')
end
