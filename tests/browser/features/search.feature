@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org @vagrant
Feature: Search

  Background:
    Given I am using the mobile site
      And I am on the "Main Page" page
      And the page "Selenium search test" exists
    When I click the placeholder search box

  Scenario: Closing search (overlay button)
    When I click the search overlay close button
    Then I should not see the search overlay

  Scenario: Closing search (browser button)
    When I click the browser back button
    Then I should not see the search overlay

  @smoke
  Scenario: Search for partial text
    When I type into search box "Selenium search tes"
    Then search results should contain "Selenium search test"

  Scenario: Search with search in pages button
      And I see the search overlay
      And I type into search box "Test is used by Selenium web driver"
      And I click the search in pages button
    Then I should see a list of search results

  Scenario: Search with enter key
      And I see the search overlay
      And I type into search box "Test is used by Selenium web driver"
      And I press the enter key
    Then I should see a list of search results
