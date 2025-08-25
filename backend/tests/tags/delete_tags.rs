use std::collections::HashSet;

use axum::{body::Body, http::Request};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use sqlx::PgPool;
use tower::ServiceExt;

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
