<?php

include_once('config.php');

function get_user_configuration_XML($redirect_url, $domain, $username, $session){

$xml = <<<XML
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <i2b2:request xmlns:i2b2="http://www.i2b2.org/xsd/hive/msg/1.1/" xmlns:pm="http://www.i2b2.org/xsd/cell/pm/1.1/">
    <message_header>
        <proxy>
            <redirect_url>I2B2_PM_URI</redirect_url>
        </proxy>

        <i2b2_version_compatible>1.1</i2b2_version_compatible>
        <hl7_version_compatible>2.4</hl7_version_compatible>
        <sending_application>
            <application_name>i2b2 Project Management</application_name>
            <application_version>1.6</application_version>
        </sending_application>
        <sending_facility>
            <facility_name>i2b2 Hive</facility_name>
        </sending_facility>
        <receiving_application>
            <application_name>Project Management Cell</application_name>
            <application_version>1.6</application_version>
        </receiving_application>
        <receiving_facility>
            <facility_name>i2b2 Hive</facility_name>
        </receiving_facility>
        <datetime_of_message>2016-04-06T14:24:53-04:00</datetime_of_message>
        <security>
                <domain>I2B2_DOMAIN</domain>
                <username>I2B2_USERID</username>
                I2B2_LOGIN_PASSWORD
        </security>
        <message_control_id>
            <message_num>DcKfdAa0PzbNHiQtYE64N</message_num>
            <instance_num>0</instance_num>
        </message_control_id>
        <processing_id>
            <processing_id>P</processing_id>
            <processing_mode>I</processing_mode>
        </processing_id>
        <accept_acknowledgement_type>AL</accept_acknowledgement_type>
        <application_acknowledgement_type>AL</application_acknowledgement_type>
        <country_code>US</country_code>
        <project_id>undefined</project_id>
    </message_header>
    <request_header>
        <result_waittime_ms>180000</result_waittime_ms>
    </request_header>
    <message_body>
        <pm:get_user_configuration>
            <project>undefined</project>
        </pm:get_user_configuration>
    </message_body>
  </i2b2:request>
XML;

$xml = str_replace("I2B2_PM_URI", $redirect_url, $xml);
$xml = str_replace("I2B2_DOMAIN", $domain, $xml);
$xml = str_replace("I2B2_USERID", $username, $xml);
$xml = str_replace("I2B2_LOGIN_PASSWORD", $session, $xml);
return $xml;
}


function post_XML($request_xml, $target_url){

  $ch = curl_init($target_url);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: text/xml'));
  curl_setopt($ch, CURLOPT_POSTFIELDS, "$request_xml");
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $response = curl_exec($ch);

  if($CONFIG['logging']){
    $xmlfile = fopen($CONFIG['jobs_directory'] . '/PM_request_' . $job_id . '.xml', "w");
    fwrite($xmlfile, $request_xml);
    fclose($xmlfile);

    $xmlfile = fopen($CONFIG['jobs_directory'] . '/PM_response_' . $job_id . '.xml', "w");
    fwrite($xmlfile, $response);
    fclose($xmlfile);
  }


  return $response;
}

function result_status_error($response_xml){
  if(preg_match("/<status type=\"ERROR\">/i", $response_xml, $match)){
    return true;
  }
  return false;
}

function result_status_success($response_xml){
  if(preg_match("/<status type=\"DONE\">PM processing completed<\/status>/i", $response_xml, $match)){
    return true;
  }
  return false;
}

function validate_job($data){
  if(property_exists($data, 'patient_set_size')){
    if($data->patient_set_size > 0){
      return true;
    }
  }
  return false;
}

function get_job($job_id) {
  $file = file_get_contents($CONFIG['jobs_directory'] . '/' . $job_id . '.job');
  return json_decode($file);
}

function update_job_status($job_id, $status, $payload){
  $data = get_job($job_id);
  $data->status = $status;
  $data->payload = $payload;

  $jobfile = fopen($CONFIG['jobs_directory'] . '/' . $job_id . '.job', "w");
  fwrite($jobfile, json_encode($data));
  fclose($jobfile);
}




?>