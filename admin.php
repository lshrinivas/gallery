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
    <script src="jqui/jquery-1.9.0.js"></script>
    <script src="jqui/ui/jquery-ui.js"></script>
    <script src="scripts/mustache.js"></script>
    <script src="scripts/admin.js"></script>
    <!-- File upload plugin stuff -->
    <link href="uploader/css/jquery.fileupload-ui.css" rel="stylesheet">
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
	<br/>
	<!-- The file upload form used as target for the file upload widget -->
	<form id="fileupload" action="" method="POST" enctype="multipart/form-data">
          <!-- The fileupload-buttonbar contains buttons to add/delete files and start/cancel the upload -->
          <div class="row fileupload-buttonbar">
            <div class="span7">
              <!-- The fileinput-button span is used to style the file input field as button -->
              <span class="btn btn-success fileinput-button">
                <i class="icon-plus icon-white"></i>
                <span>Add files...</span>
                <input type="file" name="files[]" multiple>
              </span>
              <button type="submit" class="btn btn-primary start">
                <i class="icon-upload icon-white"></i>
                <span>Start upload</span>
              </button>
              <button type="reset" class="btn btn-warning cancel">
                <i class="icon-ban-circle icon-white"></i>
                <span>Remove all</span>
              </button>
              <button type="button" class="btn btn-danger delete">
                <i class="icon-trash icon-white"></i>
                <span>Delete</span>
              </button>
              <input type="checkbox" class="toggle">
            </div>
            <!-- The global progress information -->
            <div class="span5 fileupload-progress fade">
              <!-- The global progress bar -->
              <div class="progress progress-success progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                <div class="bar" style="width:0%;"></div>
              </div>
              <!-- The extended global progress information -->
              <div class="progress-extended">&nbsp;</div>
            </div>
          </div>
          <!-- The loading indicator is shown during file processing -->
          <div class="fileupload-loading"></div>
          <br>
          <!-- The table listing the files available for upload/download -->
          <table role="presentation" class="table table-striped"><tbody class="files" data-toggle="modal-gallery" data-target="#modal-gallery"></tbody></table>
	</form>
	<div id="dropbox" class="dashed-box ui-corner-all ui-widget">
	  <p id="dropbox-label">Drag and drop photos here</p>
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
    <script id="template-upload" type="text/x-tmpl">
      {% for (var i=0, file; file=o.files[i]; i++) { %}
      <tr class="template-upload fade ui-widget">
        <td class="preview"><span class="fade"></span></td>
        <td class="name"><span>{%=file.name%}</span></td>
        <td class="size"><span>{%=o.formatFileSize(file.size)%}</span></td>
        {% if (file.error) { %}
        <td class="error" colspan="2"><span class="label label-important">Error</span> {%=file.error%}</td>
        {% } else if (o.files.valid && !i) { %}
        <td>
          <div class="progress progress-success progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="bar" style="width:0%;"></div></div>
        </td>
        <td class="start">{% if (!o.options.autoUpload) { %}
          <button class="btn btn-primary">
            <i class="icon-upload icon-white"></i>
            <span>Start</span>
          </button>
          {% } %}</td>
        {% } else { %}
        <td colspan="2"></td>
        {% } %}
        <td class="cancel">{% if (!i) { %}
          <button class="btn btn-warning">
            <i class="icon-ban-circle icon-white"></i>
            <span>Cancel</span>
          </button>
          {% } %}</td>
      </tr>
      {% } %}
    </script>
    <!-- The template to display files available for download -->
    <script id="template-download" type="text/x-tmpl">
      {% for (var i=0, file; file=o.files[i]; i++) { %}
      <tr class="template-download fade ui-widget">
        {% if (file.error) { %}
        <td></td>
        <td class="name"><span>{%=file.name%}</span></td>
        <td class="size"><span>{%=o.formatFileSize(file.size)%}</span></td>
        <td class="error" colspan="2"><span class="label label-important">Error</span> {%=file.error%}</td>
        {% } else { %}
        <td class="preview">{% if (file.thumbnail_url) { %}
          <a href="{%=file.url%}" title="{%=file.name%}" data-gallery="gallery" download="{%=file.name%}"><img src="{%=file.thumbnail_url%}"></a>
          {% } %}</td>
        <td class="name">
          <a href="{%=file.url%}" title="{%=file.name%}" data-gallery="{%=file.thumbnail_url&&'gallery'%}" download="{%=file.name%}">{%=file.name%}</a>
        </td>
        <td class="size"><span>{%=o.formatFileSize(file.size)%}</span></td>
        <td colspan="2"></td>
        {% } %}
        <td class="delete">
          <button class="btn btn-danger" data-type="{%=file.delete_type%}" data-url="{%=file.delete_url%}"{% if (file.delete_with_credentials) { %} data-xhr-fields='{"withCredentials":true}'{% } %}>
            <i class="icon-trash icon-white"></i>
            <span>Delete</span>
          </button>
          <input type="checkbox" name="delete" value="1">
        </td>
      </tr>
      {% } %}
    </script>
    <!-- The Templates plugin is included to render the upload/download listings -->
    <script src="http://blueimp.github.com/JavaScript-Templates/tmpl.min.js"></script>
    <!-- The Load Image plugin is included for the preview images and image resizing functionality -->
    <script src="http://blueimp.github.com/JavaScript-Load-Image/load-image.min.js"></script>
    <!-- The Canvas to Blob plugin is included for image resizing functionality -->
    <script src="http://blueimp.github.com/JavaScript-Canvas-to-Blob/canvas-to-blob.min.js"></script>
    <script src="uploader/js/jquery.fileupload.js"></script>
    <script src="uploader/js/jquery.fileupload-fp.js"></script>
    <script src="uploader/js/jquery.fileupload-ui.js"></script>
    <script src="uploader/js/jquery.fileupload-jui.js"></script>


  </body>
</html>
