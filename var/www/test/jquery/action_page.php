Passing date range <?php echo htmlspecialchars($_POST['datefilter']); ?> to google scripts webapp via curl HTTP GET request.

<?php
// Need to avoid 'Moved Temporarily' handling - see https://developers.google.com/apps-script/guides/content#redirects
// https://evertpot.com/curl-redirect-requestbody/
// http://php.net/manual/en/function.curl-setopt.php


// See this in browser ...
//	Passing date range 22/11/2018 to 22/12/2018 to google scripts webapp via curl HTTP GET request.
//	Moved Temporarily
// The document has moved here. 1
//
// where here link is ...
// https://accounts.google.com/ServiceLogin?passive=1209600&continue=https://script.google.com/macros/s/AKfycbzti4_uUaGNWAub1_HA6bhQTtMttU8wuVWl6X70oJm5sLUl8yg/exec?daterange%3D22/11/2018%2Bto%2B22/12/2018&followup=https://script.google.com/macros/s/AKfycbzti4_uUaGNWAub1_HA6bhQTtMttU8wuVWl6X70oJm5sLUl8yg/exec?daterange%3D22/11/2018%2Bto%2B22/12/2018
//
// and curl opts set to ...
//
// curl_setopt($curl, CURLOPT_URL, $url);
// curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'GET');
// curl_setopt($curl,CURLOPT_FOLLOWLOCATION, true);
// curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
//
// and web app deploy cfg set to execute as anyone - NOT anyone + anonymous			





$url = 'https://script.google.com/macros/s/AKfycbzti4_uUaGNWAub1_HA6bhQTtMttU8wuVWl6X70oJm5sLUl8yg/exec?daterange=' . urlencode(htmlspecialchars($_POST['datefilter']));

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
