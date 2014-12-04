@firefox @login @vagrant
Feature: Lead image uploads

  Background:
    Given I am using the mobile site
      And I am logged in as a user with a > 0 edit count
      And I am on the "Nonexistent_page_abc" page
      And I click on the lead photo upload button
      And I upload file "exif.jpg"

  Scenario: Opening upload preview
    Then I should see the upload preview
      And I should be able to enter a description for my file upload

  Scenario: Closing upload preview (overlay button)
    When I click the upload preview overlay close button
      And I say OK in the confirm dialog
    Then I should not see the upload preview

  Scenario: Closing upload preview (browser button)
    When I click the browser back button
      And I say OK in the confirm dialog
    Then I should not see the upload preview
