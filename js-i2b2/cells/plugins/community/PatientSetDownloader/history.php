<?php

/**
 * Renders the Download History HTML after authenticating with a POSTed i2b2 user and session key
 * to be called via AJAX by the Download Data plugin
 *
 * @name       history.php
 * @category   community
 * @package    PatientSetDownloader
 * @author     Nich Wattanasin <nwattanasin@partners.org>
 * @copyright  2016 Partners Healthcare
 * @version    1.1
 * @updated    May 10, 2017
 */


require_once("config.php");
require_once("functions.php");

function isAdmin($userid){
  //global $config_download_admin_users;
  //	foreach($config_download_admin_users as $admin){
  //		if(strtolower($userid) == strtolower($admin)) return true;
  //	}
	return false;
};


$config_download_jobs_directory = $CONFIG["jobs_directory"];
$pm_url = $_POST['pm_uri'] . 'getServices';
$hive_domain = $_POST['domain'];
$user_id = $_POST['user_id'];
$session = $_POST['session'];
$project = $_POST['project'];
$request_xml = get_user_configuration_XML($pm_url, $hive_domain, $user_id, $session);
$response_xml = post_XML($request_xml, $pm_url);
$output = "";

if(result_status_success($response_xml)){

	$output .= "<table id='PatientSetDownloader-HistoryResults' cellspacing='0'>\n";
	if(isAdmin($user_id)){
		$output .= "<tr><th>Job ID</th><th>User</th><th>Last Updated</th><th>Patient Set Size</th><th>Aggregation Option</th><th>Status</th></tr>\n";
	} else {
		$output .= "<tr><th>Last Updated</th><th>Patient Set Size</th><th>Aggregation Option</th><th>Status</th></tr>\n";
	}

	$files = array();
	$job_count = 0;
	$dir = new DirectoryIterator($config_download_jobs_directory);
	foreach ($dir as $fileinfo) {
		if (!$fileinfo->isDot()) {
			$jobfile = $fileinfo->getFilename();
			if(isAdmin($user_id)){
				if((substr($jobfile, -4) == '.job')){
					$files[$fileinfo->getMTime()] = $jobfile;
				}
			} else {
				if((substr($jobfile, 0, strlen($user_id)) === $user_id) && (substr($jobfile, -4) == '.job')){
					$files[$fileinfo->getMTime()] = $jobfile;
				}
			}
		}
	}
	krsort($files);
	foreach ($files as $mtime => $jobfile){
		$time_diff = time() - $mtime;
		
		$job_array = explode("_", $jobfile, 2);
		$job_user = $job_array[0];
		$job_count++;
		$file = file_get_contents($config_download_jobs_directory.'/'.$jobfile);
		$job_id = substr($jobfile, 0, strlen($jobfile)-4);
		$data = json_decode($file);

		$job_project = $data->project;

		// comment next line to process PREVIEW status
		if($data->status == 'PREVIEW') continue;
		if($data->status == 'NEW') continue;
		switch($data->status){
			case 'PREVIEW':
				$status = 'Previewed';
				break;
			case 'PROCESSING':
				if($time_diff > 10800){
					$status = '<img src="js-i2b2/cells/plugins/community/PatientSetDownloader/assets/warning.gif" align="absbottom"/> <em>Timed Out</em><br/>Processed: ' . $data->payload . " [<a href=\"#\" onclick=\"i2b2.PatientSetDownloader.cancelJob('".$job_id."');return false;\">Cancel</a>]";
				} else {
					$status = '<img src="js-i2b2/cells/plugins/community/PatientSetDownloader/assets/ajaxicon.gif" align="absbottom"/> Processing: ' . $data->payload . " [<a href=\"#\" onclick=\"i2b2.PatientSetDownloader.cancelJob('".$job_id."');return false;\">Cancel</a>]";
				}
				break;
			case 'FINISHED':
				$status = "<strong>Completed: </strong><a style=\"color:#000;text-decoration:underline;font-weight:normal;\" href=\"#\" onclick=\"javascript:i2b2.PatientSetDownloader.downloadJob('".$job_id."');return false;\">Download</a>";
				if(isAdmin($user_id)){
					$status .= "<br/><a href=\"#\" style=\"color:#000;text-decoration:underline;font-weight:normal;\" onclick=\"i2b2.PatientSetDownloader.rerunJob('".$job_id."');return false;\">Re-run</a>";
				}
				break;
			case 'CANCELLED':
				$status = 'Cancelled By User';
				if(isAdmin($user_id)){
					$status .= "<br/><a href=\"#\" style=\"color:#000;text-decoration:underline;font-weight:normal;\" onclick=\"i2b2.PatientSetDownloader.rerunJob('".$job_id."');return false;\">Re-run</a>";
				}
				break;
			default:
				$status = $data->status;
		}
		if(($project == $job_project) && validate_job($data)){
			$output .= "<tr>";
			if(isAdmin($user_id)){
				$output .= "<td>".$jobfile."</td>";
				$output .= "<td>".$job_user."</td>";
			}
			$output .= "<td>".date ("F d Y H:i", $mtime)."</td>";
			$output .= "<td>";
			if(property_exists($data, 'patient_set_size')) $output .= $data->patient_set_size;
			$output .= "</td>";
			$output .= "<td style='text-align:left;'><ul>";
			$concept_count = 0;
			if(property_exists($data, 'model')){
				foreach($data->model->concepts as $key => $obj){
					if(property_exists($obj, 'textDisplay') && property_exists($obj, 'dataOption')){
						$concept_count++;
						$output .= "<li>";
						$output .= $obj->textDisplay . " [" . $obj->dataOption . "]";
						$output .= "</li>";
					}
				}
			}
			$output .= "</ul>Total # of Concepts: ".$concept_count."</td>";
			if($data->status == 'FINISHED'){
				$output .= "<td style='background: #C9F3C9;color: #0C5D0C;text-shadow:none;'>$status</td>";
			} else {
				$output .= "<td>$status</td>";
			}
			$output .= "</tr>\n";
		}
	}
	$output .= "</table>";
} else {
	$output .= "Unable to fetch history at this time. Please try again later.";
	$xmlfile = fopen($config_download_jobs_directory . '/ERROR-History-PM_request_'.$user_id.'.xml', "w");
	fwrite($xmlfile, $request_xml);
	fclose($xmlfile);

	$xmlfile = fopen($config_download_jobs_directory . '/ERROR-History-PM_response_'.$user_id.'.xml', "w");
	fwrite($xmlfile, $response_xml);
	fclose($xmlfile);
}

print $output;
?>
