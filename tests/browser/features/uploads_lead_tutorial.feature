@en.m.wikipedia.beta.wmflabs.org @test2.m.wikipedia.org @login
Feature: Lead image tutorial

  Background:
    Given I am logged in as a new user
    When I go to a nonexistent page

  Scenario: There is an upload button
    Then There is an upload an image to this page button
      And The upload an image to this page button is enabled

  Scenario: See tutorial as new user
    Then The upload button in page actions links to the tutorial
