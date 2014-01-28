@en.m.wikipedia.beta.wmflabs.org @test2.m.wikipedia.org
Feature: Create failure messages
  Scenario: Can refresh captcha
    Given that I am on the User login page
      And I click Create Account
    Then I see the refresh captcha icon

  Scenario: Create account password mismatch message
    Given that I am on the User login page
      And I click Create Account
      And I type thisisuser into Username field
      And I type thisisgoodpassword into Password field
      And I type thisisbadpassword into Confirm password field
    When I click Sign up
    Then I should see the message Whoops
      And I should see the message The passwords you entered do not match

  Scenario: Create account mistype captcha message
    Given that I am on the User login page
      And I click Create Account
      And I type thisisuser into Username field
      And I type thisisgoodpassword into Password field
      And I type thisisgoodpassword into Confirm password field
      And I type abcdefghijklmnop into Enter confirmation code field
    When I click Sign up
    Then I should see the message Whoops
      And I should see the message Incorrect or missing CAPTCHA
