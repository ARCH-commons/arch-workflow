<?php

# SCILHS Portal Connection
# Nich Wattanasin

require_once('config.php');

if(!isset($_GET['api'])){
  echo 'No API specified';
  die();
}

$api = $_GET['api'];

switch($api){
case 'mysite':
  $action = 'GET';
  if(empty($CONFIG['site'])){
    $output = array(
		    "error" => "The 'site' parameter is not configured in config.php"
		    );
    header('Content-Type: application/json');
    echo json_encode($output);
    die();
  } else {
    $endpoint = $CONFIG['ssp_url'] . 'api/cloud/site?short_name=' . $CONFIG['site'];
  }
  break;
case 'site':
  $action = 'GET';
  $endpoint = $CONFIG['ssp_url'] . 'api/cloud/site';
  if(isset($_GET['site']) && !empty($_GET['site'])){
    $endpoint .= '?short_name=' . $_GET['site'];
  }
  break;
case 'study':
  $action = 'GET';
  if(isset($_GET['study']) && !empty($_GET['study'])){
    $endpoint = $CONFIG['ssp_url'] . 'api/cloud/study/' . $_GET['study'];
  }
  break;
case 'file':
  $action = 'POST';
  if(isset($_POST['study_id']) && !empty($_POST['study_id'])){
    if(isset($_POST['site_id']) && !empty($_POST['site_id'])){
      $endpoint = $CONFIG['ssp_url'] . 'api/cloud/raw_file/' . $_POST['study_id'] . '/' . $_POST['site_id'];
    }
  }
  break;
  
}

if($action == 'GET'){
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL,$endpoint);
  curl_setopt($ch, CURLOPT_TIMEOUT, 30);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
  curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
  curl_setopt($ch, CURLOPT_USERPWD, $CONFIG['ssp_username'].':'.$CONFIG['ssp_password']);
  $result=curl_exec($ch);
  curl_close ($ch);
  header('Content-Type: application/json');
  echo $result;

} else if($action == 'POST'){
  $ini_val = ini_get('upload_tmp_dir');
  $upload_tmp_dir = $ini_val ? $ini_val : sys_get_temp_dir();
  $data_file = $upload_tmp_dir . '/' . $_FILES['data_file']['name'];
  $data_file_size = $_FILES['data_file']['size'];
  move_uploaded_file($_FILES['data_file']['tmp_name'], $data_file);
  //echo $data_file;

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL,$endpoint);
  //curl_setopt($ch, CURLOPT_HEADER, 1);
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
  curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
  curl_setopt($ch, CURLOPT_USERPWD, $CONFIG['ssp_username'].':'.$CONFIG['ssp_password']);
  //curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type:multipart/form-data"));
  $postData = array(
		    'uploadedFile' => "@$data_file"
		    );
  curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
  curl_setopt($ch, CURLOPT_INFILESIZE, $data_file_size);
  $result=curl_exec($ch);
  curl_close ($ch);
  header('Content-Type: application/json');
  echo $result;


}


?>