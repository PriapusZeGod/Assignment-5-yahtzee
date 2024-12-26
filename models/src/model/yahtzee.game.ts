import { repeat, update, zipWith } from "../utils/array_utils"
import { Randomizer, standardRandomizer, standardShuffler } from "../utils/random_utils"
import { dice_roller, DiceRoller, die_values, DieValue } from "./dice"
import { finished_lower, finished_upper, isLowerSection, lower_section, LowerSection, LowerSectionKey, register_lower, register_upper, total_lower, total_upper, upper_section, UpperSection } from "./yahtzee.score"

export type YahtzeeSpecs = {
  creator?: string,
  players: string[],
  number_of_players?: number,
}

export type YahtzeeOptions = YahtzeeSpecs & {
  randomizer?: Randomizer
}

export type Yahtzee = Readonly<{
  players: string[],
  upper_sections: UpperSection[],
  lower_sections: LowerSection[],
  playerInTurn: number,
  roll: DieValue[],
  rolls_left: number,
  roller: DiceRoller
}>

export function new_yahtzee({players, number_of_players, randomizer = standardRandomizer}: Readonly<YahtzeeOptions>): Yahtzee {
  if (number_of_players && players.length !== number_of_players)
    throw new Error('Wrong number of players: ' + players.length)
  const roller = dice_roller(randomizer)
  return {
    players: standardShuffler(randomizer, players),
    upper_sections: repeat(upper_section(), players.length),
    lower_sections: repeat(lower_section(), players.length),
    playerInTurn: 0,
    roll: roller.roll(5),
    rolls_left: 2,
    roller
  }
}

export function reroll(held: number[], yahtzee: Yahtzee): Yahtzee {
  if (yahtzee.rolls_left === 0) throw new Error('No more rolls')
  return { 
    ...yahtzee, 
    roll: yahtzee.roller.reroll(yahtzee.roll, held),
    rolls_left: yahtzee.rolls_left - 1
  }
}

export function register(slot: DieValue | LowerSectionKey, yahtzee: Yahtzee): Yahtzee {
  if (isLowerSection(slot)) {
    const { playerInTurn, lower_sections, roll } = yahtzee
    const section = lower_sections[playerInTurn]
    if (section.scores[slot]) throw new Error("Cannot overwrite score")
    return {
      ...yahtzee,
      lower_sections: update(playerInTurn, register_lower(section, slot, roll), lower_sections),
      playerInTurn: (playerInTurn + 1) % yahtzee.players.length,
      roll: yahtzee.roller.roll(5),
      rolls_left: 2
    }
  } else {
    const { playerInTurn, upper_sections, roll } = yahtzee
    const section = upper_sections[playerInTurn]
    if (section.scores[slot]) throw new Error("Cannot overwrite score")
    return {
      ...yahtzee,
      upper_sections: update(playerInTurn, register_upper(section, slot, roll), upper_sections),
      playerInTurn: (playerInTurn + 1) % yahtzee.players.length,
      roll: yahtzee.roller.roll(5),
      rolls_left: 2
    }
  }
}

export function scores(yahtzee: Omit<Yahtzee, 'roller'>): number[] {
  const upper_scores = yahtzee.upper_sections.map(total_upper)
  const lower_scores = yahtzee.lower_sections.map(total_lower)
  return zipWith((u, l) => u + l, upper_scores, lower_scores)
}

export function is_finished(yahtzee: Omit<Yahtzee, 'roller'>): boolean {
  return yahtzee.upper_sections.every(finished_upper) && yahtzee.lower_sections.every(finished_lower)
}