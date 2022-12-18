export function processRollStatesInGroups(states: string) {
  let stringSplit = states.split("|")
  let varioutPossibleStates = `state='${stringSplit[0].trim()}'`
  let length = stringSplit.length

  for (let index = 1; index < length; index++) {
    let cleanedUpState = stringSplit[index].trim()
    varioutPossibleStates = varioutPossibleStates + ` OR state='${cleanedUpState}'`
  }

  return varioutPossibleStates
}

export async function executeQuery(query: string, repository: any) {
  const result = await repository.query(query)
  return result
}
