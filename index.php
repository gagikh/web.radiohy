<?php 

    $url = "https://raw.githubusercontent.com/djgago/xbmc.plugin.audio.radiohy/master/resources/lib/backup.json";

    $stations = file_get_contents($url);

    $str = " src='backup.json'>";

    $url = "https://gist.githubusercontent.com/djgago/2e2fe5ed5767a21cc269/raw/6b2e2e01f09aab52a3a9a72a8e27ccb0493818a4/stations.html";

    $html = file_get_contents($url);

    $code = ">" . $stations . ";";
    $html = str_replace($str, $code, $html);
    
    echo $html
?>
