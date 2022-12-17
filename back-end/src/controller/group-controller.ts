import { getRepository } from "typeorm"
import { NextFunction, Request, Response } from "express"

import { Group } from "../entity/group.entity"
import { CreateGroupInput, UpdateGroupInput } from "../interface/group.interface"

export class GroupController {
  private groupRepository = getRepository(Group)
  async allGroups(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Return the list of all groups
    return this.groupRepository.find()
  }

  async createGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Add a Group
    const { body: params } = request

    const createGroupInput: CreateGroupInput = {
      name: params?.name,
      number_of_weeks: params?.number_of_weeks,
      roll_states: params?.roll_states,
      incidents: params?.incidents,
      ltmt: params?.ltmt,
      student_count: params?.student_count,
    }

    const groupObject = new Group()
    groupObject.prepareToCreate(createGroupInput)
    return this.groupRepository.save(groupObject)
  }

  async updateGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Update a Group
    const { body: params } = request
    this.groupRepository.findOne(params.id).then((groupObject) => {
      const updateGroupInput: UpdateGroupInput = {
        id: params.id,
        name: params?.name,
        number_of_weeks: params?.number_of_weeks,
        roll_states: params?.roll_states,
        incidents: params?.incidents,
        ltmt: params?.ltmt,
        student_count: params?.student_count,
      }
      groupObject.prepareToUpdate(updateGroupInput)
      return this.groupRepository.save(groupObject)
    })
    return await this.groupRepository.find(params.id)
  }

  async removeGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Delete a Group
    const { body: params } = request
    const rowToDelete = await this.groupRepository.findOne(params.id)
    if (!rowToDelete) {
      return { ERROR: "NOT_FOUND" }
    }
    return await this.groupRepository.remove(rowToDelete)
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Return the list of Students that are in a Group
    const { body: params } = request
    const groupToRun = await this.groupRepository.findOne(params.id)
    let query = `
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
        JULIANDAY(date()) - JULIANDAY(completed_at) > ${groupToRun.number_of_weeks}

      GROUP BY
        student_id
      HAVING
        COUNT(student_id) ${groupToRun.ltmt} ${groupToRun.incidents}
      ;
    `
  }

  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
    // Task 2:
    // 1. Clear out the groups (delete all the students from the groups)
    // 2. For each group, query the student rolls to see which students match the filter for the group
    // 3. Add the list of students that match the filter to the group
  }
}
