<?php

session_start();
if ($_SESSION["auth"] != true) {
    header("location:index.html");
}

if ($_POST["logout"] == "true") {
    $_SESSION["auth"] = false;
}

?>

<html>
  <head>
    <meta charset="utf-8">
    <title>Memories...</title>
    <link href="css/admin.css" rel="stylesheet">
    <link href="jqui/css/ui-darkness/jquery-ui-1.9.1.custom.css" rel="stylesheet">
    <script src="jqui/js/jquery-1.8.2.js"></script>
    <script src="jqui/js/jquery-ui-1.9.1.custom.js"></script>
    <script src="scripts/mustache.js"></script>
    <script src="scripts/admin.js"></script>

  </head>
  <body>
    <div id="container">
      <div id="toolbar">
	<button id="newalbum">New Album</button>
	<button id="logout">Logout</button>
      </div>

      <div id="allAlbumsPanel" class="panel">
      </div>
      <script id="albumTemplate" type="text/html">
	{{#albums}}
	<div class="album-cover ui-widget ui-widget-content ui-corner-all">
	  <img src="{{{coverImage}}}" />
	  <p class="album-title">{{name}}</p>
	</div>
	{{/albums}}
      </script>

      <div id="oneAlbumPanel" class="panel">
	
      </div>
      
      <div id="info" class="ui-widget ui-widget-content ui-corner-all"">
      </div>
      <script id="infoTemplate" type="text/html">
	<p>Number of albums: {{numAlbums}}</p>
	<p>Used: {{usedSpace}} MB of {{totalSpace}} MB</p>
      </script>

      <div id="newalbum-dialog" title="Create new album">
	<p class="validateTips">All form fields are required.</p>
	<form>
	    <label for="name">Name</label>
	    <input type="text" name="name" id="name" class="text ui-widget-content ui-corner-all" />
	</form>
      </div>

      <div id="alerts" title="">
      </div>
      <script id="alertTemplate" type="text/html">
	<p>{{body}}</p>
      </script>


      <div id="progress">
	<img src="res/ajax-loader.gif" />
      </div>

    </div>
  </body>
</html>
