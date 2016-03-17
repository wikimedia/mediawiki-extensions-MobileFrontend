@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org @vagrant
Feature: Switch between mobile and desktop views

  Scenario: Switching from desktop view to mobile view
    Given I am on the "Main Page" page
    And I toggle the mobile view
    Then I should see the mobile view

  Scenario: Switching from mobile view to desktop view
    Given I am on the "Main Page" page
    And I toggle the mobile view
    And I toggle the desktop view
    Then I should see the desktop view

  Scenario: Bug: T129600
    Given I am on a page that transcludes content from a special page
    And I toggle the mobile view
    Then I should see the mobile view
