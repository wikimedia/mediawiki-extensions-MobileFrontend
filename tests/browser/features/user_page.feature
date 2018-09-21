@chrome @firefox @login @test2.m.wikipedia.org @vagrant @integration @login
Feature:  User:<username>

  Scenario: Check user page is editable
    And I should be on my user page
    Then there should be a link to create my user page
