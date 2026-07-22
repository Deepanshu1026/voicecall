CREATE TABLE cases (
    id INT AUTO_INCREMENT PRIMARY KEY,

    client_name VARCHAR(150) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    case_type VARCHAR(100) NOT NULL,

    created_by INT NOT NULL,
    assigned_manager INT DEFAULT NULL,
    assigned_employee INT DEFAULT NULL,

    status ENUM(
        'pending',
        'assigned',
        'in-progress',
        'docs-needed',
        'docs-collected',
        'completed',
        'reopened'
    ) NOT NULL DEFAULT 'pending',

    priority ENUM('low','normal','high') DEFAULT 'normal',

    remarks TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
