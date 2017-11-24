<?php

include_once('config.php');
include_once('functions.php');

$job_id = $_POST["job_id"];

$job_data = get_job($job_id);

if($job_data->status == 'FINISHED'){
	print "Job has already completed and ready to download.";
} else {
	update_job_status($job_id, 'CANCELLED', 'Job has been cancelled by user');
	print "Job has been cancelled.";
}

?>