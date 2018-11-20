Passing date range <?php echo htmlspecialchars($_POST['datefilter']); ?> to google scripts webapp via curl HTTP GET request.

<?php
// Need to avoid 'Moved Temporarily' handling - see https://developers.google.com/apps-script/guides/content#redirects
// https://evertpot.com/curl-redirect-requestbody/
// http://php.net/manual/en/function.curl-setopt.php

// getcalendarevents project in shaftesburyuc@gmail.com scripts account
$url = 'https://script.google.com/macros/s/AKfycbw6U9HbKGRMxYWtl1omIUdSaL4jCOInH56JBqLOwwAod4IkbP18/exec?daterange=' . urlencode(htmlspecialchars($_POST['datefilter']));

// getcalendarevents project in bsucshaftesbury@gmail.com scripts account
//$url = 'https://script.google.com/macros/s/AKfycbzti4_uUaGNWAub1_HA6bhQTtMttU8wuVWl6X70oJm5sLUl8yg/exec?daterange=' . urlencode(htmlspecialchars($_POST['datefilter']));

$curl = curl_init();

curl_setopt($curl, CURLOPT_URL, $url);

curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'GET');

// Follow redirects, if any
//curl_setopt($curl,CURLOPT_FOLLOWLOCATION, true);

// Return the actual result of the curl result instead of success code
//curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

// Fetch the URL and save the content in $html variable
$html_response = curl_exec($curl);

echo $html_response;

curl_close($curl);
?>
