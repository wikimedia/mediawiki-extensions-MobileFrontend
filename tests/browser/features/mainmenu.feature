@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org @vagrant
Feature: Menus open correct page for anonymous users

  Background:
    Given I am using the mobile site
      And I am on the "Main Page" page

  @smoke
  Scenario: Check links in menu
    When I click on the main navigation button
    Then I should see a link to the disclaimer
      And I should see a link to the about page
      And I should see a link to "Home" in the main navigation menu
      And I should see a link to "Random" in the main navigation menu
      And I should see a link to "Settings" in the main navigation menu
      And I should see a link to "Watchlist" in the main navigation menu
      And I should see a link to "Log in" in the main navigation menu

  @extension-geodata
  Scenario: Nearby link in menu
    Given at least one article with geodata exists
    When I click on the main navigation button
    Then I should see a link to "Nearby" in the main navigation menu

  Scenario: Watchlist URL is set correctly
    When I click on "Watchlist" in the main navigation menu
    Then I should see the log in prompt message "A watchlist helps you bookmark pages and keep track of changes to them."
      And I should see the log in prompt message "Log in to see it."
