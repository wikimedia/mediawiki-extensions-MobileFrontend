<?php
$disableHtml = <<<EOT
 <h1> 
          {$areYouSure}
        </h1> 
        <p> 
          {$explainDisable}
        </p> 
        <div id='disableButtons'> 
          <form action='http://en.wikipedia.org/w/mobileRedirect.php' method='get'> 
            <input name='to' type='hidden' value='http://en.wikipedia.org/' /> 
            <input name='expires_in_days' type='hidden' value='3650' /> 
            <button id='disableButton' type='submit'>{$disableButton}</button> 
          </form> 
          <form action='/' method='get'> 
            <button id='backButton' type='submit'>{$backButton}</button> 
          </form> 
        </div>
EOT;
