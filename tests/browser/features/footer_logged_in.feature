Feature: Feature: Footer links resolve - Logged In

  Background:
    Given I am logged into the mobile website
      And I am on the home page

    Scenario: View Edit history link resolves
      When I click on the view edit history link
      Then I go to the edit history page

    Scenario: Desktop link resolves
      When I click on the desktop link
      Then I go to the desktop wiki page

    Scenario:
      When I click on the Content license link
      Then I go to the Content license page

    Scenario:
      When I click on the Terms of Use link
      Then I go to the Terms of Use page

    Scenario:
      When I click on the Privacy link
      Then I go to the Privacy page