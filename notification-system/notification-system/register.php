<?php

include 'config.php';
include 'gcm.php';

$gcm = new GCM();

//$post = $_POST;
$post = json_decode(file_get_contents('php://input'), true);

if(isset($post['user_type']) && isset($post['email']) && isset($post['gcm_reg_id']) && isset($post['platform_type']) && isset($post['platform_version'])) {
    $user_type = $post['user_type'];
    $email = $post['email'];
    $gcm_reg_id = $post['gcm_reg_id'];
    $platform_type = $post['platform_type'];
    $platform_version = $post['platform_version'];
} else {
    echo 'Incomplete data';
    die;
}

echo $gcm->registerGcmUser($user_type, $email, $gcm_reg_id, $platform_type, $platform_version);