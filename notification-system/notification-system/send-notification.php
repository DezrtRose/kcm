<?php
include 'config.php';
include 'gcm.php';

$gcm = new GCM();

//$gcm->sendNotification($_GET['notification']);
$gcm->sendNotification();