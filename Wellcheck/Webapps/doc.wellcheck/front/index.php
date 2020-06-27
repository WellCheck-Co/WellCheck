<?php
// "sendfile.php"

//remove after testing - in particular, I'm concerned that our file is too large, and there's a memory_limit error happening that you're not seeing messages about.
error_reporting(E_ALL);
ini_set('display_errors',1);

?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
</head>
<?php if (isset($_GET["doc"])){ ?>
<body style="margin: 0">
  <object id="viewer" data="./src.php?doc=<?= $_GET["doc]" ?>" type="application/pdf" style="width: 100%; height: calc(100vh - 6px)">
  	<div id="viewer2" class="pdf"></div>
  	Woups, look like you can't read this document from your device<br>
  	Download it !
    <a id="viewerlink" href="./src.php?doc=<?= $_GET["doc]" ?>"> Here !</a>
  </object>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.js"></script>
  <script>
  PDFObject.embed("./src.php?doc=<?= $_GET["doc]" ?>", "#viewer2");
  </script>
</body>
<?php } ?>>
</html>
