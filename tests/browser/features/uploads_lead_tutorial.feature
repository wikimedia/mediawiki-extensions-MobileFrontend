@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Lead image tutorial

  Background:
    Given I am logged in as a new user
      And I am on the "Nonexistent_page_abc" page

  Scenario: There is an upload button
    Then there is an upload an image to this page button
      And the upload an image to this page button is enabled

  Scenario: See tutorial as new user
    Then the upload button in page actions links to the tutorial
