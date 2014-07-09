@chrome @en.m.wikipedia.beta.wmflabs.org @firefox
Feature: Loading pages

  Background:
    Given the page "Selenium page loading test" exists

  Scenario: Page loads without ajax in stable
    Given I am logged into the mobile website
      And I click the placeholder search box
      And I type into search box "Selenium page loading test"
    When I click a search result
    Then the edit button is enabled
      And the text of the first heading is "Selenium page loading test"
