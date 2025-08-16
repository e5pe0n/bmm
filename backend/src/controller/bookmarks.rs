use crate::AppState;
use crate::domain::bookmark::{Bookmark, BookmarkId};
use crate::domain::common::MAX_ID;
use crate::domain::tag::TagId;
use axum::{Json, extract::State, http::StatusCode};
use garde::Validate;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::vec::Vec;

type Return<T> = Result<(StatusCode, Json<T>), (StatusCode, String)>;

#[derive(Deserialize, Serialize)]
pub struct SimpleSuccess {
    message: String,
}

impl SimpleSuccess {
    pub fn new() -> Self {
        SimpleSuccess {
            message: "success".to_string(),
        }
    }
}

pub async fn list_bookmarks(State(state): State<Arc<AppState>>) -> Return<Vec<Bookmark>> {
    let res = state.bookmark_repository.get_bookmarks().await;

    match res {
        Ok(bookmarks) => Ok((StatusCode::OK, Json(bookmarks))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateBookmarkReq {
    #[garde(length(min = 1, max = 255))]
    title: String,
    #[garde(url)]
    url: String,
    #[garde(length(max = 50), inner(range(min = 1, max = MAX_ID)))]
    tag_ids: Vec<i32>,
}

pub async fn create_bookmark(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateBookmarkReq>,
) -> Return<SimpleSuccess> {
    if let Err(e) = req.validate() {
        return Err((StatusCode::BAD_REQUEST, e.to_string()));
    }

    let res = state
        .bookmark_repository
        .create_bookmark(
            &req.title,
            &req.url,
            &req.tag_ids.iter().map(|tag_id| TagId(*tag_id)).collect(),
        )
        .await;

    match res {
        Ok(_) => Ok((StatusCode::CREATED, Json(SimpleSuccess::new()))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateBookmarkReq {
    #[garde(range(min = 1, max = MAX_ID))]
    id: i32,
    #[garde(length(min = 1, max = 255))]
    title: String,
    #[garde(url)]
    url: String,
    #[garde(length(max = 50), inner(range(min = 1, max = MAX_ID)))]
    tag_ids: Vec<i32>,
}

pub async fn update_bookmark(
    State(state): State<Arc<AppState>>,
    Json(req): Json<UpdateBookmarkReq>,
) -> Return<SimpleSuccess> {
    if let Err(e) = req.validate() {
        return Err((StatusCode::BAD_REQUEST, e.to_string()));
    }

    let res = state
        .bookmark_repository
        .update_bookmark(
            BookmarkId(req.id),
            &req.title,
            &req.url,
            &req.tag_ids.iter().map(|tag_id| TagId(*tag_id)).collect(),
        )
        .await;

    match res {
        Ok(_) => Ok((StatusCode::OK, Json(SimpleSuccess::new()))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct DeleteBookmarksReq {
    #[garde(inner(range(min = 1, max = MAX_ID)))]
    ids: Vec<i32>,
}

pub async fn delete_bookmarks(
    State(state): State<Arc<AppState>>,
    Json(ids): Json<Vec<BookmarkId>>,
) -> Return<SimpleSuccess> {
    if ids.is_empty() {
        return Ok((StatusCode::OK, Json(SimpleSuccess::new())));
    }

    let res = state.bookmark_repository.delete_bookmarks(&ids).await;

    match res {
        Ok(_) => Ok((StatusCode::OK, Json(SimpleSuccess::new()))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}
