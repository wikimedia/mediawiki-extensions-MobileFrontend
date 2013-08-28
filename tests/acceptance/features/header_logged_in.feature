Feature: Header Validation - Logged In

  Background:
    Given I am logged into the mobile website
      And I am on the home page


  Scenario: Edit mode
    When I click the enabled edit icon
    Then I can click Cancel


  Scenario: Uploading Image
    When I click on the upload icon
    Then I receive the locked upload message No image is needed on this page.

  Scenario: Watchlist icon from article page
    When I click on watchlist icon
    Then I receive notification that the article has been added to the watchlist

