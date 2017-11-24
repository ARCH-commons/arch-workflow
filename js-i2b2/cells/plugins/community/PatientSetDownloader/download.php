<?php
// Downloader

include_once('config.php');
include_once('functions.php');

$pm_url = $_POST['pm_uri'] . 'getServices';
$hive_domain = $_POST['domain'];
$user_id = $_POST['user_id'];
$session = $_POST['session'];
$job_id = $_POST['job_id'];
$request_xml = get_user_configuration_XML($pm_url, $hive_domain, $user_id, $session);
$response_xml = post_XML($request_xml, $pm_url);
$file = $CONFIG['jobs_directory'] . '/csv_' . $job_id . '.csv';
$download_filename = $CONFIG['csv_filename_prefix'] . $user_id . '_' . date("Y-m-d",filemtime($file)) . '.csv';

if(result_status_success($response_xml)){
	if (file_exists($file)) {
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename='.$download_filename);
		header('Content-Transfer-Encoding: binary');
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize($file));
		ob_clean();
		flush();
		readfile($file);
		exit;
	}
} else {
	header('Content-Description: File Transfer');
	header('Content-Type: application/octet-stream');
	header('Content-Disposition: attachment; filename='.$download_filename);
	header('Content-Transfer-Encoding: binary');
	header('Expires: 0');
	header('Cache-Control: must-revalidate');
	header('Pragma: public');
	header('Content-Length: 23');
	ob_clean();
	flush();
	echo 'Download Not Authorized';
	exit;
}
?>