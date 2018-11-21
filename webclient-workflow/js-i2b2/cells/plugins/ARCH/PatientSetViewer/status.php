<?php

include_once('config.php');

$job_id = $_GET["job_id"];

header('Content-Type: application/json', true);
$jobfile = file_get_contents($CONFIG['jobs_directory'] . '/' . $job_id . '.job');

echo $jobfile;

?>