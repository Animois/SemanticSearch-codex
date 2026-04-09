import sqlite3
import json
import sys
import os

DB="app.db"

def connect():
    return sqlite3.connect(DB)


def init_db():

    conn=connect()
    cur=conn.cursor()

    cur.execute("""

    CREATE TABLE IF NOT EXISTS users(

        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        userId TEXT UNIQUE,
        password TEXT,
        role TEXT

    )

    """)

    cur.execute("""

    CREATE TABLE IF NOT EXISTS documents(

        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        ownerId TEXT

    )

    """)

    cur.execute("""

    INSERT OR IGNORE INTO users(name,userId,password,role)

    VALUES

    ('Admin','admin','admin123','admin'),
    ('User One','user1','user123','user')

    """)

    conn.commit()
    conn.close()

    return {"status":"initialized"}


def login(data):

    conn=connect()
    cur=conn.cursor()

    cur.execute(
        "SELECT * FROM users WHERE userId=? AND password=?",
        (data.get("userId"),data.get("password"))
    )

    row=cur.fetchone()
    conn.close()

    if row:

        return {
            "success":True,
            "user":{
                "id":row[0],
                "name":row[1],
                "userId":row[2],
                "role":row[4]
            }
        }

    return {"success":False}


def list_users():

    conn=connect()
    cur=conn.cursor()

    cur.execute("SELECT id,name,userId,role FROM users")

    rows=cur.fetchall()
    conn.close()

    users=[]

    for r in rows:

        users.append({
            "id":r[0],
            "name":r[1],
            "userId":r[2],
            "role":r[3]
        })

    return {"users":users}


def create_user(data):

    conn=connect()
    cur=conn.cursor()

    cur.execute(

        "INSERT INTO users(name,userId,password,role) VALUES(?,?,?,?)",

        (
            data.get("name"),
            data.get("userId"),
            data.get("password"),
            data.get("role","user")
        )

    )

    conn.commit()
    conn.close()

    return {"success":True}


def update_user(data):

    conn=connect()
    cur=conn.cursor()

    cur.execute(

        "UPDATE users SET name=?,password=?,role=? WHERE id=?",

        (
            data.get("name"),
            data.get("password"),
            data.get("role"),
            data.get("id")
        )

    )

    conn.commit()
    conn.close()

    return {"success":True}


def delete_user(data):

    conn=connect()
    cur=conn.cursor()

    cur.execute(

        "DELETE FROM users WHERE id=?",

        (data.get("id"),)

    )

    conn.commit()
    conn.close()

    return {"success":True}


def list_documents(data):

    conn=connect()
    cur=conn.cursor()

    if data.get("ownerId"):

        cur.execute(

            "SELECT * FROM documents WHERE ownerId=?",

            (data.get("ownerId"),)

        )

    else:

        cur.execute("SELECT * FROM documents")

    rows=cur.fetchall()
    conn.close()

    docs=[]

    for r in rows:

        docs.append({

            "id":r[0],
            "title":r[1],
            "content":r[2],
            "ownerId":r[3]

        })

    return {"documents":docs}


def create_document(data):

    conn=connect()
    cur=conn.cursor()

    cur.execute(

        "INSERT INTO documents(title,content,ownerId) VALUES(?,?,?)",

        (
            data.get("title"),
            data.get("content"),
            data.get("ownerId")
        )

    )

    conn.commit()
    conn.close()

    return {"success":True}


def update_document(data):

    conn=connect()
    cur=conn.cursor()

    cur.execute(

        "UPDATE documents SET title=?,content=? WHERE id=?",

        (
            data.get("title"),
            data.get("content"),
            data.get("id")
        )

    )

    conn.commit()
    conn.close()

    return {"success":True}


def delete_document(data):

    conn=connect()
    cur=conn.cursor()

    cur.execute(

        "DELETE FROM documents WHERE id=?",

        (data.get("id"),)

    )

    conn.commit()
    conn.close()

    return {"success":True}


# CLI bridge for Node

if __name__=="__main__":

    action=sys.argv[1] if len(sys.argv)>1 else ""

    payload={}

    try:
        payload=json.load(sys.stdin)
    except:
        payload={}

    if action=="init":
        print(json.dumps(init_db()))

    elif action=="login":
        print(json.dumps(login(payload)))

    elif action=="list_users":
        print(json.dumps(list_users()))

    elif action=="create_user":
        print(json.dumps(create_user(payload)))

    elif action=="update_user":
        print(json.dumps(update_user(payload)))

    elif action=="delete_user":
        print(json.dumps(delete_user(payload)))

    elif action=="list_documents":
        print(json.dumps(list_documents(payload)))

    elif action=="create_document":
        print(json.dumps(create_document(payload)))

    elif action=="update_document":
        print(json.dumps(update_document(payload)))

    elif action=="delete_document":
        print(json.dumps(delete_document(payload)))

    else:
        print(json.dumps({"error":"unknown action"}))