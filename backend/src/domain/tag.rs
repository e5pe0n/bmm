use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use time::OffsetDateTime;
use time::serde::rfc3339;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, sqlx::Type)]
#[sqlx(transparent)]
pub struct TagId(pub i32);

impl From<i32> for TagId {
    fn from(value: i32) -> Self {
        TagId(value)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, sqlx::Type)]
#[sqlx(transparent)]
pub struct Color(pub String);

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Tag {
    pub id: TagId,
    pub name: String,
    pub color: Color,
    #[serde(with = "rfc3339")]
    pub created_at: OffsetDateTime,
    #[serde(with = "rfc3339")]
    pub updated_at: OffsetDateTime,
}
