@chrome @en.m.wikipedia.beta.wmflabs.org @firefox
Feature: Check UI components

  Background:
    Given I am using the mobile site

  Scenario: Check existence of important UI components on the main page
    Given the wiki has a terms of use
      And I am on the "Main Page" page
    Then I see the history link
      And I see the switch to desktop link
      And I see the license link
      And I see a link to the terms of use
      And I see a link to the privacy page

  Scenario: Check existence of important UI components on other pages.
    Given the page "Selenium UI test" exists
      And I am on the "Selenium UI test" page
    Then I see the last modified bar history link
      And I see the switch to desktop link
      And I see the license link
      And I see a link to the terms of use
      And I see a link to the privacy page
