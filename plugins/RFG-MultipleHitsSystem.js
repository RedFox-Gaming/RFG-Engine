/////////////////////////////////////////////////////////////////
// RFG-Multiple Hits System
// Author: RedFoxGaming
/////////////////////////////////////////////////////////////////

/*:
 * @plugindesc A Multiple Hits attack system similar to Final Fantasy
 * @author RedFoxGaming
 * 
 * This plugin has no plugin commands
 *
 * @param Maximum Possible Hits
 * @desc The maximum possible amount of hits, without state modifiers
 * @default 16
 * 
 * @param Maximum Magic Hits
 * @desc The maximum possible magic multipliers
 * @default 6
 * 
 * @param Double Hits State
 * @desc The stateID of the state you want to double your hits (will go beyond max)
 * @default 10
 * 
 * @param Half Hits State
 * @desc The stateID of the state you want to half your hits
 * @default 11
 * 
 * @param Possible Hits Formula
 * @type text
 * @desc The formula that calculates how many hits are possible
 * @default a.agi / 16
 * 
 * @param Possible Magic Hits Formula
 * @type text
 * @desc The formula that calculates how many magic hits are possible
 * @default a.mat / 32
 * 
 * @param Damage Formula
 * @type text
 * @desc The default damage formula
 * @default a.atk * 4 - b.def * 2
 * 
 * @param Magic Damage Formula
 * @desc The default damage formula for spells (Base argument is used for a number base damage)
 * @default base + a.mat * 2 - b.mdf * 2
 * 
 * @param Healing Magic Formula
 * @desc The default formula for healing magics
 * @default base + a.mdf * getRandomInt(0,3)
 * 
 * @param Actual Hits Variable
 * @desc The ingame variable to store your hits scored (to use in messages)
 * @default 1
 * 
 * @help
 * 
 * ----------------------------------------------
 * RFG Multiple Hits System
 * Version 0.1
 * ----------------------------------------------
 * 
 * The purpose of this plugin is to mimic the way Final Fantasy handles their
 * attacking system, where your attack has the possibility of landing multiple
 * hits. In order to use this plugin, all you have to do is replace your formulas
 * in the skills you have set to attack, or your magic formulas to my functions.
 * 
 * Function for Physical Attacks
 * this.physicalAttack(a,b);
 * 
 * Function for Magical Attacks
 * this.magicalAttack(a,b,base); where base is a default number value
 * Note: You must use base in the formula if you want a base number value for your spells, otherwise;
 * use this.magicalAttack(a,b,0);
 * 
 * Function for Healing Magic
 * this.healingMagic(a,b,base); where base is a default number value
*/
    function getRandomInt (min,max) { //Define a function to get a random range of numbers
        min = Math.ceil(min);
        max = Math.floor(max) + 1;
        return Math.floor(Math.random() * (max - min)) + min;
    }   

    function toNumber(str, def) {
        return isNaN(str) ? def : +(str || def);
    }

    var parameters = PluginManager.parameters("RFG-MultipleHitsSystem");
    var mhitsposs = toNumber(parameters['Maximum Possible Hits'], 16);
    var mmagicposs = toNumber(parameters['Maximum Magic Hits'], 6);
    var doublehitsstate = toNumber(parameters['Double Hits State'], 10);
    var halfhitsstate = toNumber(parameters['Half Hits State'], 11);
    var phitsform = parameters['Possible Hits Formula'] || "a.agi / 16";
    var mhitsform = parameters['Possible Magic Hits Formula'] || "m.mat / 32";
    var damageform = parameters['Damage Formula'] || "a.atk * 4 - b.def * 2";
    var magicdamform = parameters['Magic Damage Formula'] || "base + a.mat * 2 - b.mdf * 2";
    var healingmagform = parameters['Healing Magic Formula'] || "base + a.mdf * getRandomInt(0,3)";
    var actualhitsvar = toNumber(parameters['Actual Hits Variable'], 1);
    var phits = 0;
    var damage = 0;

    Game_Action.prototype.physicalAttack = function(a,b){
        damage = 0;
        $gameVariables.setValue(actualhitsvar, 0);
        phits = Math.floor(eval(phitsform));
        if(phits < 1) { phits = 1; }
        if(phits > mhitsposs) { phits = mhitsposs; }
        if(a.isStateAffected(doublehitsstate)) { phits = phits * 2; }
        if(a.isStateAffected(halfhitsstate)) { phits = phits / 2; } 
        for(i=0; i < phits; i++){
            if(getRandomInt(0, 100) > 100 - (a.hit * 100) && getRandomInt(0, 100) > (b.eva * 100)) { //If both of these conditions are true, than this was a successful hit
                damage = damage + eval(damageform);
                $gameVariables.setValue(actualhitsvar, $gameVariables.value(actualhitsvar) + 1); //Add one to actual hits if sucessful
            }
            if($gameVariables.value(actualhitsvar) < 1){ //If there were 0 sucessful hits, set to 1. Let game engine handle misses and evasions
                $gameVariables.setValue(actualhitsvar, 1);
                damage = eval(damageform);
            }
        }
        return damage;
    }

    Game_Action.prototype.magicalAttack = function(a,b,base){
        damage = 0;
        $gameVariables.setValue(actualhitsvar, 0);
        var phits = Math.floor(eval(mhitsform));
        if(phits < 1) { phits = 1; }
        if(phits > mmagicposs) { phits = mmagicposs; }
        for(i=0; i < phits; i++){
            if(getRandomInt(0, 100) > 100 - (a.hit * 100) && getRandomInt(0, 100) > (b.eva * 100)){
                damage = damage + eval(magicdamform);
                $gameVariables.setValue(actualhitsvar, $gameVariables.value(actualhitsvar) + 1);
            }
            if($gameVariables.value(actualhitsvar) < 1){
                $gameVariables.setValue(actualhitsvar, 1);
                damage = eval(magicdamform);
            }
        }
        return damage;
    }

    Game_Action.prototype.healingMagic = function(a,b,base){
        damage = 0;
        $gameVariables.setValue(actualhitsvar, 0);
        var phits = Math.floor(eval(mhitsform));
        if(phits < 1) { phits = 1; }
        if(phits > mmagicposs) { phits = mmagicposs; }
        for(i=0; i < phits; i++){
            if(getRandomInt(0, 100) > 100 - (a.hit * 100) && getRandomInt(0, 100) > (b.eva * 100)){
                damage = damage + eval(healingmagform);
                $gameVariables.setValue(actualhitsvar, $gameVariables.value(actualhitsvar) + 1);
            }
            if($gameVariables.value(actualhitsvar) < 1){
                $gameVariables.setValue(actualhitsvar, 1);
                damage = eval(healingmagform);
            }
        }
        return damage;
    }
