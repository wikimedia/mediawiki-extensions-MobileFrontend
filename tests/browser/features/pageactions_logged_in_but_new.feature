@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Page actions menu when logged in as a new user

  Background:
    Given I am logged in as a new user
      And I am on the "Main Page" page

  Scenario: I can not see the upload button
    Then there is not an upload an image to this page button
