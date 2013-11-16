<?php

require 'bsclasses.php';

$albumName = $_POST["albumName"];
$fileName = $_POST["fileName"];
if ( isset($_FILES["file"]) && !empty($_FILES["file"]) ) {

    // Generate path to save file to
    $uploadDir = dirname($_SERVER['SCRIPT_FILENAME']).'/Pics/'.$albumName.'/';
    $destFileName = $uploadDir . $fileName;
    // Save the file to the server
    move_uploaded_file($_FILES["file"]['tmp_name'], $destFileName);

    // Return the URL of image
    $url = 'Pics/'.$albumName.'/'.$fileName;

    $ro = new UploadedPhotoRO($url);
} else {
    $ro = new BaseRO();
    $ro->success = false;
    $ro->retcode = 4;
    $ro->retmsg = "Uploaded file data is empty";
}

echo json_encode($ro);

?>
