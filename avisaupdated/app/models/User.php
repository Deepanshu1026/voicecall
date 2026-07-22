<?php

require_once __DIR__ . '/../helpers/db.php';

class User
{
    private $db;

    public function __construct()
    {
        $this->db = db();
    }

    public function findById($id)
    {
        $id = (int)$id;

        $stmt = $this->db->prepare("
            SELECT id, name, email, phone, role, status 
            FROM users 
            WHERE id = ?
            LIMIT 1
        ");

        if (!$stmt) {
            return null;
        }

        $stmt->bind_param("i", $id);
        $stmt->execute();

        return $stmt->get_result()->fetch_assoc();
    }

    // ⭐ ADD THIS — USER CREATION FUNCTION
    public function create($name, $email, $phone, $role, $password)
    {
        $db = db();

        $stmt = $db->prepare("
        INSERT INTO users (name, email, phone, role, password, status)
        VALUES (?, ?, ?, ?, ?, 'active')
    ");

        $stmt->bind_param("sssss", $name, $email, $phone, $role, $password);

        if (!$stmt->execute()) {
            return false;
        }

        return $db->insert_id;
    }


    // Optional: find by email
    public function findByEmail($email)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM users WHERE email = ? LIMIT 1
        ");

        $stmt->bind_param("s", $email);
        $stmt->execute();

        return $stmt->get_result()->fetch_assoc();
    }
}
