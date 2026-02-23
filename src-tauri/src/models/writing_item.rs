use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use super::Tag;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct WritingItem {
    pub id: String,
    pub title: String,
    pub type_id: String,
    pub content: Option<String>,
    pub created_time: Option<String>,
    #[sqlx(default)]
    pub is_precise_time: bool,
    pub background: Option<String>,
    pub notes: Option<String>,
    pub folder_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WritingItemWithTags {
    #[serde(flatten)]
    pub item: WritingItem,
    pub tags: Vec<Tag>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewWritingItem {
    pub title: String,
    pub type_id: String,
    pub content: Option<String>,
    pub created_time: Option<String>,
    pub is_precise_time: bool,
    pub background: Option<String>,
    pub notes: Option<String>,
    pub folder_id: Option<String>,
    pub tag_ids: Vec<String>,
}