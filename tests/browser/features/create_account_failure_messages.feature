@chrome @en.m.wikipedia.beta.wmflabs.org @firefox @test2.m.wikipedia.org
Feature: Create failure messages
  Scenario: Can refresh captcha
    Given I am on the "Special:Userlogin" page
      And I click Create Account
    Then I see the refresh captcha icon

  Scenario: Create account password mismatch message
    Given I am on the "Special:Userlogin" page
      And I click Create Account
      And I type "thisisuser" into Username field
      And I type "thisisgoodpassword" into Password field
      And I type "thisisbadpassword" into Confirm password field
    When I click Sign up
    Then I should see the error box message "Whoops"
      And I should see the error box message "The passwords you entered do not match"

  Scenario: Create account mistype captcha message
    Given I am on the "Special:Userlogin" page
      And I click Create Account
      And I type "thisisuser" into Username field
      And I type "thisisgoodpassword" into Password field
      And I type "thisisgoodpassword" into Confirm password field
      And I type "abcdefghijklmnop" into Enter confirmation code field
    When I click Sign up
    Then I should see the error box message "Whoops"
      And I should see the error box message "Incorrect or missing CAPTCHA"
