# Diagrama de Modelado de Datos - Laravel

```mermaid
erDiagram
    users {
        bigint id PK
        string name
        string email UK
        timestamp email_verified_at
        string password
        string remember_token
        bigint current_team_id FK
        string profile_photo_path
        timestamp created_at
        timestamp updated_at
    }

    password_reset_tokens {
        string email PK
        string token
        timestamp created_at
    }

    sessions {
        string id PK
        bigint user_id FK
        string ip_address
        text user_agent
        longtext payload
        integer last_activity
    }

    personal_access_tokens {
        bigint id PK
        string tokenable_type
        bigint tokenable_id
        string name
        string token UK
        text abilities
        timestamp last_used_at
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    flights {
        bigint id PK
        timestamp created_at
        timestamp updated_at
    }

    cache {
        string key PK
        mediumtext value
        integer expiration
    }

    cache_locks {
        string key PK
        string owner
        integer expiration
    }

    jobs {
        bigint id PK
        string queue
        longtext payload
        tinyint attempts
        integer reserved_at
        integer available_at
        integer created_at
    }

    job_batches {
        string id PK
        string name
        integer total_jobs
        integer pending_jobs
        integer failed_jobs
        longtext failed_job_ids
        mediumtext options
        integer cancelled_at
        integer created_at
        integer finished_at
    }

    failed_jobs {
        bigint id PK
        string uuid UK
        text connection
        text queue
        longtext payload
        longtext exception
        timestamp failed_at
    }

    %% Relaciones
    users ||--o{ sessions : "has many"
    users ||--o{ personal_access_tokens : "has many"
    users ||--o{ password_reset_tokens : "has many"
```

## Descripción de las Tablas

### Tablas Principales
- **users**: Gestión de usuarios con autenticación y perfiles
- **flights**: Tabla de ejemplo (actualmente vacía)

### Tablas de Autenticación y Seguridad
- **password_reset_tokens**: Tokens para reseteo de contraseñas
- **sessions**: Sesiones de usuario activas
- **personal_access_tokens**: Tokens de API personal (Laravel Sanctum)

### Tablas del Sistema
- **cache/cache_locks**: Sistema de caché de Laravel
- **jobs/job_batches/failed_jobs**: Sistema de colas de trabajo

### Relaciones Identificadas
- Un usuario puede tener múltiples sesiones activas
- Un usuario puede tener múltiples tokens de acceso personal
- Un usuario puede tener múltiples tokens de reseteo de contraseña