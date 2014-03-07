@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @test2.m.wikipedia.org
Feature: Menus open correct page for anonymous users

  Background:
    Given I am on the "Main Page" page

  Scenario: Check disclaimer link in menu
    When I click on the main navigation button
    Then I see a link to the disclaimer
      And I see a link to the about page

  Scenario: Home URL is set correctly
    When I click on "Home" in the main navigation menu
    Then The URL of the page should contain "Main_Page"

  Scenario: Random URL is set correctly
    When I click on "Random" in the main navigation menu
    Then The URL of the page should contain "campaign=random"

  Scenario: Nearby URL is set correctly
    When I click on "Nearby" in the main navigation menu
    Then The URL of the page should contain "Special:Nearby"

  Scenario: Watchlist URL is set correctly
    When I click on "Watchlist" in the main navigation menu
    Then The URL of the page should contain "returnto=Special%3AWatchlist"
        And I see the log in prompt message "A watchlist helps you bookmark pages and keep track of changes to them."
        And I see the log in prompt message "Log in to see it."

  Scenario: Uploads URL is set correctly
    When I click on "Uploads" in the main navigation menu
    Then The URL of the page should contain "returnto=Special%3AUploads"
      And I see the log in prompt message "Media on Wikipedia is donated by people like you"
      And I see the log in prompt message "Log in to share your media"

  Scenario: Settings URL is set correctly
    When I click on "Settings" in the main navigation menu
    Then The URL of the page should contain "Special:MobileOptions"

  Scenario: Log In URL is set correctly
    When I click on "Log in" in the main navigation menu
    Then The URL of the page should contain "Special:UserLogin"
