import pymysql
from dbutils.pooled_db import PooledDB
import logging

logger = logging.getLogger(__name__)

_pool = None

def get_db_pool(max_connections=2):
    """
    Returns a shared database connection pool (Singleton).
    """
    global _pool
    if _pool is None:
        try:
            from config import DB_HOST, DB_USER, DB_PASSWD, DB_NAME
            _pool = PooledDB(
                creator=pymysql,
                host=DB_HOST,
                user=DB_USER,
                password=DB_PASSWD,
                database=DB_NAME,
                maxconnections=max_connections,
                blocking=True
            )
            logger.info(f"Database pool initialized with maxconnections={max_connections}")
        except Exception as e:
            logger.error(f"Failed to initialize database pool: {e}")
            return None
    return _pool

def get_connection():
    pool = get_db_pool()
    if pool:
        return pool.connection()
    return None
