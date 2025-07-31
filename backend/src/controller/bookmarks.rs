use crate::AppState;
use crate::domain::bookmark::Bookmark;
use axum::{Json, extract::State, http::StatusCode};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::vec::Vec;
use validator::{Validate, ValidationErrors};

pub async fn list_bookmarks(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Bookmark>>, (StatusCode, String)> {
    // This function would typically interact with a database to retrieve bookmarks.
    // For now, we return a dummy bookmark.
    let res = state.bookmark_repository.get_bookmarks().await;

    match res {
        Ok(bookmarks) => Ok(Json(bookmarks)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Debug, Deserialize, Validate)]
struct CreateBookmarkReq {
    #[validate(length(min = 1, max = 255))]
    title: String,
    #[validate(url)]
    url: String,
}

pub async fn create_bookmark(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateBookmarkReq>,
) -> Result<Json<Bookmark>, (StatusCode, String)> {
    if let Err(e) = req.validate() {
        return Err((StatusCode::BAD_REQUEST, e.to_string()));
    }

    let res = state
        .bookmark_repository
        .create_bookmark(&req.title, &req.url)
        .await;

    match res {
        Ok(bookmark) => Ok(Json(bookmark)),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}
