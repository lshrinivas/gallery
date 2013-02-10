<?php
/*
 * jQuery File Upload Plugin PHP Example 5.14
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

error_reporting(E_ALL | E_NOTICE);
require 'UploadHandler.php';

$albumName = $_POST["albumName"];
$options = array(
    'upload_dir' => dirname($_SERVER['SCRIPT_FILENAME']).'/Pics/'.$albumName.'/',
    'upload_url' => 'Pics/'.$albumName.'/'
    );
$upload_handler = new UploadHandler($options);

?>