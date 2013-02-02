<?php
  // Implements the business logic for administering the gallery
require 'bsclasses.php';
require 'crypt.php';

  // If not authenticated, return error right away
session_start();
if ($_SESSION["auth"] != true) {
    $ro = new BaseRO(); 
    $ro->success = false;
    $ro->retcode = 1;

    echo json_encode($ro);
    exit;
} 

///////// Business methods /////

/* 
   Input: None
   Output: GetAlbumsRO object
*/
function getAlbums() {

    $ro = new GetAlbumsRO();
    $files = glob('Pics/*');
    $numfiles = count($files);	

    for ($i=0; $i < $numfiles; $i++)
    {
        $onefile = $files[$i];
        $imgs_in_album = glob("$onefile/*.[jJ][pP][gG]");
        if (count($imgs_in_album) > 0)
            $album_image = $imgs_in_album[0];
        else
            $album_image = "res/GenericAlbum.jpg";
        $album_name = basename($onefile);

        $oneAlbum = new AlbumInfo($album_name, $album_image);
        array_push($ro->albums, $oneAlbum);
    }

    return $ro;
}

/* 
   Input: None
   Output: AlbumSummaryRO object
*/
function albumSummary() {
    $ro = new AlbumSummaryRO();
    
    $files = glob('Pics/*');
    $ro->numAlbums = count($files);

    $ro->usedSpace = round(filesize_r('Pics') / 1000000); // space in MiB
    $ro->totalSpace = $ro->usedSpace + round(disk_free_space("/") / 1000000); // space in GiB

    return $ro;
}

/*
  Input: Array with property "name"
  Output: BaseRO
 */
function createAlbum($inputArr) {
    
    $ro = new BaseRO();
    $aname = $inputArr["name"];

    error_log("Album name = " . $aname);

    $oldumask = umask(0); 
    $ro->success = mkdir("Pics/$aname", 0777);
    if (!($ro->success)) {
        $ro->retcode = 2;
    }
    umask($oldumask); 

    return $ro;
}

/*
  Input: Array with property "name"
  Output: PublicLinkRO
 */
function publicLink($inputArr) {
    $ro = new PublicLinkRO();
    $aname = $inputArr["name"];

    $config = parse_ini_file("config.ini");
    $cryptpw = $config["cryptpw"];

    error_log("Album name = $aname");
    $album_enc = urlencode(encrypt($aname, $cryptpw));
    $ro->url = "slides.php?album=$album_enc";

    return $ro;
}

///////// Dispatcher ///////
function dispatch($method, $data) {

    // Use a dispatch table instead of eval to prevent code-injection attacks
    $validFuncs = array("getAlbums", 
                        "createAlbum", 
                        "publicLink",
                        "albumSummary");

    if (in_array($method, $validFuncs)) {
        return call_user_func($method, $data);
    }
}

///////// Utils /////////////

function filesize_r($path){
    if(!file_exists($path)) return 0;
    if(is_file($path)) return filesize($path);
    $ret = 0;
    foreach(glob($path."/*") as $fn)
        $ret += filesize_r($fn);
    return $ret;
}

///////// Main /////////////


// Now, find method and args object
$method = $_POST["method"];
$data = $_POST["args"];

error_log(print_r($data, TRUE));

// Dispath the method
// $ro = dispatch($method, $data);
$ro = dispatch($method, $data);

echo json_encode($ro);

?>

