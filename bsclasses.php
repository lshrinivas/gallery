<?php

  // Contains all class definitions

class BaseRO 
{
    public $success = true;
    public $retcode = 0;
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

?>