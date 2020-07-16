conn = new Mongo("localhost:27018");
db = conn.getDB("email_backend");
cursor = db.report_a_problem_emails.find();
printjson(cursor.toArray());

conn.close();
