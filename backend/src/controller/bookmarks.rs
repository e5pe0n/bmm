use crate::AppState;
use crate::domain::bookmark::{Bookmark, BookmarkId};
use crate::domain::common::MAX_ID;
use axum::{Json, extract::State, http::StatusCode};
use garde::Validate;
use serde::Deserialize;
use std::sync::Arc;
use std::vec::Vec;

type Return<T> = Result<(StatusCode, Json<T>), (StatusCode, String)>;

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
}

pub async fn create_bookmark(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateBookmarkReq>,
) -> Return<Bookmark> {
    if let Err(e) = req.validate() {
        return Err((StatusCode::BAD_REQUEST, e.to_string()));
    }

    let res = state
        .bookmark_repository
        .create_bookmark(&req.title, &req.url)
        .await;

    match res {
        Ok(bookmark) => Ok((StatusCode::CREATED, Json(bookmark))),
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
}

pub async fn update_bookmark(
    State(state): State<Arc<AppState>>,
    Json(req): Json<UpdateBookmarkReq>,
) -> Return<Bookmark> {
    if let Err(e) = req.validate() {
        return Err((StatusCode::BAD_REQUEST, e.to_string()));
    }

    let res = state
        .bookmark_repository
        .update_bookmark(BookmarkId(req.id), &req.title, &req.url)
        .await;

    match res {
        Ok(bookmark) => Ok((StatusCode::OK, Json(bookmark))),
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
) -> Return<Vec<BookmarkId>> {
    if ids.is_empty() {
        return Ok((StatusCode::OK, Json(vec![])));
    }

    let res = state.bookmark_repository.delete_bookmarks(ids).await;

    match res {
        Ok(deleted_ids) => Ok((StatusCode::OK, Json(deleted_ids))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}
