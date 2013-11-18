@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @login @test2.m.wikipedia.org
Feature: Notification

  Background:
    Given I am logged into the mobile website

    Scenario: Notification Validation
      When I click on the notification icon
      Then I go to the notifications page

    Scenario: Notification Overlay Validation
      Given I am in beta mode
      When I click on the notification icon
      Then the notifications overlay appears
