import asyncio

from sqlalchemy import select

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.auth import Role, User

ROLE_SEEDS = [
    ("super_admin", "Super Admin", "Full system administration"),
    ("admin", "Admin", "System administration"),
    ("gis_manager", "GIS Manager", "GIS project and data management"),
    ("supervisor", "Supervisor", "Field team supervision"),
    ("reviewer", "Reviewer", "QA and review"),
    ("field_worker", "Field Worker", "Field data collection"),
    ("viewer", "Viewer", "Read-only access"),
]


async def seed() -> None:
    settings = get_settings()

    async with SessionLocal() as db:
        roles: dict[str, Role] = {}

        for code, name, description in ROLE_SEEDS:
            role = await db.scalar(select(Role).where(Role.code == code))
            if role is None:
                role = Role(code=code, name=name, description=description)
                db.add(role)
                await db.flush()
            roles[code] = role

        if settings.initial_admin_password:
            username = settings.initial_admin_username.strip().lower()
            admin = await db.scalar(select(User).where(User.username == username))
            if admin is None:
                admin = User(
                    username=username,
                    full_name=settings.initial_admin_full_name,
                    password_hash=hash_password(settings.initial_admin_password),
                    role_id=roles["super_admin"].id,
                    is_active=True,
                )
                db.add(admin)

        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed())
