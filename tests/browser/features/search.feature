@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org
Feature: Search

  Background:
    Given the page "Selenium search test" exists
      And I am on the "Main Page" page
    When I click the placeholder search box

  Scenario: Opening search
    Then I see the search overlay

  Scenario: Closing search (overlay button)
    When I click the search overlay close button
    Then I don't see the search overlay

  Scenario: Closing search (browser button)
    When I click the browser back button
    Then I don't see the search overlay

  Scenario: Search for partial text
    When I type into search box "Selenium search tes"
    Then search results should contain "Selenium search test"

  Scenario: Search with search in pages button
    When I see the search overlay
      And I type into search box "Test is used by Selenium web driver"
      And I click the search in pages button
    Then I see a list of search results

  Scenario: Search with enter key
    When I see the search overlay
      And I type into search box "Test is used by Selenium web driver"
      And I press the enter key
    Then I see a list of search results
