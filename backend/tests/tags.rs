use std::collections::HashSet;

use axum::{body::Body, http::Request};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use sqlx::PgPool;
use tower::ServiceExt;

#[sqlx::test(fixtures("tags"))]
async fn test_list_tags(db: PgPool) {
    let app = backend::app(db);
    let resp = app
        .oneshot(Request::get("/v1/tags").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(resp.status(), 200);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();
    let body = body.as_array().unwrap();
    assert_eq!(body.len(), 3);
    assert_eq!(body[0]["id"], 1);
    assert_eq!(body[0]["name"], "Linux");
    assert_eq!(body[0]["color"], "#0000ff");
    assert_eq!(body[1]["id"], 2);
    assert_eq!(body[1]["name"], "Rust");
    assert_eq!(body[1]["color"], "#00ff00");
    assert_eq!(body[2]["id"], 3);
    assert_eq!(body[2]["name"], "TypeScript");
    assert_eq!(body[2]["color"], "#ff0000");
}

#[sqlx::test()]
async fn test_create_tag(db: PgPool) {
    let app = backend::app(db);
    let new_tag = json!({
        "name": "Linux",
        "color": "#0000ff"
    });

    let resp = app
        .oneshot(
            Request::post("/v1/tags")
                .header("Content-Type", "application/json")
                .body(Body::from(new_tag.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), 201);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(body["name"], "Linux");
    assert_eq!(body["color"], "#0000ff");
}

#[sqlx::test(fixtures("tags"))]
async fn test_update_tag(db: PgPool) {
    let app = backend::app(db);
    let updating_tag = json!({
        "id": 1,
        "name": "linux",
        "color": "#ff0000"
    });

    let resp = app
        .oneshot(
            Request::put("/v1/tags")
                .header("Content-Type", "application/json")
                .body(Body::from(updating_tag.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), 200);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(body["name"], "linux");
    assert_eq!(body["color"], "#ff0000");
}

#[sqlx::test(fixtures("tags"))]
async fn test_delete_tags(db: PgPool) {
    let app = backend::app(db);
    let delete_ids = vec![1, 2];

    let resp = app
        .clone()
        .oneshot(
            Request::delete("/v1/tags")
                .header("Content-Type", "application/json")
                .body(Body::from(json!(delete_ids).to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), 200);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();
    let body = body.as_array().unwrap();
    assert_eq!(body.len(), 2);

    let expected_ids: HashSet<i64> = delete_ids.into_iter().collect();
    assert!(expected_ids.contains(&body[0].as_i64().unwrap()));
    assert!(expected_ids.contains(&body[1].as_i64().unwrap()));

    // Verify that the tags were deleted
    let resp = app
        .oneshot(Request::get("/v1/tags").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(resp.status(), 200);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();
    let body = body.as_array().unwrap();
    assert_eq!(body.len(), 1);
}
