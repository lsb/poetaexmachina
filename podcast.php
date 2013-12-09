<?php
header('Content-type: application/xml');
$where = preg_replace('/[^_0-9a-f]/','',$_GET['hopothen']);

echo '<?xml version="1.0"?>';
?>

<rss xmlns:itunes="http://www.itunes.com/DTDs/Podcast-1.0.dtd" version="2.0">
<channel>
<title>Poeta ex Machina</title>
<link>http://www.poetaexmachina.net</link>
<description>Text-to-Speech for Latin Poetry.</description>
<item>
<title><?php @readfile($where . '.txt'); ?></title>
<enclosure url="http://www.poetaexmachina.net/<?php echo $where; ?>.mp3" type="audio/mpeg"/>
</item>
</channel>
</rss>
