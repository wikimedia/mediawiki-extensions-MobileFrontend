# FIXME: Get this working on Chrome (bug 64397)
@firefox @login @vagrant
Feature: Image uploads copyvio notice

  Background:
    Given I am using the mobile site
      And I am logged in as a user with a > 0 edit count
      And I am on the "Nonexistent_page_abc" page
      And I click on the lead photo upload button

  Scenario: Opening upload preview and confirming (image without EXIF)
    When upload file image.png
      And I say OK in the confirm dialog
    Then I should see the upload preview

  Scenario: Opening upload preview and cancelling (image without EXIF)
    When upload file image.png
      And I say Cancel in the confirm dialog
    Then I should not see the upload preview

  Scenario: Opening upload preview (image with EXIF)
    When I upload file "exif.jpg"
    Then I should see the upload preview
