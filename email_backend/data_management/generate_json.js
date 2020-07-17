conn = new Mongo("localhost:27018");
db = conn.getDB("email_backend");
cursor = db.report_a_problem_emails.find();
array = cursor.toArray();
array.forEach(function (report) {
  report._id = report._id.valueOf();
  report.email_meta.server_time = report.email_meta.server_time.valueOf();
});
printjson(cursor.toArray());

conn.close();
