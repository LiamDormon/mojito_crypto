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

## Screenshots

![Placing A Basic Rig](https://i.imgur.com/elAMXCc.png "Placing a basic rig")
![Rig Manager](https://i.imgur.com/UFH3ChX.png "Rig Manager")

<div style="text-align: center;">
    <a href="https://imgur.com/a/QIIrQTO"> More Images </a>
</div>

## Dependencies
- [qb-core](https://github.com/qbcore-framework/qb-core)
- [qb-menu](https://github.com/qbcore-framework/qb-menu)
- [qb-target](https://github.com/BerkieBb/qb-target)

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