# Template

## Setup

- Jenkins > Templates > New Template > (name) > Job Template > OK > Save
- Display Name: (name)
- Description: (description)
- Instantiable?: check
- Attribute

## Name

- ID: name
  - Display Name: Name
  - Type: Text-field

## Browser Label

- ID: BROWSER_LABEL
  - Display Name: Browser Label
  - Type: Select a string among many
  - UI Mode: Dropdown list (no inline help, but more compact UI)
  - Options
    - Display Name: (name)
    - Value: (name)
      - android
      - ipad
      - iphone

## bundle exec

  - ID: BUNDLE_EXEC
    - Display Name: bundle exec
    - Type: Text-field

## Recipients

- ID: RECIPIENTS
  - Display Name: Recipients
  - Type: Text-field

## Repository URL

- ID: REPOSITORY_URL
  - Display Name: Repository URL
  - Type: Select a string among many
  - UI Mode: Dropdown list (no inline help, but more compact UI)
  - Options

    - Display Name: MobileFrontend@gerrit
    - Value: ssh://Zfilipin@gerrit.wikimedia.org:29418/mediawiki/extensions/MobileFrontend

    - Display Name: MobileFrontend@cloudbees
    - Value: ssh://git@git.cloudbees.com/wmf/MobileFrontend.git

## Branch

- ID: BRANCH
  - Display Name: Branch
  - Type: Select a string among many
  - UI Mode: Dropdown list (no inline help, but more compact UI)
  - Options
    - Display Name: (name)
    - Value: (name)

    - name:
      - master
      - debug

## Jelly-based transformation

- Property
  - Transformer: Jelly-based transformation
  - Script, from (site)/job/(job)/config.xml

--

    <?xml version='1.0' encoding='UTF-8'?>
    <project>
      <actions/>
      <description></description>
      <logRotator>
        <daysToKeep>60</daysToKeep>
        <numToKeep>-1</numToKeep>
        <artifactDaysToKeep>-1</artifactDaysToKeep>
        <artifactNumToKeep>20</artifactNumToKeep>
      </logRotator>
      <keepDependencies>false</keepDependencies>
      <properties>
        <nectar.plugins.rbac.groups.JobProxyGroupContainer>
          <groups/>
        </nectar.plugins.rbac.groups.JobProxyGroupContainer>
        <com.cloudbees.jenkins.plugins.PublicKey/>
        <com.cloudbees.plugins.deployer.DeployNowJobProperty>
          <oneClickDeploy>false</oneClickDeploy>
          <configuration>
            <user>(jenkins)</user>
            <account>wmf</account>
            <deployables/>
          </configuration>
        </com.cloudbees.plugins.deployer.DeployNowJobProperty>
      </properties>
      <scm class="hudson.plugins.git.GitSCM">
        <configVersion>2</configVersion>
        <userRemoteConfigs>
          <hudson.plugins.git.UserRemoteConfig>
            <name></name>
            <refspec></refspec>
            <url>${REPOSITORY_URL}</url>
          </hudson.plugins.git.UserRemoteConfig>
        </userRemoteConfigs>
        <branches>
          <hudson.plugins.git.BranchSpec>
            <name>${BRANCH}</name>
          </hudson.plugins.git.BranchSpec>
        </branches>
        <disableSubmodules>false</disableSubmodules>
        <recursiveSubmodules>false</recursiveSubmodules>
        <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
        <authorOrCommitter>false</authorOrCommitter>
        <clean>false</clean>
        <wipeOutWorkspace>false</wipeOutWorkspace>
        <pruneBranches>false</pruneBranches>
        <remotePoll>false</remotePoll>
        <ignoreNotifyCommit>false</ignoreNotifyCommit>
        <useShallowClone>false</useShallowClone>
        <buildChooser class="hudson.plugins.git.util.DefaultBuildChooser"/>
        <gitTool>Default</gitTool>
        <submoduleCfg class="list"/>
        <relativeTargetDir></relativeTargetDir>
        <reference></reference>
        <excludedRegions></excludedRegions>
        <excludedUsers></excludedUsers>
        <gitConfigName></gitConfigName>
        <gitConfigEmail></gitConfigEmail>
        <skipTag>false</skipTag>
        <includedRegions></includedRegions>
        <scmName></scmName>
      </scm>
      <canRoam>true</canRoam>
      <disabled>false</disabled>
      <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
      <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
      <triggers class="vector">
        <hudson.triggers.TimerTrigger>
          <spec>0 20,23 * * *</spec>
        </hudson.triggers.TimerTrigger>
      </triggers>
      <concurrentBuild>false</concurrentBuild>
      <builders>
        <hudson.tasks.Shell>
          <command>
    export BROWSER_LABEL=${BROWSER_LABEL}
    export ENVIRONMENT=cloudbees
    export MEDIAWIKI_URL=http://en.m.wikipedia.org/wiki/

    curl -s -o use-ruby https://repository-cloudbees.forge.cloudbees.com/distributions/ci-addons/ruby/use-ruby
    RUBY_VERSION=2.0.0-p0 \
      source ./use-ruby

    gem install bundler --no-ri --no-rdoc
    cd tests/acceptance/
    bundle install
    bundle exec ${BUNDLE_EXEC}
    </command>
        </hudson.tasks.Shell>
      </builders>
      <publishers>
        <hudson.tasks.junit.JUnitResultArchiver>
          <testResults>tests/acceptance/reports/junit/*.xml</testResults>
          <keepLongStdio>false</keepLongStdio>
          <testDataPublishers/>
        </hudson.tasks.junit.JUnitResultArchiver>
        <hudson.tasks.Mailer>
          <recipients>${RECIPIENTS}</recipients>
          <dontNotifyEveryUnstableBuild>false</dontNotifyEveryUnstableBuild>
          <sendToIndividuals>false</sendToIndividuals>
        </hudson.tasks.Mailer>
        <hudson.plugins.ircbot.IrcPublisher plugin="ircbot@2.21">
          <targets class="java.util.Collections$EmptyList"/>
          <strategy>STATECHANGE_ONLY</strategy>
          <notifyOnBuildStart>false</notifyOnBuildStart>
          <notifySuspects>false</notifySuspects>
          <notifyCulprits>false</notifyCulprits>
          <notifyFixers>false</notifyFixers>
          <notifyUpstreamCommitters>false</notifyUpstreamCommitters>
          <buildToChatNotifier class="hudson.plugins.im.build_notify.DefaultBuildToChatNotifier" plugin="instant-messaging@1.25"/>
          <matrixMultiplier>ONLY_CONFIGURATIONS</matrixMultiplier>
          <channels/>
        </hudson.plugins.ircbot.IrcPublisher>
      </publishers>
      <buildWrappers/>
      <executionStrategy class="hudson.matrix.DefaultMatrixExecutionStrategyImpl">
        <runSequentially>false</runSequentially>
      </executionStrategy>
    </project>

--

## Save

- Save
