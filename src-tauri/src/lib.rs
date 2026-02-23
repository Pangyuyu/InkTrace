use sqlx::{SqlitePool, Row};
use tauri::Manager;
mod db;
mod models;
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let context = tauri::generate_context!();
  
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      let pool = tauri::async_runtime::block_on(async {
        db::init_db().await
      })?;
      
      let pool_clone = pool.clone();
      app.manage(pool);
      log::info!("Database initialized successfully");
      
      tauri::async_runtime::spawn(async move {
        // 测试数据库连接和表结构
        println!("Testing database connection and tables...");
        match sqlx::query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
          .fetch_all(&pool_clone)
          .await
        {
          Ok(tables) => {
            let table_names: Vec<String> = tables.iter()
              .map(|row| row.get::<String, _>("name"))
              .collect();
            println!("Database tables: {:?}", table_names);
            log::info!("Database tables: {:?}", table_names);
          }
          Err(e) => {
            println!("Failed to query database tables: {}", e);
            log::error!("Failed to query database tables: {}", e);
          }
        }
      });
      
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::get_writing_items,
      commands::get_writing_item,
      commands::create_writing_item,
      commands::update_writing_item,
      commands::delete_writing_item,
    ])
    .run(context)
    .expect("error while running tauri application");
}
