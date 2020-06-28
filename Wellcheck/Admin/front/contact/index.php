<?php
include('/contact/parsedown.php');
$fn = fopen("/contact/contact.txt","r");

$str = "";
while(! feof($fn))  {
   $result = fgets($fn);
   $str .= $result;
 }
 fclose($fn);

 $Parsedown = new Parsedown();
 $html = $Parsedown->text($str);
?>
<link rel="stylesheet" href="/css/md.css">
<style>
	.markdown-body {
		box-sizing: border-box;
		min-width: 300px;
		max-width: 100%;
		margin: 0 auto;
		padding: 45px;
	}

	@media (max-width: 767px) {
		.markdown-body {
			padding: 15px;
		}
	}
</style>
<article class="markdown-body">
	<?= $html ?>
</article>
