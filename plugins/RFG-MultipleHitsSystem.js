/////////////////////////////////////////////////////////////////
// RFG-Multiple Hits System v0.2
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
 * @default base + a.mdf
 * 
 * @param Actual Hits Variable
 * @desc The ingame variable to store your hits scored (to use in messages)
 * @default 1
 * 
 * @help
 * 
 * ----------------------------------------------
 * RFG Multiple Hits System
 * Version 0.2
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

    function toNumber(str, def) { //Define a function to assign parameters to a number value
        return isNaN(str) ? def : +(str || def);
    }

    var parameters = PluginManager.parameters("RFG-MultipleHitsSystem"); //Load all parameters into an array
    var mhitsposs = toNumber(parameters['Maximum Possible Hits'], 16); //Set variable for Max Possible Hits
    var mmagicposs = toNumber(parameters['Maximum Magic Hits'], 6); //Set a variable for Max Magic Multiplier
    var doublehitsstate = toNumber(parameters['Double Hits State'], 10); //Set a variable for a state that doubles hits
    var halfhitsstate = toNumber(parameters['Half Hits State'], 11); //Set a variable for a state that halves hits
    var phitsform = parameters['Possible Hits Formula'] || "a.agi / 16"; //Set a variable for a formula that defines possible hits
    var mhitsform = parameters['Possible Magic Hits Formula'] || "m.mat / 32"; //Set a variable to define same thing for magic hits
    var damageform = parameters['Damage Formula'] || "a.atk * 4 - b.def * 2"; //Set your default damage formula
    var magicdamform = parameters['Magic Damage Formula'] || "base + a.mat * 2 - b.mdf * 2"; //Set your default magic damage formula
    var healingmagform = parameters['Healing Magic Formula'] || "base + a.mdf"; //Set your default healing formula
    var actualhitsvar = toNumber(parameters['Actual Hits Variable'], 1); //Set the ingame variable to track hits landed
    var phits = 0; //Init phits variable
    var damage = 0; //Init damage variable

    Game_Action.prototype.physicalAttack = function(a,b){ //Physical attack function
        damage = 0; //Set damage to 0
        $gameVariables.setValue(actualhitsvar, 0); //Set hits landed to 0
        phits = Math.floor(eval(phitsform)); //Evaluate phits formula
        if(phits < 1) { phits = 1; } //If less than 1, make it 1
        if(phits > mhitsposs) { phits = mhitsposs; } //If higher than the max possible hits, set to max possible hits
        if(a.isStateAffected(doublehitsstate)) { phits = phits * 2; } //If double state inflicted, double hits
        if(a.isStateAffected(halfhitsstate)) { phits = phits / 2; } //If half state inflicted, half hits
        for(i=0; i < phits; i++){ //Main damage calculation for loop
            if(getRandomInt(0, 100) > 100 - (a.hit * 100) && getRandomInt(0, 100) > (b.eva * 100)) { //If both of these conditions are true, than this was a successful hit
                damage = damage + eval(damageform); //Add damage to damage pool
                $gameVariables.setValue(actualhitsvar, $gameVariables.value(actualhitsvar) + 1); //Add one to actual hits if sucessful
            }
            if($gameVariables.value(actualhitsvar) < 1){ //If there were 0 sucessful hits, set to 1. Let game engine handle misses and evasions
                $gameVariables.setValue(actualhitsvar, 1);
                damage = eval(damageform); //Do damage, even if the plugin scored 0 hits
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
