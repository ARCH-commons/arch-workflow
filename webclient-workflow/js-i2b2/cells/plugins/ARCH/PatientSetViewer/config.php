<?php
// Configuration

$CONFIG = array(
    "csv_filename_prefix" => "i2b2_arch_", // prefix for CSV filename
    "logging" => false, // debug logging of PM request/response XML
    "os_type" => "linux", // linux or windows
    "jobs_directory" => "/opt/arch/patient_sets",
    "site_info" => array(
        "name" => "Testing/Development",
        "ssp_url" => "http://sspapidev:8080/ssp-api/",
    )
);

?>