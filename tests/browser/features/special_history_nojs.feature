@custom-browser @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org
Feature: Basic history page for legacy devices

  Background:
    Given my browser doesn't support JavaScript
      And I am using the mobile site
      And the page "Selenium diff test" exists and has at least "51" edits
      And I am on the "Selenium diff test" page
    When I click on the history link in the last modified bar

  @smoke
  Scenario: Check more button exists
    Then I should see a more button
