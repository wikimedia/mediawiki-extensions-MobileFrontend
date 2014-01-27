@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @test2.m.wikipedia.org
Feature: Header Validation

  Background:
    Given I go to random page

  Scenario: Receive notification message - Edit Icon
    When I click the edit icon
    Then I receive edit icon message Help improve this page!

  Scenario: Receive notification message - Upload Icon
    When I click on the upload icon
    Then I receive upload icon message Please log in to add an image to this page.

  Scenario: Receive notification message - Watchlist Icon
    When I click on watchlist icon
    Then I receive watchlist icon message Keep track of this page and all changes to it.
