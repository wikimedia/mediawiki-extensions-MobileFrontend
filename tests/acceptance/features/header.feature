Feature: Header Validation

  Background:
    Given I am on the home page

  Scenario: Receive notification message - Edit Icon
    When I click the edit icon
    Then I receive edit icon message You must be logged in to edit pages on mobile.


  Scenario: Receive notification message - Upload Icon
    When I click on the upload icon
    Then I receive upload icon message You need to be logged in to add an image to this page.

  Scenario: Receive notification message - Watchlist Icon
    When I click on watchlist icon
    Then I receive watchlist icon message Please login or sign up to watch this page.