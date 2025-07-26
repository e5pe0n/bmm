use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use time::serde::iso8601;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct BookmarkId(pub i32);

#[derive(Debug, Serialize, Deserialize)]
pub struct Bookmark {
    pub id: BookmarkId,
    pub title: String,
    pub url: String,
    #[serde(with = "iso8601")]
    pub created_at: OffsetDateTime,
    #[serde(with = "iso8601")]
    pub updated_at: OffsetDateTime,
}
