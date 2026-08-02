"""backend/app/utils/errors.py — Typed error classes."""

from fastapi import HTTPException, status


class BriefConstraintConflict(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


class CreatorNotFound(HTTPException):
    def __init__(self, creator_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Creator '{creator_id}' not found.",
        )


class ShortlistLocked(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="This shortlist has been approved and is immutably locked.",
        )
