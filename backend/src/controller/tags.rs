use crate::AppState;
use crate::domain::common::MAX_ID;
use crate::domain::tag::{Color, Tag, TagId};
use axum::{Json, extract::State, http::StatusCode};
use garde::Validate;
use serde::Deserialize;
use std::sync::Arc;
use std::vec::Vec;

type Return<T> = Result<(StatusCode, Json<T>), (StatusCode, String)>;

pub async fn list_tags(State(state): State<Arc<AppState>>) -> Return<Vec<Tag>> {
    let res = state.tag_repository.get_tags().await;

    match res {
        Ok(tags) => Ok((StatusCode::OK, Json(tags))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateTagReq {
    #[garde(length(min = 1, max = 255))]
    name: String,
    #[garde(pattern(r"#[0-9a-f]{6}"))]
    color: String,
}

pub async fn create_tag(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateTagReq>,
) -> Return<Tag> {
    if let Err(e) = req.validate() {
        return Err((StatusCode::BAD_REQUEST, e.to_string()));
    }

    let res = state
        .tag_repository
        .create_tag(&req.name, &Color(req.color))
        .await;

    match res {
        Ok(tag) => Ok((StatusCode::CREATED, Json(tag))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateTagReq {
    #[garde(range(min = 1, max = MAX_ID))]
    id: i32,
    #[garde(length(min = 1, max = 255))]
    name: String,
    #[garde(pattern(r"#[0-9a-f]{6}"))]
    color: String,
}

pub async fn update_tag(
    State(state): State<Arc<AppState>>,
    Json(req): Json<UpdateTagReq>,
) -> Return<Tag> {
    if let Err(e) = req.validate() {
        return Err((StatusCode::BAD_REQUEST, e.to_string()));
    }

    let res = state
        .tag_repository
        .update_tag(TagId(req.id), &req.name, &Color(req.color))
        .await;

    match res {
        Ok(tag) => Ok((StatusCode::OK, Json(tag))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Debug, Deserialize, Validate)]
pub struct DeleteTagsReq {
    #[garde(inner(range(min = 1, max = MAX_ID)))]
    ids: Vec<i32>,
}

pub async fn delete_tags(
    State(state): State<Arc<AppState>>,
    Json(ids): Json<Vec<TagId>>,
) -> Return<Vec<TagId>> {
    if ids.is_empty() {
        return Ok((StatusCode::OK, Json(vec![])));
    }

    let res = state.tag_repository.delete_tags(ids).await;

    match res {
        Ok(deleted_ids) => Ok((StatusCode::OK, Json(deleted_ids))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}
