import { getRepository } from "typeorm"

import { CreateStudentGroupInput } from "../interface/student-group.interface"
import { GroupStudent } from "../entity/group-student.entity"
import { Group } from "../entity/group.entity"
import { executeQuery } from "../utils/helper"
import { exec } from "child_process"

export async function insertIntoStudentGroupTable(groupId: number, studentId: number, incidentCount: number) {
  const studentGroupRepository = getRepository(GroupStudent)

  const createStudentGroupInput: CreateStudentGroupInput = {
    student_id: studentId,
    group_id: groupId,
    incident_count: incidentCount,
  }

  const studentGroup = new GroupStudent()
  studentGroup.prepareToCreate(createStudentGroupInput)
  const insertResult = await studentGroupRepository.save(studentGroup)
  return insertResult
}

export async function fetchStudentsInAGroup(groupId: number) {
  const studentGroupRepository = getRepository(GroupStudent)

  let query = `
        SELECT
            group_student.id as groupStudentId,
            student_id as StudentId,
            first_name,
            last_name,
            first_name || ' ' || last_name as full_name
        FROM
            "group_student"
            INNER JOIN
                student ON (group_student.student_id = student.id)
        WHERE
            group_id=${groupId}
        `
  return await executeQuery(query, studentGroupRepository)
}

export async function deleteEntriesForOneGroupStudentTable(groupId: number) {
  const studentGroupRepository = getRepository(GroupStudent)

  let query = `
        DELETE
            FROM
                "group_student"
        WHERE
            group_id=${groupId};
    `
  return await executeQuery(query, studentGroupRepository)
}
