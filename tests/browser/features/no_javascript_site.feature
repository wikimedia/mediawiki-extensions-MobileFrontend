@custom-browser @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org
Feature: Basic site for legacy devices

  Background:
    Given I am viewing the basic non-JavaScript site
      And I am on the "Main Page" page

  # FIXME: Add scenario to check search actually works
  # FIXME: Add scenario to check watch star actually works
  Scenario: Able to search in basic non-JavaScript site
    When I click on "Random" in the main navigation menu
    Then I see the watch star
      And I see the search button
      # FIXME: Check that the edit button is invisible
      # FIXME: Check that the upload button is invisible

  Scenario: Able to access left navigation in basic non-JavaScript site
    When I click on "Random" in the main navigation menu
      And I click on the main navigation button
    Then I see a link to "Home" in the main navigation menu
      And I see a link to "Random" in the main navigation menu
      And I see a link to "Settings" in the main navigation menu
      And I see a link to "Watchlist" in the main navigation menu
      And I see a link to "Log in" in the main navigation menu
      And I do not see a link to "Uploads" in the main navigation menu
      And I do not see a link to "Nearby" in the main navigation menu

  Scenario: Search with JavaScript disabled
    Given the page "Selenium search test" exists
    When I type into search box "Test is used by Selenium web driver"
      And I click the search button
    Then I see a list of search results
