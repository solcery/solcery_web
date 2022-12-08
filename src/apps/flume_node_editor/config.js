import { FlumeConfig, Colors, Controls } from 'flume'

const config = new FlumeConfig()
config.addPortType({
  type: "action",
  name: "action",
  label: "Action",
  color: Colors.red,
});

config.addPortType({
  type: "player",
  name: "player",
  label: "Player",
  color: Colors.blue,
});

config.addPortType({
  type: "number",
  name: "number",
  label: "Number",
  color: Colors.blue,
  controls: [
    Controls.number({
      name: 'number',
      label: 'Amount',
    })
  ]
});

config.addPortType({
  type: "condition",
  name: "condition",
  label: "Condition",
  color: Colors.green,
  controls: [
    Controls.checkbox({
      name: 'condition',
      label: 'Condition',
    })
  ]
});

config.addNodeType({
  type: "action.two",
  label: "Action.Two",
  description: "Performs two actions",
  inputs: ports => [
    ports.action({ name: 'previous', label: 'Previous' }),
    ports.action({ name: 'action1', label: 'Action 1' }),
    ports.action({ name: 'action2', label: 'Action 2' })
  ],
  outputs: ports => [
    ports.action({ name: 'then', label: 'Then' })
  ]
})

config.addNodeType({
  type: "onLeftClick",
  label: "On Left Click",
  description: "Left click event handler for card",
  inputs: ports => [
  ],
  outputs: ports => [ ports.action({ name: 'action', label: 'Action' }) ]
})

config.addNodeType({
  type: "damagePlayerForAmount",
  label: "Damage [Player] For [Amount]",
  description: "Deals damage to player's HP",
  inputs: ports => [
    ports.action({ name: 'previous', label: 'Previous' }),
    ports.player({ name: 'player', label: 'Player' }),
    ports.number({ name: 'amount', label: 'Amount' }),
  ],
  outputs: ports => [
    ports.action({ name: 'then', label: 'Then' })
  ]
})

config.addNodeType({
  type: "healPlayerForAmount",
  label: "Heal [Player] For [Amount]",
  description: "Heals damage to player's HP",
  inputs: ports => [
    ports.action({ name: 'previous', label: 'Previous' }),
    ports.player({ name: 'player', label: 'Player' }),
    ports.number({ name: 'amount', label: 'Amount' }),
  ],
  outputs: ports => [
    ports.action({ name: 'then', label: 'Then' })
  ]
})

config.addNodeType({
  type: "player.opponent",
  label: "Player.Opponent",
  description: "Opponent of card's owner",
  outputs: ports => [ ports.player() ]
})

config.addNodeType({
  type: "player.current",
  label: "Player.Current",
  description: "Card's owner",
  outputs: ports => [ ports.player() ]
})

config.addNodeType({
  type: "cond.lt",
  label: "Lesser.Than",
  description: "Returns true if Value1 < Value2",
  inputs: ports => [
    ports.number({ name: 'value1', label: 'Value1' }),
    ports.number({ name: 'value2', label: 'Value2' }),
  ],
  outputs: ports => [ ports.condition() ]
})

config.addNodeType({
  type: "value.playerHp",
  label: "Player [X] HP",
  inputs: ports => [
    ports.player({ name: 'player', label: 'Player' }),
  ],
  outputs: ports => [
    ports.number()
  ]
})


config.addNodeType({
  type: "triumph",
  label: "Triumph",
  inputs: ports => [
    ports.action({ name: 'previous', label: 'Previous' }),
    ports.condition(),
  ],
  outputs: ports => [
    ports.action({ name: 'success', label: 'Success' }),
    ports.action({ name: 'failure', label: 'Failure' })
  ]
})









export default config;