@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org
Feature: Menus open correct page for anonymous users

  Background:
    Given I am on the "Main Page" page
      And  I am logged into the mobile website

  Scenario: Check links in menu
    When I click on the main navigation button
    Then I see a link to the disclaimer
      And I see a link to "Log out" in the main navigation menu
      And I see a link to my user profile page in the main navigation menu
      And I see a link to the about page
      And I see a link to "Home" in the main navigation menu
      And I see a link to "Random" in the main navigation menu
      And I see a link to "Settings" in the main navigation menu
      And I see a link to "Watchlist" in the main navigation menu
      And I see a link to "Uploads" in the main navigation menu
      And I see a link to "Nearby" in the main navigation menu
