<html>
  <head>
    <meta charset="utf-8">
    <title>Pictures</title>
    <link href="jqui/css/ui-darkness/jquery-ui-1.9.1.custom.css" rel="stylesheet">
    <link href="css/main.css" rel="stylesheet">
    <script src="jqui/js/jquery-1.8.2.js"></script>
    <script src="jqui/js/jquery-ui-1.9.1.custom.js"></script>
    <script src="scripts/main.js"></script>
    <script src="scripts/jquery.cycle.all.js"></script>
  </head>
  <body>
     <?php

     require 'crypt.php';

     $config = parse_ini_file("config.ini");
     $cryptpw = $config["cryptpw"];

     if (isset($_GET['album'])) { 
         $encalbum = urldecode($_GET['album']);

         $album = decrypt($encalbum, $cryptpw);
     }

     $picPath = "Pics/$album/*.[jJ][pP][gG]";
     $files = glob($picPath);
     $numfiles = count($files);	
    ?>

    <div id="container">
      <?php
	 for ($i=0; $i < $numfiles; $i++)
         {
             $onefile = $files[$i];
      ?>	
      <div><img class="slide" src="<?php echo $onefile; ?>" /></div>
      <?php
	 }
      ?>
    </div>
    <button id="browse">Browse</button>
    <div id="thumbs" class="ui-widget">
      <div id="content" class="ui-widget-content">
	 <?php
	 for ($i=0; $i < $numfiles; $i++)
         {
             $onefile = $files[$i];
	 ?>
	     <div class="thumb">
	         <img class="thumb" src="<?php echo $onefile; ?>" />
	     </div>
	 <?php
	 }
         ?>
      </div>
    </div>
    <div id="tb-container" class="ui-widget-overlay ui-corner-all">
      <span id="toolbar" class="ui-widget-header ui-corner-all">
        <button id="prev">Previous</button>
        <button id="play">Pause</button>
        <button id="next">Next</button>
      </span>
    </div>
  </body>
</html>
