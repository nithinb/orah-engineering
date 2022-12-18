import { getRepository } from "typeorm"
import { NextFunction, Request, Response } from "express"

import { CreateGroupInput, UpdateGroupInput, PostRunGroupInput } from "../interface/group.interface"
import { Group } from "../entity/group.entity"
import { insertIntoStudentGroupTable, deleteEntriesForOneGroupStudentTable, fetchStudentsInAGroup } from "../crossTableInteraction/student-group.interaction"
import { runGroupFilter } from "../crossTableInteraction/student-roll-state.interaction"
import { group } from "console"
import { executeQuery } from "../utils/helper"
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
    }

    const groupObject = new Group()
    groupObject.prepareToCreate(createGroupInput)
    return this.groupRepository.save(groupObject)
  }

  async updateGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Update a Group
    const { body: params } = request
    const result = await this.groupRepository.findOne(params.id).then(async (groupObject) => {
      const updateGroupInput: UpdateGroupInput = {
        id: params.id,
        name: params?.name,
        number_of_weeks: params?.number_of_weeks,
        roll_states: params?.roll_states,
        incidents: params?.incidents,
        ltmt: params?.ltmt,
      }
      groupObject.prepareToUpdate(updateGroupInput)
      return await this.groupRepository.save(groupObject)
    })
    return result
  }

  async removeGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Delete a Group
    const { body: params } = request
    const groupId = params.id
    const rowToDelete = await this.groupRepository.findOne(groupId)
    if (!rowToDelete) {
      return { ERROR: "NOT_FOUND" }
    }
    return await this.groupRepository.remove(rowToDelete)
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Return the list of Students that are in a Group
    const { body: params } = request
    const groupId = params.id
    const queryResult = await fetchStudentsInAGroup(groupId)
    return queryResult
  }

  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
    // Task 2:
    // 1. Clear out the groups (delete all the students from the groups)
    // 2. For each group, query the student rolls to see which students match the filter for the group
    // 3. Add the list of students that match the filter to the group
    const { body: params } = request
    const groupId = params.id

    // Delete out the group execution run from Group_Student
    const deleteResult = await deleteEntriesForOneGroupStudentTable(groupId)

    const groupToRun = await this.groupRepository.findOne(groupId)

    const queryResult = await runGroupFilter(groupToRun)

    for (let queryRow of queryResult) {
      const insertResult = await insertIntoStudentGroupTable(groupToRun.id, queryRow.student_id, queryRow.incidentCount)
    }

    let groupObject = new Group()
    const updateGroupInput: PostRunGroupInput = {
      id: groupToRun.id,
      name: groupToRun?.name,
      number_of_weeks: groupToRun?.number_of_weeks,
      roll_states: groupToRun?.roll_states,
      incidents: groupToRun?.incidents,
      ltmt: groupToRun?.ltmt,
      student_count: queryResult.length,
      run_at: new Date(),
    }

    groupObject.prepareToUpdatePostRunFilter(updateGroupInput)

    let query = `
      UPDATE
        "group"
      SET
        run_at=date(),
        student_count=${queryResult.length}
      WHERE
        id=${groupId}
      ;
    `
    const result = await executeQuery(query, this.groupRepository)
    return { TotalStudents: queryResult.length }
  }
}
