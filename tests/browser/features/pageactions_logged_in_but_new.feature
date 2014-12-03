@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @login @test2.m.wikipedia.org
Feature: Page actions menu when logged in as a new user

  Background:
    Given I am using the mobile site
      And I am logged in as a new user
      And I am at a random page

  Scenario: I can not see the upload button
    Then I should not see an upload an image to this page button
