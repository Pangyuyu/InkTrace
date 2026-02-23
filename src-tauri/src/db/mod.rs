use sqlx::{SqlitePool, migrate::MigrateDatabase};
use uuid::Uuid;

const DATABASE_URL: &str = "sqlite:inktrace.db";

pub async fn init_db() -> Result<SqlitePool, sqlx::Error> {
    println!("Initializing database...");
    if !sqlx::Sqlite::database_exists(DATABASE_URL).await? {
        println!("Database does not exist, creating...");
        sqlx::Sqlite::create_database(DATABASE_URL).await?;
        println!("Database created");
    } else {
        println!("Database already exists");
    }
    
    println!("Connecting to database pool...");
    let pool = SqlitePool::connect(DATABASE_URL).await?;
    println!("Connected to database pool");
    
    println!("Setting journal mode to DELETE...");
    sqlx::query("PRAGMA journal_mode = DELETE;")
        .execute(&pool)
        .await?;
    println!("Journal mode set");
    
    println!("Running migrations...");
    migrate_db(&pool).await?;
    println!("Migrations completed");
    
    println!("Database initialization successful");
    Ok(pool)
}

async fn migrate_db(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS content_types (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            icon TEXT,
            color TEXT,
            is_built_in INTEGER DEFAULT 0,
            sort_order INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        "#
    )
    .execute(pool)
    .await?;
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES folders(id)
        )
        "#
    )
    .execute(pool)
    .await?;
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS tags (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            color TEXT,
            usage_count INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        "#
    )
    .execute(pool)
    .await?;
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS writing_items (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            type_id TEXT NOT NULL,
            content TEXT,
            created_time TEXT,
            is_precise_time INTEGER DEFAULT 0,
            background TEXT,
            notes TEXT,
            folder_id TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (type_id) REFERENCES content_types(id),
            FOREIGN KEY (folder_id) REFERENCES folders(id)
        )
        "#
    )
    .execute(pool)
    .await?;
    
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS writing_item_tags (
            writing_item_id TEXT NOT NULL,
            tag_id TEXT NOT NULL,
            PRIMARY KEY (writing_item_id, tag_id),
            FOREIGN KEY (writing_item_id) REFERENCES writing_items(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )
        "#
    )
    .execute(pool)
    .await?;
    
    init_builtin_content_types(pool).await?;
    
    Ok(())
}

async fn init_builtin_content_types(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    let builtin_types = vec![
        ("诗", "poem", "#4CAF50"),
        ("普通文章", "article", "#2196F3"),
        ("技术文章", "tech", "#FF9800"),
        ("时事评论", "comment", "#F44336"),
        ("散记", "note", "#9C27B0"),
        ("人生感悟", "reflection", "#607D8B"),
    ];
    
    for (i, (name, icon, color)) in builtin_types.iter().enumerate() {
        let id = Uuid::new_v4().to_string();
        sqlx::query(
            r#"
            INSERT OR IGNORE INTO content_types (id, name, icon, color, is_built_in, sort_order)
            VALUES (?, ?, ?, ?, 1, ?)
            "#
        )
        .bind(&id)
        .bind(name)
        .bind(icon)
        .bind(color)
        .bind(i as i32)
        .execute(pool)
        .await?;
    }
    
    Ok(())
}