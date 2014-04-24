# FIXME: Get this working on Chrome (bug 64397)
@en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Image uploads copyvio notice

  Background:
    Given I am in beta mode
      And I am logged in as a user with a > 0 edit count
      And I am on the "Nonexistent_page_abc" page
      And I click on the lead photo upload button

  Scenario: Opening upload preview and confirming (image without EXIF)
    When upload file image.png
      And I say OK in the confirm dialog
    Then I see the upload preview

  Scenario: Opening upload preview and cancelling (image without EXIF)
    When upload file image.png
      And I say Cancel in the confirm dialog
    Then I don't see the upload preview

  Scenario: Opening upload preview (image with EXIF)
    When I upload file "exif.jpg"
    Then I see the upload preview
