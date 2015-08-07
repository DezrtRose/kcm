<?php

class GCM {

    private $android_platform_id = 'android';
    private $iOS_platform_id = 'ios';

    public $message = array();
    public $registration_ids;
    public $db_con;

    public function __construct()
    {
        date_default_timezone_set('Asia/Kathmandu');
    }

    public function create_connection()
    {
        $this->db_con = mysqli_connect(DB_SERVER, DB_USER, DB_PASS, DB_NAME);
        return true;
    }

    public function sendNotification() {
        $this->create_connection();

        $notifications = "select * from `app_notifications` WHERE `status` = 'Pending'";

        $notifications = mysqli_query($this->db_con, $notifications);

        while($notification = mysqli_fetch_assoc($notifications)) {
            $notification_id = $notification['id'];
            if($notification['news_id']) {
                $notification_type = 'News';
                $news_query = "select `id`, `content_title`, `content_alias`, `sub_title` from `contents` where `id` = {$notification['news_id']}";
                $news_data = mysqli_query($this->db_con, $news_query);//print_r($news_data);die;
                if($news_data) {
                    $news_data = mysqli_fetch_assoc($news_data);
                    $notification_message = $news_data['content_title'];
                    $notification_title = 'KCM APP';
                    $alias = $news_data['content_alias'];
                } else {
                    continue;
                }
            } else {
                $notification_type = 'LMS';
                $alias = '';
                $notification_message = $notification['notification_message'];
                $notification_title = $notification['notification_title'];
            }
            $android_deveice_ids = $this->_get_all_registration_ids($this->android_platform_id, $notification['notification_type'], $notification['notification_for']);
            $iOS_deveice_ids = $this->_get_all_registration_ids($this->iOS_platform_id, $notification['notification_type'], $notification['notification_for']);

            $android_message = array(
                'message_id' => time() . '-' . $notification_id,
                'message' => $notification_message,
                'title' => $notification_title,
                'type' => $notification_type,
                'alias' => $alias
            );

            $iOS_message = $notification_message;

            if(!empty($android_deveice_ids)) {
                $this->_send_android_notification($android_deveice_ids, $android_message);
            }

            if(!empty($iOS_deveice_ids)) {
                $this->_send_iOS_notification($iOS_deveice_ids, $iOS_message);
            }

            // update status of notification to sent
            /*$update_query = "UPDATE `app_notifications` SET `status` = 'Sent' WHERE `id` = {$notification_id}";
            mysqli_query($this->db_con, $update_query);*/
        }
        $this->close_connection();
    }

    public function registerGcmUser($user_type, $email, $gcm_reg_id, $platform_type, $platform_version) {
        $this->create_connection();
        $qry_result=mysqli_query($this->db_con, "SELECT * FROM gcm_users WHERE gcm_regid='{$gcm_reg_id}'") or die("QUERY ERROR Single=>".mysqli_error($this->db_con));
        $users=mysqli_fetch_assoc($qry_result);
        if(count($users)>0) {
            if($users['email'] == $email && $users['user_type'] == $user_type) {
                return false;
            } else {
                $result = mysqli_query($this->db_con, "UPDATE `gcm_users` SET `user_type` = '{$user_type}', `email` = '{$email}' WHERE `id` = {$users['id']}");
            }
        } else {
            $result = mysqli_query($this->db_con, "INSERT INTO gcm_users(user_type, email, gcm_regid, platform_type, platform_version, created_at) VALUES('$user_type', '$email', '$gcm_reg_id', '$platform_type', '$platform_version', NOW())");
        }
        $this->close_connection();

        return ($result) ? true : false;
    }

    /**
     * Get the application registration ids
     * @param type $platform_type integer
     * @return type array
     */
    private function _get_all_registration_ids($platform_type = NULL, $user_type, $notification_for) {
        // var_dump($notification_for);die;
        if($notification_for != '') {
            $all_emails = json_decode($notification_for, true);
            if($all_emails) {
                foreach($all_emails as $email) {
                    $emails[] = $email['email'];
                }
                $emails = implode("','",$emails);
            }
        }
        $reg_ids = array();
        $query = "SELECT gcm_regid FROM gcm_users WHERE platform_type = '{$platform_type}'";

        // filter by user type
        if($user_type != 'All') {
            $query .= " AND user_type = '$user_type'";

            // filter notification based on the user emails. This is just for the LMS notifications.
            if(isset($emails)) {
                $query .= " AND email IN ('$emails')";
            }
        }

        $registrations = mysqli_query($this->db_con, $query);

        if($registrations) {
            while($registration =  mysqli_fetch_assoc($registrations)) {
                $reg_ids[] = $registration['gcm_regid'];
            }
        }
        return $reg_ids;
    }

    /**
     * Push android notification to google cloud messaging API
     * @param type $registration_ids array
     * @param type $message array
     */
    private function _send_android_notification($registration_ids, $message) {
        $url = 'https://android.googleapis.com/gcm/send';

        if(!is_array($registration_ids)) {
            $registration_ids = array($registration_ids);
        }

        $fields = array(
            'registration_ids' => $registration_ids,
            'data' => $message
        );


        $headers = array(
            'Authorization: key= AIzaSyDlRtle-HiWwKJV64EB0TV7wSuidDYW1-4',
            'Content-Type: application/json'
        );
        // Open connection
        $ch = curl_init();

        // Set the url, number of POST vars, POST data
        curl_setopt($ch, CURLOPT_URL, $url);

        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        // Disabling SSL Certificate support temporarly
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));

        // Execute post
        $result = curl_exec($ch);echo ($result);
        if ($result === FALSE) {
            die('Curl failed: ' . curl_error($ch));
        }

        // Close connection
        curl_close($ch);
        sleep(5);
        return true;
    }

    /**
     * Push iOS notification to apple push notification service
     * @param type $registration_ids array
     * @param type $message string
     * @param type $additional_message array
     */
    private function _send_iOS_notification($registration_ids, $message, $additional_message = NULL) {
        require_once 'apn/ApnsPHP/Autoload.php';
        $push = new ApnsPHP_Push(
            ApnsPHP_Abstract::ENVIRONMENT_SANDBOX,
            'certificates/apns-dev.pem'
        );

        // Set the Provider Certificate passphrase
        // $push->setProviderCertificatePassphrase('Nirvana3');

        // Set the Root Certificate Autority to verify the Apple remote peer
        // $push->setRootCertificationAuthority('entrust_2048_ca.cer');

        // Connect to the Apple Push Notification Service
        $push->connect();
        foreach($registration_ids as $key => $registration_id) {
            // Instantiate a new Message with a single recipient
            $apn_message = new ApnsPHP_Message($registration_id);

            // Set badge icon to "3"
            $apn_message->setBadge($key);

            // Set a simple welcome text
            $apn_message->setText($message);

            // Play the default sound
            $apn_message->setSound();

            // Add the message to the message queue
            $push->add($apn_message);

            // Send all messages in the message queue
            $push->send();
        }
        // Disconnect from the Apple Push Notification Service
        $push->disconnect();

        // Examine the error message container
        $aErrorQueue = $push->getErrors();
        if (!empty($aErrorQueue)) {
            var_dump($aErrorQueue);
        } else {
            echo 'sent';
        }
    }

    public function close_connection()
    {
        mysqli_close($this->db_con);
        return true;
    }
}