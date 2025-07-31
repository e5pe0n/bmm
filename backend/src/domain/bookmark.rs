use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use time::OffsetDateTime;
use time::serde::rfc3339;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, sqlx::Type)]
#[sqlx(transparent)]
pub struct BookmarkId(pub i32);

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Bookmark {
    pub id: BookmarkId,
    pub title: String,
    pub url: String,
    #[serde(with = "rfc3339")]
    pub created_at: OffsetDateTime,
    #[serde(with = "rfc3339")]
    pub updated_at: OffsetDateTime,
}
