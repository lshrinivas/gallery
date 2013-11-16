<?php

session_start();
if ($_SESSION["auth"] != true) {
    header("location:index.html");
}

if (isset($_POST["logout"]) && $_POST["logout"] == "true") {
    $_SESSION["auth"] = false;
}

?>

<html>
  <head>
    <meta charset="utf-8">
    <title>Memories...</title>
    <link href="css/main.css" rel="stylesheet">
    <link href="css/admin.css" rel="stylesheet">
    <link href="jqui/themes/ui-darkness/jquery-ui.css" rel="stylesheet">
    <link href="css/overrides.css" rel="stylesheet">
    <link href="css/font-awesome.min.css" rel="stylesheet">
    <script src="jqui/jquery-1.9.0.js"></script>
    <script src="jqui/ui/jquery-ui.js"></script>
    <script src="scripts/mustache.js"></script>
    <script src="scripts/binaryajax.js"></script>
    <script src="scripts/exif.js"></script>
    <script src="scripts/fileuploader.js"></script>
    <script src="scripts/admin.js"></script>
  </head>
  <body>
    <div id="container">
      <div id="toolbar">
	<button id="newalbum">New Album</button>
	<button id="upload">Upload Photos</button>
	<button id="logout">Logout</button>
      </div>

      <div id="info" class="ui-widget ui-widget-content ui-corner-all">
      </div>
      <!-- Template for all albums summary -->
      <script id="infoTemplate" type="text/html">
	<p>Number of albums: {{numAlbums}}</p>
	<div id="spaceusedbar"></div>
	<p>Used: {{usedSpace}} MB of {{totalSpace}} MB</p>
      </script>
      <!-- Template for single album summary -->
      <script id="oneAlbumTemplate" type="text/html">
	<p>Album public link:</p>
	<div class="ui-state-highlight ui-corner-all" style="padding: 2px;">
	  {{albumPublicUrl}}
	</div>
	<p>Number of photos: {{numPics}}</p>
	<p>Used space: {{usedSpace}} MB</p>

	<button id="delete-photos">Delete</button>
      </script>


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
      <script id="photoTemplate" type="text/html">
	<div id="breadcrumb" class="ui-widget">
	  <span id="albumview" class="link">Home</span> &gt; 
	  <span id="albumname">{{albumName}}</span>
	</div>
	<div id="photoContainer">
	{{#photos}}
	<div class="thumb">
	  <img class="thumb" src="{{{imageUrl}}}" title="{{imageInfo}}"/>
	</div>
	{{/photos}}
	</div>
      </script>

      <div id="uploadPanel" class="panel">
	<div id="bc-container">
	</div>
  	<input id="upload-files" type="file" multiple />
	<button id="do-upload">Upload</button>
	<br/>

        <div>
          <table id="tblFileList">
            <thead>
              <tr>
                <th class="name">Name</th>
                <th class="resizing">Resizing</th>
                <th class="uploading">Uploading</th>
              </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>

      </div>

      <script id="uploadTemplate" type="text/html">
	<div id="breadcrumb" class="ui-widget">
	  <span id="albumview2" class="link">Home</span> &gt; 
	  <span id="albumname2" class="link">{{albumName}}</span> &gt; 
	  <span>Upload...</span>
	</div>
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

    <!-- The template to display files available for upload -->
    <script id="uploadFileListTemplate" type="text/x-tmpl">
      {{#imgFiles}}
      <tr class="template-upload fade ui-widget">
        <td class="name">{{name}}</span></td>
        <td class="resizing">
            <i class="fa fa-cog fa-spin" style="display: none;"></i>
            <i class="fa fa-check-circle" style="display: none;"></i>
        </td>
        <td class="uploading">
          <div class="uploadprogress"></div>
        </td>
      </tr>
      {{/imgFiles}}
    </script>


  </body>
</html>
