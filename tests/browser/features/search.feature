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
    Then Search results should contain "Selenium search test"
