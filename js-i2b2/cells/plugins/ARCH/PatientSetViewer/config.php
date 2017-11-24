<?php
// Configuration

$CONFIG = array(
    "csv_filename_prefix" => "i2b2_arch_", // prefix for CSV filename
    "logging" => false, // debug logging of PM request/response XML
    "os_type" => "linux", // linux or windows
    "jobs_directory" => "/opt/arch/patient_sets",
    "site_info" => array(
        "id" => "91d231d4-1847-11e6-b6ba-3e1d05defe78", // test/development site
        "name" => "Testing/Development",
        "ssp_url" => "http://sspapi:8080/schils-ssp-api/",
        "ssp_username" => "archplugin_test_site",
        "ssp_password" => "qauser"
    )
);

?>