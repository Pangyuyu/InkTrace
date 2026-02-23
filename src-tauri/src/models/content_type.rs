use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[allow(dead_code)]
pub struct ContentType {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
    pub color: Option<String>,
    #[sqlx(default)]
    pub is_built_in: bool,
    #[sqlx(default)]
    pub sort_order: i32,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct NewContentType {
    pub name: String,
    pub icon: Option<String>,
    pub color: Option<String>,
    pub is_built_in: bool,
    pub sort_order: i32,
}