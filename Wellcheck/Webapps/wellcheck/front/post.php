<?php
$message = "| " . htmlspecialchars($_POST["email"]) . " | " . htmlspecialchars($_POST["message"]) . " | " . $_SERVER['REMOTE_ADDR'] . " | " . $_SERVER['HTTP_X_FORWARDED_FOR'] . " | " . date(DATE_RFC2822) . " | ";
$fp = fopen('/result/contact.txt', 'a+');
fwrite($fp, str_replace("\n","",$message) ."\n");
fclose($fp);
?>
