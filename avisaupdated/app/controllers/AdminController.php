<?php
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/db2.php';
require_once __DIR__ . '/../helpers/auth.php';

class AdminController
{
    // Get Daily Logins from DB2 (Async)
    public function getDailyLogins()
    {
        require_auth();
        // Allow Admin and Agent (Agent has their own page but logic is similar, we can reuse or separate)
        // For now, restricting to Admin based on file location, or check role.
        if (!in_array($_SESSION['role'], ['admin', 'manager', 'agent'])) {
            return ['error' => 'Unauthorized'];
        }

        $conn = db2();
        
        $limit = 10;
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $offset = ($page - 1) * $limit;

        $whereClause = "u.specialization <> 'guest'";
        
        $startDate = $_GET['start_date'] ?? '';
        $endDate = $_GET['end_date'] ?? '';
        
        if (!empty($startDate)) {
            $startDate = $conn->real_escape_string($startDate);
            $whereClause .= " AND DATE(u.created_at) >= '$startDate'";
        }
        
        if (!empty($endDate)) {
            $endDate = $conn->real_escape_string($endDate);
            $whereClause .= " AND DATE(u.created_at) <= '$endDate'";
        }

        // Count Total
        $countQuery = "SELECT COUNT(*) as total FROM users u WHERE $whereClause";
        $countResult = $conn->query($countQuery);
        $totalRecords = $countResult ? $countResult->fetch_assoc()['total'] : 0;
        $totalPages = ceil($totalRecords / $limit);

        // Fetch Data
        $query = "
            SELECT 
                u.user_name, 
                u.login_from,
                u.user_email,
                u.country_code,
                u.user_mobile, 
                u.created_at
            FROM users u
            WHERE $whereClause
            ORDER BY u.created_at DESC
            LIMIT 5000
        ";

        $result = $conn->query($query);
        $rows = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
        }

        return [
            'success' => true,
            'data' => $rows,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_records' => $totalRecords
            ]
        ];
    }
}
?>
