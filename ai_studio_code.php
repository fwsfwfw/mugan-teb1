<?php
/**
 * TorahTube Backend Cache, Data & Payment Manager - v12 (Ultimate Sync & Security)
 * תפקיד: ניהול זיכרון אישי לכל משתמש, אימות תשלומים, לייקים גלובליים ומעקב פעילות
 * שיפור: הפרדה מוחלטת בין חשבונות גוגל באמצעות תיקיות משתמש ייחודיות
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

// --- הגדרות חשובות (נשמר בדיוק כפי שהיה) ---
define('PAYPAL_CLIENT_ID', 'AXOdN4CoojLMlhcFcLT-JRWZtbvxFWZlGrh2vpuAl7tRJnlWLxxq24xCDL03XMJKbdU5ONJtpJRl9Gj9');
define('PAYPAL_SECRET', 'EId5FCmMpwBczYMyXH25R-nmcttxpVOKtvLA7hpH2qQr-DOtqBtzBomMOhhTxNJVR8jfQlxnee5-sohF');
define('PAYPAL_MODE', 'live'); 
// -----------------------

$cacheDir = __DIR__ . '/cache_data';
$paymentsFile = $cacheDir . '/payments.json';
if (!file_exists($cacheDir)) { mkdir($cacheDir, 0777, true); }

$action = $_GET['action'] ?? '';
$userEmail = $_GET['user_email'] ?? '';

// פונקציה לקבלת נתיב קובץ מבודד למשתמש
function getUserFilePath($dir, $userEmail, $key) {
    if (!$userEmail) {
        return $dir . '/' . md5($key) . '.json';
    }
    $userDir = $dir . '/user_' . md5($userEmail);
    if (!file_exists($userDir)) { mkdir($userDir, 0777, true); }
    return $userDir . '/' . md5($key) . '.json';
}

// --- פונקציות עזר של פייפאל (ללא שינוי) ---
function getPayPalAccessToken() {
    $url = PAYPAL_MODE === 'sandbox' ? "https://api-m.sandbox.paypal.com/v1/oauth2/token" : "https://api-m.paypal.com/v1/oauth2/token";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERPWD, PAYPAL_CLIENT_ID . ":" . PAYPAL_SECRET);
    curl_setopt($ch, CURLOPT_POSTFIELDS, "grant_type=client_credentials");
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($httpCode !== 200) return ["error" => "Auth Failed (HTTP $httpCode)"];
    $json = json_decode($result);
    return ["token" => $json->access_token ?? null];
}

function verifyPayPalOrder($orderId) {
    $auth = getPayPalAccessToken();
    if (isset($auth['error'])) return ["success" => false, "message" => $auth['error']];
    $accessToken = $auth['token'];
    $url = PAYPAL_MODE === 'sandbox' ? "https://api-m.sandbox.paypal.com/v2/checkout/orders/$orderId" : "https://api-m.paypal.com/v2/checkout/orders/$orderId";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json", "Authorization: Bearer $accessToken"));
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($httpCode !== 200) return ["success" => false, "message" => "Lookup Failed"];
    $json = json_decode($result);
    $status = $json->status ?? 'UNKNOWN';
    return ["success" => ($status === 'COMPLETED' || $status === 'APPROVED'), "status" => $status];
}

// --- ניהול בקשות ---
switch ($action) {
    case 'check_payment':
        $email = $_GET['email'] ?? '';
        if ($email === 'yehokarpel100@gmail.com') {
            echo json_encode(["paid" => true, "admin" => true]);
            break;
        }
        $payments = [];
        if (file_exists($paymentsFile)) {
            $fp = fopen($paymentsFile, 'r');
            if ($fp && flock($fp, LOCK_SH)) {
                $stat = fstat($fp);
                $filesize = $stat['size'];
                $content = $filesize > 0 ? fread($fp, $filesize) : '';
                flock($fp, LOCK_UN);
                fclose($fp);
                $payments = $content ? json_decode($content, true) : [];
                if (!is_array($payments)) $payments = [];
            } else {
                if ($fp) fclose($fp);
            }
        }
        echo json_encode(["paid" => isset($payments[$email])]);
        break;

    case 'record_payment':
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';
        $orderId = $input['orderId'] ?? '';
        if ($email && $orderId) {
            $verification = verifyPayPalOrder($orderId);
            if ($verification['success']) {
                $fp = fopen($paymentsFile, 'c+');
                if ($fp && flock($fp, LOCK_EX)) {
                    $stat = fstat($fp);
                    $filesize = $stat['size'];
                    $content = $filesize > 0 ? fread($fp, $filesize) : '';
                    $payments = $content ? json_decode($content, true) : [];
                    if (!is_array($payments)) $payments = [];
                    
                    $payments[$email] = ["orderId" => $orderId, "date" => date('Y-m-d H:i:s'), "verified" => true];
                    $json = json_encode($payments, JSON_PRETTY_PRINT);
                    
                    if ($json !== false) {
                        ftruncate($fp, 0);
                        rewind($fp);
                        fwrite($fp, $json);
                        fflush($fp);
                        echo json_encode(["status" => "success", "message" => "Verified!"]);
                    } else {
                        echo json_encode(["status" => "error", "message" => "JSON encode failed"]);
                    }
                    flock($fp, LOCK_UN);
                    fclose($fp);
                } else {
                    if ($fp) fclose($fp);
                    echo json_encode(["status" => "error", "message" => "Could not lock payments file"]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => $verification['message']]);
            }
        }
        break;

    case 'set_cache':
        $key = $_GET['key'] ?? '';
        $data = file_get_contents('php://input');
        if ($key && $data) {
            $filename = getUserFilePath($cacheDir, $userEmail, $key);
            file_put_contents($filename, $data, LOCK_EX);
            echo json_encode(["status" => "success", "key" => $key, "isolated" => (bool)$userEmail]);
        } else {
            echo json_encode(["status" => "error", "message" => "Missing key or data"]);
        }
        break;

    case 'get_cache':
        $key = $_GET['key'] ?? '';
        $filename = getUserFilePath($cacheDir, $userEmail, $key);
        if (file_exists($filename)) {
            $fp = fopen($filename, 'r');
            if ($fp && flock($fp, LOCK_SH)) {
                $stat = fstat($fp);
                $filesize = $stat['size'];
                $content = $filesize > 0 ? fread($fp, $filesize) : '';
                flock($fp, LOCK_UN);
                fclose($fp);
                echo $content;
            } else {
                echo json_encode(["status" => "not_found"]);
            }
        } else {
            echo json_encode(["status" => "not_found"]);
        }
        break;

    case 'toggle_like':
        $input = json_decode(file_get_contents('php://input'), true);
        $videoId = $input['videoId'] ?? $_GET['videoId'] ?? '';
        $isLiked = isset($input['isLiked']) ? (bool)$input['isLiked'] : (($_GET['isLiked'] ?? 'false') === 'true');
        
        if ($videoId) {
            $likesFile = $cacheDir . '/global_likes_' . md5($videoId) . '.json';
            
            $fp = fopen($likesFile, 'c+');
            if ($fp && flock($fp, LOCK_EX)) {
                $stat = fstat($fp);
                $filesize = $stat['size'];
                $content = $filesize > 0 ? fread($fp, $filesize) : '0';
                $count = (int)$content;
                if ($isLiked) $count++;
                else $count = max(0, $count - 1);
                
                ftruncate($fp, 0);
                rewind($fp);
                fwrite($fp, (string)$count);
                fflush($fp);
                flock($fp, LOCK_UN);
                fclose($fp);
                echo json_encode(["status" => "success", "likes" => $count]);
            } else {
                echo json_encode(["status" => "error", "message" => "Could not lock file"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Missing videoId"]);
        }
        break;

    case 'user_activity_add':
        $type = $_GET['type'] ?? '';
        $data = json_decode(file_get_contents('php://input'), true);
        if ($type && $data && $userEmail) {
            $userDir = $cacheDir . '/user_' . md5($userEmail);
            if (!file_exists($userDir)) { mkdir($userDir, 0777, true); }
            $file = $userDir . '/data.json';
            
            $fp = fopen($file, 'c+');
            if ($fp && flock($fp, LOCK_EX)) {
                $stat = fstat($fp);
                $filesize = $stat['size'];
                $content = $filesize > 0 ? fread($fp, $filesize) : '';
                $userData = $content ? json_decode($content, true) : [];
                if (!is_array($userData)) $userData = [];
                if (!isset($userData[$type]) || !is_array($userData[$type])) $userData[$type] = [];
                
                // Check for duplicates based on videoId or string value
                $itemId = $data['id']['videoId'] ?? $data['id'] ?? (is_string($data) ? $data : null);
                if ($itemId) {
                    $userData[$type] = array_filter($userData[$type], function($item) use ($itemId) {
                        $existingId = $item['id']['videoId'] ?? $item['id'] ?? (is_string($item) ? $item : null);
                        return $existingId !== $itemId;
                    });
                    $userData[$type] = array_values($userData[$type]); // Re-index array after filter
                }
                
                array_unshift($userData[$type], $data);
                $userData[$type] = array_slice($userData[$type], 0, 100); // Limit to 100 items
                
                $json = json_encode($userData, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
                if ($json !== false) {
                    ftruncate($fp, 0);
                    rewind($fp);
                    fwrite($fp, $json);
                    fflush($fp);
                    echo json_encode(["status" => "success", "count" => count($userData[$type])]);
                } else {
                    echo json_encode(["status" => "error", "message" => "JSON encode failed: " . json_last_error_msg()]);
                }
                flock($fp, LOCK_UN);
                fclose($fp);
            } else {
                echo json_encode(["status" => "error", "message" => "Could not lock file"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Missing type, data or user_email"]);
        }
        break;

    case 'user_activity_remove':
        $type = $_GET['type'] ?? '';
        $itemId = $_GET['itemId'] ?? '';
        if ($type && $itemId && $userEmail) {
            $userDir = $cacheDir . '/user_' . md5($userEmail);
            $file = $userDir . '/data.json';
            if (file_exists($file)) {
                $fp = fopen($file, 'c+');
                if ($fp && flock($fp, LOCK_EX)) {
                    $stat = fstat($fp);
                    $filesize = $stat['size'];
                    $content = $filesize > 0 ? fread($fp, $filesize) : '';
                    $userData = $content ? json_decode($content, true) : [];
                    
                    if (is_array($userData) && isset($userData[$type]) && is_array($userData[$type])) {
                        $userData[$type] = array_filter($userData[$type], function($item) use ($itemId) {
                            $existingId = $item['id']['videoId'] ?? $item['id'] ?? (is_string($item) ? $item : null);
                            return $existingId !== $itemId;
                        });
                        $userData[$type] = array_values($userData[$type]); // Re-index array after filter
                        
                        $json = json_encode($userData, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
                        if ($json !== false) {
                            ftruncate($fp, 0);
                            rewind($fp);
                            fwrite($fp, $json);
                            fflush($fp);
                        }
                    }
                    flock($fp, LOCK_UN);
                    fclose($fp);
                }
            }
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Missing type, itemId or user_email"]);
        }
        break;

    case 'user_activity_get':
        $type = $_GET['type'] ?? '';
        if ($type && $userEmail) {
            $userDir = $cacheDir . '/user_' . md5($userEmail);
            $file = $userDir . '/data.json';
            if (file_exists($file)) {
                $fp = fopen($file, 'r');
                if ($fp && flock($fp, LOCK_SH)) {
                    $stat = fstat($fp);
                    $filesize = $stat['size'];
                    $content = $filesize > 0 ? fread($fp, $filesize) : '';
                    flock($fp, LOCK_UN);
                    fclose($fp);
                    
                    $userData = $content ? json_decode($content, true) : [];
                    if (is_array($userData) && isset($userData[$type])) {
                        echo json_encode($userData[$type]);
                    } else {
                        echo json_encode([]);
                    }
                } else {
                    echo json_encode([]);
                }
            } else {
                echo json_encode([]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Missing type or user_email"]);
        }
        break;

    case 'get_likes':
        $videoId = $_GET['videoId'] ?? '';
        if ($videoId) {
            $likesFile = $cacheDir . '/global_likes_' . md5($videoId) . '.json';
            if (file_exists($likesFile)) {
                $fp = fopen($likesFile, 'r');
                if ($fp && flock($fp, LOCK_SH)) {
                    $stat = fstat($fp);
                    $filesize = $stat['size'];
                    $content = $filesize > 0 ? fread($fp, $filesize) : '0';
                    flock($fp, LOCK_UN);
                    fclose($fp);
                    echo json_encode(["likes" => (int)$content]);
                } else {
                    echo json_encode(["likes" => 0]);
                }
            } else {
                echo json_encode(["likes" => 0]);
            }
        }
        break;

    case 'track_user':
        $userId = $_GET['userId'] ?? '';
        if ($userId) {
            $activeDir = $cacheDir . '/active_sessions';
            if (!file_exists($activeDir)) mkdir($activeDir, 0777, true);
            file_put_contents($activeDir . '/' . md5($userId) . '.txt', time());
        }
        echo json_encode(["status" => "success"]);
        break;

    case 'get_active_users':
        $activeDir = $cacheDir . '/active_sessions';
        $count = 0;
        if (file_exists($activeDir)) {
            $files = scandir($activeDir);
            $now = time();
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                $timestamp = (int)file_get_contents($activeDir . '/' . $file);
                if ($now - $timestamp < 300) { $count++; } 
                else { unlink($activeDir . '/' . $file); }
            }
        }
        echo json_encode(["active_users" => $count, "activeUsers" => $count]);
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Action not found"]);
        break;
}
