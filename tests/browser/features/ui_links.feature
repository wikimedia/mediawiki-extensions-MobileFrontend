@chrome @en.m.wikipedia.beta.wmflabs.org @firefox
Feature: Check UI components

  Background:
    Given I am using the mobile site

  @smoke @integration
  Scenario: Check existence of important UI components on the main page
    Given I am on the "Main Page" page
    Then I should see the history link

  @smoke @integration
  Scenario: Check existence of important UI components on other pages.
    Given the wiki has a terms of use
      And the page "Selenium UI test" exists
      And I am on the "Selenium UI test" page
    Then I should see the link to the user page of the last editor
      And I should see the last modified bar history link
      And I should see the switch to desktop link
      And I should see the license link
      And I should see a link to the terms of use
      And I should see a link to the privacy page
