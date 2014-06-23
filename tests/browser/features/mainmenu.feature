@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org
Feature: Menus open correct page for anonymous users

  Background:
    Given I am on the "Main Page" page

  Scenario: Check links in menu
    When I click on the main navigation button
    Then I see a link to the disclaimer
      And I see a link to the about page
      And I see a link to "Home" in the main navigation menu
      And I see a link to "Random" in the main navigation menu
      And I see a link to "Settings" in the main navigation menu
      And I see a link to "Watchlist" in the main navigation menu
      And I see a link to "Log in" in the main navigation menu
      And I see a link to "Uploads" in the main navigation menu
      And I see a link to "Nearby" in the main navigation menu

  Scenario: Watchlist URL is set correctly
    When I click on "Watchlist" in the main navigation menu
    Then I see the log in prompt message "A watchlist helps you bookmark pages and keep track of changes to them."
      And I see the log in prompt message "Log in to see it."

  Scenario: Uploads URL is set correctly
    When I click on "Uploads" in the main navigation menu
    Then I see the log in prompt message "Media on Wikipedia is donated by people like you"
      And I see the log in prompt message "Log in to share your media"
