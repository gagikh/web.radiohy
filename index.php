<?php 

    $url = "https://raw.githubusercontent.com/djgago/xbmc.plugin.audio.radiohy/master/resources/lib/backup.json";

    $stations = file_get_contents($url);

    $str = " src='backup.json'>";

    $url = "https://raw.githubusercontent.com/djgago/web.radiohy/master/stations.html";

    $html = file_get_contents($url);

    $code = ">" . $stations . ";";
    $html = str_replace($str, $code, $html);
    
    echo $html
?>
