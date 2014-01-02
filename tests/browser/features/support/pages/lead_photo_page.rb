class LeadPhotoPage
  include PageObject
  include URL
  page_url URL.url("This page needs a lead photo")

  # upload buttons
  li(:upload_button, id: "ca-upload")
  a(:tutorial_link) do |page|
    page.upload_button_element.link_element(href: '#/upload-tutorial/article')
  end
  file_field(:select_file, name: 'file', type: 'file')

  #old upload overlay
  div(:old_upload_overlay, class:"mw-mf-overlay")

  # upload overlay
  div(:upload_overlay, class:"overlay photo-overlay")
  text_area(:description_textarea, name: "description")
end

