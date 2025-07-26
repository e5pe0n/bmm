use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Bookmark {
    // pub id: String,
    title: String,
    url: String,
    // pub created_at: String,
    // pub updated_at: String,
}

impl Bookmark {
    pub fn new(title: String, url: String) -> Self {
        Bookmark {
            title,
            url,
            // id: "1".to_string(),
            // created_at: "2023-10-01T00:00:00Z".to_string(),
            // updated_at: "2023-10-01T00:00:00Z".to_string(),
        }
    }
}
