<?php 

    function copy_from_git($repo, $file_name) {
        $url = $repo . $file_name;
        $str = file_get_contents($url);
        file_put_contents($file_name, $str);
    }

    $repo = "https://raw.githubusercontent.com/djgago/web.radiohy/master/";
    $array = array("stations.js", "stations.css", "stations.html", "forum.html", "about.html");
    $count = count($array);
    for ($i = 0; $i < $count; $i++) {
        copy_from_git($repo, $array[$i]);
    }

    # read others
    $backup = "backup.json";
    $repo = "https://raw.githubusercontent.com/djgago/xbmc.plugin.audio.radiohy/master/resources/lib/";
    copy_from_git($repo, $backup);

    header('Location: stations.html');
    exit;
?>
