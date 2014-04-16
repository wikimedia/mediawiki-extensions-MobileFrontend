@chrome @en.m.wikipedia.beta.wmflabs.org @firefox
Feature: Check UI components

  Scenario: Check existence of important UI components on the main page
    Given I am on the "Main Page" page
      And The wiki has a terms of use
    Then I see the history link
      And I see the switch to desktop link
      And I see the license link
      And I see a link to the terms of use
      And I see a link to the privacy page

  Scenario: Check existence of important UI components on other pages.
    Given I am on the "Barack Obama" page
    Then I see the history link
      And I see the switch to desktop link
      And I see the license link
      And I see a link to the terms of use
      And I see a link to the privacy page
