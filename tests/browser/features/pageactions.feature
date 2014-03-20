@chrome @en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @firefox @test2.m.wikipedia.org
Feature: Page actions menu when anonymous

  Background:
    Given I am on the "Main Page" page
       And I click on "Random" in the main navigation menu

  Scenario: Receive notification message - Edit Icon
    When I click the edit icon holder
    Then I see drawer with message "Help improve this page!"

  Scenario: Receive notification message - Upload Icon
    When I click on the upload icon
    Then I see a toast with message "Please log in to add an image to this page."

  Scenario: Receive notification message - Watchlist Icon
    When I click on watchlist icon
    Then I see drawer with message "Keep track of this page and all changes to it."
