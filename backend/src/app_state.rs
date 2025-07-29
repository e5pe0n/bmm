use crate::repository::bookmark::BookmarkRepositoryTrait;

pub struct AppState {
    pub bookmark_repository: Box<dyn BookmarkRepositoryTrait>,
}
