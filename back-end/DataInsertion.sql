# INSERTS for student_roll_state 

INSERT INTO "student_roll_state" (student_id, roll_id, state) VALUES(1, 1, "unmark");
INSERT INTO "student_roll_state" (student_id, roll_id, state) VALUES(2, 2, "unmark");
INSERT INTO "student_roll_state" (student_id, roll_id, state) VALUES(3, 3, "absent");
INSERT INTO "student_roll_state" (student_id, roll_id, state) VALUES(4, 4, "absent");
INSERT INTO "student_roll_state" (student_id, roll_id, state) VALUES(5, 5, "absent");
INSERT INTO "student_roll_state" (student_id, roll_id, state) VALUES(5, 6, "late");
INSERT INTO "student_roll_state" (student_id, roll_id, state) VALUES(6, 7, "late");
INSERT INTO "student_roll_state" (student_id, roll_id, state) VALUES(5, 3, "late");


# INSERTS for roll

INSERT INTO "roll" ("name", "completed_at") VALUES ("rollA", date("2022-12-10"));
INSERT INTO "roll" ("name", "completed_at") VALUES ("rollB", date("2022-12-1"));
INSERT INTO "roll" ("name", "completed_at") VALUES ("rollC", date("2022-12-12"));
INSERT INTO "roll" ("name", "completed_at") VALUES ("rollD", date("2022-12-13"));
INSERT INTO "roll" ("name", "completed_at") VALUES ("rollE", date("2022-12-14"));
INSERT INTO "roll" ("name", "completed_at") VALUES ("rollF", date("2022-12-15"));
INSERT INTO "roll" ("name", "completed_at") VALUES ("rollG", date("2022-12-16"));


# Query to satisfy run the group row


SELECT student_id, COUNT(student_id), first_name, last_name
FROM 
	student_roll_state
	INNER JOIN 
		student ON (student_roll_state.student_id = student.id)
	INNER JOIN 
		roll ON (student_roll_state.roll_id = roll.id)

WHERE
	state='absent'
	AND 
	JULIANDAY(date()) - JULIANDAY(completed_at) > 1

GROUP BY
	student_id
HAVING
	COUNT(student_id) > 0
;
