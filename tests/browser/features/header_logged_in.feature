Feature: Header Validation - Logged In

  Background:
    Given I am logged into the mobile website
      And I am on the home page

  Scenario: Edit mode
    Then I should see the edit icon

  Scenario: Uploading Image
    When I click on the upload icon
    Then I receive an upload error message

  Scenario: Watchlist icon from article page
    When I click on watchlist icon
    Then I receive notification that the article has been added to the watchlist

