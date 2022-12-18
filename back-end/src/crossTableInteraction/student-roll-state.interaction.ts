import { group } from "console"
import { getRepository } from "typeorm"

import { Group } from "../entity/group.entity"
import { StudentRollState } from "../entity/student-roll-state.entity"
import { executeQuery, processRollStatesInGroups } from "../utils/helper"

export async function runGroupFilter(groupToRun: Group) {
  const studentRollStateRepository = getRepository(StudentRollState)
  const numberOfDays = 7 * groupToRun.number_of_weeks
  const possibleStates = processRollStatesInGroups(groupToRun.roll_states)

  let query = `
      SELECT student_id, first_name, last_name, first_name || ' ' || last_name as full_name, COUNT(student_id) as incidentCount
      FROM 
        student_roll_state
        INNER JOIN 
          student ON (student_roll_state.student_id = student.id)
        INNER JOIN 
          roll ON (student_roll_state.roll_id = roll.id)

      WHERE
        ${possibleStates}
        AND 
        JULIANDAY(date()) - JULIANDAY(completed_at) > ${numberOfDays}

      GROUP BY
        student_id
      HAVING
        COUNT(student_id) ${groupToRun.ltmt} ${groupToRun.incidents}
      ;
    `

  return await executeQuery(query, studentRollStateRepository)
}
