<?php

$mypassword=$_POST['password']; 

$coarsets = (int) (floor(time() / 100));

$config = parse_ini_file("config.ini");
$adminpw = $config["adminpw"];

$salted = "$adminpw$coarsets";

$expected =  sha1($salted);

session_start();
if ($mypassword == $expected) {
    // Register the token into the session
    $_SESSION["auth"] = true;
    echo "Success";
} else {
    $_SESSION["auth"] = false;
    echo "Fail";
}

?>
