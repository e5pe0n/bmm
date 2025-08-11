use crate::repository::bookmark::BookmarkRepositoryTrait;
use crate::repository::tag::TagRepositoryTrait;

pub struct AppState {
    pub bookmark_repository: Box<dyn BookmarkRepositoryTrait>,
    pub tag_repository: Box<dyn TagRepositoryTrait>,
}
