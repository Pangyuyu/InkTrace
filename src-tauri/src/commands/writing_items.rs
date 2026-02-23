use tauri::State;
use sqlx::SqlitePool;
use crate::models::{WritingItem, WritingItemWithTags, NewWritingItem, Tag};

#[tauri::command]
pub async fn get_writing_items(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<WritingItemWithTags>, String> {
    let items = sqlx::query_as::<_, WritingItem>(
        r#"
        SELECT * FROM writing_items
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| format!("Failed to fetch writing items: {}", e))?;
    
    let mut result = Vec::new();
    for item in items {
        let tags = sqlx::query_as::<_, Tag>(
            r#"
            SELECT t.* FROM tags t
            INNER JOIN writing_item_tags wit ON t.id = wit.tag_id
            WHERE wit.writing_item_id = ?
            "#
        )
        .bind(&item.id)
        .fetch_all(&*pool)
        .await
        .map_err(|e| format!("Failed to fetch tags for writing item {}: {}", item.id, e))?;
        
        result.push(WritingItemWithTags { item, tags });
    }
    
    Ok(result)
}

#[tauri::command]
pub async fn get_writing_item(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<WritingItemWithTags>, String> {
    let item = sqlx::query_as::<_, WritingItem>(
        r#"
        SELECT * FROM writing_items WHERE id = ?
        "#
    )
    .bind(&id)
    .fetch_optional(&*pool)
    .await
    .map_err(|e| format!("Failed to fetch writing item: {}", e))?;
    
    match item {
        Some(item) => {
            let tags = sqlx::query_as::<_, Tag>(
                r#"
                SELECT t.* FROM tags t
                INNER JOIN writing_item_tags wit ON t.id = wit.tag_id
                WHERE wit.writing_item_id = ?
                "#
            )
            .bind(&id)
            .fetch_all(&*pool)
            .await
            .map_err(|e| format!("Failed to fetch tags for writing item {}: {}", id, e))?;
            
            Ok(Some(WritingItemWithTags { item, tags }))
        }
        None => Ok(None),
    }
}

#[tauri::command]
pub async fn create_writing_item(
    pool: State<'_, SqlitePool>,
    new_item: NewWritingItem,
) -> Result<String, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"
        INSERT INTO writing_items 
        (id, title, type_id, content, created_time, is_precise_time, background, notes, folder_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&id)
    .bind(&new_item.title)
    .bind(&new_item.type_id)
    .bind(&new_item.content)
    .bind(&new_item.created_time)
    .bind(new_item.is_precise_time)
    .bind(&new_item.background)
    .bind(&new_item.notes)
    .bind(&new_item.folder_id)
    .bind(&now)
    .bind(&now)
    .execute(&*pool)
    .await
    .map_err(|e| format!("Failed to create writing item: {}", e))?;
    
    // Insert tag associations
    for tag_id in new_item.tag_ids {
        sqlx::query(
            r#"
            INSERT OR IGNORE INTO writing_item_tags (writing_item_id, tag_id)
            VALUES (?, ?)
            "#
        )
        .bind(&id)
        .bind(&tag_id)
        .execute(&*pool)
        .await
        .map_err(|e| format!("Failed to associate tag: {}", e))?;
    }
    
    Ok(id)
}

#[tauri::command]
pub async fn update_writing_item(
    pool: State<'_, SqlitePool>,
    id: String,
    updates: NewWritingItem,
) -> Result<(), String> {
    let now = chrono::Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"
        UPDATE writing_items
        SET title = ?,
            type_id = ?,
            content = ?,
            created_time = ?,
            is_precise_time = ?,
            background = ?,
            notes = ?,
            folder_id = ?,
            updated_at = ?
        WHERE id = ?
        "#
    )
    .bind(&updates.title)
    .bind(&updates.type_id)
    .bind(&updates.content)
    .bind(&updates.created_time)
    .bind(updates.is_precise_time)
    .bind(&updates.background)
    .bind(&updates.notes)
    .bind(&updates.folder_id)
    .bind(&now)
    .bind(&id)
    .execute(&*pool)
    .await
    .map_err(|e| format!("Failed to update writing item: {}", e))?;
    
    // Update tags: first remove all existing associations, then add new ones
    sqlx::query(
        r#"
        DELETE FROM writing_item_tags WHERE writing_item_id = ?
        "#
    )
    .bind(&id)
    .execute(&*pool)
    .await
    .map_err(|e| format!("Failed to remove tag associations: {}", e))?;
    
    for tag_id in updates.tag_ids {
        sqlx::query(
            r#"
            INSERT OR IGNORE INTO writing_item_tags (writing_item_id, tag_id)
            VALUES (?, ?)
            "#
        )
        .bind(&id)
        .bind(&tag_id)
        .execute(&*pool)
        .await
        .map_err(|e| format!("Failed to associate tag: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn delete_writing_item(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    sqlx::query(
        r#"
        DELETE FROM writing_items WHERE id = ?
        "#
    )
    .bind(&id)
    .execute(&*pool)
    .await
    .map_err(|e| format!("Failed to delete writing item: {}", e))?;
    
    Ok(())
}