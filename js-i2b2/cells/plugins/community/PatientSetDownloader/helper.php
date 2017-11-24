<?php
// THE MAGICAL SCRIPT 3/3/16
// Nich Wattanasin

include_once('config.php');

function _createNewJob($job) {
	global $CONFIG;
	$data = json_decode($job);
	$userid = $data->userid;
	$job_id = $userid . '_' . _generate_uuid();
	$jobfile = fopen($CONFIG['jobs_directory'] . '/' . $job_id . '.job', "w");
	fwrite($jobfile, $job);
	fclose($jobfile);
	return $job_id; // nw096_da6808d5-c888-4ed8-88d7-1ffb0ccf8c0e
}

function _getJobID($job){
	$data = json_decode($job);
	// To-do: check if job exists on filesystem
	return $data->id;
}

function _generate_uuid() {
	return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
		mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
		mt_rand( 0, 0xffff ),
		mt_rand( 0, 0x0fff ) | 0x4000,
		mt_rand( 0, 0x3fff ) | 0x8000,
		mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
	);
}

$job = $_POST['job'];
$preview = $_POST['preview']; // 1 or 0

if($preview){
	$job_id = _createNewJob($job);
} else {
	$job_id = _getJobID($job);
}

echo $job_id;


// Background Work Starts Here


// Windows
if($CONFIG["os_type"] == 'windows'){
  $com = new Com('WScript.shell');
  $com->run('php worker_sxe.php '. $job_id . ' ' . $preview, 10, false);
} elseif($CONFIG["os_type"] == 'linux'){
// Linux
  exec('echo "php -q worker_sxe.php ' . $job_id . ' ' . $preview . '" | SHELL=/bin/bash at now 2>&1', $out);
}


?>