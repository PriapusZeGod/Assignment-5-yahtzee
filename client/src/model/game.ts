// Importing all exports from the yahtzee.game module and aliasing it as Y
import * as Y from 'models/src/model/yahtzee.game'

// Define a type for an indexed Yahtzee game, which is a read-only version of the Yahtzee type
// with the 'roller' property omitted and additional 'id' and 'pending' properties
export type IndexedYahtzee = Readonly<Omit<Y.Yahtzee, 'roller'> & { id: number, pending: false }>

// Define a type for an indexed Yahtzee game specification, which is a read-only version of the YahtzeeSpecs type
// with additional 'id' and 'pending' properties
export type IndexedYahtzeeSpecs = Readonly<Y.YahtzeeSpecs & { id: number, pending: true }>