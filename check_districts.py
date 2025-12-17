import asyncio
import os
from backend.mongo_config import MongoDB

os.environ['MONGO_URL'] = 'mongodb+srv://devanand2005a_db_user:Devanand@rockfall.1uctzhy.mongodb.net/?appName=Rockfall'

async def count_districts():
    mongo = MongoDB()
    mongo.connect()
    try:
        db = mongo.db
        districts = await db.mines.distinct('district')
        print(f'Number of districts: {len(districts)}')
        print(f'Districts: {districts}')
    except Exception as e:
        print(f'Error: {e}')
    finally:
        mongo.close()

if __name__ == '__main__':
    asyncio.run(count_districts())
