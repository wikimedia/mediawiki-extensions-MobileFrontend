@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org @vagrant
Feature: Issues

  Background:
    Given I am using the mobile site
      And I am on a page which has cleanup templates

  Scenario: I see the this page has issues stamp
    Then I should see that this page has issues

  Scenario: Clicking page issues opens overlay
    Given I should see that this page has issues
    When I click the page issues stamp
    Then I see the issues overlay

  Scenario: Closing page issues
    Given I should see that this page has issues
      And I click the page issues stamp
      And I see the issues overlay
    When I click the overlay issue close button
    Then I don't see the issues overlay

  Scenario: Closing page issues (browser back)
    Given I should see that this page has issues
      And I click the page issues stamp
      And I see the issues overlay
    When I click the browser back button
    Then I don't see the issues overlay
