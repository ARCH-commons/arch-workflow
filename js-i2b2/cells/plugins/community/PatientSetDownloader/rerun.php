<?php

include_once('config.php');

function _getJob($job_id) {
	global $CONFIG;
	$file = file_get_contents($CONFIG['jobs_directory'] . '/' . $job_id . '.job');
	return json_decode($file);
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

$user_id = $_POST["user_id"];		// rerun user_id
$session = $_POST["session"];		// rerun session key
$job_id = $_POST["job_id"];			// original job_id
$orig_data = _getJob($job_id);		// original data
$orig_user_id = $orig_data->userid;	// original user_id

//$new_job_id = $orig_user_id . '_' . _generate_uuid(); // create new job_id

//copy($CONFIG['jobs_directory'] . '/' . $job_id . '.job', $CONFIG['jobs_directory'] . '/' . $new_job_id . '.job');

//$data = _getJob($new_job_id);		// new copied data
$data = _getJob($job_id);		// old data
$data->status = 'RERUN';
$data->payload = '';
$data->rerun_userid = $user_id;
$data->rerun_login_password = $session;
$jobfile = fopen($CONFIG['jobs_directory'] . '/' . $job_id . '.job', "w");
fwrite($jobfile, json_encode($data));
fclose($jobfile);

// process
$com = new Com('WScript.shell');
$com->run('php worker_sxe.php '. $job_id . ' 0', 10, false);


print "Job has been restarted.";

?>