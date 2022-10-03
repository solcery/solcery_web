// type BrickConfig = {
//     Type: number,
//     Subtype: number,
//     FieldType: number, //0 = None, 1 - int, 2 - string
//     Slots: number,
// }

  var brickConfigs = [
    //Actions
    { Type: 0, Subtype: 0, FieldType: 0, Slots: 0, }, //Void
    { Type: 0, Subtype: 1, FieldType: 0, Slots: 2, }, //Set
    { Type: 0, Subtype: 2, FieldType: 0, Slots: 3, }, //Conditional
    { Type: 0, Subtype: 3, FieldType: 0, Slots: 2, }, //Loop
    { Type: 0, Subtype: 4, FieldType: 1, Slots: 0, }, //Card
    { Type: 0, Subtype: 5, FieldType: 2, Slots: 0, }, //Show message
    { Type: 0, Subtype: 6, FieldType: 2, Slots: 1, }, //Set context var
    { Type: 0, Subtype: 100, FieldType: 0, Slots: 1, }, //MoveTo
    { Type: 0, Subtype: 101, FieldType: 1, Slots: 2, }, //SetPlayerAttr
    { Type: 0, Subtype: 102, FieldType: 1, Slots: 2, }, //AddPlayerAttr
    { Type: 0, Subtype: 103, FieldType: 0, Slots: 3, }, //ApplyToPlace
    { Type: 0, Subtype: 104, FieldType: 1, Slots: 2, }, //SubPlayerAttr

    //Conditions
    { Type: 1, Subtype: 0, FieldType: 0, Slots: 0, }, //True
    { Type: 1, Subtype: 1, FieldType: 0, Slots: 0, }, //False
    { Type: 1, Subtype: 2, FieldType: 0, Slots: 2, }, //Or
    { Type: 1, Subtype: 3, FieldType: 0, Slots: 2, }, //And
    { Type: 1, Subtype: 4, FieldType: 0, Slots: 1, }, //Not
    { Type: 1, Subtype: 5, FieldType: 0, Slots: 2, }, //Equal
    { Type: 1, Subtype: 6, FieldType: 0, Slots: 2, }, //GreaterThan
    { Type: 1, Subtype: 7, FieldType: 0, Slots: 2, }, //LesserThan
    { Type: 1, Subtype: 100, FieldType: 0, Slots: 1, }, //IsAtPlace

    //Values
    { Type: 2, Subtype: 0, FieldType: 1, Slots: 0, }, //Const,
    { Type: 2, Subtype: 1, FieldType: 0, Slots: 3, }, //Conditional
    { Type: 2, Subtype: 2, FieldType: 0, Slots: 2, }, //Add
    { Type: 2, Subtype: 3, FieldType: 0, Slots: 2, }, //Sub
    { Type: 2, Subtype: 4, FieldType: 2, Slots: 0, }, //GetCtxVar
    { Type: 2, Subtype: 5, FieldType: 0, Slots: 2, }, //GetCtxVar
    { Type: 2, Subtype: 6, FieldType: 0, Slots: 2, }, //Mul
    { Type: 2, Subtype: 3, FieldType: 0, Slots: 2, }, //Div
    { Type: 2, Subtype: 2, FieldType: 0, Slots: 2, }, //Modulo
    { Type: 2, Subtype: 100, FieldType: 1, Slots: 1, }, //GetPlayerAttr
    { Type: 2, Subtype: 101, FieldType: 0, Slots: 0, }, //GetPlayerIndex
    { Type: 2, Subtype: 102, FieldType: 0, Slots: 1, }, //GetCardsAmount
    { Type: 2, Subtype: 103, FieldType: 0, Slots: 0, }, //CurrentPlace
    { Type: 2, Subtype: 105, FieldType: 0, Slots: 0, }, //CasterPlayerIndex

]

import summoner from './summoner_ruleset.json';