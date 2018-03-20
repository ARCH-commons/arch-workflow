<?php
/**
 * arch-portal.php - helper to load data sets into the ARCH portal
 * Stanley Boykin, Nich Wattanasin
 * Created: 10/30/2017
 */

require_once('config.php');

try {
    if (!isset($_POST['api'])) {
        throw new RuntimeException('ARCH API type not set.  Contact ARCH development team as this is an internal error.');
    }
    if (!isset($CONFIG['jobs_directory'])) {
        throw new RuntimeException('Jobs directory not set.');
    }
    if (!isset($CONFIG['site_info']['ssp_url'])) {
        throw new RuntimeException('ARCH Site API URL not set.  Contact ARCH development team to properly configure plugin');
    }

    $api = $_POST['api'];
    $portalUser = $_SERVER['PHP_AUTH_USER'];
    $portalPassword = $_SERVER['PHP_AUTH_PW'];

    switch ($api) {
        case 'mysite':
            $action = 'GET';
            if (empty($CONFIG['site'])) {
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
            if (isset($_GET['site']) && !empty($_GET['site'])) {
                $endpoint .= '?short_name=' . $_GET['site'];
            }
            break;
        case 'study':
            $action = 'GET';
            if (isset($_GET['study']) && !empty($_GET['study'])) {
                $endpoint = $CONFIG['ssp_url'] . 'api/cloud/study/' . $_GET['study'];
            }
            break;
        case 'lds':
            $action = 'POST';
            if (isset($_POST['arch_id']) && !empty($_POST['arch_id'])) {
                    $endpoint = $CONFIG['site_info']['ssp_url'] . 'api/lds/' . $_POST['arch_id'];
            }
            break;

    }

    if ($action == 'GET') {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $endpoint);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($ch, CURLOPT_USERPWD, $portalUser . ':' . $portalPassword);
        $result = curl_exec($ch);
        curl_close($ch);
        header('Content-Type: application/json');
        echo $result;
    } else if ($action == 'POST') {
        $upload_dir = $CONFIG['jobs_directory'];
        $data_file = join(DIRECTORY_SEPARATOR, array($upload_dir, 'csv_' . $_POST['job_id'] . '.csv'));
        $data_file_size = filesize($data_file);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $endpoint);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($ch, CURLOPT_USERPWD, $portalUser . ':' . $portalPassword);
        $postData = array();
        $postData['uploadedFile'] = new CURLFile($data_file, 'text/csv');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        echo "Submitting the following data file to portal API: " . $data_file;
        $output = curl_exec($ch);
        $info = curl_getinfo($ch);
        if ($output == false || $info['http_code'] != 200) {
            $resultText = 'Call to portal API [' . $endpoint . '] returned no data [' . $info['http_code'] . ']';
            if (curl_error($ch)) {
                $resultText .= "\n" . curl_error($ch);
            }
            throw new RuntimeException($resultText);
        } else {
            header('Content-Type: application/json');
            echo $output;
            http_response_code(200);
        }
        curl_close($ch);
    }
} catch (Exception $e) {
    error_log('arch-portal: ' . $e->getMessage());
    http_response_code(500);
}
?>


