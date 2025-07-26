use crate::{AppState, domain::bookmark::Bookmark};
use axum::{Json, extract::State, http::StatusCode};
use std::sync::Arc;
use std::vec::Vec;

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
