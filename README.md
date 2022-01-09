# 📉 Mojito Crypto 📈

Typescript crypto mining resource for QBCore fivem framework. Earn passive income by buying mining rigs and upgrade them with new graphics cards.

## Features

- Earn qbits passively by owning mining rigs and upgrading them
- Different tiers of rigs can contain a different number of graphics cards
- Hashrate and power draw of the card is used to calculate profits
- Place a mining rig anywhere on the map
- Advanced prop placing mechanic
- Logs to console

## Config

To enable console output use `set mojito_debug 1` into your server.cfg

Config:

```js
{
  "BasicRigCardLimit": 2,                       // Amount of GPUS which can be inside of the basic rig
  "AdvancedRigCardLimit": 5,
  "BasicRigItemName": "basic_miningrig",        // Item name for your mining rigs
  "AdvancedRigItemName": "advanced_miningrig",
  "TickRate": 24                                // Time in minutes it takes for each cycle
}
```

Cards:

```json
{
  "itemname": {
    "hashrate": 100.0,
    "wattage": 200.0
  }
}
```

The card config takes the format of the itemname as the key with hashrate and wattage.
Profit is calculated by taking the hashrate and dividing it by 10% of the power draw. i.e. in this example the profit per tick would be 5 qbits.

These numbers pre-configured were taken from https://whattomine.com/ and have not been balanced, so I strongly recommend comming up with your own figures!

## Installation

Download the latest release or compile from the source.

### Items

Copy and Paste the items from the config and add it to qb-core/shared/items.lua

```lua
---- Crypto Mining
["basic_miningrig"]	= {["name"] = "basic_miningrig",	["label"] = "Basic Mining Rig",		["weight"] = 20000,	["type"] = "item",	["image"] = "basic_miningrig.png",	["unique"] = true,	["useable"] = true,	["shouldClose"] = false,	["combinable"] = nil,	   ["description"] = "A Basic Mining Rig!"},
["advanced_miningrig"] = {["name"] = "advanced_miningrig",	["label"] = "Advanced Mining Rig",	["weight"] = 15000,	["type"] = "item",	["image"] = "advanced_miningrig.png",	["unique"] = true,	["useable"] = true,	["shouldClose"] = false,["combinable"] = nil,	   ["description"] = "An Advanced Mining Rig!"},
["rtx3090"]	= {["name"] = "rtx3090",	["label"] = "RTX 3090",		["weight"] = 4000,	["type"] = "item",	["image"] = "rtx3090.png",	["unique"] = true,	["useable"] = true,	["shouldClose"] = false,	["combinable"] = nil,	["description"] = "RTX 3090 Graphics Card"},
["rtx3080"]	= {["name"] = "rtx3080",	["label"] = "RTX 3080",		["weight"] = 4000,	["type"] = "item",	["image"] = "rtx3080.png",	["unique"] = true,	["useable"] = true,	["shouldClose"] = false,	["combinable"] = nil,	["description"] = "RTX 3080 Graphics Card"},
["rtx3080ti"]	= {["name"] = "rtx3080ti",	["label"] = "RTX 3080TI",	["weight"] = 4000,	["type"] = "item",	["image"] = "rtx3080ti.png",	["unique"] = true,	["useable"] = true,	["shouldClose"] = false,	["combinable"] = nil,	["description"] = "RTX 3080TI Graphics Card"},
["rtx3070ti"]	= {["name"] = "rtx3070ti",	["label"] = "RTX 3070TI",	["weight"] = 4000,	["type"] = "item",	["image"] = "rtx3070ti.png",	["unique"] = true,	["useable"] = true,	["shouldClose"] = false,	["combinable"] = nil,	["description"] = "RTX 3070TI Graphics Card"},
["rtx3070"]	= {["name"] = "rtx3070",	["label"] = "RTX 3070",		["weight"] = 4000,	["type"] = "item",	["image"] = "rtx3070.png",	["unique"] = true,	["useable"] = true,	["shouldClose"] = false,	["combinable"] = nil,	["description"] = "RTX 3070 Graphics Card"},
["rx6800"]	= {["name"] = "rx6800",		["label"] = "RX 6800",		["weight"] = 4000,	["type"] = "item",	["image"] = "rx6800.png",	["unique"] = true,	["useable"] = true,	["shouldClose"] = false,	["combinable"] = nil,	["description"] = "RX 6800 Graphics Card"},
["rx6800xt"]	= {["name"] = "rx6800xt",	["label"] = "RX 6800 XT",	["weight"] = 4000,	["type"] = "item",	["image"] = "rx6800xt.png",	["unique"] = true,	["useable"] = true,	["shouldClose"] = false,	["combinable"] = nil,	["description"] = "RX 6800 XT Graphics Card"},
["rx6900xt"]	= {["name"] = "rx6900xt",	["label"] = "RX 6900 XT",	["weight"] = 4000,	["type"] = "item",	["image"] = "rx6900xt.png",	["unique"] = true,	["useable"] = true,	["shouldClose"] = false,	["combinable"] = nil,	["description"] = "RX 6900 XT Graphics Card"},
["rx6700xt"]	= {["name"] = "rx6700xt",	["label"] = "RX 6700 XT",	["weight"] = 4000,	["type"] = "item",	["image"] = "rx6700xt.png",	["unique"] = true,	["useable"] = true,	["shouldClose"] = false,	["combinable"] = nil,	["description"] = "RX 6700 XT Graphics Card"},
```

### SQL

Add miningrigs table to your database:

```sql
CREATE TABLE IF NOT EXISTS `player_miningrigs` (
  `id` varchar(50) NOT NULL,
  `citizenid` varchar(50) NOT NULL,
  `rig` text DEFAULT NULL,
  KEY `citizenid` (`citizenid`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

```

Run the script and enjoy

## Screenshots

![Placing A Basic Rig](https://i.imgur.com/elAMXCc.png 'Placing a basic rig')
![Rig Manager](https://i.imgur.com/UFH3ChX.png 'Rig Manager')

<div style="text-align: center;">
    <a href="https://imgur.com/a/QIIrQTO"> More Images </a>
</div>

## Dependencies

- [qb-core](https://github.com/qbcore-framework/qb-core)
- [qb-menu](https://github.com/qbcore-framework/qb-menu)
- [qb-target](https://github.com/BerkieBb/qb-target)
- [oxmysql v1.9.x](https://github.com/overextended/oxmysql)

## Developing / Building

To compile simplly do `yarn` to download dependencies and `yarn build` to compile, use `yarn watch` to put webpack into develop mode to build as you're working.

## License

This project is licensed under the GPL v3 License, see the LICENSE file for more details

```
    Copyright (C) 2022 Liam Dormon

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
