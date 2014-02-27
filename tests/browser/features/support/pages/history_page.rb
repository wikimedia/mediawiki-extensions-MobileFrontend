# FIXME: this is the desktop history page until we have a mobile one in stable
class HistoryPage
  include PageObject

  button(:compare_selected_revisions_button, class: "mw-history-compareselectedversions-button")
end
