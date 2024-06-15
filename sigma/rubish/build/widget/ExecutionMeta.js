"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExecutionMeta {
    creature;
    declaration;
    declarationType;
    returnIdParent;
    isAnotherCreature;
    isParentScript;
    parentJsxKey;
    nonCreatureClassThisObj;
    constructor(metaDict) {
        this.creature = metaDict.creature;
        this.declaration = (metaDict.declaration === true);
        this.declarationType = metaDict.declarationType;
        this.returnIdParent = metaDict.returnIdParent;
        this.isAnotherCreature = metaDict.isAnotherCreature;
        this.isParentScript = metaDict.isParentScript;
        this.parentJsxKey = metaDict.parentJsxKey;
        this.nonCreatureClassThisObj = metaDict.nonCreatureClassThisObj;
        if (this.declaration && !this.declarationType) {
            // TODO: throw invalid execution metadata exception
        }
    }
}
exports.default = ExecutionMeta;
