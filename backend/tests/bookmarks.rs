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
    let tags = body[0]["tags"].as_array().unwrap();
    assert_eq!(tags.len(), 2);
    assert_eq!(tags[0]["id"], 1);
    assert_eq!(tags[0]["name"], "Linux");
    assert_eq!(tags[0]["color"], "#0000ff");
    assert_eq!(tags[1]["id"], 2);
    assert_eq!(tags[1]["name"], "Rust");
    assert_eq!(tags[1]["color"], "#00ff00");

    assert_eq!(body[1]["id"], 2);
    assert_eq!(body[1]["title"], "Another Bookmark");
    assert_eq!(body[1]["url"], "https://another-example.com");
    let tags = body[1]["tags"].as_array().unwrap();
    assert_eq!(tags.len(), 2);
    assert_eq!(tags[0]["id"], 1);
    assert_eq!(tags[0]["name"], "Linux");
    assert_eq!(tags[0]["color"], "#0000ff");
    assert_eq!(tags[1]["id"], 3);
    assert_eq!(tags[1]["name"], "TypeScript");
    assert_eq!(tags[1]["color"], "#ff0000");

    assert_eq!(body[2]["id"], 3);
    assert_eq!(body[2]["title"], "Yet Another Bookmark");
    assert_eq!(body[2]["url"], "https://yet-another-example.com");
    let tags = body[2]["tags"].as_array().unwrap();
    assert_eq!(tags.len(), 2);
    assert_eq!(tags[0]["id"], 2);
    assert_eq!(tags[0]["name"], "Rust");
    assert_eq!(tags[0]["color"], "#00ff00");
    assert_eq!(tags[1]["id"], 3);
    assert_eq!(tags[1]["name"], "TypeScript");
    assert_eq!(tags[1]["color"], "#ff0000");
}

#[sqlx::test(fixtures("tags"))]
async fn test_create_bookmark(db: PgPool) {
    let app = backend::app(db.clone());
    let new_bookmark = json!({
        "title": "Example Bookmark",
        "url": "https://example.com",
        "tag_ids": [1, 2]
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

    let app = backend::app(db);
    let resp = app
        .oneshot(Request::get("/v1/bookmarks").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(resp.status(), 200);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();
    let body = body.as_array().unwrap();

    assert_eq!(body.len(), 1);

    assert_eq!(body[0]["id"], 1);
    assert_eq!(body[0]["title"], "Example Bookmark");
    assert_eq!(body[0]["url"], "https://example.com");
    let tags = body[0]["tags"].as_array().unwrap();
    assert_eq!(tags.len(), 2);
    assert_eq!(tags[0]["id"], 1);
    assert_eq!(tags[0]["name"], "Linux");
    assert_eq!(tags[0]["color"], "#0000ff");
    assert_eq!(tags[1]["id"], 2);
    assert_eq!(tags[1]["name"], "Rust");
    assert_eq!(tags[1]["color"], "#00ff00");
}

#[sqlx::test(fixtures("bookmarks"))]
async fn test_update_bookmark(db: PgPool) {
    let app = backend::app(db.clone());
    let update_bookmark = json!({
        "id": 2,
        "title": "Updated Bookmark",
        "url": "https://updated-bookmark.com",
        "tag_ids": [1, 2]
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

    let app = backend::app(db);
    let resp = app
        .oneshot(Request::get("/v1/bookmarks").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(resp.status(), 200);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();
    let body = body.as_array().unwrap();

    let updated_bookmark = body.iter().find(|v| v["id"] == 2).unwrap();
    assert_eq!(updated_bookmark["title"], "Updated Bookmark");
    assert_eq!(updated_bookmark["url"], "https://updated-bookmark.com");
    let tags = updated_bookmark["tags"].as_array().unwrap();
    assert_eq!(tags.len(), 2);
    assert_eq!(tags[0]["id"], 1);
    assert_eq!(tags[0]["name"], "Linux");
    assert_eq!(tags[0]["color"], "#0000ff");
    assert_eq!(tags[1]["id"], 2);
    assert_eq!(tags[1]["name"], "Rust");
    assert_eq!(tags[1]["color"], "#00ff00");
}

#[sqlx::test(fixtures("bookmarks"))]
async fn test_delete_bookmarks(db: PgPool) {
    let app = backend::app(db.clone());
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

    let resp = app
        .oneshot(Request::get("/v1/bookmarks").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(resp.status(), 200);

    let app = backend::app(db);
    let resp = app
        .oneshot(Request::get("/v1/bookmarks").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(resp.status(), 200);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();
    let body = body.as_array().unwrap();

    let rest_bookmark_ids = body
        .iter()
        .map(|v| v["id"].as_i64().unwrap() as i32)
        .collect::<Vec<_>>();
    assert!(!rest_bookmark_ids.contains(&delete_ids[0]));
    assert!(!rest_bookmark_ids.contains(&delete_ids[1]));
}
