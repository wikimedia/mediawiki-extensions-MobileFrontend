@en.m.wikipedia.beta.wmflabs.org @en.m.wikipedia.org @login @test2.m.wikipedia.org
Feature: Notification

  Background:
    Given I am logged into the mobile website
    When I click on the notification icon

  Scenario: Opening notifications
    Then I see the notifications overlay

  Scenario: Closing notifications (overlay button)
    When I click the notifications overlay close button
    Then I don't see the notifications overlay

  Scenario: Closing notifications (browser button)
    When I click the browser back button
    Then I don't see the notifications overlay
