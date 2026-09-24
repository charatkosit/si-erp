# Environment and Secret Policy

`.env` is local-only and must never be committed. Copy `.env.example` for development and replace every `change-me` value locally. Production and staging secrets must come from the approved secret manager; CI must use protected secret storage. Rotate any value exposed outside the local machine.

Development defaults from P0-05 are removed from Compose. Test uses isolated, non-production values; staging and production require unique credentials, least privilege, and no shared `.env` file.
