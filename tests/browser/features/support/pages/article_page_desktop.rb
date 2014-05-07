class DesktopArticlePage
  include PageObject

  include URL
  page_url URL.url("<%=params[:article_name]%>")

  # UI elements
  div(:p_cactions, id:"p-cactions")
  a(:protect, css: "#ca-protect a")
  a(:unprotect, css: '#ca-unprotect a')

  # protection page
  select(:protect_level, id:"mwProtect-level-edit")
  button(:protect_submit, id:"mw-Protect-submit")

  #footer
  a(:mobile_view, css:"#footer-places-mobileview a")
end
