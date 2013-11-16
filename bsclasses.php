<?php

  // Contains all class definitions

class BaseRO 
{
    public $success = true;
    public $retcode = 0;
    public $retmsg = "";
}

class AlbumInfo
{
    public $name;
    public $coverImage;

    function __construct($an, $ci) {
        $this->name = $an;
        $this->coverImage = $ci;
    }
}

class GetAlbumsRO extends BaseRO
{
    public $albums = array();
}

class PublicLinkRO extends BaseRO
{
    public $url = "";
}

class AlbumSummaryRO extends BaseRO
{
    public $numAlbums = 0;
    public $usedSpace = 0;
    public $totalSpace = 0;
}

class PhotoInfo
{
    public $imageUrl;
    public $imageInfo; // size, name etc.

    function __construct($url, $info) {
        $this->imageUrl = $url;
        $this->imageInfo = $info;
    }
}

class GetPhotosRO extends BaseRO
{
    public $albumName = "";
    public $photos = array();
}

class PhotoSummaryRO extends BaseRO
{
    public $albumPublicUrl = "";
    public $numPics = 0;
    public $usedSpace = 0;
}

class UploadedPhotoRO
{
    public $imageUrl;

    function __construct($url) {
        $this->imageUrl = $url;
    }
}

?>
