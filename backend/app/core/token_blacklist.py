from datetime import datetime, timedelta
from typing import Set

# Simple in-memory token blacklist
# In production, you'd use Redis or a database
blacklisted_tokens: Set[str] = set()

def blacklist_token(token: str):
    """Add a token to the blacklist"""
    blacklisted_tokens.add(token)

def is_token_blacklisted(token: str) -> bool:
    """Check if a token is blacklisted"""
    return token in blacklisted_tokens

def cleanup_expired_tokens():
    """
    Clean up expired tokens
    """
    pass

# We'll clear the blacklist periodically
def clear_blacklist():
    """Clear all blacklisted tokens"""
    global blacklisted_tokens
    blacklisted_tokens = set()