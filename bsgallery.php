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
   Output: GetPhotosRO object
*/
function getPhotos($inputArr) {

    $ro = new GetPhotosRO();
    $album = $inputArr["name"];
    $ro->albumName = $album;

    $picPath = "Pics/$album/*.[jJ][pP][gG]";
    $files = glob($picPath);
    $numfiles = count($files);	

    for ($i=0; $i < $numfiles; $i++)
    {
        $photoUrl = $files[$i];
        $info = basename($photoUrl);
        $onePhoto = new PhotoInfo($photoUrl, $info);
        array_push($ro->photos, $onePhoto);
    }

    error_log(print_r($ro, TRUE));

    return $ro;
}

/* 
   Input: Array with property "name"
   Output: AlbumSummaryRO object
*/
function photoSummary($inputArr) {
    $ro = new PhotoSummaryRO();
    $album = $inputArr["name"];

    $picPath = "Pics/$album/*.[jJ][pP][gG]";
    $files = glob($picPath);
    $ro->numPics = count($files);	

    $ro->usedSpace = round(filesize_r("Pics/$album") / 1000000); // space in MiB

    $plinkRO = publicLink($inputArr);
    $ro->albumPublicUrl = $plinkRO->url;

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

/*
   Input: Array with properties "albumName" and "picurls"
   Output: BaseRO object
*/
function deletePhotos($inputArr) {
    $ro = new BaseRO();
    $album = $inputArr["albumName"];
    $filesToDel = $inputArr["picurls"];
    $numfiles = count($filesToDel);

    for ($i=0; $i < $numfiles; $i++)
    {
        $ro->success = unlink($filesToDel[$i]);
        $ro->retmsg = "Deleted " . $filesToDel[$i];
        if (!($ro->success)) {
            $ro->retcode = 4;
            $ro->retmsg = "Couldn't delete files";
            return $ro;
        }
    }

    return $ro;
}

///////// Dispatcher ///////
function dispatch($method, $data) {

    // Use a dispatch table of valid funcs to prevent code-injection attacks
    $validFuncs = array("getAlbums",
                        "createAlbum",
                        "publicLink",
                        "albumSummary",
                        "getPhotos",
                        "photoSummary",
                        "deletePhotos");

    if (in_array($method, $validFuncs)) {
        return call_user_func($method, $data);
    } else {
        $ro = new BaseRO(); 
        $ro->success = false;
        $ro->retcode = 3;
        return $ro;
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

// error_log(print_r($data, TRUE));

// Dispatch the method
$ro = dispatch($method, $data);

echo json_encode($ro);

?>

