<?php
/**
 * TorahTube Backend Cache, Data & Payment Manager - v12 (Ultimate Sync & Security)
 * תפקיד: ניהול זיכרון אישי לכל משתמש, אימות תשלומים, לייקים גלובליים ומעקב פעילות
 */

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

// --- הגדרות חשובות (נשמר בדיוק כפי שהיה) ---
define('PAYPAL_CLIENT_ID', 'AXOdN4CoojLMlhcFcLT-JRWZtbvxFWZlGrh2vpuAl7tRJnlWLxxq24xCDL03XMJKbdU5ONJtpJRl9Gj9');
define('PAYPAL_SECRET', 'EId5FCmMpwBczYMyXH25R-nmcttxpVOKtvLA7hpH2qQr-DOtqBtzBomMOhhTxNJVR8jfQlxnee5-sohF');
define('PAYPAL_MODE', 'live'); 
define('JWT_SECRET', 'torah_tube_super_secret_key_2026_change_this_in_production');
// -----------------------

// --- JWT Functions ---
function base64UrlEncode($text) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($text));
}

function createJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + (86400 * 30); // 30 days expiration
    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode(json_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($jwt) {
    $tokenParts = explode('.', $jwt);
    if (count($tokenParts) != 3) return false;
    $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
    $signatureProvided = $tokenParts[2];
    
    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);
    
    if ($base64UrlSignature === $signatureProvided) {
        $payloadData = json_decode($payload, true);
        if (isset($payloadData['exp']) && $payloadData['exp'] > time()) {
            return $payloadData;
        }
    }
    return false;
}
// -----------------------

$cacheDir = __DIR__ . '/cache_data';
$paymentsFile = $cacheDir . '/payments.json';
if (!file_exists($cacheDir)) { mkdir($cacheDir, 0777, true); }

$action = $_GET['action'] ?? '';

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
    case 'login':
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';
        $name = $input['name'] ?? '';
        $avatar = $input['avatar'] ?? '';
        
        if ($email) {
            $jwt = createJWT(['email' => $email, 'name' => $name, 'avatar' => $avatar]);
            // Set HTTP-only cookie with SameSite=None for cross-origin
            header('Set-Cookie: auth_token=' . $jwt . '; expires=' . gmdate('D, d-M-Y H:i:s T', time() + (86400 * 30)) . '; path=/; secure; HttpOnly; SameSite=None');
            echo json_encode(["status" => "success", "token" => $jwt, "user" => ['email' => $email, 'name' => $name, 'avatar' => $avatar]]);
        } else {
            echo json_encode(["status" => "error", "message" => "Missing email"]);
        }
        break;

    case 'verify_session':
        $token = $_COOKIE['auth_token'] ?? '';
        if (!$token) {
            $headers = apache_request_headers();
            if (isset($headers['Authorization'])) {
                $token = str_replace('Bearer ', '', $headers['Authorization']);
            }
        }
        
        if ($token) {
            $payload = verifyJWT($token);
            if ($payload) {
                echo json_encode(["status" => "success", "user" => $payload]);
            } else {
                echo json_encode(["status" => "error", "message" => "Invalid or expired token"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "No token provided"]);
        }
        break;

    case 'logout':
        header('Set-Cookie: auth_token=; expires=' . gmdate('D, d-M-Y H:i:s T', time() - 3600) . '; path=/; secure; HttpOnly; SameSite=None');
        echo json_encode(["status" => "success"]);
        break;

    case 'check_payment':
        $email = $_GET['email'] ?? '';
        if ($email === 'yehokarpel100@gmail.com') {
            echo json_encode(["paid" => true, "admin" => true]);
            break;
        }
        $payments = file_exists($paymentsFile) ? json_decode(file_get_contents($paymentsFile), true) : [];
        echo json_encode(["paid" => isset($payments[$email])]);
        break;

    case 'record_payment':
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';
        $orderId = $input['orderId'] ?? '';
        if ($email && $orderId) {
            $verification = verifyPayPalOrder($orderId);
            if ($verification['success']) {
                $payments = file_exists($paymentsFile) ? json_decode(file_get_contents($paymentsFile), true) : [];
                $payments[$email] = ["orderId" => $orderId, "date" => date('Y-m-d H:i:s'), "verified" => true];
                file_put_contents($paymentsFile, json_encode($payments, JSON_PRETTY_PRINT));
                echo json_encode(["status" => "success", "message" => "Verified!"]);
            } else {
                echo json_encode(["status" => "error", "message" => $verification['message']]);
            }
        }
        break;

    case 'set_cache':
        $key = $_GET['key'] ?? '';
        $userEmail = $_GET['user_email'] ?? '';
        $data = file_get_contents('php://input');
        if ($key && $data) {
            $targetDir = $cacheDir;
            if ($userEmail) {
                $targetDir .= '/user_' . md5($userEmail);
                if (!file_exists($targetDir)) { mkdir($targetDir, 0777, true); }
            }
            $filename = $targetDir . '/' . md5($key) . '.json';
            file_put_contents($filename, $data);
            echo json_encode(["status" => "success", "key" => $key]);
        } else {
            echo json_encode(["status" => "error", "message" => "Missing key or data"]);
        }
        break;

    case 'get_cache':
        $key = $_GET['key'] ?? '';
        $userEmail = $_GET['user_email'] ?? '';
        $targetDir = $cacheDir;
        if ($userEmail) {
            $targetDir .= '/user_' . md5($userEmail);
        }
        $filename = $targetDir . '/' . md5($key) . '.json';
        if (file_exists($filename)) {
            echo file_get_contents($filename);
        } else {
            echo json_encode(["status" => "not_found"]);
        }
        break;

    case 'toggle_like':
        $input = json_decode(file_get_contents('php://input'), true);
        $videoId = $input['videoId'] ?? '';
        $isLiked = $input['isLiked'] ?? false;
        if ($videoId) {
            $likesFile = $cacheDir . '/global_likes_' . md5($videoId) . '.json';
            $count = file_exists($likesFile) ? (int)file_get_contents($likesFile) : 0;
            if ($isLiked) $count++;
            else $count = max(0, $count - 1);
            file_put_contents($likesFile, (string)$count);
            echo json_encode(["status" => "success", "likes" => $count]);
        }
        break;

    case 'get_likes':
        $videoId = $_GET['videoId'] ?? '';
        if ($videoId) {
            $likesFile = $cacheDir . '/global_likes_' . md5($videoId) . '.json';
            $count = file_exists($likesFile) ? (int)file_get_contents($likesFile) : 0;
            echo json_encode(["likes" => $count]);
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
