/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-misleading-character-class"),
    { RuleTester } = require("../../../lib/rule-tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2015 }
});

/*
 * /[π]/ // ERROR: a surrogate pair in a character class without u flag.
 * /[βοΈ]/u // ERROR: variation selectors in a character class.
 * /[π¨βπ©βπ¦]/u // ERROR: ZWJ in a character class.
 * /[π―π΅]/u // ERROR: a U+1F1E6-1F1FF pair in a character class.
 * /[πΆπ»]/u // ERROR: an emoji which is made with an emoji and skin tone selector, in a character class.
 */

ruleTester.run("no-misleading-character-class", rule, {
    valid: [
        "var r = /[π]/u",
        "var r = /[\\uD83D\\uDC4D]/u",
        "var r = /[\\u{1F44D}]/u",
        "var r = /βοΈ/",
        "var r = /AΜ/",
        "var r = /[β]/",
        "var r = /πΆπ»/",
        "var r = /[πΆ]/u",
        "var r = /π―π΅/",
        "var r = /[JP]/",
        "var r = /π¨βπ©βπ¦/",

        // Ignore solo lead/tail surrogate.
        "var r = /[\\uD83D]/",
        "var r = /[\\uDC4D]/",
        "var r = /[\\uD83D]/u",
        "var r = /[\\uDC4D]/u",

        // Ignore solo combining char.
        "var r = /[\\u0301]/",
        "var r = /[\\uFE0F]/",
        "var r = /[\\u0301]/u",
        "var r = /[\\uFE0F]/u",

        // Ignore solo emoji modifier.
        "var r = /[\\u{1F3FB}]/u",
        "var r = /[\u{1F3FB}]/u",

        // Ignore solo regional indicator symbol.
        "var r = /[π―]/u",
        "var r = /[π΅]/u",

        // Ignore solo ZWJ.
        "var r = /[\\u200D]/",
        "var r = /[\\u200D]/u",

        // don't report and don't crash on invalid regex
        "var r = new RegExp('[AΜ] [ ');",
        "var r = RegExp('{ [AΜ]', 'u');",
        { code: "var r = new globalThis.RegExp('[AΜ] [ ');", env: { es2020: true } },
        { code: "var r = globalThis.RegExp('{ [AΜ]', 'u');", env: { es2020: true } }
    ],
    invalid: [

        // RegExp Literals.
        {
            code: "var r = /[π]/",
            errors: [{ messageId: "surrogatePairWithoutUFlag" }]
        },
        {
            code: "var r = /[\\uD83D\\uDC4D]/",
            errors: [{ messageId: "surrogatePairWithoutUFlag" }]
        },
        {
            code: "var r = /[AΜ]/",
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: "var r = /[AΜ]/u",
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: "var r = /[\\u0041\\u0301]/",
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: "var r = /[\\u0041\\u0301]/u",
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: "var r = /[\\u{41}\\u{301}]/u",
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: "var r = /[βοΈ]/",
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: "var r = /[βοΈ]/u",
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: "var r = /[\\u2747\\uFE0F]/",
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: "var r = /[\\u2747\\uFE0F]/u",
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: "var r = /[\\u{2747}\\u{FE0F}]/u",
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: "var r = /[πΆπ»]/",
            errors: [{ messageId: "surrogatePairWithoutUFlag" }]
        },
        {
            code: "var r = /[πΆπ»]/u",
            errors: [{ messageId: "emojiModifier" }]
        },
        {
            code: "var r = /[\\uD83D\\uDC76\\uD83C\\uDFFB]/u",
            errors: [{ messageId: "emojiModifier" }]
        },
        {
            code: "var r = /[\\u{1F476}\\u{1F3FB}]/u",
            errors: [{ messageId: "emojiModifier" }]
        },
        {
            code: "var r = /[π―π΅]/",
            errors: [{ messageId: "surrogatePairWithoutUFlag" }]
        },
        {
            code: "var r = /[π―π΅]/u",
            errors: [{ messageId: "regionalIndicatorSymbol" }]
        },
        {
            code: "var r = /[\\uD83C\\uDDEF\\uD83C\\uDDF5]/u",
            errors: [{ messageId: "regionalIndicatorSymbol" }]
        },
        {
            code: "var r = /[\\u{1F1EF}\\u{1F1F5}]/u",
            errors: [{ messageId: "regionalIndicatorSymbol" }]
        },
        {
            code: "var r = /[π¨βπ©βπ¦]/",
            errors: [
                { messageId: "surrogatePairWithoutUFlag" },
                { messageId: "zwj" }
            ]
        },
        {
            code: "var r = /[π¨βπ©βπ¦]/u",
            errors: [{ messageId: "zwj" }]
        },
        {
            code: "var r = /[\\uD83D\\uDC68\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC66]/u",
            errors: [{ messageId: "zwj" }]
        },
        {
            code: "var r = /[\\u{1F468}\\u{200D}\\u{1F469}\\u{200D}\\u{1F466}]/u",
            errors: [{ messageId: "zwj" }]
        },

        // RegExp constructors.
        {
            code: String.raw`var r = new RegExp("[π]", "")`,
            errors: [{ messageId: "surrogatePairWithoutUFlag" }]
        },
        {
            code: String.raw`var r = new RegExp("[\\uD83D\\uDC4D]", "")`,
            errors: [{ messageId: "surrogatePairWithoutUFlag" }]
        },
        {
            code: String.raw`var r = new RegExp("[AΜ]", "")`,
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: String.raw`var r = new RegExp("[AΜ]", "u")`,
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: String.raw`var r = new RegExp("[\\u0041\\u0301]", "")`,
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: String.raw`var r = new RegExp("[\\u0041\\u0301]", "u")`,
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: String.raw`var r = new RegExp("[\\u{41}\\u{301}]", "u")`,
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: String.raw`var r = new RegExp("[βοΈ]", "")`,
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: String.raw`var r = new RegExp("[βοΈ]", "u")`,
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: String.raw`var r = new RegExp("[\\u2747\\uFE0F]", "")`,
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: String.raw`var r = new RegExp("[\\u2747\\uFE0F]", "u")`,
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: String.raw`var r = new RegExp("[\\u{2747}\\u{FE0F}]", "u")`,
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: String.raw`var r = new RegExp("[πΆπ»]", "")`,
            errors: [{ messageId: "surrogatePairWithoutUFlag" }]
        },
        {
            code: String.raw`var r = new RegExp("[πΆπ»]", "u")`,
            errors: [{ messageId: "emojiModifier" }]
        },
        {
            code: String.raw`var r = new RegExp("[\\uD83D\\uDC76\\uD83C\\uDFFB]", "u")`,
            errors: [{ messageId: "emojiModifier" }]
        },
        {
            code: String.raw`var r = new RegExp("[\\u{1F476}\\u{1F3FB}]", "u")`,
            errors: [{ messageId: "emojiModifier" }]
        },
        {
            code: String.raw`var r = new RegExp("[π―π΅]", "")`,
            errors: [{ messageId: "surrogatePairWithoutUFlag" }]
        },
        {
            code: String.raw`var r = new RegExp("[π―π΅]", "u")`,
            errors: [{ messageId: "regionalIndicatorSymbol" }]
        },
        {
            code: String.raw`var r = new RegExp("[\\uD83C\\uDDEF\\uD83C\\uDDF5]", "u")`,
            errors: [{ messageId: "regionalIndicatorSymbol" }]
        },
        {
            code: String.raw`var r = new RegExp("[\\u{1F1EF}\\u{1F1F5}]", "u")`,
            errors: [{ messageId: "regionalIndicatorSymbol" }]
        },
        {
            code: String.raw`var r = new RegExp("[π¨βπ©βπ¦]", "")`,
            errors: [
                { messageId: "surrogatePairWithoutUFlag" },
                { messageId: "zwj" }
            ]
        },
        {
            code: String.raw`var r = new RegExp("[π¨βπ©βπ¦]", "u")`,
            errors: [{ messageId: "zwj" }]
        },
        {
            code: String.raw`var r = new RegExp("[\\uD83D\\uDC68\\u200D\\uD83D\\uDC69\\u200D\\uD83D\\uDC66]", "u")`,
            errors: [{ messageId: "zwj" }]
        },
        {
            code: String.raw`var r = new RegExp("[\\u{1F468}\\u{200D}\\u{1F469}\\u{200D}\\u{1F466}]", "u")`,
            errors: [{ messageId: "zwj" }]
        },
        {
            code: String.raw`var r = new globalThis.RegExp("[βοΈ]", "")`,
            env: { es2020: true },
            errors: [{ messageId: "combiningClass" }]
        },
        {
            code: String.raw`var r = new globalThis.RegExp("[πΆπ»]", "u")`,
            env: { es2020: true },
            errors: [{ messageId: "emojiModifier" }]
        },
        {
            code: String.raw`var r = new globalThis.RegExp("[π―π΅]", "")`,
            env: { es2020: true },
            errors: [{ messageId: "surrogatePairWithoutUFlag" }]
        },
        {
            code: String.raw`var r = new globalThis.RegExp("[\\u{1F468}\\u{200D}\\u{1F469}\\u{200D}\\u{1F466}]", "u")`,
            env: { es2020: true },
            errors: [{ messageId: "zwj" }]
        }
    ]
});
