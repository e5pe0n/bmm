use std::collections::HashSet;

use axum::{body::Body, http::Request};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use sqlx::PgPool;
use tower::ServiceExt;

#[sqlx::test(fixtures("bookmarks"))]
async fn test_list_bookmarks(db: PgPool) {
    let app = backend::app(db);
    let resp = app
        .oneshot(Request::get("/v1/bookmarks").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(resp.status(), 200);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();
    let body = body.as_array().unwrap();
    assert_eq!(body.len(), 3);
    assert_eq!(body[0]["id"], 1);
    assert_eq!(body[0]["title"], "Example Bookmark");
    assert_eq!(body[0]["url"], "https://example.com");
    assert_eq!(body[1]["id"], 2);
    assert_eq!(body[1]["title"], "Another Bookmark");
    assert_eq!(body[1]["url"], "https://another-example.com");
    assert_eq!(body[2]["id"], 3);
    assert_eq!(body[2]["title"], "Yet Another Bookmark");
    assert_eq!(body[2]["url"], "https://yet-another-example.com");
}

#[sqlx::test()]
async fn test_create_bookmark(db: PgPool) {
    let app = backend::app(db);
    let new_bookmark = json!({
        "title": "New Bookmark",
        "url": "https://new-bookmark.com"
    });

    let resp = app
        .oneshot(
            Request::post("/v1/bookmarks")
                .header("Content-Type", "application/json")
                .body(Body::from(new_bookmark.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), 201);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(body["title"], "New Bookmark");
    assert_eq!(body["url"], "https://new-bookmark.com");
}

#[sqlx::test(fixtures("bookmarks"))]
async fn test_update_bookmark(db: PgPool) {
    let app = backend::app(db);
    let update_bookmark = json!({
        "id": 1,
        "title": "Updated Bookmark",
        "url": "https://updated-bookmark.com"
    });

    let resp = app
        .oneshot(
            Request::put("/v1/bookmarks")
                .header("Content-Type", "application/json")
                .body(Body::from(update_bookmark.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), 200);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(body["title"], "Updated Bookmark");
    assert_eq!(body["url"], "https://updated-bookmark.com");
}

#[sqlx::test(fixtures("bookmarks"))]
async fn test_delete_bookmarks(db: PgPool) {
    let app = backend::app(db);
    let delete_ids = vec![1, 2];

    let resp = app
        .clone()
        .oneshot(
            Request::delete("/v1/bookmarks")
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

    // Verify that the bookmarks were deleted
    let resp = app
        .oneshot(Request::get("/v1/bookmarks").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(resp.status(), 200);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();
    let body = body.as_array().unwrap();
    assert_eq!(body.len(), 1);
}
