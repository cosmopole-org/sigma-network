/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/acorn-jsx/index.js":
/*!*****************************************!*\
  !*** ./node_modules/acorn-jsx/index.js ***!
  \*****************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const XHTMLEntities = __webpack_require__(/*! ./xhtml */ "./node_modules/acorn-jsx/xhtml.js");

const hexNumber = /^[\da-fA-F]+$/;
const decimalNumber = /^\d+$/;

// The map to `acorn-jsx` tokens from `acorn` namespace objects.
const acornJsxMap = new WeakMap();

// Get the original tokens for the given `acorn` namespace object.
function getJsxTokens(acorn) {
  acorn = acorn.Parser.acorn || acorn;
  let acornJsx = acornJsxMap.get(acorn);
  if (!acornJsx) {
    const tt = acorn.tokTypes;
    const TokContext = acorn.TokContext;
    const TokenType = acorn.TokenType;
    const tc_oTag = new TokContext('<tag', false);
    const tc_cTag = new TokContext('</tag', false);
    const tc_expr = new TokContext('<tag>...</tag>', true, true);
    const tokContexts = {
      tc_oTag: tc_oTag,
      tc_cTag: tc_cTag,
      tc_expr: tc_expr
    };
    const tokTypes = {
      jsxName: new TokenType('jsxName'),
      jsxText: new TokenType('jsxText', {beforeExpr: true}),
      jsxTagStart: new TokenType('jsxTagStart', {startsExpr: true}),
      jsxTagEnd: new TokenType('jsxTagEnd')
    };

    tokTypes.jsxTagStart.updateContext = function() {
      this.context.push(tc_expr); // treat as beginning of JSX expression
      this.context.push(tc_oTag); // start opening tag context
      this.exprAllowed = false;
    };
    tokTypes.jsxTagEnd.updateContext = function(prevType) {
      let out = this.context.pop();
      if (out === tc_oTag && prevType === tt.slash || out === tc_cTag) {
        this.context.pop();
        this.exprAllowed = this.curContext() === tc_expr;
      } else {
        this.exprAllowed = true;
      }
    };

    acornJsx = { tokContexts: tokContexts, tokTypes: tokTypes };
    acornJsxMap.set(acorn, acornJsx);
  }

  return acornJsx;
}

// Transforms JSX element name to string.

function getQualifiedJSXName(object) {
  if (!object)
    return object;

  if (object.type === 'JSXIdentifier')
    return object.name;

  if (object.type === 'JSXNamespacedName')
    return object.namespace.name + ':' + object.name.name;

  if (object.type === 'JSXMemberExpression')
    return getQualifiedJSXName(object.object) + '.' +
    getQualifiedJSXName(object.property);
}

module.exports = function(options) {
  options = options || {};
  return function(Parser) {
    return plugin({
      allowNamespaces: options.allowNamespaces !== false,
      allowNamespacedObjects: !!options.allowNamespacedObjects
    }, Parser);
  };
};

// This is `tokTypes` of the peer dep.
// This can be different instances from the actual `tokTypes` this plugin uses.
Object.defineProperty(module.exports, "tokTypes", ({
  get: function get_tokTypes() {
    return getJsxTokens(__webpack_require__(/*! acorn */ "./node_modules/acorn/dist/acorn.js")).tokTypes;
  },
  configurable: true,
  enumerable: true
}));

function plugin(options, Parser) {
  const acorn = Parser.acorn || __webpack_require__(/*! acorn */ "./node_modules/acorn/dist/acorn.js");
  const acornJsx = getJsxTokens(acorn);
  const tt = acorn.tokTypes;
  const tok = acornJsx.tokTypes;
  const tokContexts = acorn.tokContexts;
  const tc_oTag = acornJsx.tokContexts.tc_oTag;
  const tc_cTag = acornJsx.tokContexts.tc_cTag;
  const tc_expr = acornJsx.tokContexts.tc_expr;
  const isNewLine = acorn.isNewLine;
  const isIdentifierStart = acorn.isIdentifierStart;
  const isIdentifierChar = acorn.isIdentifierChar;

  return class extends Parser {
    // Expose actual `tokTypes` and `tokContexts` to other plugins.
    static get acornJsx() {
      return acornJsx;
    }

    // Reads inline JSX contents token.
    jsx_readToken() {
      let out = '', chunkStart = this.pos;
      for (;;) {
        if (this.pos >= this.input.length)
          this.raise(this.start, 'Unterminated JSX contents');
        let ch = this.input.charCodeAt(this.pos);

        switch (ch) {
        case 60: // '<'
        case 123: // '{'
          if (this.pos === this.start) {
            if (ch === 60 && this.exprAllowed) {
              ++this.pos;
              return this.finishToken(tok.jsxTagStart);
            }
            return this.getTokenFromCode(ch);
          }
          out += this.input.slice(chunkStart, this.pos);
          return this.finishToken(tok.jsxText, out);

        case 38: // '&'
          out += this.input.slice(chunkStart, this.pos);
          out += this.jsx_readEntity();
          chunkStart = this.pos;
          break;

        case 62: // '>'
        case 125: // '}'
          this.raise(
            this.pos,
            "Unexpected token `" + this.input[this.pos] + "`. Did you mean `" +
              (ch === 62 ? "&gt;" : "&rbrace;") + "` or " + "`{\"" + this.input[this.pos] + "\"}" + "`?"
          );

        default:
          if (isNewLine(ch)) {
            out += this.input.slice(chunkStart, this.pos);
            out += this.jsx_readNewLine(true);
            chunkStart = this.pos;
          } else {
            ++this.pos;
          }
        }
      }
    }

    jsx_readNewLine(normalizeCRLF) {
      let ch = this.input.charCodeAt(this.pos);
      let out;
      ++this.pos;
      if (ch === 13 && this.input.charCodeAt(this.pos) === 10) {
        ++this.pos;
        out = normalizeCRLF ? '\n' : '\r\n';
      } else {
        out = String.fromCharCode(ch);
      }
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }

      return out;
    }

    jsx_readString(quote) {
      let out = '', chunkStart = ++this.pos;
      for (;;) {
        if (this.pos >= this.input.length)
          this.raise(this.start, 'Unterminated string constant');
        let ch = this.input.charCodeAt(this.pos);
        if (ch === quote) break;
        if (ch === 38) { // '&'
          out += this.input.slice(chunkStart, this.pos);
          out += this.jsx_readEntity();
          chunkStart = this.pos;
        } else if (isNewLine(ch)) {
          out += this.input.slice(chunkStart, this.pos);
          out += this.jsx_readNewLine(false);
          chunkStart = this.pos;
        } else {
          ++this.pos;
        }
      }
      out += this.input.slice(chunkStart, this.pos++);
      return this.finishToken(tt.string, out);
    }

    jsx_readEntity() {
      let str = '', count = 0, entity;
      let ch = this.input[this.pos];
      if (ch !== '&')
        this.raise(this.pos, 'Entity must start with an ampersand');
      let startPos = ++this.pos;
      while (this.pos < this.input.length && count++ < 10) {
        ch = this.input[this.pos++];
        if (ch === ';') {
          if (str[0] === '#') {
            if (str[1] === 'x') {
              str = str.substr(2);
              if (hexNumber.test(str))
                entity = String.fromCharCode(parseInt(str, 16));
            } else {
              str = str.substr(1);
              if (decimalNumber.test(str))
                entity = String.fromCharCode(parseInt(str, 10));
            }
          } else {
            entity = XHTMLEntities[str];
          }
          break;
        }
        str += ch;
      }
      if (!entity) {
        this.pos = startPos;
        return '&';
      }
      return entity;
    }

    // Read a JSX identifier (valid tag or attribute name).
    //
    // Optimized version since JSX identifiers can't contain
    // escape characters and so can be read as single slice.
    // Also assumes that first character was already checked
    // by isIdentifierStart in readToken.

    jsx_readWord() {
      let ch, start = this.pos;
      do {
        ch = this.input.charCodeAt(++this.pos);
      } while (isIdentifierChar(ch) || ch === 45); // '-'
      return this.finishToken(tok.jsxName, this.input.slice(start, this.pos));
    }

    // Parse next token as JSX identifier

    jsx_parseIdentifier() {
      let node = this.startNode();
      if (this.type === tok.jsxName)
        node.name = this.value;
      else if (this.type.keyword)
        node.name = this.type.keyword;
      else
        this.unexpected();
      this.next();
      return this.finishNode(node, 'JSXIdentifier');
    }

    // Parse namespaced identifier.

    jsx_parseNamespacedName() {
      let startPos = this.start, startLoc = this.startLoc;
      let name = this.jsx_parseIdentifier();
      if (!options.allowNamespaces || !this.eat(tt.colon)) return name;
      var node = this.startNodeAt(startPos, startLoc);
      node.namespace = name;
      node.name = this.jsx_parseIdentifier();
      return this.finishNode(node, 'JSXNamespacedName');
    }

    // Parses element name in any form - namespaced, member
    // or single identifier.

    jsx_parseElementName() {
      if (this.type === tok.jsxTagEnd) return '';
      let startPos = this.start, startLoc = this.startLoc;
      let node = this.jsx_parseNamespacedName();
      if (this.type === tt.dot && node.type === 'JSXNamespacedName' && !options.allowNamespacedObjects) {
        this.unexpected();
      }
      while (this.eat(tt.dot)) {
        let newNode = this.startNodeAt(startPos, startLoc);
        newNode.object = node;
        newNode.property = this.jsx_parseIdentifier();
        node = this.finishNode(newNode, 'JSXMemberExpression');
      }
      return node;
    }

    // Parses any type of JSX attribute value.

    jsx_parseAttributeValue() {
      switch (this.type) {
      case tt.braceL:
        let node = this.jsx_parseExpressionContainer();
        if (node.expression.type === 'JSXEmptyExpression')
          this.raise(node.start, 'JSX attributes must only be assigned a non-empty expression');
        return node;

      case tok.jsxTagStart:
      case tt.string:
        return this.parseExprAtom();

      default:
        this.raise(this.start, 'JSX value should be either an expression or a quoted JSX text');
      }
    }

    // JSXEmptyExpression is unique type since it doesn't actually parse anything,
    // and so it should start at the end of last read token (left brace) and finish
    // at the beginning of the next one (right brace).

    jsx_parseEmptyExpression() {
      let node = this.startNodeAt(this.lastTokEnd, this.lastTokEndLoc);
      return this.finishNodeAt(node, 'JSXEmptyExpression', this.start, this.startLoc);
    }

    // Parses JSX expression enclosed into curly brackets.

    jsx_parseExpressionContainer() {
      let node = this.startNode();
      this.next();
      node.expression = this.type === tt.braceR
        ? this.jsx_parseEmptyExpression()
        : this.parseExpression();
      this.expect(tt.braceR);
      return this.finishNode(node, 'JSXExpressionContainer');
    }

    // Parses following JSX attribute name-value pair.

    jsx_parseAttribute() {
      let node = this.startNode();
      if (this.eat(tt.braceL)) {
        this.expect(tt.ellipsis);
        node.argument = this.parseMaybeAssign();
        this.expect(tt.braceR);
        return this.finishNode(node, 'JSXSpreadAttribute');
      }
      node.name = this.jsx_parseNamespacedName();
      node.value = this.eat(tt.eq) ? this.jsx_parseAttributeValue() : null;
      return this.finishNode(node, 'JSXAttribute');
    }

    // Parses JSX opening tag starting after '<'.

    jsx_parseOpeningElementAt(startPos, startLoc) {
      let node = this.startNodeAt(startPos, startLoc);
      node.attributes = [];
      let nodeName = this.jsx_parseElementName();
      if (nodeName) node.name = nodeName;
      while (this.type !== tt.slash && this.type !== tok.jsxTagEnd)
        node.attributes.push(this.jsx_parseAttribute());
      node.selfClosing = this.eat(tt.slash);
      this.expect(tok.jsxTagEnd);
      return this.finishNode(node, nodeName ? 'JSXOpeningElement' : 'JSXOpeningFragment');
    }

    // Parses JSX closing tag starting after '</'.

    jsx_parseClosingElementAt(startPos, startLoc) {
      let node = this.startNodeAt(startPos, startLoc);
      let nodeName = this.jsx_parseElementName();
      if (nodeName) node.name = nodeName;
      this.expect(tok.jsxTagEnd);
      return this.finishNode(node, nodeName ? 'JSXClosingElement' : 'JSXClosingFragment');
    }

    // Parses entire JSX element, including it's opening tag
    // (starting after '<'), attributes, contents and closing tag.

    jsx_parseElementAt(startPos, startLoc) {
      let node = this.startNodeAt(startPos, startLoc);
      let children = [];
      let openingElement = this.jsx_parseOpeningElementAt(startPos, startLoc);
      let closingElement = null;

      if (!openingElement.selfClosing) {
        contents: for (;;) {
          switch (this.type) {
          case tok.jsxTagStart:
            startPos = this.start; startLoc = this.startLoc;
            this.next();
            if (this.eat(tt.slash)) {
              closingElement = this.jsx_parseClosingElementAt(startPos, startLoc);
              break contents;
            }
            children.push(this.jsx_parseElementAt(startPos, startLoc));
            break;

          case tok.jsxText:
            children.push(this.parseExprAtom());
            break;

          case tt.braceL:
            children.push(this.jsx_parseExpressionContainer());
            break;

          default:
            this.unexpected();
          }
        }
        if (getQualifiedJSXName(closingElement.name) !== getQualifiedJSXName(openingElement.name)) {
          this.raise(
            closingElement.start,
            'Expected corresponding JSX closing tag for <' + getQualifiedJSXName(openingElement.name) + '>');
        }
      }
      let fragmentOrElement = openingElement.name ? 'Element' : 'Fragment';

      node['opening' + fragmentOrElement] = openingElement;
      node['closing' + fragmentOrElement] = closingElement;
      node.children = children;
      if (this.type === tt.relational && this.value === "<") {
        this.raise(this.start, "Adjacent JSX elements must be wrapped in an enclosing tag");
      }
      return this.finishNode(node, 'JSX' + fragmentOrElement);
    }

    // Parse JSX text

    jsx_parseText() {
      let node = this.parseLiteral(this.value);
      node.type = "JSXText";
      return node;
    }

    // Parses entire JSX element from current position.

    jsx_parseElement() {
      let startPos = this.start, startLoc = this.startLoc;
      this.next();
      return this.jsx_parseElementAt(startPos, startLoc);
    }

    parseExprAtom(refShortHandDefaultPos) {
      if (this.type === tok.jsxText)
        return this.jsx_parseText();
      else if (this.type === tok.jsxTagStart)
        return this.jsx_parseElement();
      else
        return super.parseExprAtom(refShortHandDefaultPos);
    }

    readToken(code) {
      let context = this.curContext();

      if (context === tc_expr) return this.jsx_readToken();

      if (context === tc_oTag || context === tc_cTag) {
        if (isIdentifierStart(code)) return this.jsx_readWord();

        if (code == 62) {
          ++this.pos;
          return this.finishToken(tok.jsxTagEnd);
        }

        if ((code === 34 || code === 39) && context == tc_oTag)
          return this.jsx_readString(code);
      }

      if (code === 60 && this.exprAllowed && this.input.charCodeAt(this.pos + 1) !== 33) {
        ++this.pos;
        return this.finishToken(tok.jsxTagStart);
      }
      return super.readToken(code);
    }

    updateContext(prevType) {
      if (this.type == tt.braceL) {
        var curContext = this.curContext();
        if (curContext == tc_oTag) this.context.push(tokContexts.b_expr);
        else if (curContext == tc_expr) this.context.push(tokContexts.b_tmpl);
        else super.updateContext(prevType);
        this.exprAllowed = true;
      } else if (this.type === tt.slash && prevType === tok.jsxTagStart) {
        this.context.length -= 2; // do not consider JSX expr -> JSX open tag -> ... anymore
        this.context.push(tc_cTag); // reconsider as closing tag context
        this.exprAllowed = false;
      } else {
        return super.updateContext(prevType);
      }
    }
  };
}


/***/ }),

/***/ "./node_modules/acorn-jsx/xhtml.js":
/*!*****************************************!*\
  !*** ./node_modules/acorn-jsx/xhtml.js ***!
  \*****************************************/
/***/ (function(module) {

module.exports = {
  quot: '\u0022',
  amp: '&',
  apos: '\u0027',
  lt: '<',
  gt: '>',
  nbsp: '\u00A0',
  iexcl: '\u00A1',
  cent: '\u00A2',
  pound: '\u00A3',
  curren: '\u00A4',
  yen: '\u00A5',
  brvbar: '\u00A6',
  sect: '\u00A7',
  uml: '\u00A8',
  copy: '\u00A9',
  ordf: '\u00AA',
  laquo: '\u00AB',
  not: '\u00AC',
  shy: '\u00AD',
  reg: '\u00AE',
  macr: '\u00AF',
  deg: '\u00B0',
  plusmn: '\u00B1',
  sup2: '\u00B2',
  sup3: '\u00B3',
  acute: '\u00B4',
  micro: '\u00B5',
  para: '\u00B6',
  middot: '\u00B7',
  cedil: '\u00B8',
  sup1: '\u00B9',
  ordm: '\u00BA',
  raquo: '\u00BB',
  frac14: '\u00BC',
  frac12: '\u00BD',
  frac34: '\u00BE',
  iquest: '\u00BF',
  Agrave: '\u00C0',
  Aacute: '\u00C1',
  Acirc: '\u00C2',
  Atilde: '\u00C3',
  Auml: '\u00C4',
  Aring: '\u00C5',
  AElig: '\u00C6',
  Ccedil: '\u00C7',
  Egrave: '\u00C8',
  Eacute: '\u00C9',
  Ecirc: '\u00CA',
  Euml: '\u00CB',
  Igrave: '\u00CC',
  Iacute: '\u00CD',
  Icirc: '\u00CE',
  Iuml: '\u00CF',
  ETH: '\u00D0',
  Ntilde: '\u00D1',
  Ograve: '\u00D2',
  Oacute: '\u00D3',
  Ocirc: '\u00D4',
  Otilde: '\u00D5',
  Ouml: '\u00D6',
  times: '\u00D7',
  Oslash: '\u00D8',
  Ugrave: '\u00D9',
  Uacute: '\u00DA',
  Ucirc: '\u00DB',
  Uuml: '\u00DC',
  Yacute: '\u00DD',
  THORN: '\u00DE',
  szlig: '\u00DF',
  agrave: '\u00E0',
  aacute: '\u00E1',
  acirc: '\u00E2',
  atilde: '\u00E3',
  auml: '\u00E4',
  aring: '\u00E5',
  aelig: '\u00E6',
  ccedil: '\u00E7',
  egrave: '\u00E8',
  eacute: '\u00E9',
  ecirc: '\u00EA',
  euml: '\u00EB',
  igrave: '\u00EC',
  iacute: '\u00ED',
  icirc: '\u00EE',
  iuml: '\u00EF',
  eth: '\u00F0',
  ntilde: '\u00F1',
  ograve: '\u00F2',
  oacute: '\u00F3',
  ocirc: '\u00F4',
  otilde: '\u00F5',
  ouml: '\u00F6',
  divide: '\u00F7',
  oslash: '\u00F8',
  ugrave: '\u00F9',
  uacute: '\u00FA',
  ucirc: '\u00FB',
  uuml: '\u00FC',
  yacute: '\u00FD',
  thorn: '\u00FE',
  yuml: '\u00FF',
  OElig: '\u0152',
  oelig: '\u0153',
  Scaron: '\u0160',
  scaron: '\u0161',
  Yuml: '\u0178',
  fnof: '\u0192',
  circ: '\u02C6',
  tilde: '\u02DC',
  Alpha: '\u0391',
  Beta: '\u0392',
  Gamma: '\u0393',
  Delta: '\u0394',
  Epsilon: '\u0395',
  Zeta: '\u0396',
  Eta: '\u0397',
  Theta: '\u0398',
  Iota: '\u0399',
  Kappa: '\u039A',
  Lambda: '\u039B',
  Mu: '\u039C',
  Nu: '\u039D',
  Xi: '\u039E',
  Omicron: '\u039F',
  Pi: '\u03A0',
  Rho: '\u03A1',
  Sigma: '\u03A3',
  Tau: '\u03A4',
  Upsilon: '\u03A5',
  Phi: '\u03A6',
  Chi: '\u03A7',
  Psi: '\u03A8',
  Omega: '\u03A9',
  alpha: '\u03B1',
  beta: '\u03B2',
  gamma: '\u03B3',
  delta: '\u03B4',
  epsilon: '\u03B5',
  zeta: '\u03B6',
  eta: '\u03B7',
  theta: '\u03B8',
  iota: '\u03B9',
  kappa: '\u03BA',
  lambda: '\u03BB',
  mu: '\u03BC',
  nu: '\u03BD',
  xi: '\u03BE',
  omicron: '\u03BF',
  pi: '\u03C0',
  rho: '\u03C1',
  sigmaf: '\u03C2',
  sigma: '\u03C3',
  tau: '\u03C4',
  upsilon: '\u03C5',
  phi: '\u03C6',
  chi: '\u03C7',
  psi: '\u03C8',
  omega: '\u03C9',
  thetasym: '\u03D1',
  upsih: '\u03D2',
  piv: '\u03D6',
  ensp: '\u2002',
  emsp: '\u2003',
  thinsp: '\u2009',
  zwnj: '\u200C',
  zwj: '\u200D',
  lrm: '\u200E',
  rlm: '\u200F',
  ndash: '\u2013',
  mdash: '\u2014',
  lsquo: '\u2018',
  rsquo: '\u2019',
  sbquo: '\u201A',
  ldquo: '\u201C',
  rdquo: '\u201D',
  bdquo: '\u201E',
  dagger: '\u2020',
  Dagger: '\u2021',
  bull: '\u2022',
  hellip: '\u2026',
  permil: '\u2030',
  prime: '\u2032',
  Prime: '\u2033',
  lsaquo: '\u2039',
  rsaquo: '\u203A',
  oline: '\u203E',
  frasl: '\u2044',
  euro: '\u20AC',
  image: '\u2111',
  weierp: '\u2118',
  real: '\u211C',
  trade: '\u2122',
  alefsym: '\u2135',
  larr: '\u2190',
  uarr: '\u2191',
  rarr: '\u2192',
  darr: '\u2193',
  harr: '\u2194',
  crarr: '\u21B5',
  lArr: '\u21D0',
  uArr: '\u21D1',
  rArr: '\u21D2',
  dArr: '\u21D3',
  hArr: '\u21D4',
  forall: '\u2200',
  part: '\u2202',
  exist: '\u2203',
  empty: '\u2205',
  nabla: '\u2207',
  isin: '\u2208',
  notin: '\u2209',
  ni: '\u220B',
  prod: '\u220F',
  sum: '\u2211',
  minus: '\u2212',
  lowast: '\u2217',
  radic: '\u221A',
  prop: '\u221D',
  infin: '\u221E',
  ang: '\u2220',
  and: '\u2227',
  or: '\u2228',
  cap: '\u2229',
  cup: '\u222A',
  'int': '\u222B',
  there4: '\u2234',
  sim: '\u223C',
  cong: '\u2245',
  asymp: '\u2248',
  ne: '\u2260',
  equiv: '\u2261',
  le: '\u2264',
  ge: '\u2265',
  sub: '\u2282',
  sup: '\u2283',
  nsub: '\u2284',
  sube: '\u2286',
  supe: '\u2287',
  oplus: '\u2295',
  otimes: '\u2297',
  perp: '\u22A5',
  sdot: '\u22C5',
  lceil: '\u2308',
  rceil: '\u2309',
  lfloor: '\u230A',
  rfloor: '\u230B',
  lang: '\u2329',
  rang: '\u232A',
  loz: '\u25CA',
  spades: '\u2660',
  clubs: '\u2663',
  hearts: '\u2665',
  diams: '\u2666'
};


/***/ }),

/***/ "./node_modules/acorn/dist/acorn.js":
/*!******************************************!*\
  !*** ./node_modules/acorn/dist/acorn.js ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports) {

(function (global, factory) {
   true ? factory(exports) :
  0;
})(this, (function (exports) { 'use strict';

  // This file was generated. Do not modify manually!
  var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 370, 1, 81, 2, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 406, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 9, 5351, 0, 7, 14, 13835, 9, 87, 9, 39, 4, 60, 6, 26, 9, 1014, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4706, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 983, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];

  // This file was generated. Do not modify manually!
  var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 68, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 349, 41, 7, 1, 79, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 159, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 264, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 4026, 582, 8634, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 689, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9, 1237, 43, 8, 8936, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 757, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4153, 7, 221, 3, 5761, 15, 7472, 3104, 541, 1507, 4938, 6, 4191];

  // This file was generated. Do not modify manually!
  var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u0898-\u089f\u08ca-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b55-\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3c\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0cf3\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d81-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ece\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u180f-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1abf-\u1ace\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua82c\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";

  // This file was generated. Do not modify manually!
  var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u0870-\u0887\u0889-\u088e\u08a0-\u08c9\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c5d\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cdd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d04-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u1711\u171f-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4c\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u31ff\u3400-\u4dbf\u4e00-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7ca\ua7d0\ua7d1\ua7d3\ua7d5-\ua7d9\ua7f2-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab69\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";

  // These are a run-length and offset encoded representation of the
  // >0xffff code points that are a valid part of identifiers. The
  // offset starts at 0x10000, and each pair of numbers represents an
  // offset to the next range, and then a size of the range.

  // Reserved word lists for various dialects of the language

  var reservedWords = {
    3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
    5: "class enum extends super const export import",
    6: "enum",
    strict: "implements interface let package private protected public static yield",
    strictBind: "eval arguments"
  };

  // And the keywords

  var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

  var keywords$1 = {
    5: ecma5AndLessKeywords,
    "5module": ecma5AndLessKeywords + " export import",
    6: ecma5AndLessKeywords + " const class extends export import super"
  };

  var keywordRelationalOperator = /^in(stanceof)?$/;

  // ## Character categories

  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  // This has a complexity linear to the value of the code. The
  // assumption is that looking up astral identifier characters is
  // rare.
  function isInAstralSet(code, set) {
    var pos = 0x10000;
    for (var i = 0; i < set.length; i += 2) {
      pos += set[i];
      if (pos > code) { return false }
      pos += set[i + 1];
      if (pos >= code) { return true }
    }
    return false
  }

  // Test whether a given character code starts an identifier.

  function isIdentifierStart(code, astral) {
    if (code < 65) { return code === 36 }
    if (code < 91) { return true }
    if (code < 97) { return code === 95 }
    if (code < 123) { return true }
    if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
    if (astral === false) { return false }
    return isInAstralSet(code, astralIdentifierStartCodes)
  }

  // Test whether a given character is part of an identifier.

  function isIdentifierChar(code, astral) {
    if (code < 48) { return code === 36 }
    if (code < 58) { return true }
    if (code < 65) { return false }
    if (code < 91) { return true }
    if (code < 97) { return code === 95 }
    if (code < 123) { return true }
    if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
    if (astral === false) { return false }
    return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
  }

  // ## Token types

  // The assignment of fine-grained, information-carrying type objects
  // allows the tokenizer to store the information it has about a
  // token in a way that is very cheap for the parser to look up.

  // All token type variables start with an underscore, to make them
  // easy to recognize.

  // The `beforeExpr` property is used to disambiguate between regular
  // expressions and divisions. It is set on all token types that can
  // be followed by an expression (thus, a slash after them would be a
  // regular expression).
  //
  // The `startsExpr` property is used to check if the token ends a
  // `yield` expression. It is set on all token types that either can
  // directly start an expression (like a quotation mark) or can
  // continue an expression (like the body of a string).
  //
  // `isLoop` marks a keyword as starting a loop, which is important
  // to know when parsing a label, in order to allow or disallow
  // continue jumps to that label.

  var TokenType = function TokenType(label, conf) {
    if ( conf === void 0 ) conf = {};

    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop || null;
    this.updateContext = null;
  };

  function binop(name, prec) {
    return new TokenType(name, {beforeExpr: true, binop: prec})
  }
  var beforeExpr = {beforeExpr: true}, startsExpr = {startsExpr: true};

  // Map keyword names to token types.

  var keywords = {};

  // Succinct definitions of keyword token types
  function kw(name, options) {
    if ( options === void 0 ) options = {};

    options.keyword = name;
    return keywords[name] = new TokenType(name, options)
  }

  var types$1 = {
    num: new TokenType("num", startsExpr),
    regexp: new TokenType("regexp", startsExpr),
    string: new TokenType("string", startsExpr),
    name: new TokenType("name", startsExpr),
    privateId: new TokenType("privateId", startsExpr),
    eof: new TokenType("eof"),

    // Punctuation token types.
    bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
    bracketR: new TokenType("]"),
    braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
    braceR: new TokenType("}"),
    parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
    parenR: new TokenType(")"),
    comma: new TokenType(",", beforeExpr),
    semi: new TokenType(";", beforeExpr),
    colon: new TokenType(":", beforeExpr),
    dot: new TokenType("."),
    question: new TokenType("?", beforeExpr),
    questionDot: new TokenType("?."),
    arrow: new TokenType("=>", beforeExpr),
    template: new TokenType("template"),
    invalidTemplate: new TokenType("invalidTemplate"),
    ellipsis: new TokenType("...", beforeExpr),
    backQuote: new TokenType("`", startsExpr),
    dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

    // Operators. These carry several kinds of properties to help the
    // parser use them properly (the presence of these properties is
    // what categorizes them as operators).
    //
    // `binop`, when present, specifies that this operator is a binary
    // operator, and will refer to its precedence.
    //
    // `prefix` and `postfix` mark the operator as a prefix or postfix
    // unary operator.
    //
    // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
    // binary operators with a very low precedence, that should result
    // in AssignmentExpression nodes.

    eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
    assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
    incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
    prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
    logicalOR: binop("||", 1),
    logicalAND: binop("&&", 2),
    bitwiseOR: binop("|", 3),
    bitwiseXOR: binop("^", 4),
    bitwiseAND: binop("&", 5),
    equality: binop("==/!=/===/!==", 6),
    relational: binop("</>/<=/>=", 7),
    bitShift: binop("<</>>/>>>", 8),
    plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
    modulo: binop("%", 10),
    star: binop("*", 10),
    slash: binop("/", 10),
    starstar: new TokenType("**", {beforeExpr: true}),
    coalesce: binop("??", 1),

    // Keyword token types.
    _break: kw("break"),
    _case: kw("case", beforeExpr),
    _catch: kw("catch"),
    _continue: kw("continue"),
    _debugger: kw("debugger"),
    _default: kw("default", beforeExpr),
    _do: kw("do", {isLoop: true, beforeExpr: true}),
    _else: kw("else", beforeExpr),
    _finally: kw("finally"),
    _for: kw("for", {isLoop: true}),
    _function: kw("function", startsExpr),
    _if: kw("if"),
    _return: kw("return", beforeExpr),
    _switch: kw("switch"),
    _throw: kw("throw", beforeExpr),
    _try: kw("try"),
    _var: kw("var"),
    _const: kw("const"),
    _while: kw("while", {isLoop: true}),
    _with: kw("with"),
    _new: kw("new", {beforeExpr: true, startsExpr: true}),
    _this: kw("this", startsExpr),
    _super: kw("super", startsExpr),
    _class: kw("class", startsExpr),
    _extends: kw("extends", beforeExpr),
    _export: kw("export"),
    _import: kw("import", startsExpr),
    _null: kw("null", startsExpr),
    _true: kw("true", startsExpr),
    _false: kw("false", startsExpr),
    _in: kw("in", {beforeExpr: true, binop: 7}),
    _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
    _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
    _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
    _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
  };

  // Matches a whole line break (where CRLF is considered a single
  // line break). Used to count lines.

  var lineBreak = /\r\n?|\n|\u2028|\u2029/;
  var lineBreakG = new RegExp(lineBreak.source, "g");

  function isNewLine(code) {
    return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
  }

  function nextLineBreak(code, from, end) {
    if ( end === void 0 ) end = code.length;

    for (var i = from; i < end; i++) {
      var next = code.charCodeAt(i);
      if (isNewLine(next))
        { return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1 }
    }
    return -1
  }

  var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

  var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

  var ref = Object.prototype;
  var hasOwnProperty = ref.hasOwnProperty;
  var toString = ref.toString;

  var hasOwn = Object.hasOwn || (function (obj, propName) { return (
    hasOwnProperty.call(obj, propName)
  ); });

  var isArray = Array.isArray || (function (obj) { return (
    toString.call(obj) === "[object Array]"
  ); });

  function wordsRegexp(words) {
    return new RegExp("^(?:" + words.replace(/ /g, "|") + ")$")
  }

  function codePointToString(code) {
    // UTF-16 Decoding
    if (code <= 0xFFFF) { return String.fromCharCode(code) }
    code -= 0x10000;
    return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
  }

  var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;

  // These are used when `options.locations` is on, for the
  // `startLoc` and `endLoc` properties.

  var Position = function Position(line, col) {
    this.line = line;
    this.column = col;
  };

  Position.prototype.offset = function offset (n) {
    return new Position(this.line, this.column + n)
  };

  var SourceLocation = function SourceLocation(p, start, end) {
    this.start = start;
    this.end = end;
    if (p.sourceFile !== null) { this.source = p.sourceFile; }
  };

  // The `getLineInfo` function is mostly useful when the
  // `locations` option is off (for performance reasons) and you
  // want to find the line/column position for a given character
  // offset. `input` should be the code string that the offset refers
  // into.

  function getLineInfo(input, offset) {
    for (var line = 1, cur = 0;;) {
      var nextBreak = nextLineBreak(input, cur, offset);
      if (nextBreak < 0) { return new Position(line, offset - cur) }
      ++line;
      cur = nextBreak;
    }
  }

  // A second argument must be given to configure the parser process.
  // These options are recognized (only `ecmaVersion` is required):

  var defaultOptions = {
    // `ecmaVersion` indicates the ECMAScript version to parse. Must be
    // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
    // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
    // (the latest version the library supports). This influences
    // support for strict mode, the set of reserved words, and support
    // for new syntax features.
    ecmaVersion: null,
    // `sourceType` indicates the mode the code should be parsed in.
    // Can be either `"script"` or `"module"`. This influences global
    // strict mode and parsing of `import` and `export` declarations.
    sourceType: "script",
    // `onInsertedSemicolon` can be a callback that will be called
    // when a semicolon is automatically inserted. It will be passed
    // the position of the comma as an offset, and if `locations` is
    // enabled, it is given the location as a `{line, column}` object
    // as second argument.
    onInsertedSemicolon: null,
    // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
    // trailing commas.
    onTrailingComma: null,
    // By default, reserved words are only enforced if ecmaVersion >= 5.
    // Set `allowReserved` to a boolean value to explicitly turn this on
    // an off. When this option has the value "never", reserved words
    // and keywords can also not be used as property names.
    allowReserved: null,
    // When enabled, a return at the top level is not considered an
    // error.
    allowReturnOutsideFunction: false,
    // When enabled, import/export statements are not constrained to
    // appearing at the top of the program, and an import.meta expression
    // in a script isn't considered an error.
    allowImportExportEverywhere: false,
    // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
    // When enabled, await identifiers are allowed to appear at the top-level scope,
    // but they are still not allowed in non-async functions.
    allowAwaitOutsideFunction: null,
    // When enabled, super identifiers are not constrained to
    // appearing in methods and do not raise an error when they appear elsewhere.
    allowSuperOutsideMethod: null,
    // When enabled, hashbang directive in the beginning of file is
    // allowed and treated as a line comment. Enabled by default when
    // `ecmaVersion` >= 2023.
    allowHashBang: false,
    // By default, the parser will verify that private properties are
    // only used in places where they are valid and have been declared.
    // Set this to false to turn such checks off.
    checkPrivateFields: true,
    // When `locations` is on, `loc` properties holding objects with
    // `start` and `end` properties in `{line, column}` form (with
    // line being 1-based and column 0-based) will be attached to the
    // nodes.
    locations: false,
    // A function can be passed as `onToken` option, which will
    // cause Acorn to call that function with object in the same
    // format as tokens returned from `tokenizer().getToken()`. Note
    // that you are not allowed to call the parser from the
    // callback—that will corrupt its internal state.
    onToken: null,
    // A function can be passed as `onComment` option, which will
    // cause Acorn to call that function with `(block, text, start,
    // end)` parameters whenever a comment is skipped. `block` is a
    // boolean indicating whether this is a block (`/* */`) comment,
    // `text` is the content of the comment, and `start` and `end` are
    // character offsets that denote the start and end of the comment.
    // When the `locations` option is on, two more parameters are
    // passed, the full `{line, column}` locations of the start and
    // end of the comments. Note that you are not allowed to call the
    // parser from the callback—that will corrupt its internal state.
    onComment: null,
    // Nodes have their start and end characters offsets recorded in
    // `start` and `end` properties (directly on the node, rather than
    // the `loc` object, which holds line/column data. To also add a
    // [semi-standardized][range] `range` property holding a `[start,
    // end]` array with the same numbers, set the `ranges` option to
    // `true`.
    //
    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
    ranges: false,
    // It is possible to parse multiple files into a single AST by
    // passing the tree produced by parsing the first file as
    // `program` option in subsequent parses. This will add the
    // toplevel forms of the parsed file to the `Program` (top) node
    // of an existing parse tree.
    program: null,
    // When `locations` is on, you can pass this to record the source
    // file in every node's `loc` object.
    sourceFile: null,
    // This value, if given, is stored in every node, whether
    // `locations` is on or off.
    directSourceFile: null,
    // When enabled, parenthesized expressions are represented by
    // (non-standard) ParenthesizedExpression nodes
    preserveParens: false
  };

  // Interpret and default an options object

  var warnedAboutEcmaVersion = false;

  function getOptions(opts) {
    var options = {};

    for (var opt in defaultOptions)
      { options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt]; }

    if (options.ecmaVersion === "latest") {
      options.ecmaVersion = 1e8;
    } else if (options.ecmaVersion == null) {
      if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
        warnedAboutEcmaVersion = true;
        console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
      }
      options.ecmaVersion = 11;
    } else if (options.ecmaVersion >= 2015) {
      options.ecmaVersion -= 2009;
    }

    if (options.allowReserved == null)
      { options.allowReserved = options.ecmaVersion < 5; }

    if (!opts || opts.allowHashBang == null)
      { options.allowHashBang = options.ecmaVersion >= 14; }

    if (isArray(options.onToken)) {
      var tokens = options.onToken;
      options.onToken = function (token) { return tokens.push(token); };
    }
    if (isArray(options.onComment))
      { options.onComment = pushComment(options, options.onComment); }

    return options
  }

  function pushComment(options, array) {
    return function(block, text, start, end, startLoc, endLoc) {
      var comment = {
        type: block ? "Block" : "Line",
        value: text,
        start: start,
        end: end
      };
      if (options.locations)
        { comment.loc = new SourceLocation(this, startLoc, endLoc); }
      if (options.ranges)
        { comment.range = [start, end]; }
      array.push(comment);
    }
  }

  // Each scope gets a bitset that may contain these flags
  var
      SCOPE_TOP = 1,
      SCOPE_FUNCTION = 2,
      SCOPE_ASYNC = 4,
      SCOPE_GENERATOR = 8,
      SCOPE_ARROW = 16,
      SCOPE_SIMPLE_CATCH = 32,
      SCOPE_SUPER = 64,
      SCOPE_DIRECT_SUPER = 128,
      SCOPE_CLASS_STATIC_BLOCK = 256,
      SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;

  function functionFlags(async, generator) {
    return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0)
  }

  // Used in checkLVal* and declareName to determine the type of a binding
  var
      BIND_NONE = 0, // Not a binding
      BIND_VAR = 1, // Var-style binding
      BIND_LEXICAL = 2, // Let- or const-style binding
      BIND_FUNCTION = 3, // Function declaration
      BIND_SIMPLE_CATCH = 4, // Simple (identifier pattern) catch binding
      BIND_OUTSIDE = 5; // Special case for function names as bound inside the function

  var Parser = function Parser(options, input, startPos) {
    this.options = options = getOptions(options);
    this.sourceFile = options.sourceFile;
    this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
    var reserved = "";
    if (options.allowReserved !== true) {
      reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
      if (options.sourceType === "module") { reserved += " await"; }
    }
    this.reservedWords = wordsRegexp(reserved);
    var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
    this.reservedWordsStrict = wordsRegexp(reservedStrict);
    this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
    this.input = String(input);

    // Used to signal to callers of `readWord1` whether the word
    // contained any escape sequences. This is needed because words with
    // escape sequences must not be interpreted as keywords.
    this.containsEsc = false;

    // Set up token state

    // The current position of the tokenizer in the input.
    if (startPos) {
      this.pos = startPos;
      this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
    } else {
      this.pos = this.lineStart = 0;
      this.curLine = 1;
    }

    // Properties of the current token:
    // Its type
    this.type = types$1.eof;
    // For tokens that include more information than their type, the value
    this.value = null;
    // Its start and end offset
    this.start = this.end = this.pos;
    // And, if locations are used, the {line, column} object
    // corresponding to those offsets
    this.startLoc = this.endLoc = this.curPosition();

    // Position information for the previous token
    this.lastTokEndLoc = this.lastTokStartLoc = null;
    this.lastTokStart = this.lastTokEnd = this.pos;

    // The context stack is used to superficially track syntactic
    // context to predict whether a regular expression is allowed in a
    // given position.
    this.context = this.initialContext();
    this.exprAllowed = true;

    // Figure out if it's a module code.
    this.inModule = options.sourceType === "module";
    this.strict = this.inModule || this.strictDirective(this.pos);

    // Used to signify the start of a potential arrow function
    this.potentialArrowAt = -1;
    this.potentialArrowInForAwait = false;

    // Positions to delayed-check that yield/await does not exist in default parameters.
    this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
    // Labels in scope.
    this.labels = [];
    // Thus-far undefined exports.
    this.undefinedExports = Object.create(null);

    // If enabled, skip leading hashbang line.
    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
      { this.skipLineComment(2); }

    // Scope tracking for duplicate variable names (see scope.js)
    this.scopeStack = [];
    this.enterScope(SCOPE_TOP);

    // For RegExp validation
    this.regexpState = null;

    // The stack of private names.
    // Each element has two properties: 'declared' and 'used'.
    // When it exited from the outermost class definition, all used private names must be declared.
    this.privateNameStack = [];
  };

  var prototypeAccessors = { inFunction: { configurable: true },inGenerator: { configurable: true },inAsync: { configurable: true },canAwait: { configurable: true },allowSuper: { configurable: true },allowDirectSuper: { configurable: true },treatFunctionsAsVar: { configurable: true },allowNewDotTarget: { configurable: true },inClassStaticBlock: { configurable: true } };

  Parser.prototype.parse = function parse () {
    var node = this.options.program || this.startNode();
    this.nextToken();
    return this.parseTopLevel(node)
  };

  prototypeAccessors.inFunction.get = function () { return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0 };

  prototypeAccessors.inGenerator.get = function () { return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0 && !this.currentVarScope().inClassFieldInit };

  prototypeAccessors.inAsync.get = function () { return (this.currentVarScope().flags & SCOPE_ASYNC) > 0 && !this.currentVarScope().inClassFieldInit };

  prototypeAccessors.canAwait.get = function () {
    for (var i = this.scopeStack.length - 1; i >= 0; i--) {
      var scope = this.scopeStack[i];
      if (scope.inClassFieldInit || scope.flags & SCOPE_CLASS_STATIC_BLOCK) { return false }
      if (scope.flags & SCOPE_FUNCTION) { return (scope.flags & SCOPE_ASYNC) > 0 }
    }
    return (this.inModule && this.options.ecmaVersion >= 13) || this.options.allowAwaitOutsideFunction
  };

  prototypeAccessors.allowSuper.get = function () {
    var ref = this.currentThisScope();
      var flags = ref.flags;
      var inClassFieldInit = ref.inClassFieldInit;
    return (flags & SCOPE_SUPER) > 0 || inClassFieldInit || this.options.allowSuperOutsideMethod
  };

  prototypeAccessors.allowDirectSuper.get = function () { return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0 };

  prototypeAccessors.treatFunctionsAsVar.get = function () { return this.treatFunctionsAsVarInScope(this.currentScope()) };

  prototypeAccessors.allowNewDotTarget.get = function () {
    var ref = this.currentThisScope();
      var flags = ref.flags;
      var inClassFieldInit = ref.inClassFieldInit;
    return (flags & (SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK)) > 0 || inClassFieldInit
  };

  prototypeAccessors.inClassStaticBlock.get = function () {
    return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0
  };

  Parser.extend = function extend () {
      var plugins = [], len = arguments.length;
      while ( len-- ) plugins[ len ] = arguments[ len ];

    var cls = this;
    for (var i = 0; i < plugins.length; i++) { cls = plugins[i](cls); }
    return cls
  };

  Parser.parse = function parse (input, options) {
    return new this(options, input).parse()
  };

  Parser.parseExpressionAt = function parseExpressionAt (input, pos, options) {
    var parser = new this(options, input, pos);
    parser.nextToken();
    return parser.parseExpression()
  };

  Parser.tokenizer = function tokenizer (input, options) {
    return new this(options, input)
  };

  Object.defineProperties( Parser.prototype, prototypeAccessors );

  var pp$9 = Parser.prototype;

  // ## Parser utilities

  var literal = /^(?:'((?:\\.|[^'\\])*?)'|"((?:\\.|[^"\\])*?)")/;
  pp$9.strictDirective = function(start) {
    if (this.options.ecmaVersion < 5) { return false }
    for (;;) {
      // Try to find string literal.
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      var match = literal.exec(this.input.slice(start));
      if (!match) { return false }
      if ((match[1] || match[2]) === "use strict") {
        skipWhiteSpace.lastIndex = start + match[0].length;
        var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
        var next = this.input.charAt(end);
        return next === ";" || next === "}" ||
          (lineBreak.test(spaceAfter[0]) &&
           !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "="))
      }
      start += match[0].length;

      // Skip semicolon, if any.
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      if (this.input[start] === ";")
        { start++; }
    }
  };

  // Predicate that tests whether the next token is of the given
  // type, and if yes, consumes it as a side effect.

  pp$9.eat = function(type) {
    if (this.type === type) {
      this.next();
      return true
    } else {
      return false
    }
  };

  // Tests whether parsed token is a contextual keyword.

  pp$9.isContextual = function(name) {
    return this.type === types$1.name && this.value === name && !this.containsEsc
  };

  // Consumes contextual keyword if possible.

  pp$9.eatContextual = function(name) {
    if (!this.isContextual(name)) { return false }
    this.next();
    return true
  };

  // Asserts that following token is given contextual keyword.

  pp$9.expectContextual = function(name) {
    if (!this.eatContextual(name)) { this.unexpected(); }
  };

  // Test whether a semicolon can be inserted at the current position.

  pp$9.canInsertSemicolon = function() {
    return this.type === types$1.eof ||
      this.type === types$1.braceR ||
      lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  };

  pp$9.insertSemicolon = function() {
    if (this.canInsertSemicolon()) {
      if (this.options.onInsertedSemicolon)
        { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
      return true
    }
  };

  // Consume a semicolon, or, failing that, see if we are allowed to
  // pretend that there is a semicolon at this position.

  pp$9.semicolon = function() {
    if (!this.eat(types$1.semi) && !this.insertSemicolon()) { this.unexpected(); }
  };

  pp$9.afterTrailingComma = function(tokType, notNext) {
    if (this.type === tokType) {
      if (this.options.onTrailingComma)
        { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
      if (!notNext)
        { this.next(); }
      return true
    }
  };

  // Expect a token of a given type. If found, consume it, otherwise,
  // raise an unexpected token error.

  pp$9.expect = function(type) {
    this.eat(type) || this.unexpected();
  };

  // Raise an unexpected token error.

  pp$9.unexpected = function(pos) {
    this.raise(pos != null ? pos : this.start, "Unexpected token");
  };

  var DestructuringErrors = function DestructuringErrors() {
    this.shorthandAssign =
    this.trailingComma =
    this.parenthesizedAssign =
    this.parenthesizedBind =
    this.doubleProto =
      -1;
  };

  pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
    if (!refDestructuringErrors) { return }
    if (refDestructuringErrors.trailingComma > -1)
      { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
    var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
    if (parens > -1) { this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern"); }
  };

  pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
    if (!refDestructuringErrors) { return false }
    var shorthandAssign = refDestructuringErrors.shorthandAssign;
    var doubleProto = refDestructuringErrors.doubleProto;
    if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
    if (shorthandAssign >= 0)
      { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
    if (doubleProto >= 0)
      { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
  };

  pp$9.checkYieldAwaitInDefaultParams = function() {
    if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
      { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
    if (this.awaitPos)
      { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
  };

  pp$9.isSimpleAssignTarget = function(expr) {
    if (expr.type === "ParenthesizedExpression")
      { return this.isSimpleAssignTarget(expr.expression) }
    return expr.type === "Identifier" || expr.type === "MemberExpression"
  };

  var pp$8 = Parser.prototype;

  // ### Statement parsing

  // Parse a program. Initializes the parser, reads any number of
  // statements, and wraps them in a Program node.  Optionally takes a
  // `program` argument.  If present, the statements will be appended
  // to its body instead of creating a new node.

  pp$8.parseTopLevel = function(node) {
    var exports = Object.create(null);
    if (!node.body) { node.body = []; }
    while (this.type !== types$1.eof) {
      var stmt = this.parseStatement(null, true, exports);
      node.body.push(stmt);
    }
    if (this.inModule)
      { for (var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1)
        {
          var name = list[i];

          this.raiseRecoverable(this.undefinedExports[name].start, ("Export '" + name + "' is not defined"));
        } }
    this.adaptDirectivePrologue(node.body);
    this.next();
    node.sourceType = this.options.sourceType;
    return this.finishNode(node, "Program")
  };

  var loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"};

  pp$8.isLet = function(context) {
    if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
    // For ambiguous cases, determine if a LexicalDeclaration (or only a
    // Statement) is allowed here. If context is not empty then only a Statement
    // is allowed. However, `let [` is an explicit negative lookahead for
    // ExpressionStatement, so special-case it first.
    if (nextCh === 91 || nextCh === 92) { return true } // '[', '/'
    if (context) { return false }

    if (nextCh === 123 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true } // '{', astral
    if (isIdentifierStart(nextCh, true)) {
      var pos = next + 1;
      while (isIdentifierChar(nextCh = this.input.charCodeAt(pos), true)) { ++pos; }
      if (nextCh === 92 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true }
      var ident = this.input.slice(next, pos);
      if (!keywordRelationalOperator.test(ident)) { return true }
    }
    return false
  };

  // check 'async [no LineTerminator here] function'
  // - 'async /*foo*/ function' is OK.
  // - 'async /*\n*/ function' is invalid.
  pp$8.isAsyncFunction = function() {
    if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
      { return false }

    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, after;
    return !lineBreak.test(this.input.slice(this.pos, next)) &&
      this.input.slice(next, next + 8) === "function" &&
      (next + 8 === this.input.length ||
       !(isIdentifierChar(after = this.input.charCodeAt(next + 8)) || after > 0xd7ff && after < 0xdc00))
  };

  // Parse a single statement.
  //
  // If expecting a statement and finding a slash operator, parse a
  // regular expression literal. This is to handle cases like
  // `if (foo) /blah/.exec(foo)`, where looking at the previous token
  // does not help.

  pp$8.parseStatement = function(context, topLevel, exports) {
    var starttype = this.type, node = this.startNode(), kind;

    if (this.isLet(context)) {
      starttype = types$1._var;
      kind = "let";
    }

    // Most types of statements are recognized by the keyword they
    // start with. Many are trivial to parse, some require a bit of
    // complexity.

    switch (starttype) {
    case types$1._break: case types$1._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
    case types$1._debugger: return this.parseDebuggerStatement(node)
    case types$1._do: return this.parseDoStatement(node)
    case types$1._for: return this.parseForStatement(node)
    case types$1._function:
      // Function as sole body of either an if statement or a labeled statement
      // works, but not when it is part of a labeled statement that is the sole
      // body of an if statement.
      if ((context && (this.strict || context !== "if" && context !== "label")) && this.options.ecmaVersion >= 6) { this.unexpected(); }
      return this.parseFunctionStatement(node, false, !context)
    case types$1._class:
      if (context) { this.unexpected(); }
      return this.parseClass(node, true)
    case types$1._if: return this.parseIfStatement(node)
    case types$1._return: return this.parseReturnStatement(node)
    case types$1._switch: return this.parseSwitchStatement(node)
    case types$1._throw: return this.parseThrowStatement(node)
    case types$1._try: return this.parseTryStatement(node)
    case types$1._const: case types$1._var:
      kind = kind || this.value;
      if (context && kind !== "var") { this.unexpected(); }
      return this.parseVarStatement(node, kind)
    case types$1._while: return this.parseWhileStatement(node)
    case types$1._with: return this.parseWithStatement(node)
    case types$1.braceL: return this.parseBlock(true, node)
    case types$1.semi: return this.parseEmptyStatement(node)
    case types$1._export:
    case types$1._import:
      if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
        if (nextCh === 40 || nextCh === 46) // '(' or '.'
          { return this.parseExpressionStatement(node, this.parseExpression()) }
      }

      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel)
          { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
        if (!this.inModule)
          { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
      }
      return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports)

      // If the statement does not start with a statement keyword or a
      // brace, it's an ExpressionStatement or LabeledStatement. We
      // simply start parsing an expression, and afterwards, if the
      // next token is a colon and the expression was a simple
      // Identifier node, we switch to interpreting it as a label.
    default:
      if (this.isAsyncFunction()) {
        if (context) { this.unexpected(); }
        this.next();
        return this.parseFunctionStatement(node, true, !context)
      }

      var maybeName = this.value, expr = this.parseExpression();
      if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon))
        { return this.parseLabeledStatement(node, maybeName, expr, context) }
      else { return this.parseExpressionStatement(node, expr) }
    }
  };

  pp$8.parseBreakContinueStatement = function(node, keyword) {
    var isBreak = keyword === "break";
    this.next();
    if (this.eat(types$1.semi) || this.insertSemicolon()) { node.label = null; }
    else if (this.type !== types$1.name) { this.unexpected(); }
    else {
      node.label = this.parseIdent();
      this.semicolon();
    }

    // Verify that there is an actual destination to break or
    // continue to.
    var i = 0;
    for (; i < this.labels.length; ++i) {
      var lab = this.labels[i];
      if (node.label == null || lab.name === node.label.name) {
        if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
        if (node.label && isBreak) { break }
      }
    }
    if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
    return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
  };

  pp$8.parseDebuggerStatement = function(node) {
    this.next();
    this.semicolon();
    return this.finishNode(node, "DebuggerStatement")
  };

  pp$8.parseDoStatement = function(node) {
    this.next();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("do");
    this.labels.pop();
    this.expect(types$1._while);
    node.test = this.parseParenExpression();
    if (this.options.ecmaVersion >= 6)
      { this.eat(types$1.semi); }
    else
      { this.semicolon(); }
    return this.finishNode(node, "DoWhileStatement")
  };

  // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
  // loop is non-trivial. Basically, we have to parse the init `var`
  // statement or expression, disallowing the `in` operator (see
  // the second parameter to `parseExpression`), and then check
  // whether the next token is `in` or `of`. When there is no init
  // part (semicolon immediately after the opening parenthesis), it
  // is a regular `for` loop.

  pp$8.parseForStatement = function(node) {
    this.next();
    var awaitAt = (this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await")) ? this.lastTokStart : -1;
    this.labels.push(loopLabel);
    this.enterScope(0);
    this.expect(types$1.parenL);
    if (this.type === types$1.semi) {
      if (awaitAt > -1) { this.unexpected(awaitAt); }
      return this.parseFor(node, null)
    }
    var isLet = this.isLet();
    if (this.type === types$1._var || this.type === types$1._const || isLet) {
      var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
      this.next();
      this.parseVar(init$1, true, kind);
      this.finishNode(init$1, "VariableDeclaration");
      if ((this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1) {
        if (this.options.ecmaVersion >= 9) {
          if (this.type === types$1._in) {
            if (awaitAt > -1) { this.unexpected(awaitAt); }
          } else { node.await = awaitAt > -1; }
        }
        return this.parseForIn(node, init$1)
      }
      if (awaitAt > -1) { this.unexpected(awaitAt); }
      return this.parseFor(node, init$1)
    }
    var startsWithLet = this.isContextual("let"), isForOf = false;
    var refDestructuringErrors = new DestructuringErrors;
    var init = this.parseExpression(awaitAt > -1 ? "await" : true, refDestructuringErrors);
    if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      if (this.options.ecmaVersion >= 9) {
        if (this.type === types$1._in) {
          if (awaitAt > -1) { this.unexpected(awaitAt); }
        } else { node.await = awaitAt > -1; }
      }
      if (startsWithLet && isForOf) { this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'."); }
      this.toAssignable(init, false, refDestructuringErrors);
      this.checkLValPattern(init);
      return this.parseForIn(node, init)
    } else {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, init)
  };

  pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
    this.next();
    return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync)
  };

  pp$8.parseIfStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    // allow function declarations in branches, but only in non-strict mode
    node.consequent = this.parseStatement("if");
    node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
    return this.finishNode(node, "IfStatement")
  };

  pp$8.parseReturnStatement = function(node) {
    if (!this.inFunction && !this.options.allowReturnOutsideFunction)
      { this.raise(this.start, "'return' outside of function"); }
    this.next();

    // In `return` (and `break`/`continue`), the keywords with
    // optional arguments, we eagerly look for a semicolon or the
    // possibility to insert one.

    if (this.eat(types$1.semi) || this.insertSemicolon()) { node.argument = null; }
    else { node.argument = this.parseExpression(); this.semicolon(); }
    return this.finishNode(node, "ReturnStatement")
  };

  pp$8.parseSwitchStatement = function(node) {
    this.next();
    node.discriminant = this.parseParenExpression();
    node.cases = [];
    this.expect(types$1.braceL);
    this.labels.push(switchLabel);
    this.enterScope(0);

    // Statements under must be grouped (by label) in SwitchCase
    // nodes. `cur` is used to keep the node that we are currently
    // adding statements to.

    var cur;
    for (var sawDefault = false; this.type !== types$1.braceR;) {
      if (this.type === types$1._case || this.type === types$1._default) {
        var isCase = this.type === types$1._case;
        if (cur) { this.finishNode(cur, "SwitchCase"); }
        node.cases.push(cur = this.startNode());
        cur.consequent = [];
        this.next();
        if (isCase) {
          cur.test = this.parseExpression();
        } else {
          if (sawDefault) { this.raiseRecoverable(this.lastTokStart, "Multiple default clauses"); }
          sawDefault = true;
          cur.test = null;
        }
        this.expect(types$1.colon);
      } else {
        if (!cur) { this.unexpected(); }
        cur.consequent.push(this.parseStatement(null));
      }
    }
    this.exitScope();
    if (cur) { this.finishNode(cur, "SwitchCase"); }
    this.next(); // Closing brace
    this.labels.pop();
    return this.finishNode(node, "SwitchStatement")
  };

  pp$8.parseThrowStatement = function(node) {
    this.next();
    if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
      { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
    node.argument = this.parseExpression();
    this.semicolon();
    return this.finishNode(node, "ThrowStatement")
  };

  // Reused empty array added for node fields that are always empty.

  var empty$1 = [];

  pp$8.parseCatchClauseParam = function() {
    var param = this.parseBindingAtom();
    var simple = param.type === "Identifier";
    this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
    this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
    this.expect(types$1.parenR);

    return param
  };

  pp$8.parseTryStatement = function(node) {
    this.next();
    node.block = this.parseBlock();
    node.handler = null;
    if (this.type === types$1._catch) {
      var clause = this.startNode();
      this.next();
      if (this.eat(types$1.parenL)) {
        clause.param = this.parseCatchClauseParam();
      } else {
        if (this.options.ecmaVersion < 10) { this.unexpected(); }
        clause.param = null;
        this.enterScope(0);
      }
      clause.body = this.parseBlock(false);
      this.exitScope();
      node.handler = this.finishNode(clause, "CatchClause");
    }
    node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
    if (!node.handler && !node.finalizer)
      { this.raise(node.start, "Missing catch or finally clause"); }
    return this.finishNode(node, "TryStatement")
  };

  pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
    this.next();
    this.parseVar(node, false, kind, allowMissingInitializer);
    this.semicolon();
    return this.finishNode(node, "VariableDeclaration")
  };

  pp$8.parseWhileStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("while");
    this.labels.pop();
    return this.finishNode(node, "WhileStatement")
  };

  pp$8.parseWithStatement = function(node) {
    if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
    this.next();
    node.object = this.parseParenExpression();
    node.body = this.parseStatement("with");
    return this.finishNode(node, "WithStatement")
  };

  pp$8.parseEmptyStatement = function(node) {
    this.next();
    return this.finishNode(node, "EmptyStatement")
  };

  pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
    for (var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1)
      {
      var label = list[i$1];

      if (label.name === maybeName)
        { this.raise(expr.start, "Label '" + maybeName + "' is already declared");
    } }
    var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
    for (var i = this.labels.length - 1; i >= 0; i--) {
      var label$1 = this.labels[i];
      if (label$1.statementStart === node.start) {
        // Update information about previous labels on this node
        label$1.statementStart = this.start;
        label$1.kind = kind;
      } else { break }
    }
    this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
    node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
    this.labels.pop();
    node.label = expr;
    return this.finishNode(node, "LabeledStatement")
  };

  pp$8.parseExpressionStatement = function(node, expr) {
    node.expression = expr;
    this.semicolon();
    return this.finishNode(node, "ExpressionStatement")
  };

  // Parse a semicolon-enclosed block of statements, handling `"use
  // strict"` declarations when `allowStrict` is true (used for
  // function bodies).

  pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
    if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;
    if ( node === void 0 ) node = this.startNode();

    node.body = [];
    this.expect(types$1.braceL);
    if (createNewLexicalScope) { this.enterScope(0); }
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    if (exitStrict) { this.strict = false; }
    this.next();
    if (createNewLexicalScope) { this.exitScope(); }
    return this.finishNode(node, "BlockStatement")
  };

  // Parse a regular `for` loop. The disambiguation code in
  // `parseStatement` will already have parsed the init statement or
  // expression.

  pp$8.parseFor = function(node, init) {
    node.init = init;
    this.expect(types$1.semi);
    node.test = this.type === types$1.semi ? null : this.parseExpression();
    this.expect(types$1.semi);
    node.update = this.type === types$1.parenR ? null : this.parseExpression();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, "ForStatement")
  };

  // Parse a `for`/`in` and `for`/`of` loop, which are almost
  // same from parser's perspective.

  pp$8.parseForIn = function(node, init) {
    var isForIn = this.type === types$1._in;
    this.next();

    if (
      init.type === "VariableDeclaration" &&
      init.declarations[0].init != null &&
      (
        !isForIn ||
        this.options.ecmaVersion < 8 ||
        this.strict ||
        init.kind !== "var" ||
        init.declarations[0].id.type !== "Identifier"
      )
    ) {
      this.raise(
        init.start,
        ((isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer")
      );
    }
    node.left = init;
    node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement")
  };

  // Parse a list of variable declarations.

  pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
    node.declarations = [];
    node.kind = kind;
    for (;;) {
      var decl = this.startNode();
      this.parseVarId(decl, kind);
      if (this.eat(types$1.eq)) {
        decl.init = this.parseMaybeAssign(isFor);
      } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of")))) {
        this.unexpected();
      } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
        this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
      } else {
        decl.init = null;
      }
      node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
      if (!this.eat(types$1.comma)) { break }
    }
    return node
  };

  pp$8.parseVarId = function(decl, kind) {
    decl.id = this.parseBindingAtom();
    this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
  };

  var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;

  // Parse a function declaration or literal (depending on the
  // `statement & FUNC_STATEMENT`).

  // Remove `allowExpressionBody` for 7.0.0, as it is only called with false
  pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
    this.initFunction(node);
    if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
      if (this.type === types$1.star && (statement & FUNC_HANGING_STATEMENT))
        { this.unexpected(); }
      node.generator = this.eat(types$1.star);
    }
    if (this.options.ecmaVersion >= 8)
      { node.async = !!isAsync; }

    if (statement & FUNC_STATEMENT) {
      node.id = (statement & FUNC_NULLABLE_ID) && this.type !== types$1.name ? null : this.parseIdent();
      if (node.id && !(statement & FUNC_HANGING_STATEMENT))
        // If it is a regular function declaration in sloppy mode, then it is
        // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
        // mode depends on properties of the current scope (see
        // treatFunctionsAsVar).
        { this.checkLValSimple(node.id, (this.strict || node.generator || node.async) ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION); }
    }

    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(node.async, node.generator));

    if (!(statement & FUNC_STATEMENT))
      { node.id = this.type === types$1.name ? this.parseIdent() : null; }

    this.parseFunctionParams(node);
    this.parseFunctionBody(node, allowExpressionBody, false, forInit);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, (statement & FUNC_STATEMENT) ? "FunctionDeclaration" : "FunctionExpression")
  };

  pp$8.parseFunctionParams = function(node) {
    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
  };

  // Parse a class declaration or literal (depending on the
  // `isStatement` parameter).

  pp$8.parseClass = function(node, isStatement) {
    this.next();

    // ecma-262 14.6 Class Definitions
    // A class definition is always strict mode code.
    var oldStrict = this.strict;
    this.strict = true;

    this.parseClassId(node, isStatement);
    this.parseClassSuper(node);
    var privateNameMap = this.enterClassBody();
    var classBody = this.startNode();
    var hadConstructor = false;
    classBody.body = [];
    this.expect(types$1.braceL);
    while (this.type !== types$1.braceR) {
      var element = this.parseClassElement(node.superClass !== null);
      if (element) {
        classBody.body.push(element);
        if (element.type === "MethodDefinition" && element.kind === "constructor") {
          if (hadConstructor) { this.raiseRecoverable(element.start, "Duplicate constructor in the same class"); }
          hadConstructor = true;
        } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
          this.raiseRecoverable(element.key.start, ("Identifier '#" + (element.key.name) + "' has already been declared"));
        }
      }
    }
    this.strict = oldStrict;
    this.next();
    node.body = this.finishNode(classBody, "ClassBody");
    this.exitClassBody();
    return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
  };

  pp$8.parseClassElement = function(constructorAllowsSuper) {
    if (this.eat(types$1.semi)) { return null }

    var ecmaVersion = this.options.ecmaVersion;
    var node = this.startNode();
    var keyName = "";
    var isGenerator = false;
    var isAsync = false;
    var kind = "method";
    var isStatic = false;

    if (this.eatContextual("static")) {
      // Parse static init block
      if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
        this.parseClassStaticBlock(node);
        return node
      }
      if (this.isClassElementNameStart() || this.type === types$1.star) {
        isStatic = true;
      } else {
        keyName = "static";
      }
    }
    node.static = isStatic;
    if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
      if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
        isAsync = true;
      } else {
        keyName = "async";
      }
    }
    if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) {
      isGenerator = true;
    }
    if (!keyName && !isAsync && !isGenerator) {
      var lastValue = this.value;
      if (this.eatContextual("get") || this.eatContextual("set")) {
        if (this.isClassElementNameStart()) {
          kind = lastValue;
        } else {
          keyName = lastValue;
        }
      }
    }

    // Parse element name
    if (keyName) {
      // 'async', 'get', 'set', or 'static' were not a keyword contextually.
      // The last token is any of those. Make it the element name.
      node.computed = false;
      node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
      node.key.name = keyName;
      this.finishNode(node.key, "Identifier");
    } else {
      this.parseClassElementName(node);
    }

    // Parse element value
    if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
      var isConstructor = !node.static && checkKeyName(node, "constructor");
      var allowsDirectSuper = isConstructor && constructorAllowsSuper;
      // Couldn't move this check into the 'parseClassMethod' method for backward compatibility.
      if (isConstructor && kind !== "method") { this.raise(node.key.start, "Constructor can't have get/set modifier"); }
      node.kind = isConstructor ? "constructor" : kind;
      this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
    } else {
      this.parseClassField(node);
    }

    return node
  };

  pp$8.isClassElementNameStart = function() {
    return (
      this.type === types$1.name ||
      this.type === types$1.privateId ||
      this.type === types$1.num ||
      this.type === types$1.string ||
      this.type === types$1.bracketL ||
      this.type.keyword
    )
  };

  pp$8.parseClassElementName = function(element) {
    if (this.type === types$1.privateId) {
      if (this.value === "constructor") {
        this.raise(this.start, "Classes can't have an element named '#constructor'");
      }
      element.computed = false;
      element.key = this.parsePrivateIdent();
    } else {
      this.parsePropertyName(element);
    }
  };

  pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
    // Check key and flags
    var key = method.key;
    if (method.kind === "constructor") {
      if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
      if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
    } else if (method.static && checkKeyName(method, "prototype")) {
      this.raise(key.start, "Classes may not have a static property named prototype");
    }

    // Parse value
    var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);

    // Check value
    if (method.kind === "get" && value.params.length !== 0)
      { this.raiseRecoverable(value.start, "getter should have no params"); }
    if (method.kind === "set" && value.params.length !== 1)
      { this.raiseRecoverable(value.start, "setter should have exactly one param"); }
    if (method.kind === "set" && value.params[0].type === "RestElement")
      { this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params"); }

    return this.finishNode(method, "MethodDefinition")
  };

  pp$8.parseClassField = function(field) {
    if (checkKeyName(field, "constructor")) {
      this.raise(field.key.start, "Classes can't have a field named 'constructor'");
    } else if (field.static && checkKeyName(field, "prototype")) {
      this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
    }

    if (this.eat(types$1.eq)) {
      // To raise SyntaxError if 'arguments' exists in the initializer.
      var scope = this.currentThisScope();
      var inClassFieldInit = scope.inClassFieldInit;
      scope.inClassFieldInit = true;
      field.value = this.parseMaybeAssign();
      scope.inClassFieldInit = inClassFieldInit;
    } else {
      field.value = null;
    }
    this.semicolon();

    return this.finishNode(field, "PropertyDefinition")
  };

  pp$8.parseClassStaticBlock = function(node) {
    node.body = [];

    var oldLabels = this.labels;
    this.labels = [];
    this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    this.next();
    this.exitScope();
    this.labels = oldLabels;

    return this.finishNode(node, "StaticBlock")
  };

  pp$8.parseClassId = function(node, isStatement) {
    if (this.type === types$1.name) {
      node.id = this.parseIdent();
      if (isStatement)
        { this.checkLValSimple(node.id, BIND_LEXICAL, false); }
    } else {
      if (isStatement === true)
        { this.unexpected(); }
      node.id = null;
    }
  };

  pp$8.parseClassSuper = function(node) {
    node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
  };

  pp$8.enterClassBody = function() {
    var element = {declared: Object.create(null), used: []};
    this.privateNameStack.push(element);
    return element.declared
  };

  pp$8.exitClassBody = function() {
    var ref = this.privateNameStack.pop();
    var declared = ref.declared;
    var used = ref.used;
    if (!this.options.checkPrivateFields) { return }
    var len = this.privateNameStack.length;
    var parent = len === 0 ? null : this.privateNameStack[len - 1];
    for (var i = 0; i < used.length; ++i) {
      var id = used[i];
      if (!hasOwn(declared, id.name)) {
        if (parent) {
          parent.used.push(id);
        } else {
          this.raiseRecoverable(id.start, ("Private field '#" + (id.name) + "' must be declared in an enclosing class"));
        }
      }
    }
  };

  function isPrivateNameConflicted(privateNameMap, element) {
    var name = element.key.name;
    var curr = privateNameMap[name];

    var next = "true";
    if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
      next = (element.static ? "s" : "i") + element.kind;
    }

    // `class { get #a(){}; static set #a(_){} }` is also conflict.
    if (
      curr === "iget" && next === "iset" ||
      curr === "iset" && next === "iget" ||
      curr === "sget" && next === "sset" ||
      curr === "sset" && next === "sget"
    ) {
      privateNameMap[name] = "true";
      return false
    } else if (!curr) {
      privateNameMap[name] = next;
      return false
    } else {
      return true
    }
  }

  function checkKeyName(node, name) {
    var computed = node.computed;
    var key = node.key;
    return !computed && (
      key.type === "Identifier" && key.name === name ||
      key.type === "Literal" && key.value === name
    )
  }

  // Parses module export declaration.

  pp$8.parseExportAllDeclaration = function(node, exports) {
    if (this.options.ecmaVersion >= 11) {
      if (this.eatContextual("as")) {
        node.exported = this.parseModuleExportName();
        this.checkExport(exports, node.exported, this.lastTokStart);
      } else {
        node.exported = null;
      }
    }
    this.expectContextual("from");
    if (this.type !== types$1.string) { this.unexpected(); }
    node.source = this.parseExprAtom();
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration")
  };

  pp$8.parseExport = function(node, exports) {
    this.next();
    // export * from '...'
    if (this.eat(types$1.star)) {
      return this.parseExportAllDeclaration(node, exports)
    }
    if (this.eat(types$1._default)) { // export default ...
      this.checkExport(exports, "default", this.lastTokStart);
      node.declaration = this.parseExportDefaultDeclaration();
      return this.finishNode(node, "ExportDefaultDeclaration")
    }
    // export var|const|let|function|class ...
    if (this.shouldParseExportStatement()) {
      node.declaration = this.parseExportDeclaration(node);
      if (node.declaration.type === "VariableDeclaration")
        { this.checkVariableExport(exports, node.declaration.declarations); }
      else
        { this.checkExport(exports, node.declaration.id, node.declaration.id.start); }
      node.specifiers = [];
      node.source = null;
    } else { // export { x, y as z } [from '...']
      node.declaration = null;
      node.specifiers = this.parseExportSpecifiers(exports);
      if (this.eatContextual("from")) {
        if (this.type !== types$1.string) { this.unexpected(); }
        node.source = this.parseExprAtom();
      } else {
        for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
          // check for keywords used as local names
          var spec = list[i];

          this.checkUnreserved(spec.local);
          // check if export is defined
          this.checkLocalExport(spec.local);

          if (spec.local.type === "Literal") {
            this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
          }
        }

        node.source = null;
      }
      this.semicolon();
    }
    return this.finishNode(node, "ExportNamedDeclaration")
  };

  pp$8.parseExportDeclaration = function(node) {
    return this.parseStatement(null)
  };

  pp$8.parseExportDefaultDeclaration = function() {
    var isAsync;
    if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
      var fNode = this.startNode();
      this.next();
      if (isAsync) { this.next(); }
      return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync)
    } else if (this.type === types$1._class) {
      var cNode = this.startNode();
      return this.parseClass(cNode, "nullableID")
    } else {
      var declaration = this.parseMaybeAssign();
      this.semicolon();
      return declaration
    }
  };

  pp$8.checkExport = function(exports, name, pos) {
    if (!exports) { return }
    if (typeof name !== "string")
      { name = name.type === "Identifier" ? name.name : name.value; }
    if (hasOwn(exports, name))
      { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
    exports[name] = true;
  };

  pp$8.checkPatternExport = function(exports, pat) {
    var type = pat.type;
    if (type === "Identifier")
      { this.checkExport(exports, pat, pat.start); }
    else if (type === "ObjectPattern")
      { for (var i = 0, list = pat.properties; i < list.length; i += 1)
        {
          var prop = list[i];

          this.checkPatternExport(exports, prop);
        } }
    else if (type === "ArrayPattern")
      { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
        var elt = list$1[i$1];

          if (elt) { this.checkPatternExport(exports, elt); }
      } }
    else if (type === "Property")
      { this.checkPatternExport(exports, pat.value); }
    else if (type === "AssignmentPattern")
      { this.checkPatternExport(exports, pat.left); }
    else if (type === "RestElement")
      { this.checkPatternExport(exports, pat.argument); }
    else if (type === "ParenthesizedExpression")
      { this.checkPatternExport(exports, pat.expression); }
  };

  pp$8.checkVariableExport = function(exports, decls) {
    if (!exports) { return }
    for (var i = 0, list = decls; i < list.length; i += 1)
      {
      var decl = list[i];

      this.checkPatternExport(exports, decl.id);
    }
  };

  pp$8.shouldParseExportStatement = function() {
    return this.type.keyword === "var" ||
      this.type.keyword === "const" ||
      this.type.keyword === "class" ||
      this.type.keyword === "function" ||
      this.isLet() ||
      this.isAsyncFunction()
  };

  // Parses a comma-separated list of module exports.

  pp$8.parseExportSpecifier = function(exports) {
    var node = this.startNode();
    node.local = this.parseModuleExportName();

    node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
    this.checkExport(
      exports,
      node.exported,
      node.exported.start
    );

    return this.finishNode(node, "ExportSpecifier")
  };

  pp$8.parseExportSpecifiers = function(exports) {
    var nodes = [], first = true;
    // export { x, y as z } [from '...']
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      nodes.push(this.parseExportSpecifier(exports));
    }
    return nodes
  };

  // Parses import declaration.

  pp$8.parseImport = function(node) {
    this.next();

    // import '...'
    if (this.type === types$1.string) {
      node.specifiers = empty$1;
      node.source = this.parseExprAtom();
    } else {
      node.specifiers = this.parseImportSpecifiers();
      this.expectContextual("from");
      node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
    }
    this.semicolon();
    return this.finishNode(node, "ImportDeclaration")
  };

  // Parses a comma-separated list of module imports.

  pp$8.parseImportSpecifier = function() {
    var node = this.startNode();
    node.imported = this.parseModuleExportName();

    if (this.eatContextual("as")) {
      node.local = this.parseIdent();
    } else {
      this.checkUnreserved(node.imported);
      node.local = node.imported;
    }
    this.checkLValSimple(node.local, BIND_LEXICAL);

    return this.finishNode(node, "ImportSpecifier")
  };

  pp$8.parseImportDefaultSpecifier = function() {
    // import defaultObj, { x, y as z } from '...'
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportDefaultSpecifier")
  };

  pp$8.parseImportNamespaceSpecifier = function() {
    var node = this.startNode();
    this.next();
    this.expectContextual("as");
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportNamespaceSpecifier")
  };

  pp$8.parseImportSpecifiers = function() {
    var nodes = [], first = true;
    if (this.type === types$1.name) {
      nodes.push(this.parseImportDefaultSpecifier());
      if (!this.eat(types$1.comma)) { return nodes }
    }
    if (this.type === types$1.star) {
      nodes.push(this.parseImportNamespaceSpecifier());
      return nodes
    }
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      nodes.push(this.parseImportSpecifier());
    }
    return nodes
  };

  pp$8.parseModuleExportName = function() {
    if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
      var stringLiteral = this.parseLiteral(this.value);
      if (loneSurrogate.test(stringLiteral.value)) {
        this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
      }
      return stringLiteral
    }
    return this.parseIdent(true)
  };

  // Set `ExpressionStatement#directive` property for directive prologues.
  pp$8.adaptDirectivePrologue = function(statements) {
    for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
      statements[i].directive = statements[i].expression.raw.slice(1, -1);
    }
  };
  pp$8.isDirectiveCandidate = function(statement) {
    return (
      this.options.ecmaVersion >= 5 &&
      statement.type === "ExpressionStatement" &&
      statement.expression.type === "Literal" &&
      typeof statement.expression.value === "string" &&
      // Reject parenthesized strings.
      (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
    )
  };

  var pp$7 = Parser.prototype;

  // Convert existing expression atom to assignable pattern
  // if possible.

  pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 6 && node) {
      switch (node.type) {
      case "Identifier":
        if (this.inAsync && node.name === "await")
          { this.raise(node.start, "Cannot use 'await' as identifier inside an async function"); }
        break

      case "ObjectPattern":
      case "ArrayPattern":
      case "AssignmentPattern":
      case "RestElement":
        break

      case "ObjectExpression":
        node.type = "ObjectPattern";
        if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
        for (var i = 0, list = node.properties; i < list.length; i += 1) {
          var prop = list[i];

        this.toAssignable(prop, isBinding);
          // Early error:
          //   AssignmentRestProperty[Yield, Await] :
          //     `...` DestructuringAssignmentTarget[Yield, Await]
          //
          //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
          if (
            prop.type === "RestElement" &&
            (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
          ) {
            this.raise(prop.argument.start, "Unexpected token");
          }
        }
        break

      case "Property":
        // AssignmentProperty has type === "Property"
        if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
        this.toAssignable(node.value, isBinding);
        break

      case "ArrayExpression":
        node.type = "ArrayPattern";
        if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
        this.toAssignableList(node.elements, isBinding);
        break

      case "SpreadElement":
        node.type = "RestElement";
        this.toAssignable(node.argument, isBinding);
        if (node.argument.type === "AssignmentPattern")
          { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
        break

      case "AssignmentExpression":
        if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
        node.type = "AssignmentPattern";
        delete node.operator;
        this.toAssignable(node.left, isBinding);
        break

      case "ParenthesizedExpression":
        this.toAssignable(node.expression, isBinding, refDestructuringErrors);
        break

      case "ChainExpression":
        this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
        break

      case "MemberExpression":
        if (!isBinding) { break }

      default:
        this.raise(node.start, "Assigning to rvalue");
      }
    } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
    return node
  };

  // Convert list of expression atoms to binding list.

  pp$7.toAssignableList = function(exprList, isBinding) {
    var end = exprList.length;
    for (var i = 0; i < end; i++) {
      var elt = exprList[i];
      if (elt) { this.toAssignable(elt, isBinding); }
    }
    if (end) {
      var last = exprList[end - 1];
      if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
        { this.unexpected(last.argument.start); }
    }
    return exprList
  };

  // Parses spread element.

  pp$7.parseSpread = function(refDestructuringErrors) {
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    return this.finishNode(node, "SpreadElement")
  };

  pp$7.parseRestBinding = function() {
    var node = this.startNode();
    this.next();

    // RestElement inside of a function parameter must be an identifier
    if (this.options.ecmaVersion === 6 && this.type !== types$1.name)
      { this.unexpected(); }

    node.argument = this.parseBindingAtom();

    return this.finishNode(node, "RestElement")
  };

  // Parses lvalue (assignable) atom.

  pp$7.parseBindingAtom = function() {
    if (this.options.ecmaVersion >= 6) {
      switch (this.type) {
      case types$1.bracketL:
        var node = this.startNode();
        this.next();
        node.elements = this.parseBindingList(types$1.bracketR, true, true);
        return this.finishNode(node, "ArrayPattern")

      case types$1.braceL:
        return this.parseObj(true)
      }
    }
    return this.parseIdent()
  };

  pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (first) { first = false; }
      else { this.expect(types$1.comma); }
      if (allowEmpty && this.type === types$1.comma) {
        elts.push(null);
      } else if (allowTrailingComma && this.afterTrailingComma(close)) {
        break
      } else if (this.type === types$1.ellipsis) {
        var rest = this.parseRestBinding();
        this.parseBindingListItem(rest);
        elts.push(rest);
        if (this.type === types$1.comma) { this.raiseRecoverable(this.start, "Comma is not permitted after the rest element"); }
        this.expect(close);
        break
      } else {
        elts.push(this.parseAssignableListItem(allowModifiers));
      }
    }
    return elts
  };

  pp$7.parseAssignableListItem = function(allowModifiers) {
    var elem = this.parseMaybeDefault(this.start, this.startLoc);
    this.parseBindingListItem(elem);
    return elem
  };

  pp$7.parseBindingListItem = function(param) {
    return param
  };

  // Parses assignment pattern around given atom if possible.

  pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
    left = left || this.parseBindingAtom();
    if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) { return left }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.right = this.parseMaybeAssign();
    return this.finishNode(node, "AssignmentPattern")
  };

  // The following three functions all verify that a node is an lvalue —
  // something that can be bound, or assigned to. In order to do so, they perform
  // a variety of checks:
  //
  // - Check that none of the bound/assigned-to identifiers are reserved words.
  // - Record name declarations for bindings in the appropriate scope.
  // - Check duplicate argument names, if checkClashes is set.
  //
  // If a complex binding pattern is encountered (e.g., object and array
  // destructuring), the entire pattern is recursively checked.
  //
  // There are three versions of checkLVal*() appropriate for different
  // circumstances:
  //
  // - checkLValSimple() shall be used if the syntactic construct supports
  //   nothing other than identifiers and member expressions. Parenthesized
  //   expressions are also correctly handled. This is generally appropriate for
  //   constructs for which the spec says
  //
  //   > It is a Syntax Error if AssignmentTargetType of [the production] is not
  //   > simple.
  //
  //   It is also appropriate for checking if an identifier is valid and not
  //   defined elsewhere, like import declarations or function/class identifiers.
  //
  //   Examples where this is used include:
  //     a += …;
  //     import a from '…';
  //   where a is the node to be checked.
  //
  // - checkLValPattern() shall be used if the syntactic construct supports
  //   anything checkLValSimple() supports, as well as object and array
  //   destructuring patterns. This is generally appropriate for constructs for
  //   which the spec says
  //
  //   > It is a Syntax Error if [the production] is neither an ObjectLiteral nor
  //   > an ArrayLiteral and AssignmentTargetType of [the production] is not
  //   > simple.
  //
  //   Examples where this is used include:
  //     (a = …);
  //     const a = …;
  //     try { … } catch (a) { … }
  //   where a is the node to be checked.
  //
  // - checkLValInnerPattern() shall be used if the syntactic construct supports
  //   anything checkLValPattern() supports, as well as default assignment
  //   patterns, rest elements, and other constructs that may appear within an
  //   object or array destructuring pattern.
  //
  //   As a special case, function parameters also use checkLValInnerPattern(),
  //   as they also support defaults and rest constructs.
  //
  // These functions deliberately support both assignment and binding constructs,
  // as the logic for both is exceedingly similar. If the node is the target of
  // an assignment, then bindingType should be set to BIND_NONE. Otherwise, it
  // should be set to the appropriate BIND_* constant, like BIND_VAR or
  // BIND_LEXICAL.
  //
  // If the function is called with a non-BIND_NONE bindingType, then
  // additionally a checkClashes object may be specified to allow checking for
  // duplicate argument names. checkClashes is ignored if the provided construct
  // is an assignment (i.e., bindingType is BIND_NONE).

  pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
    if ( bindingType === void 0 ) bindingType = BIND_NONE;

    var isBind = bindingType !== BIND_NONE;

    switch (expr.type) {
    case "Identifier":
      if (this.strict && this.reservedWordsStrictBind.test(expr.name))
        { this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
      if (isBind) {
        if (bindingType === BIND_LEXICAL && expr.name === "let")
          { this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name"); }
        if (checkClashes) {
          if (hasOwn(checkClashes, expr.name))
            { this.raiseRecoverable(expr.start, "Argument name clash"); }
          checkClashes[expr.name] = true;
        }
        if (bindingType !== BIND_OUTSIDE) { this.declareName(expr.name, bindingType, expr.start); }
      }
      break

    case "ChainExpression":
      this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
      break

    case "MemberExpression":
      if (isBind) { this.raiseRecoverable(expr.start, "Binding member expression"); }
      break

    case "ParenthesizedExpression":
      if (isBind) { this.raiseRecoverable(expr.start, "Binding parenthesized expression"); }
      return this.checkLValSimple(expr.expression, bindingType, checkClashes)

    default:
      this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
    }
  };

  pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
    if ( bindingType === void 0 ) bindingType = BIND_NONE;

    switch (expr.type) {
    case "ObjectPattern":
      for (var i = 0, list = expr.properties; i < list.length; i += 1) {
        var prop = list[i];

      this.checkLValInnerPattern(prop, bindingType, checkClashes);
      }
      break

    case "ArrayPattern":
      for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
        var elem = list$1[i$1];

      if (elem) { this.checkLValInnerPattern(elem, bindingType, checkClashes); }
      }
      break

    default:
      this.checkLValSimple(expr, bindingType, checkClashes);
    }
  };

  pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
    if ( bindingType === void 0 ) bindingType = BIND_NONE;

    switch (expr.type) {
    case "Property":
      // AssignmentProperty has type === "Property"
      this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
      break

    case "AssignmentPattern":
      this.checkLValPattern(expr.left, bindingType, checkClashes);
      break

    case "RestElement":
      this.checkLValPattern(expr.argument, bindingType, checkClashes);
      break

    default:
      this.checkLValPattern(expr, bindingType, checkClashes);
    }
  };

  // The algorithm used to determine whether a regexp can appear at a
  // given point in the program is loosely based on sweet.js' approach.
  // See https://github.com/mozilla/sweet.js/wiki/design


  var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
    this.generator = !!generator;
  };

  var types = {
    b_stat: new TokContext("{", false),
    b_expr: new TokContext("{", true),
    b_tmpl: new TokContext("${", false),
    p_stat: new TokContext("(", false),
    p_expr: new TokContext("(", true),
    q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
    f_stat: new TokContext("function", false),
    f_expr: new TokContext("function", true),
    f_expr_gen: new TokContext("function", true, false, null, true),
    f_gen: new TokContext("function", false, false, null, true)
  };

  var pp$6 = Parser.prototype;

  pp$6.initialContext = function() {
    return [types.b_stat]
  };

  pp$6.curContext = function() {
    return this.context[this.context.length - 1]
  };

  pp$6.braceIsBlock = function(prevType) {
    var parent = this.curContext();
    if (parent === types.f_expr || parent === types.f_stat)
      { return true }
    if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr))
      { return !parent.isExpr }

    // The check for `tt.name && exprAllowed` detects whether we are
    // after a `yield` or `of` construct. See the `updateContext` for
    // `tt.name`.
    if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed)
      { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
    if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow)
      { return true }
    if (prevType === types$1.braceL)
      { return parent === types.b_stat }
    if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name)
      { return false }
    return !this.exprAllowed
  };

  pp$6.inGeneratorContext = function() {
    for (var i = this.context.length - 1; i >= 1; i--) {
      var context = this.context[i];
      if (context.token === "function")
        { return context.generator }
    }
    return false
  };

  pp$6.updateContext = function(prevType) {
    var update, type = this.type;
    if (type.keyword && prevType === types$1.dot)
      { this.exprAllowed = false; }
    else if (update = type.updateContext)
      { update.call(this, prevType); }
    else
      { this.exprAllowed = type.beforeExpr; }
  };

  // Used to handle egde cases when token context could not be inferred correctly during tokenization phase

  pp$6.overrideContext = function(tokenCtx) {
    if (this.curContext() !== tokenCtx) {
      this.context[this.context.length - 1] = tokenCtx;
    }
  };

  // Token-specific context update code

  types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
    if (this.context.length === 1) {
      this.exprAllowed = true;
      return
    }
    var out = this.context.pop();
    if (out === types.b_stat && this.curContext().token === "function") {
      out = this.context.pop();
    }
    this.exprAllowed = !out.isExpr;
  };

  types$1.braceL.updateContext = function(prevType) {
    this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
    this.exprAllowed = true;
  };

  types$1.dollarBraceL.updateContext = function() {
    this.context.push(types.b_tmpl);
    this.exprAllowed = true;
  };

  types$1.parenL.updateContext = function(prevType) {
    var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
    this.context.push(statementParens ? types.p_stat : types.p_expr);
    this.exprAllowed = true;
  };

  types$1.incDec.updateContext = function() {
    // tokExprAllowed stays unchanged
  };

  types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
    if (prevType.beforeExpr && prevType !== types$1._else &&
        !(prevType === types$1.semi && this.curContext() !== types.p_stat) &&
        !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
        !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat))
      { this.context.push(types.f_expr); }
    else
      { this.context.push(types.f_stat); }
    this.exprAllowed = false;
  };

  types$1.backQuote.updateContext = function() {
    if (this.curContext() === types.q_tmpl)
      { this.context.pop(); }
    else
      { this.context.push(types.q_tmpl); }
    this.exprAllowed = false;
  };

  types$1.star.updateContext = function(prevType) {
    if (prevType === types$1._function) {
      var index = this.context.length - 1;
      if (this.context[index] === types.f_expr)
        { this.context[index] = types.f_expr_gen; }
      else
        { this.context[index] = types.f_gen; }
    }
    this.exprAllowed = true;
  };

  types$1.name.updateContext = function(prevType) {
    var allowed = false;
    if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
      if (this.value === "of" && !this.exprAllowed ||
          this.value === "yield" && this.inGeneratorContext())
        { allowed = true; }
    }
    this.exprAllowed = allowed;
  };

  // A recursive descent parser operates by defining functions for all
  // syntactic elements, and recursively calling those, each function
  // advancing the input stream and returning an AST node. Precedence
  // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
  // instead of `(!x)[1]` is handled by the fact that the parser
  // function that parses unary prefix operators is called first, and
  // in turn calls the function that parses `[]` subscripts — that
  // way, it'll receive the node for `x[1]` already parsed, and wraps
  // *that* in the unary operator node.
  //
  // Acorn uses an [operator precedence parser][opp] to handle binary
  // operator precedence, because it is much more compact than using
  // the technique outlined above, which uses different, nesting
  // functions to specify precedence, for all of the ten binary
  // precedence levels that JavaScript defines.
  //
  // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser


  var pp$5 = Parser.prototype;

  // Check if property name clashes with already added.
  // Object/class getters and setters are not allowed to clash —
  // either with each other or with an init property — and in
  // strict mode, init properties are also not allowed to be repeated.

  pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
      { return }
    if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
      { return }
    var key = prop.key;
    var name;
    switch (key.type) {
    case "Identifier": name = key.name; break
    case "Literal": name = String(key.value); break
    default: return
    }
    var kind = prop.kind;
    if (this.options.ecmaVersion >= 6) {
      if (name === "__proto__" && kind === "init") {
        if (propHash.proto) {
          if (refDestructuringErrors) {
            if (refDestructuringErrors.doubleProto < 0) {
              refDestructuringErrors.doubleProto = key.start;
            }
          } else {
            this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
          }
        }
        propHash.proto = true;
      }
      return
    }
    name = "$" + name;
    var other = propHash[name];
    if (other) {
      var redefinition;
      if (kind === "init") {
        redefinition = this.strict && other.init || other.get || other.set;
      } else {
        redefinition = other.init || other[kind];
      }
      if (redefinition)
        { this.raiseRecoverable(key.start, "Redefinition of property"); }
    } else {
      other = propHash[name] = {
        init: false,
        get: false,
        set: false
      };
    }
    other[kind] = true;
  };

  // ### Expression parsing

  // These nest, from the most general expression type at the top to
  // 'atomic', nondivisible expression types at the bottom. Most of
  // the functions will simply let the function(s) below them parse,
  // and, *if* the syntactic construct they handle is present, wrap
  // the AST node that the inner parser gave them in another node.

  // Parse a full expression. The optional arguments are used to
  // forbid the `in` operator (in for loops initalization expressions)
  // and provide reference for storing '=' operator inside shorthand
  // property assignment in contexts where both object expression
  // and object pattern might appear (so it's possible to raise
  // delayed syntax error at correct position).

  pp$5.parseExpression = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeAssign(forInit, refDestructuringErrors);
    if (this.type === types$1.comma) {
      var node = this.startNodeAt(startPos, startLoc);
      node.expressions = [expr];
      while (this.eat(types$1.comma)) { node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors)); }
      return this.finishNode(node, "SequenceExpression")
    }
    return expr
  };

  // Parse an assignment expression. This includes applications of
  // operators like `+=`.

  pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
    if (this.isContextual("yield")) {
      if (this.inGenerator) { return this.parseYield(forInit) }
      // The tokenizer will assume an expression is allowed after
      // `yield`, but this isn't that kind of yield
      else { this.exprAllowed = false; }
    }

    var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
    if (refDestructuringErrors) {
      oldParenAssign = refDestructuringErrors.parenthesizedAssign;
      oldTrailingComma = refDestructuringErrors.trailingComma;
      oldDoubleProto = refDestructuringErrors.doubleProto;
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
    } else {
      refDestructuringErrors = new DestructuringErrors;
      ownDestructuringErrors = true;
    }

    var startPos = this.start, startLoc = this.startLoc;
    if (this.type === types$1.parenL || this.type === types$1.name) {
      this.potentialArrowAt = this.start;
      this.potentialArrowInForAwait = forInit === "await";
    }
    var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
    if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
    if (this.type.isAssign) {
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = this.value;
      if (this.type === types$1.eq)
        { left = this.toAssignable(left, false, refDestructuringErrors); }
      if (!ownDestructuringErrors) {
        refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
      }
      if (refDestructuringErrors.shorthandAssign >= left.start)
        { refDestructuringErrors.shorthandAssign = -1; } // reset because shorthand default was used correctly
      if (this.type === types$1.eq)
        { this.checkLValPattern(left); }
      else
        { this.checkLValSimple(left); }
      node.left = left;
      this.next();
      node.right = this.parseMaybeAssign(forInit);
      if (oldDoubleProto > -1) { refDestructuringErrors.doubleProto = oldDoubleProto; }
      return this.finishNode(node, "AssignmentExpression")
    } else {
      if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
    }
    if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
    if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
    return left
  };

  // Parse a ternary conditional (`?:`) operator.

  pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprOps(forInit, refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    if (this.eat(types$1.question)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.test = expr;
      node.consequent = this.parseMaybeAssign();
      this.expect(types$1.colon);
      node.alternate = this.parseMaybeAssign(forInit);
      return this.finishNode(node, "ConditionalExpression")
    }
    return expr
  };

  // Start the precedence parser.

  pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit)
  };

  // Parse binary operators with the operator precedence parsing
  // algorithm. `left` is the left-hand side of the operator.
  // `minPrec` provides context that allows the function to stop and
  // defer further parser to one of its callers when it encounters an
  // operator that has a lower precedence than the set it is parsing.

  pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
    var prec = this.type.binop;
    if (prec != null && (!forInit || this.type !== types$1._in)) {
      if (prec > minPrec) {
        var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
        var coalesce = this.type === types$1.coalesce;
        if (coalesce) {
          // Handle the precedence of `tt.coalesce` as equal to the range of logical expressions.
          // In other words, `node.right` shouldn't contain logical expressions in order to check the mixed error.
          prec = types$1.logicalAND.binop;
        }
        var op = this.value;
        this.next();
        var startPos = this.start, startLoc = this.startLoc;
        var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
        var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
        if ((logical && this.type === types$1.coalesce) || (coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND))) {
          this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
        }
        return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit)
      }
    }
    return left
  };

  pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
    if (right.type === "PrivateIdentifier") { this.raise(right.start, "Private identifier can only be left side of binary expression"); }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.operator = op;
    node.right = right;
    return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
  };

  // Parse unary operators, both prefix and postfix.

  pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
    var startPos = this.start, startLoc = this.startLoc, expr;
    if (this.isContextual("await") && this.canAwait) {
      expr = this.parseAwait(forInit);
      sawUnary = true;
    } else if (this.type.prefix) {
      var node = this.startNode(), update = this.type === types$1.incDec;
      node.operator = this.value;
      node.prefix = true;
      this.next();
      node.argument = this.parseMaybeUnary(null, true, update, forInit);
      this.checkExpressionErrors(refDestructuringErrors, true);
      if (update) { this.checkLValSimple(node.argument); }
      else if (this.strict && node.operator === "delete" &&
               node.argument.type === "Identifier")
        { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
      else if (node.operator === "delete" && isPrivateFieldAccess(node.argument))
        { this.raiseRecoverable(node.start, "Private fields can not be deleted"); }
      else { sawUnary = true; }
      expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    } else if (!sawUnary && this.type === types$1.privateId) {
      if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) { this.unexpected(); }
      expr = this.parsePrivateIdent();
      // only could be private fields in 'in', such as #x in obj
      if (this.type !== types$1._in) { this.unexpected(); }
    } else {
      expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
      if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
      while (this.type.postfix && !this.canInsertSemicolon()) {
        var node$1 = this.startNodeAt(startPos, startLoc);
        node$1.operator = this.value;
        node$1.prefix = false;
        node$1.argument = expr;
        this.checkLValSimple(expr);
        this.next();
        expr = this.finishNode(node$1, "UpdateExpression");
      }
    }

    if (!incDec && this.eat(types$1.starstar)) {
      if (sawUnary)
        { this.unexpected(this.lastTokStart); }
      else
        { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false) }
    } else {
      return expr
    }
  };

  function isPrivateFieldAccess(node) {
    return (
      node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" ||
      node.type === "ChainExpression" && isPrivateFieldAccess(node.expression)
    )
  }

  // Parse call, dot, and `[]`-subscript expressions.

  pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprAtom(refDestructuringErrors, forInit);
    if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")")
      { return expr }
    var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
    if (refDestructuringErrors && result.type === "MemberExpression") {
      if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
      if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
      if (refDestructuringErrors.trailingComma >= result.start) { refDestructuringErrors.trailingComma = -1; }
    }
    return result
  };

  pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
    var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
        this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 &&
        this.potentialArrowAt === base.start;
    var optionalChained = false;

    while (true) {
      var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);

      if (element.optional) { optionalChained = true; }
      if (element === base || element.type === "ArrowFunctionExpression") {
        if (optionalChained) {
          var chainNode = this.startNodeAt(startPos, startLoc);
          chainNode.expression = element;
          element = this.finishNode(chainNode, "ChainExpression");
        }
        return element
      }

      base = element;
    }
  };

  pp$5.shouldParseAsyncArrow = function() {
    return !this.canInsertSemicolon() && this.eat(types$1.arrow)
  };

  pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit)
  };

  pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
    var optionalSupported = this.options.ecmaVersion >= 11;
    var optional = optionalSupported && this.eat(types$1.questionDot);
    if (noCalls && optional) { this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions"); }

    var computed = this.eat(types$1.bracketL);
    if (computed || (optional && this.type !== types$1.parenL && this.type !== types$1.backQuote) || this.eat(types$1.dot)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      if (computed) {
        node.property = this.parseExpression();
        this.expect(types$1.bracketR);
      } else if (this.type === types$1.privateId && base.type !== "Super") {
        node.property = this.parsePrivateIdent();
      } else {
        node.property = this.parseIdent(this.options.allowReserved !== "never");
      }
      node.computed = !!computed;
      if (optionalSupported) {
        node.optional = optional;
      }
      base = this.finishNode(node, "MemberExpression");
    } else if (!noCalls && this.eat(types$1.parenL)) {
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
      this.yieldPos = 0;
      this.awaitPos = 0;
      this.awaitIdentPos = 0;
      var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
      if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        if (this.awaitIdentPos > 0)
          { this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function"); }
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit)
      }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;
      this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.callee = base;
      node$1.arguments = exprList;
      if (optionalSupported) {
        node$1.optional = optional;
      }
      base = this.finishNode(node$1, "CallExpression");
    } else if (this.type === types$1.backQuote) {
      if (optional || optionalChained) {
        this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
      }
      var node$2 = this.startNodeAt(startPos, startLoc);
      node$2.tag = base;
      node$2.quasi = this.parseTemplate({isTagged: true});
      base = this.finishNode(node$2, "TaggedTemplateExpression");
    }
    return base
  };

  // Parse an atomic expression — either a single token that is an
  // expression, an expression started by a keyword like `function` or
  // `new`, or an expression wrapped in punctuation like `()`, `[]`,
  // or `{}`.

  pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
    // If a division operator appears in an expression position, the
    // tokenizer got confused, and we force it to read a regexp instead.
    if (this.type === types$1.slash) { this.readRegexp(); }

    var node, canBeArrow = this.potentialArrowAt === this.start;
    switch (this.type) {
    case types$1._super:
      if (!this.allowSuper)
        { this.raise(this.start, "'super' keyword outside a method"); }
      node = this.startNode();
      this.next();
      if (this.type === types$1.parenL && !this.allowDirectSuper)
        { this.raise(node.start, "super() call outside constructor of a subclass"); }
      // The `super` keyword can appear at below:
      // SuperProperty:
      //     super [ Expression ]
      //     super . IdentifierName
      // SuperCall:
      //     super ( Arguments )
      if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL)
        { this.unexpected(); }
      return this.finishNode(node, "Super")

    case types$1._this:
      node = this.startNode();
      this.next();
      return this.finishNode(node, "ThisExpression")

    case types$1.name:
      var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
      var id = this.parseIdent(false);
      if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
        this.overrideContext(types.f_expr);
        return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit)
      }
      if (canBeArrow && !this.canInsertSemicolon()) {
        if (this.eat(types$1.arrow))
          { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit) }
        if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc &&
            (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
          id = this.parseIdent(false);
          if (this.canInsertSemicolon() || !this.eat(types$1.arrow))
            { this.unexpected(); }
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit)
        }
      }
      return id

    case types$1.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = {pattern: value.pattern, flags: value.flags};
      return node

    case types$1.num: case types$1.string:
      return this.parseLiteral(this.value)

    case types$1._null: case types$1._true: case types$1._false:
      node = this.startNode();
      node.value = this.type === types$1._null ? null : this.type === types$1._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal")

    case types$1.parenL:
      var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
      if (refDestructuringErrors) {
        if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
          { refDestructuringErrors.parenthesizedAssign = start; }
        if (refDestructuringErrors.parenthesizedBind < 0)
          { refDestructuringErrors.parenthesizedBind = start; }
      }
      return expr

    case types$1.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
      return this.finishNode(node, "ArrayExpression")

    case types$1.braceL:
      this.overrideContext(types.b_expr);
      return this.parseObj(false, refDestructuringErrors)

    case types$1._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, 0)

    case types$1._class:
      return this.parseClass(this.startNode(), false)

    case types$1._new:
      return this.parseNew()

    case types$1.backQuote:
      return this.parseTemplate()

    case types$1._import:
      if (this.options.ecmaVersion >= 11) {
        return this.parseExprImport(forNew)
      } else {
        return this.unexpected()
      }

    default:
      return this.parseExprAtomDefault()
    }
  };

  pp$5.parseExprAtomDefault = function() {
    this.unexpected();
  };

  pp$5.parseExprImport = function(forNew) {
    var node = this.startNode();

    // Consume `import` as an identifier for `import.meta`.
    // Because `this.parseIdent(true)` doesn't check escape sequences, it needs the check of `this.containsEsc`.
    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword import"); }
    var meta = this.parseIdent(true);

    if (this.type === types$1.parenL && !forNew) {
      return this.parseDynamicImport(node)
    } else if (this.type === types$1.dot) {
      node.meta = meta;
      return this.parseImportMeta(node)
    } else {
      this.unexpected();
    }
  };

  pp$5.parseDynamicImport = function(node) {
    this.next(); // skip `(`

    // Parse node.source.
    node.source = this.parseMaybeAssign();

    // Verify ending.
    if (!this.eat(types$1.parenR)) {
      var errorPos = this.start;
      if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
        this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
      } else {
        this.unexpected(errorPos);
      }
    }

    return this.finishNode(node, "ImportExpression")
  };

  pp$5.parseImportMeta = function(node) {
    this.next(); // skip `.`

    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);

    if (node.property.name !== "meta")
      { this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'"); }
    if (containsEsc)
      { this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters"); }
    if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere)
      { this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module"); }

    return this.finishNode(node, "MetaProperty")
  };

  pp$5.parseLiteral = function(value) {
    var node = this.startNode();
    node.value = value;
    node.raw = this.input.slice(this.start, this.end);
    if (node.raw.charCodeAt(node.raw.length - 1) === 110) { node.bigint = node.raw.slice(0, -1).replace(/_/g, ""); }
    this.next();
    return this.finishNode(node, "Literal")
  };

  pp$5.parseParenExpression = function() {
    this.expect(types$1.parenL);
    var val = this.parseExpression();
    this.expect(types$1.parenR);
    return val
  };

  pp$5.shouldParseArrow = function(exprList) {
    return !this.canInsertSemicolon()
  };

  pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
    var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
    if (this.options.ecmaVersion >= 6) {
      this.next();

      var innerStartPos = this.start, innerStartLoc = this.startLoc;
      var exprList = [], first = true, lastIsComma = false;
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
      this.yieldPos = 0;
      this.awaitPos = 0;
      // Do not save awaitIdentPos to allow checking awaits nested in parameters
      while (this.type !== types$1.parenR) {
        first ? first = false : this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
          lastIsComma = true;
          break
        } else if (this.type === types$1.ellipsis) {
          spreadStart = this.start;
          exprList.push(this.parseParenItem(this.parseRestBinding()));
          if (this.type === types$1.comma) {
            this.raiseRecoverable(
              this.start,
              "Comma is not permitted after the rest element"
            );
          }
          break
        } else {
          exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
        }
      }
      var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
      this.expect(types$1.parenR);

      if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        return this.parseParenArrowList(startPos, startLoc, exprList, forInit)
      }

      if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
      if (spreadStart) { this.unexpected(spreadStart); }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;

      if (exprList.length > 1) {
        val = this.startNodeAt(innerStartPos, innerStartLoc);
        val.expressions = exprList;
        this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
      } else {
        val = exprList[0];
      }
    } else {
      val = this.parseParenExpression();
    }

    if (this.options.preserveParens) {
      var par = this.startNodeAt(startPos, startLoc);
      par.expression = val;
      return this.finishNode(par, "ParenthesizedExpression")
    } else {
      return val
    }
  };

  pp$5.parseParenItem = function(item) {
    return item
  };

  pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit)
  };

  // New's precedence is slightly tricky. It must allow its argument to
  // be a `[]` or dot subscript expression, but not a call — at least,
  // not without wrapping it in parentheses. Thus, it uses the noCalls
  // argument to parseSubscripts to prevent it from consuming the
  // argument list.

  var empty = [];

  pp$5.parseNew = function() {
    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword new"); }
    var node = this.startNode();
    var meta = this.parseIdent(true);
    if (this.options.ecmaVersion >= 6 && this.eat(types$1.dot)) {
      node.meta = meta;
      var containsEsc = this.containsEsc;
      node.property = this.parseIdent(true);
      if (node.property.name !== "target")
        { this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'"); }
      if (containsEsc)
        { this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters"); }
      if (!this.allowNewDotTarget)
        { this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block"); }
      return this.finishNode(node, "MetaProperty")
    }
    var startPos = this.start, startLoc = this.startLoc;
    node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
    if (this.eat(types$1.parenL)) { node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false); }
    else { node.arguments = empty; }
    return this.finishNode(node, "NewExpression")
  };

  // Parse template expression.

  pp$5.parseTemplateElement = function(ref) {
    var isTagged = ref.isTagged;

    var elem = this.startNode();
    if (this.type === types$1.invalidTemplate) {
      if (!isTagged) {
        this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
      }
      elem.value = {
        raw: this.value,
        cooked: null
      };
    } else {
      elem.value = {
        raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
        cooked: this.value
      };
    }
    this.next();
    elem.tail = this.type === types$1.backQuote;
    return this.finishNode(elem, "TemplateElement")
  };

  pp$5.parseTemplate = function(ref) {
    if ( ref === void 0 ) ref = {};
    var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

    var node = this.startNode();
    this.next();
    node.expressions = [];
    var curElt = this.parseTemplateElement({isTagged: isTagged});
    node.quasis = [curElt];
    while (!curElt.tail) {
      if (this.type === types$1.eof) { this.raise(this.pos, "Unterminated template literal"); }
      this.expect(types$1.dollarBraceL);
      node.expressions.push(this.parseExpression());
      this.expect(types$1.braceR);
      node.quasis.push(curElt = this.parseTemplateElement({isTagged: isTagged}));
    }
    this.next();
    return this.finishNode(node, "TemplateLiteral")
  };

  pp$5.isAsyncProp = function(prop) {
    return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
      (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types$1.star)) &&
      !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  };

  // Parse an object literal or binding pattern.

  pp$5.parseObj = function(isPattern, refDestructuringErrors) {
    var node = this.startNode(), first = true, propHash = {};
    node.properties = [];
    this.next();
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      var prop = this.parseProperty(isPattern, refDestructuringErrors);
      if (!isPattern) { this.checkPropClash(prop, propHash, refDestructuringErrors); }
      node.properties.push(prop);
    }
    return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
  };

  pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
    var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
    if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
      if (isPattern) {
        prop.argument = this.parseIdent(false);
        if (this.type === types$1.comma) {
          this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
        }
        return this.finishNode(prop, "RestElement")
      }
      // Parse argument.
      prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
      // To disallow trailing comma via `this.toAssignable()`.
      if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
        refDestructuringErrors.trailingComma = this.start;
      }
      // Finish
      return this.finishNode(prop, "SpreadElement")
    }
    if (this.options.ecmaVersion >= 6) {
      prop.method = false;
      prop.shorthand = false;
      if (isPattern || refDestructuringErrors) {
        startPos = this.start;
        startLoc = this.startLoc;
      }
      if (!isPattern)
        { isGenerator = this.eat(types$1.star); }
    }
    var containsEsc = this.containsEsc;
    this.parsePropertyName(prop);
    if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
      isAsync = true;
      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
      this.parsePropertyName(prop);
    } else {
      isAsync = false;
    }
    this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
    return this.finishNode(prop, "Property")
  };

  pp$5.parseGetterSetter = function(prop) {
    prop.kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
    var paramCount = prop.kind === "get" ? 0 : 1;
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start;
      if (prop.kind === "get")
        { this.raiseRecoverable(start, "getter should have no params"); }
      else
        { this.raiseRecoverable(start, "setter should have exactly one param"); }
    } else {
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
        { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
    }
  };

  pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
    if ((isGenerator || isAsync) && this.type === types$1.colon)
      { this.unexpected(); }

    if (this.eat(types$1.colon)) {
      prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
      prop.kind = "init";
    } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
      if (isPattern) { this.unexpected(); }
      prop.kind = "init";
      prop.method = true;
      prop.value = this.parseMethod(isGenerator, isAsync);
    } else if (!isPattern && !containsEsc &&
               this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
               (prop.key.name === "get" || prop.key.name === "set") &&
               (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
      if (isGenerator || isAsync) { this.unexpected(); }
      this.parseGetterSetter(prop);
    } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
      if (isGenerator || isAsync) { this.unexpected(); }
      this.checkUnreserved(prop.key);
      if (prop.key.name === "await" && !this.awaitIdentPos)
        { this.awaitIdentPos = startPos; }
      prop.kind = "init";
      if (isPattern) {
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else if (this.type === types$1.eq && refDestructuringErrors) {
        if (refDestructuringErrors.shorthandAssign < 0)
          { refDestructuringErrors.shorthandAssign = this.start; }
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else {
        prop.value = this.copyNode(prop.key);
      }
      prop.shorthand = true;
    } else { this.unexpected(); }
  };

  pp$5.parsePropertyName = function(prop) {
    if (this.options.ecmaVersion >= 6) {
      if (this.eat(types$1.bracketL)) {
        prop.computed = true;
        prop.key = this.parseMaybeAssign();
        this.expect(types$1.bracketR);
        return prop.key
      } else {
        prop.computed = false;
      }
    }
    return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never")
  };

  // Initialize empty function node.

  pp$5.initFunction = function(node) {
    node.id = null;
    if (this.options.ecmaVersion >= 6) { node.generator = node.expression = false; }
    if (this.options.ecmaVersion >= 8) { node.async = false; }
  };

  // Parse object or class method.

  pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
    var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

    this.initFunction(node);
    if (this.options.ecmaVersion >= 6)
      { node.generator = isGenerator; }
    if (this.options.ecmaVersion >= 8)
      { node.async = !!isAsync; }

    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));

    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
    this.parseFunctionBody(node, false, true, false);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "FunctionExpression")
  };

  // Parse arrow function expression with given parameters.

  pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

    this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
    this.initFunction(node);
    if (this.options.ecmaVersion >= 8) { node.async = !!isAsync; }

    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;

    node.params = this.toAssignableList(params, true);
    this.parseFunctionBody(node, true, false, forInit);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "ArrowFunctionExpression")
  };

  // Parse function body and check parameters.

  pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
    var isExpression = isArrowFunction && this.type !== types$1.braceL;
    var oldStrict = this.strict, useStrict = false;

    if (isExpression) {
      node.body = this.parseMaybeAssign(forInit);
      node.expression = true;
      this.checkParams(node, false);
    } else {
      var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
      if (!oldStrict || nonSimple) {
        useStrict = this.strictDirective(this.end);
        // If this is a strict mode function, verify that argument names
        // are not repeated, and it does not try to bind the words `eval`
        // or `arguments`.
        if (useStrict && nonSimple)
          { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
      }
      // Start a new scope with regard to labels and the `inFunction`
      // flag (restore them to their old value afterwards).
      var oldLabels = this.labels;
      this.labels = [];
      if (useStrict) { this.strict = true; }

      // Add the params to varDeclaredNames to ensure that an error is thrown
      // if a let/const declaration in the function clashes with one of the params.
      this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
      // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
      if (this.strict && node.id) { this.checkLValSimple(node.id, BIND_OUTSIDE); }
      node.body = this.parseBlock(false, undefined, useStrict && !oldStrict);
      node.expression = false;
      this.adaptDirectivePrologue(node.body.body);
      this.labels = oldLabels;
    }
    this.exitScope();
  };

  pp$5.isSimpleParamList = function(params) {
    for (var i = 0, list = params; i < list.length; i += 1)
      {
      var param = list[i];

      if (param.type !== "Identifier") { return false
    } }
    return true
  };

  // Checks function params for various disallowed patterns such as using "eval"
  // or "arguments" and duplicate parameters.

  pp$5.checkParams = function(node, allowDuplicates) {
    var nameHash = Object.create(null);
    for (var i = 0, list = node.params; i < list.length; i += 1)
      {
      var param = list[i];

      this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
    }
  };

  // Parses a comma-separated list of expressions, and returns them as
  // an array. `close` is the token type that ends the list, and
  // `allowEmpty` can be turned on to allow subsequent commas with
  // nothing in between them to be parsed as `null` (which is needed
  // for array literals).

  pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (!first) {
        this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(close)) { break }
      } else { first = false; }

      var elt = (void 0);
      if (allowEmpty && this.type === types$1.comma)
        { elt = null; }
      else if (this.type === types$1.ellipsis) {
        elt = this.parseSpread(refDestructuringErrors);
        if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0)
          { refDestructuringErrors.trailingComma = this.start; }
      } else {
        elt = this.parseMaybeAssign(false, refDestructuringErrors);
      }
      elts.push(elt);
    }
    return elts
  };

  pp$5.checkUnreserved = function(ref) {
    var start = ref.start;
    var end = ref.end;
    var name = ref.name;

    if (this.inGenerator && name === "yield")
      { this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator"); }
    if (this.inAsync && name === "await")
      { this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function"); }
    if (this.currentThisScope().inClassFieldInit && name === "arguments")
      { this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer"); }
    if (this.inClassStaticBlock && (name === "arguments" || name === "await"))
      { this.raise(start, ("Cannot use " + name + " in class static initialization block")); }
    if (this.keywords.test(name))
      { this.raise(start, ("Unexpected keyword '" + name + "'")); }
    if (this.options.ecmaVersion < 6 &&
      this.input.slice(start, end).indexOf("\\") !== -1) { return }
    var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
    if (re.test(name)) {
      if (!this.inAsync && name === "await")
        { this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function"); }
      this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
    }
  };

  // Parse the next token as an identifier. If `liberal` is true (used
  // when parsing properties), it will also convert keywords into
  // identifiers.

  pp$5.parseIdent = function(liberal) {
    var node = this.parseIdentNode();
    this.next(!!liberal);
    this.finishNode(node, "Identifier");
    if (!liberal) {
      this.checkUnreserved(node);
      if (node.name === "await" && !this.awaitIdentPos)
        { this.awaitIdentPos = node.start; }
    }
    return node
  };

  pp$5.parseIdentNode = function() {
    var node = this.startNode();
    if (this.type === types$1.name) {
      node.name = this.value;
    } else if (this.type.keyword) {
      node.name = this.type.keyword;

      // To fix https://github.com/acornjs/acorn/issues/575
      // `class` and `function` keywords push new context into this.context.
      // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
      // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
      if ((node.name === "class" || node.name === "function") &&
        (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
        this.context.pop();
      }
    } else {
      this.unexpected();
    }
    return node
  };

  pp$5.parsePrivateIdent = function() {
    var node = this.startNode();
    if (this.type === types$1.privateId) {
      node.name = this.value;
    } else {
      this.unexpected();
    }
    this.next();
    this.finishNode(node, "PrivateIdentifier");

    // For validating existence
    if (this.options.checkPrivateFields) {
      if (this.privateNameStack.length === 0) {
        this.raise(node.start, ("Private field '#" + (node.name) + "' must be declared in an enclosing class"));
      } else {
        this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
      }
    }

    return node
  };

  // Parses yield expression inside generator.

  pp$5.parseYield = function(forInit) {
    if (!this.yieldPos) { this.yieldPos = this.start; }

    var node = this.startNode();
    this.next();
    if (this.type === types$1.semi || this.canInsertSemicolon() || (this.type !== types$1.star && !this.type.startsExpr)) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(types$1.star);
      node.argument = this.parseMaybeAssign(forInit);
    }
    return this.finishNode(node, "YieldExpression")
  };

  pp$5.parseAwait = function(forInit) {
    if (!this.awaitPos) { this.awaitPos = this.start; }

    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeUnary(null, true, false, forInit);
    return this.finishNode(node, "AwaitExpression")
  };

  var pp$4 = Parser.prototype;

  // This function is used to raise exceptions on parse errors. It
  // takes an offset integer (into the current `input`) to indicate
  // the location of the error, attaches the position to the end
  // of the error message, and then raises a `SyntaxError` with that
  // message.

  pp$4.raise = function(pos, message) {
    var loc = getLineInfo(this.input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    var err = new SyntaxError(message);
    err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
    throw err
  };

  pp$4.raiseRecoverable = pp$4.raise;

  pp$4.curPosition = function() {
    if (this.options.locations) {
      return new Position(this.curLine, this.pos - this.lineStart)
    }
  };

  var pp$3 = Parser.prototype;

  var Scope = function Scope(flags) {
    this.flags = flags;
    // A list of var-declared names in the current lexical scope
    this.var = [];
    // A list of lexically-declared names in the current lexical scope
    this.lexical = [];
    // A list of lexically-declared FunctionDeclaration names in the current lexical scope
    this.functions = [];
    // A switch to disallow the identifier reference 'arguments'
    this.inClassFieldInit = false;
  };

  // The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

  pp$3.enterScope = function(flags) {
    this.scopeStack.push(new Scope(flags));
  };

  pp$3.exitScope = function() {
    this.scopeStack.pop();
  };

  // The spec says:
  // > At the top level of a function, or script, function declarations are
  // > treated like var declarations rather than like lexical declarations.
  pp$3.treatFunctionsAsVarInScope = function(scope) {
    return (scope.flags & SCOPE_FUNCTION) || !this.inModule && (scope.flags & SCOPE_TOP)
  };

  pp$3.declareName = function(name, bindingType, pos) {
    var redeclared = false;
    if (bindingType === BIND_LEXICAL) {
      var scope = this.currentScope();
      redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
      scope.lexical.push(name);
      if (this.inModule && (scope.flags & SCOPE_TOP))
        { delete this.undefinedExports[name]; }
    } else if (bindingType === BIND_SIMPLE_CATCH) {
      var scope$1 = this.currentScope();
      scope$1.lexical.push(name);
    } else if (bindingType === BIND_FUNCTION) {
      var scope$2 = this.currentScope();
      if (this.treatFunctionsAsVar)
        { redeclared = scope$2.lexical.indexOf(name) > -1; }
      else
        { redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1; }
      scope$2.functions.push(name);
    } else {
      for (var i = this.scopeStack.length - 1; i >= 0; --i) {
        var scope$3 = this.scopeStack[i];
        if (scope$3.lexical.indexOf(name) > -1 && !((scope$3.flags & SCOPE_SIMPLE_CATCH) && scope$3.lexical[0] === name) ||
            !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
          redeclared = true;
          break
        }
        scope$3.var.push(name);
        if (this.inModule && (scope$3.flags & SCOPE_TOP))
          { delete this.undefinedExports[name]; }
        if (scope$3.flags & SCOPE_VAR) { break }
      }
    }
    if (redeclared) { this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared")); }
  };

  pp$3.checkLocalExport = function(id) {
    // scope.functions must be empty as Module code is always strict.
    if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
        this.scopeStack[0].var.indexOf(id.name) === -1) {
      this.undefinedExports[id.name] = id;
    }
  };

  pp$3.currentScope = function() {
    return this.scopeStack[this.scopeStack.length - 1]
  };

  pp$3.currentVarScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & SCOPE_VAR) { return scope }
    }
  };

  // Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
  pp$3.currentThisScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & SCOPE_VAR && !(scope.flags & SCOPE_ARROW)) { return scope }
    }
  };

  var Node = function Node(parser, pos, loc) {
    this.type = "";
    this.start = pos;
    this.end = 0;
    if (parser.options.locations)
      { this.loc = new SourceLocation(parser, loc); }
    if (parser.options.directSourceFile)
      { this.sourceFile = parser.options.directSourceFile; }
    if (parser.options.ranges)
      { this.range = [pos, 0]; }
  };

  // Start an AST node, attaching a start offset.

  var pp$2 = Parser.prototype;

  pp$2.startNode = function() {
    return new Node(this, this.start, this.startLoc)
  };

  pp$2.startNodeAt = function(pos, loc) {
    return new Node(this, pos, loc)
  };

  // Finish an AST node, adding `type` and `end` properties.

  function finishNodeAt(node, type, pos, loc) {
    node.type = type;
    node.end = pos;
    if (this.options.locations)
      { node.loc.end = loc; }
    if (this.options.ranges)
      { node.range[1] = pos; }
    return node
  }

  pp$2.finishNode = function(node, type) {
    return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
  };

  // Finish node at given position

  pp$2.finishNodeAt = function(node, type, pos, loc) {
    return finishNodeAt.call(this, node, type, pos, loc)
  };

  pp$2.copyNode = function(node) {
    var newNode = new Node(this, node.start, this.startLoc);
    for (var prop in node) { newNode[prop] = node[prop]; }
    return newNode
  };

  // This file contains Unicode properties extracted from the ECMAScript specification.
  // The lists are extracted like so:
  // $$('#table-binary-unicode-properties > figure > table > tbody > tr > td:nth-child(1) code').map(el => el.innerText)

  // #table-binary-unicode-properties
  var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
  var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
  var ecma11BinaryProperties = ecma10BinaryProperties;
  var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
  var ecma13BinaryProperties = ecma12BinaryProperties;
  var ecma14BinaryProperties = ecma13BinaryProperties;

  var unicodeBinaryProperties = {
    9: ecma9BinaryProperties,
    10: ecma10BinaryProperties,
    11: ecma11BinaryProperties,
    12: ecma12BinaryProperties,
    13: ecma13BinaryProperties,
    14: ecma14BinaryProperties
  };

  // #table-binary-unicode-properties-of-strings
  var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";

  var unicodeBinaryPropertiesOfStrings = {
    9: "",
    10: "",
    11: "",
    12: "",
    13: "",
    14: ecma14BinaryPropertiesOfStrings
  };

  // #table-unicode-general-category-values
  var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";

  // #table-unicode-script-values
  var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
  var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
  var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
  var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
  var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
  var ecma14ScriptValues = ecma13ScriptValues + " Hrkt Katakana_Or_Hiragana Kawi Nag_Mundari Nagm Unknown Zzzz";

  var unicodeScriptValues = {
    9: ecma9ScriptValues,
    10: ecma10ScriptValues,
    11: ecma11ScriptValues,
    12: ecma12ScriptValues,
    13: ecma13ScriptValues,
    14: ecma14ScriptValues
  };

  var data = {};
  function buildUnicodeData(ecmaVersion) {
    var d = data[ecmaVersion] = {
      binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
      binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion]),
      nonBinary: {
        General_Category: wordsRegexp(unicodeGeneralCategoryValues),
        Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
      }
    };
    d.nonBinary.Script_Extensions = d.nonBinary.Script;

    d.nonBinary.gc = d.nonBinary.General_Category;
    d.nonBinary.sc = d.nonBinary.Script;
    d.nonBinary.scx = d.nonBinary.Script_Extensions;
  }

  for (var i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
    var ecmaVersion = list[i];

    buildUnicodeData(ecmaVersion);
  }

  var pp$1 = Parser.prototype;

  var RegExpValidationState = function RegExpValidationState(parser) {
    this.parser = parser;
    this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
    this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
    this.source = "";
    this.flags = "";
    this.start = 0;
    this.switchU = false;
    this.switchV = false;
    this.switchN = false;
    this.pos = 0;
    this.lastIntValue = 0;
    this.lastStringValue = "";
    this.lastAssertionIsQuantifiable = false;
    this.numCapturingParens = 0;
    this.maxBackReference = 0;
    this.groupNames = [];
    this.backReferenceNames = [];
  };

  RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
    var unicodeSets = flags.indexOf("v") !== -1;
    var unicode = flags.indexOf("u") !== -1;
    this.start = start | 0;
    this.source = pattern + "";
    this.flags = flags;
    if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
      this.switchU = true;
      this.switchV = true;
      this.switchN = true;
    } else {
      this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
      this.switchV = false;
      this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
    }
  };

  RegExpValidationState.prototype.raise = function raise (message) {
    this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
  };

  // If u flag is given, this returns the code point at the index (it combines a surrogate pair).
  // Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
  RegExpValidationState.prototype.at = function at (i, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return -1
    }
    var c = s.charCodeAt(i);
    if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
      return c
    }
    var next = s.charCodeAt(i + 1);
    return next >= 0xDC00 && next <= 0xDFFF ? (c << 10) + next - 0x35FDC00 : c
  };

  RegExpValidationState.prototype.nextIndex = function nextIndex (i, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return l
    }
    var c = s.charCodeAt(i), next;
    if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l ||
        (next = s.charCodeAt(i + 1)) < 0xDC00 || next > 0xDFFF) {
      return i + 1
    }
    return i + 2
  };

  RegExpValidationState.prototype.current = function current (forceU) {
      if ( forceU === void 0 ) forceU = false;

    return this.at(this.pos, forceU)
  };

  RegExpValidationState.prototype.lookahead = function lookahead (forceU) {
      if ( forceU === void 0 ) forceU = false;

    return this.at(this.nextIndex(this.pos, forceU), forceU)
  };

  RegExpValidationState.prototype.advance = function advance (forceU) {
      if ( forceU === void 0 ) forceU = false;

    this.pos = this.nextIndex(this.pos, forceU);
  };

  RegExpValidationState.prototype.eat = function eat (ch, forceU) {
      if ( forceU === void 0 ) forceU = false;

    if (this.current(forceU) === ch) {
      this.advance(forceU);
      return true
    }
    return false
  };

  RegExpValidationState.prototype.eatChars = function eatChars (chs, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var pos = this.pos;
    for (var i = 0, list = chs; i < list.length; i += 1) {
      var ch = list[i];

        var current = this.at(pos, forceU);
      if (current === -1 || current !== ch) {
        return false
      }
      pos = this.nextIndex(pos, forceU);
    }
    this.pos = pos;
    return true
  };

  /**
   * Validate the flags part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */
  pp$1.validateRegExpFlags = function(state) {
    var validFlags = state.validFlags;
    var flags = state.flags;

    var u = false;
    var v = false;

    for (var i = 0; i < flags.length; i++) {
      var flag = flags.charAt(i);
      if (validFlags.indexOf(flag) === -1) {
        this.raise(state.start, "Invalid regular expression flag");
      }
      if (flags.indexOf(flag, i + 1) > -1) {
        this.raise(state.start, "Duplicate regular expression flag");
      }
      if (flag === "u") { u = true; }
      if (flag === "v") { v = true; }
    }
    if (this.options.ecmaVersion >= 15 && u && v) {
      this.raise(state.start, "Invalid regular expression flag");
    }
  };

  /**
   * Validate the pattern part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */
  pp$1.validateRegExpPattern = function(state) {
    this.regexp_pattern(state);

    // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
    // parsing contains a |GroupName|, reparse with the goal symbol
    // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
    // exception if _P_ did not conform to the grammar, if any elements of _P_
    // were not matched by the parse, or if any Early Error conditions exist.
    if (!state.switchN && this.options.ecmaVersion >= 9 && state.groupNames.length > 0) {
      state.switchN = true;
      this.regexp_pattern(state);
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
  pp$1.regexp_pattern = function(state) {
    state.pos = 0;
    state.lastIntValue = 0;
    state.lastStringValue = "";
    state.lastAssertionIsQuantifiable = false;
    state.numCapturingParens = 0;
    state.maxBackReference = 0;
    state.groupNames.length = 0;
    state.backReferenceNames.length = 0;

    this.regexp_disjunction(state);

    if (state.pos !== state.source.length) {
      // Make the same messages as V8.
      if (state.eat(0x29 /* ) */)) {
        state.raise("Unmatched ')'");
      }
      if (state.eat(0x5D /* ] */) || state.eat(0x7D /* } */)) {
        state.raise("Lone quantifier brackets");
      }
    }
    if (state.maxBackReference > state.numCapturingParens) {
      state.raise("Invalid escape");
    }
    for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
      var name = list[i];

      if (state.groupNames.indexOf(name) === -1) {
        state.raise("Invalid named capture referenced");
      }
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
  pp$1.regexp_disjunction = function(state) {
    this.regexp_alternative(state);
    while (state.eat(0x7C /* | */)) {
      this.regexp_alternative(state);
    }

    // Make the same message as V8.
    if (this.regexp_eatQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    if (state.eat(0x7B /* { */)) {
      state.raise("Lone quantifier brackets");
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
  pp$1.regexp_alternative = function(state) {
    while (state.pos < state.source.length && this.regexp_eatTerm(state))
      { }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
  pp$1.regexp_eatTerm = function(state) {
    if (this.regexp_eatAssertion(state)) {
      // Handle `QuantifiableAssertion Quantifier` alternative.
      // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
      // is a QuantifiableAssertion.
      if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
        // Make the same message as V8.
        if (state.switchU) {
          state.raise("Invalid quantifier");
        }
      }
      return true
    }

    if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
      this.regexp_eatQuantifier(state);
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
  pp$1.regexp_eatAssertion = function(state) {
    var start = state.pos;
    state.lastAssertionIsQuantifiable = false;

    // ^, $
    if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
      return true
    }

    // \b \B
    if (state.eat(0x5C /* \ */)) {
      if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
        return true
      }
      state.pos = start;
    }

    // Lookahead / Lookbehind
    if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
      var lookbehind = false;
      if (this.options.ecmaVersion >= 9) {
        lookbehind = state.eat(0x3C /* < */);
      }
      if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
        this.regexp_disjunction(state);
        if (!state.eat(0x29 /* ) */)) {
          state.raise("Unterminated group");
        }
        state.lastAssertionIsQuantifiable = !lookbehind;
        return true
      }
    }

    state.pos = start;
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
  pp$1.regexp_eatQuantifier = function(state, noError) {
    if ( noError === void 0 ) noError = false;

    if (this.regexp_eatQuantifierPrefix(state, noError)) {
      state.eat(0x3F /* ? */);
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
  pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
    return (
      state.eat(0x2A /* * */) ||
      state.eat(0x2B /* + */) ||
      state.eat(0x3F /* ? */) ||
      this.regexp_eatBracedQuantifier(state, noError)
    )
  };
  pp$1.regexp_eatBracedQuantifier = function(state, noError) {
    var start = state.pos;
    if (state.eat(0x7B /* { */)) {
      var min = 0, max = -1;
      if (this.regexp_eatDecimalDigits(state)) {
        min = state.lastIntValue;
        if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
          max = state.lastIntValue;
        }
        if (state.eat(0x7D /* } */)) {
          // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
          if (max !== -1 && max < min && !noError) {
            state.raise("numbers out of order in {} quantifier");
          }
          return true
        }
      }
      if (state.switchU && !noError) {
        state.raise("Incomplete quantifier");
      }
      state.pos = start;
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
  pp$1.regexp_eatAtom = function(state) {
    return (
      this.regexp_eatPatternCharacters(state) ||
      state.eat(0x2E /* . */) ||
      this.regexp_eatReverseSolidusAtomEscape(state) ||
      this.regexp_eatCharacterClass(state) ||
      this.regexp_eatUncapturingGroup(state) ||
      this.regexp_eatCapturingGroup(state)
    )
  };
  pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
    var start = state.pos;
    if (state.eat(0x5C /* \ */)) {
      if (this.regexp_eatAtomEscape(state)) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatUncapturingGroup = function(state) {
    var start = state.pos;
    if (state.eat(0x28 /* ( */)) {
      if (state.eat(0x3F /* ? */) && state.eat(0x3A /* : */)) {
        this.regexp_disjunction(state);
        if (state.eat(0x29 /* ) */)) {
          return true
        }
        state.raise("Unterminated group");
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatCapturingGroup = function(state) {
    if (state.eat(0x28 /* ( */)) {
      if (this.options.ecmaVersion >= 9) {
        this.regexp_groupSpecifier(state);
      } else if (state.current() === 0x3F /* ? */) {
        state.raise("Invalid group");
      }
      this.regexp_disjunction(state);
      if (state.eat(0x29 /* ) */)) {
        state.numCapturingParens += 1;
        return true
      }
      state.raise("Unterminated group");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
  pp$1.regexp_eatExtendedAtom = function(state) {
    return (
      state.eat(0x2E /* . */) ||
      this.regexp_eatReverseSolidusAtomEscape(state) ||
      this.regexp_eatCharacterClass(state) ||
      this.regexp_eatUncapturingGroup(state) ||
      this.regexp_eatCapturingGroup(state) ||
      this.regexp_eatInvalidBracedQuantifier(state) ||
      this.regexp_eatExtendedPatternCharacter(state)
    )
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
  pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
    if (this.regexp_eatBracedQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
  pp$1.regexp_eatSyntaxCharacter = function(state) {
    var ch = state.current();
    if (isSyntaxCharacter(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }
    return false
  };
  function isSyntaxCharacter(ch) {
    return (
      ch === 0x24 /* $ */ ||
      ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
      ch === 0x2E /* . */ ||
      ch === 0x3F /* ? */ ||
      ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
      ch >= 0x7B /* { */ && ch <= 0x7D /* } */
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
  // But eat eager.
  pp$1.regexp_eatPatternCharacters = function(state) {
    var start = state.pos;
    var ch = 0;
    while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
      state.advance();
    }
    return state.pos !== start
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
  pp$1.regexp_eatExtendedPatternCharacter = function(state) {
    var ch = state.current();
    if (
      ch !== -1 &&
      ch !== 0x24 /* $ */ &&
      !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
      ch !== 0x2E /* . */ &&
      ch !== 0x3F /* ? */ &&
      ch !== 0x5B /* [ */ &&
      ch !== 0x5E /* ^ */ &&
      ch !== 0x7C /* | */
    ) {
      state.advance();
      return true
    }
    return false
  };

  // GroupSpecifier ::
  //   [empty]
  //   `?` GroupName
  pp$1.regexp_groupSpecifier = function(state) {
    if (state.eat(0x3F /* ? */)) {
      if (this.regexp_eatGroupName(state)) {
        if (state.groupNames.indexOf(state.lastStringValue) !== -1) {
          state.raise("Duplicate capture group name");
        }
        state.groupNames.push(state.lastStringValue);
        return
      }
      state.raise("Invalid group");
    }
  };

  // GroupName ::
  //   `<` RegExpIdentifierName `>`
  // Note: this updates `state.lastStringValue` property with the eaten name.
  pp$1.regexp_eatGroupName = function(state) {
    state.lastStringValue = "";
    if (state.eat(0x3C /* < */)) {
      if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
        return true
      }
      state.raise("Invalid capture group name");
    }
    return false
  };

  // RegExpIdentifierName ::
  //   RegExpIdentifierStart
  //   RegExpIdentifierName RegExpIdentifierPart
  // Note: this updates `state.lastStringValue` property with the eaten name.
  pp$1.regexp_eatRegExpIdentifierName = function(state) {
    state.lastStringValue = "";
    if (this.regexp_eatRegExpIdentifierStart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
      while (this.regexp_eatRegExpIdentifierPart(state)) {
        state.lastStringValue += codePointToString(state.lastIntValue);
      }
      return true
    }
    return false
  };

  // RegExpIdentifierStart ::
  //   UnicodeIDStart
  //   `$`
  //   `_`
  //   `\` RegExpUnicodeEscapeSequence[+U]
  pp$1.regexp_eatRegExpIdentifierStart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);

    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierStart(ch)) {
      state.lastIntValue = ch;
      return true
    }

    state.pos = start;
    return false
  };
  function isRegExpIdentifierStart(ch) {
    return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
  }

  // RegExpIdentifierPart ::
  //   UnicodeIDContinue
  //   `$`
  //   `_`
  //   `\` RegExpUnicodeEscapeSequence[+U]
  //   <ZWNJ>
  //   <ZWJ>
  pp$1.regexp_eatRegExpIdentifierPart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);

    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierPart(ch)) {
      state.lastIntValue = ch;
      return true
    }

    state.pos = start;
    return false
  };
  function isRegExpIdentifierPart(ch) {
    return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
  pp$1.regexp_eatAtomEscape = function(state) {
    if (
      this.regexp_eatBackReference(state) ||
      this.regexp_eatCharacterClassEscape(state) ||
      this.regexp_eatCharacterEscape(state) ||
      (state.switchN && this.regexp_eatKGroupName(state))
    ) {
      return true
    }
    if (state.switchU) {
      // Make the same message as V8.
      if (state.current() === 0x63 /* c */) {
        state.raise("Invalid unicode escape");
      }
      state.raise("Invalid escape");
    }
    return false
  };
  pp$1.regexp_eatBackReference = function(state) {
    var start = state.pos;
    if (this.regexp_eatDecimalEscape(state)) {
      var n = state.lastIntValue;
      if (state.switchU) {
        // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
        if (n > state.maxBackReference) {
          state.maxBackReference = n;
        }
        return true
      }
      if (n <= state.numCapturingParens) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatKGroupName = function(state) {
    if (state.eat(0x6B /* k */)) {
      if (this.regexp_eatGroupName(state)) {
        state.backReferenceNames.push(state.lastStringValue);
        return true
      }
      state.raise("Invalid named reference");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
  pp$1.regexp_eatCharacterEscape = function(state) {
    return (
      this.regexp_eatControlEscape(state) ||
      this.regexp_eatCControlLetter(state) ||
      this.regexp_eatZero(state) ||
      this.regexp_eatHexEscapeSequence(state) ||
      this.regexp_eatRegExpUnicodeEscapeSequence(state, false) ||
      (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
      this.regexp_eatIdentityEscape(state)
    )
  };
  pp$1.regexp_eatCControlLetter = function(state) {
    var start = state.pos;
    if (state.eat(0x63 /* c */)) {
      if (this.regexp_eatControlLetter(state)) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatZero = function(state) {
    if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
      state.lastIntValue = 0;
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
  pp$1.regexp_eatControlEscape = function(state) {
    var ch = state.current();
    if (ch === 0x74 /* t */) {
      state.lastIntValue = 0x09; /* \t */
      state.advance();
      return true
    }
    if (ch === 0x6E /* n */) {
      state.lastIntValue = 0x0A; /* \n */
      state.advance();
      return true
    }
    if (ch === 0x76 /* v */) {
      state.lastIntValue = 0x0B; /* \v */
      state.advance();
      return true
    }
    if (ch === 0x66 /* f */) {
      state.lastIntValue = 0x0C; /* \f */
      state.advance();
      return true
    }
    if (ch === 0x72 /* r */) {
      state.lastIntValue = 0x0D; /* \r */
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
  pp$1.regexp_eatControlLetter = function(state) {
    var ch = state.current();
    if (isControlLetter(ch)) {
      state.lastIntValue = ch % 0x20;
      state.advance();
      return true
    }
    return false
  };
  function isControlLetter(ch) {
    return (
      (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
      (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
  pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
    if ( forceU === void 0 ) forceU = false;

    var start = state.pos;
    var switchU = forceU || state.switchU;

    if (state.eat(0x75 /* u */)) {
      if (this.regexp_eatFixedHexDigits(state, 4)) {
        var lead = state.lastIntValue;
        if (switchU && lead >= 0xD800 && lead <= 0xDBFF) {
          var leadSurrogateEnd = state.pos;
          if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
            var trail = state.lastIntValue;
            if (trail >= 0xDC00 && trail <= 0xDFFF) {
              state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
              return true
            }
          }
          state.pos = leadSurrogateEnd;
          state.lastIntValue = lead;
        }
        return true
      }
      if (
        switchU &&
        state.eat(0x7B /* { */) &&
        this.regexp_eatHexDigits(state) &&
        state.eat(0x7D /* } */) &&
        isValidUnicode(state.lastIntValue)
      ) {
        return true
      }
      if (switchU) {
        state.raise("Invalid unicode escape");
      }
      state.pos = start;
    }

    return false
  };
  function isValidUnicode(ch) {
    return ch >= 0 && ch <= 0x10FFFF
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
  pp$1.regexp_eatIdentityEscape = function(state) {
    if (state.switchU) {
      if (this.regexp_eatSyntaxCharacter(state)) {
        return true
      }
      if (state.eat(0x2F /* / */)) {
        state.lastIntValue = 0x2F; /* / */
        return true
      }
      return false
    }

    var ch = state.current();
    if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
  pp$1.regexp_eatDecimalEscape = function(state) {
    state.lastIntValue = 0;
    var ch = state.current();
    if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
      do {
        state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
        state.advance();
      } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
      return true
    }
    return false
  };

  // Return values used by character set parsing methods, needed to
  // forbid negation of sets that can match strings.
  var CharSetNone = 0; // Nothing parsed
  var CharSetOk = 1; // Construct parsed, cannot contain strings
  var CharSetString = 2; // Construct parsed, can contain strings

  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
  pp$1.regexp_eatCharacterClassEscape = function(state) {
    var ch = state.current();

    if (isCharacterClassEscape(ch)) {
      state.lastIntValue = -1;
      state.advance();
      return CharSetOk
    }

    var negate = false;
    if (
      state.switchU &&
      this.options.ecmaVersion >= 9 &&
      ((negate = ch === 0x50 /* P */) || ch === 0x70 /* p */)
    ) {
      state.lastIntValue = -1;
      state.advance();
      var result;
      if (
        state.eat(0x7B /* { */) &&
        (result = this.regexp_eatUnicodePropertyValueExpression(state)) &&
        state.eat(0x7D /* } */)
      ) {
        if (negate && result === CharSetString) { state.raise("Invalid property name"); }
        return result
      }
      state.raise("Invalid property name");
    }

    return CharSetNone
  };

  function isCharacterClassEscape(ch) {
    return (
      ch === 0x64 /* d */ ||
      ch === 0x44 /* D */ ||
      ch === 0x73 /* s */ ||
      ch === 0x53 /* S */ ||
      ch === 0x77 /* w */ ||
      ch === 0x57 /* W */
    )
  }

  // UnicodePropertyValueExpression ::
  //   UnicodePropertyName `=` UnicodePropertyValue
  //   LoneUnicodePropertyNameOrValue
  pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
    var start = state.pos;

    // UnicodePropertyName `=` UnicodePropertyValue
    if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
      var name = state.lastStringValue;
      if (this.regexp_eatUnicodePropertyValue(state)) {
        var value = state.lastStringValue;
        this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
        return CharSetOk
      }
    }
    state.pos = start;

    // LoneUnicodePropertyNameOrValue
    if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
      var nameOrValue = state.lastStringValue;
      return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue)
    }
    return CharSetNone
  };

  pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
    if (!hasOwn(state.unicodeProperties.nonBinary, name))
      { state.raise("Invalid property name"); }
    if (!state.unicodeProperties.nonBinary[name].test(value))
      { state.raise("Invalid property value"); }
  };

  pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
    if (state.unicodeProperties.binary.test(nameOrValue)) { return CharSetOk }
    if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) { return CharSetString }
    state.raise("Invalid property name");
  };

  // UnicodePropertyName ::
  //   UnicodePropertyNameCharacters
  pp$1.regexp_eatUnicodePropertyName = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyNameCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== ""
  };

  function isUnicodePropertyNameCharacter(ch) {
    return isControlLetter(ch) || ch === 0x5F /* _ */
  }

  // UnicodePropertyValue ::
  //   UnicodePropertyValueCharacters
  pp$1.regexp_eatUnicodePropertyValue = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyValueCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== ""
  };
  function isUnicodePropertyValueCharacter(ch) {
    return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
  }

  // LoneUnicodePropertyNameOrValue ::
  //   UnicodePropertyValueCharacters
  pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
    return this.regexp_eatUnicodePropertyValue(state)
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
  pp$1.regexp_eatCharacterClass = function(state) {
    if (state.eat(0x5B /* [ */)) {
      var negate = state.eat(0x5E /* ^ */);
      var result = this.regexp_classContents(state);
      if (!state.eat(0x5D /* ] */))
        { state.raise("Unterminated character class"); }
      if (negate && result === CharSetString)
        { state.raise("Negated character class may contain strings"); }
      return true
    }
    return false
  };

  // https://tc39.es/ecma262/#prod-ClassContents
  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
  pp$1.regexp_classContents = function(state) {
    if (state.current() === 0x5D /* ] */) { return CharSetOk }
    if (state.switchV) { return this.regexp_classSetExpression(state) }
    this.regexp_nonEmptyClassRanges(state);
    return CharSetOk
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
  pp$1.regexp_nonEmptyClassRanges = function(state) {
    while (this.regexp_eatClassAtom(state)) {
      var left = state.lastIntValue;
      if (state.eat(0x2D /* - */) && this.regexp_eatClassAtom(state)) {
        var right = state.lastIntValue;
        if (state.switchU && (left === -1 || right === -1)) {
          state.raise("Invalid character class");
        }
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
      }
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
  pp$1.regexp_eatClassAtom = function(state) {
    var start = state.pos;

    if (state.eat(0x5C /* \ */)) {
      if (this.regexp_eatClassEscape(state)) {
        return true
      }
      if (state.switchU) {
        // Make the same message as V8.
        var ch$1 = state.current();
        if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
          state.raise("Invalid class escape");
        }
        state.raise("Invalid escape");
      }
      state.pos = start;
    }

    var ch = state.current();
    if (ch !== 0x5D /* ] */) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
  pp$1.regexp_eatClassEscape = function(state) {
    var start = state.pos;

    if (state.eat(0x62 /* b */)) {
      state.lastIntValue = 0x08; /* <BS> */
      return true
    }

    if (state.switchU && state.eat(0x2D /* - */)) {
      state.lastIntValue = 0x2D; /* - */
      return true
    }

    if (!state.switchU && state.eat(0x63 /* c */)) {
      if (this.regexp_eatClassControlLetter(state)) {
        return true
      }
      state.pos = start;
    }

    return (
      this.regexp_eatCharacterClassEscape(state) ||
      this.regexp_eatCharacterEscape(state)
    )
  };

  // https://tc39.es/ecma262/#prod-ClassSetExpression
  // https://tc39.es/ecma262/#prod-ClassUnion
  // https://tc39.es/ecma262/#prod-ClassIntersection
  // https://tc39.es/ecma262/#prod-ClassSubtraction
  pp$1.regexp_classSetExpression = function(state) {
    var result = CharSetOk, subResult;
    if (this.regexp_eatClassSetRange(state)) ; else if (subResult = this.regexp_eatClassSetOperand(state)) {
      if (subResult === CharSetString) { result = CharSetString; }
      // https://tc39.es/ecma262/#prod-ClassIntersection
      var start = state.pos;
      while (state.eatChars([0x26, 0x26] /* && */)) {
        if (
          state.current() !== 0x26 /* & */ &&
          (subResult = this.regexp_eatClassSetOperand(state))
        ) {
          if (subResult !== CharSetString) { result = CharSetOk; }
          continue
        }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) { return result }
      // https://tc39.es/ecma262/#prod-ClassSubtraction
      while (state.eatChars([0x2D, 0x2D] /* -- */)) {
        if (this.regexp_eatClassSetOperand(state)) { continue }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) { return result }
    } else {
      state.raise("Invalid character in character class");
    }
    // https://tc39.es/ecma262/#prod-ClassUnion
    for (;;) {
      if (this.regexp_eatClassSetRange(state)) { continue }
      subResult = this.regexp_eatClassSetOperand(state);
      if (!subResult) { return result }
      if (subResult === CharSetString) { result = CharSetString; }
    }
  };

  // https://tc39.es/ecma262/#prod-ClassSetRange
  pp$1.regexp_eatClassSetRange = function(state) {
    var start = state.pos;
    if (this.regexp_eatClassSetCharacter(state)) {
      var left = state.lastIntValue;
      if (state.eat(0x2D /* - */) && this.regexp_eatClassSetCharacter(state)) {
        var right = state.lastIntValue;
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
        return true
      }
      state.pos = start;
    }
    return false
  };

  // https://tc39.es/ecma262/#prod-ClassSetOperand
  pp$1.regexp_eatClassSetOperand = function(state) {
    if (this.regexp_eatClassSetCharacter(state)) { return CharSetOk }
    return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state)
  };

  // https://tc39.es/ecma262/#prod-NestedClass
  pp$1.regexp_eatNestedClass = function(state) {
    var start = state.pos;
    if (state.eat(0x5B /* [ */)) {
      var negate = state.eat(0x5E /* ^ */);
      var result = this.regexp_classContents(state);
      if (state.eat(0x5D /* ] */)) {
        if (negate && result === CharSetString) {
          state.raise("Negated character class may contain strings");
        }
        return result
      }
      state.pos = start;
    }
    if (state.eat(0x5C /* \ */)) {
      var result$1 = this.regexp_eatCharacterClassEscape(state);
      if (result$1) {
        return result$1
      }
      state.pos = start;
    }
    return null
  };

  // https://tc39.es/ecma262/#prod-ClassStringDisjunction
  pp$1.regexp_eatClassStringDisjunction = function(state) {
    var start = state.pos;
    if (state.eatChars([0x5C, 0x71] /* \q */)) {
      if (state.eat(0x7B /* { */)) {
        var result = this.regexp_classStringDisjunctionContents(state);
        if (state.eat(0x7D /* } */)) {
          return result
        }
      } else {
        // Make the same message as V8.
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return null
  };

  // https://tc39.es/ecma262/#prod-ClassStringDisjunctionContents
  pp$1.regexp_classStringDisjunctionContents = function(state) {
    var result = this.regexp_classString(state);
    while (state.eat(0x7C /* | */)) {
      if (this.regexp_classString(state) === CharSetString) { result = CharSetString; }
    }
    return result
  };

  // https://tc39.es/ecma262/#prod-ClassString
  // https://tc39.es/ecma262/#prod-NonEmptyClassString
  pp$1.regexp_classString = function(state) {
    var count = 0;
    while (this.regexp_eatClassSetCharacter(state)) { count++; }
    return count === 1 ? CharSetOk : CharSetString
  };

  // https://tc39.es/ecma262/#prod-ClassSetCharacter
  pp$1.regexp_eatClassSetCharacter = function(state) {
    var start = state.pos;
    if (state.eat(0x5C /* \ */)) {
      if (
        this.regexp_eatCharacterEscape(state) ||
        this.regexp_eatClassSetReservedPunctuator(state)
      ) {
        return true
      }
      if (state.eat(0x62 /* b */)) {
        state.lastIntValue = 0x08; /* <BS> */
        return true
      }
      state.pos = start;
      return false
    }
    var ch = state.current();
    if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) { return false }
    if (isClassSetSyntaxCharacter(ch)) { return false }
    state.advance();
    state.lastIntValue = ch;
    return true
  };

  // https://tc39.es/ecma262/#prod-ClassSetReservedDoublePunctuator
  function isClassSetReservedDoublePunctuatorCharacter(ch) {
    return (
      ch === 0x21 /* ! */ ||
      ch >= 0x23 /* # */ && ch <= 0x26 /* & */ ||
      ch >= 0x2A /* * */ && ch <= 0x2C /* , */ ||
      ch === 0x2E /* . */ ||
      ch >= 0x3A /* : */ && ch <= 0x40 /* @ */ ||
      ch === 0x5E /* ^ */ ||
      ch === 0x60 /* ` */ ||
      ch === 0x7E /* ~ */
    )
  }

  // https://tc39.es/ecma262/#prod-ClassSetSyntaxCharacter
  function isClassSetSyntaxCharacter(ch) {
    return (
      ch === 0x28 /* ( */ ||
      ch === 0x29 /* ) */ ||
      ch === 0x2D /* - */ ||
      ch === 0x2F /* / */ ||
      ch >= 0x5B /* [ */ && ch <= 0x5D /* ] */ ||
      ch >= 0x7B /* { */ && ch <= 0x7D /* } */
    )
  }

  // https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
  pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
    var ch = state.current();
    if (isClassSetReservedPunctuator(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }
    return false
  };

  // https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
  function isClassSetReservedPunctuator(ch) {
    return (
      ch === 0x21 /* ! */ ||
      ch === 0x23 /* # */ ||
      ch === 0x25 /* % */ ||
      ch === 0x26 /* & */ ||
      ch === 0x2C /* , */ ||
      ch === 0x2D /* - */ ||
      ch >= 0x3A /* : */ && ch <= 0x3E /* > */ ||
      ch === 0x40 /* @ */ ||
      ch === 0x60 /* ` */ ||
      ch === 0x7E /* ~ */
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
  pp$1.regexp_eatClassControlLetter = function(state) {
    var ch = state.current();
    if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
      state.lastIntValue = ch % 0x20;
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  pp$1.regexp_eatHexEscapeSequence = function(state) {
    var start = state.pos;
    if (state.eat(0x78 /* x */)) {
      if (this.regexp_eatFixedHexDigits(state, 2)) {
        return true
      }
      if (state.switchU) {
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
  pp$1.regexp_eatDecimalDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isDecimalDigit(ch = state.current())) {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
      state.advance();
    }
    return state.pos !== start
  };
  function isDecimalDigit(ch) {
    return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
  pp$1.regexp_eatHexDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isHexDigit(ch = state.current())) {
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return state.pos !== start
  };
  function isHexDigit(ch) {
    return (
      (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
      (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
      (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
    )
  }
  function hexToInt(ch) {
    if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
      return 10 + (ch - 0x41 /* A */)
    }
    if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
      return 10 + (ch - 0x61 /* a */)
    }
    return ch - 0x30 /* 0 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
  // Allows only 0-377(octal) i.e. 0-255(decimal).
  pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
    if (this.regexp_eatOctalDigit(state)) {
      var n1 = state.lastIntValue;
      if (this.regexp_eatOctalDigit(state)) {
        var n2 = state.lastIntValue;
        if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
          state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
        } else {
          state.lastIntValue = n1 * 8 + n2;
        }
      } else {
        state.lastIntValue = n1;
      }
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
  pp$1.regexp_eatOctalDigit = function(state) {
    var ch = state.current();
    if (isOctalDigit(ch)) {
      state.lastIntValue = ch - 0x30; /* 0 */
      state.advance();
      return true
    }
    state.lastIntValue = 0;
    return false
  };
  function isOctalDigit(ch) {
    return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
  // And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  pp$1.regexp_eatFixedHexDigits = function(state, length) {
    var start = state.pos;
    state.lastIntValue = 0;
    for (var i = 0; i < length; ++i) {
      var ch = state.current();
      if (!isHexDigit(ch)) {
        state.pos = start;
        return false
      }
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return true
  };

  // Object type used to represent tokens. Note that normally, tokens
  // simply exist as properties on the parser object. This is only
  // used for the onToken callback and the external tokenizer.

  var Token = function Token(p) {
    this.type = p.type;
    this.value = p.value;
    this.start = p.start;
    this.end = p.end;
    if (p.options.locations)
      { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
    if (p.options.ranges)
      { this.range = [p.start, p.end]; }
  };

  // ## Tokenizer

  var pp = Parser.prototype;

  // Move to the next token

  pp.next = function(ignoreEscapeSequenceInKeyword) {
    if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc)
      { this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword); }
    if (this.options.onToken)
      { this.options.onToken(new Token(this)); }

    this.lastTokEnd = this.end;
    this.lastTokStart = this.start;
    this.lastTokEndLoc = this.endLoc;
    this.lastTokStartLoc = this.startLoc;
    this.nextToken();
  };

  pp.getToken = function() {
    this.next();
    return new Token(this)
  };

  // If we're in an ES6 environment, make parsers iterable
  if (typeof Symbol !== "undefined")
    { pp[Symbol.iterator] = function() {
      var this$1$1 = this;

      return {
        next: function () {
          var token = this$1$1.getToken();
          return {
            done: token.type === types$1.eof,
            value: token
          }
        }
      }
    }; }

  // Toggle strict mode. Re-reads the next number or string to please
  // pedantic tests (`"use strict"; 010;` should fail).

  // Read a single token, updating the parser object's token-related
  // properties.

  pp.nextToken = function() {
    var curContext = this.curContext();
    if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

    this.start = this.pos;
    if (this.options.locations) { this.startLoc = this.curPosition(); }
    if (this.pos >= this.input.length) { return this.finishToken(types$1.eof) }

    if (curContext.override) { return curContext.override(this) }
    else { this.readToken(this.fullCharCodeAtPos()); }
  };

  pp.readToken = function(code) {
    // Identifier or keyword. '\uXXXX' sequences are allowed in
    // identifiers, so '\' also dispatches to that.
    if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
      { return this.readWord() }

    return this.getTokenFromCode(code)
  };

  pp.fullCharCodeAtPos = function() {
    var code = this.input.charCodeAt(this.pos);
    if (code <= 0xd7ff || code >= 0xdc00) { return code }
    var next = this.input.charCodeAt(this.pos + 1);
    return next <= 0xdbff || next >= 0xe000 ? code : (code << 10) + next - 0x35fdc00
  };

  pp.skipBlockComment = function() {
    var startLoc = this.options.onComment && this.curPosition();
    var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
    if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
    this.pos = end + 2;
    if (this.options.locations) {
      for (var nextBreak = (void 0), pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1;) {
        ++this.curLine;
        pos = this.lineStart = nextBreak;
      }
    }
    if (this.options.onComment)
      { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                             startLoc, this.curPosition()); }
  };

  pp.skipLineComment = function(startSkip) {
    var start = this.pos;
    var startLoc = this.options.onComment && this.curPosition();
    var ch = this.input.charCodeAt(this.pos += startSkip);
    while (this.pos < this.input.length && !isNewLine(ch)) {
      ch = this.input.charCodeAt(++this.pos);
    }
    if (this.options.onComment)
      { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                             startLoc, this.curPosition()); }
  };

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  pp.skipSpace = function() {
    loop: while (this.pos < this.input.length) {
      var ch = this.input.charCodeAt(this.pos);
      switch (ch) {
      case 32: case 160: // ' '
        ++this.pos;
        break
      case 13:
        if (this.input.charCodeAt(this.pos + 1) === 10) {
          ++this.pos;
        }
      case 10: case 8232: case 8233:
        ++this.pos;
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        break
      case 47: // '/'
        switch (this.input.charCodeAt(this.pos + 1)) {
        case 42: // '*'
          this.skipBlockComment();
          break
        case 47:
          this.skipLineComment(2);
          break
        default:
          break loop
        }
        break
      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this.pos;
        } else {
          break loop
        }
      }
    }
  };

  // Called at the end of every token. Sets `end`, `val`, and
  // maintains `context` and `exprAllowed`, and skips the space after
  // the token, so that the next one's `start` will point at the
  // right position.

  pp.finishToken = function(type, val) {
    this.end = this.pos;
    if (this.options.locations) { this.endLoc = this.curPosition(); }
    var prevType = this.type;
    this.type = type;
    this.value = val;

    this.updateContext(prevType);
  };

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.
  //
  pp.readToken_dot = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next >= 48 && next <= 57) { return this.readNumber(true) }
    var next2 = this.input.charCodeAt(this.pos + 2);
    if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
      this.pos += 3;
      return this.finishToken(types$1.ellipsis)
    } else {
      ++this.pos;
      return this.finishToken(types$1.dot)
    }
  };

  pp.readToken_slash = function() { // '/'
    var next = this.input.charCodeAt(this.pos + 1);
    if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(types$1.slash, 1)
  };

  pp.readToken_mult_modulo_exp = function(code) { // '%*'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    var tokentype = code === 42 ? types$1.star : types$1.modulo;

    // exponentiation operator ** and **=
    if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
      ++size;
      tokentype = types$1.starstar;
      next = this.input.charCodeAt(this.pos + 2);
    }

    if (next === 61) { return this.finishOp(types$1.assign, size + 1) }
    return this.finishOp(tokentype, size)
  };

  pp.readToken_pipe_amp = function(code) { // '|&'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (this.options.ecmaVersion >= 12) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 === 61) { return this.finishOp(types$1.assign, 3) }
      }
      return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2)
    }
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1)
  };

  pp.readToken_caret = function() { // '^'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(types$1.bitwiseXOR, 1)
  };

  pp.readToken_plus_min = function(code) { // '+-'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
          (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
        // A `-->` line comment
        this.skipLineComment(3);
        this.skipSpace();
        return this.nextToken()
      }
      return this.finishOp(types$1.incDec, 2)
    }
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(types$1.plusMin, 1)
  };

  pp.readToken_lt_gt = function(code) { // '<>'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
      if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types$1.assign, size + 1) }
      return this.finishOp(types$1.bitShift, size)
    }
    if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
        this.input.charCodeAt(this.pos + 3) === 45) {
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      this.skipLineComment(4);
      this.skipSpace();
      return this.nextToken()
    }
    if (next === 61) { size = 2; }
    return this.finishOp(types$1.relational, size)
  };

  pp.readToken_eq_excl = function(code) { // '=!'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) { return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
    if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
      this.pos += 2;
      return this.finishToken(types$1.arrow)
    }
    return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1)
  };

  pp.readToken_question = function() { // '?'
    var ecmaVersion = this.options.ecmaVersion;
    if (ecmaVersion >= 11) {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 46) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 < 48 || next2 > 57) { return this.finishOp(types$1.questionDot, 2) }
      }
      if (next === 63) {
        if (ecmaVersion >= 12) {
          var next2$1 = this.input.charCodeAt(this.pos + 2);
          if (next2$1 === 61) { return this.finishOp(types$1.assign, 3) }
        }
        return this.finishOp(types$1.coalesce, 2)
      }
    }
    return this.finishOp(types$1.question, 1)
  };

  pp.readToken_numberSign = function() { // '#'
    var ecmaVersion = this.options.ecmaVersion;
    var code = 35; // '#'
    if (ecmaVersion >= 13) {
      ++this.pos;
      code = this.fullCharCodeAtPos();
      if (isIdentifierStart(code, true) || code === 92 /* '\' */) {
        return this.finishToken(types$1.privateId, this.readWord1())
      }
    }

    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };

  pp.getTokenFromCode = function(code) {
    switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46: // '.'
      return this.readToken_dot()

    // Punctuation tokens.
    case 40: ++this.pos; return this.finishToken(types$1.parenL)
    case 41: ++this.pos; return this.finishToken(types$1.parenR)
    case 59: ++this.pos; return this.finishToken(types$1.semi)
    case 44: ++this.pos; return this.finishToken(types$1.comma)
    case 91: ++this.pos; return this.finishToken(types$1.bracketL)
    case 93: ++this.pos; return this.finishToken(types$1.bracketR)
    case 123: ++this.pos; return this.finishToken(types$1.braceL)
    case 125: ++this.pos; return this.finishToken(types$1.braceR)
    case 58: ++this.pos; return this.finishToken(types$1.colon)

    case 96: // '`'
      if (this.options.ecmaVersion < 6) { break }
      ++this.pos;
      return this.finishToken(types$1.backQuote)

    case 48: // '0'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
        if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
      }

    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
      return this.readNumber(false)

    // Quotes produce strings.
    case 34: case 39: // '"', "'"
      return this.readString(code)

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.
    case 47: // '/'
      return this.readToken_slash()

    case 37: case 42: // '%*'
      return this.readToken_mult_modulo_exp(code)

    case 124: case 38: // '|&'
      return this.readToken_pipe_amp(code)

    case 94: // '^'
      return this.readToken_caret()

    case 43: case 45: // '+-'
      return this.readToken_plus_min(code)

    case 60: case 62: // '<>'
      return this.readToken_lt_gt(code)

    case 61: case 33: // '=!'
      return this.readToken_eq_excl(code)

    case 63: // '?'
      return this.readToken_question()

    case 126: // '~'
      return this.finishOp(types$1.prefix, 1)

    case 35: // '#'
      return this.readToken_numberSign()
    }

    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };

  pp.finishOp = function(type, size) {
    var str = this.input.slice(this.pos, this.pos + size);
    this.pos += size;
    return this.finishToken(type, str)
  };

  pp.readRegexp = function() {
    var escaped, inClass, start = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(start, "Unterminated regular expression"); }
      var ch = this.input.charAt(this.pos);
      if (lineBreak.test(ch)) { this.raise(start, "Unterminated regular expression"); }
      if (!escaped) {
        if (ch === "[") { inClass = true; }
        else if (ch === "]" && inClass) { inClass = false; }
        else if (ch === "/" && !inClass) { break }
        escaped = ch === "\\";
      } else { escaped = false; }
      ++this.pos;
    }
    var pattern = this.input.slice(start, this.pos);
    ++this.pos;
    var flagsStart = this.pos;
    var flags = this.readWord1();
    if (this.containsEsc) { this.unexpected(flagsStart); }

    // Validate pattern
    var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
    state.reset(start, pattern, flags);
    this.validateRegExpFlags(state);
    this.validateRegExpPattern(state);

    // Create Literal#value property value.
    var value = null;
    try {
      value = new RegExp(pattern, flags);
    } catch (e) {
      // ESTree requires null if it failed to instantiate RegExp object.
      // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
    }

    return this.finishToken(types$1.regexp, {pattern: pattern, flags: flags, value: value})
  };

  // Read an integer in the given radix. Return null if zero digits
  // were read, the integer value otherwise. When `len` is given, this
  // will return `null` unless the integer has exactly `len` digits.

  pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
    // `len` is used for character escape sequences. In that case, disallow separators.
    var allowSeparators = this.options.ecmaVersion >= 12 && len === undefined;

    // `maybeLegacyOctalNumericLiteral` is true if it doesn't have prefix (0x,0o,0b)
    // and isn't fraction part nor exponent part. In that case, if the first digit
    // is zero then disallow separators.
    var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;

    var start = this.pos, total = 0, lastCode = 0;
    for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
      var code = this.input.charCodeAt(this.pos), val = (void 0);

      if (allowSeparators && code === 95) {
        if (isLegacyOctalNumericLiteral) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals"); }
        if (lastCode === 95) { this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore"); }
        if (i === 0) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits"); }
        lastCode = code;
        continue
      }

      if (code >= 97) { val = code - 97 + 10; } // a
      else if (code >= 65) { val = code - 65 + 10; } // A
      else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
      else { val = Infinity; }
      if (val >= radix) { break }
      lastCode = code;
      total = total * radix + val;
    }

    if (allowSeparators && lastCode === 95) { this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits"); }
    if (this.pos === start || len != null && this.pos - start !== len) { return null }

    return total
  };

  function stringToNumber(str, isLegacyOctalNumericLiteral) {
    if (isLegacyOctalNumericLiteral) {
      return parseInt(str, 8)
    }

    // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.
    return parseFloat(str.replace(/_/g, ""))
  }

  function stringToBigInt(str) {
    if (typeof BigInt !== "function") {
      return null
    }

    // `BigInt(value)` throws syntax error if the string contains numeric separators.
    return BigInt(str.replace(/_/g, ""))
  }

  pp.readRadixNumber = function(radix) {
    var start = this.pos;
    this.pos += 2; // 0x
    var val = this.readInt(radix);
    if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
    if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
      val = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
    } else if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
    return this.finishToken(types$1.num, val)
  };

  // Read an integer, octal integer, or floating-point number.

  pp.readNumber = function(startsWithDot) {
    var start = this.pos;
    if (!startsWithDot && this.readInt(10, undefined, true) === null) { this.raise(start, "Invalid number"); }
    var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
    if (octal && this.strict) { this.raise(start, "Invalid number"); }
    var next = this.input.charCodeAt(this.pos);
    if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
      var val$1 = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
      if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
      return this.finishToken(types$1.num, val$1)
    }
    if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
    if (next === 46 && !octal) { // '.'
      ++this.pos;
      this.readInt(10);
      next = this.input.charCodeAt(this.pos);
    }
    if ((next === 69 || next === 101) && !octal) { // 'eE'
      next = this.input.charCodeAt(++this.pos);
      if (next === 43 || next === 45) { ++this.pos; } // '+-'
      if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
    }
    if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

    var val = stringToNumber(this.input.slice(start, this.pos), octal);
    return this.finishToken(types$1.num, val)
  };

  // Read a string value, interpreting backslash-escapes.

  pp.readCodePoint = function() {
    var ch = this.input.charCodeAt(this.pos), code;

    if (ch === 123) { // '{'
      if (this.options.ecmaVersion < 6) { this.unexpected(); }
      var codePos = ++this.pos;
      code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
      ++this.pos;
      if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
    } else {
      code = this.readHexChar(4);
    }
    return code
  };

  pp.readString = function(quote) {
    var out = "", chunkStart = ++this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated string constant"); }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === quote) { break }
      if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(false);
        chunkStart = this.pos;
      } else if (ch === 0x2028 || ch === 0x2029) {
        if (this.options.ecmaVersion < 10) { this.raise(this.start, "Unterminated string constant"); }
        ++this.pos;
        if (this.options.locations) {
          this.curLine++;
          this.lineStart = this.pos;
        }
      } else {
        if (isNewLine(ch)) { this.raise(this.start, "Unterminated string constant"); }
        ++this.pos;
      }
    }
    out += this.input.slice(chunkStart, this.pos++);
    return this.finishToken(types$1.string, out)
  };

  // Reads template string tokens.

  var INVALID_TEMPLATE_ESCAPE_ERROR = {};

  pp.tryReadTemplateToken = function() {
    this.inTemplateElement = true;
    try {
      this.readTmplToken();
    } catch (err) {
      if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
        this.readInvalidTemplateToken();
      } else {
        throw err
      }
    }

    this.inTemplateElement = false;
  };

  pp.invalidStringToken = function(position, message) {
    if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
      throw INVALID_TEMPLATE_ESCAPE_ERROR
    } else {
      this.raise(position, message);
    }
  };

  pp.readTmplToken = function() {
    var out = "", chunkStart = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated template"); }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) { // '`', '${'
        if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
          if (ch === 36) {
            this.pos += 2;
            return this.finishToken(types$1.dollarBraceL)
          } else {
            ++this.pos;
            return this.finishToken(types$1.backQuote)
          }
        }
        out += this.input.slice(chunkStart, this.pos);
        return this.finishToken(types$1.template, out)
      }
      if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(true);
        chunkStart = this.pos;
      } else if (isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.pos);
        ++this.pos;
        switch (ch) {
        case 13:
          if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; }
        case 10:
          out += "\n";
          break
        default:
          out += String.fromCharCode(ch);
          break
        }
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        chunkStart = this.pos;
      } else {
        ++this.pos;
      }
    }
  };

  // Reads a template token to search for the end, without validating any escape sequences
  pp.readInvalidTemplateToken = function() {
    for (; this.pos < this.input.length; this.pos++) {
      switch (this.input[this.pos]) {
      case "\\":
        ++this.pos;
        break

      case "$":
        if (this.input[this.pos + 1] !== "{") {
          break
        }

      // falls through
      case "`":
        return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos))

      // no default
      }
    }
    this.raise(this.start, "Unterminated template");
  };

  // Used to read escaped characters

  pp.readEscapedChar = function(inTemplate) {
    var ch = this.input.charCodeAt(++this.pos);
    ++this.pos;
    switch (ch) {
    case 110: return "\n" // 'n' -> '\n'
    case 114: return "\r" // 'r' -> '\r'
    case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
    case 117: return codePointToString(this.readCodePoint()) // 'u'
    case 116: return "\t" // 't' -> '\t'
    case 98: return "\b" // 'b' -> '\b'
    case 118: return "\u000b" // 'v' -> '\u000b'
    case 102: return "\f" // 'f' -> '\f'
    case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
    case 10: // ' \n'
      if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
      return ""
    case 56:
    case 57:
      if (this.strict) {
        this.invalidStringToken(
          this.pos - 1,
          "Invalid escape sequence"
        );
      }
      if (inTemplate) {
        var codePos = this.pos - 1;

        this.invalidStringToken(
          codePos,
          "Invalid escape sequence in template string"
        );
      }
    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }
        this.pos += octalStr.length - 1;
        ch = this.input.charCodeAt(this.pos);
        if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
          this.invalidStringToken(
            this.pos - 1 - octalStr.length,
            inTemplate
              ? "Octal literal in template string"
              : "Octal literal in strict mode"
          );
        }
        return String.fromCharCode(octal)
      }
      if (isNewLine(ch)) {
        // Unicode new line characters after \ get removed from output in both
        // template literals and strings
        return ""
      }
      return String.fromCharCode(ch)
    }
  };

  // Used to read character escape sequences ('\x', '\u', '\U').

  pp.readHexChar = function(len) {
    var codePos = this.pos;
    var n = this.readInt(16, len);
    if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
    return n
  };

  // Read an identifier, and return it as a string. Sets `this.containsEsc`
  // to whether the word contained a '\u' escape.
  //
  // Incrementally adds only escaped chars, adding other chunks as-is
  // as a micro-optimization.

  pp.readWord1 = function() {
    this.containsEsc = false;
    var word = "", first = true, chunkStart = this.pos;
    var astral = this.options.ecmaVersion >= 6;
    while (this.pos < this.input.length) {
      var ch = this.fullCharCodeAtPos();
      if (isIdentifierChar(ch, astral)) {
        this.pos += ch <= 0xffff ? 1 : 2;
      } else if (ch === 92) { // "\"
        this.containsEsc = true;
        word += this.input.slice(chunkStart, this.pos);
        var escStart = this.pos;
        if (this.input.charCodeAt(++this.pos) !== 117) // "u"
          { this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX"); }
        ++this.pos;
        var esc = this.readCodePoint();
        if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
          { this.invalidStringToken(escStart, "Invalid Unicode escape"); }
        word += codePointToString(esc);
        chunkStart = this.pos;
      } else {
        break
      }
      first = false;
    }
    return word + this.input.slice(chunkStart, this.pos)
  };

  // Read an identifier or keyword token. Will check for reserved
  // words when necessary.

  pp.readWord = function() {
    var word = this.readWord1();
    var type = types$1.name;
    if (this.keywords.test(word)) {
      type = keywords[word];
    }
    return this.finishToken(type, word)
  };

  // Acorn is a tiny, fast JavaScript parser written in JavaScript.
  //
  // Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
  // various contributors and released under an MIT license.
  //
  // Git repositories for Acorn are available at
  //
  //     http://marijnhaverbeke.nl/git/acorn
  //     https://github.com/acornjs/acorn.git
  //
  // Please use the [github bug tracker][ghbt] to report issues.
  //
  // [ghbt]: https://github.com/acornjs/acorn/issues
  //
  // [walk]: util/walk.js


  var version = "8.10.0";

  Parser.acorn = {
    Parser: Parser,
    version: version,
    defaultOptions: defaultOptions,
    Position: Position,
    SourceLocation: SourceLocation,
    getLineInfo: getLineInfo,
    Node: Node,
    TokenType: TokenType,
    tokTypes: types$1,
    keywordTypes: keywords,
    TokContext: TokContext,
    tokContexts: types,
    isIdentifierChar: isIdentifierChar,
    isIdentifierStart: isIdentifierStart,
    Token: Token,
    isNewLine: isNewLine,
    lineBreak: lineBreak,
    lineBreakG: lineBreakG,
    nonASCIIwhitespace: nonASCIIwhitespace
  };

  // The main exported interface (under `self.acorn` when in the
  // browser) is a `parse` function that takes a code string and
  // returns an abstract syntax tree as specified by [Mozilla parser
  // API][api].
  //
  // [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

  function parse(input, options) {
    return Parser.parse(input, options)
  }

  // This function tries to parse a single expression at a given
  // offset in a string. Useful for parsing mixed-language formats
  // that embed JavaScript expressions.

  function parseExpressionAt(input, pos, options) {
    return Parser.parseExpressionAt(input, pos, options)
  }

  // Acorn is organized as a tokenizer and a recursive-descent parser.
  // The `tokenizer` export provides an interface to the tokenizer.

  function tokenizer(input, options) {
    return Parser.tokenizer(input, options)
  }

  exports.Node = Node;
  exports.Parser = Parser;
  exports.Position = Position;
  exports.SourceLocation = SourceLocation;
  exports.TokContext = TokContext;
  exports.Token = Token;
  exports.TokenType = TokenType;
  exports.defaultOptions = defaultOptions;
  exports.getLineInfo = getLineInfo;
  exports.isIdentifierChar = isIdentifierChar;
  exports.isIdentifierStart = isIdentifierStart;
  exports.isNewLine = isNewLine;
  exports.keywordTypes = keywords;
  exports.lineBreak = lineBreak;
  exports.lineBreakG = lineBreakG;
  exports.nonASCIIwhitespace = nonASCIIwhitespace;
  exports.parse = parse;
  exports.parseExpressionAt = parseExpressionAt;
  exports.tokContexts = types;
  exports.tokTypes = types$1;
  exports.tokenizer = tokenizer;
  exports.version = version;

}));


/***/ }),

/***/ "./widget/Applet.ts":
/*!**************************!*\
  !*** ./widget/Applet.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Runnable = void 0;
const index_1 = __webpack_require__(/*! ./utils/index */ "./widget/utils/index.ts");
class Runnable {
    constructor(root, mount) {
        this.root = root;
        this.mount = mount;
    }
}
exports.Runnable = Runnable;
class Applet {
    get key() { return this._key; }
    findModule(id) { return this._modules[id]; }
    putModule(module) {
        module.setApplet(this);
        this._modules[module.key] = module;
    }
    removeModule(key) { delete this._modules[key]; }
    fill(jsxCode) {
        this.middleCode = index_1.default.compiler.parse(jsxCode);
        console.log(JSON.stringify(this.middleCode));
        let r = index_1.default.compiler.extractModules(this.middleCode, this);
        r.forEach((module) => this.putModule(module));
    }
    onCreatureStateChange(creature, newVersion) {
        let oldVersion = this.oldVersions[creature._key];
        this.oldVersions[creature._key] = newVersion;
        let updates = index_1.default.json.diff(oldVersion, newVersion);
        updates.forEach((u) => {
            if (u.__action__ === 'element_deleted') {
                let keys = Object.keys(this.cache.elements).filter(k => {
                    if (k.startsWith(u.__key__)) {
                        delete this.cache.elements[k];
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                if (keys.length > 0) {
                    let temp = keys[keys.length - 1].split('-');
                    if (temp.length > 1) {
                        let temp2 = temp.slice(0, temp.length - 1).join('-');
                        delete this.cache.elements[temp2];
                    }
                }
            }
        });
        this.update(oldVersion._key, updates);
    }
    run(genesis, nativeBuilder, update) {
        return new Promise(resolve => {
            this._nativeBuilder = nativeBuilder;
            this.update = update;
            this.firstMount = false;
            this.cache.elements = {};
            this.cache.mounts = [];
            let genesisMod = this._modules[genesis];
            this._genesisCreature = genesisMod.instantiate();
            let genesisMetaContext = index_1.default.generator.nestedContext(this._genesisCreature);
            this.cache.mounts.push(() => this._genesisCreature.getBaseMethod('onMount')(genesisMetaContext));
            this._genesisCreature.getBaseMethod('constructor')(genesisMetaContext);
            let view = this._genesisCreature.getBaseMethod('render')(genesisMetaContext);
            this.oldVersions[this._genesisCreature._key] = view;
            resolve(new Runnable(view, () => {
                this.firstMount = true;
                this.cache.mounts.reverse().forEach((onMount) => onMount());
            }));
        });
    }
    constructor(key, modules) {
        this.cache = {
            elements: {},
            mounts: []
        };
        this.oldVersions = {};
        this.firstMount = false;
        this._key = key;
        this._modules = modules ? modules : {};
    }
}
exports["default"] = Applet;


/***/ }),

/***/ "./widget/Creature.ts":
/*!****************************!*\
  !*** ./widget/Creature.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const DOM_1 = __webpack_require__(/*! ./DOM */ "./widget/DOM.ts");
const ExecutionMeta_1 = __webpack_require__(/*! ./ExecutionMeta */ "./widget/ExecutionMeta.ts");
const Runtime_1 = __webpack_require__(/*! ./Runtime */ "./widget/Runtime.ts");
const utils_1 = __webpack_require__(/*! ./utils */ "./widget/utils/index.ts");
class Creature {
    get key() { return this._key; }
    get cosmoId() { return this._cosmoId; }
    setCosmoId(cosmoId) { this._cosmoId = cosmoId; }
    get module() { return this._module; }
    get runtime() { return this._runtime; }
    get dom() { return this._dom; }
    getBaseMethod(methodId) {
        return this._runtime.stack[0].findUnit(methodId);
    }
    update(props, styles, children) {
        this.thisObj = Object.assign(Object.assign({}, this.thisObj), { props,
            styles,
            children });
    }
    fillChildren(children) {
        this.thisObj.children = children;
    }
    constructor(module, defaultValues) {
        this._key = (defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues._key) ? defaultValues._key : utils_1.default.generator.generateKey();
        this._cosmoId = defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.cosmoId;
        this._module = module;
        this._dom = (defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.dom) ? defaultValues.dom : new DOM_1.default(this._module, this);
        this._runtime = (defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.runtime) ? defaultValues.runtime : new Runtime_1.default(this._module, this);
        this.thisObj = defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.thisObj;
        if (!(defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.runtime)) {
            this._runtime.load();
        }
        if (!this.thisObj) {
            this.thisObj = {};
            Object.keys(this._runtime.stack[0].units).forEach(k => {
                if (!this._runtime.native[k] || (k === 'constructor')) {
                    this.thisObj[k] = this._runtime.stack[0].units[k];
                }
            });
            this.thisObj = {};
        }
        this.thisObj['setState'] = (stateUpdate) => {
            console.log(stateUpdate);
            this.thisObj['state'] = Object.assign(Object.assign({}, this.thisObj['state']), stateUpdate);
            let newMetaBranch = new ExecutionMeta_1.default({ creature: this, parentJsxKey: this.thisObj['parentJsxKey'] });
            let newRender = this.getBaseMethod('render')(newMetaBranch);
            this._module.applet.onCreatureStateChange(this, newRender);
        };
    }
}
exports["default"] = Creature;


/***/ }),

/***/ "./widget/CreatureStore.ts":
/*!*********************************!*\
  !*** ./widget/CreatureStore.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class CreatureStore {
    putCreature(creature) { this._store[creature.key] = creature; }
    removeCreature(key) { delete this._store[key]; }
    findCreature(key) { return this._store[key]; }
    constructor() {
        this._store = {};
    }
}
exports["default"] = CreatureStore;


/***/ }),

/***/ "./widget/DOM.ts":
/*!***********************!*\
  !*** ./widget/DOM.ts ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class DOM {
    get module() { return this._module; }
    get creature() { return this._creature; }
    get root() { return this._root; }
    setRoot(root) { this._root = root; }
    constructor(module, creature, root) {
        this._module = module;
        this._creature = creature;
        this._root = root;
    }
}
exports["default"] = DOM;


/***/ }),

/***/ "./widget/ExecutionMeta.ts":
/*!*********************************!*\
  !*** ./widget/ExecutionMeta.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class ExecutionMeta {
    constructor(metaDict) {
        this.creature = metaDict.creature;
        this.declaration = (metaDict.declaration === true);
        this.declarationType = metaDict.declarationType;
        this.returnIdParent = metaDict.returnIdParent;
        this.isAnotherCreature = metaDict.isAnotherCreature;
        this.parentJsxKey = metaDict.parentJsxKey;
        if (this.declaration && !this.declarationType) {
        }
    }
}
exports["default"] = ExecutionMeta;


/***/ }),

/***/ "./widget/FuncStore.ts":
/*!*****************************!*\
  !*** ./widget/FuncStore.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class FuncStore {
    get store() { return this._store; }
    putFunc(func) { this._store[func.key] = func; }
    removeFunc(key) { delete this._store[key]; }
    findFunc(key) { return this._store[key]; }
    constructor() {
        this._store = {};
    }
}
exports["default"] = FuncStore;


/***/ }),

/***/ "./widget/INative.ts":
/*!***************************!*\
  !*** ./widget/INative.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class INative {
    get key() { return this._module.key; }
    constructor(module) {
        this._module = module;
    }
}
exports["default"] = INative;


/***/ }),

/***/ "./widget/MemoryLayer.ts":
/*!*******************************!*\
  !*** ./widget/MemoryLayer.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class MemoryLayer {
    get units() { return this._units; }
    findUnit(key) { return this._units[key]; }
    putUnit(key, unit) { this._units[key] = unit; }
    removeUnit(key) { delete this._units[key]; }
    constructor(initialUnits) {
        this._units = initialUnits ? initialUnits : {};
    }
}
exports["default"] = MemoryLayer;


/***/ }),

/***/ "./widget/Module.ts":
/*!**************************!*\
  !*** ./widget/Module.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const Creature_1 = __webpack_require__(/*! ./Creature */ "./widget/Creature.ts");
const CreatureStore_1 = __webpack_require__(/*! ./CreatureStore */ "./widget/CreatureStore.ts");
const DOM_1 = __webpack_require__(/*! ./DOM */ "./widget/DOM.ts");
const FuncStore_1 = __webpack_require__(/*! ./FuncStore */ "./widget/FuncStore.ts");
class Module {
    get applet() { return this._applet; }
    setApplet(applet) { this._applet = applet; }
    get creatures() { return this._creatures; }
    get key() { return this._key; }
    get funcs() { return this._funcs; }
    get dom() { return this._dom; }
    get ast() { return this._ast; }
    setAst(ast) { this._ast = ast; }
    instantiate(props, styles, children, thisObj) {
        let creature = new Creature_1.default(this, {
            cosmoId: props === null || props === void 0 ? void 0 : props.key,
            thisObj: thisObj ? Object.assign(Object.assign({}, thisObj), { props: props ? props : {}, styles: styles ? styles : {}, children: children ? children : [] }) : {
                props: props ? props : {},
                styles: styles ? styles : {},
                children: children ? children : []
            }
        });
        this._creatures.putCreature(creature);
        return creature;
    }
    constructor(key, applet, ast) {
        this._key = key;
        this._applet = applet;
        this._ast = ast;
        this._creatures = new CreatureStore_1.default();
        this._funcs = new FuncStore_1.default();
        this._dom = new DOM_1.default(this);
    }
}
exports["default"] = Module;


/***/ }),

/***/ "./widget/Runtime.ts":
/*!***************************!*\
  !*** ./widget/Runtime.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const MemoryLayer_1 = __webpack_require__(/*! ./MemoryLayer */ "./widget/MemoryLayer.ts");
const utils_1 = __webpack_require__(/*! ./utils */ "./widget/utils/index.ts");
class Runtime {
    get module() { return this._module; }
    get creature() { return this._creature; }
    get native() { return this._native; }
    pushOnStack(initialUnits) { this.stack.push(new MemoryLayer_1.default(initialUnits)); }
    popFromStack() { this.stack.pop(); }
    get stackTop() { return this.stack[this.stack.length - 1]; }
    resetStack() {
        this.stack = [];
        this.pushOnStack(Object.assign({}, this._native));
    }
    reset() {
        this.resetStack();
    }
    execute(ast) {
        utils_1.default.executor.executeBlock(ast, new utils_1.default.executor.ExecutionMeta({ creature: this._creature }));
    }
    load() {
        this.execute(this.module.ast.body.body);
    }
    clone() {
        let copy = new Runtime(this.module, this.creature, { native: this.native, stack: new Array(...this.stack) });
        return copy;
    }
    constructor(module, creature, reusableTools) {
        this.stack = [];
        this._module = module;
        this._creature = creature;
        this._native = (reusableTools === null || reusableTools === void 0 ? void 0 : reusableTools.native) ? reusableTools.native : this._module.applet._nativeBuilder(this._module);
        if (reusableTools === null || reusableTools === void 0 ? void 0 : reusableTools.stack) {
            this.stack = reusableTools.stack;
        }
        else {
            this.reset();
        }
    }
}
exports["default"] = Runtime;


/***/ }),

/***/ "./widget/controls/BaseControl.ts":
/*!****************************************!*\
  !*** ./widget/controls/BaseControl.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class BaseControl {
}
exports["default"] = BaseControl;


/***/ }),

/***/ "./widget/controls/BoxControl.ts":
/*!***************************************!*\
  !*** ./widget/controls/BoxControl.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const BaseControl_1 = __webpack_require__(/*! ./BaseControl */ "./widget/controls/BaseControl.ts");
const utils_1 = __webpack_require__(/*! ../utils */ "./widget/utils/index.ts");
class BoxControl extends BaseControl_1.default {
    static instantiate(overridenProps, overridenStyles, children) {
        return utils_1.default.generator.prepareElement(BoxControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children);
    }
}
BoxControl.TYPE = 'box';
BoxControl.defaultProps = {};
BoxControl.defaultStyles = {
    width: 200,
    height: 200
};
exports["default"] = BoxControl;


/***/ }),

/***/ "./widget/controls/ButtonControl.ts":
/*!******************************************!*\
  !*** ./widget/controls/ButtonControl.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const BaseControl_1 = __webpack_require__(/*! ./BaseControl */ "./widget/controls/BaseControl.ts");
const StringProp_1 = __webpack_require__(/*! ../props/StringProp */ "./widget/props/StringProp.ts");
const utils_1 = __webpack_require__(/*! ../utils */ "./widget/utils/index.ts");
const FuncProp_1 = __webpack_require__(/*! ../props/FuncProp */ "./widget/props/FuncProp.ts");
class ButtonControl extends BaseControl_1.default {
    static instantiate(overridenProps, overridenStyles, children) {
        return utils_1.default.generator.prepareElement(ButtonControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children);
    }
}
ButtonControl.TYPE = 'button';
ButtonControl.defaultProps = {
    caption: new StringProp_1.default(''),
    variant: new StringProp_1.default('filled'),
    onClick: new FuncProp_1.default(undefined)
};
ButtonControl.defaultStyles = {
    width: 150,
    height: 'auto'
};
exports["default"] = ButtonControl;


/***/ }),

/***/ "./widget/controls/CardControl.ts":
/*!****************************************!*\
  !*** ./widget/controls/CardControl.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const BaseControl_1 = __webpack_require__(/*! ./BaseControl */ "./widget/controls/BaseControl.ts");
const utils_1 = __webpack_require__(/*! ../utils */ "./widget/utils/index.ts");
class CardControl extends BaseControl_1.default {
    static instantiate(overridenProps, overridenStyles, children) {
        return utils_1.default.generator.prepareElement(CardControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children);
    }
}
CardControl.TYPE = 'card';
CardControl.defaultProps = {};
CardControl.defaultStyles = {
    width: 200,
    height: 200,
    boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
    backgroundColor: '#fff',
    borderRadius: 4
};
exports["default"] = CardControl;


/***/ }),

/***/ "./widget/controls/PrimaryTabControl.ts":
/*!**********************************************!*\
  !*** ./widget/controls/PrimaryTabControl.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const BaseControl_1 = __webpack_require__(/*! ./BaseControl */ "./widget/controls/BaseControl.ts");
const utils_1 = __webpack_require__(/*! ../utils */ "./widget/utils/index.ts");
class PrimaryTabControl extends BaseControl_1.default {
    static instantiate(overridenProps, overridenStyles, children) {
        return utils_1.default.generator.prepareElement(PrimaryTabControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children);
    }
}
PrimaryTabControl.TYPE = 'primary-tab';
PrimaryTabControl.defaultProps = {};
PrimaryTabControl.defaultStyles = {};
exports["default"] = PrimaryTabControl;


/***/ }),

/***/ "./widget/controls/TabsControl.ts":
/*!****************************************!*\
  !*** ./widget/controls/TabsControl.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const BaseControl_1 = __webpack_require__(/*! ./BaseControl */ "./widget/controls/BaseControl.ts");
const utils_1 = __webpack_require__(/*! ../utils */ "./widget/utils/index.ts");
const FuncProp_1 = __webpack_require__(/*! ../props/FuncProp */ "./widget/props/FuncProp.ts");
class TabsControl extends BaseControl_1.default {
    static instantiate(overridenProps, overridenStyles, children) {
        return utils_1.default.generator.prepareElement(TabsControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children);
    }
}
TabsControl.TYPE = 'tabs';
TabsControl.defaultProps = {
    onChange: new FuncProp_1.default(undefined)
};
TabsControl.defaultStyles = {};
exports["default"] = TabsControl;


/***/ }),

/***/ "./widget/controls/TextControl.ts":
/*!****************************************!*\
  !*** ./widget/controls/TextControl.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const BaseControl_1 = __webpack_require__(/*! ./BaseControl */ "./widget/controls/BaseControl.ts");
const StringProp_1 = __webpack_require__(/*! ../props/StringProp */ "./widget/props/StringProp.ts");
const utils_1 = __webpack_require__(/*! ../utils */ "./widget/utils/index.ts");
class TextControl extends BaseControl_1.default {
    static instantiate(overridenProps, overridenStyles, children) {
        return utils_1.default.generator.prepareElement(TextControl.TYPE, this.defaultProps, overridenProps, this.defaultStyles, overridenStyles, children);
    }
}
TextControl.TYPE = 'text';
TextControl.defaultProps = {
    text: new StringProp_1.default('')
};
TextControl.defaultStyles = {
    width: 150,
    height: 'auto'
};
exports["default"] = TextControl;


/***/ }),

/***/ "./widget/controls/index.ts":
/*!**********************************!*\
  !*** ./widget/controls/index.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const BoxControl_1 = __webpack_require__(/*! ./BoxControl */ "./widget/controls/BoxControl.ts");
const ButtonControl_1 = __webpack_require__(/*! ./ButtonControl */ "./widget/controls/ButtonControl.ts");
const CardControl_1 = __webpack_require__(/*! ./CardControl */ "./widget/controls/CardControl.ts");
const TabsControl_1 = __webpack_require__(/*! ./TabsControl */ "./widget/controls/TabsControl.ts");
const PrimaryTabControl_1 = __webpack_require__(/*! ./PrimaryTabControl */ "./widget/controls/PrimaryTabControl.ts");
const TextControl_1 = __webpack_require__(/*! ./TextControl */ "./widget/controls/TextControl.ts");
exports["default"] = {
    [TextControl_1.default.TYPE]: TextControl_1.default,
    [ButtonControl_1.default.TYPE]: ButtonControl_1.default,
    [BoxControl_1.default.TYPE]: BoxControl_1.default,
    [CardControl_1.default.TYPE]: CardControl_1.default,
    [TabsControl_1.default.TYPE]: TabsControl_1.default,
    [PrimaryTabControl_1.default.TYPE]: PrimaryTabControl_1.default
};


/***/ }),

/***/ "./widget/elements/BaseElement.ts":
/*!****************************************!*\
  !*** ./widget/elements/BaseElement.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class BaseElement {
    get key() { return this._key; }
    get controlType() { return this._controlType; }
    get props() { return this._props; }
    get styles() { return this._styles; }
    get children() { return this._children; }
    update(props, styles, children) {
        if (props)
            this._props = props;
        if (styles)
            this._styles = styles;
        if (children)
            this._children = children;
    }
    constructor(key, controlType, props, styles, children) {
        this._key = key;
        this._controlType = controlType;
        this._props = props;
        this._styles = styles;
        this._children = children ? children : [];
    }
}
exports["default"] = BaseElement;


/***/ }),

/***/ "./widget/props/BaseProp.ts":
/*!**********************************!*\
  !*** ./widget/props/BaseProp.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class BaseProp {
    get type() { return this._type; }
    constructor(type) {
        this._type = type;
    }
}
exports["default"] = BaseProp;


/***/ }),

/***/ "./widget/props/FuncProp.ts":
/*!**********************************!*\
  !*** ./widget/props/FuncProp.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const BaseProp_1 = __webpack_require__(/*! ./BaseProp */ "./widget/props/BaseProp.ts");
class FuncProp extends BaseProp_1.default {
    get value() { return this._value; }
    setValue(v) { this._value = v; }
    getValue() { return this._value; }
    get defaultValue() { return this._defaultValue; }
    constructor(defaultValue) {
        super('function');
        this._value = defaultValue;
        this._defaultValue = defaultValue;
    }
}
exports["default"] = FuncProp;


/***/ }),

/***/ "./widget/props/StringProp.ts":
/*!************************************!*\
  !*** ./widget/props/StringProp.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const BaseProp_1 = __webpack_require__(/*! ./BaseProp */ "./widget/props/BaseProp.ts");
class StringProp extends BaseProp_1.default {
    get value() { return this._value; }
    setValue(v) { this._value = v; }
    getValue() { return this._value; }
    get defaultValue() { return this._defaultValue; }
    constructor(defaultValue) {
        super('string');
        this._value = defaultValue;
        this._defaultValue = defaultValue;
    }
}
exports["default"] = StringProp;


/***/ }),

/***/ "./widget/utils/compiler.ts":
/*!**********************************!*\
  !*** ./widget/utils/compiler.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const acorn_1 = __webpack_require__(/*! acorn */ "./node_modules/acorn/dist/acorn.js");
const jsx = __webpack_require__(/*! acorn-jsx */ "./node_modules/acorn-jsx/index.js");
const Module_1 = __webpack_require__(/*! ../Module */ "./widget/Module.ts");
const cssProperty_1 = __webpack_require__(/*! ./cssProperty */ "./widget/utils/cssProperty.ts");
const hyphenateStyleName_1 = __webpack_require__(/*! ./hyphenateStyleName */ "./widget/utils/hyphenateStyleName.ts");
let { isUnitlessNumber } = cssProperty_1.default;
let jsxCompiler = acorn_1.Parser.extend(jsx());
var isArray = Array.isArray;
var keys = Object.keys;
var counter = 1;
var unquotedContentValueRegex = /^(normal|none|(\b(url\([^)]*\)|chapter_counter|attr\([^)]*\)|(no-)?(open|close)-quote|inherit)((\b\s*)|$|\s+))+)$/;
function buildRule(key, value) {
    if (!isUnitlessNumber[key] && typeof value === 'number') {
        value = '' + value + 'px';
    }
    else if (key === 'content' && !unquotedContentValueRegex.test(value)) {
        value = "'" + value.replace(/'/g, "\\'") + "'";
    }
    return (0, hyphenateStyleName_1.default)(key) + ': ' + value + ';  ';
}
function buildValue(key, value) {
    if (!isUnitlessNumber[key] && typeof value === 'number') {
        value = '' + value + 'px';
    }
    else if (key === 'content' && !unquotedContentValueRegex.test(value)) {
        value = "'" + value.replace(/'/g, "\\'") + "'";
    }
    return value + '';
}
function styleToCssString(rules) {
    var result = '';
    if (!rules || keys(rules).length === 0) {
        return result;
    }
    var styleKeys = keys(rules);
    for (var j = 0, l = styleKeys.length; j < l; j++) {
        var styleKey = styleKeys[j];
        var value = rules[styleKey];
        if (isArray(value)) {
            for (var i = 0, len = value.length; i < len; i++) {
                result += buildRule(styleKey, value[i]);
            }
        }
        else {
            result += buildRule(styleKey, value);
        }
    }
    return result;
}
let parse = (jsxCode) => {
    return jsxCompiler.parse(jsxCode, { sourceType: 'module', ecmaVersion: 'latest' });
};
let extractModules = (middleCode, applet) => {
    return middleCode.body
        .filter((declaration) => declaration.type === 'ClassDeclaration')
        .map((declaration) => {
        return new Module_1.default(declaration.id.name, applet, declaration);
    });
};
exports["default"] = { parse, extractModules, styleToCssString, buildRule, buildValue };


/***/ }),

/***/ "./widget/utils/cssProperty.ts":
/*!*************************************!*\
  !*** ./widget/utils/cssProperty.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var isUnitlessNumber = {
    boxFlex: true,
    boxFlexGroup: true,
    columnCount: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    widows: true,
    zIndex: true,
    zoom: true,
    fillOpacity: true,
    strokeDashoffset: true,
    strokeOpacity: true,
    strokeWidth: true
};
function prefixKey(prefix, key) {
    return prefix + key.charAt(0).toUpperCase() + key.substring(1);
}
var prefixes = ['Webkit', 'ms', 'Moz', 'O'];
Object.keys(isUnitlessNumber).forEach(function (prop) {
    prefixes.forEach(function (prefix) {
        isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
    });
});
var shorthandPropertyExpansions = {
    background: {
        backgroundImage: true,
        backgroundPosition: true,
        backgroundRepeat: true,
        backgroundColor: true
    },
    border: {
        borderWidth: true,
        borderStyle: true,
        borderColor: true
    },
    borderBottom: {
        borderBottomWidth: true,
        borderBottomStyle: true,
        borderBottomColor: true
    },
    borderLeft: {
        borderLeftWidth: true,
        borderLeftStyle: true,
        borderLeftColor: true
    },
    borderRight: {
        borderRightWidth: true,
        borderRightStyle: true,
        borderRightColor: true
    },
    borderTop: {
        borderTopWidth: true,
        borderTopStyle: true,
        borderTopColor: true
    },
    font: {
        fontStyle: true,
        fontVariant: true,
        fontWeight: true,
        fontSize: true,
        lineHeight: true,
        fontFamily: true
    }
};
var CSSProperty = {
    isUnitlessNumber: isUnitlessNumber,
    shorthandPropertyExpansions: shorthandPropertyExpansions
};
exports["default"] = CSSProperty;


/***/ }),

/***/ "./widget/utils/executor.ts":
/*!**********************************!*\
  !*** ./widget/utils/executor.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const Creature_1 = __webpack_require__(/*! ../Creature */ "./widget/Creature.ts");
const ExecutionMeta_1 = __webpack_require__(/*! ../ExecutionMeta */ "./widget/ExecutionMeta.ts");
const _1 = __webpack_require__(/*! . */ "./widget/utils/index.ts");
let executeSingle = (code, meta) => {
    let callback = codeCallbacks[code.type];
    if (callback) {
        let r = callback(code, meta);
        return r;
    }
    else {
        return code;
    }
};
let executeBlock = (codes, meta) => {
    for (let i = 0; i < codes.length; i++) {
        let code = codes[i];
        let r = executeSingle(code, meta);
        if (r === null || r === void 0 ? void 0 : r.returnFired)
            return r;
    }
};
let findLayer = (meta, id) => {
    for (let i = meta.creature.runtime.stack.length - 1; i >= 0; i--) {
        let r = meta.creature._runtime.stack[i].findUnit(id);
        if (r !== undefined) {
            return meta.creature.runtime.stack[i];
        }
    }
};
const generateCallbackFunction = (code, meta) => {
    let newMetaBranch = meta;
    return (...args) => {
        let parameters = {};
        code.params.forEach((param, index) => {
            parameters[param.name] = args[index];
        });
        let firstParam = args[0];
        if (firstParam && (firstParam instanceof ExecutionMeta_1.default) && firstParam.isAnotherCreature) {
            newMetaBranch = firstParam;
        }
        newMetaBranch.creature.runtime.pushOnStack(parameters);
        let result = executeSingle(code.body, newMetaBranch);
        newMetaBranch.creature.runtime.popFromStack();
        return result === null || result === void 0 ? void 0 : result.value;
    };
};
let codeCallbacks = {
    UnaryExpression: (code, meta) => {
        if (code.operator === '!') {
            return !executeSingle(code.argument, meta);
        }
    },
    LogicalExpression: (code, meta) => {
        if (code.operator === '&&') {
            return executeSingle(code.left, meta) && executeSingle(code.right, meta);
        }
        else if (code.operator === '||') {
            return executeSingle(code.left, meta) || executeSingle(code.right, meta);
        }
    },
    ConditionalExpression: (code, meta) => {
        return executeSingle(code.test, meta) ? executeSingle(code.consequent, meta) : executeSingle(code.alternate, meta);
    },
    ThisExpression: (code, meta) => {
        return meta.creature.thisObj;
    },
    JSXExpressionContainer: (code, meta) => {
        return executeSingle(code.expression, meta);
    },
    JSXText: (code, meta) => {
        return code.value.trim();
    },
    JSXElement: (code, meta) => {
        if (!code.cosmoId)
            code.cosmoId = _1.default.generator.generateKey();
        let Control = meta.creature.module.applet.findModule(code.openingElement.name.name);
        let attrs = {};
        code.openingElement.attributes.forEach((attr) => {
            attrs[attr.name.name] = executeSingle(attr.value, meta);
        });
        let key = attrs['key'];
        if (key === undefined) {
            key = code.cosmoId;
        }
        if (meta.parentJsxKey)
            key = meta.parentJsxKey + '-' + key;
        attrs['key'] = key;
        let c = meta.creature.module.applet.cache.elements[key];
        let isNew = (c === undefined);
        c = Control.instantiate(attrs, attrs['style'], [], c === null || c === void 0 ? void 0 : c.thisObj);
        let childMeta = new ExecutionMeta_1.default(Object.assign(Object.assign({}, meta), { parentJsxKey: key }));
        let children = code.children.map((child) => executeSingle(child, childMeta))
            .flat(Infinity).filter((child) => (child !== ''));
        c.fillChildren(children);
        if (meta.parentJsxKey)
            c.thisObj.parentJsxKey = meta.parentJsxKey;
        let newMetaBranch = _1.default.generator.nestedContext(c, Object.assign(Object.assign({}, meta), { parentJsxKey: key }));
        meta.creature.module.applet.cache.elements[key] = c;
        if (isNew)
            c.getBaseMethod('constructor')(newMetaBranch);
        if (meta.creature.module.applet.firstMount) {
            c.getBaseMethod('onMount')(newMetaBranch);
        }
        else {
            meta.creature.module.applet.cache.mounts.push(() => c.getBaseMethod('onMount')(newMetaBranch));
        }
        let r = c.getBaseMethod('render')(newMetaBranch);
        if (!meta.creature.module.applet.oldVersions[c._key]) {
            meta.creature.module.applet.oldVersions[c._key] = r;
        }
        return r;
    },
    Program: (code, meta) => {
        code.body.forEach((child) => {
            executeSingle(child, meta);
        });
    },
    Literal: (code, meta) => {
        return code.value;
    },
    FunctionExpression: (code, meta) => {
        let newCreatureBranch = new Creature_1.default(meta.creature.module, Object.assign(Object.assign({}, meta.creature), { runtime: meta.creature.runtime.clone() }));
        let newMetaBranch = new ExecutionMeta_1.default(Object.assign(Object.assign({}, meta), { creature: newCreatureBranch }));
        return generateCallbackFunction(code, newMetaBranch);
    },
    FunctionDeclaration: (code, meta) => {
        let newCreatureBranch = new Creature_1.default(meta.creature.module, Object.assign(Object.assign({}, meta.creature), { runtime: meta.creature.runtime.clone() }));
        let newMetaBranch = new ExecutionMeta_1.default(Object.assign(Object.assign({}, meta), { creature: newCreatureBranch }));
        meta.creature.runtime.stackTop.putUnit(code.id.name, generateCallbackFunction(code, newMetaBranch));
    },
    MethodDefinition: (code, meta) => {
        meta.creature.runtime.stackTop.putUnit(code.key.name, executeSingle(code.value, meta));
    },
    VariableDeclaration: (code, meta) => {
        if (code.kind === 'let') {
            code.declarations.forEach((d) => executeSingle(d, new ExecutionMeta_1.default(Object.assign(Object.assign({}, meta), { declaration: true, declarationType: 'let' }))));
        }
        else if (code.kind === 'const') {
            code.declarations.forEach((d) => executeSingle(d, new ExecutionMeta_1.default(Object.assign(Object.assign({}, meta), { declaration: true, declarationType: 'const' }))));
        }
    },
    VariableDeclarator: (code, meta) => {
        if (meta === null || meta === void 0 ? void 0 : meta.declaration) {
            let val = executeSingle(code.init, meta);
            if (code.id.type === 'ObjectPattern') {
                code.id.properties.forEach((property) => {
                    meta.creature.runtime.stackTop.putUnit(property.key.name, val[property.key.name]);
                });
            }
            else {
                meta.creature.runtime.stackTop.putUnit(code.id.name, val);
            }
        }
    },
    Identifier: (code, meta) => {
        if (meta.returnIdParent) {
            for (let i = meta.creature.runtime.stack.length - 1; i >= 0; i--) {
                let wrapper = findLayer(meta, code.name);
                if (wrapper) {
                    return { parent: wrapper.units, id: code.name };
                }
            }
        }
        else {
            for (let i = meta.creature.runtime.stack.length - 1; i >= 0; i--) {
                let r = meta.creature.runtime.stack[i].findUnit(code.name);
                if (r !== undefined) {
                    return r;
                }
            }
        }
    },
    BinaryExpression: (code, meta) => {
        if (code.operator === '+') {
            return executeSingle(code.left, meta) + executeSingle(code.right, meta);
        }
        else if (code.operator === '-') {
            return executeSingle(code.left, meta) - executeSingle(code.right, meta);
        }
        else if (code.operator === '*') {
            return executeSingle(code.left, meta) * executeSingle(code.right, meta);
        }
        else if (code.operator === '/') {
            return executeSingle(code.left, meta) / executeSingle(code.right, meta);
        }
        else if (code.operator === '^') {
            return Math.pow(executeSingle(code.left, meta), executeSingle(code.right, meta));
        }
        else if (code.operator === '%') {
            return executeSingle(code.left, meta) % executeSingle(code.right, meta);
        }
        else if (code.operator === '===') {
            return executeSingle(code.left, meta) === executeSingle(code.right, meta);
        }
        else if (code.operator === '<') {
            return executeSingle(code.left, meta) < executeSingle(code.right, meta);
        }
        else if (code.operator === '>') {
            return executeSingle(code.left, meta) > executeSingle(code.right, meta);
        }
        else if (code.operator === '&') {
            return executeSingle(code.left, meta) & executeSingle(code.right, meta);
        }
        else if (code.operator === '|') {
            return executeSingle(code.left, meta) | executeSingle(code.right, meta);
        }
    },
    IfStatement: (code, meta) => {
        if (executeSingle(code.test, meta)) {
            let r = executeSingle(code.consequent, meta);
            if (r === null || r === void 0 ? void 0 : r.breakFired)
                return r;
            else if (r === null || r === void 0 ? void 0 : r.returnFired)
                return r;
        }
        else if (code.alternate) {
            let r = executeSingle(code.alternate, meta);
            if (r === null || r === void 0 ? void 0 : r.breakFired)
                return r;
            else if (r === null || r === void 0 ? void 0 : r.returnFired)
                return r;
        }
    },
    BreakStatement: (code, meta) => {
        return { breakFired: true };
    },
    WhileStatement: (code, meta) => {
        while (executeSingle(code.test, meta)) {
            let r = executeSingle(code.body, meta);
            if (r === null || r === void 0 ? void 0 : r.breakFired)
                break;
            else if (r === null || r === void 0 ? void 0 : r.returnFired)
                return r;
        }
    },
    BlockStatement: (code, meta) => {
        var _a;
        for (let i = 0; i < ((_a = code.body) === null || _a === void 0 ? void 0 : _a.length); i++) {
            let r = executeSingle(code.body[i], meta);
            if (r === null || r === void 0 ? void 0 : r.breakFired)
                return r;
            else if (r === null || r === void 0 ? void 0 : r.returnFired)
                return r;
        }
    },
    ExpressionStatement: (code, meta) => {
        return executeSingle(code.expression, meta);
    },
    AssignmentExpression: (code, meta) => {
        let right = executeSingle(code.right, meta);
        let wrapper = executeSingle(code.left, Object.assign(Object.assign({}, meta), { returnIdParent: true }));
        if (wrapper) {
            if (wrapper.parent !== undefined) {
                let before = wrapper.parent[wrapper.id];
                if (code.operator === '=') {
                    wrapper.parent[wrapper.id] = right;
                }
                else if (code.operator === '+=') {
                    wrapper.parent[wrapper.id] = before + right;
                }
                else if (code.operator === '-=') {
                    wrapper.parent[wrapper.id] = before - right;
                }
                else if (code.operator === '*=') {
                    wrapper.parent[wrapper.id] = before * right;
                }
                else if (code.operator === '/=') {
                    wrapper.parent[wrapper.id] = before / right;
                }
                else if (code.operator === '^=') {
                    wrapper.parent[wrapper.id] = Math.pow(before, right);
                }
                else if (code.operator === '%=') {
                    wrapper.parent[wrapper.id] = before % right;
                }
            }
            else {
                let layer = findLayer(meta, wrapper.id);
                if (layer) {
                    let r = layer.findUnit(wrapper.id);
                    if (r) {
                        if (code.operator === '=') {
                            r = right;
                        }
                        else if (code.operator === '+=') {
                            r += right;
                        }
                        else if (code.operator === '-=') {
                            r -= right;
                        }
                        else if (code.operator === '*=') {
                            r *= right;
                        }
                        else if (code.operator === '/=') {
                            r /= right;
                        }
                        else if (code.operator === '^=') {
                            r = Math.pow(r, right);
                        }
                        else if (code.operator === '%=') {
                            r %= right;
                        }
                        layer.putUnit(code.name, r);
                    }
                }
            }
        }
    },
    ForStatement: (code, meta) => {
        for (executeSingle(code.init, meta); executeSingle(code.test, meta); executeSingle(code.update, meta)) {
            let r = executeSingle(code.body, meta);
            if (r === null || r === void 0 ? void 0 : r.breakFired)
                break;
            else if (r === null || r === void 0 ? void 0 : r.returnFired)
                return r;
        }
    },
    UpdateExpression: (code, meta) => {
        if (['++', '--'].includes(code.operator)) {
            let wrapper = executeSingle(code.argument, Object.assign(Object.assign({}, meta), { returnIdParent: true }));
            if (wrapper) {
                if (wrapper.parent !== undefined) {
                    let before = wrapper.parent[wrapper.id];
                    if (typeof before === 'number') {
                        if (code.operator === '++')
                            before++;
                        else if (code.operator === '--')
                            before--;
                        wrapper.parent[wrapper.id] = before;
                    }
                }
                else {
                    let layer = findLayer(meta, wrapper.id);
                    if (layer) {
                        let r = layer.findUnit(wrapper.id);
                        if (r) {
                            if (typeof r === 'number') {
                                if (code.operator === '++')
                                    r++;
                                else if (code.operator === '--')
                                    r--;
                                layer.putUnit(code.name, r);
                            }
                        }
                    }
                }
            }
        }
    },
    CallExpression: (code, meta) => {
        let prop = undefined;
        if (code.property === undefined) {
            let r = executeSingle(code.callee, meta);
            return r(...code.arguments.map((c) => executeSingle(c, meta)));
        }
        else {
            if (code.callee.property.type === 'Identifier') {
                prop = code.callee.property.name;
            }
            let r = executeSingle(code.callee.object, meta);
            return r[prop](...code.arguments.map((c) => executeSingle(c, meta)));
        }
    },
    MemberExpression: (code, meta) => {
        let prop = undefined;
        if (code.property === undefined) {
            let r = executeSingle(code.object, meta);
            if (meta.returnIdParent) {
                return { parent: undefined, id: code.name };
            }
            else {
                return r;
            }
        }
        else {
            if (code.computed) {
                prop = executeSingle(code.property, meta);
            }
            else {
                if (code.property.type === 'Identifier') {
                    prop = code.property.name;
                }
                else if (code.property.type === 'Literal') {
                    prop = code.property.value;
                }
            }
            let filteredMeta = Object.assign({}, meta);
            delete filteredMeta['returnIdParent'];
            let r = executeSingle(code.object, filteredMeta);
            if (Array.isArray(r)) {
                let p = r[prop];
                if (typeof p === 'function') {
                    return (...args) => {
                        switch (prop) {
                            case 'push': {
                                return r.push(...args);
                            }
                            case 'map': {
                                return r.map(...args);
                            }
                            case 'forEach': {
                                return r.forEach(...args);
                            }
                            default: {
                            }
                        }
                    };
                }
                else {
                    if (meta.returnIdParent) {
                        return { parent: r, id: prop };
                    }
                    else {
                        return r[prop];
                    }
                }
            }
            else {
                if (meta.returnIdParent) {
                    return { parent: r, id: prop };
                }
                else {
                    return r[prop];
                }
            }
        }
    },
    SwitchStatement: (code, meta) => {
        let disc = executeSingle(code.discriminant, meta);
        for (let i = 0; i < code.cases.length; i++) {
            let c = code.cases[i];
            if (c.type === 'SwitchCase') {
                let caseCond = executeSingle(c.test, meta);
                if (disc === caseCond) {
                    for (let j = 0; j < c.consequent.lengthl; j++) {
                        let co = c.consequent[j];
                        let r = executeSingle(co, meta);
                        if (r === null || r === void 0 ? void 0 : r.returnFired)
                            return r;
                    }
                }
            }
        }
    },
    ArrowFunctionExpression: (code, meta) => {
        let newCreatureBranch = new Creature_1.default(meta.creature.module, Object.assign(Object.assign({}, meta.creature), { runtime: meta.creature.runtime.clone() }));
        let newMetaBranch = new ExecutionMeta_1.default(Object.assign(Object.assign({}, meta), { creature: newCreatureBranch }));
        return generateCallbackFunction(code, newMetaBranch);
    },
    ObjectExpression: (code, meta) => {
        let obj = {};
        code.properties.forEach((property) => {
            if (property.type === 'Property') {
                if (property.key.type === 'Identifier') {
                    obj[property.key.name] = executeSingle(property.value, meta);
                }
            }
            else {
                if (property.type === 'SpreadElement') {
                    obj[property.argument.name] = executeSingle(property, meta);
                }
            }
        });
        return obj;
    },
    ArrayExpression: (code, meta) => {
        let result = [];
        code.elements.forEach((arrEl) => {
            let r = executeSingle(arrEl, meta);
            if ((arrEl.type === 'SpreadElement') && Array.isArray(r)) {
                result.push(...r);
            }
            else {
                result.push(r);
            }
        });
        return result;
    },
    SpreadElement: (code, meta) => {
        let source = executeSingle(code.argument, meta);
        if (Array.isArray(source)) {
            return [...source];
        }
        else {
            return Object.assign({}, source);
        }
    },
    ReturnStatement: (code, meta) => {
        return { value: executeSingle(code.argument, meta), returnFired: true };
    }
};
exports["default"] = { executeSingle, executeBlock, ExecutionMeta: ExecutionMeta_1.default };


/***/ }),

/***/ "./widget/utils/generator.ts":
/*!***********************************!*\
  !*** ./widget/utils/generator.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const BaseElement_1 = __webpack_require__(/*! ../elements/BaseElement */ "./widget/elements/BaseElement.ts");
const ExecutionMeta_1 = __webpack_require__(/*! ../ExecutionMeta */ "./widget/ExecutionMeta.ts");
let generateKey = () => {
    return Math.random().toString().substring(2);
};
function clone(instance) {
    const copy = new instance.constructor();
    Object.assign(copy, instance);
    return copy;
}
const prepareElement = (typeName, defaultProps, overridenProps, defaultStyles, overridenStyles, children) => {
    let finalProps = {};
    Object.keys(defaultProps).forEach(propKey => {
        if (overridenProps[propKey] !== undefined) {
            let bpProp = defaultProps[propKey];
            let copiedProp = clone(bpProp);
            copiedProp.setValue(overridenProps[propKey]);
            finalProps[propKey] = copiedProp;
        }
    });
    let finalStyles = Object.assign({}, defaultStyles);
    if (overridenStyles)
        finalStyles = Object.assign(Object.assign({}, finalStyles), overridenStyles);
    return new BaseElement_1.default(overridenProps['key'], typeName, finalProps, finalStyles, children);
};
const nestedContext = (creature, otherMetas) => {
    if (otherMetas) {
        return new ExecutionMeta_1.default(Object.assign(Object.assign({}, otherMetas), { creature, isAnotherCreature: true }));
    }
    else {
        return new ExecutionMeta_1.default({ creature, isAnotherCreature: true });
    }
};
exports["default"] = { generateKey, prepareElement, nestedContext };


/***/ }),

/***/ "./widget/utils/hyphenateStyleName.ts":
/*!********************************************!*\
  !*** ./widget/utils/hyphenateStyleName.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var msPattern = /^ms-/;
var _uppercasePattern = /([A-Z])/g;
function hyphenate(string) {
    return string.replace(_uppercasePattern, '-$1').toLowerCase();
}
function hyphenateStyleName(string) {
    return hyphenate(string).replace(msPattern, '-ms-');
}
exports["default"] = hyphenateStyleName;


/***/ }),

/***/ "./widget/utils/index.ts":
/*!*******************************!*\
  !*** ./widget/utils/index.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const generator_1 = __webpack_require__(/*! ./generator */ "./widget/utils/generator.ts");
const compiler_1 = __webpack_require__(/*! ./compiler */ "./widget/utils/compiler.ts");
const json_1 = __webpack_require__(/*! ./json */ "./widget/utils/json.ts");
const executor_1 = __webpack_require__(/*! ./executor */ "./widget/utils/executor.ts");
exports["default"] = { generator: generator_1.default, compiler: compiler_1.default, json: json_1.default, executor: executor_1.default };


/***/ }),

/***/ "./widget/utils/json.ts":
/*!******************************!*\
  !*** ./widget/utils/json.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
let prettify = (obj) => {
    return JSON.stringify(obj, undefined, 4);
};
let updates = [];
let findChanges = (parentKey, el1, el2) => {
    if (el1._key !== el2._key) {
        updates.push({
            __action__: 'element_deleted',
            __key__: el1._key,
            __parentKey__: parentKey
        }, {
            __action__: 'element_created',
            __key__: el2._key,
            __element__: el2,
            __parentKey__: parentKey
        });
        return;
    }
    let propsChanges = { __action__: 'props_updated', __key__: el2._key, __created__: {}, __deleted__: {}, __updated__: {} };
    for (let pKey in el2._props) {
        if (el1._props[pKey] === undefined) {
            propsChanges.__created__[pKey] = el2._props[pKey];
        }
    }
    for (let pKey in el1._props) {
        if (el2._props[pKey] === undefined) {
            propsChanges.__deleted__[pKey] = el2._props[pKey];
        }
    }
    for (let pKey in el2._props) {
        if (el1._props[pKey] !== undefined && el2._props[pKey] !== undefined) {
            if (el1._props[pKey].getValue() !== el2._props[pKey].getValue()) {
                propsChanges.__updated__[pKey] = el2._props[pKey];
            }
        }
    }
    if ((Object.keys(propsChanges.__created__).length > 0) ||
        (Object.keys(propsChanges.__deleted__).length > 0) ||
        (Object.keys(propsChanges.__updated__).length > 0)) {
        updates.push(propsChanges);
    }
    let stylesChanges = { __action__: 'styles_updated', __key__: el2._key, __created__: {}, __deleted__: {}, __updated__: {} };
    for (let sKey in el2._styles) {
        if (el1._styles[sKey] === undefined) {
            stylesChanges.__created__[sKey] = el2._styles[sKey];
        }
    }
    for (let sKey in el1._styles) {
        if (el2._styles[sKey] === undefined) {
            stylesChanges.__deleted__[sKey] = el2._styles[sKey];
        }
    }
    for (let sKey in el2._styles) {
        if (el1._styles[sKey] !== undefined && el2._styles[sKey] !== undefined) {
            if (el1._styles[sKey] !== el2._styles[sKey]) {
                stylesChanges.__updated__[sKey] = el2._styles[sKey];
            }
        }
    }
    if ((Object.keys(stylesChanges.__created__).length > 0) ||
        (Object.keys(stylesChanges.__deleted__).length > 0) ||
        (Object.keys(stylesChanges.__updated__).length > 0)) {
        updates.push(stylesChanges);
    }
    let cs = {};
    el2._children.forEach(child => { cs[child._key] = child; });
    el1._children.forEach(child => {
        if (cs[child._key]) {
            findChanges(el1._key, child, cs[child._key]);
        }
        else {
            updates.push({
                __action__: 'element_deleted',
                __key__: child._key,
                __parentKey__: el1._key
            });
        }
    });
    cs = {};
    el1._children.forEach(child => { cs[child._key] = child; });
    el2._children.forEach(child => {
        if (!cs[child._key]) {
            updates.push({
                __action__: 'element_created',
                __key__: child._key,
                __element__: child,
                __parentKey__: el2._key
            });
        }
    });
};
let diff = (el1, el2) => {
    updates = [];
    findChanges(undefined, el1, el2);
    return updates;
};
exports["default"] = { prettify, diff };


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
var exports = __webpack_exports__;
/*!******************!*\
  !*** ./index.ts ***!
  \******************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.INative = exports.Controls = exports.Utils = exports.Module = exports.Runnable = exports.Applet = void 0;
const Module_1 = __webpack_require__(/*! ./widget/Module */ "./widget/Module.ts");
exports.Module = Module_1.default;
const Applet_1 = __webpack_require__(/*! ./widget/Applet */ "./widget/Applet.ts");
exports.Applet = Applet_1.default;
Object.defineProperty(exports, "Runnable", ({ enumerable: true, get: function () { return Applet_1.Runnable; } }));
const utils_1 = __webpack_require__(/*! ./widget/utils */ "./widget/utils/index.ts");
exports.Utils = utils_1.default;
const controls_1 = __webpack_require__(/*! ./widget/controls */ "./widget/controls/index.ts");
exports.Controls = controls_1.default;
const INative_1 = __webpack_require__(/*! ./widget/INative */ "./widget/INative.ts");
exports.INative = INative_1.default;

}();
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbWEtYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBYTs7QUFFYixzQkFBc0IsbUJBQU8sQ0FBQyxrREFBUzs7QUFFdkM7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxpQkFBaUI7QUFDMUQsaURBQWlELGlCQUFpQjtBQUNsRTtBQUNBOztBQUVBO0FBQ0Esa0NBQWtDO0FBQ2xDLGtDQUFrQztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7O0FBRUEsaUJBQWlCO0FBQ2pCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtREFBa0Q7QUFDbEQ7QUFDQSx3QkFBd0IsbUJBQU8sQ0FBQyxpREFBTztBQUN2QyxHQUFHO0FBQ0g7QUFDQTtBQUNBLENBQUMsRUFBQzs7QUFFRjtBQUNBLGdDQUFnQyxtQkFBTyxDQUFDLGlEQUFPO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxhQUFhLGtCQUFrQixpQ0FBaUM7QUFDaEc7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDJDQUEyQztBQUNuRDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0EsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSLGtDQUFrQztBQUNsQyxvQ0FBb0M7QUFDcEM7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUN2ZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxRQUFROztBQUVSO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0EsUUFBUTs7QUFFUjtBQUNBLFFBQVE7O0FBRVI7QUFDQTtBQUNBLDJDQUEyQztBQUMzQztBQUNBO0FBQ0EsUUFBUTs7QUFFUjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qjs7QUFFeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkM7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLGNBQWM7QUFDdEQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsUUFBUTs7QUFFUjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDZC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eUMsUUFBUTtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxPQUFPO0FBQ2Y7QUFDQSxzQkFBc0Isd0RBQXdEO0FBQzlFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0I7QUFDdEI7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDO0FBQ3RDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsUUFBUTs7QUFFUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsUUFBUTs7QUFFUjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7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QUFFQSxrQkFBa0I7QUFDbEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNkJBQTZCO0FBQzdCLDZCQUE2QjtBQUM3Qiw4QkFBOEI7QUFDOUI7QUFDQTtBQUNBLDJEQUEyRCxrQ0FBa0M7QUFDN0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBLFFBQVE7O0FBRVI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTtBQUNBLDBDQUEwQyxRQUFRO0FBQ2xEO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBLFFBQVE7QUFDUjtBQUNBLFFBQVE7QUFDUjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBLFFBQVE7QUFDUjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBLFVB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O0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUI7O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlCQUFpQjs7QUFFakI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsaUJBQWlCOztBQUVqQjtBQUNBOztBQUVBO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTs7QUFFUjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNERBQTREO0FBQzVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNkNBQTZDO0FBQzdDLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSw0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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvRUFBb0U7QUFDcEUsUUFBUSxPQUFPOztBQUVmO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSwyREFBMkQ7QUFDM0Q7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSwwQkFBMEI7O0FBRTFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDBCQUEwQjs7QUFFMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLGVBQWU7QUFDbEM7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1YsTUFBTTtBQUNOO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBLFVBQVU7QUFDVjtBQUNBLE1BQU07QUFDTiwrQ0FBK0MsUUFBUTtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaLHlDQUF5QztBQUN6QztBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhDQUE4QztBQUM5QztBQUNBLHFDQUFxQztBQUNyQztBQUNBOztBQUVBO0FBQ0E7QUFDQSw4Q0FBOEM7QUFDOUM7QUFDQSxxRUFBcUU7QUFDckU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0RBQWtELGlCQUFpQjtBQUNuRTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsZ0NBQWdDLGlCQUFpQjtBQUNqRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYSx1QkFBdUI7QUFDcEMsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsb0JBQW9CLGtCQUFrQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQiwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLHVCQUF1QjtBQUNwQyxlQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5REFBeUQ7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscURBQXFELGlCQUFpQjtBQUN0RTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDO0FBQ2hDO0FBQ0E7QUFDQSxvREFBb0Q7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixzQkFBc0I7QUFDNUM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkRBQTJELGNBQWM7QUFDekU7QUFDQSxvQ0FBb0MsMkJBQTJCO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0JBQXNCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUM7QUFFRCxJQUFJLElBQUksR0FBRyxDQUFDLEdBQWdCLEVBQUUsR0FBZ0IsRUFBRSxFQUFFO0lBQzlDLE9BQU8sR0FBRyxFQUFFO0lBQ1osV0FBVyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ2hDLE9BQU8sT0FBTztBQUNsQixDQUFDO0FBRUQscUJBQWUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFOzs7Ozs7O1VDakhqQztVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7Ozs7Ozs7Ozs7OztBQ3JCQSxrRkFBb0M7QUFTaEMsaUJBVEcsZ0JBQU0sQ0FTSDtBQVJWLGtGQUFrRDtBQU05QyxpQkFORyxnQkFBTSxDQU1IO0FBQ04sMEZBUGEsaUJBQVEsUUFPYjtBQU5aLHFGQUFrQztBQVE5QixnQkFSRyxlQUFLLENBUUg7QUFQVCw4RkFBd0M7QUFRcEMsbUJBUkcsa0JBQVEsQ0FRSDtBQVBaLHFGQUFzQztBQVFsQyxrQkFSRyxpQkFBTyxDQVFIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdm1lbmdpbmUvLi9ub2RlX21vZHVsZXMvYWNvcm4tanN4L2luZGV4LmpzIiwid2VicGFjazovL3ZtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2Fjb3JuLWpzeC94aHRtbC5qcyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL25vZGVfbW9kdWxlcy9hY29ybi9kaXN0L2Fjb3JuLmpzIiwid2VicGFjazovL3ZtZW5naW5lLy4vd2lkZ2V0L0FwcGxldC50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9DcmVhdHVyZS50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9DcmVhdHVyZVN0b3JlLnRzIiwid2VicGFjazovL3ZtZW5naW5lLy4vd2lkZ2V0L0RPTS50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9FeGVjdXRpb25NZXRhLnRzIiwid2VicGFjazovL3ZtZW5naW5lLy4vd2lkZ2V0L0Z1bmNTdG9yZS50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9JTmF0aXZlLnRzIiwid2VicGFjazovL3ZtZW5naW5lLy4vd2lkZ2V0L01lbW9yeUxheWVyLnRzIiwid2VicGFjazovL3ZtZW5naW5lLy4vd2lkZ2V0L01vZHVsZS50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9SdW50aW1lLnRzIiwid2VicGFjazovL3ZtZW5naW5lLy4vd2lkZ2V0L2NvbnRyb2xzL0Jhc2VDb250cm9sLnRzIiwid2VicGFjazovL3ZtZW5naW5lLy4vd2lkZ2V0L2NvbnRyb2xzL0JveENvbnRyb2wudHMiLCJ3ZWJwYWNrOi8vdm1lbmdpbmUvLi93aWRnZXQvY29udHJvbHMvQnV0dG9uQ29udHJvbC50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9jb250cm9scy9DYXJkQ29udHJvbC50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9jb250cm9scy9QcmltYXJ5VGFiQ29udHJvbC50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9jb250cm9scy9UYWJzQ29udHJvbC50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9jb250cm9scy9UZXh0Q29udHJvbC50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9jb250cm9scy9pbmRleC50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9lbGVtZW50cy9CYXNlRWxlbWVudC50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9wcm9wcy9CYXNlUHJvcC50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9wcm9wcy9GdW5jUHJvcC50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC9wcm9wcy9TdHJpbmdQcm9wLnRzIiwid2VicGFjazovL3ZtZW5naW5lLy4vd2lkZ2V0L3V0aWxzL2NvbXBpbGVyLnRzIiwid2VicGFjazovL3ZtZW5naW5lLy4vd2lkZ2V0L3V0aWxzL2Nzc1Byb3BlcnR5LnRzIiwid2VicGFjazovL3ZtZW5naW5lLy4vd2lkZ2V0L3V0aWxzL2V4ZWN1dG9yLnRzIiwid2VicGFjazovL3ZtZW5naW5lLy4vd2lkZ2V0L3V0aWxzL2dlbmVyYXRvci50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL3dpZGdldC91dGlscy9oeXBoZW5hdGVTdHlsZU5hbWUudHMiLCJ3ZWJwYWNrOi8vdm1lbmdpbmUvLi93aWRnZXQvdXRpbHMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vdm1lbmdpbmUvLi93aWRnZXQvdXRpbHMvanNvbi50cyIsIndlYnBhY2s6Ly92bWVuZ2luZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly92bWVuZ2luZS8uL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuY29uc3QgWEhUTUxFbnRpdGllcyA9IHJlcXVpcmUoJy4veGh0bWwnKTtcblxuY29uc3QgaGV4TnVtYmVyID0gL15bXFxkYS1mQS1GXSskLztcbmNvbnN0IGRlY2ltYWxOdW1iZXIgPSAvXlxcZCskLztcblxuLy8gVGhlIG1hcCB0byBgYWNvcm4tanN4YCB0b2tlbnMgZnJvbSBgYWNvcm5gIG5hbWVzcGFjZSBvYmplY3RzLlxuY29uc3QgYWNvcm5Kc3hNYXAgPSBuZXcgV2Vha01hcCgpO1xuXG4vLyBHZXQgdGhlIG9yaWdpbmFsIHRva2VucyBmb3IgdGhlIGdpdmVuIGBhY29ybmAgbmFtZXNwYWNlIG9iamVjdC5cbmZ1bmN0aW9uIGdldEpzeFRva2VucyhhY29ybikge1xuICBhY29ybiA9IGFjb3JuLlBhcnNlci5hY29ybiB8fCBhY29ybjtcbiAgbGV0IGFjb3JuSnN4ID0gYWNvcm5Kc3hNYXAuZ2V0KGFjb3JuKTtcbiAgaWYgKCFhY29ybkpzeCkge1xuICAgIGNvbnN0IHR0ID0gYWNvcm4udG9rVHlwZXM7XG4gICAgY29uc3QgVG9rQ29udGV4dCA9IGFjb3JuLlRva0NvbnRleHQ7XG4gICAgY29uc3QgVG9rZW5UeXBlID0gYWNvcm4uVG9rZW5UeXBlO1xuICAgIGNvbnN0IHRjX29UYWcgPSBuZXcgVG9rQ29udGV4dCgnPHRhZycsIGZhbHNlKTtcbiAgICBjb25zdCB0Y19jVGFnID0gbmV3IFRva0NvbnRleHQoJzwvdGFnJywgZmFsc2UpO1xuICAgIGNvbnN0IHRjX2V4cHIgPSBuZXcgVG9rQ29udGV4dCgnPHRhZz4uLi48L3RhZz4nLCB0cnVlLCB0cnVlKTtcbiAgICBjb25zdCB0b2tDb250ZXh0cyA9IHtcbiAgICAgIHRjX29UYWc6IHRjX29UYWcsXG4gICAgICB0Y19jVGFnOiB0Y19jVGFnLFxuICAgICAgdGNfZXhwcjogdGNfZXhwclxuICAgIH07XG4gICAgY29uc3QgdG9rVHlwZXMgPSB7XG4gICAgICBqc3hOYW1lOiBuZXcgVG9rZW5UeXBlKCdqc3hOYW1lJyksXG4gICAgICBqc3hUZXh0OiBuZXcgVG9rZW5UeXBlKCdqc3hUZXh0Jywge2JlZm9yZUV4cHI6IHRydWV9KSxcbiAgICAgIGpzeFRhZ1N0YXJ0OiBuZXcgVG9rZW5UeXBlKCdqc3hUYWdTdGFydCcsIHtzdGFydHNFeHByOiB0cnVlfSksXG4gICAgICBqc3hUYWdFbmQ6IG5ldyBUb2tlblR5cGUoJ2pzeFRhZ0VuZCcpXG4gICAgfTtcblxuICAgIHRva1R5cGVzLmpzeFRhZ1N0YXJ0LnVwZGF0ZUNvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY29udGV4dC5wdXNoKHRjX2V4cHIpOyAvLyB0cmVhdCBhcyBiZWdpbm5pbmcgb2YgSlNYIGV4cHJlc3Npb25cbiAgICAgIHRoaXMuY29udGV4dC5wdXNoKHRjX29UYWcpOyAvLyBzdGFydCBvcGVuaW5nIHRhZyBjb250ZXh0XG4gICAgICB0aGlzLmV4cHJBbGxvd2VkID0gZmFsc2U7XG4gICAgfTtcbiAgICB0b2tUeXBlcy5qc3hUYWdFbmQudXBkYXRlQ29udGV4dCA9IGZ1bmN0aW9uKHByZXZUeXBlKSB7XG4gICAgICBsZXQgb3V0ID0gdGhpcy5jb250ZXh0LnBvcCgpO1xuICAgICAgaWYgKG91dCA9PT0gdGNfb1RhZyAmJiBwcmV2VHlwZSA9PT0gdHQuc2xhc2ggfHwgb3V0ID09PSB0Y19jVGFnKSB7XG4gICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcbiAgICAgICAgdGhpcy5leHByQWxsb3dlZCA9IHRoaXMuY3VyQ29udGV4dCgpID09PSB0Y19leHByO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5leHByQWxsb3dlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGFjb3JuSnN4ID0geyB0b2tDb250ZXh0czogdG9rQ29udGV4dHMsIHRva1R5cGVzOiB0b2tUeXBlcyB9O1xuICAgIGFjb3JuSnN4TWFwLnNldChhY29ybiwgYWNvcm5Kc3gpO1xuICB9XG5cbiAgcmV0dXJuIGFjb3JuSnN4O1xufVxuXG4vLyBUcmFuc2Zvcm1zIEpTWCBlbGVtZW50IG5hbWUgdG8gc3RyaW5nLlxuXG5mdW5jdGlvbiBnZXRRdWFsaWZpZWRKU1hOYW1lKG9iamVjdCkge1xuICBpZiAoIW9iamVjdClcbiAgICByZXR1cm4gb2JqZWN0O1xuXG4gIGlmIChvYmplY3QudHlwZSA9PT0gJ0pTWElkZW50aWZpZXInKVxuICAgIHJldHVybiBvYmplY3QubmFtZTtcblxuICBpZiAob2JqZWN0LnR5cGUgPT09ICdKU1hOYW1lc3BhY2VkTmFtZScpXG4gICAgcmV0dXJuIG9iamVjdC5uYW1lc3BhY2UubmFtZSArICc6JyArIG9iamVjdC5uYW1lLm5hbWU7XG5cbiAgaWYgKG9iamVjdC50eXBlID09PSAnSlNYTWVtYmVyRXhwcmVzc2lvbicpXG4gICAgcmV0dXJuIGdldFF1YWxpZmllZEpTWE5hbWUob2JqZWN0Lm9iamVjdCkgKyAnLicgK1xuICAgIGdldFF1YWxpZmllZEpTWE5hbWUob2JqZWN0LnByb3BlcnR5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICByZXR1cm4gZnVuY3Rpb24oUGFyc2VyKSB7XG4gICAgcmV0dXJuIHBsdWdpbih7XG4gICAgICBhbGxvd05hbWVzcGFjZXM6IG9wdGlvbnMuYWxsb3dOYW1lc3BhY2VzICE9PSBmYWxzZSxcbiAgICAgIGFsbG93TmFtZXNwYWNlZE9iamVjdHM6ICEhb3B0aW9ucy5hbGxvd05hbWVzcGFjZWRPYmplY3RzXG4gICAgfSwgUGFyc2VyKTtcbiAgfTtcbn07XG5cbi8vIFRoaXMgaXMgYHRva1R5cGVzYCBvZiB0aGUgcGVlciBkZXAuXG4vLyBUaGlzIGNhbiBiZSBkaWZmZXJlbnQgaW5zdGFuY2VzIGZyb20gdGhlIGFjdHVhbCBgdG9rVHlwZXNgIHRoaXMgcGx1Z2luIHVzZXMuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLmV4cG9ydHMsIFwidG9rVHlwZXNcIiwge1xuICBnZXQ6IGZ1bmN0aW9uIGdldF90b2tUeXBlcygpIHtcbiAgICByZXR1cm4gZ2V0SnN4VG9rZW5zKHJlcXVpcmUoXCJhY29yblwiKSkudG9rVHlwZXM7XG4gIH0sXG4gIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgZW51bWVyYWJsZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIHBsdWdpbihvcHRpb25zLCBQYXJzZXIpIHtcbiAgY29uc3QgYWNvcm4gPSBQYXJzZXIuYWNvcm4gfHwgcmVxdWlyZShcImFjb3JuXCIpO1xuICBjb25zdCBhY29ybkpzeCA9IGdldEpzeFRva2VucyhhY29ybik7XG4gIGNvbnN0IHR0ID0gYWNvcm4udG9rVHlwZXM7XG4gIGNvbnN0IHRvayA9IGFjb3JuSnN4LnRva1R5cGVzO1xuICBjb25zdCB0b2tDb250ZXh0cyA9IGFjb3JuLnRva0NvbnRleHRzO1xuICBjb25zdCB0Y19vVGFnID0gYWNvcm5Kc3gudG9rQ29udGV4dHMudGNfb1RhZztcbiAgY29uc3QgdGNfY1RhZyA9IGFjb3JuSnN4LnRva0NvbnRleHRzLnRjX2NUYWc7XG4gIGNvbnN0IHRjX2V4cHIgPSBhY29ybkpzeC50b2tDb250ZXh0cy50Y19leHByO1xuICBjb25zdCBpc05ld0xpbmUgPSBhY29ybi5pc05ld0xpbmU7XG4gIGNvbnN0IGlzSWRlbnRpZmllclN0YXJ0ID0gYWNvcm4uaXNJZGVudGlmaWVyU3RhcnQ7XG4gIGNvbnN0IGlzSWRlbnRpZmllckNoYXIgPSBhY29ybi5pc0lkZW50aWZpZXJDaGFyO1xuXG4gIHJldHVybiBjbGFzcyBleHRlbmRzIFBhcnNlciB7XG4gICAgLy8gRXhwb3NlIGFjdHVhbCBgdG9rVHlwZXNgIGFuZCBgdG9rQ29udGV4dHNgIHRvIG90aGVyIHBsdWdpbnMuXG4gICAgc3RhdGljIGdldCBhY29ybkpzeCgpIHtcbiAgICAgIHJldHVybiBhY29ybkpzeDtcbiAgICB9XG5cbiAgICAvLyBSZWFkcyBpbmxpbmUgSlNYIGNvbnRlbnRzIHRva2VuLlxuICAgIGpzeF9yZWFkVG9rZW4oKSB7XG4gICAgICBsZXQgb3V0ID0gJycsIGNodW5rU3RhcnQgPSB0aGlzLnBvcztcbiAgICAgIGZvciAoOzspIHtcbiAgICAgICAgaWYgKHRoaXMucG9zID49IHRoaXMuaW5wdXQubGVuZ3RoKVxuICAgICAgICAgIHRoaXMucmFpc2UodGhpcy5zdGFydCwgJ1VudGVybWluYXRlZCBKU1ggY29udGVudHMnKTtcbiAgICAgICAgbGV0IGNoID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zKTtcblxuICAgICAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgIGNhc2UgNjA6IC8vICc8J1xuICAgICAgICBjYXNlIDEyMzogLy8gJ3snXG4gICAgICAgICAgaWYgKHRoaXMucG9zID09PSB0aGlzLnN0YXJ0KSB7XG4gICAgICAgICAgICBpZiAoY2ggPT09IDYwICYmIHRoaXMuZXhwckFsbG93ZWQpIHtcbiAgICAgICAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odG9rLmpzeFRhZ1N0YXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFRva2VuRnJvbUNvZGUoY2gpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXQgKz0gdGhpcy5pbnB1dC5zbGljZShjaHVua1N0YXJ0LCB0aGlzLnBvcyk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odG9rLmpzeFRleHQsIG91dCk7XG5cbiAgICAgICAgY2FzZSAzODogLy8gJyYnXG4gICAgICAgICAgb3V0ICs9IHRoaXMuaW5wdXQuc2xpY2UoY2h1bmtTdGFydCwgdGhpcy5wb3MpO1xuICAgICAgICAgIG91dCArPSB0aGlzLmpzeF9yZWFkRW50aXR5KCk7XG4gICAgICAgICAgY2h1bmtTdGFydCA9IHRoaXMucG9zO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgNjI6IC8vICc+J1xuICAgICAgICBjYXNlIDEyNTogLy8gJ30nXG4gICAgICAgICAgdGhpcy5yYWlzZShcbiAgICAgICAgICAgIHRoaXMucG9zLFxuICAgICAgICAgICAgXCJVbmV4cGVjdGVkIHRva2VuIGBcIiArIHRoaXMuaW5wdXRbdGhpcy5wb3NdICsgXCJgLiBEaWQgeW91IG1lYW4gYFwiICtcbiAgICAgICAgICAgICAgKGNoID09PSA2MiA/IFwiJmd0O1wiIDogXCImcmJyYWNlO1wiKSArIFwiYCBvciBcIiArIFwiYHtcXFwiXCIgKyB0aGlzLmlucHV0W3RoaXMucG9zXSArIFwiXFxcIn1cIiArIFwiYD9cIlxuICAgICAgICAgICk7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoaXNOZXdMaW5lKGNoKSkge1xuICAgICAgICAgICAgb3V0ICs9IHRoaXMuaW5wdXQuc2xpY2UoY2h1bmtTdGFydCwgdGhpcy5wb3MpO1xuICAgICAgICAgICAgb3V0ICs9IHRoaXMuanN4X3JlYWROZXdMaW5lKHRydWUpO1xuICAgICAgICAgICAgY2h1bmtTdGFydCA9IHRoaXMucG9zO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICArK3RoaXMucG9zO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGpzeF9yZWFkTmV3TGluZShub3JtYWxpemVDUkxGKSB7XG4gICAgICBsZXQgY2ggPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MpO1xuICAgICAgbGV0IG91dDtcbiAgICAgICsrdGhpcy5wb3M7XG4gICAgICBpZiAoY2ggPT09IDEzICYmIHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcykgPT09IDEwKSB7XG4gICAgICAgICsrdGhpcy5wb3M7XG4gICAgICAgIG91dCA9IG5vcm1hbGl6ZUNSTEYgPyAnXFxuJyA6ICdcXHJcXG4nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0ID0gU3RyaW5nLmZyb21DaGFyQ29kZShjaCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmxvY2F0aW9ucykge1xuICAgICAgICArK3RoaXMuY3VyTGluZTtcbiAgICAgICAgdGhpcy5saW5lU3RhcnQgPSB0aGlzLnBvcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG5cbiAgICBqc3hfcmVhZFN0cmluZyhxdW90ZSkge1xuICAgICAgbGV0IG91dCA9ICcnLCBjaHVua1N0YXJ0ID0gKyt0aGlzLnBvcztcbiAgICAgIGZvciAoOzspIHtcbiAgICAgICAgaWYgKHRoaXMucG9zID49IHRoaXMuaW5wdXQubGVuZ3RoKVxuICAgICAgICAgIHRoaXMucmFpc2UodGhpcy5zdGFydCwgJ1VudGVybWluYXRlZCBzdHJpbmcgY29uc3RhbnQnKTtcbiAgICAgICAgbGV0IGNoID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zKTtcbiAgICAgICAgaWYgKGNoID09PSBxdW90ZSkgYnJlYWs7XG4gICAgICAgIGlmIChjaCA9PT0gMzgpIHsgLy8gJyYnXG4gICAgICAgICAgb3V0ICs9IHRoaXMuaW5wdXQuc2xpY2UoY2h1bmtTdGFydCwgdGhpcy5wb3MpO1xuICAgICAgICAgIG91dCArPSB0aGlzLmpzeF9yZWFkRW50aXR5KCk7XG4gICAgICAgICAgY2h1bmtTdGFydCA9IHRoaXMucG9zO1xuICAgICAgICB9IGVsc2UgaWYgKGlzTmV3TGluZShjaCkpIHtcbiAgICAgICAgICBvdXQgKz0gdGhpcy5pbnB1dC5zbGljZShjaHVua1N0YXJ0LCB0aGlzLnBvcyk7XG4gICAgICAgICAgb3V0ICs9IHRoaXMuanN4X3JlYWROZXdMaW5lKGZhbHNlKTtcbiAgICAgICAgICBjaHVua1N0YXJ0ID0gdGhpcy5wb3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgb3V0ICs9IHRoaXMuaW5wdXQuc2xpY2UoY2h1bmtTdGFydCwgdGhpcy5wb3MrKyk7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0dC5zdHJpbmcsIG91dCk7XG4gICAgfVxuXG4gICAganN4X3JlYWRFbnRpdHkoKSB7XG4gICAgICBsZXQgc3RyID0gJycsIGNvdW50ID0gMCwgZW50aXR5O1xuICAgICAgbGV0IGNoID0gdGhpcy5pbnB1dFt0aGlzLnBvc107XG4gICAgICBpZiAoY2ggIT09ICcmJylcbiAgICAgICAgdGhpcy5yYWlzZSh0aGlzLnBvcywgJ0VudGl0eSBtdXN0IHN0YXJ0IHdpdGggYW4gYW1wZXJzYW5kJyk7XG4gICAgICBsZXQgc3RhcnRQb3MgPSArK3RoaXMucG9zO1xuICAgICAgd2hpbGUgKHRoaXMucG9zIDwgdGhpcy5pbnB1dC5sZW5ndGggJiYgY291bnQrKyA8IDEwKSB7XG4gICAgICAgIGNoID0gdGhpcy5pbnB1dFt0aGlzLnBvcysrXTtcbiAgICAgICAgaWYgKGNoID09PSAnOycpIHtcbiAgICAgICAgICBpZiAoc3RyWzBdID09PSAnIycpIHtcbiAgICAgICAgICAgIGlmIChzdHJbMV0gPT09ICd4Jykge1xuICAgICAgICAgICAgICBzdHIgPSBzdHIuc3Vic3RyKDIpO1xuICAgICAgICAgICAgICBpZiAoaGV4TnVtYmVyLnRlc3Qoc3RyKSlcbiAgICAgICAgICAgICAgICBlbnRpdHkgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KHN0ciwgMTYpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN0ciA9IHN0ci5zdWJzdHIoMSk7XG4gICAgICAgICAgICAgIGlmIChkZWNpbWFsTnVtYmVyLnRlc3Qoc3RyKSlcbiAgICAgICAgICAgICAgICBlbnRpdHkgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KHN0ciwgMTApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZW50aXR5ID0gWEhUTUxFbnRpdGllc1tzdHJdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzdHIgKz0gY2g7XG4gICAgICB9XG4gICAgICBpZiAoIWVudGl0eSkge1xuICAgICAgICB0aGlzLnBvcyA9IHN0YXJ0UG9zO1xuICAgICAgICByZXR1cm4gJyYnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVudGl0eTtcbiAgICB9XG5cbiAgICAvLyBSZWFkIGEgSlNYIGlkZW50aWZpZXIgKHZhbGlkIHRhZyBvciBhdHRyaWJ1dGUgbmFtZSkuXG4gICAgLy9cbiAgICAvLyBPcHRpbWl6ZWQgdmVyc2lvbiBzaW5jZSBKU1ggaWRlbnRpZmllcnMgY2FuJ3QgY29udGFpblxuICAgIC8vIGVzY2FwZSBjaGFyYWN0ZXJzIGFuZCBzbyBjYW4gYmUgcmVhZCBhcyBzaW5nbGUgc2xpY2UuXG4gICAgLy8gQWxzbyBhc3N1bWVzIHRoYXQgZmlyc3QgY2hhcmFjdGVyIHdhcyBhbHJlYWR5IGNoZWNrZWRcbiAgICAvLyBieSBpc0lkZW50aWZpZXJTdGFydCBpbiByZWFkVG9rZW4uXG5cbiAgICBqc3hfcmVhZFdvcmQoKSB7XG4gICAgICBsZXQgY2gsIHN0YXJ0ID0gdGhpcy5wb3M7XG4gICAgICBkbyB7XG4gICAgICAgIGNoID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KCsrdGhpcy5wb3MpO1xuICAgICAgfSB3aGlsZSAoaXNJZGVudGlmaWVyQ2hhcihjaCkgfHwgY2ggPT09IDQ1KTsgLy8gJy0nXG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0b2suanN4TmFtZSwgdGhpcy5pbnB1dC5zbGljZShzdGFydCwgdGhpcy5wb3MpKTtcbiAgICB9XG5cbiAgICAvLyBQYXJzZSBuZXh0IHRva2VuIGFzIEpTWCBpZGVudGlmaWVyXG5cbiAgICBqc3hfcGFyc2VJZGVudGlmaWVyKCkge1xuICAgICAgbGV0IG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdG9rLmpzeE5hbWUpXG4gICAgICAgIG5vZGUubmFtZSA9IHRoaXMudmFsdWU7XG4gICAgICBlbHNlIGlmICh0aGlzLnR5cGUua2V5d29yZClcbiAgICAgICAgbm9kZS5uYW1lID0gdGhpcy50eXBlLmtleXdvcmQ7XG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMudW5leHBlY3RlZCgpO1xuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsICdKU1hJZGVudGlmaWVyJyk7XG4gICAgfVxuXG4gICAgLy8gUGFyc2UgbmFtZXNwYWNlZCBpZGVudGlmaWVyLlxuXG4gICAganN4X3BhcnNlTmFtZXNwYWNlZE5hbWUoKSB7XG4gICAgICBsZXQgc3RhcnRQb3MgPSB0aGlzLnN0YXJ0LCBzdGFydExvYyA9IHRoaXMuc3RhcnRMb2M7XG4gICAgICBsZXQgbmFtZSA9IHRoaXMuanN4X3BhcnNlSWRlbnRpZmllcigpO1xuICAgICAgaWYgKCFvcHRpb25zLmFsbG93TmFtZXNwYWNlcyB8fCAhdGhpcy5lYXQodHQuY29sb24pKSByZXR1cm4gbmFtZTtcbiAgICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGVBdChzdGFydFBvcywgc3RhcnRMb2MpO1xuICAgICAgbm9kZS5uYW1lc3BhY2UgPSBuYW1lO1xuICAgICAgbm9kZS5uYW1lID0gdGhpcy5qc3hfcGFyc2VJZGVudGlmaWVyKCk7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsICdKU1hOYW1lc3BhY2VkTmFtZScpO1xuICAgIH1cblxuICAgIC8vIFBhcnNlcyBlbGVtZW50IG5hbWUgaW4gYW55IGZvcm0gLSBuYW1lc3BhY2VkLCBtZW1iZXJcbiAgICAvLyBvciBzaW5nbGUgaWRlbnRpZmllci5cblxuICAgIGpzeF9wYXJzZUVsZW1lbnROYW1lKCkge1xuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdG9rLmpzeFRhZ0VuZCkgcmV0dXJuICcnO1xuICAgICAgbGV0IHN0YXJ0UG9zID0gdGhpcy5zdGFydCwgc3RhcnRMb2MgPSB0aGlzLnN0YXJ0TG9jO1xuICAgICAgbGV0IG5vZGUgPSB0aGlzLmpzeF9wYXJzZU5hbWVzcGFjZWROYW1lKCk7XG4gICAgICBpZiAodGhpcy50eXBlID09PSB0dC5kb3QgJiYgbm9kZS50eXBlID09PSAnSlNYTmFtZXNwYWNlZE5hbWUnICYmICFvcHRpb25zLmFsbG93TmFtZXNwYWNlZE9iamVjdHMpIHtcbiAgICAgICAgdGhpcy51bmV4cGVjdGVkKCk7XG4gICAgICB9XG4gICAgICB3aGlsZSAodGhpcy5lYXQodHQuZG90KSkge1xuICAgICAgICBsZXQgbmV3Tm9kZSA9IHRoaXMuc3RhcnROb2RlQXQoc3RhcnRQb3MsIHN0YXJ0TG9jKTtcbiAgICAgICAgbmV3Tm9kZS5vYmplY3QgPSBub2RlO1xuICAgICAgICBuZXdOb2RlLnByb3BlcnR5ID0gdGhpcy5qc3hfcGFyc2VJZGVudGlmaWVyKCk7XG4gICAgICAgIG5vZGUgPSB0aGlzLmZpbmlzaE5vZGUobmV3Tm9kZSwgJ0pTWE1lbWJlckV4cHJlc3Npb24nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cblxuICAgIC8vIFBhcnNlcyBhbnkgdHlwZSBvZiBKU1ggYXR0cmlidXRlIHZhbHVlLlxuXG4gICAganN4X3BhcnNlQXR0cmlidXRlVmFsdWUoKSB7XG4gICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xuICAgICAgY2FzZSB0dC5icmFjZUw6XG4gICAgICAgIGxldCBub2RlID0gdGhpcy5qc3hfcGFyc2VFeHByZXNzaW9uQ29udGFpbmVyKCk7XG4gICAgICAgIGlmIChub2RlLmV4cHJlc3Npb24udHlwZSA9PT0gJ0pTWEVtcHR5RXhwcmVzc2lvbicpXG4gICAgICAgICAgdGhpcy5yYWlzZShub2RlLnN0YXJ0LCAnSlNYIGF0dHJpYnV0ZXMgbXVzdCBvbmx5IGJlIGFzc2lnbmVkIGEgbm9uLWVtcHR5IGV4cHJlc3Npb24nKTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG5cbiAgICAgIGNhc2UgdG9rLmpzeFRhZ1N0YXJ0OlxuICAgICAgY2FzZSB0dC5zdHJpbmc6XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlRXhwckF0b20oKTtcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5yYWlzZSh0aGlzLnN0YXJ0LCAnSlNYIHZhbHVlIHNob3VsZCBiZSBlaXRoZXIgYW4gZXhwcmVzc2lvbiBvciBhIHF1b3RlZCBKU1ggdGV4dCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEpTWEVtcHR5RXhwcmVzc2lvbiBpcyB1bmlxdWUgdHlwZSBzaW5jZSBpdCBkb2Vzbid0IGFjdHVhbGx5IHBhcnNlIGFueXRoaW5nLFxuICAgIC8vIGFuZCBzbyBpdCBzaG91bGQgc3RhcnQgYXQgdGhlIGVuZCBvZiBsYXN0IHJlYWQgdG9rZW4gKGxlZnQgYnJhY2UpIGFuZCBmaW5pc2hcbiAgICAvLyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXh0IG9uZSAocmlnaHQgYnJhY2UpLlxuXG4gICAganN4X3BhcnNlRW1wdHlFeHByZXNzaW9uKCkge1xuICAgICAgbGV0IG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZUF0KHRoaXMubGFzdFRva0VuZCwgdGhpcy5sYXN0VG9rRW5kTG9jKTtcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGVBdChub2RlLCAnSlNYRW1wdHlFeHByZXNzaW9uJywgdGhpcy5zdGFydCwgdGhpcy5zdGFydExvYyk7XG4gICAgfVxuXG4gICAgLy8gUGFyc2VzIEpTWCBleHByZXNzaW9uIGVuY2xvc2VkIGludG8gY3VybHkgYnJhY2tldHMuXG5cbiAgICBqc3hfcGFyc2VFeHByZXNzaW9uQ29udGFpbmVyKCkge1xuICAgICAgbGV0IG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICBub2RlLmV4cHJlc3Npb24gPSB0aGlzLnR5cGUgPT09IHR0LmJyYWNlUlxuICAgICAgICA/IHRoaXMuanN4X3BhcnNlRW1wdHlFeHByZXNzaW9uKClcbiAgICAgICAgOiB0aGlzLnBhcnNlRXhwcmVzc2lvbigpO1xuICAgICAgdGhpcy5leHBlY3QodHQuYnJhY2VSKTtcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgJ0pTWEV4cHJlc3Npb25Db250YWluZXInKTtcbiAgICB9XG5cbiAgICAvLyBQYXJzZXMgZm9sbG93aW5nIEpTWCBhdHRyaWJ1dGUgbmFtZS12YWx1ZSBwYWlyLlxuXG4gICAganN4X3BhcnNlQXR0cmlidXRlKCkge1xuICAgICAgbGV0IG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgICAgaWYgKHRoaXMuZWF0KHR0LmJyYWNlTCkpIHtcbiAgICAgICAgdGhpcy5leHBlY3QodHQuZWxsaXBzaXMpO1xuICAgICAgICBub2RlLmFyZ3VtZW50ID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKCk7XG4gICAgICAgIHRoaXMuZXhwZWN0KHR0LmJyYWNlUik7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgJ0pTWFNwcmVhZEF0dHJpYnV0ZScpO1xuICAgICAgfVxuICAgICAgbm9kZS5uYW1lID0gdGhpcy5qc3hfcGFyc2VOYW1lc3BhY2VkTmFtZSgpO1xuICAgICAgbm9kZS52YWx1ZSA9IHRoaXMuZWF0KHR0LmVxKSA/IHRoaXMuanN4X3BhcnNlQXR0cmlidXRlVmFsdWUoKSA6IG51bGw7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsICdKU1hBdHRyaWJ1dGUnKTtcbiAgICB9XG5cbiAgICAvLyBQYXJzZXMgSlNYIG9wZW5pbmcgdGFnIHN0YXJ0aW5nIGFmdGVyICc8Jy5cblxuICAgIGpzeF9wYXJzZU9wZW5pbmdFbGVtZW50QXQoc3RhcnRQb3MsIHN0YXJ0TG9jKSB7XG4gICAgICBsZXQgbm9kZSA9IHRoaXMuc3RhcnROb2RlQXQoc3RhcnRQb3MsIHN0YXJ0TG9jKTtcbiAgICAgIG5vZGUuYXR0cmlidXRlcyA9IFtdO1xuICAgICAgbGV0IG5vZGVOYW1lID0gdGhpcy5qc3hfcGFyc2VFbGVtZW50TmFtZSgpO1xuICAgICAgaWYgKG5vZGVOYW1lKSBub2RlLm5hbWUgPSBub2RlTmFtZTtcbiAgICAgIHdoaWxlICh0aGlzLnR5cGUgIT09IHR0LnNsYXNoICYmIHRoaXMudHlwZSAhPT0gdG9rLmpzeFRhZ0VuZClcbiAgICAgICAgbm9kZS5hdHRyaWJ1dGVzLnB1c2godGhpcy5qc3hfcGFyc2VBdHRyaWJ1dGUoKSk7XG4gICAgICBub2RlLnNlbGZDbG9zaW5nID0gdGhpcy5lYXQodHQuc2xhc2gpO1xuICAgICAgdGhpcy5leHBlY3QodG9rLmpzeFRhZ0VuZCk7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIG5vZGVOYW1lID8gJ0pTWE9wZW5pbmdFbGVtZW50JyA6ICdKU1hPcGVuaW5nRnJhZ21lbnQnKTtcbiAgICB9XG5cbiAgICAvLyBQYXJzZXMgSlNYIGNsb3NpbmcgdGFnIHN0YXJ0aW5nIGFmdGVyICc8LycuXG5cbiAgICBqc3hfcGFyc2VDbG9zaW5nRWxlbWVudEF0KHN0YXJ0UG9zLCBzdGFydExvYykge1xuICAgICAgbGV0IG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyk7XG4gICAgICBsZXQgbm9kZU5hbWUgPSB0aGlzLmpzeF9wYXJzZUVsZW1lbnROYW1lKCk7XG4gICAgICBpZiAobm9kZU5hbWUpIG5vZGUubmFtZSA9IG5vZGVOYW1lO1xuICAgICAgdGhpcy5leHBlY3QodG9rLmpzeFRhZ0VuZCk7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIG5vZGVOYW1lID8gJ0pTWENsb3NpbmdFbGVtZW50JyA6ICdKU1hDbG9zaW5nRnJhZ21lbnQnKTtcbiAgICB9XG5cbiAgICAvLyBQYXJzZXMgZW50aXJlIEpTWCBlbGVtZW50LCBpbmNsdWRpbmcgaXQncyBvcGVuaW5nIHRhZ1xuICAgIC8vIChzdGFydGluZyBhZnRlciAnPCcpLCBhdHRyaWJ1dGVzLCBjb250ZW50cyBhbmQgY2xvc2luZyB0YWcuXG5cbiAgICBqc3hfcGFyc2VFbGVtZW50QXQoc3RhcnRQb3MsIHN0YXJ0TG9jKSB7XG4gICAgICBsZXQgbm9kZSA9IHRoaXMuc3RhcnROb2RlQXQoc3RhcnRQb3MsIHN0YXJ0TG9jKTtcbiAgICAgIGxldCBjaGlsZHJlbiA9IFtdO1xuICAgICAgbGV0IG9wZW5pbmdFbGVtZW50ID0gdGhpcy5qc3hfcGFyc2VPcGVuaW5nRWxlbWVudEF0KHN0YXJ0UG9zLCBzdGFydExvYyk7XG4gICAgICBsZXQgY2xvc2luZ0VsZW1lbnQgPSBudWxsO1xuXG4gICAgICBpZiAoIW9wZW5pbmdFbGVtZW50LnNlbGZDbG9zaW5nKSB7XG4gICAgICAgIGNvbnRlbnRzOiBmb3IgKDs7KSB7XG4gICAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICBjYXNlIHRvay5qc3hUYWdTdGFydDpcbiAgICAgICAgICAgIHN0YXJ0UG9zID0gdGhpcy5zdGFydDsgc3RhcnRMb2MgPSB0aGlzLnN0YXJ0TG9jO1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgICBpZiAodGhpcy5lYXQodHQuc2xhc2gpKSB7XG4gICAgICAgICAgICAgIGNsb3NpbmdFbGVtZW50ID0gdGhpcy5qc3hfcGFyc2VDbG9zaW5nRWxlbWVudEF0KHN0YXJ0UG9zLCBzdGFydExvYyk7XG4gICAgICAgICAgICAgIGJyZWFrIGNvbnRlbnRzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaCh0aGlzLmpzeF9wYXJzZUVsZW1lbnRBdChzdGFydFBvcywgc3RhcnRMb2MpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSB0b2suanN4VGV4dDpcbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2godGhpcy5wYXJzZUV4cHJBdG9tKCkpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIHR0LmJyYWNlTDpcbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2godGhpcy5qc3hfcGFyc2VFeHByZXNzaW9uQ29udGFpbmVyKCkpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhpcy51bmV4cGVjdGVkKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChnZXRRdWFsaWZpZWRKU1hOYW1lKGNsb3NpbmdFbGVtZW50Lm5hbWUpICE9PSBnZXRRdWFsaWZpZWRKU1hOYW1lKG9wZW5pbmdFbGVtZW50Lm5hbWUpKSB7XG4gICAgICAgICAgdGhpcy5yYWlzZShcbiAgICAgICAgICAgIGNsb3NpbmdFbGVtZW50LnN0YXJ0LFxuICAgICAgICAgICAgJ0V4cGVjdGVkIGNvcnJlc3BvbmRpbmcgSlNYIGNsb3NpbmcgdGFnIGZvciA8JyArIGdldFF1YWxpZmllZEpTWE5hbWUob3BlbmluZ0VsZW1lbnQubmFtZSkgKyAnPicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZXQgZnJhZ21lbnRPckVsZW1lbnQgPSBvcGVuaW5nRWxlbWVudC5uYW1lID8gJ0VsZW1lbnQnIDogJ0ZyYWdtZW50JztcblxuICAgICAgbm9kZVsnb3BlbmluZycgKyBmcmFnbWVudE9yRWxlbWVudF0gPSBvcGVuaW5nRWxlbWVudDtcbiAgICAgIG5vZGVbJ2Nsb3NpbmcnICsgZnJhZ21lbnRPckVsZW1lbnRdID0gY2xvc2luZ0VsZW1lbnQ7XG4gICAgICBub2RlLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICBpZiAodGhpcy50eXBlID09PSB0dC5yZWxhdGlvbmFsICYmIHRoaXMudmFsdWUgPT09IFwiPFwiKSB7XG4gICAgICAgIHRoaXMucmFpc2UodGhpcy5zdGFydCwgXCJBZGphY2VudCBKU1ggZWxlbWVudHMgbXVzdCBiZSB3cmFwcGVkIGluIGFuIGVuY2xvc2luZyB0YWdcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsICdKU1gnICsgZnJhZ21lbnRPckVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8vIFBhcnNlIEpTWCB0ZXh0XG5cbiAgICBqc3hfcGFyc2VUZXh0KCkge1xuICAgICAgbGV0IG5vZGUgPSB0aGlzLnBhcnNlTGl0ZXJhbCh0aGlzLnZhbHVlKTtcbiAgICAgIG5vZGUudHlwZSA9IFwiSlNYVGV4dFwiO1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgLy8gUGFyc2VzIGVudGlyZSBKU1ggZWxlbWVudCBmcm9tIGN1cnJlbnQgcG9zaXRpb24uXG5cbiAgICBqc3hfcGFyc2VFbGVtZW50KCkge1xuICAgICAgbGV0IHN0YXJ0UG9zID0gdGhpcy5zdGFydCwgc3RhcnRMb2MgPSB0aGlzLnN0YXJ0TG9jO1xuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICByZXR1cm4gdGhpcy5qc3hfcGFyc2VFbGVtZW50QXQoc3RhcnRQb3MsIHN0YXJ0TG9jKTtcbiAgICB9XG5cbiAgICBwYXJzZUV4cHJBdG9tKHJlZlNob3J0SGFuZERlZmF1bHRQb3MpIHtcbiAgICAgIGlmICh0aGlzLnR5cGUgPT09IHRvay5qc3hUZXh0KVxuICAgICAgICByZXR1cm4gdGhpcy5qc3hfcGFyc2VUZXh0KCk7XG4gICAgICBlbHNlIGlmICh0aGlzLnR5cGUgPT09IHRvay5qc3hUYWdTdGFydClcbiAgICAgICAgcmV0dXJuIHRoaXMuanN4X3BhcnNlRWxlbWVudCgpO1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gc3VwZXIucGFyc2VFeHByQXRvbShyZWZTaG9ydEhhbmREZWZhdWx0UG9zKTtcbiAgICB9XG5cbiAgICByZWFkVG9rZW4oY29kZSkge1xuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzLmN1ckNvbnRleHQoKTtcblxuICAgICAgaWYgKGNvbnRleHQgPT09IHRjX2V4cHIpIHJldHVybiB0aGlzLmpzeF9yZWFkVG9rZW4oKTtcblxuICAgICAgaWYgKGNvbnRleHQgPT09IHRjX29UYWcgfHwgY29udGV4dCA9PT0gdGNfY1RhZykge1xuICAgICAgICBpZiAoaXNJZGVudGlmaWVyU3RhcnQoY29kZSkpIHJldHVybiB0aGlzLmpzeF9yZWFkV29yZCgpO1xuXG4gICAgICAgIGlmIChjb2RlID09IDYyKSB7XG4gICAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgICAgICByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0b2suanN4VGFnRW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoY29kZSA9PT0gMzQgfHwgY29kZSA9PT0gMzkpICYmIGNvbnRleHQgPT0gdGNfb1RhZylcbiAgICAgICAgICByZXR1cm4gdGhpcy5qc3hfcmVhZFN0cmluZyhjb2RlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvZGUgPT09IDYwICYmIHRoaXMuZXhwckFsbG93ZWQgJiYgdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMSkgIT09IDMzKSB7XG4gICAgICAgICsrdGhpcy5wb3M7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHRvay5qc3hUYWdTdGFydCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VwZXIucmVhZFRva2VuKGNvZGUpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNvbnRleHQocHJldlR5cGUpIHtcbiAgICAgIGlmICh0aGlzLnR5cGUgPT0gdHQuYnJhY2VMKSB7XG4gICAgICAgIHZhciBjdXJDb250ZXh0ID0gdGhpcy5jdXJDb250ZXh0KCk7XG4gICAgICAgIGlmIChjdXJDb250ZXh0ID09IHRjX29UYWcpIHRoaXMuY29udGV4dC5wdXNoKHRva0NvbnRleHRzLmJfZXhwcik7XG4gICAgICAgIGVsc2UgaWYgKGN1ckNvbnRleHQgPT0gdGNfZXhwcikgdGhpcy5jb250ZXh0LnB1c2godG9rQ29udGV4dHMuYl90bXBsKTtcbiAgICAgICAgZWxzZSBzdXBlci51cGRhdGVDb250ZXh0KHByZXZUeXBlKTtcbiAgICAgICAgdGhpcy5leHByQWxsb3dlZCA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gdHQuc2xhc2ggJiYgcHJldlR5cGUgPT09IHRvay5qc3hUYWdTdGFydCkge1xuICAgICAgICB0aGlzLmNvbnRleHQubGVuZ3RoIC09IDI7IC8vIGRvIG5vdCBjb25zaWRlciBKU1ggZXhwciAtPiBKU1ggb3BlbiB0YWcgLT4gLi4uIGFueW1vcmVcbiAgICAgICAgdGhpcy5jb250ZXh0LnB1c2godGNfY1RhZyk7IC8vIHJlY29uc2lkZXIgYXMgY2xvc2luZyB0YWcgY29udGV4dFxuICAgICAgICB0aGlzLmV4cHJBbGxvd2VkID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc3VwZXIudXBkYXRlQ29udGV4dChwcmV2VHlwZSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIHF1b3Q6ICdcXHUwMDIyJyxcbiAgYW1wOiAnJicsXG4gIGFwb3M6ICdcXHUwMDI3JyxcbiAgbHQ6ICc8JyxcbiAgZ3Q6ICc+JyxcbiAgbmJzcDogJ1xcdTAwQTAnLFxuICBpZXhjbDogJ1xcdTAwQTEnLFxuICBjZW50OiAnXFx1MDBBMicsXG4gIHBvdW5kOiAnXFx1MDBBMycsXG4gIGN1cnJlbjogJ1xcdTAwQTQnLFxuICB5ZW46ICdcXHUwMEE1JyxcbiAgYnJ2YmFyOiAnXFx1MDBBNicsXG4gIHNlY3Q6ICdcXHUwMEE3JyxcbiAgdW1sOiAnXFx1MDBBOCcsXG4gIGNvcHk6ICdcXHUwMEE5JyxcbiAgb3JkZjogJ1xcdTAwQUEnLFxuICBsYXF1bzogJ1xcdTAwQUInLFxuICBub3Q6ICdcXHUwMEFDJyxcbiAgc2h5OiAnXFx1MDBBRCcsXG4gIHJlZzogJ1xcdTAwQUUnLFxuICBtYWNyOiAnXFx1MDBBRicsXG4gIGRlZzogJ1xcdTAwQjAnLFxuICBwbHVzbW46ICdcXHUwMEIxJyxcbiAgc3VwMjogJ1xcdTAwQjInLFxuICBzdXAzOiAnXFx1MDBCMycsXG4gIGFjdXRlOiAnXFx1MDBCNCcsXG4gIG1pY3JvOiAnXFx1MDBCNScsXG4gIHBhcmE6ICdcXHUwMEI2JyxcbiAgbWlkZG90OiAnXFx1MDBCNycsXG4gIGNlZGlsOiAnXFx1MDBCOCcsXG4gIHN1cDE6ICdcXHUwMEI5JyxcbiAgb3JkbTogJ1xcdTAwQkEnLFxuICByYXF1bzogJ1xcdTAwQkInLFxuICBmcmFjMTQ6ICdcXHUwMEJDJyxcbiAgZnJhYzEyOiAnXFx1MDBCRCcsXG4gIGZyYWMzNDogJ1xcdTAwQkUnLFxuICBpcXVlc3Q6ICdcXHUwMEJGJyxcbiAgQWdyYXZlOiAnXFx1MDBDMCcsXG4gIEFhY3V0ZTogJ1xcdTAwQzEnLFxuICBBY2lyYzogJ1xcdTAwQzInLFxuICBBdGlsZGU6ICdcXHUwMEMzJyxcbiAgQXVtbDogJ1xcdTAwQzQnLFxuICBBcmluZzogJ1xcdTAwQzUnLFxuICBBRWxpZzogJ1xcdTAwQzYnLFxuICBDY2VkaWw6ICdcXHUwMEM3JyxcbiAgRWdyYXZlOiAnXFx1MDBDOCcsXG4gIEVhY3V0ZTogJ1xcdTAwQzknLFxuICBFY2lyYzogJ1xcdTAwQ0EnLFxuICBFdW1sOiAnXFx1MDBDQicsXG4gIElncmF2ZTogJ1xcdTAwQ0MnLFxuICBJYWN1dGU6ICdcXHUwMENEJyxcbiAgSWNpcmM6ICdcXHUwMENFJyxcbiAgSXVtbDogJ1xcdTAwQ0YnLFxuICBFVEg6ICdcXHUwMEQwJyxcbiAgTnRpbGRlOiAnXFx1MDBEMScsXG4gIE9ncmF2ZTogJ1xcdTAwRDInLFxuICBPYWN1dGU6ICdcXHUwMEQzJyxcbiAgT2NpcmM6ICdcXHUwMEQ0JyxcbiAgT3RpbGRlOiAnXFx1MDBENScsXG4gIE91bWw6ICdcXHUwMEQ2JyxcbiAgdGltZXM6ICdcXHUwMEQ3JyxcbiAgT3NsYXNoOiAnXFx1MDBEOCcsXG4gIFVncmF2ZTogJ1xcdTAwRDknLFxuICBVYWN1dGU6ICdcXHUwMERBJyxcbiAgVWNpcmM6ICdcXHUwMERCJyxcbiAgVXVtbDogJ1xcdTAwREMnLFxuICBZYWN1dGU6ICdcXHUwMEREJyxcbiAgVEhPUk46ICdcXHUwMERFJyxcbiAgc3psaWc6ICdcXHUwMERGJyxcbiAgYWdyYXZlOiAnXFx1MDBFMCcsXG4gIGFhY3V0ZTogJ1xcdTAwRTEnLFxuICBhY2lyYzogJ1xcdTAwRTInLFxuICBhdGlsZGU6ICdcXHUwMEUzJyxcbiAgYXVtbDogJ1xcdTAwRTQnLFxuICBhcmluZzogJ1xcdTAwRTUnLFxuICBhZWxpZzogJ1xcdTAwRTYnLFxuICBjY2VkaWw6ICdcXHUwMEU3JyxcbiAgZWdyYXZlOiAnXFx1MDBFOCcsXG4gIGVhY3V0ZTogJ1xcdTAwRTknLFxuICBlY2lyYzogJ1xcdTAwRUEnLFxuICBldW1sOiAnXFx1MDBFQicsXG4gIGlncmF2ZTogJ1xcdTAwRUMnLFxuICBpYWN1dGU6ICdcXHUwMEVEJyxcbiAgaWNpcmM6ICdcXHUwMEVFJyxcbiAgaXVtbDogJ1xcdTAwRUYnLFxuICBldGg6ICdcXHUwMEYwJyxcbiAgbnRpbGRlOiAnXFx1MDBGMScsXG4gIG9ncmF2ZTogJ1xcdTAwRjInLFxuICBvYWN1dGU6ICdcXHUwMEYzJyxcbiAgb2NpcmM6ICdcXHUwMEY0JyxcbiAgb3RpbGRlOiAnXFx1MDBGNScsXG4gIG91bWw6ICdcXHUwMEY2JyxcbiAgZGl2aWRlOiAnXFx1MDBGNycsXG4gIG9zbGFzaDogJ1xcdTAwRjgnLFxuICB1Z3JhdmU6ICdcXHUwMEY5JyxcbiAgdWFjdXRlOiAnXFx1MDBGQScsXG4gIHVjaXJjOiAnXFx1MDBGQicsXG4gIHV1bWw6ICdcXHUwMEZDJyxcbiAgeWFjdXRlOiAnXFx1MDBGRCcsXG4gIHRob3JuOiAnXFx1MDBGRScsXG4gIHl1bWw6ICdcXHUwMEZGJyxcbiAgT0VsaWc6ICdcXHUwMTUyJyxcbiAgb2VsaWc6ICdcXHUwMTUzJyxcbiAgU2Nhcm9uOiAnXFx1MDE2MCcsXG4gIHNjYXJvbjogJ1xcdTAxNjEnLFxuICBZdW1sOiAnXFx1MDE3OCcsXG4gIGZub2Y6ICdcXHUwMTkyJyxcbiAgY2lyYzogJ1xcdTAyQzYnLFxuICB0aWxkZTogJ1xcdTAyREMnLFxuICBBbHBoYTogJ1xcdTAzOTEnLFxuICBCZXRhOiAnXFx1MDM5MicsXG4gIEdhbW1hOiAnXFx1MDM5MycsXG4gIERlbHRhOiAnXFx1MDM5NCcsXG4gIEVwc2lsb246ICdcXHUwMzk1JyxcbiAgWmV0YTogJ1xcdTAzOTYnLFxuICBFdGE6ICdcXHUwMzk3JyxcbiAgVGhldGE6ICdcXHUwMzk4JyxcbiAgSW90YTogJ1xcdTAzOTknLFxuICBLYXBwYTogJ1xcdTAzOUEnLFxuICBMYW1iZGE6ICdcXHUwMzlCJyxcbiAgTXU6ICdcXHUwMzlDJyxcbiAgTnU6ICdcXHUwMzlEJyxcbiAgWGk6ICdcXHUwMzlFJyxcbiAgT21pY3JvbjogJ1xcdTAzOUYnLFxuICBQaTogJ1xcdTAzQTAnLFxuICBSaG86ICdcXHUwM0ExJyxcbiAgU2lnbWE6ICdcXHUwM0EzJyxcbiAgVGF1OiAnXFx1MDNBNCcsXG4gIFVwc2lsb246ICdcXHUwM0E1JyxcbiAgUGhpOiAnXFx1MDNBNicsXG4gIENoaTogJ1xcdTAzQTcnLFxuICBQc2k6ICdcXHUwM0E4JyxcbiAgT21lZ2E6ICdcXHUwM0E5JyxcbiAgYWxwaGE6ICdcXHUwM0IxJyxcbiAgYmV0YTogJ1xcdTAzQjInLFxuICBnYW1tYTogJ1xcdTAzQjMnLFxuICBkZWx0YTogJ1xcdTAzQjQnLFxuICBlcHNpbG9uOiAnXFx1MDNCNScsXG4gIHpldGE6ICdcXHUwM0I2JyxcbiAgZXRhOiAnXFx1MDNCNycsXG4gIHRoZXRhOiAnXFx1MDNCOCcsXG4gIGlvdGE6ICdcXHUwM0I5JyxcbiAga2FwcGE6ICdcXHUwM0JBJyxcbiAgbGFtYmRhOiAnXFx1MDNCQicsXG4gIG11OiAnXFx1MDNCQycsXG4gIG51OiAnXFx1MDNCRCcsXG4gIHhpOiAnXFx1MDNCRScsXG4gIG9taWNyb246ICdcXHUwM0JGJyxcbiAgcGk6ICdcXHUwM0MwJyxcbiAgcmhvOiAnXFx1MDNDMScsXG4gIHNpZ21hZjogJ1xcdTAzQzInLFxuICBzaWdtYTogJ1xcdTAzQzMnLFxuICB0YXU6ICdcXHUwM0M0JyxcbiAgdXBzaWxvbjogJ1xcdTAzQzUnLFxuICBwaGk6ICdcXHUwM0M2JyxcbiAgY2hpOiAnXFx1MDNDNycsXG4gIHBzaTogJ1xcdTAzQzgnLFxuICBvbWVnYTogJ1xcdTAzQzknLFxuICB0aGV0YXN5bTogJ1xcdTAzRDEnLFxuICB1cHNpaDogJ1xcdTAzRDInLFxuICBwaXY6ICdcXHUwM0Q2JyxcbiAgZW5zcDogJ1xcdTIwMDInLFxuICBlbXNwOiAnXFx1MjAwMycsXG4gIHRoaW5zcDogJ1xcdTIwMDknLFxuICB6d25qOiAnXFx1MjAwQycsXG4gIHp3ajogJ1xcdTIwMEQnLFxuICBscm06ICdcXHUyMDBFJyxcbiAgcmxtOiAnXFx1MjAwRicsXG4gIG5kYXNoOiAnXFx1MjAxMycsXG4gIG1kYXNoOiAnXFx1MjAxNCcsXG4gIGxzcXVvOiAnXFx1MjAxOCcsXG4gIHJzcXVvOiAnXFx1MjAxOScsXG4gIHNicXVvOiAnXFx1MjAxQScsXG4gIGxkcXVvOiAnXFx1MjAxQycsXG4gIHJkcXVvOiAnXFx1MjAxRCcsXG4gIGJkcXVvOiAnXFx1MjAxRScsXG4gIGRhZ2dlcjogJ1xcdTIwMjAnLFxuICBEYWdnZXI6ICdcXHUyMDIxJyxcbiAgYnVsbDogJ1xcdTIwMjInLFxuICBoZWxsaXA6ICdcXHUyMDI2JyxcbiAgcGVybWlsOiAnXFx1MjAzMCcsXG4gIHByaW1lOiAnXFx1MjAzMicsXG4gIFByaW1lOiAnXFx1MjAzMycsXG4gIGxzYXF1bzogJ1xcdTIwMzknLFxuICByc2FxdW86ICdcXHUyMDNBJyxcbiAgb2xpbmU6ICdcXHUyMDNFJyxcbiAgZnJhc2w6ICdcXHUyMDQ0JyxcbiAgZXVybzogJ1xcdTIwQUMnLFxuICBpbWFnZTogJ1xcdTIxMTEnLFxuICB3ZWllcnA6ICdcXHUyMTE4JyxcbiAgcmVhbDogJ1xcdTIxMUMnLFxuICB0cmFkZTogJ1xcdTIxMjInLFxuICBhbGVmc3ltOiAnXFx1MjEzNScsXG4gIGxhcnI6ICdcXHUyMTkwJyxcbiAgdWFycjogJ1xcdTIxOTEnLFxuICByYXJyOiAnXFx1MjE5MicsXG4gIGRhcnI6ICdcXHUyMTkzJyxcbiAgaGFycjogJ1xcdTIxOTQnLFxuICBjcmFycjogJ1xcdTIxQjUnLFxuICBsQXJyOiAnXFx1MjFEMCcsXG4gIHVBcnI6ICdcXHUyMUQxJyxcbiAgckFycjogJ1xcdTIxRDInLFxuICBkQXJyOiAnXFx1MjFEMycsXG4gIGhBcnI6ICdcXHUyMUQ0JyxcbiAgZm9yYWxsOiAnXFx1MjIwMCcsXG4gIHBhcnQ6ICdcXHUyMjAyJyxcbiAgZXhpc3Q6ICdcXHUyMjAzJyxcbiAgZW1wdHk6ICdcXHUyMjA1JyxcbiAgbmFibGE6ICdcXHUyMjA3JyxcbiAgaXNpbjogJ1xcdTIyMDgnLFxuICBub3RpbjogJ1xcdTIyMDknLFxuICBuaTogJ1xcdTIyMEInLFxuICBwcm9kOiAnXFx1MjIwRicsXG4gIHN1bTogJ1xcdTIyMTEnLFxuICBtaW51czogJ1xcdTIyMTInLFxuICBsb3dhc3Q6ICdcXHUyMjE3JyxcbiAgcmFkaWM6ICdcXHUyMjFBJyxcbiAgcHJvcDogJ1xcdTIyMUQnLFxuICBpbmZpbjogJ1xcdTIyMUUnLFxuICBhbmc6ICdcXHUyMjIwJyxcbiAgYW5kOiAnXFx1MjIyNycsXG4gIG9yOiAnXFx1MjIyOCcsXG4gIGNhcDogJ1xcdTIyMjknLFxuICBjdXA6ICdcXHUyMjJBJyxcbiAgJ2ludCc6ICdcXHUyMjJCJyxcbiAgdGhlcmU0OiAnXFx1MjIzNCcsXG4gIHNpbTogJ1xcdTIyM0MnLFxuICBjb25nOiAnXFx1MjI0NScsXG4gIGFzeW1wOiAnXFx1MjI0OCcsXG4gIG5lOiAnXFx1MjI2MCcsXG4gIGVxdWl2OiAnXFx1MjI2MScsXG4gIGxlOiAnXFx1MjI2NCcsXG4gIGdlOiAnXFx1MjI2NScsXG4gIHN1YjogJ1xcdTIyODInLFxuICBzdXA6ICdcXHUyMjgzJyxcbiAgbnN1YjogJ1xcdTIyODQnLFxuICBzdWJlOiAnXFx1MjI4NicsXG4gIHN1cGU6ICdcXHUyMjg3JyxcbiAgb3BsdXM6ICdcXHUyMjk1JyxcbiAgb3RpbWVzOiAnXFx1MjI5NycsXG4gIHBlcnA6ICdcXHUyMkE1JyxcbiAgc2RvdDogJ1xcdTIyQzUnLFxuICBsY2VpbDogJ1xcdTIzMDgnLFxuICByY2VpbDogJ1xcdTIzMDknLFxuICBsZmxvb3I6ICdcXHUyMzBBJyxcbiAgcmZsb29yOiAnXFx1MjMwQicsXG4gIGxhbmc6ICdcXHUyMzI5JyxcbiAgcmFuZzogJ1xcdTIzMkEnLFxuICBsb3o6ICdcXHUyNUNBJyxcbiAgc3BhZGVzOiAnXFx1MjY2MCcsXG4gIGNsdWJzOiAnXFx1MjY2MycsXG4gIGhlYXJ0czogJ1xcdTI2NjUnLFxuICBkaWFtczogJ1xcdTI2NjYnXG59O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZ2xvYmFsID0gdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsVGhpcyA6IGdsb2JhbCB8fCBzZWxmLCBmYWN0b3J5KGdsb2JhbC5hY29ybiA9IHt9KSk7XG59KSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIFRoaXMgZmlsZSB3YXMgZ2VuZXJhdGVkLiBEbyBub3QgbW9kaWZ5IG1hbnVhbGx5IVxuICB2YXIgYXN0cmFsSWRlbnRpZmllckNvZGVzID0gWzUwOSwgMCwgMjI3LCAwLCAxNTAsIDQsIDI5NCwgOSwgMTM2OCwgMiwgMiwgMSwgNiwgMywgNDEsIDIsIDUsIDAsIDE2NiwgMSwgNTc0LCAzLCA5LCA5LCAzNzAsIDEsIDgxLCAyLCA3MSwgMTAsIDUwLCAzLCAxMjMsIDIsIDU0LCAxNCwgMzIsIDEwLCAzLCAxLCAxMSwgMywgNDYsIDEwLCA4LCAwLCA0NiwgOSwgNywgMiwgMzcsIDEzLCAyLCA5LCA2LCAxLCA0NSwgMCwgMTMsIDIsIDQ5LCAxMywgOSwgMywgMiwgMTEsIDgzLCAxMSwgNywgMCwgMywgMCwgMTU4LCAxMSwgNiwgOSwgNywgMywgNTYsIDEsIDIsIDYsIDMsIDEsIDMsIDIsIDEwLCAwLCAxMSwgMSwgMywgNiwgNCwgNCwgMTkzLCAxNywgMTAsIDksIDUsIDAsIDgyLCAxOSwgMTMsIDksIDIxNCwgNiwgMywgOCwgMjgsIDEsIDgzLCAxNiwgMTYsIDksIDgyLCAxMiwgOSwgOSwgODQsIDE0LCA1LCA5LCAyNDMsIDE0LCAxNjYsIDksIDcxLCA1LCAyLCAxLCAzLCAzLCAyLCAwLCAyLCAxLCAxMywgOSwgMTIwLCA2LCAzLCA2LCA0LCAwLCAyOSwgOSwgNDEsIDYsIDIsIDMsIDksIDAsIDEwLCAxMCwgNDcsIDE1LCA0MDYsIDcsIDIsIDcsIDE3LCA5LCA1NywgMjEsIDIsIDEzLCAxMjMsIDUsIDQsIDAsIDIsIDEsIDIsIDYsIDIsIDAsIDksIDksIDQ5LCA0LCAyLCAxLCAyLCA0LCA5LCA5LCAzMzAsIDMsIDEwLCAxLCAyLCAwLCA0OSwgNiwgNCwgNCwgMTQsIDksIDUzNTEsIDAsIDcsIDE0LCAxMzgzNSwgOSwgODcsIDksIDM5LCA0LCA2MCwgNiwgMjYsIDksIDEwMTQsIDAsIDIsIDU0LCA4LCAzLCA4MiwgMCwgMTIsIDEsIDE5NjI4LCAxLCA0NzA2LCA0NSwgMywgMjIsIDU0MywgNCwgNCwgNSwgOSwgNywgMywgNiwgMzEsIDMsIDE0OSwgMiwgMTQxOCwgNDksIDUxMywgNTQsIDUsIDQ5LCA5LCAwLCAxNSwgMCwgMjMsIDQsIDIsIDE0LCAxMzYxLCA2LCAyLCAxNiwgMywgNiwgMiwgMSwgMiwgNCwgMTAxLCAwLCAxNjEsIDYsIDEwLCA5LCAzNTcsIDAsIDYyLCAxMywgNDk5LCAxMywgOTgzLCA2LCAxMTAsIDYsIDYsIDksIDQ3NTksIDksIDc4NzcxOSwgMjM5XTtcblxuICAvLyBUaGlzIGZpbGUgd2FzIGdlbmVyYXRlZC4gRG8gbm90IG1vZGlmeSBtYW51YWxseSFcbiAgdmFyIGFzdHJhbElkZW50aWZpZXJTdGFydENvZGVzID0gWzAsIDExLCAyLCAyNSwgMiwgMTgsIDIsIDEsIDIsIDE0LCAzLCAxMywgMzUsIDEyMiwgNzAsIDUyLCAyNjgsIDI4LCA0LCA0OCwgNDgsIDMxLCAxNCwgMjksIDYsIDM3LCAxMSwgMjksIDMsIDM1LCA1LCA3LCAyLCA0LCA0MywgMTU3LCAxOSwgMzUsIDUsIDM1LCA1LCAzOSwgOSwgNTEsIDEzLCAxMCwgMiwgMTQsIDIsIDYsIDIsIDEsIDIsIDEwLCAyLCAxNCwgMiwgNiwgMiwgMSwgNjgsIDMxMCwgMTAsIDIxLCAxMSwgNywgMjUsIDUsIDIsIDQxLCAyLCA4LCA3MCwgNSwgMywgMCwgMiwgNDMsIDIsIDEsIDQsIDAsIDMsIDIyLCAxMSwgMjIsIDEwLCAzMCwgNjYsIDE4LCAyLCAxLCAxMSwgMjEsIDExLCAyNSwgNzEsIDU1LCA3LCAxLCA2NSwgMCwgMTYsIDMsIDIsIDIsIDIsIDI4LCA0MywgMjgsIDQsIDI4LCAzNiwgNywgMiwgMjcsIDI4LCA1MywgMTEsIDIxLCAxMSwgMTgsIDE0LCAxNywgMTExLCA3MiwgNTYsIDUwLCAxNCwgNTAsIDE0LCAzNSwgMzQ5LCA0MSwgNywgMSwgNzksIDI4LCAxMSwgMCwgOSwgMjEsIDQzLCAxNywgNDcsIDIwLCAyOCwgMjIsIDEzLCA1MiwgNTgsIDEsIDMsIDAsIDE0LCA0NCwgMzMsIDI0LCAyNywgMzUsIDMwLCAwLCAzLCAwLCA5LCAzNCwgNCwgMCwgMTMsIDQ3LCAxNSwgMywgMjIsIDAsIDIsIDAsIDM2LCAxNywgMiwgMjQsIDIwLCAxLCA2NCwgNiwgMiwgMCwgMiwgMywgMiwgMTQsIDIsIDksIDgsIDQ2LCAzOSwgNywgMywgMSwgMywgMjEsIDIsIDYsIDIsIDEsIDIsIDQsIDQsIDAsIDE5LCAwLCAxMywgNCwgMTU5LCA1MiwgMTksIDMsIDIxLCAyLCAzMSwgNDcsIDIxLCAxLCAyLCAwLCAxODUsIDQ2LCA0MiwgMywgMzcsIDQ3LCAyMSwgMCwgNjAsIDQyLCAxNCwgMCwgNzIsIDI2LCAzOCwgNiwgMTg2LCA0MywgMTE3LCA2MywgMzIsIDcsIDMsIDAsIDMsIDcsIDIsIDEsIDIsIDIzLCAxNiwgMCwgMiwgMCwgOTUsIDcsIDMsIDM4LCAxNywgMCwgMiwgMCwgMjksIDAsIDExLCAzOSwgOCwgMCwgMjIsIDAsIDEyLCA0NSwgMjAsIDAsIDE5LCA3MiwgMjY0LCA4LCAyLCAzNiwgMTgsIDAsIDUwLCAyOSwgMTEzLCA2LCAyLCAxLCAyLCAzNywgMjIsIDAsIDI2LCA1LCAyLCAxLCAyLCAzMSwgMTUsIDAsIDMyOCwgMTgsIDE2LCAwLCAyLCAxMiwgMiwgMzMsIDEyNSwgMCwgODAsIDkyMSwgMTAzLCAxMTAsIDE4LCAxOTUsIDI2MzcsIDk2LCAxNiwgMTA3MSwgMTgsIDUsIDQwMjYsIDU4MiwgODYzNCwgNTY4LCA4LCAzMCwgMTgsIDc4LCAxOCwgMjksIDE5LCA0NywgMTcsIDMsIDMyLCAyMCwgNiwgMTgsIDY4OSwgNjMsIDEyOSwgNzQsIDYsIDAsIDY3LCAxMiwgNjUsIDEsIDIsIDAsIDI5LCA2MTM1LCA5LCAxMjM3LCA0MywgOCwgODkzNiwgMywgMiwgNiwgMiwgMSwgMiwgMjkwLCAxNiwgMCwgMzAsIDIsIDMsIDAsIDE1LCAzLCA5LCAzOTUsIDIzMDksIDEwNiwgNiwgMTIsIDQsIDgsIDgsIDksIDU5OTEsIDg0LCAyLCA3MCwgMiwgMSwgMywgMCwgMywgMSwgMywgMywgMiwgMTEsIDIsIDAsIDIsIDYsIDIsIDY0LCAyLCAzLCAzLCA3LCAyLCA2LCAyLCAyNywgMiwgMywgMiwgNCwgMiwgMCwgNCwgNiwgMiwgMzM5LCAzLCAyNCwgMiwgMjQsIDIsIDMwLCAyLCAyNCwgMiwgMzAsIDIsIDI0LCAyLCAzMCwgMiwgMjQsIDIsIDMwLCAyLCAyNCwgMiwgNywgMTg0NSwgMzAsIDcsIDUsIDI2MiwgNjEsIDE0NywgNDQsIDExLCA2LCAxNywgMCwgMzIyLCAyOSwgMTksIDQzLCA0ODUsIDI3LCA3NTcsIDYsIDIsIDMsIDIsIDEsIDIsIDE0LCAyLCAxOTYsIDYwLCA2NywgOCwgMCwgMTIwNSwgMywgMiwgMjYsIDIsIDEsIDIsIDAsIDMsIDAsIDIsIDksIDIsIDMsIDIsIDAsIDIsIDAsIDcsIDAsIDUsIDAsIDIsIDAsIDIsIDAsIDIsIDIsIDIsIDEsIDIsIDAsIDMsIDAsIDIsIDAsIDIsIDAsIDIsIDAsIDIsIDAsIDIsIDEsIDIsIDAsIDMsIDMsIDIsIDYsIDIsIDMsIDIsIDMsIDIsIDAsIDIsIDksIDIsIDE2LCA2LCAyLCAyLCA0LCAyLCAxNiwgNDQyMSwgNDI3MTksIDMzLCA0MTUzLCA3LCAyMjEsIDMsIDU3NjEsIDE1LCA3NDcyLCAzMTA0LCA1NDEsIDE1MDcsIDQ5MzgsIDYsIDQxOTFdO1xuXG4gIC8vIFRoaXMgZmlsZSB3YXMgZ2VuZXJhdGVkLiBEbyBub3QgbW9kaWZ5IG1hbnVhbGx5IVxuICB2YXIgbm9uQVNDSUlpZGVudGlmaWVyQ2hhcnMgPSBcIlxcdTIwMGNcXHUyMDBkXFx4YjdcXHUwMzAwLVxcdTAzNmZcXHUwMzg3XFx1MDQ4My1cXHUwNDg3XFx1MDU5MS1cXHUwNWJkXFx1MDViZlxcdTA1YzFcXHUwNWMyXFx1MDVjNFxcdTA1YzVcXHUwNWM3XFx1MDYxMC1cXHUwNjFhXFx1MDY0Yi1cXHUwNjY5XFx1MDY3MFxcdTA2ZDYtXFx1MDZkY1xcdTA2ZGYtXFx1MDZlNFxcdTA2ZTdcXHUwNmU4XFx1MDZlYS1cXHUwNmVkXFx1MDZmMC1cXHUwNmY5XFx1MDcxMVxcdTA3MzAtXFx1MDc0YVxcdTA3YTYtXFx1MDdiMFxcdTA3YzAtXFx1MDdjOVxcdTA3ZWItXFx1MDdmM1xcdTA3ZmRcXHUwODE2LVxcdTA4MTlcXHUwODFiLVxcdTA4MjNcXHUwODI1LVxcdTA4MjdcXHUwODI5LVxcdTA4MmRcXHUwODU5LVxcdTA4NWJcXHUwODk4LVxcdTA4OWZcXHUwOGNhLVxcdTA4ZTFcXHUwOGUzLVxcdTA5MDNcXHUwOTNhLVxcdTA5M2NcXHUwOTNlLVxcdTA5NGZcXHUwOTUxLVxcdTA5NTdcXHUwOTYyXFx1MDk2M1xcdTA5NjYtXFx1MDk2ZlxcdTA5ODEtXFx1MDk4M1xcdTA5YmNcXHUwOWJlLVxcdTA5YzRcXHUwOWM3XFx1MDljOFxcdTA5Y2ItXFx1MDljZFxcdTA5ZDdcXHUwOWUyXFx1MDllM1xcdTA5ZTYtXFx1MDllZlxcdTA5ZmVcXHUwYTAxLVxcdTBhMDNcXHUwYTNjXFx1MGEzZS1cXHUwYTQyXFx1MGE0N1xcdTBhNDhcXHUwYTRiLVxcdTBhNGRcXHUwYTUxXFx1MGE2Ni1cXHUwYTcxXFx1MGE3NVxcdTBhODEtXFx1MGE4M1xcdTBhYmNcXHUwYWJlLVxcdTBhYzVcXHUwYWM3LVxcdTBhYzlcXHUwYWNiLVxcdTBhY2RcXHUwYWUyXFx1MGFlM1xcdTBhZTYtXFx1MGFlZlxcdTBhZmEtXFx1MGFmZlxcdTBiMDEtXFx1MGIwM1xcdTBiM2NcXHUwYjNlLVxcdTBiNDRcXHUwYjQ3XFx1MGI0OFxcdTBiNGItXFx1MGI0ZFxcdTBiNTUtXFx1MGI1N1xcdTBiNjJcXHUwYjYzXFx1MGI2Ni1cXHUwYjZmXFx1MGI4MlxcdTBiYmUtXFx1MGJjMlxcdTBiYzYtXFx1MGJjOFxcdTBiY2EtXFx1MGJjZFxcdTBiZDdcXHUwYmU2LVxcdTBiZWZcXHUwYzAwLVxcdTBjMDRcXHUwYzNjXFx1MGMzZS1cXHUwYzQ0XFx1MGM0Ni1cXHUwYzQ4XFx1MGM0YS1cXHUwYzRkXFx1MGM1NVxcdTBjNTZcXHUwYzYyXFx1MGM2M1xcdTBjNjYtXFx1MGM2ZlxcdTBjODEtXFx1MGM4M1xcdTBjYmNcXHUwY2JlLVxcdTBjYzRcXHUwY2M2LVxcdTBjYzhcXHUwY2NhLVxcdTBjY2RcXHUwY2Q1XFx1MGNkNlxcdTBjZTJcXHUwY2UzXFx1MGNlNi1cXHUwY2VmXFx1MGNmM1xcdTBkMDAtXFx1MGQwM1xcdTBkM2JcXHUwZDNjXFx1MGQzZS1cXHUwZDQ0XFx1MGQ0Ni1cXHUwZDQ4XFx1MGQ0YS1cXHUwZDRkXFx1MGQ1N1xcdTBkNjJcXHUwZDYzXFx1MGQ2Ni1cXHUwZDZmXFx1MGQ4MS1cXHUwZDgzXFx1MGRjYVxcdTBkY2YtXFx1MGRkNFxcdTBkZDZcXHUwZGQ4LVxcdTBkZGZcXHUwZGU2LVxcdTBkZWZcXHUwZGYyXFx1MGRmM1xcdTBlMzFcXHUwZTM0LVxcdTBlM2FcXHUwZTQ3LVxcdTBlNGVcXHUwZTUwLVxcdTBlNTlcXHUwZWIxXFx1MGViNC1cXHUwZWJjXFx1MGVjOC1cXHUwZWNlXFx1MGVkMC1cXHUwZWQ5XFx1MGYxOFxcdTBmMTlcXHUwZjIwLVxcdTBmMjlcXHUwZjM1XFx1MGYzN1xcdTBmMzlcXHUwZjNlXFx1MGYzZlxcdTBmNzEtXFx1MGY4NFxcdTBmODZcXHUwZjg3XFx1MGY4ZC1cXHUwZjk3XFx1MGY5OS1cXHUwZmJjXFx1MGZjNlxcdTEwMmItXFx1MTAzZVxcdTEwNDAtXFx1MTA0OVxcdTEwNTYtXFx1MTA1OVxcdTEwNWUtXFx1MTA2MFxcdTEwNjItXFx1MTA2NFxcdTEwNjctXFx1MTA2ZFxcdTEwNzEtXFx1MTA3NFxcdTEwODItXFx1MTA4ZFxcdTEwOGYtXFx1MTA5ZFxcdTEzNWQtXFx1MTM1ZlxcdTEzNjktXFx1MTM3MVxcdTE3MTItXFx1MTcxNVxcdTE3MzItXFx1MTczNFxcdTE3NTJcXHUxNzUzXFx1MTc3MlxcdTE3NzNcXHUxN2I0LVxcdTE3ZDNcXHUxN2RkXFx1MTdlMC1cXHUxN2U5XFx1MTgwYi1cXHUxODBkXFx1MTgwZi1cXHUxODE5XFx1MThhOVxcdTE5MjAtXFx1MTkyYlxcdTE5MzAtXFx1MTkzYlxcdTE5NDYtXFx1MTk0ZlxcdTE5ZDAtXFx1MTlkYVxcdTFhMTctXFx1MWExYlxcdTFhNTUtXFx1MWE1ZVxcdTFhNjAtXFx1MWE3Y1xcdTFhN2YtXFx1MWE4OVxcdTFhOTAtXFx1MWE5OVxcdTFhYjAtXFx1MWFiZFxcdTFhYmYtXFx1MWFjZVxcdTFiMDAtXFx1MWIwNFxcdTFiMzQtXFx1MWI0NFxcdTFiNTAtXFx1MWI1OVxcdTFiNmItXFx1MWI3M1xcdTFiODAtXFx1MWI4MlxcdTFiYTEtXFx1MWJhZFxcdTFiYjAtXFx1MWJiOVxcdTFiZTYtXFx1MWJmM1xcdTFjMjQtXFx1MWMzN1xcdTFjNDAtXFx1MWM0OVxcdTFjNTAtXFx1MWM1OVxcdTFjZDAtXFx1MWNkMlxcdTFjZDQtXFx1MWNlOFxcdTFjZWRcXHUxY2Y0XFx1MWNmNy1cXHUxY2Y5XFx1MWRjMC1cXHUxZGZmXFx1MjAzZlxcdTIwNDBcXHUyMDU0XFx1MjBkMC1cXHUyMGRjXFx1MjBlMVxcdTIwZTUtXFx1MjBmMFxcdTJjZWYtXFx1MmNmMVxcdTJkN2ZcXHUyZGUwLVxcdTJkZmZcXHUzMDJhLVxcdTMwMmZcXHUzMDk5XFx1MzA5YVxcdWE2MjAtXFx1YTYyOVxcdWE2NmZcXHVhNjc0LVxcdWE2N2RcXHVhNjllXFx1YTY5ZlxcdWE2ZjBcXHVhNmYxXFx1YTgwMlxcdWE4MDZcXHVhODBiXFx1YTgyMy1cXHVhODI3XFx1YTgyY1xcdWE4ODBcXHVhODgxXFx1YThiNC1cXHVhOGM1XFx1YThkMC1cXHVhOGQ5XFx1YThlMC1cXHVhOGYxXFx1YThmZi1cXHVhOTA5XFx1YTkyNi1cXHVhOTJkXFx1YTk0Ny1cXHVhOTUzXFx1YTk4MC1cXHVhOTgzXFx1YTliMy1cXHVhOWMwXFx1YTlkMC1cXHVhOWQ5XFx1YTllNVxcdWE5ZjAtXFx1YTlmOVxcdWFhMjktXFx1YWEzNlxcdWFhNDNcXHVhYTRjXFx1YWE0ZFxcdWFhNTAtXFx1YWE1OVxcdWFhN2ItXFx1YWE3ZFxcdWFhYjBcXHVhYWIyLVxcdWFhYjRcXHVhYWI3XFx1YWFiOFxcdWFhYmVcXHVhYWJmXFx1YWFjMVxcdWFhZWItXFx1YWFlZlxcdWFhZjVcXHVhYWY2XFx1YWJlMy1cXHVhYmVhXFx1YWJlY1xcdWFiZWRcXHVhYmYwLVxcdWFiZjlcXHVmYjFlXFx1ZmUwMC1cXHVmZTBmXFx1ZmUyMC1cXHVmZTJmXFx1ZmUzM1xcdWZlMzRcXHVmZTRkLVxcdWZlNGZcXHVmZjEwLVxcdWZmMTlcXHVmZjNmXCI7XG5cbiAgLy8gVGhpcyBmaWxlIHdhcyBnZW5lcmF0ZWQuIERvIG5vdCBtb2RpZnkgbWFudWFsbHkhXG4gIHZhciBub25BU0NJSWlkZW50aWZpZXJTdGFydENoYXJzID0gXCJcXHhhYVxceGI1XFx4YmFcXHhjMC1cXHhkNlxceGQ4LVxceGY2XFx4ZjgtXFx1MDJjMVxcdTAyYzYtXFx1MDJkMVxcdTAyZTAtXFx1MDJlNFxcdTAyZWNcXHUwMmVlXFx1MDM3MC1cXHUwMzc0XFx1MDM3NlxcdTAzNzdcXHUwMzdhLVxcdTAzN2RcXHUwMzdmXFx1MDM4NlxcdTAzODgtXFx1MDM4YVxcdTAzOGNcXHUwMzhlLVxcdTAzYTFcXHUwM2EzLVxcdTAzZjVcXHUwM2Y3LVxcdTA0ODFcXHUwNDhhLVxcdTA1MmZcXHUwNTMxLVxcdTA1NTZcXHUwNTU5XFx1MDU2MC1cXHUwNTg4XFx1MDVkMC1cXHUwNWVhXFx1MDVlZi1cXHUwNWYyXFx1MDYyMC1cXHUwNjRhXFx1MDY2ZVxcdTA2NmZcXHUwNjcxLVxcdTA2ZDNcXHUwNmQ1XFx1MDZlNVxcdTA2ZTZcXHUwNmVlXFx1MDZlZlxcdTA2ZmEtXFx1MDZmY1xcdTA2ZmZcXHUwNzEwXFx1MDcxMi1cXHUwNzJmXFx1MDc0ZC1cXHUwN2E1XFx1MDdiMVxcdTA3Y2EtXFx1MDdlYVxcdTA3ZjRcXHUwN2Y1XFx1MDdmYVxcdTA4MDAtXFx1MDgxNVxcdTA4MWFcXHUwODI0XFx1MDgyOFxcdTA4NDAtXFx1MDg1OFxcdTA4NjAtXFx1MDg2YVxcdTA4NzAtXFx1MDg4N1xcdTA4ODktXFx1MDg4ZVxcdTA4YTAtXFx1MDhjOVxcdTA5MDQtXFx1MDkzOVxcdTA5M2RcXHUwOTUwXFx1MDk1OC1cXHUwOTYxXFx1MDk3MS1cXHUwOTgwXFx1MDk4NS1cXHUwOThjXFx1MDk4ZlxcdTA5OTBcXHUwOTkzLVxcdTA5YThcXHUwOWFhLVxcdTA5YjBcXHUwOWIyXFx1MDliNi1cXHUwOWI5XFx1MDliZFxcdTA5Y2VcXHUwOWRjXFx1MDlkZFxcdTA5ZGYtXFx1MDllMVxcdTA5ZjBcXHUwOWYxXFx1MDlmY1xcdTBhMDUtXFx1MGEwYVxcdTBhMGZcXHUwYTEwXFx1MGExMy1cXHUwYTI4XFx1MGEyYS1cXHUwYTMwXFx1MGEzMlxcdTBhMzNcXHUwYTM1XFx1MGEzNlxcdTBhMzhcXHUwYTM5XFx1MGE1OS1cXHUwYTVjXFx1MGE1ZVxcdTBhNzItXFx1MGE3NFxcdTBhODUtXFx1MGE4ZFxcdTBhOGYtXFx1MGE5MVxcdTBhOTMtXFx1MGFhOFxcdTBhYWEtXFx1MGFiMFxcdTBhYjJcXHUwYWIzXFx1MGFiNS1cXHUwYWI5XFx1MGFiZFxcdTBhZDBcXHUwYWUwXFx1MGFlMVxcdTBhZjlcXHUwYjA1LVxcdTBiMGNcXHUwYjBmXFx1MGIxMFxcdTBiMTMtXFx1MGIyOFxcdTBiMmEtXFx1MGIzMFxcdTBiMzJcXHUwYjMzXFx1MGIzNS1cXHUwYjM5XFx1MGIzZFxcdTBiNWNcXHUwYjVkXFx1MGI1Zi1cXHUwYjYxXFx1MGI3MVxcdTBiODNcXHUwYjg1LVxcdTBiOGFcXHUwYjhlLVxcdTBiOTBcXHUwYjkyLVxcdTBiOTVcXHUwYjk5XFx1MGI5YVxcdTBiOWNcXHUwYjllXFx1MGI5ZlxcdTBiYTNcXHUwYmE0XFx1MGJhOC1cXHUwYmFhXFx1MGJhZS1cXHUwYmI5XFx1MGJkMFxcdTBjMDUtXFx1MGMwY1xcdTBjMGUtXFx1MGMxMFxcdTBjMTItXFx1MGMyOFxcdTBjMmEtXFx1MGMzOVxcdTBjM2RcXHUwYzU4LVxcdTBjNWFcXHUwYzVkXFx1MGM2MFxcdTBjNjFcXHUwYzgwXFx1MGM4NS1cXHUwYzhjXFx1MGM4ZS1cXHUwYzkwXFx1MGM5Mi1cXHUwY2E4XFx1MGNhYS1cXHUwY2IzXFx1MGNiNS1cXHUwY2I5XFx1MGNiZFxcdTBjZGRcXHUwY2RlXFx1MGNlMFxcdTBjZTFcXHUwY2YxXFx1MGNmMlxcdTBkMDQtXFx1MGQwY1xcdTBkMGUtXFx1MGQxMFxcdTBkMTItXFx1MGQzYVxcdTBkM2RcXHUwZDRlXFx1MGQ1NC1cXHUwZDU2XFx1MGQ1Zi1cXHUwZDYxXFx1MGQ3YS1cXHUwZDdmXFx1MGQ4NS1cXHUwZDk2XFx1MGQ5YS1cXHUwZGIxXFx1MGRiMy1cXHUwZGJiXFx1MGRiZFxcdTBkYzAtXFx1MGRjNlxcdTBlMDEtXFx1MGUzMFxcdTBlMzJcXHUwZTMzXFx1MGU0MC1cXHUwZTQ2XFx1MGU4MVxcdTBlODJcXHUwZTg0XFx1MGU4Ni1cXHUwZThhXFx1MGU4Yy1cXHUwZWEzXFx1MGVhNVxcdTBlYTctXFx1MGViMFxcdTBlYjJcXHUwZWIzXFx1MGViZFxcdTBlYzAtXFx1MGVjNFxcdTBlYzZcXHUwZWRjLVxcdTBlZGZcXHUwZjAwXFx1MGY0MC1cXHUwZjQ3XFx1MGY0OS1cXHUwZjZjXFx1MGY4OC1cXHUwZjhjXFx1MTAwMC1cXHUxMDJhXFx1MTAzZlxcdTEwNTAtXFx1MTA1NVxcdTEwNWEtXFx1MTA1ZFxcdTEwNjFcXHUxMDY1XFx1MTA2NlxcdTEwNmUtXFx1MTA3MFxcdTEwNzUtXFx1MTA4MVxcdTEwOGVcXHUxMGEwLVxcdTEwYzVcXHUxMGM3XFx1MTBjZFxcdTEwZDAtXFx1MTBmYVxcdTEwZmMtXFx1MTI0OFxcdTEyNGEtXFx1MTI0ZFxcdTEyNTAtXFx1MTI1NlxcdTEyNThcXHUxMjVhLVxcdTEyNWRcXHUxMjYwLVxcdTEyODhcXHUxMjhhLVxcdTEyOGRcXHUxMjkwLVxcdTEyYjBcXHUxMmIyLVxcdTEyYjVcXHUxMmI4LVxcdTEyYmVcXHUxMmMwXFx1MTJjMi1cXHUxMmM1XFx1MTJjOC1cXHUxMmQ2XFx1MTJkOC1cXHUxMzEwXFx1MTMxMi1cXHUxMzE1XFx1MTMxOC1cXHUxMzVhXFx1MTM4MC1cXHUxMzhmXFx1MTNhMC1cXHUxM2Y1XFx1MTNmOC1cXHUxM2ZkXFx1MTQwMS1cXHUxNjZjXFx1MTY2Zi1cXHUxNjdmXFx1MTY4MS1cXHUxNjlhXFx1MTZhMC1cXHUxNmVhXFx1MTZlZS1cXHUxNmY4XFx1MTcwMC1cXHUxNzExXFx1MTcxZi1cXHUxNzMxXFx1MTc0MC1cXHUxNzUxXFx1MTc2MC1cXHUxNzZjXFx1MTc2ZS1cXHUxNzcwXFx1MTc4MC1cXHUxN2IzXFx1MTdkN1xcdTE3ZGNcXHUxODIwLVxcdTE4NzhcXHUxODgwLVxcdTE4YThcXHUxOGFhXFx1MThiMC1cXHUxOGY1XFx1MTkwMC1cXHUxOTFlXFx1MTk1MC1cXHUxOTZkXFx1MTk3MC1cXHUxOTc0XFx1MTk4MC1cXHUxOWFiXFx1MTliMC1cXHUxOWM5XFx1MWEwMC1cXHUxYTE2XFx1MWEyMC1cXHUxYTU0XFx1MWFhN1xcdTFiMDUtXFx1MWIzM1xcdTFiNDUtXFx1MWI0Y1xcdTFiODMtXFx1MWJhMFxcdTFiYWVcXHUxYmFmXFx1MWJiYS1cXHUxYmU1XFx1MWMwMC1cXHUxYzIzXFx1MWM0ZC1cXHUxYzRmXFx1MWM1YS1cXHUxYzdkXFx1MWM4MC1cXHUxYzg4XFx1MWM5MC1cXHUxY2JhXFx1MWNiZC1cXHUxY2JmXFx1MWNlOS1cXHUxY2VjXFx1MWNlZS1cXHUxY2YzXFx1MWNmNVxcdTFjZjZcXHUxY2ZhXFx1MWQwMC1cXHUxZGJmXFx1MWUwMC1cXHUxZjE1XFx1MWYxOC1cXHUxZjFkXFx1MWYyMC1cXHUxZjQ1XFx1MWY0OC1cXHUxZjRkXFx1MWY1MC1cXHUxZjU3XFx1MWY1OVxcdTFmNWJcXHUxZjVkXFx1MWY1Zi1cXHUxZjdkXFx1MWY4MC1cXHUxZmI0XFx1MWZiNi1cXHUxZmJjXFx1MWZiZVxcdTFmYzItXFx1MWZjNFxcdTFmYzYtXFx1MWZjY1xcdTFmZDAtXFx1MWZkM1xcdTFmZDYtXFx1MWZkYlxcdTFmZTAtXFx1MWZlY1xcdTFmZjItXFx1MWZmNFxcdTFmZjYtXFx1MWZmY1xcdTIwNzFcXHUyMDdmXFx1MjA5MC1cXHUyMDljXFx1MjEwMlxcdTIxMDdcXHUyMTBhLVxcdTIxMTNcXHUyMTE1XFx1MjExOC1cXHUyMTFkXFx1MjEyNFxcdTIxMjZcXHUyMTI4XFx1MjEyYS1cXHUyMTM5XFx1MjEzYy1cXHUyMTNmXFx1MjE0NS1cXHUyMTQ5XFx1MjE0ZVxcdTIxNjAtXFx1MjE4OFxcdTJjMDAtXFx1MmNlNFxcdTJjZWItXFx1MmNlZVxcdTJjZjJcXHUyY2YzXFx1MmQwMC1cXHUyZDI1XFx1MmQyN1xcdTJkMmRcXHUyZDMwLVxcdTJkNjdcXHUyZDZmXFx1MmQ4MC1cXHUyZDk2XFx1MmRhMC1cXHUyZGE2XFx1MmRhOC1cXHUyZGFlXFx1MmRiMC1cXHUyZGI2XFx1MmRiOC1cXHUyZGJlXFx1MmRjMC1cXHUyZGM2XFx1MmRjOC1cXHUyZGNlXFx1MmRkMC1cXHUyZGQ2XFx1MmRkOC1cXHUyZGRlXFx1MzAwNS1cXHUzMDA3XFx1MzAyMS1cXHUzMDI5XFx1MzAzMS1cXHUzMDM1XFx1MzAzOC1cXHUzMDNjXFx1MzA0MS1cXHUzMDk2XFx1MzA5Yi1cXHUzMDlmXFx1MzBhMS1cXHUzMGZhXFx1MzBmYy1cXHUzMGZmXFx1MzEwNS1cXHUzMTJmXFx1MzEzMS1cXHUzMThlXFx1MzFhMC1cXHUzMWJmXFx1MzFmMC1cXHUzMWZmXFx1MzQwMC1cXHU0ZGJmXFx1NGUwMC1cXHVhNDhjXFx1YTRkMC1cXHVhNGZkXFx1YTUwMC1cXHVhNjBjXFx1YTYxMC1cXHVhNjFmXFx1YTYyYVxcdWE2MmJcXHVhNjQwLVxcdWE2NmVcXHVhNjdmLVxcdWE2OWRcXHVhNmEwLVxcdWE2ZWZcXHVhNzE3LVxcdWE3MWZcXHVhNzIyLVxcdWE3ODhcXHVhNzhiLVxcdWE3Y2FcXHVhN2QwXFx1YTdkMVxcdWE3ZDNcXHVhN2Q1LVxcdWE3ZDlcXHVhN2YyLVxcdWE4MDFcXHVhODAzLVxcdWE4MDVcXHVhODA3LVxcdWE4MGFcXHVhODBjLVxcdWE4MjJcXHVhODQwLVxcdWE4NzNcXHVhODgyLVxcdWE4YjNcXHVhOGYyLVxcdWE4ZjdcXHVhOGZiXFx1YThmZFxcdWE4ZmVcXHVhOTBhLVxcdWE5MjVcXHVhOTMwLVxcdWE5NDZcXHVhOTYwLVxcdWE5N2NcXHVhOTg0LVxcdWE5YjJcXHVhOWNmXFx1YTllMC1cXHVhOWU0XFx1YTllNi1cXHVhOWVmXFx1YTlmYS1cXHVhOWZlXFx1YWEwMC1cXHVhYTI4XFx1YWE0MC1cXHVhYTQyXFx1YWE0NC1cXHVhYTRiXFx1YWE2MC1cXHVhYTc2XFx1YWE3YVxcdWFhN2UtXFx1YWFhZlxcdWFhYjFcXHVhYWI1XFx1YWFiNlxcdWFhYjktXFx1YWFiZFxcdWFhYzBcXHVhYWMyXFx1YWFkYi1cXHVhYWRkXFx1YWFlMC1cXHVhYWVhXFx1YWFmMi1cXHVhYWY0XFx1YWIwMS1cXHVhYjA2XFx1YWIwOS1cXHVhYjBlXFx1YWIxMS1cXHVhYjE2XFx1YWIyMC1cXHVhYjI2XFx1YWIyOC1cXHVhYjJlXFx1YWIzMC1cXHVhYjVhXFx1YWI1Yy1cXHVhYjY5XFx1YWI3MC1cXHVhYmUyXFx1YWMwMC1cXHVkN2EzXFx1ZDdiMC1cXHVkN2M2XFx1ZDdjYi1cXHVkN2ZiXFx1ZjkwMC1cXHVmYTZkXFx1ZmE3MC1cXHVmYWQ5XFx1ZmIwMC1cXHVmYjA2XFx1ZmIxMy1cXHVmYjE3XFx1ZmIxZFxcdWZiMWYtXFx1ZmIyOFxcdWZiMmEtXFx1ZmIzNlxcdWZiMzgtXFx1ZmIzY1xcdWZiM2VcXHVmYjQwXFx1ZmI0MVxcdWZiNDNcXHVmYjQ0XFx1ZmI0Ni1cXHVmYmIxXFx1ZmJkMy1cXHVmZDNkXFx1ZmQ1MC1cXHVmZDhmXFx1ZmQ5Mi1cXHVmZGM3XFx1ZmRmMC1cXHVmZGZiXFx1ZmU3MC1cXHVmZTc0XFx1ZmU3Ni1cXHVmZWZjXFx1ZmYyMS1cXHVmZjNhXFx1ZmY0MS1cXHVmZjVhXFx1ZmY2Ni1cXHVmZmJlXFx1ZmZjMi1cXHVmZmM3XFx1ZmZjYS1cXHVmZmNmXFx1ZmZkMi1cXHVmZmQ3XFx1ZmZkYS1cXHVmZmRjXCI7XG5cbiAgLy8gVGhlc2UgYXJlIGEgcnVuLWxlbmd0aCBhbmQgb2Zmc2V0IGVuY29kZWQgcmVwcmVzZW50YXRpb24gb2YgdGhlXG4gIC8vID4weGZmZmYgY29kZSBwb2ludHMgdGhhdCBhcmUgYSB2YWxpZCBwYXJ0IG9mIGlkZW50aWZpZXJzLiBUaGVcbiAgLy8gb2Zmc2V0IHN0YXJ0cyBhdCAweDEwMDAwLCBhbmQgZWFjaCBwYWlyIG9mIG51bWJlcnMgcmVwcmVzZW50cyBhblxuICAvLyBvZmZzZXQgdG8gdGhlIG5leHQgcmFuZ2UsIGFuZCB0aGVuIGEgc2l6ZSBvZiB0aGUgcmFuZ2UuXG5cbiAgLy8gUmVzZXJ2ZWQgd29yZCBsaXN0cyBmb3IgdmFyaW91cyBkaWFsZWN0cyBvZiB0aGUgbGFuZ3VhZ2VcblxuICB2YXIgcmVzZXJ2ZWRXb3JkcyA9IHtcbiAgICAzOiBcImFic3RyYWN0IGJvb2xlYW4gYnl0ZSBjaGFyIGNsYXNzIGRvdWJsZSBlbnVtIGV4cG9ydCBleHRlbmRzIGZpbmFsIGZsb2F0IGdvdG8gaW1wbGVtZW50cyBpbXBvcnQgaW50IGludGVyZmFjZSBsb25nIG5hdGl2ZSBwYWNrYWdlIHByaXZhdGUgcHJvdGVjdGVkIHB1YmxpYyBzaG9ydCBzdGF0aWMgc3VwZXIgc3luY2hyb25pemVkIHRocm93cyB0cmFuc2llbnQgdm9sYXRpbGVcIixcbiAgICA1OiBcImNsYXNzIGVudW0gZXh0ZW5kcyBzdXBlciBjb25zdCBleHBvcnQgaW1wb3J0XCIsXG4gICAgNjogXCJlbnVtXCIsXG4gICAgc3RyaWN0OiBcImltcGxlbWVudHMgaW50ZXJmYWNlIGxldCBwYWNrYWdlIHByaXZhdGUgcHJvdGVjdGVkIHB1YmxpYyBzdGF0aWMgeWllbGRcIixcbiAgICBzdHJpY3RCaW5kOiBcImV2YWwgYXJndW1lbnRzXCJcbiAgfTtcblxuICAvLyBBbmQgdGhlIGtleXdvcmRzXG5cbiAgdmFyIGVjbWE1QW5kTGVzc0tleXdvcmRzID0gXCJicmVhayBjYXNlIGNhdGNoIGNvbnRpbnVlIGRlYnVnZ2VyIGRlZmF1bHQgZG8gZWxzZSBmaW5hbGx5IGZvciBmdW5jdGlvbiBpZiByZXR1cm4gc3dpdGNoIHRocm93IHRyeSB2YXIgd2hpbGUgd2l0aCBudWxsIHRydWUgZmFsc2UgaW5zdGFuY2VvZiB0eXBlb2Ygdm9pZCBkZWxldGUgbmV3IGluIHRoaXNcIjtcblxuICB2YXIga2V5d29yZHMkMSA9IHtcbiAgICA1OiBlY21hNUFuZExlc3NLZXl3b3JkcyxcbiAgICBcIjVtb2R1bGVcIjogZWNtYTVBbmRMZXNzS2V5d29yZHMgKyBcIiBleHBvcnQgaW1wb3J0XCIsXG4gICAgNjogZWNtYTVBbmRMZXNzS2V5d29yZHMgKyBcIiBjb25zdCBjbGFzcyBleHRlbmRzIGV4cG9ydCBpbXBvcnQgc3VwZXJcIlxuICB9O1xuXG4gIHZhciBrZXl3b3JkUmVsYXRpb25hbE9wZXJhdG9yID0gL15pbihzdGFuY2VvZik/JC87XG5cbiAgLy8gIyMgQ2hhcmFjdGVyIGNhdGVnb3JpZXNcblxuICB2YXIgbm9uQVNDSUlpZGVudGlmaWVyU3RhcnQgPSBuZXcgUmVnRXhwKFwiW1wiICsgbm9uQVNDSUlpZGVudGlmaWVyU3RhcnRDaGFycyArIFwiXVwiKTtcbiAgdmFyIG5vbkFTQ0lJaWRlbnRpZmllciA9IG5ldyBSZWdFeHAoXCJbXCIgKyBub25BU0NJSWlkZW50aWZpZXJTdGFydENoYXJzICsgbm9uQVNDSUlpZGVudGlmaWVyQ2hhcnMgKyBcIl1cIik7XG5cbiAgLy8gVGhpcyBoYXMgYSBjb21wbGV4aXR5IGxpbmVhciB0byB0aGUgdmFsdWUgb2YgdGhlIGNvZGUuIFRoZVxuICAvLyBhc3N1bXB0aW9uIGlzIHRoYXQgbG9va2luZyB1cCBhc3RyYWwgaWRlbnRpZmllciBjaGFyYWN0ZXJzIGlzXG4gIC8vIHJhcmUuXG4gIGZ1bmN0aW9uIGlzSW5Bc3RyYWxTZXQoY29kZSwgc2V0KSB7XG4gICAgdmFyIHBvcyA9IDB4MTAwMDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZXQubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgIHBvcyArPSBzZXRbaV07XG4gICAgICBpZiAocG9zID4gY29kZSkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgcG9zICs9IHNldFtpICsgMV07XG4gICAgICBpZiAocG9zID49IGNvZGUpIHsgcmV0dXJuIHRydWUgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIFRlc3Qgd2hldGhlciBhIGdpdmVuIGNoYXJhY3RlciBjb2RlIHN0YXJ0cyBhbiBpZGVudGlmaWVyLlxuXG4gIGZ1bmN0aW9uIGlzSWRlbnRpZmllclN0YXJ0KGNvZGUsIGFzdHJhbCkge1xuICAgIGlmIChjb2RlIDwgNjUpIHsgcmV0dXJuIGNvZGUgPT09IDM2IH1cbiAgICBpZiAoY29kZSA8IDkxKSB7IHJldHVybiB0cnVlIH1cbiAgICBpZiAoY29kZSA8IDk3KSB7IHJldHVybiBjb2RlID09PSA5NSB9XG4gICAgaWYgKGNvZGUgPCAxMjMpIHsgcmV0dXJuIHRydWUgfVxuICAgIGlmIChjb2RlIDw9IDB4ZmZmZikgeyByZXR1cm4gY29kZSA+PSAweGFhICYmIG5vbkFTQ0lJaWRlbnRpZmllclN0YXJ0LnRlc3QoU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKSkgfVxuICAgIGlmIChhc3RyYWwgPT09IGZhbHNlKSB7IHJldHVybiBmYWxzZSB9XG4gICAgcmV0dXJuIGlzSW5Bc3RyYWxTZXQoY29kZSwgYXN0cmFsSWRlbnRpZmllclN0YXJ0Q29kZXMpXG4gIH1cblxuICAvLyBUZXN0IHdoZXRoZXIgYSBnaXZlbiBjaGFyYWN0ZXIgaXMgcGFydCBvZiBhbiBpZGVudGlmaWVyLlxuXG4gIGZ1bmN0aW9uIGlzSWRlbnRpZmllckNoYXIoY29kZSwgYXN0cmFsKSB7XG4gICAgaWYgKGNvZGUgPCA0OCkgeyByZXR1cm4gY29kZSA9PT0gMzYgfVxuICAgIGlmIChjb2RlIDwgNTgpIHsgcmV0dXJuIHRydWUgfVxuICAgIGlmIChjb2RlIDwgNjUpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICBpZiAoY29kZSA8IDkxKSB7IHJldHVybiB0cnVlIH1cbiAgICBpZiAoY29kZSA8IDk3KSB7IHJldHVybiBjb2RlID09PSA5NSB9XG4gICAgaWYgKGNvZGUgPCAxMjMpIHsgcmV0dXJuIHRydWUgfVxuICAgIGlmIChjb2RlIDw9IDB4ZmZmZikgeyByZXR1cm4gY29kZSA+PSAweGFhICYmIG5vbkFTQ0lJaWRlbnRpZmllci50ZXN0KFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZSkpIH1cbiAgICBpZiAoYXN0cmFsID09PSBmYWxzZSkgeyByZXR1cm4gZmFsc2UgfVxuICAgIHJldHVybiBpc0luQXN0cmFsU2V0KGNvZGUsIGFzdHJhbElkZW50aWZpZXJTdGFydENvZGVzKSB8fCBpc0luQXN0cmFsU2V0KGNvZGUsIGFzdHJhbElkZW50aWZpZXJDb2RlcylcbiAgfVxuXG4gIC8vICMjIFRva2VuIHR5cGVzXG5cbiAgLy8gVGhlIGFzc2lnbm1lbnQgb2YgZmluZS1ncmFpbmVkLCBpbmZvcm1hdGlvbi1jYXJyeWluZyB0eXBlIG9iamVjdHNcbiAgLy8gYWxsb3dzIHRoZSB0b2tlbml6ZXIgdG8gc3RvcmUgdGhlIGluZm9ybWF0aW9uIGl0IGhhcyBhYm91dCBhXG4gIC8vIHRva2VuIGluIGEgd2F5IHRoYXQgaXMgdmVyeSBjaGVhcCBmb3IgdGhlIHBhcnNlciB0byBsb29rIHVwLlxuXG4gIC8vIEFsbCB0b2tlbiB0eXBlIHZhcmlhYmxlcyBzdGFydCB3aXRoIGFuIHVuZGVyc2NvcmUsIHRvIG1ha2UgdGhlbVxuICAvLyBlYXN5IHRvIHJlY29nbml6ZS5cblxuICAvLyBUaGUgYGJlZm9yZUV4cHJgIHByb3BlcnR5IGlzIHVzZWQgdG8gZGlzYW1iaWd1YXRlIGJldHdlZW4gcmVndWxhclxuICAvLyBleHByZXNzaW9ucyBhbmQgZGl2aXNpb25zLiBJdCBpcyBzZXQgb24gYWxsIHRva2VuIHR5cGVzIHRoYXQgY2FuXG4gIC8vIGJlIGZvbGxvd2VkIGJ5IGFuIGV4cHJlc3Npb24gKHRodXMsIGEgc2xhc2ggYWZ0ZXIgdGhlbSB3b3VsZCBiZSBhXG4gIC8vIHJlZ3VsYXIgZXhwcmVzc2lvbikuXG4gIC8vXG4gIC8vIFRoZSBgc3RhcnRzRXhwcmAgcHJvcGVydHkgaXMgdXNlZCB0byBjaGVjayBpZiB0aGUgdG9rZW4gZW5kcyBhXG4gIC8vIGB5aWVsZGAgZXhwcmVzc2lvbi4gSXQgaXMgc2V0IG9uIGFsbCB0b2tlbiB0eXBlcyB0aGF0IGVpdGhlciBjYW5cbiAgLy8gZGlyZWN0bHkgc3RhcnQgYW4gZXhwcmVzc2lvbiAobGlrZSBhIHF1b3RhdGlvbiBtYXJrKSBvciBjYW5cbiAgLy8gY29udGludWUgYW4gZXhwcmVzc2lvbiAobGlrZSB0aGUgYm9keSBvZiBhIHN0cmluZykuXG4gIC8vXG4gIC8vIGBpc0xvb3BgIG1hcmtzIGEga2V5d29yZCBhcyBzdGFydGluZyBhIGxvb3AsIHdoaWNoIGlzIGltcG9ydGFudFxuICAvLyB0byBrbm93IHdoZW4gcGFyc2luZyBhIGxhYmVsLCBpbiBvcmRlciB0byBhbGxvdyBvciBkaXNhbGxvd1xuICAvLyBjb250aW51ZSBqdW1wcyB0byB0aGF0IGxhYmVsLlxuXG4gIHZhciBUb2tlblR5cGUgPSBmdW5jdGlvbiBUb2tlblR5cGUobGFiZWwsIGNvbmYpIHtcbiAgICBpZiAoIGNvbmYgPT09IHZvaWQgMCApIGNvbmYgPSB7fTtcblxuICAgIHRoaXMubGFiZWwgPSBsYWJlbDtcbiAgICB0aGlzLmtleXdvcmQgPSBjb25mLmtleXdvcmQ7XG4gICAgdGhpcy5iZWZvcmVFeHByID0gISFjb25mLmJlZm9yZUV4cHI7XG4gICAgdGhpcy5zdGFydHNFeHByID0gISFjb25mLnN0YXJ0c0V4cHI7XG4gICAgdGhpcy5pc0xvb3AgPSAhIWNvbmYuaXNMb29wO1xuICAgIHRoaXMuaXNBc3NpZ24gPSAhIWNvbmYuaXNBc3NpZ247XG4gICAgdGhpcy5wcmVmaXggPSAhIWNvbmYucHJlZml4O1xuICAgIHRoaXMucG9zdGZpeCA9ICEhY29uZi5wb3N0Zml4O1xuICAgIHRoaXMuYmlub3AgPSBjb25mLmJpbm9wIHx8IG51bGw7XG4gICAgdGhpcy51cGRhdGVDb250ZXh0ID0gbnVsbDtcbiAgfTtcblxuICBmdW5jdGlvbiBiaW5vcChuYW1lLCBwcmVjKSB7XG4gICAgcmV0dXJuIG5ldyBUb2tlblR5cGUobmFtZSwge2JlZm9yZUV4cHI6IHRydWUsIGJpbm9wOiBwcmVjfSlcbiAgfVxuICB2YXIgYmVmb3JlRXhwciA9IHtiZWZvcmVFeHByOiB0cnVlfSwgc3RhcnRzRXhwciA9IHtzdGFydHNFeHByOiB0cnVlfTtcblxuICAvLyBNYXAga2V5d29yZCBuYW1lcyB0byB0b2tlbiB0eXBlcy5cblxuICB2YXIga2V5d29yZHMgPSB7fTtcblxuICAvLyBTdWNjaW5jdCBkZWZpbml0aW9ucyBvZiBrZXl3b3JkIHRva2VuIHR5cGVzXG4gIGZ1bmN0aW9uIGt3KG5hbWUsIG9wdGlvbnMpIHtcbiAgICBpZiAoIG9wdGlvbnMgPT09IHZvaWQgMCApIG9wdGlvbnMgPSB7fTtcblxuICAgIG9wdGlvbnMua2V5d29yZCA9IG5hbWU7XG4gICAgcmV0dXJuIGtleXdvcmRzW25hbWVdID0gbmV3IFRva2VuVHlwZShuYW1lLCBvcHRpb25zKVxuICB9XG5cbiAgdmFyIHR5cGVzJDEgPSB7XG4gICAgbnVtOiBuZXcgVG9rZW5UeXBlKFwibnVtXCIsIHN0YXJ0c0V4cHIpLFxuICAgIHJlZ2V4cDogbmV3IFRva2VuVHlwZShcInJlZ2V4cFwiLCBzdGFydHNFeHByKSxcbiAgICBzdHJpbmc6IG5ldyBUb2tlblR5cGUoXCJzdHJpbmdcIiwgc3RhcnRzRXhwciksXG4gICAgbmFtZTogbmV3IFRva2VuVHlwZShcIm5hbWVcIiwgc3RhcnRzRXhwciksXG4gICAgcHJpdmF0ZUlkOiBuZXcgVG9rZW5UeXBlKFwicHJpdmF0ZUlkXCIsIHN0YXJ0c0V4cHIpLFxuICAgIGVvZjogbmV3IFRva2VuVHlwZShcImVvZlwiKSxcblxuICAgIC8vIFB1bmN0dWF0aW9uIHRva2VuIHR5cGVzLlxuICAgIGJyYWNrZXRMOiBuZXcgVG9rZW5UeXBlKFwiW1wiLCB7YmVmb3JlRXhwcjogdHJ1ZSwgc3RhcnRzRXhwcjogdHJ1ZX0pLFxuICAgIGJyYWNrZXRSOiBuZXcgVG9rZW5UeXBlKFwiXVwiKSxcbiAgICBicmFjZUw6IG5ldyBUb2tlblR5cGUoXCJ7XCIsIHtiZWZvcmVFeHByOiB0cnVlLCBzdGFydHNFeHByOiB0cnVlfSksXG4gICAgYnJhY2VSOiBuZXcgVG9rZW5UeXBlKFwifVwiKSxcbiAgICBwYXJlbkw6IG5ldyBUb2tlblR5cGUoXCIoXCIsIHtiZWZvcmVFeHByOiB0cnVlLCBzdGFydHNFeHByOiB0cnVlfSksXG4gICAgcGFyZW5SOiBuZXcgVG9rZW5UeXBlKFwiKVwiKSxcbiAgICBjb21tYTogbmV3IFRva2VuVHlwZShcIixcIiwgYmVmb3JlRXhwciksXG4gICAgc2VtaTogbmV3IFRva2VuVHlwZShcIjtcIiwgYmVmb3JlRXhwciksXG4gICAgY29sb246IG5ldyBUb2tlblR5cGUoXCI6XCIsIGJlZm9yZUV4cHIpLFxuICAgIGRvdDogbmV3IFRva2VuVHlwZShcIi5cIiksXG4gICAgcXVlc3Rpb246IG5ldyBUb2tlblR5cGUoXCI/XCIsIGJlZm9yZUV4cHIpLFxuICAgIHF1ZXN0aW9uRG90OiBuZXcgVG9rZW5UeXBlKFwiPy5cIiksXG4gICAgYXJyb3c6IG5ldyBUb2tlblR5cGUoXCI9PlwiLCBiZWZvcmVFeHByKSxcbiAgICB0ZW1wbGF0ZTogbmV3IFRva2VuVHlwZShcInRlbXBsYXRlXCIpLFxuICAgIGludmFsaWRUZW1wbGF0ZTogbmV3IFRva2VuVHlwZShcImludmFsaWRUZW1wbGF0ZVwiKSxcbiAgICBlbGxpcHNpczogbmV3IFRva2VuVHlwZShcIi4uLlwiLCBiZWZvcmVFeHByKSxcbiAgICBiYWNrUXVvdGU6IG5ldyBUb2tlblR5cGUoXCJgXCIsIHN0YXJ0c0V4cHIpLFxuICAgIGRvbGxhckJyYWNlTDogbmV3IFRva2VuVHlwZShcIiR7XCIsIHtiZWZvcmVFeHByOiB0cnVlLCBzdGFydHNFeHByOiB0cnVlfSksXG5cbiAgICAvLyBPcGVyYXRvcnMuIFRoZXNlIGNhcnJ5IHNldmVyYWwga2luZHMgb2YgcHJvcGVydGllcyB0byBoZWxwIHRoZVxuICAgIC8vIHBhcnNlciB1c2UgdGhlbSBwcm9wZXJseSAodGhlIHByZXNlbmNlIG9mIHRoZXNlIHByb3BlcnRpZXMgaXNcbiAgICAvLyB3aGF0IGNhdGVnb3JpemVzIHRoZW0gYXMgb3BlcmF0b3JzKS5cbiAgICAvL1xuICAgIC8vIGBiaW5vcGAsIHdoZW4gcHJlc2VudCwgc3BlY2lmaWVzIHRoYXQgdGhpcyBvcGVyYXRvciBpcyBhIGJpbmFyeVxuICAgIC8vIG9wZXJhdG9yLCBhbmQgd2lsbCByZWZlciB0byBpdHMgcHJlY2VkZW5jZS5cbiAgICAvL1xuICAgIC8vIGBwcmVmaXhgIGFuZCBgcG9zdGZpeGAgbWFyayB0aGUgb3BlcmF0b3IgYXMgYSBwcmVmaXggb3IgcG9zdGZpeFxuICAgIC8vIHVuYXJ5IG9wZXJhdG9yLlxuICAgIC8vXG4gICAgLy8gYGlzQXNzaWduYCBtYXJrcyBhbGwgb2YgYD1gLCBgKz1gLCBgLT1gIGV0Y2V0ZXJhLCB3aGljaCBhY3QgYXNcbiAgICAvLyBiaW5hcnkgb3BlcmF0b3JzIHdpdGggYSB2ZXJ5IGxvdyBwcmVjZWRlbmNlLCB0aGF0IHNob3VsZCByZXN1bHRcbiAgICAvLyBpbiBBc3NpZ25tZW50RXhwcmVzc2lvbiBub2Rlcy5cblxuICAgIGVxOiBuZXcgVG9rZW5UeXBlKFwiPVwiLCB7YmVmb3JlRXhwcjogdHJ1ZSwgaXNBc3NpZ246IHRydWV9KSxcbiAgICBhc3NpZ246IG5ldyBUb2tlblR5cGUoXCJfPVwiLCB7YmVmb3JlRXhwcjogdHJ1ZSwgaXNBc3NpZ246IHRydWV9KSxcbiAgICBpbmNEZWM6IG5ldyBUb2tlblR5cGUoXCIrKy8tLVwiLCB7cHJlZml4OiB0cnVlLCBwb3N0Zml4OiB0cnVlLCBzdGFydHNFeHByOiB0cnVlfSksXG4gICAgcHJlZml4OiBuZXcgVG9rZW5UeXBlKFwiIS9+XCIsIHtiZWZvcmVFeHByOiB0cnVlLCBwcmVmaXg6IHRydWUsIHN0YXJ0c0V4cHI6IHRydWV9KSxcbiAgICBsb2dpY2FsT1I6IGJpbm9wKFwifHxcIiwgMSksXG4gICAgbG9naWNhbEFORDogYmlub3AoXCImJlwiLCAyKSxcbiAgICBiaXR3aXNlT1I6IGJpbm9wKFwifFwiLCAzKSxcbiAgICBiaXR3aXNlWE9SOiBiaW5vcChcIl5cIiwgNCksXG4gICAgYml0d2lzZUFORDogYmlub3AoXCImXCIsIDUpLFxuICAgIGVxdWFsaXR5OiBiaW5vcChcIj09LyE9Lz09PS8hPT1cIiwgNiksXG4gICAgcmVsYXRpb25hbDogYmlub3AoXCI8Lz4vPD0vPj1cIiwgNyksXG4gICAgYml0U2hpZnQ6IGJpbm9wKFwiPDwvPj4vPj4+XCIsIDgpLFxuICAgIHBsdXNNaW46IG5ldyBUb2tlblR5cGUoXCIrLy1cIiwge2JlZm9yZUV4cHI6IHRydWUsIGJpbm9wOiA5LCBwcmVmaXg6IHRydWUsIHN0YXJ0c0V4cHI6IHRydWV9KSxcbiAgICBtb2R1bG86IGJpbm9wKFwiJVwiLCAxMCksXG4gICAgc3RhcjogYmlub3AoXCIqXCIsIDEwKSxcbiAgICBzbGFzaDogYmlub3AoXCIvXCIsIDEwKSxcbiAgICBzdGFyc3RhcjogbmV3IFRva2VuVHlwZShcIioqXCIsIHtiZWZvcmVFeHByOiB0cnVlfSksXG4gICAgY29hbGVzY2U6IGJpbm9wKFwiPz9cIiwgMSksXG5cbiAgICAvLyBLZXl3b3JkIHRva2VuIHR5cGVzLlxuICAgIF9icmVhazoga3coXCJicmVha1wiKSxcbiAgICBfY2FzZToga3coXCJjYXNlXCIsIGJlZm9yZUV4cHIpLFxuICAgIF9jYXRjaDoga3coXCJjYXRjaFwiKSxcbiAgICBfY29udGludWU6IGt3KFwiY29udGludWVcIiksXG4gICAgX2RlYnVnZ2VyOiBrdyhcImRlYnVnZ2VyXCIpLFxuICAgIF9kZWZhdWx0OiBrdyhcImRlZmF1bHRcIiwgYmVmb3JlRXhwciksXG4gICAgX2RvOiBrdyhcImRvXCIsIHtpc0xvb3A6IHRydWUsIGJlZm9yZUV4cHI6IHRydWV9KSxcbiAgICBfZWxzZToga3coXCJlbHNlXCIsIGJlZm9yZUV4cHIpLFxuICAgIF9maW5hbGx5OiBrdyhcImZpbmFsbHlcIiksXG4gICAgX2Zvcjoga3coXCJmb3JcIiwge2lzTG9vcDogdHJ1ZX0pLFxuICAgIF9mdW5jdGlvbjoga3coXCJmdW5jdGlvblwiLCBzdGFydHNFeHByKSxcbiAgICBfaWY6IGt3KFwiaWZcIiksXG4gICAgX3JldHVybjoga3coXCJyZXR1cm5cIiwgYmVmb3JlRXhwciksXG4gICAgX3N3aXRjaDoga3coXCJzd2l0Y2hcIiksXG4gICAgX3Rocm93OiBrdyhcInRocm93XCIsIGJlZm9yZUV4cHIpLFxuICAgIF90cnk6IGt3KFwidHJ5XCIpLFxuICAgIF92YXI6IGt3KFwidmFyXCIpLFxuICAgIF9jb25zdDoga3coXCJjb25zdFwiKSxcbiAgICBfd2hpbGU6IGt3KFwid2hpbGVcIiwge2lzTG9vcDogdHJ1ZX0pLFxuICAgIF93aXRoOiBrdyhcIndpdGhcIiksXG4gICAgX25ldzoga3coXCJuZXdcIiwge2JlZm9yZUV4cHI6IHRydWUsIHN0YXJ0c0V4cHI6IHRydWV9KSxcbiAgICBfdGhpczoga3coXCJ0aGlzXCIsIHN0YXJ0c0V4cHIpLFxuICAgIF9zdXBlcjoga3coXCJzdXBlclwiLCBzdGFydHNFeHByKSxcbiAgICBfY2xhc3M6IGt3KFwiY2xhc3NcIiwgc3RhcnRzRXhwciksXG4gICAgX2V4dGVuZHM6IGt3KFwiZXh0ZW5kc1wiLCBiZWZvcmVFeHByKSxcbiAgICBfZXhwb3J0OiBrdyhcImV4cG9ydFwiKSxcbiAgICBfaW1wb3J0OiBrdyhcImltcG9ydFwiLCBzdGFydHNFeHByKSxcbiAgICBfbnVsbDoga3coXCJudWxsXCIsIHN0YXJ0c0V4cHIpLFxuICAgIF90cnVlOiBrdyhcInRydWVcIiwgc3RhcnRzRXhwciksXG4gICAgX2ZhbHNlOiBrdyhcImZhbHNlXCIsIHN0YXJ0c0V4cHIpLFxuICAgIF9pbjoga3coXCJpblwiLCB7YmVmb3JlRXhwcjogdHJ1ZSwgYmlub3A6IDd9KSxcbiAgICBfaW5zdGFuY2VvZjoga3coXCJpbnN0YW5jZW9mXCIsIHtiZWZvcmVFeHByOiB0cnVlLCBiaW5vcDogN30pLFxuICAgIF90eXBlb2Y6IGt3KFwidHlwZW9mXCIsIHtiZWZvcmVFeHByOiB0cnVlLCBwcmVmaXg6IHRydWUsIHN0YXJ0c0V4cHI6IHRydWV9KSxcbiAgICBfdm9pZDoga3coXCJ2b2lkXCIsIHtiZWZvcmVFeHByOiB0cnVlLCBwcmVmaXg6IHRydWUsIHN0YXJ0c0V4cHI6IHRydWV9KSxcbiAgICBfZGVsZXRlOiBrdyhcImRlbGV0ZVwiLCB7YmVmb3JlRXhwcjogdHJ1ZSwgcHJlZml4OiB0cnVlLCBzdGFydHNFeHByOiB0cnVlfSlcbiAgfTtcblxuICAvLyBNYXRjaGVzIGEgd2hvbGUgbGluZSBicmVhayAod2hlcmUgQ1JMRiBpcyBjb25zaWRlcmVkIGEgc2luZ2xlXG4gIC8vIGxpbmUgYnJlYWspLiBVc2VkIHRvIGNvdW50IGxpbmVzLlxuXG4gIHZhciBsaW5lQnJlYWsgPSAvXFxyXFxuP3xcXG58XFx1MjAyOHxcXHUyMDI5LztcbiAgdmFyIGxpbmVCcmVha0cgPSBuZXcgUmVnRXhwKGxpbmVCcmVhay5zb3VyY2UsIFwiZ1wiKTtcblxuICBmdW5jdGlvbiBpc05ld0xpbmUoY29kZSkge1xuICAgIHJldHVybiBjb2RlID09PSAxMCB8fCBjb2RlID09PSAxMyB8fCBjb2RlID09PSAweDIwMjggfHwgY29kZSA9PT0gMHgyMDI5XG4gIH1cblxuICBmdW5jdGlvbiBuZXh0TGluZUJyZWFrKGNvZGUsIGZyb20sIGVuZCkge1xuICAgIGlmICggZW5kID09PSB2b2lkIDAgKSBlbmQgPSBjb2RlLmxlbmd0aDtcblxuICAgIGZvciAodmFyIGkgPSBmcm9tOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHZhciBuZXh0ID0gY29kZS5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGlzTmV3TGluZShuZXh0KSlcbiAgICAgICAgeyByZXR1cm4gaSA8IGVuZCAtIDEgJiYgbmV4dCA9PT0gMTMgJiYgY29kZS5jaGFyQ29kZUF0KGkgKyAxKSA9PT0gMTAgPyBpICsgMiA6IGkgKyAxIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xXG4gIH1cblxuICB2YXIgbm9uQVNDSUl3aGl0ZXNwYWNlID0gL1tcXHUxNjgwXFx1MjAwMC1cXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1ZmVmZl0vO1xuXG4gIHZhciBza2lwV2hpdGVTcGFjZSA9IC8oPzpcXHN8XFwvXFwvLip8XFwvXFwqW15dKj9cXCpcXC8pKi9nO1xuXG4gIHZhciByZWYgPSBPYmplY3QucHJvdG90eXBlO1xuICB2YXIgaGFzT3duUHJvcGVydHkgPSByZWYuaGFzT3duUHJvcGVydHk7XG4gIHZhciB0b1N0cmluZyA9IHJlZi50b1N0cmluZztcblxuICB2YXIgaGFzT3duID0gT2JqZWN0Lmhhc093biB8fCAoZnVuY3Rpb24gKG9iaiwgcHJvcE5hbWUpIHsgcmV0dXJuIChcbiAgICBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcE5hbWUpXG4gICk7IH0pO1xuXG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCAoZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gKFxuICAgIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiXG4gICk7IH0pO1xuXG4gIGZ1bmN0aW9uIHdvcmRzUmVnZXhwKHdvcmRzKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoXCJeKD86XCIgKyB3b3Jkcy5yZXBsYWNlKC8gL2csIFwifFwiKSArIFwiKSRcIilcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvZGVQb2ludFRvU3RyaW5nKGNvZGUpIHtcbiAgICAvLyBVVEYtMTYgRGVjb2RpbmdcbiAgICBpZiAoY29kZSA8PSAweEZGRkYpIHsgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZSkgfVxuICAgIGNvZGUgLT0gMHgxMDAwMDtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgoY29kZSA+PiAxMCkgKyAweEQ4MDAsIChjb2RlICYgMTAyMykgKyAweERDMDApXG4gIH1cblxuICB2YXIgbG9uZVN1cnJvZ2F0ZSA9IC8oPzpbXFx1RDgwMC1cXHVEQkZGXSg/IVtcXHVEQzAwLVxcdURGRkZdKXwoPzpbXlxcdUQ4MDAtXFx1REJGRl18XilbXFx1REMwMC1cXHVERkZGXSkvO1xuXG4gIC8vIFRoZXNlIGFyZSB1c2VkIHdoZW4gYG9wdGlvbnMubG9jYXRpb25zYCBpcyBvbiwgZm9yIHRoZVxuICAvLyBgc3RhcnRMb2NgIGFuZCBgZW5kTG9jYCBwcm9wZXJ0aWVzLlxuXG4gIHZhciBQb3NpdGlvbiA9IGZ1bmN0aW9uIFBvc2l0aW9uKGxpbmUsIGNvbCkge1xuICAgIHRoaXMubGluZSA9IGxpbmU7XG4gICAgdGhpcy5jb2x1bW4gPSBjb2w7XG4gIH07XG5cbiAgUG9zaXRpb24ucHJvdG90eXBlLm9mZnNldCA9IGZ1bmN0aW9uIG9mZnNldCAobikge1xuICAgIHJldHVybiBuZXcgUG9zaXRpb24odGhpcy5saW5lLCB0aGlzLmNvbHVtbiArIG4pXG4gIH07XG5cbiAgdmFyIFNvdXJjZUxvY2F0aW9uID0gZnVuY3Rpb24gU291cmNlTG9jYXRpb24ocCwgc3RhcnQsIGVuZCkge1xuICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICB0aGlzLmVuZCA9IGVuZDtcbiAgICBpZiAocC5zb3VyY2VGaWxlICE9PSBudWxsKSB7IHRoaXMuc291cmNlID0gcC5zb3VyY2VGaWxlOyB9XG4gIH07XG5cbiAgLy8gVGhlIGBnZXRMaW5lSW5mb2AgZnVuY3Rpb24gaXMgbW9zdGx5IHVzZWZ1bCB3aGVuIHRoZVxuICAvLyBgbG9jYXRpb25zYCBvcHRpb24gaXMgb2ZmIChmb3IgcGVyZm9ybWFuY2UgcmVhc29ucykgYW5kIHlvdVxuICAvLyB3YW50IHRvIGZpbmQgdGhlIGxpbmUvY29sdW1uIHBvc2l0aW9uIGZvciBhIGdpdmVuIGNoYXJhY3RlclxuICAvLyBvZmZzZXQuIGBpbnB1dGAgc2hvdWxkIGJlIHRoZSBjb2RlIHN0cmluZyB0aGF0IHRoZSBvZmZzZXQgcmVmZXJzXG4gIC8vIGludG8uXG5cbiAgZnVuY3Rpb24gZ2V0TGluZUluZm8oaW5wdXQsIG9mZnNldCkge1xuICAgIGZvciAodmFyIGxpbmUgPSAxLCBjdXIgPSAwOzspIHtcbiAgICAgIHZhciBuZXh0QnJlYWsgPSBuZXh0TGluZUJyZWFrKGlucHV0LCBjdXIsIG9mZnNldCk7XG4gICAgICBpZiAobmV4dEJyZWFrIDwgMCkgeyByZXR1cm4gbmV3IFBvc2l0aW9uKGxpbmUsIG9mZnNldCAtIGN1cikgfVxuICAgICAgKytsaW5lO1xuICAgICAgY3VyID0gbmV4dEJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIEEgc2Vjb25kIGFyZ3VtZW50IG11c3QgYmUgZ2l2ZW4gdG8gY29uZmlndXJlIHRoZSBwYXJzZXIgcHJvY2Vzcy5cbiAgLy8gVGhlc2Ugb3B0aW9ucyBhcmUgcmVjb2duaXplZCAob25seSBgZWNtYVZlcnNpb25gIGlzIHJlcXVpcmVkKTpcblxuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgLy8gYGVjbWFWZXJzaW9uYCBpbmRpY2F0ZXMgdGhlIEVDTUFTY3JpcHQgdmVyc2lvbiB0byBwYXJzZS4gTXVzdCBiZVxuICAgIC8vIGVpdGhlciAzLCA1LCA2IChvciAyMDE1KSwgNyAoMjAxNiksIDggKDIwMTcpLCA5ICgyMDE4KSwgMTBcbiAgICAvLyAoMjAxOSksIDExICgyMDIwKSwgMTIgKDIwMjEpLCAxMyAoMjAyMiksIDE0ICgyMDIzKSwgb3IgYFwibGF0ZXN0XCJgXG4gICAgLy8gKHRoZSBsYXRlc3QgdmVyc2lvbiB0aGUgbGlicmFyeSBzdXBwb3J0cykuIFRoaXMgaW5mbHVlbmNlc1xuICAgIC8vIHN1cHBvcnQgZm9yIHN0cmljdCBtb2RlLCB0aGUgc2V0IG9mIHJlc2VydmVkIHdvcmRzLCBhbmQgc3VwcG9ydFxuICAgIC8vIGZvciBuZXcgc3ludGF4IGZlYXR1cmVzLlxuICAgIGVjbWFWZXJzaW9uOiBudWxsLFxuICAgIC8vIGBzb3VyY2VUeXBlYCBpbmRpY2F0ZXMgdGhlIG1vZGUgdGhlIGNvZGUgc2hvdWxkIGJlIHBhcnNlZCBpbi5cbiAgICAvLyBDYW4gYmUgZWl0aGVyIGBcInNjcmlwdFwiYCBvciBgXCJtb2R1bGVcImAuIFRoaXMgaW5mbHVlbmNlcyBnbG9iYWxcbiAgICAvLyBzdHJpY3QgbW9kZSBhbmQgcGFyc2luZyBvZiBgaW1wb3J0YCBhbmQgYGV4cG9ydGAgZGVjbGFyYXRpb25zLlxuICAgIHNvdXJjZVR5cGU6IFwic2NyaXB0XCIsXG4gICAgLy8gYG9uSW5zZXJ0ZWRTZW1pY29sb25gIGNhbiBiZSBhIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWRcbiAgICAvLyB3aGVuIGEgc2VtaWNvbG9uIGlzIGF1dG9tYXRpY2FsbHkgaW5zZXJ0ZWQuIEl0IHdpbGwgYmUgcGFzc2VkXG4gICAgLy8gdGhlIHBvc2l0aW9uIG9mIHRoZSBjb21tYSBhcyBhbiBvZmZzZXQsIGFuZCBpZiBgbG9jYXRpb25zYCBpc1xuICAgIC8vIGVuYWJsZWQsIGl0IGlzIGdpdmVuIHRoZSBsb2NhdGlvbiBhcyBhIGB7bGluZSwgY29sdW1ufWAgb2JqZWN0XG4gICAgLy8gYXMgc2Vjb25kIGFyZ3VtZW50LlxuICAgIG9uSW5zZXJ0ZWRTZW1pY29sb246IG51bGwsXG4gICAgLy8gYG9uVHJhaWxpbmdDb21tYWAgaXMgc2ltaWxhciB0byBgb25JbnNlcnRlZFNlbWljb2xvbmAsIGJ1dCBmb3JcbiAgICAvLyB0cmFpbGluZyBjb21tYXMuXG4gICAgb25UcmFpbGluZ0NvbW1hOiBudWxsLFxuICAgIC8vIEJ5IGRlZmF1bHQsIHJlc2VydmVkIHdvcmRzIGFyZSBvbmx5IGVuZm9yY2VkIGlmIGVjbWFWZXJzaW9uID49IDUuXG4gICAgLy8gU2V0IGBhbGxvd1Jlc2VydmVkYCB0byBhIGJvb2xlYW4gdmFsdWUgdG8gZXhwbGljaXRseSB0dXJuIHRoaXMgb25cbiAgICAvLyBhbiBvZmYuIFdoZW4gdGhpcyBvcHRpb24gaGFzIHRoZSB2YWx1ZSBcIm5ldmVyXCIsIHJlc2VydmVkIHdvcmRzXG4gICAgLy8gYW5kIGtleXdvcmRzIGNhbiBhbHNvIG5vdCBiZSB1c2VkIGFzIHByb3BlcnR5IG5hbWVzLlxuICAgIGFsbG93UmVzZXJ2ZWQ6IG51bGwsXG4gICAgLy8gV2hlbiBlbmFibGVkLCBhIHJldHVybiBhdCB0aGUgdG9wIGxldmVsIGlzIG5vdCBjb25zaWRlcmVkIGFuXG4gICAgLy8gZXJyb3IuXG4gICAgYWxsb3dSZXR1cm5PdXRzaWRlRnVuY3Rpb246IGZhbHNlLFxuICAgIC8vIFdoZW4gZW5hYmxlZCwgaW1wb3J0L2V4cG9ydCBzdGF0ZW1lbnRzIGFyZSBub3QgY29uc3RyYWluZWQgdG9cbiAgICAvLyBhcHBlYXJpbmcgYXQgdGhlIHRvcCBvZiB0aGUgcHJvZ3JhbSwgYW5kIGFuIGltcG9ydC5tZXRhIGV4cHJlc3Npb25cbiAgICAvLyBpbiBhIHNjcmlwdCBpc24ndCBjb25zaWRlcmVkIGFuIGVycm9yLlxuICAgIGFsbG93SW1wb3J0RXhwb3J0RXZlcnl3aGVyZTogZmFsc2UsXG4gICAgLy8gQnkgZGVmYXVsdCwgYXdhaXQgaWRlbnRpZmllcnMgYXJlIGFsbG93ZWQgdG8gYXBwZWFyIGF0IHRoZSB0b3AtbGV2ZWwgc2NvcGUgb25seSBpZiBlY21hVmVyc2lvbiA+PSAyMDIyLlxuICAgIC8vIFdoZW4gZW5hYmxlZCwgYXdhaXQgaWRlbnRpZmllcnMgYXJlIGFsbG93ZWQgdG8gYXBwZWFyIGF0IHRoZSB0b3AtbGV2ZWwgc2NvcGUsXG4gICAgLy8gYnV0IHRoZXkgYXJlIHN0aWxsIG5vdCBhbGxvd2VkIGluIG5vbi1hc3luYyBmdW5jdGlvbnMuXG4gICAgYWxsb3dBd2FpdE91dHNpZGVGdW5jdGlvbjogbnVsbCxcbiAgICAvLyBXaGVuIGVuYWJsZWQsIHN1cGVyIGlkZW50aWZpZXJzIGFyZSBub3QgY29uc3RyYWluZWQgdG9cbiAgICAvLyBhcHBlYXJpbmcgaW4gbWV0aG9kcyBhbmQgZG8gbm90IHJhaXNlIGFuIGVycm9yIHdoZW4gdGhleSBhcHBlYXIgZWxzZXdoZXJlLlxuICAgIGFsbG93U3VwZXJPdXRzaWRlTWV0aG9kOiBudWxsLFxuICAgIC8vIFdoZW4gZW5hYmxlZCwgaGFzaGJhbmcgZGlyZWN0aXZlIGluIHRoZSBiZWdpbm5pbmcgb2YgZmlsZSBpc1xuICAgIC8vIGFsbG93ZWQgYW5kIHRyZWF0ZWQgYXMgYSBsaW5lIGNvbW1lbnQuIEVuYWJsZWQgYnkgZGVmYXVsdCB3aGVuXG4gICAgLy8gYGVjbWFWZXJzaW9uYCA+PSAyMDIzLlxuICAgIGFsbG93SGFzaEJhbmc6IGZhbHNlLFxuICAgIC8vIEJ5IGRlZmF1bHQsIHRoZSBwYXJzZXIgd2lsbCB2ZXJpZnkgdGhhdCBwcml2YXRlIHByb3BlcnRpZXMgYXJlXG4gICAgLy8gb25seSB1c2VkIGluIHBsYWNlcyB3aGVyZSB0aGV5IGFyZSB2YWxpZCBhbmQgaGF2ZSBiZWVuIGRlY2xhcmVkLlxuICAgIC8vIFNldCB0aGlzIHRvIGZhbHNlIHRvIHR1cm4gc3VjaCBjaGVja3Mgb2ZmLlxuICAgIGNoZWNrUHJpdmF0ZUZpZWxkczogdHJ1ZSxcbiAgICAvLyBXaGVuIGBsb2NhdGlvbnNgIGlzIG9uLCBgbG9jYCBwcm9wZXJ0aWVzIGhvbGRpbmcgb2JqZWN0cyB3aXRoXG4gICAgLy8gYHN0YXJ0YCBhbmQgYGVuZGAgcHJvcGVydGllcyBpbiBge2xpbmUsIGNvbHVtbn1gIGZvcm0gKHdpdGhcbiAgICAvLyBsaW5lIGJlaW5nIDEtYmFzZWQgYW5kIGNvbHVtbiAwLWJhc2VkKSB3aWxsIGJlIGF0dGFjaGVkIHRvIHRoZVxuICAgIC8vIG5vZGVzLlxuICAgIGxvY2F0aW9uczogZmFsc2UsXG4gICAgLy8gQSBmdW5jdGlvbiBjYW4gYmUgcGFzc2VkIGFzIGBvblRva2VuYCBvcHRpb24sIHdoaWNoIHdpbGxcbiAgICAvLyBjYXVzZSBBY29ybiB0byBjYWxsIHRoYXQgZnVuY3Rpb24gd2l0aCBvYmplY3QgaW4gdGhlIHNhbWVcbiAgICAvLyBmb3JtYXQgYXMgdG9rZW5zIHJldHVybmVkIGZyb20gYHRva2VuaXplcigpLmdldFRva2VuKClgLiBOb3RlXG4gICAgLy8gdGhhdCB5b3UgYXJlIG5vdCBhbGxvd2VkIHRvIGNhbGwgdGhlIHBhcnNlciBmcm9tIHRoZVxuICAgIC8vIGNhbGxiYWNr4oCUdGhhdCB3aWxsIGNvcnJ1cHQgaXRzIGludGVybmFsIHN0YXRlLlxuICAgIG9uVG9rZW46IG51bGwsXG4gICAgLy8gQSBmdW5jdGlvbiBjYW4gYmUgcGFzc2VkIGFzIGBvbkNvbW1lbnRgIG9wdGlvbiwgd2hpY2ggd2lsbFxuICAgIC8vIGNhdXNlIEFjb3JuIHRvIGNhbGwgdGhhdCBmdW5jdGlvbiB3aXRoIGAoYmxvY2ssIHRleHQsIHN0YXJ0LFxuICAgIC8vIGVuZClgIHBhcmFtZXRlcnMgd2hlbmV2ZXIgYSBjb21tZW50IGlzIHNraXBwZWQuIGBibG9ja2AgaXMgYVxuICAgIC8vIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoaXMgaXMgYSBibG9jayAoYC8qICovYCkgY29tbWVudCxcbiAgICAvLyBgdGV4dGAgaXMgdGhlIGNvbnRlbnQgb2YgdGhlIGNvbW1lbnQsIGFuZCBgc3RhcnRgIGFuZCBgZW5kYCBhcmVcbiAgICAvLyBjaGFyYWN0ZXIgb2Zmc2V0cyB0aGF0IGRlbm90ZSB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0aGUgY29tbWVudC5cbiAgICAvLyBXaGVuIHRoZSBgbG9jYXRpb25zYCBvcHRpb24gaXMgb24sIHR3byBtb3JlIHBhcmFtZXRlcnMgYXJlXG4gICAgLy8gcGFzc2VkLCB0aGUgZnVsbCBge2xpbmUsIGNvbHVtbn1gIGxvY2F0aW9ucyBvZiB0aGUgc3RhcnQgYW5kXG4gICAgLy8gZW5kIG9mIHRoZSBjb21tZW50cy4gTm90ZSB0aGF0IHlvdSBhcmUgbm90IGFsbG93ZWQgdG8gY2FsbCB0aGVcbiAgICAvLyBwYXJzZXIgZnJvbSB0aGUgY2FsbGJhY2vigJR0aGF0IHdpbGwgY29ycnVwdCBpdHMgaW50ZXJuYWwgc3RhdGUuXG4gICAgb25Db21tZW50OiBudWxsLFxuICAgIC8vIE5vZGVzIGhhdmUgdGhlaXIgc3RhcnQgYW5kIGVuZCBjaGFyYWN0ZXJzIG9mZnNldHMgcmVjb3JkZWQgaW5cbiAgICAvLyBgc3RhcnRgIGFuZCBgZW5kYCBwcm9wZXJ0aWVzIChkaXJlY3RseSBvbiB0aGUgbm9kZSwgcmF0aGVyIHRoYW5cbiAgICAvLyB0aGUgYGxvY2Agb2JqZWN0LCB3aGljaCBob2xkcyBsaW5lL2NvbHVtbiBkYXRhLiBUbyBhbHNvIGFkZCBhXG4gICAgLy8gW3NlbWktc3RhbmRhcmRpemVkXVtyYW5nZV0gYHJhbmdlYCBwcm9wZXJ0eSBob2xkaW5nIGEgYFtzdGFydCxcbiAgICAvLyBlbmRdYCBhcnJheSB3aXRoIHRoZSBzYW1lIG51bWJlcnMsIHNldCB0aGUgYHJhbmdlc2Agb3B0aW9uIHRvXG4gICAgLy8gYHRydWVgLlxuICAgIC8vXG4gICAgLy8gW3JhbmdlXTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NzQ1Njc4XG4gICAgcmFuZ2VzOiBmYWxzZSxcbiAgICAvLyBJdCBpcyBwb3NzaWJsZSB0byBwYXJzZSBtdWx0aXBsZSBmaWxlcyBpbnRvIGEgc2luZ2xlIEFTVCBieVxuICAgIC8vIHBhc3NpbmcgdGhlIHRyZWUgcHJvZHVjZWQgYnkgcGFyc2luZyB0aGUgZmlyc3QgZmlsZSBhc1xuICAgIC8vIGBwcm9ncmFtYCBvcHRpb24gaW4gc3Vic2VxdWVudCBwYXJzZXMuIFRoaXMgd2lsbCBhZGQgdGhlXG4gICAgLy8gdG9wbGV2ZWwgZm9ybXMgb2YgdGhlIHBhcnNlZCBmaWxlIHRvIHRoZSBgUHJvZ3JhbWAgKHRvcCkgbm9kZVxuICAgIC8vIG9mIGFuIGV4aXN0aW5nIHBhcnNlIHRyZWUuXG4gICAgcHJvZ3JhbTogbnVsbCxcbiAgICAvLyBXaGVuIGBsb2NhdGlvbnNgIGlzIG9uLCB5b3UgY2FuIHBhc3MgdGhpcyB0byByZWNvcmQgdGhlIHNvdXJjZVxuICAgIC8vIGZpbGUgaW4gZXZlcnkgbm9kZSdzIGBsb2NgIG9iamVjdC5cbiAgICBzb3VyY2VGaWxlOiBudWxsLFxuICAgIC8vIFRoaXMgdmFsdWUsIGlmIGdpdmVuLCBpcyBzdG9yZWQgaW4gZXZlcnkgbm9kZSwgd2hldGhlclxuICAgIC8vIGBsb2NhdGlvbnNgIGlzIG9uIG9yIG9mZi5cbiAgICBkaXJlY3RTb3VyY2VGaWxlOiBudWxsLFxuICAgIC8vIFdoZW4gZW5hYmxlZCwgcGFyZW50aGVzaXplZCBleHByZXNzaW9ucyBhcmUgcmVwcmVzZW50ZWQgYnlcbiAgICAvLyAobm9uLXN0YW5kYXJkKSBQYXJlbnRoZXNpemVkRXhwcmVzc2lvbiBub2Rlc1xuICAgIHByZXNlcnZlUGFyZW5zOiBmYWxzZVxuICB9O1xuXG4gIC8vIEludGVycHJldCBhbmQgZGVmYXVsdCBhbiBvcHRpb25zIG9iamVjdFxuXG4gIHZhciB3YXJuZWRBYm91dEVjbWFWZXJzaW9uID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZ2V0T3B0aW9ucyhvcHRzKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB7fTtcblxuICAgIGZvciAodmFyIG9wdCBpbiBkZWZhdWx0T3B0aW9ucylcbiAgICAgIHsgb3B0aW9uc1tvcHRdID0gb3B0cyAmJiBoYXNPd24ob3B0cywgb3B0KSA/IG9wdHNbb3B0XSA6IGRlZmF1bHRPcHRpb25zW29wdF07IH1cblxuICAgIGlmIChvcHRpb25zLmVjbWFWZXJzaW9uID09PSBcImxhdGVzdFwiKSB7XG4gICAgICBvcHRpb25zLmVjbWFWZXJzaW9uID0gMWU4O1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5lY21hVmVyc2lvbiA9PSBudWxsKSB7XG4gICAgICBpZiAoIXdhcm5lZEFib3V0RWNtYVZlcnNpb24gJiYgdHlwZW9mIGNvbnNvbGUgPT09IFwib2JqZWN0XCIgJiYgY29uc29sZS53YXJuKSB7XG4gICAgICAgIHdhcm5lZEFib3V0RWNtYVZlcnNpb24gPSB0cnVlO1xuICAgICAgICBjb25zb2xlLndhcm4oXCJTaW5jZSBBY29ybiA4LjAuMCwgb3B0aW9ucy5lY21hVmVyc2lvbiBpcyByZXF1aXJlZC5cXG5EZWZhdWx0aW5nIHRvIDIwMjAsIGJ1dCB0aGlzIHdpbGwgc3RvcCB3b3JraW5nIGluIHRoZSBmdXR1cmUuXCIpO1xuICAgICAgfVxuICAgICAgb3B0aW9ucy5lY21hVmVyc2lvbiA9IDExO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5lY21hVmVyc2lvbiA+PSAyMDE1KSB7XG4gICAgICBvcHRpb25zLmVjbWFWZXJzaW9uIC09IDIwMDk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuYWxsb3dSZXNlcnZlZCA9PSBudWxsKVxuICAgICAgeyBvcHRpb25zLmFsbG93UmVzZXJ2ZWQgPSBvcHRpb25zLmVjbWFWZXJzaW9uIDwgNTsgfVxuXG4gICAgaWYgKCFvcHRzIHx8IG9wdHMuYWxsb3dIYXNoQmFuZyA9PSBudWxsKVxuICAgICAgeyBvcHRpb25zLmFsbG93SGFzaEJhbmcgPSBvcHRpb25zLmVjbWFWZXJzaW9uID49IDE0OyB9XG5cbiAgICBpZiAoaXNBcnJheShvcHRpb25zLm9uVG9rZW4pKSB7XG4gICAgICB2YXIgdG9rZW5zID0gb3B0aW9ucy5vblRva2VuO1xuICAgICAgb3B0aW9ucy5vblRva2VuID0gZnVuY3Rpb24gKHRva2VuKSB7IHJldHVybiB0b2tlbnMucHVzaCh0b2tlbik7IH07XG4gICAgfVxuICAgIGlmIChpc0FycmF5KG9wdGlvbnMub25Db21tZW50KSlcbiAgICAgIHsgb3B0aW9ucy5vbkNvbW1lbnQgPSBwdXNoQ29tbWVudChvcHRpb25zLCBvcHRpb25zLm9uQ29tbWVudCk7IH1cblxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICBmdW5jdGlvbiBwdXNoQ29tbWVudChvcHRpb25zLCBhcnJheSkge1xuICAgIHJldHVybiBmdW5jdGlvbihibG9jaywgdGV4dCwgc3RhcnQsIGVuZCwgc3RhcnRMb2MsIGVuZExvYykge1xuICAgICAgdmFyIGNvbW1lbnQgPSB7XG4gICAgICAgIHR5cGU6IGJsb2NrID8gXCJCbG9ja1wiIDogXCJMaW5lXCIsXG4gICAgICAgIHZhbHVlOiB0ZXh0LFxuICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgIGVuZDogZW5kXG4gICAgICB9O1xuICAgICAgaWYgKG9wdGlvbnMubG9jYXRpb25zKVxuICAgICAgICB7IGNvbW1lbnQubG9jID0gbmV3IFNvdXJjZUxvY2F0aW9uKHRoaXMsIHN0YXJ0TG9jLCBlbmRMb2MpOyB9XG4gICAgICBpZiAob3B0aW9ucy5yYW5nZXMpXG4gICAgICAgIHsgY29tbWVudC5yYW5nZSA9IFtzdGFydCwgZW5kXTsgfVxuICAgICAgYXJyYXkucHVzaChjb21tZW50KTtcbiAgICB9XG4gIH1cblxuICAvLyBFYWNoIHNjb3BlIGdldHMgYSBiaXRzZXQgdGhhdCBtYXkgY29udGFpbiB0aGVzZSBmbGFnc1xuICB2YXJcbiAgICAgIFNDT1BFX1RPUCA9IDEsXG4gICAgICBTQ09QRV9GVU5DVElPTiA9IDIsXG4gICAgICBTQ09QRV9BU1lOQyA9IDQsXG4gICAgICBTQ09QRV9HRU5FUkFUT1IgPSA4LFxuICAgICAgU0NPUEVfQVJST1cgPSAxNixcbiAgICAgIFNDT1BFX1NJTVBMRV9DQVRDSCA9IDMyLFxuICAgICAgU0NPUEVfU1VQRVIgPSA2NCxcbiAgICAgIFNDT1BFX0RJUkVDVF9TVVBFUiA9IDEyOCxcbiAgICAgIFNDT1BFX0NMQVNTX1NUQVRJQ19CTE9DSyA9IDI1NixcbiAgICAgIFNDT1BFX1ZBUiA9IFNDT1BFX1RPUCB8IFNDT1BFX0ZVTkNUSU9OIHwgU0NPUEVfQ0xBU1NfU1RBVElDX0JMT0NLO1xuXG4gIGZ1bmN0aW9uIGZ1bmN0aW9uRmxhZ3MoYXN5bmMsIGdlbmVyYXRvcikge1xuICAgIHJldHVybiBTQ09QRV9GVU5DVElPTiB8IChhc3luYyA/IFNDT1BFX0FTWU5DIDogMCkgfCAoZ2VuZXJhdG9yID8gU0NPUEVfR0VORVJBVE9SIDogMClcbiAgfVxuXG4gIC8vIFVzZWQgaW4gY2hlY2tMVmFsKiBhbmQgZGVjbGFyZU5hbWUgdG8gZGV0ZXJtaW5lIHRoZSB0eXBlIG9mIGEgYmluZGluZ1xuICB2YXJcbiAgICAgIEJJTkRfTk9ORSA9IDAsIC8vIE5vdCBhIGJpbmRpbmdcbiAgICAgIEJJTkRfVkFSID0gMSwgLy8gVmFyLXN0eWxlIGJpbmRpbmdcbiAgICAgIEJJTkRfTEVYSUNBTCA9IDIsIC8vIExldC0gb3IgY29uc3Qtc3R5bGUgYmluZGluZ1xuICAgICAgQklORF9GVU5DVElPTiA9IDMsIC8vIEZ1bmN0aW9uIGRlY2xhcmF0aW9uXG4gICAgICBCSU5EX1NJTVBMRV9DQVRDSCA9IDQsIC8vIFNpbXBsZSAoaWRlbnRpZmllciBwYXR0ZXJuKSBjYXRjaCBiaW5kaW5nXG4gICAgICBCSU5EX09VVFNJREUgPSA1OyAvLyBTcGVjaWFsIGNhc2UgZm9yIGZ1bmN0aW9uIG5hbWVzIGFzIGJvdW5kIGluc2lkZSB0aGUgZnVuY3Rpb25cblxuICB2YXIgUGFyc2VyID0gZnVuY3Rpb24gUGFyc2VyKG9wdGlvbnMsIGlucHV0LCBzdGFydFBvcykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgPSBnZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHRoaXMuc291cmNlRmlsZSA9IG9wdGlvbnMuc291cmNlRmlsZTtcbiAgICB0aGlzLmtleXdvcmRzID0gd29yZHNSZWdleHAoa2V5d29yZHMkMVtvcHRpb25zLmVjbWFWZXJzaW9uID49IDYgPyA2IDogb3B0aW9ucy5zb3VyY2VUeXBlID09PSBcIm1vZHVsZVwiID8gXCI1bW9kdWxlXCIgOiA1XSk7XG4gICAgdmFyIHJlc2VydmVkID0gXCJcIjtcbiAgICBpZiAob3B0aW9ucy5hbGxvd1Jlc2VydmVkICE9PSB0cnVlKSB7XG4gICAgICByZXNlcnZlZCA9IHJlc2VydmVkV29yZHNbb3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2ID8gNiA6IG9wdGlvbnMuZWNtYVZlcnNpb24gPT09IDUgPyA1IDogM107XG4gICAgICBpZiAob3B0aW9ucy5zb3VyY2VUeXBlID09PSBcIm1vZHVsZVwiKSB7IHJlc2VydmVkICs9IFwiIGF3YWl0XCI7IH1cbiAgICB9XG4gICAgdGhpcy5yZXNlcnZlZFdvcmRzID0gd29yZHNSZWdleHAocmVzZXJ2ZWQpO1xuICAgIHZhciByZXNlcnZlZFN0cmljdCA9IChyZXNlcnZlZCA/IHJlc2VydmVkICsgXCIgXCIgOiBcIlwiKSArIHJlc2VydmVkV29yZHMuc3RyaWN0O1xuICAgIHRoaXMucmVzZXJ2ZWRXb3Jkc1N0cmljdCA9IHdvcmRzUmVnZXhwKHJlc2VydmVkU3RyaWN0KTtcbiAgICB0aGlzLnJlc2VydmVkV29yZHNTdHJpY3RCaW5kID0gd29yZHNSZWdleHAocmVzZXJ2ZWRTdHJpY3QgKyBcIiBcIiArIHJlc2VydmVkV29yZHMuc3RyaWN0QmluZCk7XG4gICAgdGhpcy5pbnB1dCA9IFN0cmluZyhpbnB1dCk7XG5cbiAgICAvLyBVc2VkIHRvIHNpZ25hbCB0byBjYWxsZXJzIG9mIGByZWFkV29yZDFgIHdoZXRoZXIgdGhlIHdvcmRcbiAgICAvLyBjb250YWluZWQgYW55IGVzY2FwZSBzZXF1ZW5jZXMuIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2Ugd29yZHMgd2l0aFxuICAgIC8vIGVzY2FwZSBzZXF1ZW5jZXMgbXVzdCBub3QgYmUgaW50ZXJwcmV0ZWQgYXMga2V5d29yZHMuXG4gICAgdGhpcy5jb250YWluc0VzYyA9IGZhbHNlO1xuXG4gICAgLy8gU2V0IHVwIHRva2VuIHN0YXRlXG5cbiAgICAvLyBUaGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgdG9rZW5pemVyIGluIHRoZSBpbnB1dC5cbiAgICBpZiAoc3RhcnRQb3MpIHtcbiAgICAgIHRoaXMucG9zID0gc3RhcnRQb3M7XG4gICAgICB0aGlzLmxpbmVTdGFydCA9IHRoaXMuaW5wdXQubGFzdEluZGV4T2YoXCJcXG5cIiwgc3RhcnRQb3MgLSAxKSArIDE7XG4gICAgICB0aGlzLmN1ckxpbmUgPSB0aGlzLmlucHV0LnNsaWNlKDAsIHRoaXMubGluZVN0YXJ0KS5zcGxpdChsaW5lQnJlYWspLmxlbmd0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wb3MgPSB0aGlzLmxpbmVTdGFydCA9IDA7XG4gICAgICB0aGlzLmN1ckxpbmUgPSAxO1xuICAgIH1cblxuICAgIC8vIFByb3BlcnRpZXMgb2YgdGhlIGN1cnJlbnQgdG9rZW46XG4gICAgLy8gSXRzIHR5cGVcbiAgICB0aGlzLnR5cGUgPSB0eXBlcyQxLmVvZjtcbiAgICAvLyBGb3IgdG9rZW5zIHRoYXQgaW5jbHVkZSBtb3JlIGluZm9ybWF0aW9uIHRoYW4gdGhlaXIgdHlwZSwgdGhlIHZhbHVlXG4gICAgdGhpcy52YWx1ZSA9IG51bGw7XG4gICAgLy8gSXRzIHN0YXJ0IGFuZCBlbmQgb2Zmc2V0XG4gICAgdGhpcy5zdGFydCA9IHRoaXMuZW5kID0gdGhpcy5wb3M7XG4gICAgLy8gQW5kLCBpZiBsb2NhdGlvbnMgYXJlIHVzZWQsIHRoZSB7bGluZSwgY29sdW1ufSBvYmplY3RcbiAgICAvLyBjb3JyZXNwb25kaW5nIHRvIHRob3NlIG9mZnNldHNcbiAgICB0aGlzLnN0YXJ0TG9jID0gdGhpcy5lbmRMb2MgPSB0aGlzLmN1clBvc2l0aW9uKCk7XG5cbiAgICAvLyBQb3NpdGlvbiBpbmZvcm1hdGlvbiBmb3IgdGhlIHByZXZpb3VzIHRva2VuXG4gICAgdGhpcy5sYXN0VG9rRW5kTG9jID0gdGhpcy5sYXN0VG9rU3RhcnRMb2MgPSBudWxsO1xuICAgIHRoaXMubGFzdFRva1N0YXJ0ID0gdGhpcy5sYXN0VG9rRW5kID0gdGhpcy5wb3M7XG5cbiAgICAvLyBUaGUgY29udGV4dCBzdGFjayBpcyB1c2VkIHRvIHN1cGVyZmljaWFsbHkgdHJhY2sgc3ludGFjdGljXG4gICAgLy8gY29udGV4dCB0byBwcmVkaWN0IHdoZXRoZXIgYSByZWd1bGFyIGV4cHJlc3Npb24gaXMgYWxsb3dlZCBpbiBhXG4gICAgLy8gZ2l2ZW4gcG9zaXRpb24uXG4gICAgdGhpcy5jb250ZXh0ID0gdGhpcy5pbml0aWFsQ29udGV4dCgpO1xuICAgIHRoaXMuZXhwckFsbG93ZWQgPSB0cnVlO1xuXG4gICAgLy8gRmlndXJlIG91dCBpZiBpdCdzIGEgbW9kdWxlIGNvZGUuXG4gICAgdGhpcy5pbk1vZHVsZSA9IG9wdGlvbnMuc291cmNlVHlwZSA9PT0gXCJtb2R1bGVcIjtcbiAgICB0aGlzLnN0cmljdCA9IHRoaXMuaW5Nb2R1bGUgfHwgdGhpcy5zdHJpY3REaXJlY3RpdmUodGhpcy5wb3MpO1xuXG4gICAgLy8gVXNlZCB0byBzaWduaWZ5IHRoZSBzdGFydCBvZiBhIHBvdGVudGlhbCBhcnJvdyBmdW5jdGlvblxuICAgIHRoaXMucG90ZW50aWFsQXJyb3dBdCA9IC0xO1xuICAgIHRoaXMucG90ZW50aWFsQXJyb3dJbkZvckF3YWl0ID0gZmFsc2U7XG5cbiAgICAvLyBQb3NpdGlvbnMgdG8gZGVsYXllZC1jaGVjayB0aGF0IHlpZWxkL2F3YWl0IGRvZXMgbm90IGV4aXN0IGluIGRlZmF1bHQgcGFyYW1ldGVycy5cbiAgICB0aGlzLnlpZWxkUG9zID0gdGhpcy5hd2FpdFBvcyA9IHRoaXMuYXdhaXRJZGVudFBvcyA9IDA7XG4gICAgLy8gTGFiZWxzIGluIHNjb3BlLlxuICAgIHRoaXMubGFiZWxzID0gW107XG4gICAgLy8gVGh1cy1mYXIgdW5kZWZpbmVkIGV4cG9ydHMuXG4gICAgdGhpcy51bmRlZmluZWRFeHBvcnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgIC8vIElmIGVuYWJsZWQsIHNraXAgbGVhZGluZyBoYXNoYmFuZyBsaW5lLlxuICAgIGlmICh0aGlzLnBvcyA9PT0gMCAmJiBvcHRpb25zLmFsbG93SGFzaEJhbmcgJiYgdGhpcy5pbnB1dC5zbGljZSgwLCAyKSA9PT0gXCIjIVwiKVxuICAgICAgeyB0aGlzLnNraXBMaW5lQ29tbWVudCgyKTsgfVxuXG4gICAgLy8gU2NvcGUgdHJhY2tpbmcgZm9yIGR1cGxpY2F0ZSB2YXJpYWJsZSBuYW1lcyAoc2VlIHNjb3BlLmpzKVxuICAgIHRoaXMuc2NvcGVTdGFjayA9IFtdO1xuICAgIHRoaXMuZW50ZXJTY29wZShTQ09QRV9UT1ApO1xuXG4gICAgLy8gRm9yIFJlZ0V4cCB2YWxpZGF0aW9uXG4gICAgdGhpcy5yZWdleHBTdGF0ZSA9IG51bGw7XG5cbiAgICAvLyBUaGUgc3RhY2sgb2YgcHJpdmF0ZSBuYW1lcy5cbiAgICAvLyBFYWNoIGVsZW1lbnQgaGFzIHR3byBwcm9wZXJ0aWVzOiAnZGVjbGFyZWQnIGFuZCAndXNlZCcuXG4gICAgLy8gV2hlbiBpdCBleGl0ZWQgZnJvbSB0aGUgb3V0ZXJtb3N0IGNsYXNzIGRlZmluaXRpb24sIGFsbCB1c2VkIHByaXZhdGUgbmFtZXMgbXVzdCBiZSBkZWNsYXJlZC5cbiAgICB0aGlzLnByaXZhdGVOYW1lU3RhY2sgPSBbXTtcbiAgfTtcblxuICB2YXIgcHJvdG90eXBlQWNjZXNzb3JzID0geyBpbkZ1bmN0aW9uOiB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSB9LGluR2VuZXJhdG9yOiB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSB9LGluQXN5bmM6IHsgY29uZmlndXJhYmxlOiB0cnVlIH0sY2FuQXdhaXQ6IHsgY29uZmlndXJhYmxlOiB0cnVlIH0sYWxsb3dTdXBlcjogeyBjb25maWd1cmFibGU6IHRydWUgfSxhbGxvd0RpcmVjdFN1cGVyOiB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSB9LHRyZWF0RnVuY3Rpb25zQXNWYXI6IHsgY29uZmlndXJhYmxlOiB0cnVlIH0sYWxsb3dOZXdEb3RUYXJnZXQ6IHsgY29uZmlndXJhYmxlOiB0cnVlIH0saW5DbGFzc1N0YXRpY0Jsb2NrOiB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH07XG5cbiAgUGFyc2VyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uIHBhcnNlICgpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMub3B0aW9ucy5wcm9ncmFtIHx8IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgdGhpcy5uZXh0VG9rZW4oKTtcbiAgICByZXR1cm4gdGhpcy5wYXJzZVRvcExldmVsKG5vZGUpXG4gIH07XG5cbiAgcHJvdG90eXBlQWNjZXNzb3JzLmluRnVuY3Rpb24uZ2V0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gKHRoaXMuY3VycmVudFZhclNjb3BlKCkuZmxhZ3MgJiBTQ09QRV9GVU5DVElPTikgPiAwIH07XG5cbiAgcHJvdG90eXBlQWNjZXNzb3JzLmluR2VuZXJhdG9yLmdldCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICh0aGlzLmN1cnJlbnRWYXJTY29wZSgpLmZsYWdzICYgU0NPUEVfR0VORVJBVE9SKSA+IDAgJiYgIXRoaXMuY3VycmVudFZhclNjb3BlKCkuaW5DbGFzc0ZpZWxkSW5pdCB9O1xuXG4gIHByb3RvdHlwZUFjY2Vzc29ycy5pbkFzeW5jLmdldCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICh0aGlzLmN1cnJlbnRWYXJTY29wZSgpLmZsYWdzICYgU0NPUEVfQVNZTkMpID4gMCAmJiAhdGhpcy5jdXJyZW50VmFyU2NvcGUoKS5pbkNsYXNzRmllbGRJbml0IH07XG5cbiAgcHJvdG90eXBlQWNjZXNzb3JzLmNhbkF3YWl0LmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5zY29wZVN0YWNrLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2tbaV07XG4gICAgICBpZiAoc2NvcGUuaW5DbGFzc0ZpZWxkSW5pdCB8fCBzY29wZS5mbGFncyAmIFNDT1BFX0NMQVNTX1NUQVRJQ19CTE9DSykgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgaWYgKHNjb3BlLmZsYWdzICYgU0NPUEVfRlVOQ1RJT04pIHsgcmV0dXJuIChzY29wZS5mbGFncyAmIFNDT1BFX0FTWU5DKSA+IDAgfVxuICAgIH1cbiAgICByZXR1cm4gKHRoaXMuaW5Nb2R1bGUgJiYgdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDEzKSB8fCB0aGlzLm9wdGlvbnMuYWxsb3dBd2FpdE91dHNpZGVGdW5jdGlvblxuICB9O1xuXG4gIHByb3RvdHlwZUFjY2Vzc29ycy5hbGxvd1N1cGVyLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVmID0gdGhpcy5jdXJyZW50VGhpc1Njb3BlKCk7XG4gICAgICB2YXIgZmxhZ3MgPSByZWYuZmxhZ3M7XG4gICAgICB2YXIgaW5DbGFzc0ZpZWxkSW5pdCA9IHJlZi5pbkNsYXNzRmllbGRJbml0O1xuICAgIHJldHVybiAoZmxhZ3MgJiBTQ09QRV9TVVBFUikgPiAwIHx8IGluQ2xhc3NGaWVsZEluaXQgfHwgdGhpcy5vcHRpb25zLmFsbG93U3VwZXJPdXRzaWRlTWV0aG9kXG4gIH07XG5cbiAgcHJvdG90eXBlQWNjZXNzb3JzLmFsbG93RGlyZWN0U3VwZXIuZ2V0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gKHRoaXMuY3VycmVudFRoaXNTY29wZSgpLmZsYWdzICYgU0NPUEVfRElSRUNUX1NVUEVSKSA+IDAgfTtcblxuICBwcm90b3R5cGVBY2Nlc3NvcnMudHJlYXRGdW5jdGlvbnNBc1Zhci5nZXQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnRyZWF0RnVuY3Rpb25zQXNWYXJJblNjb3BlKHRoaXMuY3VycmVudFNjb3BlKCkpIH07XG5cbiAgcHJvdG90eXBlQWNjZXNzb3JzLmFsbG93TmV3RG90VGFyZ2V0LmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVmID0gdGhpcy5jdXJyZW50VGhpc1Njb3BlKCk7XG4gICAgICB2YXIgZmxhZ3MgPSByZWYuZmxhZ3M7XG4gICAgICB2YXIgaW5DbGFzc0ZpZWxkSW5pdCA9IHJlZi5pbkNsYXNzRmllbGRJbml0O1xuICAgIHJldHVybiAoZmxhZ3MgJiAoU0NPUEVfRlVOQ1RJT04gfCBTQ09QRV9DTEFTU19TVEFUSUNfQkxPQ0spKSA+IDAgfHwgaW5DbGFzc0ZpZWxkSW5pdFxuICB9O1xuXG4gIHByb3RvdHlwZUFjY2Vzc29ycy5pbkNsYXNzU3RhdGljQmxvY2suZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcy5jdXJyZW50VmFyU2NvcGUoKS5mbGFncyAmIFNDT1BFX0NMQVNTX1NUQVRJQ19CTE9DSykgPiAwXG4gIH07XG5cbiAgUGFyc2VyLmV4dGVuZCA9IGZ1bmN0aW9uIGV4dGVuZCAoKSB7XG4gICAgICB2YXIgcGx1Z2lucyA9IFtdLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgd2hpbGUgKCBsZW4tLSApIHBsdWdpbnNbIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gXTtcblxuICAgIHZhciBjbHMgPSB0aGlzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGx1Z2lucy5sZW5ndGg7IGkrKykgeyBjbHMgPSBwbHVnaW5zW2ldKGNscyk7IH1cbiAgICByZXR1cm4gY2xzXG4gIH07XG5cbiAgUGFyc2VyLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UgKGlucHV0LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG9wdGlvbnMsIGlucHV0KS5wYXJzZSgpXG4gIH07XG5cbiAgUGFyc2VyLnBhcnNlRXhwcmVzc2lvbkF0ID0gZnVuY3Rpb24gcGFyc2VFeHByZXNzaW9uQXQgKGlucHV0LCBwb3MsIG9wdGlvbnMpIHtcbiAgICB2YXIgcGFyc2VyID0gbmV3IHRoaXMob3B0aW9ucywgaW5wdXQsIHBvcyk7XG4gICAgcGFyc2VyLm5leHRUb2tlbigpO1xuICAgIHJldHVybiBwYXJzZXIucGFyc2VFeHByZXNzaW9uKClcbiAgfTtcblxuICBQYXJzZXIudG9rZW5pemVyID0gZnVuY3Rpb24gdG9rZW5pemVyIChpbnB1dCwgb3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgdGhpcyhvcHRpb25zLCBpbnB1dClcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyggUGFyc2VyLnByb3RvdHlwZSwgcHJvdG90eXBlQWNjZXNzb3JzICk7XG5cbiAgdmFyIHBwJDkgPSBQYXJzZXIucHJvdG90eXBlO1xuXG4gIC8vICMjIFBhcnNlciB1dGlsaXRpZXNcblxuICB2YXIgbGl0ZXJhbCA9IC9eKD86JygoPzpcXFxcLnxbXidcXFxcXSkqPyknfFwiKCg/OlxcXFwufFteXCJcXFxcXSkqPylcIikvO1xuICBwcCQ5LnN0cmljdERpcmVjdGl2ZSA9IGZ1bmN0aW9uKHN0YXJ0KSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA8IDUpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICBmb3IgKDs7KSB7XG4gICAgICAvLyBUcnkgdG8gZmluZCBzdHJpbmcgbGl0ZXJhbC5cbiAgICAgIHNraXBXaGl0ZVNwYWNlLmxhc3RJbmRleCA9IHN0YXJ0O1xuICAgICAgc3RhcnQgKz0gc2tpcFdoaXRlU3BhY2UuZXhlYyh0aGlzLmlucHV0KVswXS5sZW5ndGg7XG4gICAgICB2YXIgbWF0Y2ggPSBsaXRlcmFsLmV4ZWModGhpcy5pbnB1dC5zbGljZShzdGFydCkpO1xuICAgICAgaWYgKCFtYXRjaCkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgaWYgKChtYXRjaFsxXSB8fCBtYXRjaFsyXSkgPT09IFwidXNlIHN0cmljdFwiKSB7XG4gICAgICAgIHNraXBXaGl0ZVNwYWNlLmxhc3RJbmRleCA9IHN0YXJ0ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgICB2YXIgc3BhY2VBZnRlciA9IHNraXBXaGl0ZVNwYWNlLmV4ZWModGhpcy5pbnB1dCksIGVuZCA9IHNwYWNlQWZ0ZXIuaW5kZXggKyBzcGFjZUFmdGVyWzBdLmxlbmd0aDtcbiAgICAgICAgdmFyIG5leHQgPSB0aGlzLmlucHV0LmNoYXJBdChlbmQpO1xuICAgICAgICByZXR1cm4gbmV4dCA9PT0gXCI7XCIgfHwgbmV4dCA9PT0gXCJ9XCIgfHxcbiAgICAgICAgICAobGluZUJyZWFrLnRlc3Qoc3BhY2VBZnRlclswXSkgJiZcbiAgICAgICAgICAgISgvWyhgLlsrXFwtLyolPD49LD9eJl0vLnRlc3QobmV4dCkgfHwgbmV4dCA9PT0gXCIhXCIgJiYgdGhpcy5pbnB1dC5jaGFyQXQoZW5kICsgMSkgPT09IFwiPVwiKSlcbiAgICAgIH1cbiAgICAgIHN0YXJ0ICs9IG1hdGNoWzBdLmxlbmd0aDtcblxuICAgICAgLy8gU2tpcCBzZW1pY29sb24sIGlmIGFueS5cbiAgICAgIHNraXBXaGl0ZVNwYWNlLmxhc3RJbmRleCA9IHN0YXJ0O1xuICAgICAgc3RhcnQgKz0gc2tpcFdoaXRlU3BhY2UuZXhlYyh0aGlzLmlucHV0KVswXS5sZW5ndGg7XG4gICAgICBpZiAodGhpcy5pbnB1dFtzdGFydF0gPT09IFwiO1wiKVxuICAgICAgICB7IHN0YXJ0Kys7IH1cbiAgICB9XG4gIH07XG5cbiAgLy8gUHJlZGljYXRlIHRoYXQgdGVzdHMgd2hldGhlciB0aGUgbmV4dCB0b2tlbiBpcyBvZiB0aGUgZ2l2ZW5cbiAgLy8gdHlwZSwgYW5kIGlmIHllcywgY29uc3VtZXMgaXQgYXMgYSBzaWRlIGVmZmVjdC5cblxuICBwcCQ5LmVhdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlKSB7XG4gICAgICB0aGlzLm5leHQoKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfTtcblxuICAvLyBUZXN0cyB3aGV0aGVyIHBhcnNlZCB0b2tlbiBpcyBhIGNvbnRleHR1YWwga2V5d29yZC5cblxuICBwcCQ5LmlzQ29udGV4dHVhbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy50eXBlID09PSB0eXBlcyQxLm5hbWUgJiYgdGhpcy52YWx1ZSA9PT0gbmFtZSAmJiAhdGhpcy5jb250YWluc0VzY1xuICB9O1xuXG4gIC8vIENvbnN1bWVzIGNvbnRleHR1YWwga2V5d29yZCBpZiBwb3NzaWJsZS5cblxuICBwcCQ5LmVhdENvbnRleHR1YWwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgaWYgKCF0aGlzLmlzQ29udGV4dHVhbChuYW1lKSkgeyByZXR1cm4gZmFsc2UgfVxuICAgIHRoaXMubmV4dCgpO1xuICAgIHJldHVybiB0cnVlXG4gIH07XG5cbiAgLy8gQXNzZXJ0cyB0aGF0IGZvbGxvd2luZyB0b2tlbiBpcyBnaXZlbiBjb250ZXh0dWFsIGtleXdvcmQuXG5cbiAgcHAkOS5leHBlY3RDb250ZXh0dWFsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGlmICghdGhpcy5lYXRDb250ZXh0dWFsKG5hbWUpKSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gIH07XG5cbiAgLy8gVGVzdCB3aGV0aGVyIGEgc2VtaWNvbG9uIGNhbiBiZSBpbnNlcnRlZCBhdCB0aGUgY3VycmVudCBwb3NpdGlvbi5cblxuICBwcCQ5LmNhbkluc2VydFNlbWljb2xvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnR5cGUgPT09IHR5cGVzJDEuZW9mIHx8XG4gICAgICB0aGlzLnR5cGUgPT09IHR5cGVzJDEuYnJhY2VSIHx8XG4gICAgICBsaW5lQnJlYWsudGVzdCh0aGlzLmlucHV0LnNsaWNlKHRoaXMubGFzdFRva0VuZCwgdGhpcy5zdGFydCkpXG4gIH07XG5cbiAgcHAkOS5pbnNlcnRTZW1pY29sb24gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5jYW5JbnNlcnRTZW1pY29sb24oKSkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5vbkluc2VydGVkU2VtaWNvbG9uKVxuICAgICAgICB7IHRoaXMub3B0aW9ucy5vbkluc2VydGVkU2VtaWNvbG9uKHRoaXMubGFzdFRva0VuZCwgdGhpcy5sYXN0VG9rRW5kTG9jKTsgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH07XG5cbiAgLy8gQ29uc3VtZSBhIHNlbWljb2xvbiwgb3IsIGZhaWxpbmcgdGhhdCwgc2VlIGlmIHdlIGFyZSBhbGxvd2VkIHRvXG4gIC8vIHByZXRlbmQgdGhhdCB0aGVyZSBpcyBhIHNlbWljb2xvbiBhdCB0aGlzIHBvc2l0aW9uLlxuXG4gIHBwJDkuc2VtaWNvbG9uID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLmVhdCh0eXBlcyQxLnNlbWkpICYmICF0aGlzLmluc2VydFNlbWljb2xvbigpKSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gIH07XG5cbiAgcHAkOS5hZnRlclRyYWlsaW5nQ29tbWEgPSBmdW5jdGlvbih0b2tUeXBlLCBub3ROZXh0KSB7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gdG9rVHlwZSkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5vblRyYWlsaW5nQ29tbWEpXG4gICAgICAgIHsgdGhpcy5vcHRpb25zLm9uVHJhaWxpbmdDb21tYSh0aGlzLmxhc3RUb2tTdGFydCwgdGhpcy5sYXN0VG9rU3RhcnRMb2MpOyB9XG4gICAgICBpZiAoIW5vdE5leHQpXG4gICAgICAgIHsgdGhpcy5uZXh0KCk7IH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9O1xuXG4gIC8vIEV4cGVjdCBhIHRva2VuIG9mIGEgZ2l2ZW4gdHlwZS4gSWYgZm91bmQsIGNvbnN1bWUgaXQsIG90aGVyd2lzZSxcbiAgLy8gcmFpc2UgYW4gdW5leHBlY3RlZCB0b2tlbiBlcnJvci5cblxuICBwcCQ5LmV4cGVjdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB0aGlzLmVhdCh0eXBlKSB8fCB0aGlzLnVuZXhwZWN0ZWQoKTtcbiAgfTtcblxuICAvLyBSYWlzZSBhbiB1bmV4cGVjdGVkIHRva2VuIGVycm9yLlxuXG4gIHBwJDkudW5leHBlY3RlZCA9IGZ1bmN0aW9uKHBvcykge1xuICAgIHRoaXMucmFpc2UocG9zICE9IG51bGwgPyBwb3MgOiB0aGlzLnN0YXJ0LCBcIlVuZXhwZWN0ZWQgdG9rZW5cIik7XG4gIH07XG5cbiAgdmFyIERlc3RydWN0dXJpbmdFcnJvcnMgPSBmdW5jdGlvbiBEZXN0cnVjdHVyaW5nRXJyb3JzKCkge1xuICAgIHRoaXMuc2hvcnRoYW5kQXNzaWduID1cbiAgICB0aGlzLnRyYWlsaW5nQ29tbWEgPVxuICAgIHRoaXMucGFyZW50aGVzaXplZEFzc2lnbiA9XG4gICAgdGhpcy5wYXJlbnRoZXNpemVkQmluZCA9XG4gICAgdGhpcy5kb3VibGVQcm90byA9XG4gICAgICAtMTtcbiAgfTtcblxuICBwcCQ5LmNoZWNrUGF0dGVybkVycm9ycyA9IGZ1bmN0aW9uKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIGlzQXNzaWduKSB7XG4gICAgaWYgKCFyZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSB7IHJldHVybiB9XG4gICAgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMudHJhaWxpbmdDb21tYSA+IC0xKVxuICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy50cmFpbGluZ0NvbW1hLCBcIkNvbW1hIGlzIG5vdCBwZXJtaXR0ZWQgYWZ0ZXIgdGhlIHJlc3QgZWxlbWVudFwiKTsgfVxuICAgIHZhciBwYXJlbnMgPSBpc0Fzc2lnbiA/IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMucGFyZW50aGVzaXplZEFzc2lnbiA6IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMucGFyZW50aGVzaXplZEJpbmQ7XG4gICAgaWYgKHBhcmVucyA+IC0xKSB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShwYXJlbnMsIGlzQXNzaWduID8gXCJBc3NpZ25pbmcgdG8gcnZhbHVlXCIgOiBcIlBhcmVudGhlc2l6ZWQgcGF0dGVyblwiKTsgfVxuICB9O1xuXG4gIHBwJDkuY2hlY2tFeHByZXNzaW9uRXJyb3JzID0gZnVuY3Rpb24ocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycywgYW5kVGhyb3cpIHtcbiAgICBpZiAoIXJlZkRlc3RydWN0dXJpbmdFcnJvcnMpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICB2YXIgc2hvcnRoYW5kQXNzaWduID0gcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5zaG9ydGhhbmRBc3NpZ247XG4gICAgdmFyIGRvdWJsZVByb3RvID0gcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5kb3VibGVQcm90bztcbiAgICBpZiAoIWFuZFRocm93KSB7IHJldHVybiBzaG9ydGhhbmRBc3NpZ24gPj0gMCB8fCBkb3VibGVQcm90byA+PSAwIH1cbiAgICBpZiAoc2hvcnRoYW5kQXNzaWduID49IDApXG4gICAgICB7IHRoaXMucmFpc2Uoc2hvcnRoYW5kQXNzaWduLCBcIlNob3J0aGFuZCBwcm9wZXJ0eSBhc3NpZ25tZW50cyBhcmUgdmFsaWQgb25seSBpbiBkZXN0cnVjdHVyaW5nIHBhdHRlcm5zXCIpOyB9XG4gICAgaWYgKGRvdWJsZVByb3RvID49IDApXG4gICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShkb3VibGVQcm90bywgXCJSZWRlZmluaXRpb24gb2YgX19wcm90b19fIHByb3BlcnR5XCIpOyB9XG4gIH07XG5cbiAgcHAkOS5jaGVja1lpZWxkQXdhaXRJbkRlZmF1bHRQYXJhbXMgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy55aWVsZFBvcyAmJiAoIXRoaXMuYXdhaXRQb3MgfHwgdGhpcy55aWVsZFBvcyA8IHRoaXMuYXdhaXRQb3MpKVxuICAgICAgeyB0aGlzLnJhaXNlKHRoaXMueWllbGRQb3MsIFwiWWllbGQgZXhwcmVzc2lvbiBjYW5ub3QgYmUgYSBkZWZhdWx0IHZhbHVlXCIpOyB9XG4gICAgaWYgKHRoaXMuYXdhaXRQb3MpXG4gICAgICB7IHRoaXMucmFpc2UodGhpcy5hd2FpdFBvcywgXCJBd2FpdCBleHByZXNzaW9uIGNhbm5vdCBiZSBhIGRlZmF1bHQgdmFsdWVcIik7IH1cbiAgfTtcblxuICBwcCQ5LmlzU2ltcGxlQXNzaWduVGFyZ2V0ID0gZnVuY3Rpb24oZXhwcikge1xuICAgIGlmIChleHByLnR5cGUgPT09IFwiUGFyZW50aGVzaXplZEV4cHJlc3Npb25cIilcbiAgICAgIHsgcmV0dXJuIHRoaXMuaXNTaW1wbGVBc3NpZ25UYXJnZXQoZXhwci5leHByZXNzaW9uKSB9XG4gICAgcmV0dXJuIGV4cHIudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgfHwgZXhwci50eXBlID09PSBcIk1lbWJlckV4cHJlc3Npb25cIlxuICB9O1xuXG4gIHZhciBwcCQ4ID0gUGFyc2VyLnByb3RvdHlwZTtcblxuICAvLyAjIyMgU3RhdGVtZW50IHBhcnNpbmdcblxuICAvLyBQYXJzZSBhIHByb2dyYW0uIEluaXRpYWxpemVzIHRoZSBwYXJzZXIsIHJlYWRzIGFueSBudW1iZXIgb2ZcbiAgLy8gc3RhdGVtZW50cywgYW5kIHdyYXBzIHRoZW0gaW4gYSBQcm9ncmFtIG5vZGUuICBPcHRpb25hbGx5IHRha2VzIGFcbiAgLy8gYHByb2dyYW1gIGFyZ3VtZW50LiAgSWYgcHJlc2VudCwgdGhlIHN0YXRlbWVudHMgd2lsbCBiZSBhcHBlbmRlZFxuICAvLyB0byBpdHMgYm9keSBpbnN0ZWFkIG9mIGNyZWF0aW5nIGEgbmV3IG5vZGUuXG5cbiAgcHAkOC5wYXJzZVRvcExldmVsID0gZnVuY3Rpb24obm9kZSkge1xuICAgIHZhciBleHBvcnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBpZiAoIW5vZGUuYm9keSkgeyBub2RlLmJvZHkgPSBbXTsgfVxuICAgIHdoaWxlICh0aGlzLnR5cGUgIT09IHR5cGVzJDEuZW9mKSB7XG4gICAgICB2YXIgc3RtdCA9IHRoaXMucGFyc2VTdGF0ZW1lbnQobnVsbCwgdHJ1ZSwgZXhwb3J0cyk7XG4gICAgICBub2RlLmJvZHkucHVzaChzdG10KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaW5Nb2R1bGUpXG4gICAgICB7IGZvciAodmFyIGkgPSAwLCBsaXN0ID0gT2JqZWN0LmtleXModGhpcy51bmRlZmluZWRFeHBvcnRzKTsgaSA8IGxpc3QubGVuZ3RoOyBpICs9IDEpXG4gICAgICAgIHtcbiAgICAgICAgICB2YXIgbmFtZSA9IGxpc3RbaV07XG5cbiAgICAgICAgICB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodGhpcy51bmRlZmluZWRFeHBvcnRzW25hbWVdLnN0YXJ0LCAoXCJFeHBvcnQgJ1wiICsgbmFtZSArIFwiJyBpcyBub3QgZGVmaW5lZFwiKSk7XG4gICAgICAgIH0gfVxuICAgIHRoaXMuYWRhcHREaXJlY3RpdmVQcm9sb2d1ZShub2RlLmJvZHkpO1xuICAgIHRoaXMubmV4dCgpO1xuICAgIG5vZGUuc291cmNlVHlwZSA9IHRoaXMub3B0aW9ucy5zb3VyY2VUeXBlO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJQcm9ncmFtXCIpXG4gIH07XG5cbiAgdmFyIGxvb3BMYWJlbCA9IHtraW5kOiBcImxvb3BcIn0sIHN3aXRjaExhYmVsID0ge2tpbmQ6IFwic3dpdGNoXCJ9O1xuXG4gIHBwJDguaXNMZXQgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA8IDYgfHwgIXRoaXMuaXNDb250ZXh0dWFsKFwibGV0XCIpKSB7IHJldHVybiBmYWxzZSB9XG4gICAgc2tpcFdoaXRlU3BhY2UubGFzdEluZGV4ID0gdGhpcy5wb3M7XG4gICAgdmFyIHNraXAgPSBza2lwV2hpdGVTcGFjZS5leGVjKHRoaXMuaW5wdXQpO1xuICAgIHZhciBuZXh0ID0gdGhpcy5wb3MgKyBza2lwWzBdLmxlbmd0aCwgbmV4dENoID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KG5leHQpO1xuICAgIC8vIEZvciBhbWJpZ3VvdXMgY2FzZXMsIGRldGVybWluZSBpZiBhIExleGljYWxEZWNsYXJhdGlvbiAob3Igb25seSBhXG4gICAgLy8gU3RhdGVtZW50KSBpcyBhbGxvd2VkIGhlcmUuIElmIGNvbnRleHQgaXMgbm90IGVtcHR5IHRoZW4gb25seSBhIFN0YXRlbWVudFxuICAgIC8vIGlzIGFsbG93ZWQuIEhvd2V2ZXIsIGBsZXQgW2AgaXMgYW4gZXhwbGljaXQgbmVnYXRpdmUgbG9va2FoZWFkIGZvclxuICAgIC8vIEV4cHJlc3Npb25TdGF0ZW1lbnQsIHNvIHNwZWNpYWwtY2FzZSBpdCBmaXJzdC5cbiAgICBpZiAobmV4dENoID09PSA5MSB8fCBuZXh0Q2ggPT09IDkyKSB7IHJldHVybiB0cnVlIH0gLy8gJ1snLCAnLydcbiAgICBpZiAoY29udGV4dCkgeyByZXR1cm4gZmFsc2UgfVxuXG4gICAgaWYgKG5leHRDaCA9PT0gMTIzIHx8IG5leHRDaCA+IDB4ZDdmZiAmJiBuZXh0Q2ggPCAweGRjMDApIHsgcmV0dXJuIHRydWUgfSAvLyAneycsIGFzdHJhbFxuICAgIGlmIChpc0lkZW50aWZpZXJTdGFydChuZXh0Q2gsIHRydWUpKSB7XG4gICAgICB2YXIgcG9zID0gbmV4dCArIDE7XG4gICAgICB3aGlsZSAoaXNJZGVudGlmaWVyQ2hhcihuZXh0Q2ggPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQocG9zKSwgdHJ1ZSkpIHsgKytwb3M7IH1cbiAgICAgIGlmIChuZXh0Q2ggPT09IDkyIHx8IG5leHRDaCA+IDB4ZDdmZiAmJiBuZXh0Q2ggPCAweGRjMDApIHsgcmV0dXJuIHRydWUgfVxuICAgICAgdmFyIGlkZW50ID0gdGhpcy5pbnB1dC5zbGljZShuZXh0LCBwb3MpO1xuICAgICAgaWYgKCFrZXl3b3JkUmVsYXRpb25hbE9wZXJhdG9yLnRlc3QoaWRlbnQpKSB7IHJldHVybiB0cnVlIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gY2hlY2sgJ2FzeW5jIFtubyBMaW5lVGVybWluYXRvciBoZXJlXSBmdW5jdGlvbidcbiAgLy8gLSAnYXN5bmMgLypmb28qLyBmdW5jdGlvbicgaXMgT0suXG4gIC8vIC0gJ2FzeW5jIC8qXFxuKi8gZnVuY3Rpb24nIGlzIGludmFsaWQuXG4gIHBwJDguaXNBc3luY0Z1bmN0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA8IDggfHwgIXRoaXMuaXNDb250ZXh0dWFsKFwiYXN5bmNcIikpXG4gICAgICB7IHJldHVybiBmYWxzZSB9XG5cbiAgICBza2lwV2hpdGVTcGFjZS5sYXN0SW5kZXggPSB0aGlzLnBvcztcbiAgICB2YXIgc2tpcCA9IHNraXBXaGl0ZVNwYWNlLmV4ZWModGhpcy5pbnB1dCk7XG4gICAgdmFyIG5leHQgPSB0aGlzLnBvcyArIHNraXBbMF0ubGVuZ3RoLCBhZnRlcjtcbiAgICByZXR1cm4gIWxpbmVCcmVhay50ZXN0KHRoaXMuaW5wdXQuc2xpY2UodGhpcy5wb3MsIG5leHQpKSAmJlxuICAgICAgdGhpcy5pbnB1dC5zbGljZShuZXh0LCBuZXh0ICsgOCkgPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgKG5leHQgKyA4ID09PSB0aGlzLmlucHV0Lmxlbmd0aCB8fFxuICAgICAgICEoaXNJZGVudGlmaWVyQ2hhcihhZnRlciA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdChuZXh0ICsgOCkpIHx8IGFmdGVyID4gMHhkN2ZmICYmIGFmdGVyIDwgMHhkYzAwKSlcbiAgfTtcblxuICAvLyBQYXJzZSBhIHNpbmdsZSBzdGF0ZW1lbnQuXG4gIC8vXG4gIC8vIElmIGV4cGVjdGluZyBhIHN0YXRlbWVudCBhbmQgZmluZGluZyBhIHNsYXNoIG9wZXJhdG9yLCBwYXJzZSBhXG4gIC8vIHJlZ3VsYXIgZXhwcmVzc2lvbiBsaXRlcmFsLiBUaGlzIGlzIHRvIGhhbmRsZSBjYXNlcyBsaWtlXG4gIC8vIGBpZiAoZm9vKSAvYmxhaC8uZXhlYyhmb28pYCwgd2hlcmUgbG9va2luZyBhdCB0aGUgcHJldmlvdXMgdG9rZW5cbiAgLy8gZG9lcyBub3QgaGVscC5cblxuICBwcCQ4LnBhcnNlU3RhdGVtZW50ID0gZnVuY3Rpb24oY29udGV4dCwgdG9wTGV2ZWwsIGV4cG9ydHMpIHtcbiAgICB2YXIgc3RhcnR0eXBlID0gdGhpcy50eXBlLCBub2RlID0gdGhpcy5zdGFydE5vZGUoKSwga2luZDtcblxuICAgIGlmICh0aGlzLmlzTGV0KGNvbnRleHQpKSB7XG4gICAgICBzdGFydHR5cGUgPSB0eXBlcyQxLl92YXI7XG4gICAgICBraW5kID0gXCJsZXRcIjtcbiAgICB9XG5cbiAgICAvLyBNb3N0IHR5cGVzIG9mIHN0YXRlbWVudHMgYXJlIHJlY29nbml6ZWQgYnkgdGhlIGtleXdvcmQgdGhleVxuICAgIC8vIHN0YXJ0IHdpdGguIE1hbnkgYXJlIHRyaXZpYWwgdG8gcGFyc2UsIHNvbWUgcmVxdWlyZSBhIGJpdCBvZlxuICAgIC8vIGNvbXBsZXhpdHkuXG5cbiAgICBzd2l0Y2ggKHN0YXJ0dHlwZSkge1xuICAgIGNhc2UgdHlwZXMkMS5fYnJlYWs6IGNhc2UgdHlwZXMkMS5fY29udGludWU6IHJldHVybiB0aGlzLnBhcnNlQnJlYWtDb250aW51ZVN0YXRlbWVudChub2RlLCBzdGFydHR5cGUua2V5d29yZClcbiAgICBjYXNlIHR5cGVzJDEuX2RlYnVnZ2VyOiByZXR1cm4gdGhpcy5wYXJzZURlYnVnZ2VyU3RhdGVtZW50KG5vZGUpXG4gICAgY2FzZSB0eXBlcyQxLl9kbzogcmV0dXJuIHRoaXMucGFyc2VEb1N0YXRlbWVudChub2RlKVxuICAgIGNhc2UgdHlwZXMkMS5fZm9yOiByZXR1cm4gdGhpcy5wYXJzZUZvclN0YXRlbWVudChub2RlKVxuICAgIGNhc2UgdHlwZXMkMS5fZnVuY3Rpb246XG4gICAgICAvLyBGdW5jdGlvbiBhcyBzb2xlIGJvZHkgb2YgZWl0aGVyIGFuIGlmIHN0YXRlbWVudCBvciBhIGxhYmVsZWQgc3RhdGVtZW50XG4gICAgICAvLyB3b3JrcywgYnV0IG5vdCB3aGVuIGl0IGlzIHBhcnQgb2YgYSBsYWJlbGVkIHN0YXRlbWVudCB0aGF0IGlzIHRoZSBzb2xlXG4gICAgICAvLyBib2R5IG9mIGFuIGlmIHN0YXRlbWVudC5cbiAgICAgIGlmICgoY29udGV4dCAmJiAodGhpcy5zdHJpY3QgfHwgY29udGV4dCAhPT0gXCJpZlwiICYmIGNvbnRleHQgIT09IFwibGFiZWxcIikpICYmIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2KSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUZ1bmN0aW9uU3RhdGVtZW50KG5vZGUsIGZhbHNlLCAhY29udGV4dClcbiAgICBjYXNlIHR5cGVzJDEuX2NsYXNzOlxuICAgICAgaWYgKGNvbnRleHQpIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgICAgIHJldHVybiB0aGlzLnBhcnNlQ2xhc3Mobm9kZSwgdHJ1ZSlcbiAgICBjYXNlIHR5cGVzJDEuX2lmOiByZXR1cm4gdGhpcy5wYXJzZUlmU3RhdGVtZW50KG5vZGUpXG4gICAgY2FzZSB0eXBlcyQxLl9yZXR1cm46IHJldHVybiB0aGlzLnBhcnNlUmV0dXJuU3RhdGVtZW50KG5vZGUpXG4gICAgY2FzZSB0eXBlcyQxLl9zd2l0Y2g6IHJldHVybiB0aGlzLnBhcnNlU3dpdGNoU3RhdGVtZW50KG5vZGUpXG4gICAgY2FzZSB0eXBlcyQxLl90aHJvdzogcmV0dXJuIHRoaXMucGFyc2VUaHJvd1N0YXRlbWVudChub2RlKVxuICAgIGNhc2UgdHlwZXMkMS5fdHJ5OiByZXR1cm4gdGhpcy5wYXJzZVRyeVN0YXRlbWVudChub2RlKVxuICAgIGNhc2UgdHlwZXMkMS5fY29uc3Q6IGNhc2UgdHlwZXMkMS5fdmFyOlxuICAgICAga2luZCA9IGtpbmQgfHwgdGhpcy52YWx1ZTtcbiAgICAgIGlmIChjb250ZXh0ICYmIGtpbmQgIT09IFwidmFyXCIpIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgICAgIHJldHVybiB0aGlzLnBhcnNlVmFyU3RhdGVtZW50KG5vZGUsIGtpbmQpXG4gICAgY2FzZSB0eXBlcyQxLl93aGlsZTogcmV0dXJuIHRoaXMucGFyc2VXaGlsZVN0YXRlbWVudChub2RlKVxuICAgIGNhc2UgdHlwZXMkMS5fd2l0aDogcmV0dXJuIHRoaXMucGFyc2VXaXRoU3RhdGVtZW50KG5vZGUpXG4gICAgY2FzZSB0eXBlcyQxLmJyYWNlTDogcmV0dXJuIHRoaXMucGFyc2VCbG9jayh0cnVlLCBub2RlKVxuICAgIGNhc2UgdHlwZXMkMS5zZW1pOiByZXR1cm4gdGhpcy5wYXJzZUVtcHR5U3RhdGVtZW50KG5vZGUpXG4gICAgY2FzZSB0eXBlcyQxLl9leHBvcnQ6XG4gICAgY2FzZSB0eXBlcyQxLl9pbXBvcnQ6XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID4gMTAgJiYgc3RhcnR0eXBlID09PSB0eXBlcyQxLl9pbXBvcnQpIHtcbiAgICAgICAgc2tpcFdoaXRlU3BhY2UubGFzdEluZGV4ID0gdGhpcy5wb3M7XG4gICAgICAgIHZhciBza2lwID0gc2tpcFdoaXRlU3BhY2UuZXhlYyh0aGlzLmlucHV0KTtcbiAgICAgICAgdmFyIG5leHQgPSB0aGlzLnBvcyArIHNraXBbMF0ubGVuZ3RoLCBuZXh0Q2ggPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQobmV4dCk7XG4gICAgICAgIGlmIChuZXh0Q2ggPT09IDQwIHx8IG5leHRDaCA9PT0gNDYpIC8vICcoJyBvciAnLidcbiAgICAgICAgICB7IHJldHVybiB0aGlzLnBhcnNlRXhwcmVzc2lvblN0YXRlbWVudChub2RlLCB0aGlzLnBhcnNlRXhwcmVzc2lvbigpKSB9XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmFsbG93SW1wb3J0RXhwb3J0RXZlcnl3aGVyZSkge1xuICAgICAgICBpZiAoIXRvcExldmVsKVxuICAgICAgICAgIHsgdGhpcy5yYWlzZSh0aGlzLnN0YXJ0LCBcIidpbXBvcnQnIGFuZCAnZXhwb3J0JyBtYXkgb25seSBhcHBlYXIgYXQgdGhlIHRvcCBsZXZlbFwiKTsgfVxuICAgICAgICBpZiAoIXRoaXMuaW5Nb2R1bGUpXG4gICAgICAgICAgeyB0aGlzLnJhaXNlKHRoaXMuc3RhcnQsIFwiJ2ltcG9ydCcgYW5kICdleHBvcnQnIG1heSBhcHBlYXIgb25seSB3aXRoICdzb3VyY2VUeXBlOiBtb2R1bGUnXCIpOyB9XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RhcnR0eXBlID09PSB0eXBlcyQxLl9pbXBvcnQgPyB0aGlzLnBhcnNlSW1wb3J0KG5vZGUpIDogdGhpcy5wYXJzZUV4cG9ydChub2RlLCBleHBvcnRzKVxuXG4gICAgICAvLyBJZiB0aGUgc3RhdGVtZW50IGRvZXMgbm90IHN0YXJ0IHdpdGggYSBzdGF0ZW1lbnQga2V5d29yZCBvciBhXG4gICAgICAvLyBicmFjZSwgaXQncyBhbiBFeHByZXNzaW9uU3RhdGVtZW50IG9yIExhYmVsZWRTdGF0ZW1lbnQuIFdlXG4gICAgICAvLyBzaW1wbHkgc3RhcnQgcGFyc2luZyBhbiBleHByZXNzaW9uLCBhbmQgYWZ0ZXJ3YXJkcywgaWYgdGhlXG4gICAgICAvLyBuZXh0IHRva2VuIGlzIGEgY29sb24gYW5kIHRoZSBleHByZXNzaW9uIHdhcyBhIHNpbXBsZVxuICAgICAgLy8gSWRlbnRpZmllciBub2RlLCB3ZSBzd2l0Y2ggdG8gaW50ZXJwcmV0aW5nIGl0IGFzIGEgbGFiZWwuXG4gICAgZGVmYXVsdDpcbiAgICAgIGlmICh0aGlzLmlzQXN5bmNGdW5jdGlvbigpKSB7XG4gICAgICAgIGlmIChjb250ZXh0KSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUZ1bmN0aW9uU3RhdGVtZW50KG5vZGUsIHRydWUsICFjb250ZXh0KVxuICAgICAgfVxuXG4gICAgICB2YXIgbWF5YmVOYW1lID0gdGhpcy52YWx1ZSwgZXhwciA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgICBpZiAoc3RhcnR0eXBlID09PSB0eXBlcyQxLm5hbWUgJiYgZXhwci50eXBlID09PSBcIklkZW50aWZpZXJcIiAmJiB0aGlzLmVhdCh0eXBlcyQxLmNvbG9uKSlcbiAgICAgICAgeyByZXR1cm4gdGhpcy5wYXJzZUxhYmVsZWRTdGF0ZW1lbnQobm9kZSwgbWF5YmVOYW1lLCBleHByLCBjb250ZXh0KSB9XG4gICAgICBlbHNlIHsgcmV0dXJuIHRoaXMucGFyc2VFeHByZXNzaW9uU3RhdGVtZW50KG5vZGUsIGV4cHIpIH1cbiAgICB9XG4gIH07XG5cbiAgcHAkOC5wYXJzZUJyZWFrQ29udGludWVTdGF0ZW1lbnQgPSBmdW5jdGlvbihub2RlLCBrZXl3b3JkKSB7XG4gICAgdmFyIGlzQnJlYWsgPSBrZXl3b3JkID09PSBcImJyZWFrXCI7XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuc2VtaSkgfHwgdGhpcy5pbnNlcnRTZW1pY29sb24oKSkgeyBub2RlLmxhYmVsID0gbnVsbDsgfVxuICAgIGVsc2UgaWYgKHRoaXMudHlwZSAhPT0gdHlwZXMkMS5uYW1lKSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gICAgZWxzZSB7XG4gICAgICBub2RlLmxhYmVsID0gdGhpcy5wYXJzZUlkZW50KCk7XG4gICAgICB0aGlzLnNlbWljb2xvbigpO1xuICAgIH1cblxuICAgIC8vIFZlcmlmeSB0aGF0IHRoZXJlIGlzIGFuIGFjdHVhbCBkZXN0aW5hdGlvbiB0byBicmVhayBvclxuICAgIC8vIGNvbnRpbnVlIHRvLlxuICAgIHZhciBpID0gMDtcbiAgICBmb3IgKDsgaSA8IHRoaXMubGFiZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgbGFiID0gdGhpcy5sYWJlbHNbaV07XG4gICAgICBpZiAobm9kZS5sYWJlbCA9PSBudWxsIHx8IGxhYi5uYW1lID09PSBub2RlLmxhYmVsLm5hbWUpIHtcbiAgICAgICAgaWYgKGxhYi5raW5kICE9IG51bGwgJiYgKGlzQnJlYWsgfHwgbGFiLmtpbmQgPT09IFwibG9vcFwiKSkgeyBicmVhayB9XG4gICAgICAgIGlmIChub2RlLmxhYmVsICYmIGlzQnJlYWspIHsgYnJlYWsgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaSA9PT0gdGhpcy5sYWJlbHMubGVuZ3RoKSB7IHRoaXMucmFpc2Uobm9kZS5zdGFydCwgXCJVbnN5bnRhY3RpYyBcIiArIGtleXdvcmQpOyB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBpc0JyZWFrID8gXCJCcmVha1N0YXRlbWVudFwiIDogXCJDb250aW51ZVN0YXRlbWVudFwiKVxuICB9O1xuXG4gIHBwJDgucGFyc2VEZWJ1Z2dlclN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICB0aGlzLnNlbWljb2xvbigpO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJEZWJ1Z2dlclN0YXRlbWVudFwiKVxuICB9O1xuXG4gIHBwJDgucGFyc2VEb1N0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICB0aGlzLmxhYmVscy5wdXNoKGxvb3BMYWJlbCk7XG4gICAgbm9kZS5ib2R5ID0gdGhpcy5wYXJzZVN0YXRlbWVudChcImRvXCIpO1xuICAgIHRoaXMubGFiZWxzLnBvcCgpO1xuICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEuX3doaWxlKTtcbiAgICBub2RlLnRlc3QgPSB0aGlzLnBhcnNlUGFyZW5FeHByZXNzaW9uKCk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2KVxuICAgICAgeyB0aGlzLmVhdCh0eXBlcyQxLnNlbWkpOyB9XG4gICAgZWxzZVxuICAgICAgeyB0aGlzLnNlbWljb2xvbigpOyB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkRvV2hpbGVTdGF0ZW1lbnRcIilcbiAgfTtcblxuICAvLyBEaXNhbWJpZ3VhdGluZyBiZXR3ZWVuIGEgYGZvcmAgYW5kIGEgYGZvcmAvYGluYCBvciBgZm9yYC9gb2ZgXG4gIC8vIGxvb3AgaXMgbm9uLXRyaXZpYWwuIEJhc2ljYWxseSwgd2UgaGF2ZSB0byBwYXJzZSB0aGUgaW5pdCBgdmFyYFxuICAvLyBzdGF0ZW1lbnQgb3IgZXhwcmVzc2lvbiwgZGlzYWxsb3dpbmcgdGhlIGBpbmAgb3BlcmF0b3IgKHNlZVxuICAvLyB0aGUgc2Vjb25kIHBhcmFtZXRlciB0byBgcGFyc2VFeHByZXNzaW9uYCksIGFuZCB0aGVuIGNoZWNrXG4gIC8vIHdoZXRoZXIgdGhlIG5leHQgdG9rZW4gaXMgYGluYCBvciBgb2ZgLiBXaGVuIHRoZXJlIGlzIG5vIGluaXRcbiAgLy8gcGFydCAoc2VtaWNvbG9uIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBvcGVuaW5nIHBhcmVudGhlc2lzKSwgaXRcbiAgLy8gaXMgYSByZWd1bGFyIGBmb3JgIGxvb3AuXG5cbiAgcHAkOC5wYXJzZUZvclN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICB2YXIgYXdhaXRBdCA9ICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOSAmJiB0aGlzLmNhbkF3YWl0ICYmIHRoaXMuZWF0Q29udGV4dHVhbChcImF3YWl0XCIpKSA/IHRoaXMubGFzdFRva1N0YXJ0IDogLTE7XG4gICAgdGhpcy5sYWJlbHMucHVzaChsb29wTGFiZWwpO1xuICAgIHRoaXMuZW50ZXJTY29wZSgwKTtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLnBhcmVuTCk7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5zZW1pKSB7XG4gICAgICBpZiAoYXdhaXRBdCA+IC0xKSB7IHRoaXMudW5leHBlY3RlZChhd2FpdEF0KTsgfVxuICAgICAgcmV0dXJuIHRoaXMucGFyc2VGb3Iobm9kZSwgbnVsbClcbiAgICB9XG4gICAgdmFyIGlzTGV0ID0gdGhpcy5pc0xldCgpO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuX3ZhciB8fCB0aGlzLnR5cGUgPT09IHR5cGVzJDEuX2NvbnN0IHx8IGlzTGV0KSB7XG4gICAgICB2YXIgaW5pdCQxID0gdGhpcy5zdGFydE5vZGUoKSwga2luZCA9IGlzTGV0ID8gXCJsZXRcIiA6IHRoaXMudmFsdWU7XG4gICAgICB0aGlzLm5leHQoKTtcbiAgICAgIHRoaXMucGFyc2VWYXIoaW5pdCQxLCB0cnVlLCBraW5kKTtcbiAgICAgIHRoaXMuZmluaXNoTm9kZShpbml0JDEsIFwiVmFyaWFibGVEZWNsYXJhdGlvblwiKTtcbiAgICAgIGlmICgodGhpcy50eXBlID09PSB0eXBlcyQxLl9pbiB8fCAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYgJiYgdGhpcy5pc0NvbnRleHR1YWwoXCJvZlwiKSkpICYmIGluaXQkMS5kZWNsYXJhdGlvbnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOSkge1xuICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuX2luKSB7XG4gICAgICAgICAgICBpZiAoYXdhaXRBdCA+IC0xKSB7IHRoaXMudW5leHBlY3RlZChhd2FpdEF0KTsgfVxuICAgICAgICAgIH0gZWxzZSB7IG5vZGUuYXdhaXQgPSBhd2FpdEF0ID4gLTE7IH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUZvckluKG5vZGUsIGluaXQkMSlcbiAgICAgIH1cbiAgICAgIGlmIChhd2FpdEF0ID4gLTEpIHsgdGhpcy51bmV4cGVjdGVkKGF3YWl0QXQpOyB9XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUZvcihub2RlLCBpbml0JDEpXG4gICAgfVxuICAgIHZhciBzdGFydHNXaXRoTGV0ID0gdGhpcy5pc0NvbnRleHR1YWwoXCJsZXRcIiksIGlzRm9yT2YgPSBmYWxzZTtcbiAgICB2YXIgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyA9IG5ldyBEZXN0cnVjdHVyaW5nRXJyb3JzO1xuICAgIHZhciBpbml0ID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oYXdhaXRBdCA+IC0xID8gXCJhd2FpdFwiIDogdHJ1ZSwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyk7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5faW4gfHwgKGlzRm9yT2YgPSB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNiAmJiB0aGlzLmlzQ29udGV4dHVhbChcIm9mXCIpKSkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA5KSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuX2luKSB7XG4gICAgICAgICAgaWYgKGF3YWl0QXQgPiAtMSkgeyB0aGlzLnVuZXhwZWN0ZWQoYXdhaXRBdCk7IH1cbiAgICAgICAgfSBlbHNlIHsgbm9kZS5hd2FpdCA9IGF3YWl0QXQgPiAtMTsgfVxuICAgICAgfVxuICAgICAgaWYgKHN0YXJ0c1dpdGhMZXQgJiYgaXNGb3JPZikgeyB0aGlzLnJhaXNlKGluaXQuc3RhcnQsIFwiVGhlIGxlZnQtaGFuZCBzaWRlIG9mIGEgZm9yLW9mIGxvb3AgbWF5IG5vdCBzdGFydCB3aXRoICdsZXQnLlwiKTsgfVxuICAgICAgdGhpcy50b0Fzc2lnbmFibGUoaW5pdCwgZmFsc2UsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpO1xuICAgICAgdGhpcy5jaGVja0xWYWxQYXR0ZXJuKGluaXQpO1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VGb3JJbihub2RlLCBpbml0KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNoZWNrRXhwcmVzc2lvbkVycm9ycyhyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCB0cnVlKTtcbiAgICB9XG4gICAgaWYgKGF3YWl0QXQgPiAtMSkgeyB0aGlzLnVuZXhwZWN0ZWQoYXdhaXRBdCk7IH1cbiAgICByZXR1cm4gdGhpcy5wYXJzZUZvcihub2RlLCBpbml0KVxuICB9O1xuXG4gIHBwJDgucGFyc2VGdW5jdGlvblN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUsIGlzQXN5bmMsIGRlY2xhcmF0aW9uUG9zaXRpb24pIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICByZXR1cm4gdGhpcy5wYXJzZUZ1bmN0aW9uKG5vZGUsIEZVTkNfU1RBVEVNRU5UIHwgKGRlY2xhcmF0aW9uUG9zaXRpb24gPyAwIDogRlVOQ19IQU5HSU5HX1NUQVRFTUVOVCksIGZhbHNlLCBpc0FzeW5jKVxuICB9O1xuXG4gIHBwJDgucGFyc2VJZlN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICBub2RlLnRlc3QgPSB0aGlzLnBhcnNlUGFyZW5FeHByZXNzaW9uKCk7XG4gICAgLy8gYWxsb3cgZnVuY3Rpb24gZGVjbGFyYXRpb25zIGluIGJyYW5jaGVzLCBidXQgb25seSBpbiBub24tc3RyaWN0IG1vZGVcbiAgICBub2RlLmNvbnNlcXVlbnQgPSB0aGlzLnBhcnNlU3RhdGVtZW50KFwiaWZcIik7XG4gICAgbm9kZS5hbHRlcm5hdGUgPSB0aGlzLmVhdCh0eXBlcyQxLl9lbHNlKSA/IHRoaXMucGFyc2VTdGF0ZW1lbnQoXCJpZlwiKSA6IG51bGw7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIklmU3RhdGVtZW50XCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZVJldHVyblN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBpZiAoIXRoaXMuaW5GdW5jdGlvbiAmJiAhdGhpcy5vcHRpb25zLmFsbG93UmV0dXJuT3V0c2lkZUZ1bmN0aW9uKVxuICAgICAgeyB0aGlzLnJhaXNlKHRoaXMuc3RhcnQsIFwiJ3JldHVybicgb3V0c2lkZSBvZiBmdW5jdGlvblwiKTsgfVxuICAgIHRoaXMubmV4dCgpO1xuXG4gICAgLy8gSW4gYHJldHVybmAgKGFuZCBgYnJlYWtgL2Bjb250aW51ZWApLCB0aGUga2V5d29yZHMgd2l0aFxuICAgIC8vIG9wdGlvbmFsIGFyZ3VtZW50cywgd2UgZWFnZXJseSBsb29rIGZvciBhIHNlbWljb2xvbiBvciB0aGVcbiAgICAvLyBwb3NzaWJpbGl0eSB0byBpbnNlcnQgb25lLlxuXG4gICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuc2VtaSkgfHwgdGhpcy5pbnNlcnRTZW1pY29sb24oKSkgeyBub2RlLmFyZ3VtZW50ID0gbnVsbDsgfVxuICAgIGVsc2UgeyBub2RlLmFyZ3VtZW50ID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oKTsgdGhpcy5zZW1pY29sb24oKTsgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJSZXR1cm5TdGF0ZW1lbnRcIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlU3dpdGNoU3RhdGVtZW50ID0gZnVuY3Rpb24obm9kZSkge1xuICAgIHRoaXMubmV4dCgpO1xuICAgIG5vZGUuZGlzY3JpbWluYW50ID0gdGhpcy5wYXJzZVBhcmVuRXhwcmVzc2lvbigpO1xuICAgIG5vZGUuY2FzZXMgPSBbXTtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLmJyYWNlTCk7XG4gICAgdGhpcy5sYWJlbHMucHVzaChzd2l0Y2hMYWJlbCk7XG4gICAgdGhpcy5lbnRlclNjb3BlKDApO1xuXG4gICAgLy8gU3RhdGVtZW50cyB1bmRlciBtdXN0IGJlIGdyb3VwZWQgKGJ5IGxhYmVsKSBpbiBTd2l0Y2hDYXNlXG4gICAgLy8gbm9kZXMuIGBjdXJgIGlzIHVzZWQgdG8ga2VlcCB0aGUgbm9kZSB0aGF0IHdlIGFyZSBjdXJyZW50bHlcbiAgICAvLyBhZGRpbmcgc3RhdGVtZW50cyB0by5cblxuICAgIHZhciBjdXI7XG4gICAgZm9yICh2YXIgc2F3RGVmYXVsdCA9IGZhbHNlOyB0aGlzLnR5cGUgIT09IHR5cGVzJDEuYnJhY2VSOykge1xuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5fY2FzZSB8fCB0aGlzLnR5cGUgPT09IHR5cGVzJDEuX2RlZmF1bHQpIHtcbiAgICAgICAgdmFyIGlzQ2FzZSA9IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5fY2FzZTtcbiAgICAgICAgaWYgKGN1cikgeyB0aGlzLmZpbmlzaE5vZGUoY3VyLCBcIlN3aXRjaENhc2VcIik7IH1cbiAgICAgICAgbm9kZS5jYXNlcy5wdXNoKGN1ciA9IHRoaXMuc3RhcnROb2RlKCkpO1xuICAgICAgICBjdXIuY29uc2VxdWVudCA9IFtdO1xuICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgaWYgKGlzQ2FzZSkge1xuICAgICAgICAgIGN1ci50ZXN0ID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc2F3RGVmYXVsdCkgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodGhpcy5sYXN0VG9rU3RhcnQsIFwiTXVsdGlwbGUgZGVmYXVsdCBjbGF1c2VzXCIpOyB9XG4gICAgICAgICAgc2F3RGVmYXVsdCA9IHRydWU7XG4gICAgICAgICAgY3VyLnRlc3QgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEuY29sb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFjdXIpIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgICAgICAgY3VyLmNvbnNlcXVlbnQucHVzaCh0aGlzLnBhcnNlU3RhdGVtZW50KG51bGwpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5leGl0U2NvcGUoKTtcbiAgICBpZiAoY3VyKSB7IHRoaXMuZmluaXNoTm9kZShjdXIsIFwiU3dpdGNoQ2FzZVwiKTsgfVxuICAgIHRoaXMubmV4dCgpOyAvLyBDbG9zaW5nIGJyYWNlXG4gICAgdGhpcy5sYWJlbHMucG9wKCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIlN3aXRjaFN0YXRlbWVudFwiKVxuICB9O1xuXG4gIHBwJDgucGFyc2VUaHJvd1N0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICBpZiAobGluZUJyZWFrLnRlc3QodGhpcy5pbnB1dC5zbGljZSh0aGlzLmxhc3RUb2tFbmQsIHRoaXMuc3RhcnQpKSlcbiAgICAgIHsgdGhpcy5yYWlzZSh0aGlzLmxhc3RUb2tFbmQsIFwiSWxsZWdhbCBuZXdsaW5lIGFmdGVyIHRocm93XCIpOyB9XG4gICAgbm9kZS5hcmd1bWVudCA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgdGhpcy5zZW1pY29sb24oKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiVGhyb3dTdGF0ZW1lbnRcIilcbiAgfTtcblxuICAvLyBSZXVzZWQgZW1wdHkgYXJyYXkgYWRkZWQgZm9yIG5vZGUgZmllbGRzIHRoYXQgYXJlIGFsd2F5cyBlbXB0eS5cblxuICB2YXIgZW1wdHkkMSA9IFtdO1xuXG4gIHBwJDgucGFyc2VDYXRjaENsYXVzZVBhcmFtID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBhcmFtID0gdGhpcy5wYXJzZUJpbmRpbmdBdG9tKCk7XG4gICAgdmFyIHNpbXBsZSA9IHBhcmFtLnR5cGUgPT09IFwiSWRlbnRpZmllclwiO1xuICAgIHRoaXMuZW50ZXJTY29wZShzaW1wbGUgPyBTQ09QRV9TSU1QTEVfQ0FUQ0ggOiAwKTtcbiAgICB0aGlzLmNoZWNrTFZhbFBhdHRlcm4ocGFyYW0sIHNpbXBsZSA/IEJJTkRfU0lNUExFX0NBVENIIDogQklORF9MRVhJQ0FMKTtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLnBhcmVuUik7XG5cbiAgICByZXR1cm4gcGFyYW1cbiAgfTtcblxuICBwcCQ4LnBhcnNlVHJ5U3RhdGVtZW50ID0gZnVuY3Rpb24obm9kZSkge1xuICAgIHRoaXMubmV4dCgpO1xuICAgIG5vZGUuYmxvY2sgPSB0aGlzLnBhcnNlQmxvY2soKTtcbiAgICBub2RlLmhhbmRsZXIgPSBudWxsO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuX2NhdGNoKSB7XG4gICAgICB2YXIgY2xhdXNlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEucGFyZW5MKSkge1xuICAgICAgICBjbGF1c2UucGFyYW0gPSB0aGlzLnBhcnNlQ2F0Y2hDbGF1c2VQYXJhbSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA8IDEwKSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gICAgICAgIGNsYXVzZS5wYXJhbSA9IG51bGw7XG4gICAgICAgIHRoaXMuZW50ZXJTY29wZSgwKTtcbiAgICAgIH1cbiAgICAgIGNsYXVzZS5ib2R5ID0gdGhpcy5wYXJzZUJsb2NrKGZhbHNlKTtcbiAgICAgIHRoaXMuZXhpdFNjb3BlKCk7XG4gICAgICBub2RlLmhhbmRsZXIgPSB0aGlzLmZpbmlzaE5vZGUoY2xhdXNlLCBcIkNhdGNoQ2xhdXNlXCIpO1xuICAgIH1cbiAgICBub2RlLmZpbmFsaXplciA9IHRoaXMuZWF0KHR5cGVzJDEuX2ZpbmFsbHkpID8gdGhpcy5wYXJzZUJsb2NrKCkgOiBudWxsO1xuICAgIGlmICghbm9kZS5oYW5kbGVyICYmICFub2RlLmZpbmFsaXplcilcbiAgICAgIHsgdGhpcy5yYWlzZShub2RlLnN0YXJ0LCBcIk1pc3NpbmcgY2F0Y2ggb3IgZmluYWxseSBjbGF1c2VcIik7IH1cbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiVHJ5U3RhdGVtZW50XCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZVZhclN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUsIGtpbmQsIGFsbG93TWlzc2luZ0luaXRpYWxpemVyKSB7XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgdGhpcy5wYXJzZVZhcihub2RlLCBmYWxzZSwga2luZCwgYWxsb3dNaXNzaW5nSW5pdGlhbGl6ZXIpO1xuICAgIHRoaXMuc2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIlZhcmlhYmxlRGVjbGFyYXRpb25cIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlV2hpbGVTdGF0ZW1lbnQgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgbm9kZS50ZXN0ID0gdGhpcy5wYXJzZVBhcmVuRXhwcmVzc2lvbigpO1xuICAgIHRoaXMubGFiZWxzLnB1c2gobG9vcExhYmVsKTtcbiAgICBub2RlLmJvZHkgPSB0aGlzLnBhcnNlU3RhdGVtZW50KFwid2hpbGVcIik7XG4gICAgdGhpcy5sYWJlbHMucG9wKCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIldoaWxlU3RhdGVtZW50XCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZVdpdGhTdGF0ZW1lbnQgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgaWYgKHRoaXMuc3RyaWN0KSB7IHRoaXMucmFpc2UodGhpcy5zdGFydCwgXCInd2l0aCcgaW4gc3RyaWN0IG1vZGVcIik7IH1cbiAgICB0aGlzLm5leHQoKTtcbiAgICBub2RlLm9iamVjdCA9IHRoaXMucGFyc2VQYXJlbkV4cHJlc3Npb24oKTtcbiAgICBub2RlLmJvZHkgPSB0aGlzLnBhcnNlU3RhdGVtZW50KFwid2l0aFwiKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiV2l0aFN0YXRlbWVudFwiKVxuICB9O1xuXG4gIHBwJDgucGFyc2VFbXB0eVN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiRW1wdHlTdGF0ZW1lbnRcIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlTGFiZWxlZFN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUsIG1heWJlTmFtZSwgZXhwciwgY29udGV4dCkge1xuICAgIGZvciAodmFyIGkkMSA9IDAsIGxpc3QgPSB0aGlzLmxhYmVsczsgaSQxIDwgbGlzdC5sZW5ndGg7IGkkMSArPSAxKVxuICAgICAge1xuICAgICAgdmFyIGxhYmVsID0gbGlzdFtpJDFdO1xuXG4gICAgICBpZiAobGFiZWwubmFtZSA9PT0gbWF5YmVOYW1lKVxuICAgICAgICB7IHRoaXMucmFpc2UoZXhwci5zdGFydCwgXCJMYWJlbCAnXCIgKyBtYXliZU5hbWUgKyBcIicgaXMgYWxyZWFkeSBkZWNsYXJlZFwiKTtcbiAgICB9IH1cbiAgICB2YXIga2luZCA9IHRoaXMudHlwZS5pc0xvb3AgPyBcImxvb3BcIiA6IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5fc3dpdGNoID8gXCJzd2l0Y2hcIiA6IG51bGw7XG4gICAgZm9yICh2YXIgaSA9IHRoaXMubGFiZWxzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgbGFiZWwkMSA9IHRoaXMubGFiZWxzW2ldO1xuICAgICAgaWYgKGxhYmVsJDEuc3RhdGVtZW50U3RhcnQgPT09IG5vZGUuc3RhcnQpIHtcbiAgICAgICAgLy8gVXBkYXRlIGluZm9ybWF0aW9uIGFib3V0IHByZXZpb3VzIGxhYmVscyBvbiB0aGlzIG5vZGVcbiAgICAgICAgbGFiZWwkMS5zdGF0ZW1lbnRTdGFydCA9IHRoaXMuc3RhcnQ7XG4gICAgICAgIGxhYmVsJDEua2luZCA9IGtpbmQ7XG4gICAgICB9IGVsc2UgeyBicmVhayB9XG4gICAgfVxuICAgIHRoaXMubGFiZWxzLnB1c2goe25hbWU6IG1heWJlTmFtZSwga2luZDoga2luZCwgc3RhdGVtZW50U3RhcnQ6IHRoaXMuc3RhcnR9KTtcbiAgICBub2RlLmJvZHkgPSB0aGlzLnBhcnNlU3RhdGVtZW50KGNvbnRleHQgPyBjb250ZXh0LmluZGV4T2YoXCJsYWJlbFwiKSA9PT0gLTEgPyBjb250ZXh0ICsgXCJsYWJlbFwiIDogY29udGV4dCA6IFwibGFiZWxcIik7XG4gICAgdGhpcy5sYWJlbHMucG9wKCk7XG4gICAgbm9kZS5sYWJlbCA9IGV4cHI7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkxhYmVsZWRTdGF0ZW1lbnRcIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlRXhwcmVzc2lvblN0YXRlbWVudCA9IGZ1bmN0aW9uKG5vZGUsIGV4cHIpIHtcbiAgICBub2RlLmV4cHJlc3Npb24gPSBleHByO1xuICAgIHRoaXMuc2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIilcbiAgfTtcblxuICAvLyBQYXJzZSBhIHNlbWljb2xvbi1lbmNsb3NlZCBibG9jayBvZiBzdGF0ZW1lbnRzLCBoYW5kbGluZyBgXCJ1c2VcbiAgLy8gc3RyaWN0XCJgIGRlY2xhcmF0aW9ucyB3aGVuIGBhbGxvd1N0cmljdGAgaXMgdHJ1ZSAodXNlZCBmb3JcbiAgLy8gZnVuY3Rpb24gYm9kaWVzKS5cblxuICBwcCQ4LnBhcnNlQmxvY2sgPSBmdW5jdGlvbihjcmVhdGVOZXdMZXhpY2FsU2NvcGUsIG5vZGUsIGV4aXRTdHJpY3QpIHtcbiAgICBpZiAoIGNyZWF0ZU5ld0xleGljYWxTY29wZSA9PT0gdm9pZCAwICkgY3JlYXRlTmV3TGV4aWNhbFNjb3BlID0gdHJ1ZTtcbiAgICBpZiAoIG5vZGUgPT09IHZvaWQgMCApIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuXG4gICAgbm9kZS5ib2R5ID0gW107XG4gICAgdGhpcy5leHBlY3QodHlwZXMkMS5icmFjZUwpO1xuICAgIGlmIChjcmVhdGVOZXdMZXhpY2FsU2NvcGUpIHsgdGhpcy5lbnRlclNjb3BlKDApOyB9XG4gICAgd2hpbGUgKHRoaXMudHlwZSAhPT0gdHlwZXMkMS5icmFjZVIpIHtcbiAgICAgIHZhciBzdG10ID0gdGhpcy5wYXJzZVN0YXRlbWVudChudWxsKTtcbiAgICAgIG5vZGUuYm9keS5wdXNoKHN0bXQpO1xuICAgIH1cbiAgICBpZiAoZXhpdFN0cmljdCkgeyB0aGlzLnN0cmljdCA9IGZhbHNlOyB9XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgaWYgKGNyZWF0ZU5ld0xleGljYWxTY29wZSkgeyB0aGlzLmV4aXRTY29wZSgpOyB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkJsb2NrU3RhdGVtZW50XCIpXG4gIH07XG5cbiAgLy8gUGFyc2UgYSByZWd1bGFyIGBmb3JgIGxvb3AuIFRoZSBkaXNhbWJpZ3VhdGlvbiBjb2RlIGluXG4gIC8vIGBwYXJzZVN0YXRlbWVudGAgd2lsbCBhbHJlYWR5IGhhdmUgcGFyc2VkIHRoZSBpbml0IHN0YXRlbWVudCBvclxuICAvLyBleHByZXNzaW9uLlxuXG4gIHBwJDgucGFyc2VGb3IgPSBmdW5jdGlvbihub2RlLCBpbml0KSB7XG4gICAgbm9kZS5pbml0ID0gaW5pdDtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLnNlbWkpO1xuICAgIG5vZGUudGVzdCA9IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5zZW1pID8gbnVsbCA6IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgdGhpcy5leHBlY3QodHlwZXMkMS5zZW1pKTtcbiAgICBub2RlLnVwZGF0ZSA9IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5wYXJlblIgPyBudWxsIDogdGhpcy5wYXJzZUV4cHJlc3Npb24oKTtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLnBhcmVuUik7XG4gICAgbm9kZS5ib2R5ID0gdGhpcy5wYXJzZVN0YXRlbWVudChcImZvclwiKTtcbiAgICB0aGlzLmV4aXRTY29wZSgpO1xuICAgIHRoaXMubGFiZWxzLnBvcCgpO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJGb3JTdGF0ZW1lbnRcIilcbiAgfTtcblxuICAvLyBQYXJzZSBhIGBmb3JgL2BpbmAgYW5kIGBmb3JgL2BvZmAgbG9vcCwgd2hpY2ggYXJlIGFsbW9zdFxuICAvLyBzYW1lIGZyb20gcGFyc2VyJ3MgcGVyc3BlY3RpdmUuXG5cbiAgcHAkOC5wYXJzZUZvckluID0gZnVuY3Rpb24obm9kZSwgaW5pdCkge1xuICAgIHZhciBpc0ZvckluID0gdGhpcy50eXBlID09PSB0eXBlcyQxLl9pbjtcbiAgICB0aGlzLm5leHQoKTtcblxuICAgIGlmIChcbiAgICAgIGluaXQudHlwZSA9PT0gXCJWYXJpYWJsZURlY2xhcmF0aW9uXCIgJiZcbiAgICAgIGluaXQuZGVjbGFyYXRpb25zWzBdLmluaXQgIT0gbnVsbCAmJlxuICAgICAgKFxuICAgICAgICAhaXNGb3JJbiB8fFxuICAgICAgICB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPCA4IHx8XG4gICAgICAgIHRoaXMuc3RyaWN0IHx8XG4gICAgICAgIGluaXQua2luZCAhPT0gXCJ2YXJcIiB8fFxuICAgICAgICBpbml0LmRlY2xhcmF0aW9uc1swXS5pZC50eXBlICE9PSBcIklkZW50aWZpZXJcIlxuICAgICAgKVxuICAgICkge1xuICAgICAgdGhpcy5yYWlzZShcbiAgICAgICAgaW5pdC5zdGFydCxcbiAgICAgICAgKChpc0ZvckluID8gXCJmb3ItaW5cIiA6IFwiZm9yLW9mXCIpICsgXCIgbG9vcCB2YXJpYWJsZSBkZWNsYXJhdGlvbiBtYXkgbm90IGhhdmUgYW4gaW5pdGlhbGl6ZXJcIilcbiAgICAgICk7XG4gICAgfVxuICAgIG5vZGUubGVmdCA9IGluaXQ7XG4gICAgbm9kZS5yaWdodCA9IGlzRm9ySW4gPyB0aGlzLnBhcnNlRXhwcmVzc2lvbigpIDogdGhpcy5wYXJzZU1heWJlQXNzaWduKCk7XG4gICAgdGhpcy5leHBlY3QodHlwZXMkMS5wYXJlblIpO1xuICAgIG5vZGUuYm9keSA9IHRoaXMucGFyc2VTdGF0ZW1lbnQoXCJmb3JcIik7XG4gICAgdGhpcy5leGl0U2NvcGUoKTtcbiAgICB0aGlzLmxhYmVscy5wb3AoKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIGlzRm9ySW4gPyBcIkZvckluU3RhdGVtZW50XCIgOiBcIkZvck9mU3RhdGVtZW50XCIpXG4gIH07XG5cbiAgLy8gUGFyc2UgYSBsaXN0IG9mIHZhcmlhYmxlIGRlY2xhcmF0aW9ucy5cblxuICBwcCQ4LnBhcnNlVmFyID0gZnVuY3Rpb24obm9kZSwgaXNGb3IsIGtpbmQsIGFsbG93TWlzc2luZ0luaXRpYWxpemVyKSB7XG4gICAgbm9kZS5kZWNsYXJhdGlvbnMgPSBbXTtcbiAgICBub2RlLmtpbmQgPSBraW5kO1xuICAgIGZvciAoOzspIHtcbiAgICAgIHZhciBkZWNsID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICAgIHRoaXMucGFyc2VWYXJJZChkZWNsLCBraW5kKTtcbiAgICAgIGlmICh0aGlzLmVhdCh0eXBlcyQxLmVxKSkge1xuICAgICAgICBkZWNsLmluaXQgPSB0aGlzLnBhcnNlTWF5YmVBc3NpZ24oaXNGb3IpO1xuICAgICAgfSBlbHNlIGlmICghYWxsb3dNaXNzaW5nSW5pdGlhbGl6ZXIgJiYga2luZCA9PT0gXCJjb25zdFwiICYmICEodGhpcy50eXBlID09PSB0eXBlcyQxLl9pbiB8fCAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYgJiYgdGhpcy5pc0NvbnRleHR1YWwoXCJvZlwiKSkpKSB7XG4gICAgICAgIHRoaXMudW5leHBlY3RlZCgpO1xuICAgICAgfSBlbHNlIGlmICghYWxsb3dNaXNzaW5nSW5pdGlhbGl6ZXIgJiYgZGVjbC5pZC50eXBlICE9PSBcIklkZW50aWZpZXJcIiAmJiAhKGlzRm9yICYmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuX2luIHx8IHRoaXMuaXNDb250ZXh0dWFsKFwib2ZcIikpKSkge1xuICAgICAgICB0aGlzLnJhaXNlKHRoaXMubGFzdFRva0VuZCwgXCJDb21wbGV4IGJpbmRpbmcgcGF0dGVybnMgcmVxdWlyZSBhbiBpbml0aWFsaXphdGlvbiB2YWx1ZVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlY2wuaW5pdCA9IG51bGw7XG4gICAgICB9XG4gICAgICBub2RlLmRlY2xhcmF0aW9ucy5wdXNoKHRoaXMuZmluaXNoTm9kZShkZWNsLCBcIlZhcmlhYmxlRGVjbGFyYXRvclwiKSk7XG4gICAgICBpZiAoIXRoaXMuZWF0KHR5cGVzJDEuY29tbWEpKSB7IGJyZWFrIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGVcbiAgfTtcblxuICBwcCQ4LnBhcnNlVmFySWQgPSBmdW5jdGlvbihkZWNsLCBraW5kKSB7XG4gICAgZGVjbC5pZCA9IHRoaXMucGFyc2VCaW5kaW5nQXRvbSgpO1xuICAgIHRoaXMuY2hlY2tMVmFsUGF0dGVybihkZWNsLmlkLCBraW5kID09PSBcInZhclwiID8gQklORF9WQVIgOiBCSU5EX0xFWElDQUwsIGZhbHNlKTtcbiAgfTtcblxuICB2YXIgRlVOQ19TVEFURU1FTlQgPSAxLCBGVU5DX0hBTkdJTkdfU1RBVEVNRU5UID0gMiwgRlVOQ19OVUxMQUJMRV9JRCA9IDQ7XG5cbiAgLy8gUGFyc2UgYSBmdW5jdGlvbiBkZWNsYXJhdGlvbiBvciBsaXRlcmFsIChkZXBlbmRpbmcgb24gdGhlXG4gIC8vIGBzdGF0ZW1lbnQgJiBGVU5DX1NUQVRFTUVOVGApLlxuXG4gIC8vIFJlbW92ZSBgYWxsb3dFeHByZXNzaW9uQm9keWAgZm9yIDcuMC4wLCBhcyBpdCBpcyBvbmx5IGNhbGxlZCB3aXRoIGZhbHNlXG4gIHBwJDgucGFyc2VGdW5jdGlvbiA9IGZ1bmN0aW9uKG5vZGUsIHN0YXRlbWVudCwgYWxsb3dFeHByZXNzaW9uQm9keSwgaXNBc3luYywgZm9ySW5pdCkge1xuICAgIHRoaXMuaW5pdEZ1bmN0aW9uKG5vZGUpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOSB8fCB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNiAmJiAhaXNBc3luYykge1xuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5zdGFyICYmIChzdGF0ZW1lbnQgJiBGVU5DX0hBTkdJTkdfU1RBVEVNRU5UKSlcbiAgICAgICAgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgICAgbm9kZS5nZW5lcmF0b3IgPSB0aGlzLmVhdCh0eXBlcyQxLnN0YXIpO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDgpXG4gICAgICB7IG5vZGUuYXN5bmMgPSAhIWlzQXN5bmM7IH1cblxuICAgIGlmIChzdGF0ZW1lbnQgJiBGVU5DX1NUQVRFTUVOVCkge1xuICAgICAgbm9kZS5pZCA9IChzdGF0ZW1lbnQgJiBGVU5DX05VTExBQkxFX0lEKSAmJiB0aGlzLnR5cGUgIT09IHR5cGVzJDEubmFtZSA/IG51bGwgOiB0aGlzLnBhcnNlSWRlbnQoKTtcbiAgICAgIGlmIChub2RlLmlkICYmICEoc3RhdGVtZW50ICYgRlVOQ19IQU5HSU5HX1NUQVRFTUVOVCkpXG4gICAgICAgIC8vIElmIGl0IGlzIGEgcmVndWxhciBmdW5jdGlvbiBkZWNsYXJhdGlvbiBpbiBzbG9wcHkgbW9kZSwgdGhlbiBpdCBpc1xuICAgICAgICAvLyBzdWJqZWN0IHRvIEFubmV4IEIgc2VtYW50aWNzIChCSU5EX0ZVTkNUSU9OKS4gT3RoZXJ3aXNlLCB0aGUgYmluZGluZ1xuICAgICAgICAvLyBtb2RlIGRlcGVuZHMgb24gcHJvcGVydGllcyBvZiB0aGUgY3VycmVudCBzY29wZSAoc2VlXG4gICAgICAgIC8vIHRyZWF0RnVuY3Rpb25zQXNWYXIpLlxuICAgICAgICB7IHRoaXMuY2hlY2tMVmFsU2ltcGxlKG5vZGUuaWQsICh0aGlzLnN0cmljdCB8fCBub2RlLmdlbmVyYXRvciB8fCBub2RlLmFzeW5jKSA/IHRoaXMudHJlYXRGdW5jdGlvbnNBc1ZhciA/IEJJTkRfVkFSIDogQklORF9MRVhJQ0FMIDogQklORF9GVU5DVElPTik7IH1cbiAgICB9XG5cbiAgICB2YXIgb2xkWWllbGRQb3MgPSB0aGlzLnlpZWxkUG9zLCBvbGRBd2FpdFBvcyA9IHRoaXMuYXdhaXRQb3MsIG9sZEF3YWl0SWRlbnRQb3MgPSB0aGlzLmF3YWl0SWRlbnRQb3M7XG4gICAgdGhpcy55aWVsZFBvcyA9IDA7XG4gICAgdGhpcy5hd2FpdFBvcyA9IDA7XG4gICAgdGhpcy5hd2FpdElkZW50UG9zID0gMDtcbiAgICB0aGlzLmVudGVyU2NvcGUoZnVuY3Rpb25GbGFncyhub2RlLmFzeW5jLCBub2RlLmdlbmVyYXRvcikpO1xuXG4gICAgaWYgKCEoc3RhdGVtZW50ICYgRlVOQ19TVEFURU1FTlQpKVxuICAgICAgeyBub2RlLmlkID0gdGhpcy50eXBlID09PSB0eXBlcyQxLm5hbWUgPyB0aGlzLnBhcnNlSWRlbnQoKSA6IG51bGw7IH1cblxuICAgIHRoaXMucGFyc2VGdW5jdGlvblBhcmFtcyhub2RlKTtcbiAgICB0aGlzLnBhcnNlRnVuY3Rpb25Cb2R5KG5vZGUsIGFsbG93RXhwcmVzc2lvbkJvZHksIGZhbHNlLCBmb3JJbml0KTtcblxuICAgIHRoaXMueWllbGRQb3MgPSBvbGRZaWVsZFBvcztcbiAgICB0aGlzLmF3YWl0UG9zID0gb2xkQXdhaXRQb3M7XG4gICAgdGhpcy5hd2FpdElkZW50UG9zID0gb2xkQXdhaXRJZGVudFBvcztcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIChzdGF0ZW1lbnQgJiBGVU5DX1NUQVRFTUVOVCkgPyBcIkZ1bmN0aW9uRGVjbGFyYXRpb25cIiA6IFwiRnVuY3Rpb25FeHByZXNzaW9uXCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZUZ1bmN0aW9uUGFyYW1zID0gZnVuY3Rpb24obm9kZSkge1xuICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEucGFyZW5MKTtcbiAgICBub2RlLnBhcmFtcyA9IHRoaXMucGFyc2VCaW5kaW5nTGlzdCh0eXBlcyQxLnBhcmVuUiwgZmFsc2UsIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA4KTtcbiAgICB0aGlzLmNoZWNrWWllbGRBd2FpdEluRGVmYXVsdFBhcmFtcygpO1xuICB9O1xuXG4gIC8vIFBhcnNlIGEgY2xhc3MgZGVjbGFyYXRpb24gb3IgbGl0ZXJhbCAoZGVwZW5kaW5nIG9uIHRoZVxuICAvLyBgaXNTdGF0ZW1lbnRgIHBhcmFtZXRlcikuXG5cbiAgcHAkOC5wYXJzZUNsYXNzID0gZnVuY3Rpb24obm9kZSwgaXNTdGF0ZW1lbnQpIHtcbiAgICB0aGlzLm5leHQoKTtcblxuICAgIC8vIGVjbWEtMjYyIDE0LjYgQ2xhc3MgRGVmaW5pdGlvbnNcbiAgICAvLyBBIGNsYXNzIGRlZmluaXRpb24gaXMgYWx3YXlzIHN0cmljdCBtb2RlIGNvZGUuXG4gICAgdmFyIG9sZFN0cmljdCA9IHRoaXMuc3RyaWN0O1xuICAgIHRoaXMuc3RyaWN0ID0gdHJ1ZTtcblxuICAgIHRoaXMucGFyc2VDbGFzc0lkKG5vZGUsIGlzU3RhdGVtZW50KTtcbiAgICB0aGlzLnBhcnNlQ2xhc3NTdXBlcihub2RlKTtcbiAgICB2YXIgcHJpdmF0ZU5hbWVNYXAgPSB0aGlzLmVudGVyQ2xhc3NCb2R5KCk7XG4gICAgdmFyIGNsYXNzQm9keSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgdmFyIGhhZENvbnN0cnVjdG9yID0gZmFsc2U7XG4gICAgY2xhc3NCb2R5LmJvZHkgPSBbXTtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLmJyYWNlTCk7XG4gICAgd2hpbGUgKHRoaXMudHlwZSAhPT0gdHlwZXMkMS5icmFjZVIpIHtcbiAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5wYXJzZUNsYXNzRWxlbWVudChub2RlLnN1cGVyQ2xhc3MgIT09IG51bGwpO1xuICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgY2xhc3NCb2R5LmJvZHkucHVzaChlbGVtZW50KTtcbiAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gXCJNZXRob2REZWZpbml0aW9uXCIgJiYgZWxlbWVudC5raW5kID09PSBcImNvbnN0cnVjdG9yXCIpIHtcbiAgICAgICAgICBpZiAoaGFkQ29uc3RydWN0b3IpIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKGVsZW1lbnQuc3RhcnQsIFwiRHVwbGljYXRlIGNvbnN0cnVjdG9yIGluIHRoZSBzYW1lIGNsYXNzXCIpOyB9XG4gICAgICAgICAgaGFkQ29uc3RydWN0b3IgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnQua2V5ICYmIGVsZW1lbnQua2V5LnR5cGUgPT09IFwiUHJpdmF0ZUlkZW50aWZpZXJcIiAmJiBpc1ByaXZhdGVOYW1lQ29uZmxpY3RlZChwcml2YXRlTmFtZU1hcCwgZWxlbWVudCkpIHtcbiAgICAgICAgICB0aGlzLnJhaXNlUmVjb3ZlcmFibGUoZWxlbWVudC5rZXkuc3RhcnQsIChcIklkZW50aWZpZXIgJyNcIiArIChlbGVtZW50LmtleS5uYW1lKSArIFwiJyBoYXMgYWxyZWFkeSBiZWVuIGRlY2xhcmVkXCIpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnN0cmljdCA9IG9sZFN0cmljdDtcbiAgICB0aGlzLm5leHQoKTtcbiAgICBub2RlLmJvZHkgPSB0aGlzLmZpbmlzaE5vZGUoY2xhc3NCb2R5LCBcIkNsYXNzQm9keVwiKTtcbiAgICB0aGlzLmV4aXRDbGFzc0JvZHkoKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIGlzU3RhdGVtZW50ID8gXCJDbGFzc0RlY2xhcmF0aW9uXCIgOiBcIkNsYXNzRXhwcmVzc2lvblwiKVxuICB9O1xuXG4gIHBwJDgucGFyc2VDbGFzc0VsZW1lbnQgPSBmdW5jdGlvbihjb25zdHJ1Y3RvckFsbG93c1N1cGVyKSB7XG4gICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuc2VtaSkpIHsgcmV0dXJuIG51bGwgfVxuXG4gICAgdmFyIGVjbWFWZXJzaW9uID0gdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uO1xuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICB2YXIga2V5TmFtZSA9IFwiXCI7XG4gICAgdmFyIGlzR2VuZXJhdG9yID0gZmFsc2U7XG4gICAgdmFyIGlzQXN5bmMgPSBmYWxzZTtcbiAgICB2YXIga2luZCA9IFwibWV0aG9kXCI7XG4gICAgdmFyIGlzU3RhdGljID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5lYXRDb250ZXh0dWFsKFwic3RhdGljXCIpKSB7XG4gICAgICAvLyBQYXJzZSBzdGF0aWMgaW5pdCBibG9ja1xuICAgICAgaWYgKGVjbWFWZXJzaW9uID49IDEzICYmIHRoaXMuZWF0KHR5cGVzJDEuYnJhY2VMKSkge1xuICAgICAgICB0aGlzLnBhcnNlQ2xhc3NTdGF0aWNCbG9jayhub2RlKTtcbiAgICAgICAgcmV0dXJuIG5vZGVcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmlzQ2xhc3NFbGVtZW50TmFtZVN0YXJ0KCkgfHwgdGhpcy50eXBlID09PSB0eXBlcyQxLnN0YXIpIHtcbiAgICAgICAgaXNTdGF0aWMgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAga2V5TmFtZSA9IFwic3RhdGljXCI7XG4gICAgICB9XG4gICAgfVxuICAgIG5vZGUuc3RhdGljID0gaXNTdGF0aWM7XG4gICAgaWYgKCFrZXlOYW1lICYmIGVjbWFWZXJzaW9uID49IDggJiYgdGhpcy5lYXRDb250ZXh0dWFsKFwiYXN5bmNcIikpIHtcbiAgICAgIGlmICgodGhpcy5pc0NsYXNzRWxlbWVudE5hbWVTdGFydCgpIHx8IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5zdGFyKSAmJiAhdGhpcy5jYW5JbnNlcnRTZW1pY29sb24oKSkge1xuICAgICAgICBpc0FzeW5jID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGtleU5hbWUgPSBcImFzeW5jXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICgha2V5TmFtZSAmJiAoZWNtYVZlcnNpb24gPj0gOSB8fCAhaXNBc3luYykgJiYgdGhpcy5lYXQodHlwZXMkMS5zdGFyKSkge1xuICAgICAgaXNHZW5lcmF0b3IgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoIWtleU5hbWUgJiYgIWlzQXN5bmMgJiYgIWlzR2VuZXJhdG9yKSB7XG4gICAgICB2YXIgbGFzdFZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgIGlmICh0aGlzLmVhdENvbnRleHR1YWwoXCJnZXRcIikgfHwgdGhpcy5lYXRDb250ZXh0dWFsKFwic2V0XCIpKSB7XG4gICAgICAgIGlmICh0aGlzLmlzQ2xhc3NFbGVtZW50TmFtZVN0YXJ0KCkpIHtcbiAgICAgICAgICBraW5kID0gbGFzdFZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGtleU5hbWUgPSBsYXN0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQYXJzZSBlbGVtZW50IG5hbWVcbiAgICBpZiAoa2V5TmFtZSkge1xuICAgICAgLy8gJ2FzeW5jJywgJ2dldCcsICdzZXQnLCBvciAnc3RhdGljJyB3ZXJlIG5vdCBhIGtleXdvcmQgY29udGV4dHVhbGx5LlxuICAgICAgLy8gVGhlIGxhc3QgdG9rZW4gaXMgYW55IG9mIHRob3NlLiBNYWtlIGl0IHRoZSBlbGVtZW50IG5hbWUuXG4gICAgICBub2RlLmNvbXB1dGVkID0gZmFsc2U7XG4gICAgICBub2RlLmtleSA9IHRoaXMuc3RhcnROb2RlQXQodGhpcy5sYXN0VG9rU3RhcnQsIHRoaXMubGFzdFRva1N0YXJ0TG9jKTtcbiAgICAgIG5vZGUua2V5Lm5hbWUgPSBrZXlOYW1lO1xuICAgICAgdGhpcy5maW5pc2hOb2RlKG5vZGUua2V5LCBcIklkZW50aWZpZXJcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGFyc2VDbGFzc0VsZW1lbnROYW1lKG5vZGUpO1xuICAgIH1cblxuICAgIC8vIFBhcnNlIGVsZW1lbnQgdmFsdWVcbiAgICBpZiAoZWNtYVZlcnNpb24gPCAxMyB8fCB0aGlzLnR5cGUgPT09IHR5cGVzJDEucGFyZW5MIHx8IGtpbmQgIT09IFwibWV0aG9kXCIgfHwgaXNHZW5lcmF0b3IgfHwgaXNBc3luYykge1xuICAgICAgdmFyIGlzQ29uc3RydWN0b3IgPSAhbm9kZS5zdGF0aWMgJiYgY2hlY2tLZXlOYW1lKG5vZGUsIFwiY29uc3RydWN0b3JcIik7XG4gICAgICB2YXIgYWxsb3dzRGlyZWN0U3VwZXIgPSBpc0NvbnN0cnVjdG9yICYmIGNvbnN0cnVjdG9yQWxsb3dzU3VwZXI7XG4gICAgICAvLyBDb3VsZG4ndCBtb3ZlIHRoaXMgY2hlY2sgaW50byB0aGUgJ3BhcnNlQ2xhc3NNZXRob2QnIG1ldGhvZCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eS5cbiAgICAgIGlmIChpc0NvbnN0cnVjdG9yICYmIGtpbmQgIT09IFwibWV0aG9kXCIpIHsgdGhpcy5yYWlzZShub2RlLmtleS5zdGFydCwgXCJDb25zdHJ1Y3RvciBjYW4ndCBoYXZlIGdldC9zZXQgbW9kaWZpZXJcIik7IH1cbiAgICAgIG5vZGUua2luZCA9IGlzQ29uc3RydWN0b3IgPyBcImNvbnN0cnVjdG9yXCIgOiBraW5kO1xuICAgICAgdGhpcy5wYXJzZUNsYXNzTWV0aG9kKG5vZGUsIGlzR2VuZXJhdG9yLCBpc0FzeW5jLCBhbGxvd3NEaXJlY3RTdXBlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGFyc2VDbGFzc0ZpZWxkKG5vZGUpO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlXG4gIH07XG5cbiAgcHAkOC5pc0NsYXNzRWxlbWVudE5hbWVTdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLnR5cGUgPT09IHR5cGVzJDEubmFtZSB8fFxuICAgICAgdGhpcy50eXBlID09PSB0eXBlcyQxLnByaXZhdGVJZCB8fFxuICAgICAgdGhpcy50eXBlID09PSB0eXBlcyQxLm51bSB8fFxuICAgICAgdGhpcy50eXBlID09PSB0eXBlcyQxLnN0cmluZyB8fFxuICAgICAgdGhpcy50eXBlID09PSB0eXBlcyQxLmJyYWNrZXRMIHx8XG4gICAgICB0aGlzLnR5cGUua2V5d29yZFxuICAgIClcbiAgfTtcblxuICBwcCQ4LnBhcnNlQ2xhc3NFbGVtZW50TmFtZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLnByaXZhdGVJZCkge1xuICAgICAgaWYgKHRoaXMudmFsdWUgPT09IFwiY29uc3RydWN0b3JcIikge1xuICAgICAgICB0aGlzLnJhaXNlKHRoaXMuc3RhcnQsIFwiQ2xhc3NlcyBjYW4ndCBoYXZlIGFuIGVsZW1lbnQgbmFtZWQgJyNjb25zdHJ1Y3RvcidcIik7XG4gICAgICB9XG4gICAgICBlbGVtZW50LmNvbXB1dGVkID0gZmFsc2U7XG4gICAgICBlbGVtZW50LmtleSA9IHRoaXMucGFyc2VQcml2YXRlSWRlbnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wYXJzZVByb3BlcnR5TmFtZShlbGVtZW50KTtcbiAgICB9XG4gIH07XG5cbiAgcHAkOC5wYXJzZUNsYXNzTWV0aG9kID0gZnVuY3Rpb24obWV0aG9kLCBpc0dlbmVyYXRvciwgaXNBc3luYywgYWxsb3dzRGlyZWN0U3VwZXIpIHtcbiAgICAvLyBDaGVjayBrZXkgYW5kIGZsYWdzXG4gICAgdmFyIGtleSA9IG1ldGhvZC5rZXk7XG4gICAgaWYgKG1ldGhvZC5raW5kID09PSBcImNvbnN0cnVjdG9yXCIpIHtcbiAgICAgIGlmIChpc0dlbmVyYXRvcikgeyB0aGlzLnJhaXNlKGtleS5zdGFydCwgXCJDb25zdHJ1Y3RvciBjYW4ndCBiZSBhIGdlbmVyYXRvclwiKTsgfVxuICAgICAgaWYgKGlzQXN5bmMpIHsgdGhpcy5yYWlzZShrZXkuc3RhcnQsIFwiQ29uc3RydWN0b3IgY2FuJ3QgYmUgYW4gYXN5bmMgbWV0aG9kXCIpOyB9XG4gICAgfSBlbHNlIGlmIChtZXRob2Quc3RhdGljICYmIGNoZWNrS2V5TmFtZShtZXRob2QsIFwicHJvdG90eXBlXCIpKSB7XG4gICAgICB0aGlzLnJhaXNlKGtleS5zdGFydCwgXCJDbGFzc2VzIG1heSBub3QgaGF2ZSBhIHN0YXRpYyBwcm9wZXJ0eSBuYW1lZCBwcm90b3R5cGVcIik7XG4gICAgfVxuXG4gICAgLy8gUGFyc2UgdmFsdWVcbiAgICB2YXIgdmFsdWUgPSBtZXRob2QudmFsdWUgPSB0aGlzLnBhcnNlTWV0aG9kKGlzR2VuZXJhdG9yLCBpc0FzeW5jLCBhbGxvd3NEaXJlY3RTdXBlcik7XG5cbiAgICAvLyBDaGVjayB2YWx1ZVxuICAgIGlmIChtZXRob2Qua2luZCA9PT0gXCJnZXRcIiAmJiB2YWx1ZS5wYXJhbXMubGVuZ3RoICE9PSAwKVxuICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodmFsdWUuc3RhcnQsIFwiZ2V0dGVyIHNob3VsZCBoYXZlIG5vIHBhcmFtc1wiKTsgfVxuICAgIGlmIChtZXRob2Qua2luZCA9PT0gXCJzZXRcIiAmJiB2YWx1ZS5wYXJhbXMubGVuZ3RoICE9PSAxKVxuICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodmFsdWUuc3RhcnQsIFwic2V0dGVyIHNob3VsZCBoYXZlIGV4YWN0bHkgb25lIHBhcmFtXCIpOyB9XG4gICAgaWYgKG1ldGhvZC5raW5kID09PSBcInNldFwiICYmIHZhbHVlLnBhcmFtc1swXS50eXBlID09PSBcIlJlc3RFbGVtZW50XCIpXG4gICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZSh2YWx1ZS5wYXJhbXNbMF0uc3RhcnQsIFwiU2V0dGVyIGNhbm5vdCB1c2UgcmVzdCBwYXJhbXNcIik7IH1cblxuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobWV0aG9kLCBcIk1ldGhvZERlZmluaXRpb25cIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlQ2xhc3NGaWVsZCA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgaWYgKGNoZWNrS2V5TmFtZShmaWVsZCwgXCJjb25zdHJ1Y3RvclwiKSkge1xuICAgICAgdGhpcy5yYWlzZShmaWVsZC5rZXkuc3RhcnQsIFwiQ2xhc3NlcyBjYW4ndCBoYXZlIGEgZmllbGQgbmFtZWQgJ2NvbnN0cnVjdG9yJ1wiKTtcbiAgICB9IGVsc2UgaWYgKGZpZWxkLnN0YXRpYyAmJiBjaGVja0tleU5hbWUoZmllbGQsIFwicHJvdG90eXBlXCIpKSB7XG4gICAgICB0aGlzLnJhaXNlKGZpZWxkLmtleS5zdGFydCwgXCJDbGFzc2VzIGNhbid0IGhhdmUgYSBzdGF0aWMgZmllbGQgbmFtZWQgJ3Byb3RvdHlwZSdcIik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuZXEpKSB7XG4gICAgICAvLyBUbyByYWlzZSBTeW50YXhFcnJvciBpZiAnYXJndW1lbnRzJyBleGlzdHMgaW4gdGhlIGluaXRpYWxpemVyLlxuICAgICAgdmFyIHNjb3BlID0gdGhpcy5jdXJyZW50VGhpc1Njb3BlKCk7XG4gICAgICB2YXIgaW5DbGFzc0ZpZWxkSW5pdCA9IHNjb3BlLmluQ2xhc3NGaWVsZEluaXQ7XG4gICAgICBzY29wZS5pbkNsYXNzRmllbGRJbml0ID0gdHJ1ZTtcbiAgICAgIGZpZWxkLnZhbHVlID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKCk7XG4gICAgICBzY29wZS5pbkNsYXNzRmllbGRJbml0ID0gaW5DbGFzc0ZpZWxkSW5pdDtcbiAgICB9IGVsc2Uge1xuICAgICAgZmllbGQudmFsdWUgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLnNlbWljb2xvbigpO1xuXG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShmaWVsZCwgXCJQcm9wZXJ0eURlZmluaXRpb25cIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlQ2xhc3NTdGF0aWNCbG9jayA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBub2RlLmJvZHkgPSBbXTtcblxuICAgIHZhciBvbGRMYWJlbHMgPSB0aGlzLmxhYmVscztcbiAgICB0aGlzLmxhYmVscyA9IFtdO1xuICAgIHRoaXMuZW50ZXJTY29wZShTQ09QRV9DTEFTU19TVEFUSUNfQkxPQ0sgfCBTQ09QRV9TVVBFUik7XG4gICAgd2hpbGUgKHRoaXMudHlwZSAhPT0gdHlwZXMkMS5icmFjZVIpIHtcbiAgICAgIHZhciBzdG10ID0gdGhpcy5wYXJzZVN0YXRlbWVudChudWxsKTtcbiAgICAgIG5vZGUuYm9keS5wdXNoKHN0bXQpO1xuICAgIH1cbiAgICB0aGlzLm5leHQoKTtcbiAgICB0aGlzLmV4aXRTY29wZSgpO1xuICAgIHRoaXMubGFiZWxzID0gb2xkTGFiZWxzO1xuXG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIlN0YXRpY0Jsb2NrXCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZUNsYXNzSWQgPSBmdW5jdGlvbihub2RlLCBpc1N0YXRlbWVudCkge1xuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEubmFtZSkge1xuICAgICAgbm9kZS5pZCA9IHRoaXMucGFyc2VJZGVudCgpO1xuICAgICAgaWYgKGlzU3RhdGVtZW50KVxuICAgICAgICB7IHRoaXMuY2hlY2tMVmFsU2ltcGxlKG5vZGUuaWQsIEJJTkRfTEVYSUNBTCwgZmFsc2UpOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc1N0YXRlbWVudCA9PT0gdHJ1ZSlcbiAgICAgICAgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgICAgbm9kZS5pZCA9IG51bGw7XG4gICAgfVxuICB9O1xuXG4gIHBwJDgucGFyc2VDbGFzc1N1cGVyID0gZnVuY3Rpb24obm9kZSkge1xuICAgIG5vZGUuc3VwZXJDbGFzcyA9IHRoaXMuZWF0KHR5cGVzJDEuX2V4dGVuZHMpID8gdGhpcy5wYXJzZUV4cHJTdWJzY3JpcHRzKG51bGwsIGZhbHNlKSA6IG51bGw7XG4gIH07XG5cbiAgcHAkOC5lbnRlckNsYXNzQm9keSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbGVtZW50ID0ge2RlY2xhcmVkOiBPYmplY3QuY3JlYXRlKG51bGwpLCB1c2VkOiBbXX07XG4gICAgdGhpcy5wcml2YXRlTmFtZVN0YWNrLnB1c2goZWxlbWVudCk7XG4gICAgcmV0dXJuIGVsZW1lbnQuZGVjbGFyZWRcbiAgfTtcblxuICBwcCQ4LmV4aXRDbGFzc0JvZHkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVmID0gdGhpcy5wcml2YXRlTmFtZVN0YWNrLnBvcCgpO1xuICAgIHZhciBkZWNsYXJlZCA9IHJlZi5kZWNsYXJlZDtcbiAgICB2YXIgdXNlZCA9IHJlZi51c2VkO1xuICAgIGlmICghdGhpcy5vcHRpb25zLmNoZWNrUHJpdmF0ZUZpZWxkcykgeyByZXR1cm4gfVxuICAgIHZhciBsZW4gPSB0aGlzLnByaXZhdGVOYW1lU3RhY2subGVuZ3RoO1xuICAgIHZhciBwYXJlbnQgPSBsZW4gPT09IDAgPyBudWxsIDogdGhpcy5wcml2YXRlTmFtZVN0YWNrW2xlbiAtIDFdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXNlZC5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGlkID0gdXNlZFtpXTtcbiAgICAgIGlmICghaGFzT3duKGRlY2xhcmVkLCBpZC5uYW1lKSkge1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgcGFyZW50LnVzZWQucHVzaChpZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5yYWlzZVJlY292ZXJhYmxlKGlkLnN0YXJ0LCAoXCJQcml2YXRlIGZpZWxkICcjXCIgKyAoaWQubmFtZSkgKyBcIicgbXVzdCBiZSBkZWNsYXJlZCBpbiBhbiBlbmNsb3NpbmcgY2xhc3NcIikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGlzUHJpdmF0ZU5hbWVDb25mbGljdGVkKHByaXZhdGVOYW1lTWFwLCBlbGVtZW50KSB7XG4gICAgdmFyIG5hbWUgPSBlbGVtZW50LmtleS5uYW1lO1xuICAgIHZhciBjdXJyID0gcHJpdmF0ZU5hbWVNYXBbbmFtZV07XG5cbiAgICB2YXIgbmV4dCA9IFwidHJ1ZVwiO1xuICAgIGlmIChlbGVtZW50LnR5cGUgPT09IFwiTWV0aG9kRGVmaW5pdGlvblwiICYmIChlbGVtZW50LmtpbmQgPT09IFwiZ2V0XCIgfHwgZWxlbWVudC5raW5kID09PSBcInNldFwiKSkge1xuICAgICAgbmV4dCA9IChlbGVtZW50LnN0YXRpYyA/IFwic1wiIDogXCJpXCIpICsgZWxlbWVudC5raW5kO1xuICAgIH1cblxuICAgIC8vIGBjbGFzcyB7IGdldCAjYSgpe307IHN0YXRpYyBzZXQgI2EoXyl7fSB9YCBpcyBhbHNvIGNvbmZsaWN0LlxuICAgIGlmIChcbiAgICAgIGN1cnIgPT09IFwiaWdldFwiICYmIG5leHQgPT09IFwiaXNldFwiIHx8XG4gICAgICBjdXJyID09PSBcImlzZXRcIiAmJiBuZXh0ID09PSBcImlnZXRcIiB8fFxuICAgICAgY3VyciA9PT0gXCJzZ2V0XCIgJiYgbmV4dCA9PT0gXCJzc2V0XCIgfHxcbiAgICAgIGN1cnIgPT09IFwic3NldFwiICYmIG5leHQgPT09IFwic2dldFwiXG4gICAgKSB7XG4gICAgICBwcml2YXRlTmFtZU1hcFtuYW1lXSA9IFwidHJ1ZVwiO1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIGlmICghY3Vycikge1xuICAgICAgcHJpdmF0ZU5hbWVNYXBbbmFtZV0gPSBuZXh0O1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tLZXlOYW1lKG5vZGUsIG5hbWUpIHtcbiAgICB2YXIgY29tcHV0ZWQgPSBub2RlLmNvbXB1dGVkO1xuICAgIHZhciBrZXkgPSBub2RlLmtleTtcbiAgICByZXR1cm4gIWNvbXB1dGVkICYmIChcbiAgICAgIGtleS50eXBlID09PSBcIklkZW50aWZpZXJcIiAmJiBrZXkubmFtZSA9PT0gbmFtZSB8fFxuICAgICAga2V5LnR5cGUgPT09IFwiTGl0ZXJhbFwiICYmIGtleS52YWx1ZSA9PT0gbmFtZVxuICAgIClcbiAgfVxuXG4gIC8vIFBhcnNlcyBtb2R1bGUgZXhwb3J0IGRlY2xhcmF0aW9uLlxuXG4gIHBwJDgucGFyc2VFeHBvcnRBbGxEZWNsYXJhdGlvbiA9IGZ1bmN0aW9uKG5vZGUsIGV4cG9ydHMpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDExKSB7XG4gICAgICBpZiAodGhpcy5lYXRDb250ZXh0dWFsKFwiYXNcIikpIHtcbiAgICAgICAgbm9kZS5leHBvcnRlZCA9IHRoaXMucGFyc2VNb2R1bGVFeHBvcnROYW1lKCk7XG4gICAgICAgIHRoaXMuY2hlY2tFeHBvcnQoZXhwb3J0cywgbm9kZS5leHBvcnRlZCwgdGhpcy5sYXN0VG9rU3RhcnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5leHBvcnRlZCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZXhwZWN0Q29udGV4dHVhbChcImZyb21cIik7XG4gICAgaWYgKHRoaXMudHlwZSAhPT0gdHlwZXMkMS5zdHJpbmcpIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgICBub2RlLnNvdXJjZSA9IHRoaXMucGFyc2VFeHByQXRvbSgpO1xuICAgIHRoaXMuc2VtaWNvbG9uKCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkV4cG9ydEFsbERlY2xhcmF0aW9uXCIpXG4gIH07XG5cbiAgcHAkOC5wYXJzZUV4cG9ydCA9IGZ1bmN0aW9uKG5vZGUsIGV4cG9ydHMpIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICAvLyBleHBvcnQgKiBmcm9tICcuLi4nXG4gICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuc3RhcikpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlRXhwb3J0QWxsRGVjbGFyYXRpb24obm9kZSwgZXhwb3J0cylcbiAgICB9XG4gICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuX2RlZmF1bHQpKSB7IC8vIGV4cG9ydCBkZWZhdWx0IC4uLlxuICAgICAgdGhpcy5jaGVja0V4cG9ydChleHBvcnRzLCBcImRlZmF1bHRcIiwgdGhpcy5sYXN0VG9rU3RhcnQpO1xuICAgICAgbm9kZS5kZWNsYXJhdGlvbiA9IHRoaXMucGFyc2VFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24oKTtcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJFeHBvcnREZWZhdWx0RGVjbGFyYXRpb25cIilcbiAgICB9XG4gICAgLy8gZXhwb3J0IHZhcnxjb25zdHxsZXR8ZnVuY3Rpb258Y2xhc3MgLi4uXG4gICAgaWYgKHRoaXMuc2hvdWxkUGFyc2VFeHBvcnRTdGF0ZW1lbnQoKSkge1xuICAgICAgbm9kZS5kZWNsYXJhdGlvbiA9IHRoaXMucGFyc2VFeHBvcnREZWNsYXJhdGlvbihub2RlKTtcbiAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLnR5cGUgPT09IFwiVmFyaWFibGVEZWNsYXJhdGlvblwiKVxuICAgICAgICB7IHRoaXMuY2hlY2tWYXJpYWJsZUV4cG9ydChleHBvcnRzLCBub2RlLmRlY2xhcmF0aW9uLmRlY2xhcmF0aW9ucyk7IH1cbiAgICAgIGVsc2VcbiAgICAgICAgeyB0aGlzLmNoZWNrRXhwb3J0KGV4cG9ydHMsIG5vZGUuZGVjbGFyYXRpb24uaWQsIG5vZGUuZGVjbGFyYXRpb24uaWQuc3RhcnQpOyB9XG4gICAgICBub2RlLnNwZWNpZmllcnMgPSBbXTtcbiAgICAgIG5vZGUuc291cmNlID0gbnVsbDtcbiAgICB9IGVsc2UgeyAvLyBleHBvcnQgeyB4LCB5IGFzIHogfSBbZnJvbSAnLi4uJ11cbiAgICAgIG5vZGUuZGVjbGFyYXRpb24gPSBudWxsO1xuICAgICAgbm9kZS5zcGVjaWZpZXJzID0gdGhpcy5wYXJzZUV4cG9ydFNwZWNpZmllcnMoZXhwb3J0cyk7XG4gICAgICBpZiAodGhpcy5lYXRDb250ZXh0dWFsKFwiZnJvbVwiKSkge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9PSB0eXBlcyQxLnN0cmluZykgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgICAgICBub2RlLnNvdXJjZSA9IHRoaXMucGFyc2VFeHByQXRvbSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxpc3QgPSBub2RlLnNwZWNpZmllcnM7IGkgPCBsaXN0Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgLy8gY2hlY2sgZm9yIGtleXdvcmRzIHVzZWQgYXMgbG9jYWwgbmFtZXNcbiAgICAgICAgICB2YXIgc3BlYyA9IGxpc3RbaV07XG5cbiAgICAgICAgICB0aGlzLmNoZWNrVW5yZXNlcnZlZChzcGVjLmxvY2FsKTtcbiAgICAgICAgICAvLyBjaGVjayBpZiBleHBvcnQgaXMgZGVmaW5lZFxuICAgICAgICAgIHRoaXMuY2hlY2tMb2NhbEV4cG9ydChzcGVjLmxvY2FsKTtcblxuICAgICAgICAgIGlmIChzcGVjLmxvY2FsLnR5cGUgPT09IFwiTGl0ZXJhbFwiKSB7XG4gICAgICAgICAgICB0aGlzLnJhaXNlKHNwZWMubG9jYWwuc3RhcnQsIFwiQSBzdHJpbmcgbGl0ZXJhbCBjYW5ub3QgYmUgdXNlZCBhcyBhbiBleHBvcnRlZCBiaW5kaW5nIHdpdGhvdXQgYGZyb21gLlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBub2RlLnNvdXJjZSA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLnNlbWljb2xvbigpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiRXhwb3J0TmFtZWREZWNsYXJhdGlvblwiKVxuICB9O1xuXG4gIHBwJDgucGFyc2VFeHBvcnREZWNsYXJhdGlvbiA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZVN0YXRlbWVudChudWxsKVxuICB9O1xuXG4gIHBwJDgucGFyc2VFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXNBc3luYztcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLl9mdW5jdGlvbiB8fCAoaXNBc3luYyA9IHRoaXMuaXNBc3luY0Z1bmN0aW9uKCkpKSB7XG4gICAgICB2YXIgZk5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICBpZiAoaXNBc3luYykgeyB0aGlzLm5leHQoKTsgfVxuICAgICAgcmV0dXJuIHRoaXMucGFyc2VGdW5jdGlvbihmTm9kZSwgRlVOQ19TVEFURU1FTlQgfCBGVU5DX05VTExBQkxFX0lELCBmYWxzZSwgaXNBc3luYylcbiAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5fY2xhc3MpIHtcbiAgICAgIHZhciBjTm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUNsYXNzKGNOb2RlLCBcIm51bGxhYmxlSURcIilcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGRlY2xhcmF0aW9uID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKCk7XG4gICAgICB0aGlzLnNlbWljb2xvbigpO1xuICAgICAgcmV0dXJuIGRlY2xhcmF0aW9uXG4gICAgfVxuICB9O1xuXG4gIHBwJDguY2hlY2tFeHBvcnQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBwb3MpIHtcbiAgICBpZiAoIWV4cG9ydHMpIHsgcmV0dXJuIH1cbiAgICBpZiAodHlwZW9mIG5hbWUgIT09IFwic3RyaW5nXCIpXG4gICAgICB7IG5hbWUgPSBuYW1lLnR5cGUgPT09IFwiSWRlbnRpZmllclwiID8gbmFtZS5uYW1lIDogbmFtZS52YWx1ZTsgfVxuICAgIGlmIChoYXNPd24oZXhwb3J0cywgbmFtZSkpXG4gICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShwb3MsIFwiRHVwbGljYXRlIGV4cG9ydCAnXCIgKyBuYW1lICsgXCInXCIpOyB9XG4gICAgZXhwb3J0c1tuYW1lXSA9IHRydWU7XG4gIH07XG5cbiAgcHAkOC5jaGVja1BhdHRlcm5FeHBvcnQgPSBmdW5jdGlvbihleHBvcnRzLCBwYXQpIHtcbiAgICB2YXIgdHlwZSA9IHBhdC50eXBlO1xuICAgIGlmICh0eXBlID09PSBcIklkZW50aWZpZXJcIilcbiAgICAgIHsgdGhpcy5jaGVja0V4cG9ydChleHBvcnRzLCBwYXQsIHBhdC5zdGFydCk7IH1cbiAgICBlbHNlIGlmICh0eXBlID09PSBcIk9iamVjdFBhdHRlcm5cIilcbiAgICAgIHsgZm9yICh2YXIgaSA9IDAsIGxpc3QgPSBwYXQucHJvcGVydGllczsgaSA8IGxpc3QubGVuZ3RoOyBpICs9IDEpXG4gICAgICAgIHtcbiAgICAgICAgICB2YXIgcHJvcCA9IGxpc3RbaV07XG5cbiAgICAgICAgICB0aGlzLmNoZWNrUGF0dGVybkV4cG9ydChleHBvcnRzLCBwcm9wKTtcbiAgICAgICAgfSB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gXCJBcnJheVBhdHRlcm5cIilcbiAgICAgIHsgZm9yICh2YXIgaSQxID0gMCwgbGlzdCQxID0gcGF0LmVsZW1lbnRzOyBpJDEgPCBsaXN0JDEubGVuZ3RoOyBpJDEgKz0gMSkge1xuICAgICAgICB2YXIgZWx0ID0gbGlzdCQxW2kkMV07XG5cbiAgICAgICAgICBpZiAoZWx0KSB7IHRoaXMuY2hlY2tQYXR0ZXJuRXhwb3J0KGV4cG9ydHMsIGVsdCk7IH1cbiAgICAgIH0gfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09IFwiUHJvcGVydHlcIilcbiAgICAgIHsgdGhpcy5jaGVja1BhdHRlcm5FeHBvcnQoZXhwb3J0cywgcGF0LnZhbHVlKTsgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09IFwiQXNzaWdubWVudFBhdHRlcm5cIilcbiAgICAgIHsgdGhpcy5jaGVja1BhdHRlcm5FeHBvcnQoZXhwb3J0cywgcGF0LmxlZnQpOyB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gXCJSZXN0RWxlbWVudFwiKVxuICAgICAgeyB0aGlzLmNoZWNrUGF0dGVybkV4cG9ydChleHBvcnRzLCBwYXQuYXJndW1lbnQpOyB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gXCJQYXJlbnRoZXNpemVkRXhwcmVzc2lvblwiKVxuICAgICAgeyB0aGlzLmNoZWNrUGF0dGVybkV4cG9ydChleHBvcnRzLCBwYXQuZXhwcmVzc2lvbik7IH1cbiAgfTtcblxuICBwcCQ4LmNoZWNrVmFyaWFibGVFeHBvcnQgPSBmdW5jdGlvbihleHBvcnRzLCBkZWNscykge1xuICAgIGlmICghZXhwb3J0cykgeyByZXR1cm4gfVxuICAgIGZvciAodmFyIGkgPSAwLCBsaXN0ID0gZGVjbHM7IGkgPCBsaXN0Lmxlbmd0aDsgaSArPSAxKVxuICAgICAge1xuICAgICAgdmFyIGRlY2wgPSBsaXN0W2ldO1xuXG4gICAgICB0aGlzLmNoZWNrUGF0dGVybkV4cG9ydChleHBvcnRzLCBkZWNsLmlkKTtcbiAgICB9XG4gIH07XG5cbiAgcHAkOC5zaG91bGRQYXJzZUV4cG9ydFN0YXRlbWVudCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnR5cGUua2V5d29yZCA9PT0gXCJ2YXJcIiB8fFxuICAgICAgdGhpcy50eXBlLmtleXdvcmQgPT09IFwiY29uc3RcIiB8fFxuICAgICAgdGhpcy50eXBlLmtleXdvcmQgPT09IFwiY2xhc3NcIiB8fFxuICAgICAgdGhpcy50eXBlLmtleXdvcmQgPT09IFwiZnVuY3Rpb25cIiB8fFxuICAgICAgdGhpcy5pc0xldCgpIHx8XG4gICAgICB0aGlzLmlzQXN5bmNGdW5jdGlvbigpXG4gIH07XG5cbiAgLy8gUGFyc2VzIGEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgbW9kdWxlIGV4cG9ydHMuXG5cbiAgcHAkOC5wYXJzZUV4cG9ydFNwZWNpZmllciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgbm9kZS5sb2NhbCA9IHRoaXMucGFyc2VNb2R1bGVFeHBvcnROYW1lKCk7XG5cbiAgICBub2RlLmV4cG9ydGVkID0gdGhpcy5lYXRDb250ZXh0dWFsKFwiYXNcIikgPyB0aGlzLnBhcnNlTW9kdWxlRXhwb3J0TmFtZSgpIDogbm9kZS5sb2NhbDtcbiAgICB0aGlzLmNoZWNrRXhwb3J0KFxuICAgICAgZXhwb3J0cyxcbiAgICAgIG5vZGUuZXhwb3J0ZWQsXG4gICAgICBub2RlLmV4cG9ydGVkLnN0YXJ0XG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJFeHBvcnRTcGVjaWZpZXJcIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlRXhwb3J0U3BlY2lmaWVycyA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiAgICB2YXIgbm9kZXMgPSBbXSwgZmlyc3QgPSB0cnVlO1xuICAgIC8vIGV4cG9ydCB7IHgsIHkgYXMgeiB9IFtmcm9tICcuLi4nXVxuICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEuYnJhY2VMKTtcbiAgICB3aGlsZSAoIXRoaXMuZWF0KHR5cGVzJDEuYnJhY2VSKSkge1xuICAgICAgaWYgKCFmaXJzdCkge1xuICAgICAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLmNvbW1hKTtcbiAgICAgICAgaWYgKHRoaXMuYWZ0ZXJUcmFpbGluZ0NvbW1hKHR5cGVzJDEuYnJhY2VSKSkgeyBicmVhayB9XG4gICAgICB9IGVsc2UgeyBmaXJzdCA9IGZhbHNlOyB9XG5cbiAgICAgIG5vZGVzLnB1c2godGhpcy5wYXJzZUV4cG9ydFNwZWNpZmllcihleHBvcnRzKSk7XG4gICAgfVxuICAgIHJldHVybiBub2Rlc1xuICB9O1xuXG4gIC8vIFBhcnNlcyBpbXBvcnQgZGVjbGFyYXRpb24uXG5cbiAgcHAkOC5wYXJzZUltcG9ydCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB0aGlzLm5leHQoKTtcblxuICAgIC8vIGltcG9ydCAnLi4uJ1xuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuc3RyaW5nKSB7XG4gICAgICBub2RlLnNwZWNpZmllcnMgPSBlbXB0eSQxO1xuICAgICAgbm9kZS5zb3VyY2UgPSB0aGlzLnBhcnNlRXhwckF0b20oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZS5zcGVjaWZpZXJzID0gdGhpcy5wYXJzZUltcG9ydFNwZWNpZmllcnMoKTtcbiAgICAgIHRoaXMuZXhwZWN0Q29udGV4dHVhbChcImZyb21cIik7XG4gICAgICBub2RlLnNvdXJjZSA9IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5zdHJpbmcgPyB0aGlzLnBhcnNlRXhwckF0b20oKSA6IHRoaXMudW5leHBlY3RlZCgpO1xuICAgIH1cbiAgICB0aGlzLnNlbWljb2xvbigpO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJJbXBvcnREZWNsYXJhdGlvblwiKVxuICB9O1xuXG4gIC8vIFBhcnNlcyBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIG1vZHVsZSBpbXBvcnRzLlxuXG4gIHBwJDgucGFyc2VJbXBvcnRTcGVjaWZpZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgbm9kZS5pbXBvcnRlZCA9IHRoaXMucGFyc2VNb2R1bGVFeHBvcnROYW1lKCk7XG5cbiAgICBpZiAodGhpcy5lYXRDb250ZXh0dWFsKFwiYXNcIikpIHtcbiAgICAgIG5vZGUubG9jYWwgPSB0aGlzLnBhcnNlSWRlbnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jaGVja1VucmVzZXJ2ZWQobm9kZS5pbXBvcnRlZCk7XG4gICAgICBub2RlLmxvY2FsID0gbm9kZS5pbXBvcnRlZDtcbiAgICB9XG4gICAgdGhpcy5jaGVja0xWYWxTaW1wbGUobm9kZS5sb2NhbCwgQklORF9MRVhJQ0FMKTtcblxuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJJbXBvcnRTcGVjaWZpZXJcIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlSW1wb3J0RGVmYXVsdFNwZWNpZmllciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGltcG9ydCBkZWZhdWx0T2JqLCB7IHgsIHkgYXMgeiB9IGZyb20gJy4uLidcbiAgICB2YXIgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgbm9kZS5sb2NhbCA9IHRoaXMucGFyc2VJZGVudCgpO1xuICAgIHRoaXMuY2hlY2tMVmFsU2ltcGxlKG5vZGUubG9jYWwsIEJJTkRfTEVYSUNBTCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkltcG9ydERlZmF1bHRTcGVjaWZpZXJcIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgIHRoaXMubmV4dCgpO1xuICAgIHRoaXMuZXhwZWN0Q29udGV4dHVhbChcImFzXCIpO1xuICAgIG5vZGUubG9jYWwgPSB0aGlzLnBhcnNlSWRlbnQoKTtcbiAgICB0aGlzLmNoZWNrTFZhbFNpbXBsZShub2RlLmxvY2FsLCBCSU5EX0xFWElDQUwpO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXJcIilcbiAgfTtcblxuICBwcCQ4LnBhcnNlSW1wb3J0U3BlY2lmaWVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBub2RlcyA9IFtdLCBmaXJzdCA9IHRydWU7XG4gICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5uYW1lKSB7XG4gICAgICBub2Rlcy5wdXNoKHRoaXMucGFyc2VJbXBvcnREZWZhdWx0U3BlY2lmaWVyKCkpO1xuICAgICAgaWYgKCF0aGlzLmVhdCh0eXBlcyQxLmNvbW1hKSkgeyByZXR1cm4gbm9kZXMgfVxuICAgIH1cbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLnN0YXIpIHtcbiAgICAgIG5vZGVzLnB1c2godGhpcy5wYXJzZUltcG9ydE5hbWVzcGFjZVNwZWNpZmllcigpKTtcbiAgICAgIHJldHVybiBub2Rlc1xuICAgIH1cbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLmJyYWNlTCk7XG4gICAgd2hpbGUgKCF0aGlzLmVhdCh0eXBlcyQxLmJyYWNlUikpIHtcbiAgICAgIGlmICghZmlyc3QpIHtcbiAgICAgICAgdGhpcy5leHBlY3QodHlwZXMkMS5jb21tYSk7XG4gICAgICAgIGlmICh0aGlzLmFmdGVyVHJhaWxpbmdDb21tYSh0eXBlcyQxLmJyYWNlUikpIHsgYnJlYWsgfVxuICAgICAgfSBlbHNlIHsgZmlyc3QgPSBmYWxzZTsgfVxuXG4gICAgICBub2Rlcy5wdXNoKHRoaXMucGFyc2VJbXBvcnRTcGVjaWZpZXIoKSk7XG4gICAgfVxuICAgIHJldHVybiBub2Rlc1xuICB9O1xuXG4gIHBwJDgucGFyc2VNb2R1bGVFeHBvcnROYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSAxMyAmJiB0aGlzLnR5cGUgPT09IHR5cGVzJDEuc3RyaW5nKSB7XG4gICAgICB2YXIgc3RyaW5nTGl0ZXJhbCA9IHRoaXMucGFyc2VMaXRlcmFsKHRoaXMudmFsdWUpO1xuICAgICAgaWYgKGxvbmVTdXJyb2dhdGUudGVzdChzdHJpbmdMaXRlcmFsLnZhbHVlKSkge1xuICAgICAgICB0aGlzLnJhaXNlKHN0cmluZ0xpdGVyYWwuc3RhcnQsIFwiQW4gZXhwb3J0IG5hbWUgY2Fubm90IGluY2x1ZGUgYSBsb25lIHN1cnJvZ2F0ZS5cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RyaW5nTGl0ZXJhbFxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wYXJzZUlkZW50KHRydWUpXG4gIH07XG5cbiAgLy8gU2V0IGBFeHByZXNzaW9uU3RhdGVtZW50I2RpcmVjdGl2ZWAgcHJvcGVydHkgZm9yIGRpcmVjdGl2ZSBwcm9sb2d1ZXMuXG4gIHBwJDguYWRhcHREaXJlY3RpdmVQcm9sb2d1ZSA9IGZ1bmN0aW9uKHN0YXRlbWVudHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YXRlbWVudHMubGVuZ3RoICYmIHRoaXMuaXNEaXJlY3RpdmVDYW5kaWRhdGUoc3RhdGVtZW50c1tpXSk7ICsraSkge1xuICAgICAgc3RhdGVtZW50c1tpXS5kaXJlY3RpdmUgPSBzdGF0ZW1lbnRzW2ldLmV4cHJlc3Npb24ucmF3LnNsaWNlKDEsIC0xKTtcbiAgICB9XG4gIH07XG4gIHBwJDguaXNEaXJlY3RpdmVDYW5kaWRhdGUgPSBmdW5jdGlvbihzdGF0ZW1lbnQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDUgJiZcbiAgICAgIHN0YXRlbWVudC50eXBlID09PSBcIkV4cHJlc3Npb25TdGF0ZW1lbnRcIiAmJlxuICAgICAgc3RhdGVtZW50LmV4cHJlc3Npb24udHlwZSA9PT0gXCJMaXRlcmFsXCIgJiZcbiAgICAgIHR5cGVvZiBzdGF0ZW1lbnQuZXhwcmVzc2lvbi52YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJlxuICAgICAgLy8gUmVqZWN0IHBhcmVudGhlc2l6ZWQgc3RyaW5ncy5cbiAgICAgICh0aGlzLmlucHV0W3N0YXRlbWVudC5zdGFydF0gPT09IFwiXFxcIlwiIHx8IHRoaXMuaW5wdXRbc3RhdGVtZW50LnN0YXJ0XSA9PT0gXCInXCIpXG4gICAgKVxuICB9O1xuXG4gIHZhciBwcCQ3ID0gUGFyc2VyLnByb3RvdHlwZTtcblxuICAvLyBDb252ZXJ0IGV4aXN0aW5nIGV4cHJlc3Npb24gYXRvbSB0byBhc3NpZ25hYmxlIHBhdHRlcm5cbiAgLy8gaWYgcG9zc2libGUuXG5cbiAgcHAkNy50b0Fzc2lnbmFibGUgPSBmdW5jdGlvbihub2RlLCBpc0JpbmRpbmcsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYgJiYgbm9kZSkge1xuICAgICAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICAgIGNhc2UgXCJJZGVudGlmaWVyXCI6XG4gICAgICAgIGlmICh0aGlzLmluQXN5bmMgJiYgbm9kZS5uYW1lID09PSBcImF3YWl0XCIpXG4gICAgICAgICAgeyB0aGlzLnJhaXNlKG5vZGUuc3RhcnQsIFwiQ2Fubm90IHVzZSAnYXdhaXQnIGFzIGlkZW50aWZpZXIgaW5zaWRlIGFuIGFzeW5jIGZ1bmN0aW9uXCIpOyB9XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgXCJPYmplY3RQYXR0ZXJuXCI6XG4gICAgICBjYXNlIFwiQXJyYXlQYXR0ZXJuXCI6XG4gICAgICBjYXNlIFwiQXNzaWdubWVudFBhdHRlcm5cIjpcbiAgICAgIGNhc2UgXCJSZXN0RWxlbWVudFwiOlxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlIFwiT2JqZWN0RXhwcmVzc2lvblwiOlxuICAgICAgICBub2RlLnR5cGUgPSBcIk9iamVjdFBhdHRlcm5cIjtcbiAgICAgICAgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpIHsgdGhpcy5jaGVja1BhdHRlcm5FcnJvcnMocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycywgdHJ1ZSk7IH1cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxpc3QgPSBub2RlLnByb3BlcnRpZXM7IGkgPCBsaXN0Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgdmFyIHByb3AgPSBsaXN0W2ldO1xuXG4gICAgICAgIHRoaXMudG9Bc3NpZ25hYmxlKHByb3AsIGlzQmluZGluZyk7XG4gICAgICAgICAgLy8gRWFybHkgZXJyb3I6XG4gICAgICAgICAgLy8gICBBc3NpZ25tZW50UmVzdFByb3BlcnR5W1lpZWxkLCBBd2FpdF0gOlxuICAgICAgICAgIC8vICAgICBgLi4uYCBEZXN0cnVjdHVyaW5nQXNzaWdubWVudFRhcmdldFtZaWVsZCwgQXdhaXRdXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyAgIEl0IGlzIGEgU3ludGF4IEVycm9yIGlmIHxEZXN0cnVjdHVyaW5nQXNzaWdubWVudFRhcmdldHwgaXMgYW4gfEFycmF5TGl0ZXJhbHwgb3IgYW4gfE9iamVjdExpdGVyYWx8LlxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHByb3AudHlwZSA9PT0gXCJSZXN0RWxlbWVudFwiICYmXG4gICAgICAgICAgICAocHJvcC5hcmd1bWVudC50eXBlID09PSBcIkFycmF5UGF0dGVyblwiIHx8IHByb3AuYXJndW1lbnQudHlwZSA9PT0gXCJPYmplY3RQYXR0ZXJuXCIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLnJhaXNlKHByb3AuYXJndW1lbnQuc3RhcnQsIFwiVW5leHBlY3RlZCB0b2tlblwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBcIlByb3BlcnR5XCI6XG4gICAgICAgIC8vIEFzc2lnbm1lbnRQcm9wZXJ0eSBoYXMgdHlwZSA9PT0gXCJQcm9wZXJ0eVwiXG4gICAgICAgIGlmIChub2RlLmtpbmQgIT09IFwiaW5pdFwiKSB7IHRoaXMucmFpc2Uobm9kZS5rZXkuc3RhcnQsIFwiT2JqZWN0IHBhdHRlcm4gY2FuJ3QgY29udGFpbiBnZXR0ZXIgb3Igc2V0dGVyXCIpOyB9XG4gICAgICAgIHRoaXMudG9Bc3NpZ25hYmxlKG5vZGUudmFsdWUsIGlzQmluZGluZyk7XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgXCJBcnJheUV4cHJlc3Npb25cIjpcbiAgICAgICAgbm9kZS50eXBlID0gXCJBcnJheVBhdHRlcm5cIjtcbiAgICAgICAgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpIHsgdGhpcy5jaGVja1BhdHRlcm5FcnJvcnMocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycywgdHJ1ZSk7IH1cbiAgICAgICAgdGhpcy50b0Fzc2lnbmFibGVMaXN0KG5vZGUuZWxlbWVudHMsIGlzQmluZGluZyk7XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgXCJTcHJlYWRFbGVtZW50XCI6XG4gICAgICAgIG5vZGUudHlwZSA9IFwiUmVzdEVsZW1lbnRcIjtcbiAgICAgICAgdGhpcy50b0Fzc2lnbmFibGUobm9kZS5hcmd1bWVudCwgaXNCaW5kaW5nKTtcbiAgICAgICAgaWYgKG5vZGUuYXJndW1lbnQudHlwZSA9PT0gXCJBc3NpZ25tZW50UGF0dGVyblwiKVxuICAgICAgICAgIHsgdGhpcy5yYWlzZShub2RlLmFyZ3VtZW50LnN0YXJ0LCBcIlJlc3QgZWxlbWVudHMgY2Fubm90IGhhdmUgYSBkZWZhdWx0IHZhbHVlXCIpOyB9XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgXCJBc3NpZ25tZW50RXhwcmVzc2lvblwiOlxuICAgICAgICBpZiAobm9kZS5vcGVyYXRvciAhPT0gXCI9XCIpIHsgdGhpcy5yYWlzZShub2RlLmxlZnQuZW5kLCBcIk9ubHkgJz0nIG9wZXJhdG9yIGNhbiBiZSB1c2VkIGZvciBzcGVjaWZ5aW5nIGRlZmF1bHQgdmFsdWUuXCIpOyB9XG4gICAgICAgIG5vZGUudHlwZSA9IFwiQXNzaWdubWVudFBhdHRlcm5cIjtcbiAgICAgICAgZGVsZXRlIG5vZGUub3BlcmF0b3I7XG4gICAgICAgIHRoaXMudG9Bc3NpZ25hYmxlKG5vZGUubGVmdCwgaXNCaW5kaW5nKTtcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBcIlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uXCI6XG4gICAgICAgIHRoaXMudG9Bc3NpZ25hYmxlKG5vZGUuZXhwcmVzc2lvbiwgaXNCaW5kaW5nLCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKTtcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBcIkNoYWluRXhwcmVzc2lvblwiOlxuICAgICAgICB0aGlzLnJhaXNlUmVjb3ZlcmFibGUobm9kZS5zdGFydCwgXCJPcHRpb25hbCBjaGFpbmluZyBjYW5ub3QgYXBwZWFyIGluIGxlZnQtaGFuZCBzaWRlXCIpO1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlIFwiTWVtYmVyRXhwcmVzc2lvblwiOlxuICAgICAgICBpZiAoIWlzQmluZGluZykgeyBicmVhayB9XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMucmFpc2Uobm9kZS5zdGFydCwgXCJBc3NpZ25pbmcgdG8gcnZhbHVlXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykgeyB0aGlzLmNoZWNrUGF0dGVybkVycm9ycyhyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCB0cnVlKTsgfVxuICAgIHJldHVybiBub2RlXG4gIH07XG5cbiAgLy8gQ29udmVydCBsaXN0IG9mIGV4cHJlc3Npb24gYXRvbXMgdG8gYmluZGluZyBsaXN0LlxuXG4gIHBwJDcudG9Bc3NpZ25hYmxlTGlzdCA9IGZ1bmN0aW9uKGV4cHJMaXN0LCBpc0JpbmRpbmcpIHtcbiAgICB2YXIgZW5kID0gZXhwckxpc3QubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHZhciBlbHQgPSBleHByTGlzdFtpXTtcbiAgICAgIGlmIChlbHQpIHsgdGhpcy50b0Fzc2lnbmFibGUoZWx0LCBpc0JpbmRpbmcpOyB9XG4gICAgfVxuICAgIGlmIChlbmQpIHtcbiAgICAgIHZhciBsYXN0ID0gZXhwckxpc3RbZW5kIC0gMV07XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID09PSA2ICYmIGlzQmluZGluZyAmJiBsYXN0ICYmIGxhc3QudHlwZSA9PT0gXCJSZXN0RWxlbWVudFwiICYmIGxhc3QuYXJndW1lbnQudHlwZSAhPT0gXCJJZGVudGlmaWVyXCIpXG4gICAgICAgIHsgdGhpcy51bmV4cGVjdGVkKGxhc3QuYXJndW1lbnQuc3RhcnQpOyB9XG4gICAgfVxuICAgIHJldHVybiBleHByTGlzdFxuICB9O1xuXG4gIC8vIFBhcnNlcyBzcHJlYWQgZWxlbWVudC5cblxuICBwcCQ3LnBhcnNlU3ByZWFkID0gZnVuY3Rpb24ocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykge1xuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICB0aGlzLm5leHQoKTtcbiAgICBub2RlLmFyZ3VtZW50ID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKGZhbHNlLCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiU3ByZWFkRWxlbWVudFwiKVxuICB9O1xuXG4gIHBwJDcucGFyc2VSZXN0QmluZGluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICB0aGlzLm5leHQoKTtcblxuICAgIC8vIFJlc3RFbGVtZW50IGluc2lkZSBvZiBhIGZ1bmN0aW9uIHBhcmFtZXRlciBtdXN0IGJlIGFuIGlkZW50aWZpZXJcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID09PSA2ICYmIHRoaXMudHlwZSAhPT0gdHlwZXMkMS5uYW1lKVxuICAgICAgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuXG4gICAgbm9kZS5hcmd1bWVudCA9IHRoaXMucGFyc2VCaW5kaW5nQXRvbSgpO1xuXG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIlJlc3RFbGVtZW50XCIpXG4gIH07XG5cbiAgLy8gUGFyc2VzIGx2YWx1ZSAoYXNzaWduYWJsZSkgYXRvbS5cblxuICBwcCQ3LnBhcnNlQmluZGluZ0F0b20gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYpIHtcbiAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgICBjYXNlIHR5cGVzJDEuYnJhY2tldEw6XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgIG5vZGUuZWxlbWVudHMgPSB0aGlzLnBhcnNlQmluZGluZ0xpc3QodHlwZXMkMS5icmFja2V0UiwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJBcnJheVBhdHRlcm5cIilcblxuICAgICAgY2FzZSB0eXBlcyQxLmJyYWNlTDpcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VPYmoodHJ1ZSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGFyc2VJZGVudCgpXG4gIH07XG5cbiAgcHAkNy5wYXJzZUJpbmRpbmdMaXN0ID0gZnVuY3Rpb24oY2xvc2UsIGFsbG93RW1wdHksIGFsbG93VHJhaWxpbmdDb21tYSwgYWxsb3dNb2RpZmllcnMpIHtcbiAgICB2YXIgZWx0cyA9IFtdLCBmaXJzdCA9IHRydWU7XG4gICAgd2hpbGUgKCF0aGlzLmVhdChjbG9zZSkpIHtcbiAgICAgIGlmIChmaXJzdCkgeyBmaXJzdCA9IGZhbHNlOyB9XG4gICAgICBlbHNlIHsgdGhpcy5leHBlY3QodHlwZXMkMS5jb21tYSk7IH1cbiAgICAgIGlmIChhbGxvd0VtcHR5ICYmIHRoaXMudHlwZSA9PT0gdHlwZXMkMS5jb21tYSkge1xuICAgICAgICBlbHRzLnB1c2gobnVsbCk7XG4gICAgICB9IGVsc2UgaWYgKGFsbG93VHJhaWxpbmdDb21tYSAmJiB0aGlzLmFmdGVyVHJhaWxpbmdDb21tYShjbG9zZSkpIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLmVsbGlwc2lzKSB7XG4gICAgICAgIHZhciByZXN0ID0gdGhpcy5wYXJzZVJlc3RCaW5kaW5nKCk7XG4gICAgICAgIHRoaXMucGFyc2VCaW5kaW5nTGlzdEl0ZW0ocmVzdCk7XG4gICAgICAgIGVsdHMucHVzaChyZXN0KTtcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5jb21tYSkgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUodGhpcy5zdGFydCwgXCJDb21tYSBpcyBub3QgcGVybWl0dGVkIGFmdGVyIHRoZSByZXN0IGVsZW1lbnRcIik7IH1cbiAgICAgICAgdGhpcy5leHBlY3QoY2xvc2UpO1xuICAgICAgICBicmVha1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWx0cy5wdXNoKHRoaXMucGFyc2VBc3NpZ25hYmxlTGlzdEl0ZW0oYWxsb3dNb2RpZmllcnMpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVsdHNcbiAgfTtcblxuICBwcCQ3LnBhcnNlQXNzaWduYWJsZUxpc3RJdGVtID0gZnVuY3Rpb24oYWxsb3dNb2RpZmllcnMpIHtcbiAgICB2YXIgZWxlbSA9IHRoaXMucGFyc2VNYXliZURlZmF1bHQodGhpcy5zdGFydCwgdGhpcy5zdGFydExvYyk7XG4gICAgdGhpcy5wYXJzZUJpbmRpbmdMaXN0SXRlbShlbGVtKTtcbiAgICByZXR1cm4gZWxlbVxuICB9O1xuXG4gIHBwJDcucGFyc2VCaW5kaW5nTGlzdEl0ZW0gPSBmdW5jdGlvbihwYXJhbSkge1xuICAgIHJldHVybiBwYXJhbVxuICB9O1xuXG4gIC8vIFBhcnNlcyBhc3NpZ25tZW50IHBhdHRlcm4gYXJvdW5kIGdpdmVuIGF0b20gaWYgcG9zc2libGUuXG5cbiAgcHAkNy5wYXJzZU1heWJlRGVmYXVsdCA9IGZ1bmN0aW9uKHN0YXJ0UG9zLCBzdGFydExvYywgbGVmdCkge1xuICAgIGxlZnQgPSBsZWZ0IHx8IHRoaXMucGFyc2VCaW5kaW5nQXRvbSgpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPCA2IHx8ICF0aGlzLmVhdCh0eXBlcyQxLmVxKSkgeyByZXR1cm4gbGVmdCB9XG4gICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyk7XG4gICAgbm9kZS5sZWZ0ID0gbGVmdDtcbiAgICBub2RlLnJpZ2h0ID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkFzc2lnbm1lbnRQYXR0ZXJuXCIpXG4gIH07XG5cbiAgLy8gVGhlIGZvbGxvd2luZyB0aHJlZSBmdW5jdGlvbnMgYWxsIHZlcmlmeSB0aGF0IGEgbm9kZSBpcyBhbiBsdmFsdWUg4oCUXG4gIC8vIHNvbWV0aGluZyB0aGF0IGNhbiBiZSBib3VuZCwgb3IgYXNzaWduZWQgdG8uIEluIG9yZGVyIHRvIGRvIHNvLCB0aGV5IHBlcmZvcm1cbiAgLy8gYSB2YXJpZXR5IG9mIGNoZWNrczpcbiAgLy9cbiAgLy8gLSBDaGVjayB0aGF0IG5vbmUgb2YgdGhlIGJvdW5kL2Fzc2lnbmVkLXRvIGlkZW50aWZpZXJzIGFyZSByZXNlcnZlZCB3b3Jkcy5cbiAgLy8gLSBSZWNvcmQgbmFtZSBkZWNsYXJhdGlvbnMgZm9yIGJpbmRpbmdzIGluIHRoZSBhcHByb3ByaWF0ZSBzY29wZS5cbiAgLy8gLSBDaGVjayBkdXBsaWNhdGUgYXJndW1lbnQgbmFtZXMsIGlmIGNoZWNrQ2xhc2hlcyBpcyBzZXQuXG4gIC8vXG4gIC8vIElmIGEgY29tcGxleCBiaW5kaW5nIHBhdHRlcm4gaXMgZW5jb3VudGVyZWQgKGUuZy4sIG9iamVjdCBhbmQgYXJyYXlcbiAgLy8gZGVzdHJ1Y3R1cmluZyksIHRoZSBlbnRpcmUgcGF0dGVybiBpcyByZWN1cnNpdmVseSBjaGVja2VkLlxuICAvL1xuICAvLyBUaGVyZSBhcmUgdGhyZWUgdmVyc2lvbnMgb2YgY2hlY2tMVmFsKigpIGFwcHJvcHJpYXRlIGZvciBkaWZmZXJlbnRcbiAgLy8gY2lyY3Vtc3RhbmNlczpcbiAgLy9cbiAgLy8gLSBjaGVja0xWYWxTaW1wbGUoKSBzaGFsbCBiZSB1c2VkIGlmIHRoZSBzeW50YWN0aWMgY29uc3RydWN0IHN1cHBvcnRzXG4gIC8vICAgbm90aGluZyBvdGhlciB0aGFuIGlkZW50aWZpZXJzIGFuZCBtZW1iZXIgZXhwcmVzc2lvbnMuIFBhcmVudGhlc2l6ZWRcbiAgLy8gICBleHByZXNzaW9ucyBhcmUgYWxzbyBjb3JyZWN0bHkgaGFuZGxlZC4gVGhpcyBpcyBnZW5lcmFsbHkgYXBwcm9wcmlhdGUgZm9yXG4gIC8vICAgY29uc3RydWN0cyBmb3Igd2hpY2ggdGhlIHNwZWMgc2F5c1xuICAvL1xuICAvLyAgID4gSXQgaXMgYSBTeW50YXggRXJyb3IgaWYgQXNzaWdubWVudFRhcmdldFR5cGUgb2YgW3RoZSBwcm9kdWN0aW9uXSBpcyBub3RcbiAgLy8gICA+IHNpbXBsZS5cbiAgLy9cbiAgLy8gICBJdCBpcyBhbHNvIGFwcHJvcHJpYXRlIGZvciBjaGVja2luZyBpZiBhbiBpZGVudGlmaWVyIGlzIHZhbGlkIGFuZCBub3RcbiAgLy8gICBkZWZpbmVkIGVsc2V3aGVyZSwgbGlrZSBpbXBvcnQgZGVjbGFyYXRpb25zIG9yIGZ1bmN0aW9uL2NsYXNzIGlkZW50aWZpZXJzLlxuICAvL1xuICAvLyAgIEV4YW1wbGVzIHdoZXJlIHRoaXMgaXMgdXNlZCBpbmNsdWRlOlxuICAvLyAgICAgYSArPSDigKY7XG4gIC8vICAgICBpbXBvcnQgYSBmcm9tICfigKYnO1xuICAvLyAgIHdoZXJlIGEgaXMgdGhlIG5vZGUgdG8gYmUgY2hlY2tlZC5cbiAgLy9cbiAgLy8gLSBjaGVja0xWYWxQYXR0ZXJuKCkgc2hhbGwgYmUgdXNlZCBpZiB0aGUgc3ludGFjdGljIGNvbnN0cnVjdCBzdXBwb3J0c1xuICAvLyAgIGFueXRoaW5nIGNoZWNrTFZhbFNpbXBsZSgpIHN1cHBvcnRzLCBhcyB3ZWxsIGFzIG9iamVjdCBhbmQgYXJyYXlcbiAgLy8gICBkZXN0cnVjdHVyaW5nIHBhdHRlcm5zLiBUaGlzIGlzIGdlbmVyYWxseSBhcHByb3ByaWF0ZSBmb3IgY29uc3RydWN0cyBmb3JcbiAgLy8gICB3aGljaCB0aGUgc3BlYyBzYXlzXG4gIC8vXG4gIC8vICAgPiBJdCBpcyBhIFN5bnRheCBFcnJvciBpZiBbdGhlIHByb2R1Y3Rpb25dIGlzIG5laXRoZXIgYW4gT2JqZWN0TGl0ZXJhbCBub3JcbiAgLy8gICA+IGFuIEFycmF5TGl0ZXJhbCBhbmQgQXNzaWdubWVudFRhcmdldFR5cGUgb2YgW3RoZSBwcm9kdWN0aW9uXSBpcyBub3RcbiAgLy8gICA+IHNpbXBsZS5cbiAgLy9cbiAgLy8gICBFeGFtcGxlcyB3aGVyZSB0aGlzIGlzIHVzZWQgaW5jbHVkZTpcbiAgLy8gICAgIChhID0g4oCmKTtcbiAgLy8gICAgIGNvbnN0IGEgPSDigKY7XG4gIC8vICAgICB0cnkgeyDigKYgfSBjYXRjaCAoYSkgeyDigKYgfVxuICAvLyAgIHdoZXJlIGEgaXMgdGhlIG5vZGUgdG8gYmUgY2hlY2tlZC5cbiAgLy9cbiAgLy8gLSBjaGVja0xWYWxJbm5lclBhdHRlcm4oKSBzaGFsbCBiZSB1c2VkIGlmIHRoZSBzeW50YWN0aWMgY29uc3RydWN0IHN1cHBvcnRzXG4gIC8vICAgYW55dGhpbmcgY2hlY2tMVmFsUGF0dGVybigpIHN1cHBvcnRzLCBhcyB3ZWxsIGFzIGRlZmF1bHQgYXNzaWdubWVudFxuICAvLyAgIHBhdHRlcm5zLCByZXN0IGVsZW1lbnRzLCBhbmQgb3RoZXIgY29uc3RydWN0cyB0aGF0IG1heSBhcHBlYXIgd2l0aGluIGFuXG4gIC8vICAgb2JqZWN0IG9yIGFycmF5IGRlc3RydWN0dXJpbmcgcGF0dGVybi5cbiAgLy9cbiAgLy8gICBBcyBhIHNwZWNpYWwgY2FzZSwgZnVuY3Rpb24gcGFyYW1ldGVycyBhbHNvIHVzZSBjaGVja0xWYWxJbm5lclBhdHRlcm4oKSxcbiAgLy8gICBhcyB0aGV5IGFsc28gc3VwcG9ydCBkZWZhdWx0cyBhbmQgcmVzdCBjb25zdHJ1Y3RzLlxuICAvL1xuICAvLyBUaGVzZSBmdW5jdGlvbnMgZGVsaWJlcmF0ZWx5IHN1cHBvcnQgYm90aCBhc3NpZ25tZW50IGFuZCBiaW5kaW5nIGNvbnN0cnVjdHMsXG4gIC8vIGFzIHRoZSBsb2dpYyBmb3IgYm90aCBpcyBleGNlZWRpbmdseSBzaW1pbGFyLiBJZiB0aGUgbm9kZSBpcyB0aGUgdGFyZ2V0IG9mXG4gIC8vIGFuIGFzc2lnbm1lbnQsIHRoZW4gYmluZGluZ1R5cGUgc2hvdWxkIGJlIHNldCB0byBCSU5EX05PTkUuIE90aGVyd2lzZSwgaXRcbiAgLy8gc2hvdWxkIGJlIHNldCB0byB0aGUgYXBwcm9wcmlhdGUgQklORF8qIGNvbnN0YW50LCBsaWtlIEJJTkRfVkFSIG9yXG4gIC8vIEJJTkRfTEVYSUNBTC5cbiAgLy9cbiAgLy8gSWYgdGhlIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIGEgbm9uLUJJTkRfTk9ORSBiaW5kaW5nVHlwZSwgdGhlblxuICAvLyBhZGRpdGlvbmFsbHkgYSBjaGVja0NsYXNoZXMgb2JqZWN0IG1heSBiZSBzcGVjaWZpZWQgdG8gYWxsb3cgY2hlY2tpbmcgZm9yXG4gIC8vIGR1cGxpY2F0ZSBhcmd1bWVudCBuYW1lcy4gY2hlY2tDbGFzaGVzIGlzIGlnbm9yZWQgaWYgdGhlIHByb3ZpZGVkIGNvbnN0cnVjdFxuICAvLyBpcyBhbiBhc3NpZ25tZW50IChpLmUuLCBiaW5kaW5nVHlwZSBpcyBCSU5EX05PTkUpLlxuXG4gIHBwJDcuY2hlY2tMVmFsU2ltcGxlID0gZnVuY3Rpb24oZXhwciwgYmluZGluZ1R5cGUsIGNoZWNrQ2xhc2hlcykge1xuICAgIGlmICggYmluZGluZ1R5cGUgPT09IHZvaWQgMCApIGJpbmRpbmdUeXBlID0gQklORF9OT05FO1xuXG4gICAgdmFyIGlzQmluZCA9IGJpbmRpbmdUeXBlICE9PSBCSU5EX05PTkU7XG5cbiAgICBzd2l0Y2ggKGV4cHIudHlwZSkge1xuICAgIGNhc2UgXCJJZGVudGlmaWVyXCI6XG4gICAgICBpZiAodGhpcy5zdHJpY3QgJiYgdGhpcy5yZXNlcnZlZFdvcmRzU3RyaWN0QmluZC50ZXN0KGV4cHIubmFtZSkpXG4gICAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKGV4cHIuc3RhcnQsIChpc0JpbmQgPyBcIkJpbmRpbmcgXCIgOiBcIkFzc2lnbmluZyB0byBcIikgKyBleHByLm5hbWUgKyBcIiBpbiBzdHJpY3QgbW9kZVwiKTsgfVxuICAgICAgaWYgKGlzQmluZCkge1xuICAgICAgICBpZiAoYmluZGluZ1R5cGUgPT09IEJJTkRfTEVYSUNBTCAmJiBleHByLm5hbWUgPT09IFwibGV0XCIpXG4gICAgICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUoZXhwci5zdGFydCwgXCJsZXQgaXMgZGlzYWxsb3dlZCBhcyBhIGxleGljYWxseSBib3VuZCBuYW1lXCIpOyB9XG4gICAgICAgIGlmIChjaGVja0NsYXNoZXMpIHtcbiAgICAgICAgICBpZiAoaGFzT3duKGNoZWNrQ2xhc2hlcywgZXhwci5uYW1lKSlcbiAgICAgICAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKGV4cHIuc3RhcnQsIFwiQXJndW1lbnQgbmFtZSBjbGFzaFwiKTsgfVxuICAgICAgICAgIGNoZWNrQ2xhc2hlc1tleHByLm5hbWVdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYmluZGluZ1R5cGUgIT09IEJJTkRfT1VUU0lERSkgeyB0aGlzLmRlY2xhcmVOYW1lKGV4cHIubmFtZSwgYmluZGluZ1R5cGUsIGV4cHIuc3RhcnQpOyB9XG4gICAgICB9XG4gICAgICBicmVha1xuXG4gICAgY2FzZSBcIkNoYWluRXhwcmVzc2lvblwiOlxuICAgICAgdGhpcy5yYWlzZVJlY292ZXJhYmxlKGV4cHIuc3RhcnQsIFwiT3B0aW9uYWwgY2hhaW5pbmcgY2Fubm90IGFwcGVhciBpbiBsZWZ0LWhhbmQgc2lkZVwiKTtcbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlIFwiTWVtYmVyRXhwcmVzc2lvblwiOlxuICAgICAgaWYgKGlzQmluZCkgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUoZXhwci5zdGFydCwgXCJCaW5kaW5nIG1lbWJlciBleHByZXNzaW9uXCIpOyB9XG4gICAgICBicmVha1xuXG4gICAgY2FzZSBcIlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uXCI6XG4gICAgICBpZiAoaXNCaW5kKSB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShleHByLnN0YXJ0LCBcIkJpbmRpbmcgcGFyZW50aGVzaXplZCBleHByZXNzaW9uXCIpOyB9XG4gICAgICByZXR1cm4gdGhpcy5jaGVja0xWYWxTaW1wbGUoZXhwci5leHByZXNzaW9uLCBiaW5kaW5nVHlwZSwgY2hlY2tDbGFzaGVzKVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRoaXMucmFpc2UoZXhwci5zdGFydCwgKGlzQmluZCA/IFwiQmluZGluZ1wiIDogXCJBc3NpZ25pbmcgdG9cIikgKyBcIiBydmFsdWVcIik7XG4gICAgfVxuICB9O1xuXG4gIHBwJDcuY2hlY2tMVmFsUGF0dGVybiA9IGZ1bmN0aW9uKGV4cHIsIGJpbmRpbmdUeXBlLCBjaGVja0NsYXNoZXMpIHtcbiAgICBpZiAoIGJpbmRpbmdUeXBlID09PSB2b2lkIDAgKSBiaW5kaW5nVHlwZSA9IEJJTkRfTk9ORTtcblxuICAgIHN3aXRjaCAoZXhwci50eXBlKSB7XG4gICAgY2FzZSBcIk9iamVjdFBhdHRlcm5cIjpcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsaXN0ID0gZXhwci5wcm9wZXJ0aWVzOyBpIDwgbGlzdC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgcHJvcCA9IGxpc3RbaV07XG5cbiAgICAgIHRoaXMuY2hlY2tMVmFsSW5uZXJQYXR0ZXJuKHByb3AsIGJpbmRpbmdUeXBlLCBjaGVja0NsYXNoZXMpO1xuICAgICAgfVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgXCJBcnJheVBhdHRlcm5cIjpcbiAgICAgIGZvciAodmFyIGkkMSA9IDAsIGxpc3QkMSA9IGV4cHIuZWxlbWVudHM7IGkkMSA8IGxpc3QkMS5sZW5ndGg7IGkkMSArPSAxKSB7XG4gICAgICAgIHZhciBlbGVtID0gbGlzdCQxW2kkMV07XG5cbiAgICAgIGlmIChlbGVtKSB7IHRoaXMuY2hlY2tMVmFsSW5uZXJQYXR0ZXJuKGVsZW0sIGJpbmRpbmdUeXBlLCBjaGVja0NsYXNoZXMpOyB9XG4gICAgICB9XG4gICAgICBicmVha1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRoaXMuY2hlY2tMVmFsU2ltcGxlKGV4cHIsIGJpbmRpbmdUeXBlLCBjaGVja0NsYXNoZXMpO1xuICAgIH1cbiAgfTtcblxuICBwcCQ3LmNoZWNrTFZhbElubmVyUGF0dGVybiA9IGZ1bmN0aW9uKGV4cHIsIGJpbmRpbmdUeXBlLCBjaGVja0NsYXNoZXMpIHtcbiAgICBpZiAoIGJpbmRpbmdUeXBlID09PSB2b2lkIDAgKSBiaW5kaW5nVHlwZSA9IEJJTkRfTk9ORTtcblxuICAgIHN3aXRjaCAoZXhwci50eXBlKSB7XG4gICAgY2FzZSBcIlByb3BlcnR5XCI6XG4gICAgICAvLyBBc3NpZ25tZW50UHJvcGVydHkgaGFzIHR5cGUgPT09IFwiUHJvcGVydHlcIlxuICAgICAgdGhpcy5jaGVja0xWYWxJbm5lclBhdHRlcm4oZXhwci52YWx1ZSwgYmluZGluZ1R5cGUsIGNoZWNrQ2xhc2hlcyk7XG4gICAgICBicmVha1xuXG4gICAgY2FzZSBcIkFzc2lnbm1lbnRQYXR0ZXJuXCI6XG4gICAgICB0aGlzLmNoZWNrTFZhbFBhdHRlcm4oZXhwci5sZWZ0LCBiaW5kaW5nVHlwZSwgY2hlY2tDbGFzaGVzKTtcbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlIFwiUmVzdEVsZW1lbnRcIjpcbiAgICAgIHRoaXMuY2hlY2tMVmFsUGF0dGVybihleHByLmFyZ3VtZW50LCBiaW5kaW5nVHlwZSwgY2hlY2tDbGFzaGVzKTtcbiAgICAgIGJyZWFrXG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhpcy5jaGVja0xWYWxQYXR0ZXJuKGV4cHIsIGJpbmRpbmdUeXBlLCBjaGVja0NsYXNoZXMpO1xuICAgIH1cbiAgfTtcblxuICAvLyBUaGUgYWxnb3JpdGhtIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSByZWdleHAgY2FuIGFwcGVhciBhdCBhXG4gIC8vIGdpdmVuIHBvaW50IGluIHRoZSBwcm9ncmFtIGlzIGxvb3NlbHkgYmFzZWQgb24gc3dlZXQuanMnIGFwcHJvYWNoLlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvc3dlZXQuanMvd2lraS9kZXNpZ25cblxuXG4gIHZhciBUb2tDb250ZXh0ID0gZnVuY3Rpb24gVG9rQ29udGV4dCh0b2tlbiwgaXNFeHByLCBwcmVzZXJ2ZVNwYWNlLCBvdmVycmlkZSwgZ2VuZXJhdG9yKSB7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuICAgIHRoaXMuaXNFeHByID0gISFpc0V4cHI7XG4gICAgdGhpcy5wcmVzZXJ2ZVNwYWNlID0gISFwcmVzZXJ2ZVNwYWNlO1xuICAgIHRoaXMub3ZlcnJpZGUgPSBvdmVycmlkZTtcbiAgICB0aGlzLmdlbmVyYXRvciA9ICEhZ2VuZXJhdG9yO1xuICB9O1xuXG4gIHZhciB0eXBlcyA9IHtcbiAgICBiX3N0YXQ6IG5ldyBUb2tDb250ZXh0KFwie1wiLCBmYWxzZSksXG4gICAgYl9leHByOiBuZXcgVG9rQ29udGV4dChcIntcIiwgdHJ1ZSksXG4gICAgYl90bXBsOiBuZXcgVG9rQ29udGV4dChcIiR7XCIsIGZhbHNlKSxcbiAgICBwX3N0YXQ6IG5ldyBUb2tDb250ZXh0KFwiKFwiLCBmYWxzZSksXG4gICAgcF9leHByOiBuZXcgVG9rQ29udGV4dChcIihcIiwgdHJ1ZSksXG4gICAgcV90bXBsOiBuZXcgVG9rQ29udGV4dChcImBcIiwgdHJ1ZSwgdHJ1ZSwgZnVuY3Rpb24gKHApIHsgcmV0dXJuIHAudHJ5UmVhZFRlbXBsYXRlVG9rZW4oKTsgfSksXG4gICAgZl9zdGF0OiBuZXcgVG9rQ29udGV4dChcImZ1bmN0aW9uXCIsIGZhbHNlKSxcbiAgICBmX2V4cHI6IG5ldyBUb2tDb250ZXh0KFwiZnVuY3Rpb25cIiwgdHJ1ZSksXG4gICAgZl9leHByX2dlbjogbmV3IFRva0NvbnRleHQoXCJmdW5jdGlvblwiLCB0cnVlLCBmYWxzZSwgbnVsbCwgdHJ1ZSksXG4gICAgZl9nZW46IG5ldyBUb2tDb250ZXh0KFwiZnVuY3Rpb25cIiwgZmFsc2UsIGZhbHNlLCBudWxsLCB0cnVlKVxuICB9O1xuXG4gIHZhciBwcCQ2ID0gUGFyc2VyLnByb3RvdHlwZTtcblxuICBwcCQ2LmluaXRpYWxDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFt0eXBlcy5iX3N0YXRdXG4gIH07XG5cbiAgcHAkNi5jdXJDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY29udGV4dFt0aGlzLmNvbnRleHQubGVuZ3RoIC0gMV1cbiAgfTtcblxuICBwcCQ2LmJyYWNlSXNCbG9jayA9IGZ1bmN0aW9uKHByZXZUeXBlKSB7XG4gICAgdmFyIHBhcmVudCA9IHRoaXMuY3VyQ29udGV4dCgpO1xuICAgIGlmIChwYXJlbnQgPT09IHR5cGVzLmZfZXhwciB8fCBwYXJlbnQgPT09IHR5cGVzLmZfc3RhdClcbiAgICAgIHsgcmV0dXJuIHRydWUgfVxuICAgIGlmIChwcmV2VHlwZSA9PT0gdHlwZXMkMS5jb2xvbiAmJiAocGFyZW50ID09PSB0eXBlcy5iX3N0YXQgfHwgcGFyZW50ID09PSB0eXBlcy5iX2V4cHIpKVxuICAgICAgeyByZXR1cm4gIXBhcmVudC5pc0V4cHIgfVxuXG4gICAgLy8gVGhlIGNoZWNrIGZvciBgdHQubmFtZSAmJiBleHByQWxsb3dlZGAgZGV0ZWN0cyB3aGV0aGVyIHdlIGFyZVxuICAgIC8vIGFmdGVyIGEgYHlpZWxkYCBvciBgb2ZgIGNvbnN0cnVjdC4gU2VlIHRoZSBgdXBkYXRlQ29udGV4dGAgZm9yXG4gICAgLy8gYHR0Lm5hbWVgLlxuICAgIGlmIChwcmV2VHlwZSA9PT0gdHlwZXMkMS5fcmV0dXJuIHx8IHByZXZUeXBlID09PSB0eXBlcyQxLm5hbWUgJiYgdGhpcy5leHByQWxsb3dlZClcbiAgICAgIHsgcmV0dXJuIGxpbmVCcmVhay50ZXN0KHRoaXMuaW5wdXQuc2xpY2UodGhpcy5sYXN0VG9rRW5kLCB0aGlzLnN0YXJ0KSkgfVxuICAgIGlmIChwcmV2VHlwZSA9PT0gdHlwZXMkMS5fZWxzZSB8fCBwcmV2VHlwZSA9PT0gdHlwZXMkMS5zZW1pIHx8IHByZXZUeXBlID09PSB0eXBlcyQxLmVvZiB8fCBwcmV2VHlwZSA9PT0gdHlwZXMkMS5wYXJlblIgfHwgcHJldlR5cGUgPT09IHR5cGVzJDEuYXJyb3cpXG4gICAgICB7IHJldHVybiB0cnVlIH1cbiAgICBpZiAocHJldlR5cGUgPT09IHR5cGVzJDEuYnJhY2VMKVxuICAgICAgeyByZXR1cm4gcGFyZW50ID09PSB0eXBlcy5iX3N0YXQgfVxuICAgIGlmIChwcmV2VHlwZSA9PT0gdHlwZXMkMS5fdmFyIHx8IHByZXZUeXBlID09PSB0eXBlcyQxLl9jb25zdCB8fCBwcmV2VHlwZSA9PT0gdHlwZXMkMS5uYW1lKVxuICAgICAgeyByZXR1cm4gZmFsc2UgfVxuICAgIHJldHVybiAhdGhpcy5leHByQWxsb3dlZFxuICB9O1xuXG4gIHBwJDYuaW5HZW5lcmF0b3JDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IHRoaXMuY29udGV4dC5sZW5ndGggLSAxOyBpID49IDE7IGktLSkge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLmNvbnRleHRbaV07XG4gICAgICBpZiAoY29udGV4dC50b2tlbiA9PT0gXCJmdW5jdGlvblwiKVxuICAgICAgICB7IHJldHVybiBjb250ZXh0LmdlbmVyYXRvciB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIHBwJDYudXBkYXRlQ29udGV4dCA9IGZ1bmN0aW9uKHByZXZUeXBlKSB7XG4gICAgdmFyIHVwZGF0ZSwgdHlwZSA9IHRoaXMudHlwZTtcbiAgICBpZiAodHlwZS5rZXl3b3JkICYmIHByZXZUeXBlID09PSB0eXBlcyQxLmRvdClcbiAgICAgIHsgdGhpcy5leHByQWxsb3dlZCA9IGZhbHNlOyB9XG4gICAgZWxzZSBpZiAodXBkYXRlID0gdHlwZS51cGRhdGVDb250ZXh0KVxuICAgICAgeyB1cGRhdGUuY2FsbCh0aGlzLCBwcmV2VHlwZSk7IH1cbiAgICBlbHNlXG4gICAgICB7IHRoaXMuZXhwckFsbG93ZWQgPSB0eXBlLmJlZm9yZUV4cHI7IH1cbiAgfTtcblxuICAvLyBVc2VkIHRvIGhhbmRsZSBlZ2RlIGNhc2VzIHdoZW4gdG9rZW4gY29udGV4dCBjb3VsZCBub3QgYmUgaW5mZXJyZWQgY29ycmVjdGx5IGR1cmluZyB0b2tlbml6YXRpb24gcGhhc2VcblxuICBwcCQ2Lm92ZXJyaWRlQ29udGV4dCA9IGZ1bmN0aW9uKHRva2VuQ3R4KSB7XG4gICAgaWYgKHRoaXMuY3VyQ29udGV4dCgpICE9PSB0b2tlbkN0eCkge1xuICAgICAgdGhpcy5jb250ZXh0W3RoaXMuY29udGV4dC5sZW5ndGggLSAxXSA9IHRva2VuQ3R4O1xuICAgIH1cbiAgfTtcblxuICAvLyBUb2tlbi1zcGVjaWZpYyBjb250ZXh0IHVwZGF0ZSBjb2RlXG5cbiAgdHlwZXMkMS5wYXJlblIudXBkYXRlQ29udGV4dCA9IHR5cGVzJDEuYnJhY2VSLnVwZGF0ZUNvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5jb250ZXh0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhpcy5leHByQWxsb3dlZCA9IHRydWU7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdmFyIG91dCA9IHRoaXMuY29udGV4dC5wb3AoKTtcbiAgICBpZiAob3V0ID09PSB0eXBlcy5iX3N0YXQgJiYgdGhpcy5jdXJDb250ZXh0KCkudG9rZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgb3V0ID0gdGhpcy5jb250ZXh0LnBvcCgpO1xuICAgIH1cbiAgICB0aGlzLmV4cHJBbGxvd2VkID0gIW91dC5pc0V4cHI7XG4gIH07XG5cbiAgdHlwZXMkMS5icmFjZUwudXBkYXRlQ29udGV4dCA9IGZ1bmN0aW9uKHByZXZUeXBlKSB7XG4gICAgdGhpcy5jb250ZXh0LnB1c2godGhpcy5icmFjZUlzQmxvY2socHJldlR5cGUpID8gdHlwZXMuYl9zdGF0IDogdHlwZXMuYl9leHByKTtcbiAgICB0aGlzLmV4cHJBbGxvd2VkID0gdHJ1ZTtcbiAgfTtcblxuICB0eXBlcyQxLmRvbGxhckJyYWNlTC51cGRhdGVDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jb250ZXh0LnB1c2godHlwZXMuYl90bXBsKTtcbiAgICB0aGlzLmV4cHJBbGxvd2VkID0gdHJ1ZTtcbiAgfTtcblxuICB0eXBlcyQxLnBhcmVuTC51cGRhdGVDb250ZXh0ID0gZnVuY3Rpb24ocHJldlR5cGUpIHtcbiAgICB2YXIgc3RhdGVtZW50UGFyZW5zID0gcHJldlR5cGUgPT09IHR5cGVzJDEuX2lmIHx8IHByZXZUeXBlID09PSB0eXBlcyQxLl9mb3IgfHwgcHJldlR5cGUgPT09IHR5cGVzJDEuX3dpdGggfHwgcHJldlR5cGUgPT09IHR5cGVzJDEuX3doaWxlO1xuICAgIHRoaXMuY29udGV4dC5wdXNoKHN0YXRlbWVudFBhcmVucyA/IHR5cGVzLnBfc3RhdCA6IHR5cGVzLnBfZXhwcik7XG4gICAgdGhpcy5leHByQWxsb3dlZCA9IHRydWU7XG4gIH07XG5cbiAgdHlwZXMkMS5pbmNEZWMudXBkYXRlQ29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIHRva0V4cHJBbGxvd2VkIHN0YXlzIHVuY2hhbmdlZFxuICB9O1xuXG4gIHR5cGVzJDEuX2Z1bmN0aW9uLnVwZGF0ZUNvbnRleHQgPSB0eXBlcyQxLl9jbGFzcy51cGRhdGVDb250ZXh0ID0gZnVuY3Rpb24ocHJldlR5cGUpIHtcbiAgICBpZiAocHJldlR5cGUuYmVmb3JlRXhwciAmJiBwcmV2VHlwZSAhPT0gdHlwZXMkMS5fZWxzZSAmJlxuICAgICAgICAhKHByZXZUeXBlID09PSB0eXBlcyQxLnNlbWkgJiYgdGhpcy5jdXJDb250ZXh0KCkgIT09IHR5cGVzLnBfc3RhdCkgJiZcbiAgICAgICAgIShwcmV2VHlwZSA9PT0gdHlwZXMkMS5fcmV0dXJuICYmIGxpbmVCcmVhay50ZXN0KHRoaXMuaW5wdXQuc2xpY2UodGhpcy5sYXN0VG9rRW5kLCB0aGlzLnN0YXJ0KSkpICYmXG4gICAgICAgICEoKHByZXZUeXBlID09PSB0eXBlcyQxLmNvbG9uIHx8IHByZXZUeXBlID09PSB0eXBlcyQxLmJyYWNlTCkgJiYgdGhpcy5jdXJDb250ZXh0KCkgPT09IHR5cGVzLmJfc3RhdCkpXG4gICAgICB7IHRoaXMuY29udGV4dC5wdXNoKHR5cGVzLmZfZXhwcik7IH1cbiAgICBlbHNlXG4gICAgICB7IHRoaXMuY29udGV4dC5wdXNoKHR5cGVzLmZfc3RhdCk7IH1cbiAgICB0aGlzLmV4cHJBbGxvd2VkID0gZmFsc2U7XG4gIH07XG5cbiAgdHlwZXMkMS5iYWNrUXVvdGUudXBkYXRlQ29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmN1ckNvbnRleHQoKSA9PT0gdHlwZXMucV90bXBsKVxuICAgICAgeyB0aGlzLmNvbnRleHQucG9wKCk7IH1cbiAgICBlbHNlXG4gICAgICB7IHRoaXMuY29udGV4dC5wdXNoKHR5cGVzLnFfdG1wbCk7IH1cbiAgICB0aGlzLmV4cHJBbGxvd2VkID0gZmFsc2U7XG4gIH07XG5cbiAgdHlwZXMkMS5zdGFyLnVwZGF0ZUNvbnRleHQgPSBmdW5jdGlvbihwcmV2VHlwZSkge1xuICAgIGlmIChwcmV2VHlwZSA9PT0gdHlwZXMkMS5fZnVuY3Rpb24pIHtcbiAgICAgIHZhciBpbmRleCA9IHRoaXMuY29udGV4dC5sZW5ndGggLSAxO1xuICAgICAgaWYgKHRoaXMuY29udGV4dFtpbmRleF0gPT09IHR5cGVzLmZfZXhwcilcbiAgICAgICAgeyB0aGlzLmNvbnRleHRbaW5kZXhdID0gdHlwZXMuZl9leHByX2dlbjsgfVxuICAgICAgZWxzZVxuICAgICAgICB7IHRoaXMuY29udGV4dFtpbmRleF0gPSB0eXBlcy5mX2dlbjsgfVxuICAgIH1cbiAgICB0aGlzLmV4cHJBbGxvd2VkID0gdHJ1ZTtcbiAgfTtcblxuICB0eXBlcyQxLm5hbWUudXBkYXRlQ29udGV4dCA9IGZ1bmN0aW9uKHByZXZUeXBlKSB7XG4gICAgdmFyIGFsbG93ZWQgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYgJiYgcHJldlR5cGUgIT09IHR5cGVzJDEuZG90KSB7XG4gICAgICBpZiAodGhpcy52YWx1ZSA9PT0gXCJvZlwiICYmICF0aGlzLmV4cHJBbGxvd2VkIHx8XG4gICAgICAgICAgdGhpcy52YWx1ZSA9PT0gXCJ5aWVsZFwiICYmIHRoaXMuaW5HZW5lcmF0b3JDb250ZXh0KCkpXG4gICAgICAgIHsgYWxsb3dlZCA9IHRydWU7IH1cbiAgICB9XG4gICAgdGhpcy5leHByQWxsb3dlZCA9IGFsbG93ZWQ7XG4gIH07XG5cbiAgLy8gQSByZWN1cnNpdmUgZGVzY2VudCBwYXJzZXIgb3BlcmF0ZXMgYnkgZGVmaW5pbmcgZnVuY3Rpb25zIGZvciBhbGxcbiAgLy8gc3ludGFjdGljIGVsZW1lbnRzLCBhbmQgcmVjdXJzaXZlbHkgY2FsbGluZyB0aG9zZSwgZWFjaCBmdW5jdGlvblxuICAvLyBhZHZhbmNpbmcgdGhlIGlucHV0IHN0cmVhbSBhbmQgcmV0dXJuaW5nIGFuIEFTVCBub2RlLiBQcmVjZWRlbmNlXG4gIC8vIG9mIGNvbnN0cnVjdHMgKGZvciBleGFtcGxlLCB0aGUgZmFjdCB0aGF0IGAheFsxXWAgbWVhbnMgYCEoeFsxXSlgXG4gIC8vIGluc3RlYWQgb2YgYCgheClbMV1gIGlzIGhhbmRsZWQgYnkgdGhlIGZhY3QgdGhhdCB0aGUgcGFyc2VyXG4gIC8vIGZ1bmN0aW9uIHRoYXQgcGFyc2VzIHVuYXJ5IHByZWZpeCBvcGVyYXRvcnMgaXMgY2FsbGVkIGZpcnN0LCBhbmRcbiAgLy8gaW4gdHVybiBjYWxscyB0aGUgZnVuY3Rpb24gdGhhdCBwYXJzZXMgYFtdYCBzdWJzY3JpcHRzIOKAlCB0aGF0XG4gIC8vIHdheSwgaXQnbGwgcmVjZWl2ZSB0aGUgbm9kZSBmb3IgYHhbMV1gIGFscmVhZHkgcGFyc2VkLCBhbmQgd3JhcHNcbiAgLy8gKnRoYXQqIGluIHRoZSB1bmFyeSBvcGVyYXRvciBub2RlLlxuICAvL1xuICAvLyBBY29ybiB1c2VzIGFuIFtvcGVyYXRvciBwcmVjZWRlbmNlIHBhcnNlcl1bb3BwXSB0byBoYW5kbGUgYmluYXJ5XG4gIC8vIG9wZXJhdG9yIHByZWNlZGVuY2UsIGJlY2F1c2UgaXQgaXMgbXVjaCBtb3JlIGNvbXBhY3QgdGhhbiB1c2luZ1xuICAvLyB0aGUgdGVjaG5pcXVlIG91dGxpbmVkIGFib3ZlLCB3aGljaCB1c2VzIGRpZmZlcmVudCwgbmVzdGluZ1xuICAvLyBmdW5jdGlvbnMgdG8gc3BlY2lmeSBwcmVjZWRlbmNlLCBmb3IgYWxsIG9mIHRoZSB0ZW4gYmluYXJ5XG4gIC8vIHByZWNlZGVuY2UgbGV2ZWxzIHRoYXQgSmF2YVNjcmlwdCBkZWZpbmVzLlxuICAvL1xuICAvLyBbb3BwXTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9PcGVyYXRvci1wcmVjZWRlbmNlX3BhcnNlclxuXG5cbiAgdmFyIHBwJDUgPSBQYXJzZXIucHJvdG90eXBlO1xuXG4gIC8vIENoZWNrIGlmIHByb3BlcnR5IG5hbWUgY2xhc2hlcyB3aXRoIGFscmVhZHkgYWRkZWQuXG4gIC8vIE9iamVjdC9jbGFzcyBnZXR0ZXJzIGFuZCBzZXR0ZXJzIGFyZSBub3QgYWxsb3dlZCB0byBjbGFzaCDigJRcbiAgLy8gZWl0aGVyIHdpdGggZWFjaCBvdGhlciBvciB3aXRoIGFuIGluaXQgcHJvcGVydHkg4oCUIGFuZCBpblxuICAvLyBzdHJpY3QgbW9kZSwgaW5pdCBwcm9wZXJ0aWVzIGFyZSBhbHNvIG5vdCBhbGxvd2VkIHRvIGJlIHJlcGVhdGVkLlxuXG4gIHBwJDUuY2hlY2tQcm9wQ2xhc2ggPSBmdW5jdGlvbihwcm9wLCBwcm9wSGFzaCwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOSAmJiBwcm9wLnR5cGUgPT09IFwiU3ByZWFkRWxlbWVudFwiKVxuICAgICAgeyByZXR1cm4gfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNiAmJiAocHJvcC5jb21wdXRlZCB8fCBwcm9wLm1ldGhvZCB8fCBwcm9wLnNob3J0aGFuZCkpXG4gICAgICB7IHJldHVybiB9XG4gICAgdmFyIGtleSA9IHByb3Aua2V5O1xuICAgIHZhciBuYW1lO1xuICAgIHN3aXRjaCAoa2V5LnR5cGUpIHtcbiAgICBjYXNlIFwiSWRlbnRpZmllclwiOiBuYW1lID0ga2V5Lm5hbWU7IGJyZWFrXG4gICAgY2FzZSBcIkxpdGVyYWxcIjogbmFtZSA9IFN0cmluZyhrZXkudmFsdWUpOyBicmVha1xuICAgIGRlZmF1bHQ6IHJldHVyblxuICAgIH1cbiAgICB2YXIga2luZCA9IHByb3Aua2luZDtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYpIHtcbiAgICAgIGlmIChuYW1lID09PSBcIl9fcHJvdG9fX1wiICYmIGtpbmQgPT09IFwiaW5pdFwiKSB7XG4gICAgICAgIGlmIChwcm9wSGFzaC5wcm90bykge1xuICAgICAgICAgIGlmIChyZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSB7XG4gICAgICAgICAgICBpZiAocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5kb3VibGVQcm90byA8IDApIHtcbiAgICAgICAgICAgICAgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5kb3VibGVQcm90byA9IGtleS5zdGFydDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yYWlzZVJlY292ZXJhYmxlKGtleS5zdGFydCwgXCJSZWRlZmluaXRpb24gb2YgX19wcm90b19fIHByb3BlcnR5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcm9wSGFzaC5wcm90byA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbmFtZSA9IFwiJFwiICsgbmFtZTtcbiAgICB2YXIgb3RoZXIgPSBwcm9wSGFzaFtuYW1lXTtcbiAgICBpZiAob3RoZXIpIHtcbiAgICAgIHZhciByZWRlZmluaXRpb247XG4gICAgICBpZiAoa2luZCA9PT0gXCJpbml0XCIpIHtcbiAgICAgICAgcmVkZWZpbml0aW9uID0gdGhpcy5zdHJpY3QgJiYgb3RoZXIuaW5pdCB8fCBvdGhlci5nZXQgfHwgb3RoZXIuc2V0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVkZWZpbml0aW9uID0gb3RoZXIuaW5pdCB8fCBvdGhlcltraW5kXTtcbiAgICAgIH1cbiAgICAgIGlmIChyZWRlZmluaXRpb24pXG4gICAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKGtleS5zdGFydCwgXCJSZWRlZmluaXRpb24gb2YgcHJvcGVydHlcIik7IH1cbiAgICB9IGVsc2Uge1xuICAgICAgb3RoZXIgPSBwcm9wSGFzaFtuYW1lXSA9IHtcbiAgICAgICAgaW5pdDogZmFsc2UsXG4gICAgICAgIGdldDogZmFsc2UsXG4gICAgICAgIHNldDogZmFsc2VcbiAgICAgIH07XG4gICAgfVxuICAgIG90aGVyW2tpbmRdID0gdHJ1ZTtcbiAgfTtcblxuICAvLyAjIyMgRXhwcmVzc2lvbiBwYXJzaW5nXG5cbiAgLy8gVGhlc2UgbmVzdCwgZnJvbSB0aGUgbW9zdCBnZW5lcmFsIGV4cHJlc3Npb24gdHlwZSBhdCB0aGUgdG9wIHRvXG4gIC8vICdhdG9taWMnLCBub25kaXZpc2libGUgZXhwcmVzc2lvbiB0eXBlcyBhdCB0aGUgYm90dG9tLiBNb3N0IG9mXG4gIC8vIHRoZSBmdW5jdGlvbnMgd2lsbCBzaW1wbHkgbGV0IHRoZSBmdW5jdGlvbihzKSBiZWxvdyB0aGVtIHBhcnNlLFxuICAvLyBhbmQsICppZiogdGhlIHN5bnRhY3RpYyBjb25zdHJ1Y3QgdGhleSBoYW5kbGUgaXMgcHJlc2VudCwgd3JhcFxuICAvLyB0aGUgQVNUIG5vZGUgdGhhdCB0aGUgaW5uZXIgcGFyc2VyIGdhdmUgdGhlbSBpbiBhbm90aGVyIG5vZGUuXG5cbiAgLy8gUGFyc2UgYSBmdWxsIGV4cHJlc3Npb24uIFRoZSBvcHRpb25hbCBhcmd1bWVudHMgYXJlIHVzZWQgdG9cbiAgLy8gZm9yYmlkIHRoZSBgaW5gIG9wZXJhdG9yIChpbiBmb3IgbG9vcHMgaW5pdGFsaXphdGlvbiBleHByZXNzaW9ucylcbiAgLy8gYW5kIHByb3ZpZGUgcmVmZXJlbmNlIGZvciBzdG9yaW5nICc9JyBvcGVyYXRvciBpbnNpZGUgc2hvcnRoYW5kXG4gIC8vIHByb3BlcnR5IGFzc2lnbm1lbnQgaW4gY29udGV4dHMgd2hlcmUgYm90aCBvYmplY3QgZXhwcmVzc2lvblxuICAvLyBhbmQgb2JqZWN0IHBhdHRlcm4gbWlnaHQgYXBwZWFyIChzbyBpdCdzIHBvc3NpYmxlIHRvIHJhaXNlXG4gIC8vIGRlbGF5ZWQgc3ludGF4IGVycm9yIGF0IGNvcnJlY3QgcG9zaXRpb24pLlxuXG4gIHBwJDUucGFyc2VFeHByZXNzaW9uID0gZnVuY3Rpb24oZm9ySW5pdCwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykge1xuICAgIHZhciBzdGFydFBvcyA9IHRoaXMuc3RhcnQsIHN0YXJ0TG9jID0gdGhpcy5zdGFydExvYztcbiAgICB2YXIgZXhwciA9IHRoaXMucGFyc2VNYXliZUFzc2lnbihmb3JJbml0LCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKTtcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLmNvbW1hKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXMuc3RhcnROb2RlQXQoc3RhcnRQb3MsIHN0YXJ0TG9jKTtcbiAgICAgIG5vZGUuZXhwcmVzc2lvbnMgPSBbZXhwcl07XG4gICAgICB3aGlsZSAodGhpcy5lYXQodHlwZXMkMS5jb21tYSkpIHsgbm9kZS5leHByZXNzaW9ucy5wdXNoKHRoaXMucGFyc2VNYXliZUFzc2lnbihmb3JJbml0LCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSk7IH1cbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJTZXF1ZW5jZUV4cHJlc3Npb25cIilcbiAgICB9XG4gICAgcmV0dXJuIGV4cHJcbiAgfTtcblxuICAvLyBQYXJzZSBhbiBhc3NpZ25tZW50IGV4cHJlc3Npb24uIFRoaXMgaW5jbHVkZXMgYXBwbGljYXRpb25zIG9mXG4gIC8vIG9wZXJhdG9ycyBsaWtlIGArPWAuXG5cbiAgcHAkNS5wYXJzZU1heWJlQXNzaWduID0gZnVuY3Rpb24oZm9ySW5pdCwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycywgYWZ0ZXJMZWZ0UGFyc2UpIHtcbiAgICBpZiAodGhpcy5pc0NvbnRleHR1YWwoXCJ5aWVsZFwiKSkge1xuICAgICAgaWYgKHRoaXMuaW5HZW5lcmF0b3IpIHsgcmV0dXJuIHRoaXMucGFyc2VZaWVsZChmb3JJbml0KSB9XG4gICAgICAvLyBUaGUgdG9rZW5pemVyIHdpbGwgYXNzdW1lIGFuIGV4cHJlc3Npb24gaXMgYWxsb3dlZCBhZnRlclxuICAgICAgLy8gYHlpZWxkYCwgYnV0IHRoaXMgaXNuJ3QgdGhhdCBraW5kIG9mIHlpZWxkXG4gICAgICBlbHNlIHsgdGhpcy5leHByQWxsb3dlZCA9IGZhbHNlOyB9XG4gICAgfVxuXG4gICAgdmFyIG93bkRlc3RydWN0dXJpbmdFcnJvcnMgPSBmYWxzZSwgb2xkUGFyZW5Bc3NpZ24gPSAtMSwgb2xkVHJhaWxpbmdDb21tYSA9IC0xLCBvbGREb3VibGVQcm90byA9IC0xO1xuICAgIGlmIChyZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSB7XG4gICAgICBvbGRQYXJlbkFzc2lnbiA9IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMucGFyZW50aGVzaXplZEFzc2lnbjtcbiAgICAgIG9sZFRyYWlsaW5nQ29tbWEgPSByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnRyYWlsaW5nQ29tbWE7XG4gICAgICBvbGREb3VibGVQcm90byA9IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMuZG91YmxlUHJvdG87XG4gICAgICByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnBhcmVudGhlc2l6ZWRBc3NpZ24gPSByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnRyYWlsaW5nQ29tbWEgPSAtMTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyA9IG5ldyBEZXN0cnVjdHVyaW5nRXJyb3JzO1xuICAgICAgb3duRGVzdHJ1Y3R1cmluZ0Vycm9ycyA9IHRydWU7XG4gICAgfVxuXG4gICAgdmFyIHN0YXJ0UG9zID0gdGhpcy5zdGFydCwgc3RhcnRMb2MgPSB0aGlzLnN0YXJ0TG9jO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEucGFyZW5MIHx8IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5uYW1lKSB7XG4gICAgICB0aGlzLnBvdGVudGlhbEFycm93QXQgPSB0aGlzLnN0YXJ0O1xuICAgICAgdGhpcy5wb3RlbnRpYWxBcnJvd0luRm9yQXdhaXQgPSBmb3JJbml0ID09PSBcImF3YWl0XCI7XG4gICAgfVxuICAgIHZhciBsZWZ0ID0gdGhpcy5wYXJzZU1heWJlQ29uZGl0aW9uYWwoZm9ySW5pdCwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyk7XG4gICAgaWYgKGFmdGVyTGVmdFBhcnNlKSB7IGxlZnQgPSBhZnRlckxlZnRQYXJzZS5jYWxsKHRoaXMsIGxlZnQsIHN0YXJ0UG9zLCBzdGFydExvYyk7IH1cbiAgICBpZiAodGhpcy50eXBlLmlzQXNzaWduKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXMuc3RhcnROb2RlQXQoc3RhcnRQb3MsIHN0YXJ0TG9jKTtcbiAgICAgIG5vZGUub3BlcmF0b3IgPSB0aGlzLnZhbHVlO1xuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5lcSlcbiAgICAgICAgeyBsZWZ0ID0gdGhpcy50b0Fzc2lnbmFibGUobGVmdCwgZmFsc2UsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpOyB9XG4gICAgICBpZiAoIW93bkRlc3RydWN0dXJpbmdFcnJvcnMpIHtcbiAgICAgICAgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5wYXJlbnRoZXNpemVkQXNzaWduID0gcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy50cmFpbGluZ0NvbW1hID0gcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5kb3VibGVQcm90byA9IC0xO1xuICAgICAgfVxuICAgICAgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMuc2hvcnRoYW5kQXNzaWduID49IGxlZnQuc3RhcnQpXG4gICAgICAgIHsgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5zaG9ydGhhbmRBc3NpZ24gPSAtMTsgfSAvLyByZXNldCBiZWNhdXNlIHNob3J0aGFuZCBkZWZhdWx0IHdhcyB1c2VkIGNvcnJlY3RseVxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5lcSlcbiAgICAgICAgeyB0aGlzLmNoZWNrTFZhbFBhdHRlcm4obGVmdCk7IH1cbiAgICAgIGVsc2VcbiAgICAgICAgeyB0aGlzLmNoZWNrTFZhbFNpbXBsZShsZWZ0KTsgfVxuICAgICAgbm9kZS5sZWZ0ID0gbGVmdDtcbiAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgbm9kZS5yaWdodCA9IHRoaXMucGFyc2VNYXliZUFzc2lnbihmb3JJbml0KTtcbiAgICAgIGlmIChvbGREb3VibGVQcm90byA+IC0xKSB7IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMuZG91YmxlUHJvdG8gPSBvbGREb3VibGVQcm90bzsgfVxuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCIpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChvd25EZXN0cnVjdHVyaW5nRXJyb3JzKSB7IHRoaXMuY2hlY2tFeHByZXNzaW9uRXJyb3JzKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIHRydWUpOyB9XG4gICAgfVxuICAgIGlmIChvbGRQYXJlbkFzc2lnbiA+IC0xKSB7IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMucGFyZW50aGVzaXplZEFzc2lnbiA9IG9sZFBhcmVuQXNzaWduOyB9XG4gICAgaWYgKG9sZFRyYWlsaW5nQ29tbWEgPiAtMSkgeyByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnRyYWlsaW5nQ29tbWEgPSBvbGRUcmFpbGluZ0NvbW1hOyB9XG4gICAgcmV0dXJuIGxlZnRcbiAgfTtcblxuICAvLyBQYXJzZSBhIHRlcm5hcnkgY29uZGl0aW9uYWwgKGA/OmApIG9wZXJhdG9yLlxuXG4gIHBwJDUucGFyc2VNYXliZUNvbmRpdGlvbmFsID0gZnVuY3Rpb24oZm9ySW5pdCwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykge1xuICAgIHZhciBzdGFydFBvcyA9IHRoaXMuc3RhcnQsIHN0YXJ0TG9jID0gdGhpcy5zdGFydExvYztcbiAgICB2YXIgZXhwciA9IHRoaXMucGFyc2VFeHByT3BzKGZvckluaXQsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpO1xuICAgIGlmICh0aGlzLmNoZWNrRXhwcmVzc2lvbkVycm9ycyhyZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSkgeyByZXR1cm4gZXhwciB9XG4gICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEucXVlc3Rpb24pKSB7XG4gICAgICB2YXIgbm9kZSA9IHRoaXMuc3RhcnROb2RlQXQoc3RhcnRQb3MsIHN0YXJ0TG9jKTtcbiAgICAgIG5vZGUudGVzdCA9IGV4cHI7XG4gICAgICBub2RlLmNvbnNlcXVlbnQgPSB0aGlzLnBhcnNlTWF5YmVBc3NpZ24oKTtcbiAgICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEuY29sb24pO1xuICAgICAgbm9kZS5hbHRlcm5hdGUgPSB0aGlzLnBhcnNlTWF5YmVBc3NpZ24oZm9ySW5pdCk7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCIpXG4gICAgfVxuICAgIHJldHVybiBleHByXG4gIH07XG5cbiAgLy8gU3RhcnQgdGhlIHByZWNlZGVuY2UgcGFyc2VyLlxuXG4gIHBwJDUucGFyc2VFeHByT3BzID0gZnVuY3Rpb24oZm9ySW5pdCwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykge1xuICAgIHZhciBzdGFydFBvcyA9IHRoaXMuc3RhcnQsIHN0YXJ0TG9jID0gdGhpcy5zdGFydExvYztcbiAgICB2YXIgZXhwciA9IHRoaXMucGFyc2VNYXliZVVuYXJ5KHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIGZhbHNlLCBmYWxzZSwgZm9ySW5pdCk7XG4gICAgaWYgKHRoaXMuY2hlY2tFeHByZXNzaW9uRXJyb3JzKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpKSB7IHJldHVybiBleHByIH1cbiAgICByZXR1cm4gZXhwci5zdGFydCA9PT0gc3RhcnRQb3MgJiYgZXhwci50eXBlID09PSBcIkFycm93RnVuY3Rpb25FeHByZXNzaW9uXCIgPyBleHByIDogdGhpcy5wYXJzZUV4cHJPcChleHByLCBzdGFydFBvcywgc3RhcnRMb2MsIC0xLCBmb3JJbml0KVxuICB9O1xuXG4gIC8vIFBhcnNlIGJpbmFyeSBvcGVyYXRvcnMgd2l0aCB0aGUgb3BlcmF0b3IgcHJlY2VkZW5jZSBwYXJzaW5nXG4gIC8vIGFsZ29yaXRobS4gYGxlZnRgIGlzIHRoZSBsZWZ0LWhhbmQgc2lkZSBvZiB0aGUgb3BlcmF0b3IuXG4gIC8vIGBtaW5QcmVjYCBwcm92aWRlcyBjb250ZXh0IHRoYXQgYWxsb3dzIHRoZSBmdW5jdGlvbiB0byBzdG9wIGFuZFxuICAvLyBkZWZlciBmdXJ0aGVyIHBhcnNlciB0byBvbmUgb2YgaXRzIGNhbGxlcnMgd2hlbiBpdCBlbmNvdW50ZXJzIGFuXG4gIC8vIG9wZXJhdG9yIHRoYXQgaGFzIGEgbG93ZXIgcHJlY2VkZW5jZSB0aGFuIHRoZSBzZXQgaXQgaXMgcGFyc2luZy5cblxuICBwcCQ1LnBhcnNlRXhwck9wID0gZnVuY3Rpb24obGVmdCwgbGVmdFN0YXJ0UG9zLCBsZWZ0U3RhcnRMb2MsIG1pblByZWMsIGZvckluaXQpIHtcbiAgICB2YXIgcHJlYyA9IHRoaXMudHlwZS5iaW5vcDtcbiAgICBpZiAocHJlYyAhPSBudWxsICYmICghZm9ySW5pdCB8fCB0aGlzLnR5cGUgIT09IHR5cGVzJDEuX2luKSkge1xuICAgICAgaWYgKHByZWMgPiBtaW5QcmVjKSB7XG4gICAgICAgIHZhciBsb2dpY2FsID0gdGhpcy50eXBlID09PSB0eXBlcyQxLmxvZ2ljYWxPUiB8fCB0aGlzLnR5cGUgPT09IHR5cGVzJDEubG9naWNhbEFORDtcbiAgICAgICAgdmFyIGNvYWxlc2NlID0gdGhpcy50eXBlID09PSB0eXBlcyQxLmNvYWxlc2NlO1xuICAgICAgICBpZiAoY29hbGVzY2UpIHtcbiAgICAgICAgICAvLyBIYW5kbGUgdGhlIHByZWNlZGVuY2Ugb2YgYHR0LmNvYWxlc2NlYCBhcyBlcXVhbCB0byB0aGUgcmFuZ2Ugb2YgbG9naWNhbCBleHByZXNzaW9ucy5cbiAgICAgICAgICAvLyBJbiBvdGhlciB3b3JkcywgYG5vZGUucmlnaHRgIHNob3VsZG4ndCBjb250YWluIGxvZ2ljYWwgZXhwcmVzc2lvbnMgaW4gb3JkZXIgdG8gY2hlY2sgdGhlIG1peGVkIGVycm9yLlxuICAgICAgICAgIHByZWMgPSB0eXBlcyQxLmxvZ2ljYWxBTkQuYmlub3A7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG9wID0gdGhpcy52YWx1ZTtcbiAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgIHZhciBzdGFydFBvcyA9IHRoaXMuc3RhcnQsIHN0YXJ0TG9jID0gdGhpcy5zdGFydExvYztcbiAgICAgICAgdmFyIHJpZ2h0ID0gdGhpcy5wYXJzZUV4cHJPcCh0aGlzLnBhcnNlTWF5YmVVbmFyeShudWxsLCBmYWxzZSwgZmFsc2UsIGZvckluaXQpLCBzdGFydFBvcywgc3RhcnRMb2MsIHByZWMsIGZvckluaXQpO1xuICAgICAgICB2YXIgbm9kZSA9IHRoaXMuYnVpbGRCaW5hcnkobGVmdFN0YXJ0UG9zLCBsZWZ0U3RhcnRMb2MsIGxlZnQsIHJpZ2h0LCBvcCwgbG9naWNhbCB8fCBjb2FsZXNjZSk7XG4gICAgICAgIGlmICgobG9naWNhbCAmJiB0aGlzLnR5cGUgPT09IHR5cGVzJDEuY29hbGVzY2UpIHx8IChjb2FsZXNjZSAmJiAodGhpcy50eXBlID09PSB0eXBlcyQxLmxvZ2ljYWxPUiB8fCB0aGlzLnR5cGUgPT09IHR5cGVzJDEubG9naWNhbEFORCkpKSB7XG4gICAgICAgICAgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHRoaXMuc3RhcnQsIFwiTG9naWNhbCBleHByZXNzaW9ucyBhbmQgY29hbGVzY2UgZXhwcmVzc2lvbnMgY2Fubm90IGJlIG1peGVkLiBXcmFwIGVpdGhlciBieSBwYXJlbnRoZXNlc1wiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUV4cHJPcChub2RlLCBsZWZ0U3RhcnRQb3MsIGxlZnRTdGFydExvYywgbWluUHJlYywgZm9ySW5pdClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxlZnRcbiAgfTtcblxuICBwcCQ1LmJ1aWxkQmluYXJ5ID0gZnVuY3Rpb24oc3RhcnRQb3MsIHN0YXJ0TG9jLCBsZWZ0LCByaWdodCwgb3AsIGxvZ2ljYWwpIHtcbiAgICBpZiAocmlnaHQudHlwZSA9PT0gXCJQcml2YXRlSWRlbnRpZmllclwiKSB7IHRoaXMucmFpc2UocmlnaHQuc3RhcnQsIFwiUHJpdmF0ZSBpZGVudGlmaWVyIGNhbiBvbmx5IGJlIGxlZnQgc2lkZSBvZiBiaW5hcnkgZXhwcmVzc2lvblwiKTsgfVxuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGVBdChzdGFydFBvcywgc3RhcnRMb2MpO1xuICAgIG5vZGUubGVmdCA9IGxlZnQ7XG4gICAgbm9kZS5vcGVyYXRvciA9IG9wO1xuICAgIG5vZGUucmlnaHQgPSByaWdodDtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIGxvZ2ljYWwgPyBcIkxvZ2ljYWxFeHByZXNzaW9uXCIgOiBcIkJpbmFyeUV4cHJlc3Npb25cIilcbiAgfTtcblxuICAvLyBQYXJzZSB1bmFyeSBvcGVyYXRvcnMsIGJvdGggcHJlZml4IGFuZCBwb3N0Zml4LlxuXG4gIHBwJDUucGFyc2VNYXliZVVuYXJ5ID0gZnVuY3Rpb24ocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycywgc2F3VW5hcnksIGluY0RlYywgZm9ySW5pdCkge1xuICAgIHZhciBzdGFydFBvcyA9IHRoaXMuc3RhcnQsIHN0YXJ0TG9jID0gdGhpcy5zdGFydExvYywgZXhwcjtcbiAgICBpZiAodGhpcy5pc0NvbnRleHR1YWwoXCJhd2FpdFwiKSAmJiB0aGlzLmNhbkF3YWl0KSB7XG4gICAgICBleHByID0gdGhpcy5wYXJzZUF3YWl0KGZvckluaXQpO1xuICAgICAgc2F3VW5hcnkgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAodGhpcy50eXBlLnByZWZpeCkge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpLCB1cGRhdGUgPSB0aGlzLnR5cGUgPT09IHR5cGVzJDEuaW5jRGVjO1xuICAgICAgbm9kZS5vcGVyYXRvciA9IHRoaXMudmFsdWU7XG4gICAgICBub2RlLnByZWZpeCA9IHRydWU7XG4gICAgICB0aGlzLm5leHQoKTtcbiAgICAgIG5vZGUuYXJndW1lbnQgPSB0aGlzLnBhcnNlTWF5YmVVbmFyeShudWxsLCB0cnVlLCB1cGRhdGUsIGZvckluaXQpO1xuICAgICAgdGhpcy5jaGVja0V4cHJlc3Npb25FcnJvcnMocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycywgdHJ1ZSk7XG4gICAgICBpZiAodXBkYXRlKSB7IHRoaXMuY2hlY2tMVmFsU2ltcGxlKG5vZGUuYXJndW1lbnQpOyB9XG4gICAgICBlbHNlIGlmICh0aGlzLnN0cmljdCAmJiBub2RlLm9wZXJhdG9yID09PSBcImRlbGV0ZVwiICYmXG4gICAgICAgICAgICAgICBub2RlLmFyZ3VtZW50LnR5cGUgPT09IFwiSWRlbnRpZmllclwiKVxuICAgICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShub2RlLnN0YXJ0LCBcIkRlbGV0aW5nIGxvY2FsIHZhcmlhYmxlIGluIHN0cmljdCBtb2RlXCIpOyB9XG4gICAgICBlbHNlIGlmIChub2RlLm9wZXJhdG9yID09PSBcImRlbGV0ZVwiICYmIGlzUHJpdmF0ZUZpZWxkQWNjZXNzKG5vZGUuYXJndW1lbnQpKVxuICAgICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShub2RlLnN0YXJ0LCBcIlByaXZhdGUgZmllbGRzIGNhbiBub3QgYmUgZGVsZXRlZFwiKTsgfVxuICAgICAgZWxzZSB7IHNhd1VuYXJ5ID0gdHJ1ZTsgfVxuICAgICAgZXhwciA9IHRoaXMuZmluaXNoTm9kZShub2RlLCB1cGRhdGUgPyBcIlVwZGF0ZUV4cHJlc3Npb25cIiA6IFwiVW5hcnlFeHByZXNzaW9uXCIpO1xuICAgIH0gZWxzZSBpZiAoIXNhd1VuYXJ5ICYmIHRoaXMudHlwZSA9PT0gdHlwZXMkMS5wcml2YXRlSWQpIHtcbiAgICAgIGlmICgoZm9ySW5pdCB8fCB0aGlzLnByaXZhdGVOYW1lU3RhY2subGVuZ3RoID09PSAwKSAmJiB0aGlzLm9wdGlvbnMuY2hlY2tQcml2YXRlRmllbGRzKSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gICAgICBleHByID0gdGhpcy5wYXJzZVByaXZhdGVJZGVudCgpO1xuICAgICAgLy8gb25seSBjb3VsZCBiZSBwcml2YXRlIGZpZWxkcyBpbiAnaW4nLCBzdWNoIGFzICN4IGluIG9ialxuICAgICAgaWYgKHRoaXMudHlwZSAhPT0gdHlwZXMkMS5faW4pIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgICB9IGVsc2Uge1xuICAgICAgZXhwciA9IHRoaXMucGFyc2VFeHByU3Vic2NyaXB0cyhyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCBmb3JJbml0KTtcbiAgICAgIGlmICh0aGlzLmNoZWNrRXhwcmVzc2lvbkVycm9ycyhyZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSkgeyByZXR1cm4gZXhwciB9XG4gICAgICB3aGlsZSAodGhpcy50eXBlLnBvc3RmaXggJiYgIXRoaXMuY2FuSW5zZXJ0U2VtaWNvbG9uKCkpIHtcbiAgICAgICAgdmFyIG5vZGUkMSA9IHRoaXMuc3RhcnROb2RlQXQoc3RhcnRQb3MsIHN0YXJ0TG9jKTtcbiAgICAgICAgbm9kZSQxLm9wZXJhdG9yID0gdGhpcy52YWx1ZTtcbiAgICAgICAgbm9kZSQxLnByZWZpeCA9IGZhbHNlO1xuICAgICAgICBub2RlJDEuYXJndW1lbnQgPSBleHByO1xuICAgICAgICB0aGlzLmNoZWNrTFZhbFNpbXBsZShleHByKTtcbiAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgIGV4cHIgPSB0aGlzLmZpbmlzaE5vZGUobm9kZSQxLCBcIlVwZGF0ZUV4cHJlc3Npb25cIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFpbmNEZWMgJiYgdGhpcy5lYXQodHlwZXMkMS5zdGFyc3RhcikpIHtcbiAgICAgIGlmIChzYXdVbmFyeSlcbiAgICAgICAgeyB0aGlzLnVuZXhwZWN0ZWQodGhpcy5sYXN0VG9rU3RhcnQpOyB9XG4gICAgICBlbHNlXG4gICAgICAgIHsgcmV0dXJuIHRoaXMuYnVpbGRCaW5hcnkoc3RhcnRQb3MsIHN0YXJ0TG9jLCBleHByLCB0aGlzLnBhcnNlTWF5YmVVbmFyeShudWxsLCBmYWxzZSwgZmFsc2UsIGZvckluaXQpLCBcIioqXCIsIGZhbHNlKSB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBleHByXG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGlzUHJpdmF0ZUZpZWxkQWNjZXNzKG5vZGUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgbm9kZS50eXBlID09PSBcIk1lbWJlckV4cHJlc3Npb25cIiAmJiBub2RlLnByb3BlcnR5LnR5cGUgPT09IFwiUHJpdmF0ZUlkZW50aWZpZXJcIiB8fFxuICAgICAgbm9kZS50eXBlID09PSBcIkNoYWluRXhwcmVzc2lvblwiICYmIGlzUHJpdmF0ZUZpZWxkQWNjZXNzKG5vZGUuZXhwcmVzc2lvbilcbiAgICApXG4gIH1cblxuICAvLyBQYXJzZSBjYWxsLCBkb3QsIGFuZCBgW11gLXN1YnNjcmlwdCBleHByZXNzaW9ucy5cblxuICBwcCQ1LnBhcnNlRXhwclN1YnNjcmlwdHMgPSBmdW5jdGlvbihyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCBmb3JJbml0KSB7XG4gICAgdmFyIHN0YXJ0UG9zID0gdGhpcy5zdGFydCwgc3RhcnRMb2MgPSB0aGlzLnN0YXJ0TG9jO1xuICAgIHZhciBleHByID0gdGhpcy5wYXJzZUV4cHJBdG9tKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIGZvckluaXQpO1xuICAgIGlmIChleHByLnR5cGUgPT09IFwiQXJyb3dGdW5jdGlvbkV4cHJlc3Npb25cIiAmJiB0aGlzLmlucHV0LnNsaWNlKHRoaXMubGFzdFRva1N0YXJ0LCB0aGlzLmxhc3RUb2tFbmQpICE9PSBcIilcIilcbiAgICAgIHsgcmV0dXJuIGV4cHIgfVxuICAgIHZhciByZXN1bHQgPSB0aGlzLnBhcnNlU3Vic2NyaXB0cyhleHByLCBzdGFydFBvcywgc3RhcnRMb2MsIGZhbHNlLCBmb3JJbml0KTtcbiAgICBpZiAocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyAmJiByZXN1bHQudHlwZSA9PT0gXCJNZW1iZXJFeHByZXNzaW9uXCIpIHtcbiAgICAgIGlmIChyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnBhcmVudGhlc2l6ZWRBc3NpZ24gPj0gcmVzdWx0LnN0YXJ0KSB7IHJlZkRlc3RydWN0dXJpbmdFcnJvcnMucGFyZW50aGVzaXplZEFzc2lnbiA9IC0xOyB9XG4gICAgICBpZiAocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5wYXJlbnRoZXNpemVkQmluZCA+PSByZXN1bHQuc3RhcnQpIHsgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5wYXJlbnRoZXNpemVkQmluZCA9IC0xOyB9XG4gICAgICBpZiAocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy50cmFpbGluZ0NvbW1hID49IHJlc3VsdC5zdGFydCkgeyByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnRyYWlsaW5nQ29tbWEgPSAtMTsgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH07XG5cbiAgcHAkNS5wYXJzZVN1YnNjcmlwdHMgPSBmdW5jdGlvbihiYXNlLCBzdGFydFBvcywgc3RhcnRMb2MsIG5vQ2FsbHMsIGZvckluaXQpIHtcbiAgICB2YXIgbWF5YmVBc3luY0Fycm93ID0gdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDggJiYgYmFzZS50eXBlID09PSBcIklkZW50aWZpZXJcIiAmJiBiYXNlLm5hbWUgPT09IFwiYXN5bmNcIiAmJlxuICAgICAgICB0aGlzLmxhc3RUb2tFbmQgPT09IGJhc2UuZW5kICYmICF0aGlzLmNhbkluc2VydFNlbWljb2xvbigpICYmIGJhc2UuZW5kIC0gYmFzZS5zdGFydCA9PT0gNSAmJlxuICAgICAgICB0aGlzLnBvdGVudGlhbEFycm93QXQgPT09IGJhc2Uuc3RhcnQ7XG4gICAgdmFyIG9wdGlvbmFsQ2hhaW5lZCA9IGZhbHNlO1xuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5wYXJzZVN1YnNjcmlwdChiYXNlLCBzdGFydFBvcywgc3RhcnRMb2MsIG5vQ2FsbHMsIG1heWJlQXN5bmNBcnJvdywgb3B0aW9uYWxDaGFpbmVkLCBmb3JJbml0KTtcblxuICAgICAgaWYgKGVsZW1lbnQub3B0aW9uYWwpIHsgb3B0aW9uYWxDaGFpbmVkID0gdHJ1ZTsgfVxuICAgICAgaWYgKGVsZW1lbnQgPT09IGJhc2UgfHwgZWxlbWVudC50eXBlID09PSBcIkFycm93RnVuY3Rpb25FeHByZXNzaW9uXCIpIHtcbiAgICAgICAgaWYgKG9wdGlvbmFsQ2hhaW5lZCkge1xuICAgICAgICAgIHZhciBjaGFpbk5vZGUgPSB0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyk7XG4gICAgICAgICAgY2hhaW5Ob2RlLmV4cHJlc3Npb24gPSBlbGVtZW50O1xuICAgICAgICAgIGVsZW1lbnQgPSB0aGlzLmZpbmlzaE5vZGUoY2hhaW5Ob2RlLCBcIkNoYWluRXhwcmVzc2lvblwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbWVudFxuICAgICAgfVxuXG4gICAgICBiYXNlID0gZWxlbWVudDtcbiAgICB9XG4gIH07XG5cbiAgcHAkNS5zaG91bGRQYXJzZUFzeW5jQXJyb3cgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gIXRoaXMuY2FuSW5zZXJ0U2VtaWNvbG9uKCkgJiYgdGhpcy5lYXQodHlwZXMkMS5hcnJvdylcbiAgfTtcblxuICBwcCQ1LnBhcnNlU3Vic2NyaXB0QXN5bmNBcnJvdyA9IGZ1bmN0aW9uKHN0YXJ0UG9zLCBzdGFydExvYywgZXhwckxpc3QsIGZvckluaXQpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZUFycm93RXhwcmVzc2lvbih0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyksIGV4cHJMaXN0LCB0cnVlLCBmb3JJbml0KVxuICB9O1xuXG4gIHBwJDUucGFyc2VTdWJzY3JpcHQgPSBmdW5jdGlvbihiYXNlLCBzdGFydFBvcywgc3RhcnRMb2MsIG5vQ2FsbHMsIG1heWJlQXN5bmNBcnJvdywgb3B0aW9uYWxDaGFpbmVkLCBmb3JJbml0KSB7XG4gICAgdmFyIG9wdGlvbmFsU3VwcG9ydGVkID0gdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDExO1xuICAgIHZhciBvcHRpb25hbCA9IG9wdGlvbmFsU3VwcG9ydGVkICYmIHRoaXMuZWF0KHR5cGVzJDEucXVlc3Rpb25Eb3QpO1xuICAgIGlmIChub0NhbGxzICYmIG9wdGlvbmFsKSB7IHRoaXMucmFpc2UodGhpcy5sYXN0VG9rU3RhcnQsIFwiT3B0aW9uYWwgY2hhaW5pbmcgY2Fubm90IGFwcGVhciBpbiB0aGUgY2FsbGVlIG9mIG5ldyBleHByZXNzaW9uc1wiKTsgfVxuXG4gICAgdmFyIGNvbXB1dGVkID0gdGhpcy5lYXQodHlwZXMkMS5icmFja2V0TCk7XG4gICAgaWYgKGNvbXB1dGVkIHx8IChvcHRpb25hbCAmJiB0aGlzLnR5cGUgIT09IHR5cGVzJDEucGFyZW5MICYmIHRoaXMudHlwZSAhPT0gdHlwZXMkMS5iYWNrUXVvdGUpIHx8IHRoaXMuZWF0KHR5cGVzJDEuZG90KSkge1xuICAgICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyk7XG4gICAgICBub2RlLm9iamVjdCA9IGJhc2U7XG4gICAgICBpZiAoY29tcHV0ZWQpIHtcbiAgICAgICAgbm9kZS5wcm9wZXJ0eSA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEuYnJhY2tldFIpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEucHJpdmF0ZUlkICYmIGJhc2UudHlwZSAhPT0gXCJTdXBlclwiKSB7XG4gICAgICAgIG5vZGUucHJvcGVydHkgPSB0aGlzLnBhcnNlUHJpdmF0ZUlkZW50KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlLnByb3BlcnR5ID0gdGhpcy5wYXJzZUlkZW50KHRoaXMub3B0aW9ucy5hbGxvd1Jlc2VydmVkICE9PSBcIm5ldmVyXCIpO1xuICAgICAgfVxuICAgICAgbm9kZS5jb21wdXRlZCA9ICEhY29tcHV0ZWQ7XG4gICAgICBpZiAob3B0aW9uYWxTdXBwb3J0ZWQpIHtcbiAgICAgICAgbm9kZS5vcHRpb25hbCA9IG9wdGlvbmFsO1xuICAgICAgfVxuICAgICAgYmFzZSA9IHRoaXMuZmluaXNoTm9kZShub2RlLCBcIk1lbWJlckV4cHJlc3Npb25cIik7XG4gICAgfSBlbHNlIGlmICghbm9DYWxscyAmJiB0aGlzLmVhdCh0eXBlcyQxLnBhcmVuTCkpIHtcbiAgICAgIHZhciByZWZEZXN0cnVjdHVyaW5nRXJyb3JzID0gbmV3IERlc3RydWN0dXJpbmdFcnJvcnMsIG9sZFlpZWxkUG9zID0gdGhpcy55aWVsZFBvcywgb2xkQXdhaXRQb3MgPSB0aGlzLmF3YWl0UG9zLCBvbGRBd2FpdElkZW50UG9zID0gdGhpcy5hd2FpdElkZW50UG9zO1xuICAgICAgdGhpcy55aWVsZFBvcyA9IDA7XG4gICAgICB0aGlzLmF3YWl0UG9zID0gMDtcbiAgICAgIHRoaXMuYXdhaXRJZGVudFBvcyA9IDA7XG4gICAgICB2YXIgZXhwckxpc3QgPSB0aGlzLnBhcnNlRXhwckxpc3QodHlwZXMkMS5wYXJlblIsIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA4LCBmYWxzZSwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyk7XG4gICAgICBpZiAobWF5YmVBc3luY0Fycm93ICYmICFvcHRpb25hbCAmJiB0aGlzLnNob3VsZFBhcnNlQXN5bmNBcnJvdygpKSB7XG4gICAgICAgIHRoaXMuY2hlY2tQYXR0ZXJuRXJyb3JzKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5jaGVja1lpZWxkQXdhaXRJbkRlZmF1bHRQYXJhbXMoKTtcbiAgICAgICAgaWYgKHRoaXMuYXdhaXRJZGVudFBvcyA+IDApXG4gICAgICAgICAgeyB0aGlzLnJhaXNlKHRoaXMuYXdhaXRJZGVudFBvcywgXCJDYW5ub3QgdXNlICdhd2FpdCcgYXMgaWRlbnRpZmllciBpbnNpZGUgYW4gYXN5bmMgZnVuY3Rpb25cIik7IH1cbiAgICAgICAgdGhpcy55aWVsZFBvcyA9IG9sZFlpZWxkUG9zO1xuICAgICAgICB0aGlzLmF3YWl0UG9zID0gb2xkQXdhaXRQb3M7XG4gICAgICAgIHRoaXMuYXdhaXRJZGVudFBvcyA9IG9sZEF3YWl0SWRlbnRQb3M7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlU3Vic2NyaXB0QXN5bmNBcnJvdyhzdGFydFBvcywgc3RhcnRMb2MsIGV4cHJMaXN0LCBmb3JJbml0KVxuICAgICAgfVxuICAgICAgdGhpcy5jaGVja0V4cHJlc3Npb25FcnJvcnMocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycywgdHJ1ZSk7XG4gICAgICB0aGlzLnlpZWxkUG9zID0gb2xkWWllbGRQb3MgfHwgdGhpcy55aWVsZFBvcztcbiAgICAgIHRoaXMuYXdhaXRQb3MgPSBvbGRBd2FpdFBvcyB8fCB0aGlzLmF3YWl0UG9zO1xuICAgICAgdGhpcy5hd2FpdElkZW50UG9zID0gb2xkQXdhaXRJZGVudFBvcyB8fCB0aGlzLmF3YWl0SWRlbnRQb3M7XG4gICAgICB2YXIgbm9kZSQxID0gdGhpcy5zdGFydE5vZGVBdChzdGFydFBvcywgc3RhcnRMb2MpO1xuICAgICAgbm9kZSQxLmNhbGxlZSA9IGJhc2U7XG4gICAgICBub2RlJDEuYXJndW1lbnRzID0gZXhwckxpc3Q7XG4gICAgICBpZiAob3B0aW9uYWxTdXBwb3J0ZWQpIHtcbiAgICAgICAgbm9kZSQxLm9wdGlvbmFsID0gb3B0aW9uYWw7XG4gICAgICB9XG4gICAgICBiYXNlID0gdGhpcy5maW5pc2hOb2RlKG5vZGUkMSwgXCJDYWxsRXhwcmVzc2lvblwiKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5iYWNrUXVvdGUpIHtcbiAgICAgIGlmIChvcHRpb25hbCB8fCBvcHRpb25hbENoYWluZWQpIHtcbiAgICAgICAgdGhpcy5yYWlzZSh0aGlzLnN0YXJ0LCBcIk9wdGlvbmFsIGNoYWluaW5nIGNhbm5vdCBhcHBlYXIgaW4gdGhlIHRhZyBvZiB0YWdnZWQgdGVtcGxhdGUgZXhwcmVzc2lvbnNcIik7XG4gICAgICB9XG4gICAgICB2YXIgbm9kZSQyID0gdGhpcy5zdGFydE5vZGVBdChzdGFydFBvcywgc3RhcnRMb2MpO1xuICAgICAgbm9kZSQyLnRhZyA9IGJhc2U7XG4gICAgICBub2RlJDIucXVhc2kgPSB0aGlzLnBhcnNlVGVtcGxhdGUoe2lzVGFnZ2VkOiB0cnVlfSk7XG4gICAgICBiYXNlID0gdGhpcy5maW5pc2hOb2RlKG5vZGUkMiwgXCJUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb25cIik7XG4gICAgfVxuICAgIHJldHVybiBiYXNlXG4gIH07XG5cbiAgLy8gUGFyc2UgYW4gYXRvbWljIGV4cHJlc3Npb24g4oCUIGVpdGhlciBhIHNpbmdsZSB0b2tlbiB0aGF0IGlzIGFuXG4gIC8vIGV4cHJlc3Npb24sIGFuIGV4cHJlc3Npb24gc3RhcnRlZCBieSBhIGtleXdvcmQgbGlrZSBgZnVuY3Rpb25gIG9yXG4gIC8vIGBuZXdgLCBvciBhbiBleHByZXNzaW9uIHdyYXBwZWQgaW4gcHVuY3R1YXRpb24gbGlrZSBgKClgLCBgW11gLFxuICAvLyBvciBge31gLlxuXG4gIHBwJDUucGFyc2VFeHByQXRvbSA9IGZ1bmN0aW9uKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIGZvckluaXQsIGZvck5ldykge1xuICAgIC8vIElmIGEgZGl2aXNpb24gb3BlcmF0b3IgYXBwZWFycyBpbiBhbiBleHByZXNzaW9uIHBvc2l0aW9uLCB0aGVcbiAgICAvLyB0b2tlbml6ZXIgZ290IGNvbmZ1c2VkLCBhbmQgd2UgZm9yY2UgaXQgdG8gcmVhZCBhIHJlZ2V4cCBpbnN0ZWFkLlxuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuc2xhc2gpIHsgdGhpcy5yZWFkUmVnZXhwKCk7IH1cblxuICAgIHZhciBub2RlLCBjYW5CZUFycm93ID0gdGhpcy5wb3RlbnRpYWxBcnJvd0F0ID09PSB0aGlzLnN0YXJ0O1xuICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XG4gICAgY2FzZSB0eXBlcyQxLl9zdXBlcjpcbiAgICAgIGlmICghdGhpcy5hbGxvd1N1cGVyKVxuICAgICAgICB7IHRoaXMucmFpc2UodGhpcy5zdGFydCwgXCInc3VwZXInIGtleXdvcmQgb3V0c2lkZSBhIG1ldGhvZFwiKTsgfVxuICAgICAgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgICB0aGlzLm5leHQoKTtcbiAgICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEucGFyZW5MICYmICF0aGlzLmFsbG93RGlyZWN0U3VwZXIpXG4gICAgICAgIHsgdGhpcy5yYWlzZShub2RlLnN0YXJ0LCBcInN1cGVyKCkgY2FsbCBvdXRzaWRlIGNvbnN0cnVjdG9yIG9mIGEgc3ViY2xhc3NcIik7IH1cbiAgICAgIC8vIFRoZSBgc3VwZXJgIGtleXdvcmQgY2FuIGFwcGVhciBhdCBiZWxvdzpcbiAgICAgIC8vIFN1cGVyUHJvcGVydHk6XG4gICAgICAvLyAgICAgc3VwZXIgWyBFeHByZXNzaW9uIF1cbiAgICAgIC8vICAgICBzdXBlciAuIElkZW50aWZpZXJOYW1lXG4gICAgICAvLyBTdXBlckNhbGw6XG4gICAgICAvLyAgICAgc3VwZXIgKCBBcmd1bWVudHMgKVxuICAgICAgaWYgKHRoaXMudHlwZSAhPT0gdHlwZXMkMS5kb3QgJiYgdGhpcy50eXBlICE9PSB0eXBlcyQxLmJyYWNrZXRMICYmIHRoaXMudHlwZSAhPT0gdHlwZXMkMS5wYXJlbkwpXG4gICAgICAgIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJTdXBlclwiKVxuXG4gICAgY2FzZSB0eXBlcyQxLl90aGlzOlxuICAgICAgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgICB0aGlzLm5leHQoKTtcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJUaGlzRXhwcmVzc2lvblwiKVxuXG4gICAgY2FzZSB0eXBlcyQxLm5hbWU6XG4gICAgICB2YXIgc3RhcnRQb3MgPSB0aGlzLnN0YXJ0LCBzdGFydExvYyA9IHRoaXMuc3RhcnRMb2MsIGNvbnRhaW5zRXNjID0gdGhpcy5jb250YWluc0VzYztcbiAgICAgIHZhciBpZCA9IHRoaXMucGFyc2VJZGVudChmYWxzZSk7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDggJiYgIWNvbnRhaW5zRXNjICYmIGlkLm5hbWUgPT09IFwiYXN5bmNcIiAmJiAhdGhpcy5jYW5JbnNlcnRTZW1pY29sb24oKSAmJiB0aGlzLmVhdCh0eXBlcyQxLl9mdW5jdGlvbikpIHtcbiAgICAgICAgdGhpcy5vdmVycmlkZUNvbnRleHQodHlwZXMuZl9leHByKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VGdW5jdGlvbih0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyksIDAsIGZhbHNlLCB0cnVlLCBmb3JJbml0KVxuICAgICAgfVxuICAgICAgaWYgKGNhbkJlQXJyb3cgJiYgIXRoaXMuY2FuSW5zZXJ0U2VtaWNvbG9uKCkpIHtcbiAgICAgICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuYXJyb3cpKVxuICAgICAgICAgIHsgcmV0dXJuIHRoaXMucGFyc2VBcnJvd0V4cHJlc3Npb24odGhpcy5zdGFydE5vZGVBdChzdGFydFBvcywgc3RhcnRMb2MpLCBbaWRdLCBmYWxzZSwgZm9ySW5pdCkgfVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDggJiYgaWQubmFtZSA9PT0gXCJhc3luY1wiICYmIHRoaXMudHlwZSA9PT0gdHlwZXMkMS5uYW1lICYmICFjb250YWluc0VzYyAmJlxuICAgICAgICAgICAgKCF0aGlzLnBvdGVudGlhbEFycm93SW5Gb3JBd2FpdCB8fCB0aGlzLnZhbHVlICE9PSBcIm9mXCIgfHwgdGhpcy5jb250YWluc0VzYykpIHtcbiAgICAgICAgICBpZCA9IHRoaXMucGFyc2VJZGVudChmYWxzZSk7XG4gICAgICAgICAgaWYgKHRoaXMuY2FuSW5zZXJ0U2VtaWNvbG9uKCkgfHwgIXRoaXMuZWF0KHR5cGVzJDEuYXJyb3cpKVxuICAgICAgICAgICAgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlQXJyb3dFeHByZXNzaW9uKHRoaXMuc3RhcnROb2RlQXQoc3RhcnRQb3MsIHN0YXJ0TG9jKSwgW2lkXSwgdHJ1ZSwgZm9ySW5pdClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGlkXG5cbiAgICBjYXNlIHR5cGVzJDEucmVnZXhwOlxuICAgICAgdmFyIHZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgIG5vZGUgPSB0aGlzLnBhcnNlTGl0ZXJhbCh2YWx1ZS52YWx1ZSk7XG4gICAgICBub2RlLnJlZ2V4ID0ge3BhdHRlcm46IHZhbHVlLnBhdHRlcm4sIGZsYWdzOiB2YWx1ZS5mbGFnc307XG4gICAgICByZXR1cm4gbm9kZVxuXG4gICAgY2FzZSB0eXBlcyQxLm51bTogY2FzZSB0eXBlcyQxLnN0cmluZzpcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlTGl0ZXJhbCh0aGlzLnZhbHVlKVxuXG4gICAgY2FzZSB0eXBlcyQxLl9udWxsOiBjYXNlIHR5cGVzJDEuX3RydWU6IGNhc2UgdHlwZXMkMS5fZmFsc2U6XG4gICAgICBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICAgIG5vZGUudmFsdWUgPSB0aGlzLnR5cGUgPT09IHR5cGVzJDEuX251bGwgPyBudWxsIDogdGhpcy50eXBlID09PSB0eXBlcyQxLl90cnVlO1xuICAgICAgbm9kZS5yYXcgPSB0aGlzLnR5cGUua2V5d29yZDtcbiAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkxpdGVyYWxcIilcblxuICAgIGNhc2UgdHlwZXMkMS5wYXJlbkw6XG4gICAgICB2YXIgc3RhcnQgPSB0aGlzLnN0YXJ0LCBleHByID0gdGhpcy5wYXJzZVBhcmVuQW5kRGlzdGluZ3Vpc2hFeHByZXNzaW9uKGNhbkJlQXJyb3csIGZvckluaXQpO1xuICAgICAgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpIHtcbiAgICAgICAgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMucGFyZW50aGVzaXplZEFzc2lnbiA8IDAgJiYgIXRoaXMuaXNTaW1wbGVBc3NpZ25UYXJnZXQoZXhwcikpXG4gICAgICAgICAgeyByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnBhcmVudGhlc2l6ZWRBc3NpZ24gPSBzdGFydDsgfVxuICAgICAgICBpZiAocmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy5wYXJlbnRoZXNpemVkQmluZCA8IDApXG4gICAgICAgICAgeyByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnBhcmVudGhlc2l6ZWRCaW5kID0gc3RhcnQ7IH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBleHByXG5cbiAgICBjYXNlIHR5cGVzJDEuYnJhY2tldEw6XG4gICAgICBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgbm9kZS5lbGVtZW50cyA9IHRoaXMucGFyc2VFeHByTGlzdCh0eXBlcyQxLmJyYWNrZXRSLCB0cnVlLCB0cnVlLCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKTtcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJBcnJheUV4cHJlc3Npb25cIilcblxuICAgIGNhc2UgdHlwZXMkMS5icmFjZUw6XG4gICAgICB0aGlzLm92ZXJyaWRlQ29udGV4dCh0eXBlcy5iX2V4cHIpO1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VPYmooZmFsc2UsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpXG5cbiAgICBjYXNlIHR5cGVzJDEuX2Z1bmN0aW9uOlxuICAgICAgbm9kZSA9IHRoaXMuc3RhcnROb2RlKCk7XG4gICAgICB0aGlzLm5leHQoKTtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlRnVuY3Rpb24obm9kZSwgMClcblxuICAgIGNhc2UgdHlwZXMkMS5fY2xhc3M6XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUNsYXNzKHRoaXMuc3RhcnROb2RlKCksIGZhbHNlKVxuXG4gICAgY2FzZSB0eXBlcyQxLl9uZXc6XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZU5ldygpXG5cbiAgICBjYXNlIHR5cGVzJDEuYmFja1F1b3RlOlxuICAgICAgcmV0dXJuIHRoaXMucGFyc2VUZW1wbGF0ZSgpXG5cbiAgICBjYXNlIHR5cGVzJDEuX2ltcG9ydDpcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gMTEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFeHBySW1wb3J0KGZvck5ldylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVuZXhwZWN0ZWQoKVxuICAgICAgfVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlRXhwckF0b21EZWZhdWx0KClcbiAgICB9XG4gIH07XG5cbiAgcHAkNS5wYXJzZUV4cHJBdG9tRGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudW5leHBlY3RlZCgpO1xuICB9O1xuXG4gIHBwJDUucGFyc2VFeHBySW1wb3J0ID0gZnVuY3Rpb24oZm9yTmV3KSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuXG4gICAgLy8gQ29uc3VtZSBgaW1wb3J0YCBhcyBhbiBpZGVudGlmaWVyIGZvciBgaW1wb3J0Lm1ldGFgLlxuICAgIC8vIEJlY2F1c2UgYHRoaXMucGFyc2VJZGVudCh0cnVlKWAgZG9lc24ndCBjaGVjayBlc2NhcGUgc2VxdWVuY2VzLCBpdCBuZWVkcyB0aGUgY2hlY2sgb2YgYHRoaXMuY29udGFpbnNFc2NgLlxuICAgIGlmICh0aGlzLmNvbnRhaW5zRXNjKSB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZSh0aGlzLnN0YXJ0LCBcIkVzY2FwZSBzZXF1ZW5jZSBpbiBrZXl3b3JkIGltcG9ydFwiKTsgfVxuICAgIHZhciBtZXRhID0gdGhpcy5wYXJzZUlkZW50KHRydWUpO1xuXG4gICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5wYXJlbkwgJiYgIWZvck5ldykge1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VEeW5hbWljSW1wb3J0KG5vZGUpXG4gICAgfSBlbHNlIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuZG90KSB7XG4gICAgICBub2RlLm1ldGEgPSBtZXRhO1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VJbXBvcnRNZXRhKG5vZGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudW5leHBlY3RlZCgpO1xuICAgIH1cbiAgfTtcblxuICBwcCQ1LnBhcnNlRHluYW1pY0ltcG9ydCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB0aGlzLm5leHQoKTsgLy8gc2tpcCBgKGBcblxuICAgIC8vIFBhcnNlIG5vZGUuc291cmNlLlxuICAgIG5vZGUuc291cmNlID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKCk7XG5cbiAgICAvLyBWZXJpZnkgZW5kaW5nLlxuICAgIGlmICghdGhpcy5lYXQodHlwZXMkMS5wYXJlblIpKSB7XG4gICAgICB2YXIgZXJyb3JQb3MgPSB0aGlzLnN0YXJ0O1xuICAgICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuY29tbWEpICYmIHRoaXMuZWF0KHR5cGVzJDEucGFyZW5SKSkge1xuICAgICAgICB0aGlzLnJhaXNlUmVjb3ZlcmFibGUoZXJyb3JQb3MsIFwiVHJhaWxpbmcgY29tbWEgaXMgbm90IGFsbG93ZWQgaW4gaW1wb3J0KClcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVuZXhwZWN0ZWQoZXJyb3JQb3MpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJJbXBvcnRFeHByZXNzaW9uXCIpXG4gIH07XG5cbiAgcHAkNS5wYXJzZUltcG9ydE1ldGEgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdGhpcy5uZXh0KCk7IC8vIHNraXAgYC5gXG5cbiAgICB2YXIgY29udGFpbnNFc2MgPSB0aGlzLmNvbnRhaW5zRXNjO1xuICAgIG5vZGUucHJvcGVydHkgPSB0aGlzLnBhcnNlSWRlbnQodHJ1ZSk7XG5cbiAgICBpZiAobm9kZS5wcm9wZXJ0eS5uYW1lICE9PSBcIm1ldGFcIilcbiAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKG5vZGUucHJvcGVydHkuc3RhcnQsIFwiVGhlIG9ubHkgdmFsaWQgbWV0YSBwcm9wZXJ0eSBmb3IgaW1wb3J0IGlzICdpbXBvcnQubWV0YSdcIik7IH1cbiAgICBpZiAoY29udGFpbnNFc2MpXG4gICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShub2RlLnN0YXJ0LCBcIidpbXBvcnQubWV0YScgbXVzdCBub3QgY29udGFpbiBlc2NhcGVkIGNoYXJhY3RlcnNcIik7IH1cbiAgICBpZiAodGhpcy5vcHRpb25zLnNvdXJjZVR5cGUgIT09IFwibW9kdWxlXCIgJiYgIXRoaXMub3B0aW9ucy5hbGxvd0ltcG9ydEV4cG9ydEV2ZXJ5d2hlcmUpXG4gICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShub2RlLnN0YXJ0LCBcIkNhbm5vdCB1c2UgJ2ltcG9ydC5tZXRhJyBvdXRzaWRlIGEgbW9kdWxlXCIpOyB9XG5cbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiTWV0YVByb3BlcnR5XCIpXG4gIH07XG5cbiAgcHAkNS5wYXJzZUxpdGVyYWwgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICBub2RlLnZhbHVlID0gdmFsdWU7XG4gICAgbm9kZS5yYXcgPSB0aGlzLmlucHV0LnNsaWNlKHRoaXMuc3RhcnQsIHRoaXMuZW5kKTtcbiAgICBpZiAobm9kZS5yYXcuY2hhckNvZGVBdChub2RlLnJhdy5sZW5ndGggLSAxKSA9PT0gMTEwKSB7IG5vZGUuYmlnaW50ID0gbm9kZS5yYXcuc2xpY2UoMCwgLTEpLnJlcGxhY2UoL18vZywgXCJcIik7IH1cbiAgICB0aGlzLm5leHQoKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiTGl0ZXJhbFwiKVxuICB9O1xuXG4gIHBwJDUucGFyc2VQYXJlbkV4cHJlc3Npb24gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLnBhcmVuTCk7XG4gICAgdmFyIHZhbCA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgdGhpcy5leHBlY3QodHlwZXMkMS5wYXJlblIpO1xuICAgIHJldHVybiB2YWxcbiAgfTtcblxuICBwcCQ1LnNob3VsZFBhcnNlQXJyb3cgPSBmdW5jdGlvbihleHByTGlzdCkge1xuICAgIHJldHVybiAhdGhpcy5jYW5JbnNlcnRTZW1pY29sb24oKVxuICB9O1xuXG4gIHBwJDUucGFyc2VQYXJlbkFuZERpc3Rpbmd1aXNoRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKGNhbkJlQXJyb3csIGZvckluaXQpIHtcbiAgICB2YXIgc3RhcnRQb3MgPSB0aGlzLnN0YXJ0LCBzdGFydExvYyA9IHRoaXMuc3RhcnRMb2MsIHZhbCwgYWxsb3dUcmFpbGluZ0NvbW1hID0gdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDg7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2KSB7XG4gICAgICB0aGlzLm5leHQoKTtcblxuICAgICAgdmFyIGlubmVyU3RhcnRQb3MgPSB0aGlzLnN0YXJ0LCBpbm5lclN0YXJ0TG9jID0gdGhpcy5zdGFydExvYztcbiAgICAgIHZhciBleHByTGlzdCA9IFtdLCBmaXJzdCA9IHRydWUsIGxhc3RJc0NvbW1hID0gZmFsc2U7XG4gICAgICB2YXIgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyA9IG5ldyBEZXN0cnVjdHVyaW5nRXJyb3JzLCBvbGRZaWVsZFBvcyA9IHRoaXMueWllbGRQb3MsIG9sZEF3YWl0UG9zID0gdGhpcy5hd2FpdFBvcywgc3ByZWFkU3RhcnQ7XG4gICAgICB0aGlzLnlpZWxkUG9zID0gMDtcbiAgICAgIHRoaXMuYXdhaXRQb3MgPSAwO1xuICAgICAgLy8gRG8gbm90IHNhdmUgYXdhaXRJZGVudFBvcyB0byBhbGxvdyBjaGVja2luZyBhd2FpdHMgbmVzdGVkIGluIHBhcmFtZXRlcnNcbiAgICAgIHdoaWxlICh0aGlzLnR5cGUgIT09IHR5cGVzJDEucGFyZW5SKSB7XG4gICAgICAgIGZpcnN0ID8gZmlyc3QgPSBmYWxzZSA6IHRoaXMuZXhwZWN0KHR5cGVzJDEuY29tbWEpO1xuICAgICAgICBpZiAoYWxsb3dUcmFpbGluZ0NvbW1hICYmIHRoaXMuYWZ0ZXJUcmFpbGluZ0NvbW1hKHR5cGVzJDEucGFyZW5SLCB0cnVlKSkge1xuICAgICAgICAgIGxhc3RJc0NvbW1hID0gdHJ1ZTtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5lbGxpcHNpcykge1xuICAgICAgICAgIHNwcmVhZFN0YXJ0ID0gdGhpcy5zdGFydDtcbiAgICAgICAgICBleHByTGlzdC5wdXNoKHRoaXMucGFyc2VQYXJlbkl0ZW0odGhpcy5wYXJzZVJlc3RCaW5kaW5nKCkpKTtcbiAgICAgICAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLmNvbW1hKSB7XG4gICAgICAgICAgICB0aGlzLnJhaXNlUmVjb3ZlcmFibGUoXG4gICAgICAgICAgICAgIHRoaXMuc3RhcnQsXG4gICAgICAgICAgICAgIFwiQ29tbWEgaXMgbm90IHBlcm1pdHRlZCBhZnRlciB0aGUgcmVzdCBlbGVtZW50XCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXhwckxpc3QucHVzaCh0aGlzLnBhcnNlTWF5YmVBc3NpZ24oZmFsc2UsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMsIHRoaXMucGFyc2VQYXJlbkl0ZW0pKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIGlubmVyRW5kUG9zID0gdGhpcy5sYXN0VG9rRW5kLCBpbm5lckVuZExvYyA9IHRoaXMubGFzdFRva0VuZExvYztcbiAgICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEucGFyZW5SKTtcblxuICAgICAgaWYgKGNhbkJlQXJyb3cgJiYgdGhpcy5zaG91bGRQYXJzZUFycm93KGV4cHJMaXN0KSAmJiB0aGlzLmVhdCh0eXBlcyQxLmFycm93KSkge1xuICAgICAgICB0aGlzLmNoZWNrUGF0dGVybkVycm9ycyhyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuY2hlY2tZaWVsZEF3YWl0SW5EZWZhdWx0UGFyYW1zKCk7XG4gICAgICAgIHRoaXMueWllbGRQb3MgPSBvbGRZaWVsZFBvcztcbiAgICAgICAgdGhpcy5hd2FpdFBvcyA9IG9sZEF3YWl0UG9zO1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVBhcmVuQXJyb3dMaXN0KHN0YXJ0UG9zLCBzdGFydExvYywgZXhwckxpc3QsIGZvckluaXQpXG4gICAgICB9XG5cbiAgICAgIGlmICghZXhwckxpc3QubGVuZ3RoIHx8IGxhc3RJc0NvbW1hKSB7IHRoaXMudW5leHBlY3RlZCh0aGlzLmxhc3RUb2tTdGFydCk7IH1cbiAgICAgIGlmIChzcHJlYWRTdGFydCkgeyB0aGlzLnVuZXhwZWN0ZWQoc3ByZWFkU3RhcnQpOyB9XG4gICAgICB0aGlzLmNoZWNrRXhwcmVzc2lvbkVycm9ycyhyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCB0cnVlKTtcbiAgICAgIHRoaXMueWllbGRQb3MgPSBvbGRZaWVsZFBvcyB8fCB0aGlzLnlpZWxkUG9zO1xuICAgICAgdGhpcy5hd2FpdFBvcyA9IG9sZEF3YWl0UG9zIHx8IHRoaXMuYXdhaXRQb3M7XG5cbiAgICAgIGlmIChleHByTGlzdC5sZW5ndGggPiAxKSB7XG4gICAgICAgIHZhbCA9IHRoaXMuc3RhcnROb2RlQXQoaW5uZXJTdGFydFBvcywgaW5uZXJTdGFydExvYyk7XG4gICAgICAgIHZhbC5leHByZXNzaW9ucyA9IGV4cHJMaXN0O1xuICAgICAgICB0aGlzLmZpbmlzaE5vZGVBdCh2YWwsIFwiU2VxdWVuY2VFeHByZXNzaW9uXCIsIGlubmVyRW5kUG9zLCBpbm5lckVuZExvYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBleHByTGlzdFswXTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFsID0gdGhpcy5wYXJzZVBhcmVuRXhwcmVzc2lvbigpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMucHJlc2VydmVQYXJlbnMpIHtcbiAgICAgIHZhciBwYXIgPSB0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyk7XG4gICAgICBwYXIuZXhwcmVzc2lvbiA9IHZhbDtcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUocGFyLCBcIlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uXCIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YWxcbiAgICB9XG4gIH07XG5cbiAgcHAkNS5wYXJzZVBhcmVuSXRlbSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbVxuICB9O1xuXG4gIHBwJDUucGFyc2VQYXJlbkFycm93TGlzdCA9IGZ1bmN0aW9uKHN0YXJ0UG9zLCBzdGFydExvYywgZXhwckxpc3QsIGZvckluaXQpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZUFycm93RXhwcmVzc2lvbih0aGlzLnN0YXJ0Tm9kZUF0KHN0YXJ0UG9zLCBzdGFydExvYyksIGV4cHJMaXN0LCBmYWxzZSwgZm9ySW5pdClcbiAgfTtcblxuICAvLyBOZXcncyBwcmVjZWRlbmNlIGlzIHNsaWdodGx5IHRyaWNreS4gSXQgbXVzdCBhbGxvdyBpdHMgYXJndW1lbnQgdG9cbiAgLy8gYmUgYSBgW11gIG9yIGRvdCBzdWJzY3JpcHQgZXhwcmVzc2lvbiwgYnV0IG5vdCBhIGNhbGwg4oCUIGF0IGxlYXN0LFxuICAvLyBub3Qgd2l0aG91dCB3cmFwcGluZyBpdCBpbiBwYXJlbnRoZXNlcy4gVGh1cywgaXQgdXNlcyB0aGUgbm9DYWxsc1xuICAvLyBhcmd1bWVudCB0byBwYXJzZVN1YnNjcmlwdHMgdG8gcHJldmVudCBpdCBmcm9tIGNvbnN1bWluZyB0aGVcbiAgLy8gYXJndW1lbnQgbGlzdC5cblxuICB2YXIgZW1wdHkgPSBbXTtcblxuICBwcCQ1LnBhcnNlTmV3ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuY29udGFpbnNFc2MpIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHRoaXMuc3RhcnQsIFwiRXNjYXBlIHNlcXVlbmNlIGluIGtleXdvcmQgbmV3XCIpOyB9XG4gICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgIHZhciBtZXRhID0gdGhpcy5wYXJzZUlkZW50KHRydWUpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNiAmJiB0aGlzLmVhdCh0eXBlcyQxLmRvdCkpIHtcbiAgICAgIG5vZGUubWV0YSA9IG1ldGE7XG4gICAgICB2YXIgY29udGFpbnNFc2MgPSB0aGlzLmNvbnRhaW5zRXNjO1xuICAgICAgbm9kZS5wcm9wZXJ0eSA9IHRoaXMucGFyc2VJZGVudCh0cnVlKTtcbiAgICAgIGlmIChub2RlLnByb3BlcnR5Lm5hbWUgIT09IFwidGFyZ2V0XCIpXG4gICAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKG5vZGUucHJvcGVydHkuc3RhcnQsIFwiVGhlIG9ubHkgdmFsaWQgbWV0YSBwcm9wZXJ0eSBmb3IgbmV3IGlzICduZXcudGFyZ2V0J1wiKTsgfVxuICAgICAgaWYgKGNvbnRhaW5zRXNjKVxuICAgICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShub2RlLnN0YXJ0LCBcIiduZXcudGFyZ2V0JyBtdXN0IG5vdCBjb250YWluIGVzY2FwZWQgY2hhcmFjdGVyc1wiKTsgfVxuICAgICAgaWYgKCF0aGlzLmFsbG93TmV3RG90VGFyZ2V0KVxuICAgICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShub2RlLnN0YXJ0LCBcIiduZXcudGFyZ2V0JyBjYW4gb25seSBiZSB1c2VkIGluIGZ1bmN0aW9ucyBhbmQgY2xhc3Mgc3RhdGljIGJsb2NrXCIpOyB9XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiTWV0YVByb3BlcnR5XCIpXG4gICAgfVxuICAgIHZhciBzdGFydFBvcyA9IHRoaXMuc3RhcnQsIHN0YXJ0TG9jID0gdGhpcy5zdGFydExvYztcbiAgICBub2RlLmNhbGxlZSA9IHRoaXMucGFyc2VTdWJzY3JpcHRzKHRoaXMucGFyc2VFeHByQXRvbShudWxsLCBmYWxzZSwgdHJ1ZSksIHN0YXJ0UG9zLCBzdGFydExvYywgdHJ1ZSwgZmFsc2UpO1xuICAgIGlmICh0aGlzLmVhdCh0eXBlcyQxLnBhcmVuTCkpIHsgbm9kZS5hcmd1bWVudHMgPSB0aGlzLnBhcnNlRXhwckxpc3QodHlwZXMkMS5wYXJlblIsIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA4LCBmYWxzZSk7IH1cbiAgICBlbHNlIHsgbm9kZS5hcmd1bWVudHMgPSBlbXB0eTsgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJOZXdFeHByZXNzaW9uXCIpXG4gIH07XG5cbiAgLy8gUGFyc2UgdGVtcGxhdGUgZXhwcmVzc2lvbi5cblxuICBwcCQ1LnBhcnNlVGVtcGxhdGVFbGVtZW50ID0gZnVuY3Rpb24ocmVmKSB7XG4gICAgdmFyIGlzVGFnZ2VkID0gcmVmLmlzVGFnZ2VkO1xuXG4gICAgdmFyIGVsZW0gPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuaW52YWxpZFRlbXBsYXRlKSB7XG4gICAgICBpZiAoIWlzVGFnZ2VkKSB7XG4gICAgICAgIHRoaXMucmFpc2VSZWNvdmVyYWJsZSh0aGlzLnN0YXJ0LCBcIkJhZCBlc2NhcGUgc2VxdWVuY2UgaW4gdW50YWdnZWQgdGVtcGxhdGUgbGl0ZXJhbFwiKTtcbiAgICAgIH1cbiAgICAgIGVsZW0udmFsdWUgPSB7XG4gICAgICAgIHJhdzogdGhpcy52YWx1ZSxcbiAgICAgICAgY29va2VkOiBudWxsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtLnZhbHVlID0ge1xuICAgICAgICByYXc6IHRoaXMuaW5wdXQuc2xpY2UodGhpcy5zdGFydCwgdGhpcy5lbmQpLnJlcGxhY2UoL1xcclxcbj8vZywgXCJcXG5cIiksXG4gICAgICAgIGNvb2tlZDogdGhpcy52YWx1ZVxuICAgICAgfTtcbiAgICB9XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgZWxlbS50YWlsID0gdGhpcy50eXBlID09PSB0eXBlcyQxLmJhY2tRdW90ZTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKGVsZW0sIFwiVGVtcGxhdGVFbGVtZW50XCIpXG4gIH07XG5cbiAgcHAkNS5wYXJzZVRlbXBsYXRlID0gZnVuY3Rpb24ocmVmKSB7XG4gICAgaWYgKCByZWYgPT09IHZvaWQgMCApIHJlZiA9IHt9O1xuICAgIHZhciBpc1RhZ2dlZCA9IHJlZi5pc1RhZ2dlZDsgaWYgKCBpc1RhZ2dlZCA9PT0gdm9pZCAwICkgaXNUYWdnZWQgPSBmYWxzZTtcblxuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICB0aGlzLm5leHQoKTtcbiAgICBub2RlLmV4cHJlc3Npb25zID0gW107XG4gICAgdmFyIGN1ckVsdCA9IHRoaXMucGFyc2VUZW1wbGF0ZUVsZW1lbnQoe2lzVGFnZ2VkOiBpc1RhZ2dlZH0pO1xuICAgIG5vZGUucXVhc2lzID0gW2N1ckVsdF07XG4gICAgd2hpbGUgKCFjdXJFbHQudGFpbCkge1xuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5lb2YpIHsgdGhpcy5yYWlzZSh0aGlzLnBvcywgXCJVbnRlcm1pbmF0ZWQgdGVtcGxhdGUgbGl0ZXJhbFwiKTsgfVxuICAgICAgdGhpcy5leHBlY3QodHlwZXMkMS5kb2xsYXJCcmFjZUwpO1xuICAgICAgbm9kZS5leHByZXNzaW9ucy5wdXNoKHRoaXMucGFyc2VFeHByZXNzaW9uKCkpO1xuICAgICAgdGhpcy5leHBlY3QodHlwZXMkMS5icmFjZVIpO1xuICAgICAgbm9kZS5xdWFzaXMucHVzaChjdXJFbHQgPSB0aGlzLnBhcnNlVGVtcGxhdGVFbGVtZW50KHtpc1RhZ2dlZDogaXNUYWdnZWR9KSk7XG4gICAgfVxuICAgIHRoaXMubmV4dCgpO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJUZW1wbGF0ZUxpdGVyYWxcIilcbiAgfTtcblxuICBwcCQ1LmlzQXN5bmNQcm9wID0gZnVuY3Rpb24ocHJvcCkge1xuICAgIHJldHVybiAhcHJvcC5jb21wdXRlZCAmJiBwcm9wLmtleS50eXBlID09PSBcIklkZW50aWZpZXJcIiAmJiBwcm9wLmtleS5uYW1lID09PSBcImFzeW5jXCIgJiZcbiAgICAgICh0aGlzLnR5cGUgPT09IHR5cGVzJDEubmFtZSB8fCB0aGlzLnR5cGUgPT09IHR5cGVzJDEubnVtIHx8IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5zdHJpbmcgfHwgdGhpcy50eXBlID09PSB0eXBlcyQxLmJyYWNrZXRMIHx8IHRoaXMudHlwZS5rZXl3b3JkIHx8ICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOSAmJiB0aGlzLnR5cGUgPT09IHR5cGVzJDEuc3RhcikpICYmXG4gICAgICAhbGluZUJyZWFrLnRlc3QodGhpcy5pbnB1dC5zbGljZSh0aGlzLmxhc3RUb2tFbmQsIHRoaXMuc3RhcnQpKVxuICB9O1xuXG4gIC8vIFBhcnNlIGFuIG9iamVjdCBsaXRlcmFsIG9yIGJpbmRpbmcgcGF0dGVybi5cblxuICBwcCQ1LnBhcnNlT2JqID0gZnVuY3Rpb24oaXNQYXR0ZXJuLCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpLCBmaXJzdCA9IHRydWUsIHByb3BIYXNoID0ge307XG4gICAgbm9kZS5wcm9wZXJ0aWVzID0gW107XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgd2hpbGUgKCF0aGlzLmVhdCh0eXBlcyQxLmJyYWNlUikpIHtcbiAgICAgIGlmICghZmlyc3QpIHtcbiAgICAgICAgdGhpcy5leHBlY3QodHlwZXMkMS5jb21tYSk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNSAmJiB0aGlzLmFmdGVyVHJhaWxpbmdDb21tYSh0eXBlcyQxLmJyYWNlUikpIHsgYnJlYWsgfVxuICAgICAgfSBlbHNlIHsgZmlyc3QgPSBmYWxzZTsgfVxuXG4gICAgICB2YXIgcHJvcCA9IHRoaXMucGFyc2VQcm9wZXJ0eShpc1BhdHRlcm4sIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpO1xuICAgICAgaWYgKCFpc1BhdHRlcm4pIHsgdGhpcy5jaGVja1Byb3BDbGFzaChwcm9wLCBwcm9wSGFzaCwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyk7IH1cbiAgICAgIG5vZGUucHJvcGVydGllcy5wdXNoKHByb3ApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIGlzUGF0dGVybiA/IFwiT2JqZWN0UGF0dGVyblwiIDogXCJPYmplY3RFeHByZXNzaW9uXCIpXG4gIH07XG5cbiAgcHAkNS5wYXJzZVByb3BlcnR5ID0gZnVuY3Rpb24oaXNQYXR0ZXJuLCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSB7XG4gICAgdmFyIHByb3AgPSB0aGlzLnN0YXJ0Tm9kZSgpLCBpc0dlbmVyYXRvciwgaXNBc3luYywgc3RhcnRQb3MsIHN0YXJ0TG9jO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOSAmJiB0aGlzLmVhdCh0eXBlcyQxLmVsbGlwc2lzKSkge1xuICAgICAgaWYgKGlzUGF0dGVybikge1xuICAgICAgICBwcm9wLmFyZ3VtZW50ID0gdGhpcy5wYXJzZUlkZW50KGZhbHNlKTtcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5jb21tYSkge1xuICAgICAgICAgIHRoaXMucmFpc2VSZWNvdmVyYWJsZSh0aGlzLnN0YXJ0LCBcIkNvbW1hIGlzIG5vdCBwZXJtaXR0ZWQgYWZ0ZXIgdGhlIHJlc3QgZWxlbWVudFwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKHByb3AsIFwiUmVzdEVsZW1lbnRcIilcbiAgICAgIH1cbiAgICAgIC8vIFBhcnNlIGFyZ3VtZW50LlxuICAgICAgcHJvcC5hcmd1bWVudCA9IHRoaXMucGFyc2VNYXliZUFzc2lnbihmYWxzZSwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycyk7XG4gICAgICAvLyBUbyBkaXNhbGxvdyB0cmFpbGluZyBjb21tYSB2aWEgYHRoaXMudG9Bc3NpZ25hYmxlKClgLlxuICAgICAgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5jb21tYSAmJiByZWZEZXN0cnVjdHVyaW5nRXJyb3JzICYmIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMudHJhaWxpbmdDb21tYSA8IDApIHtcbiAgICAgICAgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycy50cmFpbGluZ0NvbW1hID0gdGhpcy5zdGFydDtcbiAgICAgIH1cbiAgICAgIC8vIEZpbmlzaFxuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShwcm9wLCBcIlNwcmVhZEVsZW1lbnRcIilcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2KSB7XG4gICAgICBwcm9wLm1ldGhvZCA9IGZhbHNlO1xuICAgICAgcHJvcC5zaG9ydGhhbmQgPSBmYWxzZTtcbiAgICAgIGlmIChpc1BhdHRlcm4gfHwgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycykge1xuICAgICAgICBzdGFydFBvcyA9IHRoaXMuc3RhcnQ7XG4gICAgICAgIHN0YXJ0TG9jID0gdGhpcy5zdGFydExvYztcbiAgICAgIH1cbiAgICAgIGlmICghaXNQYXR0ZXJuKVxuICAgICAgICB7IGlzR2VuZXJhdG9yID0gdGhpcy5lYXQodHlwZXMkMS5zdGFyKTsgfVxuICAgIH1cbiAgICB2YXIgY29udGFpbnNFc2MgPSB0aGlzLmNvbnRhaW5zRXNjO1xuICAgIHRoaXMucGFyc2VQcm9wZXJ0eU5hbWUocHJvcCk7XG4gICAgaWYgKCFpc1BhdHRlcm4gJiYgIWNvbnRhaW5zRXNjICYmIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA4ICYmICFpc0dlbmVyYXRvciAmJiB0aGlzLmlzQXN5bmNQcm9wKHByb3ApKSB7XG4gICAgICBpc0FzeW5jID0gdHJ1ZTtcbiAgICAgIGlzR2VuZXJhdG9yID0gdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDkgJiYgdGhpcy5lYXQodHlwZXMkMS5zdGFyKTtcbiAgICAgIHRoaXMucGFyc2VQcm9wZXJ0eU5hbWUocHJvcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzQXN5bmMgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5wYXJzZVByb3BlcnR5VmFsdWUocHJvcCwgaXNQYXR0ZXJuLCBpc0dlbmVyYXRvciwgaXNBc3luYywgc3RhcnRQb3MsIHN0YXJ0TG9jLCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLCBjb250YWluc0VzYyk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShwcm9wLCBcIlByb3BlcnR5XCIpXG4gIH07XG5cbiAgcHAkNS5wYXJzZUdldHRlclNldHRlciA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICBwcm9wLmtpbmQgPSBwcm9wLmtleS5uYW1lO1xuICAgIHRoaXMucGFyc2VQcm9wZXJ0eU5hbWUocHJvcCk7XG4gICAgcHJvcC52YWx1ZSA9IHRoaXMucGFyc2VNZXRob2QoZmFsc2UpO1xuICAgIHZhciBwYXJhbUNvdW50ID0gcHJvcC5raW5kID09PSBcImdldFwiID8gMCA6IDE7XG4gICAgaWYgKHByb3AudmFsdWUucGFyYW1zLmxlbmd0aCAhPT0gcGFyYW1Db3VudCkge1xuICAgICAgdmFyIHN0YXJ0ID0gcHJvcC52YWx1ZS5zdGFydDtcbiAgICAgIGlmIChwcm9wLmtpbmQgPT09IFwiZ2V0XCIpXG4gICAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHN0YXJ0LCBcImdldHRlciBzaG91bGQgaGF2ZSBubyBwYXJhbXNcIik7IH1cbiAgICAgIGVsc2VcbiAgICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUoc3RhcnQsIFwic2V0dGVyIHNob3VsZCBoYXZlIGV4YWN0bHkgb25lIHBhcmFtXCIpOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwcm9wLmtpbmQgPT09IFwic2V0XCIgJiYgcHJvcC52YWx1ZS5wYXJhbXNbMF0udHlwZSA9PT0gXCJSZXN0RWxlbWVudFwiKVxuICAgICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShwcm9wLnZhbHVlLnBhcmFtc1swXS5zdGFydCwgXCJTZXR0ZXIgY2Fubm90IHVzZSByZXN0IHBhcmFtc1wiKTsgfVxuICAgIH1cbiAgfTtcblxuICBwcCQ1LnBhcnNlUHJvcGVydHlWYWx1ZSA9IGZ1bmN0aW9uKHByb3AsIGlzUGF0dGVybiwgaXNHZW5lcmF0b3IsIGlzQXN5bmMsIHN0YXJ0UG9zLCBzdGFydExvYywgcmVmRGVzdHJ1Y3R1cmluZ0Vycm9ycywgY29udGFpbnNFc2MpIHtcbiAgICBpZiAoKGlzR2VuZXJhdG9yIHx8IGlzQXN5bmMpICYmIHRoaXMudHlwZSA9PT0gdHlwZXMkMS5jb2xvbilcbiAgICAgIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cblxuICAgIGlmICh0aGlzLmVhdCh0eXBlcyQxLmNvbG9uKSkge1xuICAgICAgcHJvcC52YWx1ZSA9IGlzUGF0dGVybiA/IHRoaXMucGFyc2VNYXliZURlZmF1bHQodGhpcy5zdGFydCwgdGhpcy5zdGFydExvYykgOiB0aGlzLnBhcnNlTWF5YmVBc3NpZ24oZmFsc2UsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpO1xuICAgICAgcHJvcC5raW5kID0gXCJpbml0XCI7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNiAmJiB0aGlzLnR5cGUgPT09IHR5cGVzJDEucGFyZW5MKSB7XG4gICAgICBpZiAoaXNQYXR0ZXJuKSB7IHRoaXMudW5leHBlY3RlZCgpOyB9XG4gICAgICBwcm9wLmtpbmQgPSBcImluaXRcIjtcbiAgICAgIHByb3AubWV0aG9kID0gdHJ1ZTtcbiAgICAgIHByb3AudmFsdWUgPSB0aGlzLnBhcnNlTWV0aG9kKGlzR2VuZXJhdG9yLCBpc0FzeW5jKTtcbiAgICB9IGVsc2UgaWYgKCFpc1BhdHRlcm4gJiYgIWNvbnRhaW5zRXNjICYmXG4gICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNSAmJiAhcHJvcC5jb21wdXRlZCAmJiBwcm9wLmtleS50eXBlID09PSBcIklkZW50aWZpZXJcIiAmJlxuICAgICAgICAgICAgICAgKHByb3Aua2V5Lm5hbWUgPT09IFwiZ2V0XCIgfHwgcHJvcC5rZXkubmFtZSA9PT0gXCJzZXRcIikgJiZcbiAgICAgICAgICAgICAgICh0aGlzLnR5cGUgIT09IHR5cGVzJDEuY29tbWEgJiYgdGhpcy50eXBlICE9PSB0eXBlcyQxLmJyYWNlUiAmJiB0aGlzLnR5cGUgIT09IHR5cGVzJDEuZXEpKSB7XG4gICAgICBpZiAoaXNHZW5lcmF0b3IgfHwgaXNBc3luYykgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgICAgdGhpcy5wYXJzZUdldHRlclNldHRlcihwcm9wKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2ICYmICFwcm9wLmNvbXB1dGVkICYmIHByb3Aua2V5LnR5cGUgPT09IFwiSWRlbnRpZmllclwiKSB7XG4gICAgICBpZiAoaXNHZW5lcmF0b3IgfHwgaXNBc3luYykgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgICAgdGhpcy5jaGVja1VucmVzZXJ2ZWQocHJvcC5rZXkpO1xuICAgICAgaWYgKHByb3Aua2V5Lm5hbWUgPT09IFwiYXdhaXRcIiAmJiAhdGhpcy5hd2FpdElkZW50UG9zKVxuICAgICAgICB7IHRoaXMuYXdhaXRJZGVudFBvcyA9IHN0YXJ0UG9zOyB9XG4gICAgICBwcm9wLmtpbmQgPSBcImluaXRcIjtcbiAgICAgIGlmIChpc1BhdHRlcm4pIHtcbiAgICAgICAgcHJvcC52YWx1ZSA9IHRoaXMucGFyc2VNYXliZURlZmF1bHQoc3RhcnRQb3MsIHN0YXJ0TG9jLCB0aGlzLmNvcHlOb2RlKHByb3Aua2V5KSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gdHlwZXMkMS5lcSAmJiByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSB7XG4gICAgICAgIGlmIChyZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnNob3J0aGFuZEFzc2lnbiA8IDApXG4gICAgICAgICAgeyByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnNob3J0aGFuZEFzc2lnbiA9IHRoaXMuc3RhcnQ7IH1cbiAgICAgICAgcHJvcC52YWx1ZSA9IHRoaXMucGFyc2VNYXliZURlZmF1bHQoc3RhcnRQb3MsIHN0YXJ0TG9jLCB0aGlzLmNvcHlOb2RlKHByb3Aua2V5KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9wLnZhbHVlID0gdGhpcy5jb3B5Tm9kZShwcm9wLmtleSk7XG4gICAgICB9XG4gICAgICBwcm9wLnNob3J0aGFuZCA9IHRydWU7XG4gICAgfSBlbHNlIHsgdGhpcy51bmV4cGVjdGVkKCk7IH1cbiAgfTtcblxuICBwcCQ1LnBhcnNlUHJvcGVydHlOYW1lID0gZnVuY3Rpb24ocHJvcCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNikge1xuICAgICAgaWYgKHRoaXMuZWF0KHR5cGVzJDEuYnJhY2tldEwpKSB7XG4gICAgICAgIHByb3AuY29tcHV0ZWQgPSB0cnVlO1xuICAgICAgICBwcm9wLmtleSA9IHRoaXMucGFyc2VNYXliZUFzc2lnbigpO1xuICAgICAgICB0aGlzLmV4cGVjdCh0eXBlcyQxLmJyYWNrZXRSKTtcbiAgICAgICAgcmV0dXJuIHByb3Aua2V5XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9wLmNvbXB1dGVkID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwcm9wLmtleSA9IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5udW0gfHwgdGhpcy50eXBlID09PSB0eXBlcyQxLnN0cmluZyA/IHRoaXMucGFyc2VFeHByQXRvbSgpIDogdGhpcy5wYXJzZUlkZW50KHRoaXMub3B0aW9ucy5hbGxvd1Jlc2VydmVkICE9PSBcIm5ldmVyXCIpXG4gIH07XG5cbiAgLy8gSW5pdGlhbGl6ZSBlbXB0eSBmdW5jdGlvbiBub2RlLlxuXG4gIHBwJDUuaW5pdEZ1bmN0aW9uID0gZnVuY3Rpb24obm9kZSkge1xuICAgIG5vZGUuaWQgPSBudWxsO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNikgeyBub2RlLmdlbmVyYXRvciA9IG5vZGUuZXhwcmVzc2lvbiA9IGZhbHNlOyB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA4KSB7IG5vZGUuYXN5bmMgPSBmYWxzZTsgfVxuICB9O1xuXG4gIC8vIFBhcnNlIG9iamVjdCBvciBjbGFzcyBtZXRob2QuXG5cbiAgcHAkNS5wYXJzZU1ldGhvZCA9IGZ1bmN0aW9uKGlzR2VuZXJhdG9yLCBpc0FzeW5jLCBhbGxvd0RpcmVjdFN1cGVyKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpLCBvbGRZaWVsZFBvcyA9IHRoaXMueWllbGRQb3MsIG9sZEF3YWl0UG9zID0gdGhpcy5hd2FpdFBvcywgb2xkQXdhaXRJZGVudFBvcyA9IHRoaXMuYXdhaXRJZGVudFBvcztcblxuICAgIHRoaXMuaW5pdEZ1bmN0aW9uKG5vZGUpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNilcbiAgICAgIHsgbm9kZS5nZW5lcmF0b3IgPSBpc0dlbmVyYXRvcjsgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOClcbiAgICAgIHsgbm9kZS5hc3luYyA9ICEhaXNBc3luYzsgfVxuXG4gICAgdGhpcy55aWVsZFBvcyA9IDA7XG4gICAgdGhpcy5hd2FpdFBvcyA9IDA7XG4gICAgdGhpcy5hd2FpdElkZW50UG9zID0gMDtcbiAgICB0aGlzLmVudGVyU2NvcGUoZnVuY3Rpb25GbGFncyhpc0FzeW5jLCBub2RlLmdlbmVyYXRvcikgfCBTQ09QRV9TVVBFUiB8IChhbGxvd0RpcmVjdFN1cGVyID8gU0NPUEVfRElSRUNUX1NVUEVSIDogMCkpO1xuXG4gICAgdGhpcy5leHBlY3QodHlwZXMkMS5wYXJlbkwpO1xuICAgIG5vZGUucGFyYW1zID0gdGhpcy5wYXJzZUJpbmRpbmdMaXN0KHR5cGVzJDEucGFyZW5SLCBmYWxzZSwgdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDgpO1xuICAgIHRoaXMuY2hlY2tZaWVsZEF3YWl0SW5EZWZhdWx0UGFyYW1zKCk7XG4gICAgdGhpcy5wYXJzZUZ1bmN0aW9uQm9keShub2RlLCBmYWxzZSwgdHJ1ZSwgZmFsc2UpO1xuXG4gICAgdGhpcy55aWVsZFBvcyA9IG9sZFlpZWxkUG9zO1xuICAgIHRoaXMuYXdhaXRQb3MgPSBvbGRBd2FpdFBvcztcbiAgICB0aGlzLmF3YWl0SWRlbnRQb3MgPSBvbGRBd2FpdElkZW50UG9zO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJGdW5jdGlvbkV4cHJlc3Npb25cIilcbiAgfTtcblxuICAvLyBQYXJzZSBhcnJvdyBmdW5jdGlvbiBleHByZXNzaW9uIHdpdGggZ2l2ZW4gcGFyYW1ldGVycy5cblxuICBwcCQ1LnBhcnNlQXJyb3dFeHByZXNzaW9uID0gZnVuY3Rpb24obm9kZSwgcGFyYW1zLCBpc0FzeW5jLCBmb3JJbml0KSB7XG4gICAgdmFyIG9sZFlpZWxkUG9zID0gdGhpcy55aWVsZFBvcywgb2xkQXdhaXRQb3MgPSB0aGlzLmF3YWl0UG9zLCBvbGRBd2FpdElkZW50UG9zID0gdGhpcy5hd2FpdElkZW50UG9zO1xuXG4gICAgdGhpcy5lbnRlclNjb3BlKGZ1bmN0aW9uRmxhZ3MoaXNBc3luYywgZmFsc2UpIHwgU0NPUEVfQVJST1cpO1xuICAgIHRoaXMuaW5pdEZ1bmN0aW9uKG5vZGUpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOCkgeyBub2RlLmFzeW5jID0gISFpc0FzeW5jOyB9XG5cbiAgICB0aGlzLnlpZWxkUG9zID0gMDtcbiAgICB0aGlzLmF3YWl0UG9zID0gMDtcbiAgICB0aGlzLmF3YWl0SWRlbnRQb3MgPSAwO1xuXG4gICAgbm9kZS5wYXJhbXMgPSB0aGlzLnRvQXNzaWduYWJsZUxpc3QocGFyYW1zLCB0cnVlKTtcbiAgICB0aGlzLnBhcnNlRnVuY3Rpb25Cb2R5KG5vZGUsIHRydWUsIGZhbHNlLCBmb3JJbml0KTtcblxuICAgIHRoaXMueWllbGRQb3MgPSBvbGRZaWVsZFBvcztcbiAgICB0aGlzLmF3YWl0UG9zID0gb2xkQXdhaXRQb3M7XG4gICAgdGhpcy5hd2FpdElkZW50UG9zID0gb2xkQXdhaXRJZGVudFBvcztcbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiQXJyb3dGdW5jdGlvbkV4cHJlc3Npb25cIilcbiAgfTtcblxuICAvLyBQYXJzZSBmdW5jdGlvbiBib2R5IGFuZCBjaGVjayBwYXJhbWV0ZXJzLlxuXG4gIHBwJDUucGFyc2VGdW5jdGlvbkJvZHkgPSBmdW5jdGlvbihub2RlLCBpc0Fycm93RnVuY3Rpb24sIGlzTWV0aG9kLCBmb3JJbml0KSB7XG4gICAgdmFyIGlzRXhwcmVzc2lvbiA9IGlzQXJyb3dGdW5jdGlvbiAmJiB0aGlzLnR5cGUgIT09IHR5cGVzJDEuYnJhY2VMO1xuICAgIHZhciBvbGRTdHJpY3QgPSB0aGlzLnN0cmljdCwgdXNlU3RyaWN0ID0gZmFsc2U7XG5cbiAgICBpZiAoaXNFeHByZXNzaW9uKSB7XG4gICAgICBub2RlLmJvZHkgPSB0aGlzLnBhcnNlTWF5YmVBc3NpZ24oZm9ySW5pdCk7XG4gICAgICBub2RlLmV4cHJlc3Npb24gPSB0cnVlO1xuICAgICAgdGhpcy5jaGVja1BhcmFtcyhub2RlLCBmYWxzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBub25TaW1wbGUgPSB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNyAmJiAhdGhpcy5pc1NpbXBsZVBhcmFtTGlzdChub2RlLnBhcmFtcyk7XG4gICAgICBpZiAoIW9sZFN0cmljdCB8fCBub25TaW1wbGUpIHtcbiAgICAgICAgdXNlU3RyaWN0ID0gdGhpcy5zdHJpY3REaXJlY3RpdmUodGhpcy5lbmQpO1xuICAgICAgICAvLyBJZiB0aGlzIGlzIGEgc3RyaWN0IG1vZGUgZnVuY3Rpb24sIHZlcmlmeSB0aGF0IGFyZ3VtZW50IG5hbWVzXG4gICAgICAgIC8vIGFyZSBub3QgcmVwZWF0ZWQsIGFuZCBpdCBkb2VzIG5vdCB0cnkgdG8gYmluZCB0aGUgd29yZHMgYGV2YWxgXG4gICAgICAgIC8vIG9yIGBhcmd1bWVudHNgLlxuICAgICAgICBpZiAodXNlU3RyaWN0ICYmIG5vblNpbXBsZSlcbiAgICAgICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZShub2RlLnN0YXJ0LCBcIklsbGVnYWwgJ3VzZSBzdHJpY3QnIGRpcmVjdGl2ZSBpbiBmdW5jdGlvbiB3aXRoIG5vbi1zaW1wbGUgcGFyYW1ldGVyIGxpc3RcIik7IH1cbiAgICAgIH1cbiAgICAgIC8vIFN0YXJ0IGEgbmV3IHNjb3BlIHdpdGggcmVnYXJkIHRvIGxhYmVscyBhbmQgdGhlIGBpbkZ1bmN0aW9uYFxuICAgICAgLy8gZmxhZyAocmVzdG9yZSB0aGVtIHRvIHRoZWlyIG9sZCB2YWx1ZSBhZnRlcndhcmRzKS5cbiAgICAgIHZhciBvbGRMYWJlbHMgPSB0aGlzLmxhYmVscztcbiAgICAgIHRoaXMubGFiZWxzID0gW107XG4gICAgICBpZiAodXNlU3RyaWN0KSB7IHRoaXMuc3RyaWN0ID0gdHJ1ZTsgfVxuXG4gICAgICAvLyBBZGQgdGhlIHBhcmFtcyB0byB2YXJEZWNsYXJlZE5hbWVzIHRvIGVuc3VyZSB0aGF0IGFuIGVycm9yIGlzIHRocm93blxuICAgICAgLy8gaWYgYSBsZXQvY29uc3QgZGVjbGFyYXRpb24gaW4gdGhlIGZ1bmN0aW9uIGNsYXNoZXMgd2l0aCBvbmUgb2YgdGhlIHBhcmFtcy5cbiAgICAgIHRoaXMuY2hlY2tQYXJhbXMobm9kZSwgIW9sZFN0cmljdCAmJiAhdXNlU3RyaWN0ICYmICFpc0Fycm93RnVuY3Rpb24gJiYgIWlzTWV0aG9kICYmIHRoaXMuaXNTaW1wbGVQYXJhbUxpc3Qobm9kZS5wYXJhbXMpKTtcbiAgICAgIC8vIEVuc3VyZSB0aGUgZnVuY3Rpb24gbmFtZSBpc24ndCBhIGZvcmJpZGRlbiBpZGVudGlmaWVyIGluIHN0cmljdCBtb2RlLCBlLmcuICdldmFsJ1xuICAgICAgaWYgKHRoaXMuc3RyaWN0ICYmIG5vZGUuaWQpIHsgdGhpcy5jaGVja0xWYWxTaW1wbGUobm9kZS5pZCwgQklORF9PVVRTSURFKTsgfVxuICAgICAgbm9kZS5ib2R5ID0gdGhpcy5wYXJzZUJsb2NrKGZhbHNlLCB1bmRlZmluZWQsIHVzZVN0cmljdCAmJiAhb2xkU3RyaWN0KTtcbiAgICAgIG5vZGUuZXhwcmVzc2lvbiA9IGZhbHNlO1xuICAgICAgdGhpcy5hZGFwdERpcmVjdGl2ZVByb2xvZ3VlKG5vZGUuYm9keS5ib2R5KTtcbiAgICAgIHRoaXMubGFiZWxzID0gb2xkTGFiZWxzO1xuICAgIH1cbiAgICB0aGlzLmV4aXRTY29wZSgpO1xuICB9O1xuXG4gIHBwJDUuaXNTaW1wbGVQYXJhbUxpc3QgPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGlzdCA9IHBhcmFtczsgaSA8IGxpc3QubGVuZ3RoOyBpICs9IDEpXG4gICAgICB7XG4gICAgICB2YXIgcGFyYW0gPSBsaXN0W2ldO1xuXG4gICAgICBpZiAocGFyYW0udHlwZSAhPT0gXCJJZGVudGlmaWVyXCIpIHsgcmV0dXJuIGZhbHNlXG4gICAgfSB9XG4gICAgcmV0dXJuIHRydWVcbiAgfTtcblxuICAvLyBDaGVja3MgZnVuY3Rpb24gcGFyYW1zIGZvciB2YXJpb3VzIGRpc2FsbG93ZWQgcGF0dGVybnMgc3VjaCBhcyB1c2luZyBcImV2YWxcIlxuICAvLyBvciBcImFyZ3VtZW50c1wiIGFuZCBkdXBsaWNhdGUgcGFyYW1ldGVycy5cblxuICBwcCQ1LmNoZWNrUGFyYW1zID0gZnVuY3Rpb24obm9kZSwgYWxsb3dEdXBsaWNhdGVzKSB7XG4gICAgdmFyIG5hbWVIYXNoID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGlzdCA9IG5vZGUucGFyYW1zOyBpIDwgbGlzdC5sZW5ndGg7IGkgKz0gMSlcbiAgICAgIHtcbiAgICAgIHZhciBwYXJhbSA9IGxpc3RbaV07XG5cbiAgICAgIHRoaXMuY2hlY2tMVmFsSW5uZXJQYXR0ZXJuKHBhcmFtLCBCSU5EX1ZBUiwgYWxsb3dEdXBsaWNhdGVzID8gbnVsbCA6IG5hbWVIYXNoKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUGFyc2VzIGEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgZXhwcmVzc2lvbnMsIGFuZCByZXR1cm5zIHRoZW0gYXNcbiAgLy8gYW4gYXJyYXkuIGBjbG9zZWAgaXMgdGhlIHRva2VuIHR5cGUgdGhhdCBlbmRzIHRoZSBsaXN0LCBhbmRcbiAgLy8gYGFsbG93RW1wdHlgIGNhbiBiZSB0dXJuZWQgb24gdG8gYWxsb3cgc3Vic2VxdWVudCBjb21tYXMgd2l0aFxuICAvLyBub3RoaW5nIGluIGJldHdlZW4gdGhlbSB0byBiZSBwYXJzZWQgYXMgYG51bGxgICh3aGljaCBpcyBuZWVkZWRcbiAgLy8gZm9yIGFycmF5IGxpdGVyYWxzKS5cblxuICBwcCQ1LnBhcnNlRXhwckxpc3QgPSBmdW5jdGlvbihjbG9zZSwgYWxsb3dUcmFpbGluZ0NvbW1hLCBhbGxvd0VtcHR5LCByZWZEZXN0cnVjdHVyaW5nRXJyb3JzKSB7XG4gICAgdmFyIGVsdHMgPSBbXSwgZmlyc3QgPSB0cnVlO1xuICAgIHdoaWxlICghdGhpcy5lYXQoY2xvc2UpKSB7XG4gICAgICBpZiAoIWZpcnN0KSB7XG4gICAgICAgIHRoaXMuZXhwZWN0KHR5cGVzJDEuY29tbWEpO1xuICAgICAgICBpZiAoYWxsb3dUcmFpbGluZ0NvbW1hICYmIHRoaXMuYWZ0ZXJUcmFpbGluZ0NvbW1hKGNsb3NlKSkgeyBicmVhayB9XG4gICAgICB9IGVsc2UgeyBmaXJzdCA9IGZhbHNlOyB9XG5cbiAgICAgIHZhciBlbHQgPSAodm9pZCAwKTtcbiAgICAgIGlmIChhbGxvd0VtcHR5ICYmIHRoaXMudHlwZSA9PT0gdHlwZXMkMS5jb21tYSlcbiAgICAgICAgeyBlbHQgPSBudWxsOyB9XG4gICAgICBlbHNlIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuZWxsaXBzaXMpIHtcbiAgICAgICAgZWx0ID0gdGhpcy5wYXJzZVNwcmVhZChyZWZEZXN0cnVjdHVyaW5nRXJyb3JzKTtcbiAgICAgICAgaWYgKHJlZkRlc3RydWN0dXJpbmdFcnJvcnMgJiYgdGhpcy50eXBlID09PSB0eXBlcyQxLmNvbW1hICYmIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMudHJhaWxpbmdDb21tYSA8IDApXG4gICAgICAgICAgeyByZWZEZXN0cnVjdHVyaW5nRXJyb3JzLnRyYWlsaW5nQ29tbWEgPSB0aGlzLnN0YXJ0OyB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbHQgPSB0aGlzLnBhcnNlTWF5YmVBc3NpZ24oZmFsc2UsIHJlZkRlc3RydWN0dXJpbmdFcnJvcnMpO1xuICAgICAgfVxuICAgICAgZWx0cy5wdXNoKGVsdCk7XG4gICAgfVxuICAgIHJldHVybiBlbHRzXG4gIH07XG5cbiAgcHAkNS5jaGVja1VucmVzZXJ2ZWQgPSBmdW5jdGlvbihyZWYpIHtcbiAgICB2YXIgc3RhcnQgPSByZWYuc3RhcnQ7XG4gICAgdmFyIGVuZCA9IHJlZi5lbmQ7XG4gICAgdmFyIG5hbWUgPSByZWYubmFtZTtcblxuICAgIGlmICh0aGlzLmluR2VuZXJhdG9yICYmIG5hbWUgPT09IFwieWllbGRcIilcbiAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHN0YXJ0LCBcIkNhbm5vdCB1c2UgJ3lpZWxkJyBhcyBpZGVudGlmaWVyIGluc2lkZSBhIGdlbmVyYXRvclwiKTsgfVxuICAgIGlmICh0aGlzLmluQXN5bmMgJiYgbmFtZSA9PT0gXCJhd2FpdFwiKVxuICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUoc3RhcnQsIFwiQ2Fubm90IHVzZSAnYXdhaXQnIGFzIGlkZW50aWZpZXIgaW5zaWRlIGFuIGFzeW5jIGZ1bmN0aW9uXCIpOyB9XG4gICAgaWYgKHRoaXMuY3VycmVudFRoaXNTY29wZSgpLmluQ2xhc3NGaWVsZEluaXQgJiYgbmFtZSA9PT0gXCJhcmd1bWVudHNcIilcbiAgICAgIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHN0YXJ0LCBcIkNhbm5vdCB1c2UgJ2FyZ3VtZW50cycgaW4gY2xhc3MgZmllbGQgaW5pdGlhbGl6ZXJcIik7IH1cbiAgICBpZiAodGhpcy5pbkNsYXNzU3RhdGljQmxvY2sgJiYgKG5hbWUgPT09IFwiYXJndW1lbnRzXCIgfHwgbmFtZSA9PT0gXCJhd2FpdFwiKSlcbiAgICAgIHsgdGhpcy5yYWlzZShzdGFydCwgKFwiQ2Fubm90IHVzZSBcIiArIG5hbWUgKyBcIiBpbiBjbGFzcyBzdGF0aWMgaW5pdGlhbGl6YXRpb24gYmxvY2tcIikpOyB9XG4gICAgaWYgKHRoaXMua2V5d29yZHMudGVzdChuYW1lKSlcbiAgICAgIHsgdGhpcy5yYWlzZShzdGFydCwgKFwiVW5leHBlY3RlZCBrZXl3b3JkICdcIiArIG5hbWUgKyBcIidcIikpOyB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA8IDYgJiZcbiAgICAgIHRoaXMuaW5wdXQuc2xpY2Uoc3RhcnQsIGVuZCkuaW5kZXhPZihcIlxcXFxcIikgIT09IC0xKSB7IHJldHVybiB9XG4gICAgdmFyIHJlID0gdGhpcy5zdHJpY3QgPyB0aGlzLnJlc2VydmVkV29yZHNTdHJpY3QgOiB0aGlzLnJlc2VydmVkV29yZHM7XG4gICAgaWYgKHJlLnRlc3QobmFtZSkpIHtcbiAgICAgIGlmICghdGhpcy5pbkFzeW5jICYmIG5hbWUgPT09IFwiYXdhaXRcIilcbiAgICAgICAgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUoc3RhcnQsIFwiQ2Fubm90IHVzZSBrZXl3b3JkICdhd2FpdCcgb3V0c2lkZSBhbiBhc3luYyBmdW5jdGlvblwiKTsgfVxuICAgICAgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHN0YXJ0LCAoXCJUaGUga2V5d29yZCAnXCIgKyBuYW1lICsgXCInIGlzIHJlc2VydmVkXCIpKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUGFyc2UgdGhlIG5leHQgdG9rZW4gYXMgYW4gaWRlbnRpZmllci4gSWYgYGxpYmVyYWxgIGlzIHRydWUgKHVzZWRcbiAgLy8gd2hlbiBwYXJzaW5nIHByb3BlcnRpZXMpLCBpdCB3aWxsIGFsc28gY29udmVydCBrZXl3b3JkcyBpbnRvXG4gIC8vIGlkZW50aWZpZXJzLlxuXG4gIHBwJDUucGFyc2VJZGVudCA9IGZ1bmN0aW9uKGxpYmVyYWwpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMucGFyc2VJZGVudE5vZGUoKTtcbiAgICB0aGlzLm5leHQoISFsaWJlcmFsKTtcbiAgICB0aGlzLmZpbmlzaE5vZGUobm9kZSwgXCJJZGVudGlmaWVyXCIpO1xuICAgIGlmICghbGliZXJhbCkge1xuICAgICAgdGhpcy5jaGVja1VucmVzZXJ2ZWQobm9kZSk7XG4gICAgICBpZiAobm9kZS5uYW1lID09PSBcImF3YWl0XCIgJiYgIXRoaXMuYXdhaXRJZGVudFBvcylcbiAgICAgICAgeyB0aGlzLmF3YWl0SWRlbnRQb3MgPSBub2RlLnN0YXJ0OyB9XG4gICAgfVxuICAgIHJldHVybiBub2RlXG4gIH07XG5cbiAgcHAkNS5wYXJzZUlkZW50Tm9kZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBub2RlID0gdGhpcy5zdGFydE5vZGUoKTtcbiAgICBpZiAodGhpcy50eXBlID09PSB0eXBlcyQxLm5hbWUpIHtcbiAgICAgIG5vZGUubmFtZSA9IHRoaXMudmFsdWU7XG4gICAgfSBlbHNlIGlmICh0aGlzLnR5cGUua2V5d29yZCkge1xuICAgICAgbm9kZS5uYW1lID0gdGhpcy50eXBlLmtleXdvcmQ7XG5cbiAgICAgIC8vIFRvIGZpeCBodHRwczovL2dpdGh1Yi5jb20vYWNvcm5qcy9hY29ybi9pc3N1ZXMvNTc1XG4gICAgICAvLyBgY2xhc3NgIGFuZCBgZnVuY3Rpb25gIGtleXdvcmRzIHB1c2ggbmV3IGNvbnRleHQgaW50byB0aGlzLmNvbnRleHQuXG4gICAgICAvLyBCdXQgdGhlcmUgaXMgbm8gY2hhbmNlIHRvIHBvcCB0aGUgY29udGV4dCBpZiB0aGUga2V5d29yZCBpcyBjb25zdW1lZCBhcyBhbiBpZGVudGlmaWVyIHN1Y2ggYXMgYSBwcm9wZXJ0eSBuYW1lLlxuICAgICAgLy8gSWYgdGhlIHByZXZpb3VzIHRva2VuIGlzIGEgZG90LCB0aGlzIGRvZXMgbm90IGFwcGx5IGJlY2F1c2UgdGhlIGNvbnRleHQtbWFuYWdpbmcgY29kZSBhbHJlYWR5IGlnbm9yZWQgdGhlIGtleXdvcmRcbiAgICAgIGlmICgobm9kZS5uYW1lID09PSBcImNsYXNzXCIgfHwgbm9kZS5uYW1lID09PSBcImZ1bmN0aW9uXCIpICYmXG4gICAgICAgICh0aGlzLmxhc3RUb2tFbmQgIT09IHRoaXMubGFzdFRva1N0YXJ0ICsgMSB8fCB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5sYXN0VG9rU3RhcnQpICE9PSA0NikpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0LnBvcCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVuZXhwZWN0ZWQoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVcbiAgfTtcblxuICBwcCQ1LnBhcnNlUHJpdmF0ZUlkZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEucHJpdmF0ZUlkKSB7XG4gICAgICBub2RlLm5hbWUgPSB0aGlzLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVuZXhwZWN0ZWQoKTtcbiAgICB9XG4gICAgdGhpcy5uZXh0KCk7XG4gICAgdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiUHJpdmF0ZUlkZW50aWZpZXJcIik7XG5cbiAgICAvLyBGb3IgdmFsaWRhdGluZyBleGlzdGVuY2VcbiAgICBpZiAodGhpcy5vcHRpb25zLmNoZWNrUHJpdmF0ZUZpZWxkcykge1xuICAgICAgaWYgKHRoaXMucHJpdmF0ZU5hbWVTdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5yYWlzZShub2RlLnN0YXJ0LCAoXCJQcml2YXRlIGZpZWxkICcjXCIgKyAobm9kZS5uYW1lKSArIFwiJyBtdXN0IGJlIGRlY2xhcmVkIGluIGFuIGVuY2xvc2luZyBjbGFzc1wiKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnByaXZhdGVOYW1lU3RhY2tbdGhpcy5wcml2YXRlTmFtZVN0YWNrLmxlbmd0aCAtIDFdLnVzZWQucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZVxuICB9O1xuXG4gIC8vIFBhcnNlcyB5aWVsZCBleHByZXNzaW9uIGluc2lkZSBnZW5lcmF0b3IuXG5cbiAgcHAkNS5wYXJzZVlpZWxkID0gZnVuY3Rpb24oZm9ySW5pdCkge1xuICAgIGlmICghdGhpcy55aWVsZFBvcykgeyB0aGlzLnlpZWxkUG9zID0gdGhpcy5zdGFydDsgfVxuXG4gICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgIHRoaXMubmV4dCgpO1xuICAgIGlmICh0aGlzLnR5cGUgPT09IHR5cGVzJDEuc2VtaSB8fCB0aGlzLmNhbkluc2VydFNlbWljb2xvbigpIHx8ICh0aGlzLnR5cGUgIT09IHR5cGVzJDEuc3RhciAmJiAhdGhpcy50eXBlLnN0YXJ0c0V4cHIpKSB7XG4gICAgICBub2RlLmRlbGVnYXRlID0gZmFsc2U7XG4gICAgICBub2RlLmFyZ3VtZW50ID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZS5kZWxlZ2F0ZSA9IHRoaXMuZWF0KHR5cGVzJDEuc3Rhcik7XG4gICAgICBub2RlLmFyZ3VtZW50ID0gdGhpcy5wYXJzZU1heWJlQXNzaWduKGZvckluaXQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maW5pc2hOb2RlKG5vZGUsIFwiWWllbGRFeHByZXNzaW9uXCIpXG4gIH07XG5cbiAgcHAkNS5wYXJzZUF3YWl0ID0gZnVuY3Rpb24oZm9ySW5pdCkge1xuICAgIGlmICghdGhpcy5hd2FpdFBvcykgeyB0aGlzLmF3YWl0UG9zID0gdGhpcy5zdGFydDsgfVxuXG4gICAgdmFyIG5vZGUgPSB0aGlzLnN0YXJ0Tm9kZSgpO1xuICAgIHRoaXMubmV4dCgpO1xuICAgIG5vZGUuYXJndW1lbnQgPSB0aGlzLnBhcnNlTWF5YmVVbmFyeShudWxsLCB0cnVlLCBmYWxzZSwgZm9ySW5pdCk7XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoTm9kZShub2RlLCBcIkF3YWl0RXhwcmVzc2lvblwiKVxuICB9O1xuXG4gIHZhciBwcCQ0ID0gUGFyc2VyLnByb3RvdHlwZTtcblxuICAvLyBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gcmFpc2UgZXhjZXB0aW9ucyBvbiBwYXJzZSBlcnJvcnMuIEl0XG4gIC8vIHRha2VzIGFuIG9mZnNldCBpbnRlZ2VyIChpbnRvIHRoZSBjdXJyZW50IGBpbnB1dGApIHRvIGluZGljYXRlXG4gIC8vIHRoZSBsb2NhdGlvbiBvZiB0aGUgZXJyb3IsIGF0dGFjaGVzIHRoZSBwb3NpdGlvbiB0byB0aGUgZW5kXG4gIC8vIG9mIHRoZSBlcnJvciBtZXNzYWdlLCBhbmQgdGhlbiByYWlzZXMgYSBgU3ludGF4RXJyb3JgIHdpdGggdGhhdFxuICAvLyBtZXNzYWdlLlxuXG4gIHBwJDQucmFpc2UgPSBmdW5jdGlvbihwb3MsIG1lc3NhZ2UpIHtcbiAgICB2YXIgbG9jID0gZ2V0TGluZUluZm8odGhpcy5pbnB1dCwgcG9zKTtcbiAgICBtZXNzYWdlICs9IFwiIChcIiArIGxvYy5saW5lICsgXCI6XCIgKyBsb2MuY29sdW1uICsgXCIpXCI7XG4gICAgdmFyIGVyciA9IG5ldyBTeW50YXhFcnJvcihtZXNzYWdlKTtcbiAgICBlcnIucG9zID0gcG9zOyBlcnIubG9jID0gbG9jOyBlcnIucmFpc2VkQXQgPSB0aGlzLnBvcztcbiAgICB0aHJvdyBlcnJcbiAgfTtcblxuICBwcCQ0LnJhaXNlUmVjb3ZlcmFibGUgPSBwcCQ0LnJhaXNlO1xuXG4gIHBwJDQuY3VyUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmxvY2F0aW9ucykge1xuICAgICAgcmV0dXJuIG5ldyBQb3NpdGlvbih0aGlzLmN1ckxpbmUsIHRoaXMucG9zIC0gdGhpcy5saW5lU3RhcnQpXG4gICAgfVxuICB9O1xuXG4gIHZhciBwcCQzID0gUGFyc2VyLnByb3RvdHlwZTtcblxuICB2YXIgU2NvcGUgPSBmdW5jdGlvbiBTY29wZShmbGFncykge1xuICAgIHRoaXMuZmxhZ3MgPSBmbGFncztcbiAgICAvLyBBIGxpc3Qgb2YgdmFyLWRlY2xhcmVkIG5hbWVzIGluIHRoZSBjdXJyZW50IGxleGljYWwgc2NvcGVcbiAgICB0aGlzLnZhciA9IFtdO1xuICAgIC8vIEEgbGlzdCBvZiBsZXhpY2FsbHktZGVjbGFyZWQgbmFtZXMgaW4gdGhlIGN1cnJlbnQgbGV4aWNhbCBzY29wZVxuICAgIHRoaXMubGV4aWNhbCA9IFtdO1xuICAgIC8vIEEgbGlzdCBvZiBsZXhpY2FsbHktZGVjbGFyZWQgRnVuY3Rpb25EZWNsYXJhdGlvbiBuYW1lcyBpbiB0aGUgY3VycmVudCBsZXhpY2FsIHNjb3BlXG4gICAgdGhpcy5mdW5jdGlvbnMgPSBbXTtcbiAgICAvLyBBIHN3aXRjaCB0byBkaXNhbGxvdyB0aGUgaWRlbnRpZmllciByZWZlcmVuY2UgJ2FyZ3VtZW50cydcbiAgICB0aGlzLmluQ2xhc3NGaWVsZEluaXQgPSBmYWxzZTtcbiAgfTtcblxuICAvLyBUaGUgZnVuY3Rpb25zIGluIHRoaXMgbW9kdWxlIGtlZXAgdHJhY2sgb2YgZGVjbGFyZWQgdmFyaWFibGVzIGluIHRoZSBjdXJyZW50IHNjb3BlIGluIG9yZGVyIHRvIGRldGVjdCBkdXBsaWNhdGUgdmFyaWFibGUgbmFtZXMuXG5cbiAgcHAkMy5lbnRlclNjb3BlID0gZnVuY3Rpb24oZmxhZ3MpIHtcbiAgICB0aGlzLnNjb3BlU3RhY2sucHVzaChuZXcgU2NvcGUoZmxhZ3MpKTtcbiAgfTtcblxuICBwcCQzLmV4aXRTY29wZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcbiAgfTtcblxuICAvLyBUaGUgc3BlYyBzYXlzOlxuICAvLyA+IEF0IHRoZSB0b3AgbGV2ZWwgb2YgYSBmdW5jdGlvbiwgb3Igc2NyaXB0LCBmdW5jdGlvbiBkZWNsYXJhdGlvbnMgYXJlXG4gIC8vID4gdHJlYXRlZCBsaWtlIHZhciBkZWNsYXJhdGlvbnMgcmF0aGVyIHRoYW4gbGlrZSBsZXhpY2FsIGRlY2xhcmF0aW9ucy5cbiAgcHAkMy50cmVhdEZ1bmN0aW9uc0FzVmFySW5TY29wZSA9IGZ1bmN0aW9uKHNjb3BlKSB7XG4gICAgcmV0dXJuIChzY29wZS5mbGFncyAmIFNDT1BFX0ZVTkNUSU9OKSB8fCAhdGhpcy5pbk1vZHVsZSAmJiAoc2NvcGUuZmxhZ3MgJiBTQ09QRV9UT1ApXG4gIH07XG5cbiAgcHAkMy5kZWNsYXJlTmFtZSA9IGZ1bmN0aW9uKG5hbWUsIGJpbmRpbmdUeXBlLCBwb3MpIHtcbiAgICB2YXIgcmVkZWNsYXJlZCA9IGZhbHNlO1xuICAgIGlmIChiaW5kaW5nVHlwZSA9PT0gQklORF9MRVhJQ0FMKSB7XG4gICAgICB2YXIgc2NvcGUgPSB0aGlzLmN1cnJlbnRTY29wZSgpO1xuICAgICAgcmVkZWNsYXJlZCA9IHNjb3BlLmxleGljYWwuaW5kZXhPZihuYW1lKSA+IC0xIHx8IHNjb3BlLmZ1bmN0aW9ucy5pbmRleE9mKG5hbWUpID4gLTEgfHwgc2NvcGUudmFyLmluZGV4T2YobmFtZSkgPiAtMTtcbiAgICAgIHNjb3BlLmxleGljYWwucHVzaChuYW1lKTtcbiAgICAgIGlmICh0aGlzLmluTW9kdWxlICYmIChzY29wZS5mbGFncyAmIFNDT1BFX1RPUCkpXG4gICAgICAgIHsgZGVsZXRlIHRoaXMudW5kZWZpbmVkRXhwb3J0c1tuYW1lXTsgfVxuICAgIH0gZWxzZSBpZiAoYmluZGluZ1R5cGUgPT09IEJJTkRfU0lNUExFX0NBVENIKSB7XG4gICAgICB2YXIgc2NvcGUkMSA9IHRoaXMuY3VycmVudFNjb3BlKCk7XG4gICAgICBzY29wZSQxLmxleGljYWwucHVzaChuYW1lKTtcbiAgICB9IGVsc2UgaWYgKGJpbmRpbmdUeXBlID09PSBCSU5EX0ZVTkNUSU9OKSB7XG4gICAgICB2YXIgc2NvcGUkMiA9IHRoaXMuY3VycmVudFNjb3BlKCk7XG4gICAgICBpZiAodGhpcy50cmVhdEZ1bmN0aW9uc0FzVmFyKVxuICAgICAgICB7IHJlZGVjbGFyZWQgPSBzY29wZSQyLmxleGljYWwuaW5kZXhPZihuYW1lKSA+IC0xOyB9XG4gICAgICBlbHNlXG4gICAgICAgIHsgcmVkZWNsYXJlZCA9IHNjb3BlJDIubGV4aWNhbC5pbmRleE9mKG5hbWUpID4gLTEgfHwgc2NvcGUkMi52YXIuaW5kZXhPZihuYW1lKSA+IC0xOyB9XG4gICAgICBzY29wZSQyLmZ1bmN0aW9ucy5wdXNoKG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy5zY29wZVN0YWNrLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBzY29wZSQzID0gdGhpcy5zY29wZVN0YWNrW2ldO1xuICAgICAgICBpZiAoc2NvcGUkMy5sZXhpY2FsLmluZGV4T2YobmFtZSkgPiAtMSAmJiAhKChzY29wZSQzLmZsYWdzICYgU0NPUEVfU0lNUExFX0NBVENIKSAmJiBzY29wZSQzLmxleGljYWxbMF0gPT09IG5hbWUpIHx8XG4gICAgICAgICAgICAhdGhpcy50cmVhdEZ1bmN0aW9uc0FzVmFySW5TY29wZShzY29wZSQzKSAmJiBzY29wZSQzLmZ1bmN0aW9ucy5pbmRleE9mKG5hbWUpID4gLTEpIHtcbiAgICAgICAgICByZWRlY2xhcmVkID0gdHJ1ZTtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlJDMudmFyLnB1c2gobmFtZSk7XG4gICAgICAgIGlmICh0aGlzLmluTW9kdWxlICYmIChzY29wZSQzLmZsYWdzICYgU0NPUEVfVE9QKSlcbiAgICAgICAgICB7IGRlbGV0ZSB0aGlzLnVuZGVmaW5lZEV4cG9ydHNbbmFtZV07IH1cbiAgICAgICAgaWYgKHNjb3BlJDMuZmxhZ3MgJiBTQ09QRV9WQVIpIHsgYnJlYWsgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAocmVkZWNsYXJlZCkgeyB0aGlzLnJhaXNlUmVjb3ZlcmFibGUocG9zLCAoXCJJZGVudGlmaWVyICdcIiArIG5hbWUgKyBcIicgaGFzIGFscmVhZHkgYmVlbiBkZWNsYXJlZFwiKSk7IH1cbiAgfTtcblxuICBwcCQzLmNoZWNrTG9jYWxFeHBvcnQgPSBmdW5jdGlvbihpZCkge1xuICAgIC8vIHNjb3BlLmZ1bmN0aW9ucyBtdXN0IGJlIGVtcHR5IGFzIE1vZHVsZSBjb2RlIGlzIGFsd2F5cyBzdHJpY3QuXG4gICAgaWYgKHRoaXMuc2NvcGVTdGFja1swXS5sZXhpY2FsLmluZGV4T2YoaWQubmFtZSkgPT09IC0xICYmXG4gICAgICAgIHRoaXMuc2NvcGVTdGFja1swXS52YXIuaW5kZXhPZihpZC5uYW1lKSA9PT0gLTEpIHtcbiAgICAgIHRoaXMudW5kZWZpbmVkRXhwb3J0c1tpZC5uYW1lXSA9IGlkO1xuICAgIH1cbiAgfTtcblxuICBwcCQzLmN1cnJlbnRTY29wZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnNjb3BlU3RhY2tbdGhpcy5zY29wZVN0YWNrLmxlbmd0aCAtIDFdXG4gIH07XG5cbiAgcHAkMy5jdXJyZW50VmFyU2NvcGUgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5zY29wZVN0YWNrLmxlbmd0aCAtIDE7OyBpLS0pIHtcbiAgICAgIHZhciBzY29wZSA9IHRoaXMuc2NvcGVTdGFja1tpXTtcbiAgICAgIGlmIChzY29wZS5mbGFncyAmIFNDT1BFX1ZBUikgeyByZXR1cm4gc2NvcGUgfVxuICAgIH1cbiAgfTtcblxuICAvLyBDb3VsZCBiZSB1c2VmdWwgZm9yIGB0aGlzYCwgYG5ldy50YXJnZXRgLCBgc3VwZXIoKWAsIGBzdXBlci5wcm9wZXJ0eWAsIGFuZCBgc3VwZXJbcHJvcGVydHldYC5cbiAgcHAkMy5jdXJyZW50VGhpc1Njb3BlID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IHRoaXMuc2NvcGVTdGFjay5sZW5ndGggLSAxOzsgaS0tKSB7XG4gICAgICB2YXIgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2tbaV07XG4gICAgICBpZiAoc2NvcGUuZmxhZ3MgJiBTQ09QRV9WQVIgJiYgIShzY29wZS5mbGFncyAmIFNDT1BFX0FSUk9XKSkgeyByZXR1cm4gc2NvcGUgfVxuICAgIH1cbiAgfTtcblxuICB2YXIgTm9kZSA9IGZ1bmN0aW9uIE5vZGUocGFyc2VyLCBwb3MsIGxvYykge1xuICAgIHRoaXMudHlwZSA9IFwiXCI7XG4gICAgdGhpcy5zdGFydCA9IHBvcztcbiAgICB0aGlzLmVuZCA9IDA7XG4gICAgaWYgKHBhcnNlci5vcHRpb25zLmxvY2F0aW9ucylcbiAgICAgIHsgdGhpcy5sb2MgPSBuZXcgU291cmNlTG9jYXRpb24ocGFyc2VyLCBsb2MpOyB9XG4gICAgaWYgKHBhcnNlci5vcHRpb25zLmRpcmVjdFNvdXJjZUZpbGUpXG4gICAgICB7IHRoaXMuc291cmNlRmlsZSA9IHBhcnNlci5vcHRpb25zLmRpcmVjdFNvdXJjZUZpbGU7IH1cbiAgICBpZiAocGFyc2VyLm9wdGlvbnMucmFuZ2VzKVxuICAgICAgeyB0aGlzLnJhbmdlID0gW3BvcywgMF07IH1cbiAgfTtcblxuICAvLyBTdGFydCBhbiBBU1Qgbm9kZSwgYXR0YWNoaW5nIGEgc3RhcnQgb2Zmc2V0LlxuXG4gIHZhciBwcCQyID0gUGFyc2VyLnByb3RvdHlwZTtcblxuICBwcCQyLnN0YXJ0Tm9kZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgTm9kZSh0aGlzLCB0aGlzLnN0YXJ0LCB0aGlzLnN0YXJ0TG9jKVxuICB9O1xuXG4gIHBwJDIuc3RhcnROb2RlQXQgPSBmdW5jdGlvbihwb3MsIGxvYykge1xuICAgIHJldHVybiBuZXcgTm9kZSh0aGlzLCBwb3MsIGxvYylcbiAgfTtcblxuICAvLyBGaW5pc2ggYW4gQVNUIG5vZGUsIGFkZGluZyBgdHlwZWAgYW5kIGBlbmRgIHByb3BlcnRpZXMuXG5cbiAgZnVuY3Rpb24gZmluaXNoTm9kZUF0KG5vZGUsIHR5cGUsIHBvcywgbG9jKSB7XG4gICAgbm9kZS50eXBlID0gdHlwZTtcbiAgICBub2RlLmVuZCA9IHBvcztcbiAgICBpZiAodGhpcy5vcHRpb25zLmxvY2F0aW9ucylcbiAgICAgIHsgbm9kZS5sb2MuZW5kID0gbG9jOyB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpXG4gICAgICB7IG5vZGUucmFuZ2VbMV0gPSBwb3M7IH1cbiAgICByZXR1cm4gbm9kZVxuICB9XG5cbiAgcHAkMi5maW5pc2hOb2RlID0gZnVuY3Rpb24obm9kZSwgdHlwZSkge1xuICAgIHJldHVybiBmaW5pc2hOb2RlQXQuY2FsbCh0aGlzLCBub2RlLCB0eXBlLCB0aGlzLmxhc3RUb2tFbmQsIHRoaXMubGFzdFRva0VuZExvYylcbiAgfTtcblxuICAvLyBGaW5pc2ggbm9kZSBhdCBnaXZlbiBwb3NpdGlvblxuXG4gIHBwJDIuZmluaXNoTm9kZUF0ID0gZnVuY3Rpb24obm9kZSwgdHlwZSwgcG9zLCBsb2MpIHtcbiAgICByZXR1cm4gZmluaXNoTm9kZUF0LmNhbGwodGhpcywgbm9kZSwgdHlwZSwgcG9zLCBsb2MpXG4gIH07XG5cbiAgcHAkMi5jb3B5Tm9kZSA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB2YXIgbmV3Tm9kZSA9IG5ldyBOb2RlKHRoaXMsIG5vZGUuc3RhcnQsIHRoaXMuc3RhcnRMb2MpO1xuICAgIGZvciAodmFyIHByb3AgaW4gbm9kZSkgeyBuZXdOb2RlW3Byb3BdID0gbm9kZVtwcm9wXTsgfVxuICAgIHJldHVybiBuZXdOb2RlXG4gIH07XG5cbiAgLy8gVGhpcyBmaWxlIGNvbnRhaW5zIFVuaWNvZGUgcHJvcGVydGllcyBleHRyYWN0ZWQgZnJvbSB0aGUgRUNNQVNjcmlwdCBzcGVjaWZpY2F0aW9uLlxuICAvLyBUaGUgbGlzdHMgYXJlIGV4dHJhY3RlZCBsaWtlIHNvOlxuICAvLyAkJCgnI3RhYmxlLWJpbmFyeS11bmljb2RlLXByb3BlcnRpZXMgPiBmaWd1cmUgPiB0YWJsZSA+IHRib2R5ID4gdHIgPiB0ZDpudGgtY2hpbGQoMSkgY29kZScpLm1hcChlbCA9PiBlbC5pbm5lclRleHQpXG5cbiAgLy8gI3RhYmxlLWJpbmFyeS11bmljb2RlLXByb3BlcnRpZXNcbiAgdmFyIGVjbWE5QmluYXJ5UHJvcGVydGllcyA9IFwiQVNDSUkgQVNDSUlfSGV4X0RpZ2l0IEFIZXggQWxwaGFiZXRpYyBBbHBoYSBBbnkgQXNzaWduZWQgQmlkaV9Db250cm9sIEJpZGlfQyBCaWRpX01pcnJvcmVkIEJpZGlfTSBDYXNlX0lnbm9yYWJsZSBDSSBDYXNlZCBDaGFuZ2VzX1doZW5fQ2FzZWZvbGRlZCBDV0NGIENoYW5nZXNfV2hlbl9DYXNlbWFwcGVkIENXQ00gQ2hhbmdlc19XaGVuX0xvd2VyY2FzZWQgQ1dMIENoYW5nZXNfV2hlbl9ORktDX0Nhc2Vmb2xkZWQgQ1dLQ0YgQ2hhbmdlc19XaGVuX1RpdGxlY2FzZWQgQ1dUIENoYW5nZXNfV2hlbl9VcHBlcmNhc2VkIENXVSBEYXNoIERlZmF1bHRfSWdub3JhYmxlX0NvZGVfUG9pbnQgREkgRGVwcmVjYXRlZCBEZXAgRGlhY3JpdGljIERpYSBFbW9qaSBFbW9qaV9Db21wb25lbnQgRW1vamlfTW9kaWZpZXIgRW1vamlfTW9kaWZpZXJfQmFzZSBFbW9qaV9QcmVzZW50YXRpb24gRXh0ZW5kZXIgRXh0IEdyYXBoZW1lX0Jhc2UgR3JfQmFzZSBHcmFwaGVtZV9FeHRlbmQgR3JfRXh0IEhleF9EaWdpdCBIZXggSURTX0JpbmFyeV9PcGVyYXRvciBJRFNCIElEU19UcmluYXJ5X09wZXJhdG9yIElEU1QgSURfQ29udGludWUgSURDIElEX1N0YXJ0IElEUyBJZGVvZ3JhcGhpYyBJZGVvIEpvaW5fQ29udHJvbCBKb2luX0MgTG9naWNhbF9PcmRlcl9FeGNlcHRpb24gTE9FIExvd2VyY2FzZSBMb3dlciBNYXRoIE5vbmNoYXJhY3Rlcl9Db2RlX1BvaW50IE5DaGFyIFBhdHRlcm5fU3ludGF4IFBhdF9TeW4gUGF0dGVybl9XaGl0ZV9TcGFjZSBQYXRfV1MgUXVvdGF0aW9uX01hcmsgUU1hcmsgUmFkaWNhbCBSZWdpb25hbF9JbmRpY2F0b3IgUkkgU2VudGVuY2VfVGVybWluYWwgU1Rlcm0gU29mdF9Eb3R0ZWQgU0QgVGVybWluYWxfUHVuY3R1YXRpb24gVGVybSBVbmlmaWVkX0lkZW9ncmFwaCBVSWRlbyBVcHBlcmNhc2UgVXBwZXIgVmFyaWF0aW9uX1NlbGVjdG9yIFZTIFdoaXRlX1NwYWNlIHNwYWNlIFhJRF9Db250aW51ZSBYSURDIFhJRF9TdGFydCBYSURTXCI7XG4gIHZhciBlY21hMTBCaW5hcnlQcm9wZXJ0aWVzID0gZWNtYTlCaW5hcnlQcm9wZXJ0aWVzICsgXCIgRXh0ZW5kZWRfUGljdG9ncmFwaGljXCI7XG4gIHZhciBlY21hMTFCaW5hcnlQcm9wZXJ0aWVzID0gZWNtYTEwQmluYXJ5UHJvcGVydGllcztcbiAgdmFyIGVjbWExMkJpbmFyeVByb3BlcnRpZXMgPSBlY21hMTFCaW5hcnlQcm9wZXJ0aWVzICsgXCIgRUJhc2UgRUNvbXAgRU1vZCBFUHJlcyBFeHRQaWN0XCI7XG4gIHZhciBlY21hMTNCaW5hcnlQcm9wZXJ0aWVzID0gZWNtYTEyQmluYXJ5UHJvcGVydGllcztcbiAgdmFyIGVjbWExNEJpbmFyeVByb3BlcnRpZXMgPSBlY21hMTNCaW5hcnlQcm9wZXJ0aWVzO1xuXG4gIHZhciB1bmljb2RlQmluYXJ5UHJvcGVydGllcyA9IHtcbiAgICA5OiBlY21hOUJpbmFyeVByb3BlcnRpZXMsXG4gICAgMTA6IGVjbWExMEJpbmFyeVByb3BlcnRpZXMsXG4gICAgMTE6IGVjbWExMUJpbmFyeVByb3BlcnRpZXMsXG4gICAgMTI6IGVjbWExMkJpbmFyeVByb3BlcnRpZXMsXG4gICAgMTM6IGVjbWExM0JpbmFyeVByb3BlcnRpZXMsXG4gICAgMTQ6IGVjbWExNEJpbmFyeVByb3BlcnRpZXNcbiAgfTtcblxuICAvLyAjdGFibGUtYmluYXJ5LXVuaWNvZGUtcHJvcGVydGllcy1vZi1zdHJpbmdzXG4gIHZhciBlY21hMTRCaW5hcnlQcm9wZXJ0aWVzT2ZTdHJpbmdzID0gXCJCYXNpY19FbW9qaSBFbW9qaV9LZXljYXBfU2VxdWVuY2UgUkdJX0Vtb2ppX01vZGlmaWVyX1NlcXVlbmNlIFJHSV9FbW9qaV9GbGFnX1NlcXVlbmNlIFJHSV9FbW9qaV9UYWdfU2VxdWVuY2UgUkdJX0Vtb2ppX1pXSl9TZXF1ZW5jZSBSR0lfRW1vamlcIjtcblxuICB2YXIgdW5pY29kZUJpbmFyeVByb3BlcnRpZXNPZlN0cmluZ3MgPSB7XG4gICAgOTogXCJcIixcbiAgICAxMDogXCJcIixcbiAgICAxMTogXCJcIixcbiAgICAxMjogXCJcIixcbiAgICAxMzogXCJcIixcbiAgICAxNDogZWNtYTE0QmluYXJ5UHJvcGVydGllc09mU3RyaW5nc1xuICB9O1xuXG4gIC8vICN0YWJsZS11bmljb2RlLWdlbmVyYWwtY2F0ZWdvcnktdmFsdWVzXG4gIHZhciB1bmljb2RlR2VuZXJhbENhdGVnb3J5VmFsdWVzID0gXCJDYXNlZF9MZXR0ZXIgTEMgQ2xvc2VfUHVuY3R1YXRpb24gUGUgQ29ubmVjdG9yX1B1bmN0dWF0aW9uIFBjIENvbnRyb2wgQ2MgY250cmwgQ3VycmVuY3lfU3ltYm9sIFNjIERhc2hfUHVuY3R1YXRpb24gUGQgRGVjaW1hbF9OdW1iZXIgTmQgZGlnaXQgRW5jbG9zaW5nX01hcmsgTWUgRmluYWxfUHVuY3R1YXRpb24gUGYgRm9ybWF0IENmIEluaXRpYWxfUHVuY3R1YXRpb24gUGkgTGV0dGVyIEwgTGV0dGVyX051bWJlciBObCBMaW5lX1NlcGFyYXRvciBabCBMb3dlcmNhc2VfTGV0dGVyIExsIE1hcmsgTSBDb21iaW5pbmdfTWFyayBNYXRoX1N5bWJvbCBTbSBNb2RpZmllcl9MZXR0ZXIgTG0gTW9kaWZpZXJfU3ltYm9sIFNrIE5vbnNwYWNpbmdfTWFyayBNbiBOdW1iZXIgTiBPcGVuX1B1bmN0dWF0aW9uIFBzIE90aGVyIEMgT3RoZXJfTGV0dGVyIExvIE90aGVyX051bWJlciBObyBPdGhlcl9QdW5jdHVhdGlvbiBQbyBPdGhlcl9TeW1ib2wgU28gUGFyYWdyYXBoX1NlcGFyYXRvciBacCBQcml2YXRlX1VzZSBDbyBQdW5jdHVhdGlvbiBQIHB1bmN0IFNlcGFyYXRvciBaIFNwYWNlX1NlcGFyYXRvciBacyBTcGFjaW5nX01hcmsgTWMgU3Vycm9nYXRlIENzIFN5bWJvbCBTIFRpdGxlY2FzZV9MZXR0ZXIgTHQgVW5hc3NpZ25lZCBDbiBVcHBlcmNhc2VfTGV0dGVyIEx1XCI7XG5cbiAgLy8gI3RhYmxlLXVuaWNvZGUtc2NyaXB0LXZhbHVlc1xuICB2YXIgZWNtYTlTY3JpcHRWYWx1ZXMgPSBcIkFkbGFtIEFkbG0gQWhvbSBBbmF0b2xpYW5fSGllcm9nbHlwaHMgSGx1dyBBcmFiaWMgQXJhYiBBcm1lbmlhbiBBcm1uIEF2ZXN0YW4gQXZzdCBCYWxpbmVzZSBCYWxpIEJhbXVtIEJhbXUgQmFzc2FfVmFoIEJhc3MgQmF0YWsgQmF0ayBCZW5nYWxpIEJlbmcgQmhhaWtzdWtpIEJoa3MgQm9wb21vZm8gQm9wbyBCcmFobWkgQnJhaCBCcmFpbGxlIEJyYWkgQnVnaW5lc2UgQnVnaSBCdWhpZCBCdWhkIENhbmFkaWFuX0Fib3JpZ2luYWwgQ2FucyBDYXJpYW4gQ2FyaSBDYXVjYXNpYW5fQWxiYW5pYW4gQWdoYiBDaGFrbWEgQ2FrbSBDaGFtIENoYW0gQ2hlcm9rZWUgQ2hlciBDb21tb24gWnl5eSBDb3B0aWMgQ29wdCBRYWFjIEN1bmVpZm9ybSBYc3V4IEN5cHJpb3QgQ3BydCBDeXJpbGxpYyBDeXJsIERlc2VyZXQgRHNydCBEZXZhbmFnYXJpIERldmEgRHVwbG95YW4gRHVwbCBFZ3lwdGlhbl9IaWVyb2dseXBocyBFZ3lwIEVsYmFzYW4gRWxiYSBFdGhpb3BpYyBFdGhpIEdlb3JnaWFuIEdlb3IgR2xhZ29saXRpYyBHbGFnIEdvdGhpYyBHb3RoIEdyYW50aGEgR3JhbiBHcmVlayBHcmVrIEd1amFyYXRpIEd1anIgR3VybXVraGkgR3VydSBIYW4gSGFuaSBIYW5ndWwgSGFuZyBIYW51bm9vIEhhbm8gSGF0cmFuIEhhdHIgSGVicmV3IEhlYnIgSGlyYWdhbmEgSGlyYSBJbXBlcmlhbF9BcmFtYWljIEFybWkgSW5oZXJpdGVkIFppbmggUWFhaSBJbnNjcmlwdGlvbmFsX1BhaGxhdmkgUGhsaSBJbnNjcmlwdGlvbmFsX1BhcnRoaWFuIFBydGkgSmF2YW5lc2UgSmF2YSBLYWl0aGkgS3RoaSBLYW5uYWRhIEtuZGEgS2F0YWthbmEgS2FuYSBLYXlhaF9MaSBLYWxpIEtoYXJvc2h0aGkgS2hhciBLaG1lciBLaG1yIEtob2praSBLaG9qIEtodWRhd2FkaSBTaW5kIExhbyBMYW9vIExhdGluIExhdG4gTGVwY2hhIExlcGMgTGltYnUgTGltYiBMaW5lYXJfQSBMaW5hIExpbmVhcl9CIExpbmIgTGlzdSBMaXN1IEx5Y2lhbiBMeWNpIEx5ZGlhbiBMeWRpIE1haGFqYW5pIE1haGogTWFsYXlhbGFtIE1seW0gTWFuZGFpYyBNYW5kIE1hbmljaGFlYW4gTWFuaSBNYXJjaGVuIE1hcmMgTWFzYXJhbV9Hb25kaSBHb25tIE1lZXRlaV9NYXllayBNdGVpIE1lbmRlX0tpa2FrdWkgTWVuZCBNZXJvaXRpY19DdXJzaXZlIE1lcmMgTWVyb2l0aWNfSGllcm9nbHlwaHMgTWVybyBNaWFvIFBscmQgTW9kaSBNb25nb2xpYW4gTW9uZyBNcm8gTXJvbyBNdWx0YW5pIE11bHQgTXlhbm1hciBNeW1yIE5hYmF0YWVhbiBOYmF0IE5ld19UYWlfTHVlIFRhbHUgTmV3YSBOZXdhIE5rbyBOa29vIE51c2h1IE5zaHUgT2doYW0gT2dhbSBPbF9DaGlraSBPbGNrIE9sZF9IdW5nYXJpYW4gSHVuZyBPbGRfSXRhbGljIEl0YWwgT2xkX05vcnRoX0FyYWJpYW4gTmFyYiBPbGRfUGVybWljIFBlcm0gT2xkX1BlcnNpYW4gWHBlbyBPbGRfU291dGhfQXJhYmlhbiBTYXJiIE9sZF9UdXJraWMgT3JraCBPcml5YSBPcnlhIE9zYWdlIE9zZ2UgT3NtYW55YSBPc21hIFBhaGF3aF9IbW9uZyBIbW5nIFBhbG15cmVuZSBQYWxtIFBhdV9DaW5fSGF1IFBhdWMgUGhhZ3NfUGEgUGhhZyBQaG9lbmljaWFuIFBobnggUHNhbHRlcl9QYWhsYXZpIFBobHAgUmVqYW5nIFJqbmcgUnVuaWMgUnVuciBTYW1hcml0YW4gU2FtciBTYXVyYXNodHJhIFNhdXIgU2hhcmFkYSBTaHJkIFNoYXZpYW4gU2hhdyBTaWRkaGFtIFNpZGQgU2lnbldyaXRpbmcgU2dudyBTaW5oYWxhIFNpbmggU29yYV9Tb21wZW5nIFNvcmEgU295b21ibyBTb3lvIFN1bmRhbmVzZSBTdW5kIFN5bG90aV9OYWdyaSBTeWxvIFN5cmlhYyBTeXJjIFRhZ2Fsb2cgVGdsZyBUYWdiYW53YSBUYWdiIFRhaV9MZSBUYWxlIFRhaV9UaGFtIExhbmEgVGFpX1ZpZXQgVGF2dCBUYWtyaSBUYWtyIFRhbWlsIFRhbWwgVGFuZ3V0IFRhbmcgVGVsdWd1IFRlbHUgVGhhYW5hIFRoYWEgVGhhaSBUaGFpIFRpYmV0YW4gVGlidCBUaWZpbmFnaCBUZm5nIFRpcmh1dGEgVGlyaCBVZ2FyaXRpYyBVZ2FyIFZhaSBWYWlpIFdhcmFuZ19DaXRpIFdhcmEgWWkgWWlpaSBaYW5hYmF6YXJfU3F1YXJlIFphbmJcIjtcbiAgdmFyIGVjbWExMFNjcmlwdFZhbHVlcyA9IGVjbWE5U2NyaXB0VmFsdWVzICsgXCIgRG9ncmEgRG9nciBHdW5qYWxhX0dvbmRpIEdvbmcgSGFuaWZpX1JvaGluZ3lhIFJvaGcgTWFrYXNhciBNYWthIE1lZGVmYWlkcmluIE1lZGYgT2xkX1NvZ2RpYW4gU29nbyBTb2dkaWFuIFNvZ2RcIjtcbiAgdmFyIGVjbWExMVNjcmlwdFZhbHVlcyA9IGVjbWExMFNjcmlwdFZhbHVlcyArIFwiIEVseW1haWMgRWx5bSBOYW5kaW5hZ2FyaSBOYW5kIE55aWFrZW5nX1B1YWNodWVfSG1vbmcgSG1ucCBXYW5jaG8gV2Nob1wiO1xuICB2YXIgZWNtYTEyU2NyaXB0VmFsdWVzID0gZWNtYTExU2NyaXB0VmFsdWVzICsgXCIgQ2hvcmFzbWlhbiBDaHJzIERpYWsgRGl2ZXNfQWt1cnUgS2hpdGFuX1NtYWxsX1NjcmlwdCBLaXRzIFllemkgWWV6aWRpXCI7XG4gIHZhciBlY21hMTNTY3JpcHRWYWx1ZXMgPSBlY21hMTJTY3JpcHRWYWx1ZXMgKyBcIiBDeXByb19NaW5vYW4gQ3BtbiBPbGRfVXlnaHVyIE91Z3IgVGFuZ3NhIFRuc2EgVG90byBWaXRoa3VxaSBWaXRoXCI7XG4gIHZhciBlY21hMTRTY3JpcHRWYWx1ZXMgPSBlY21hMTNTY3JpcHRWYWx1ZXMgKyBcIiBIcmt0IEthdGFrYW5hX09yX0hpcmFnYW5hIEthd2kgTmFnX011bmRhcmkgTmFnbSBVbmtub3duIFp6enpcIjtcblxuICB2YXIgdW5pY29kZVNjcmlwdFZhbHVlcyA9IHtcbiAgICA5OiBlY21hOVNjcmlwdFZhbHVlcyxcbiAgICAxMDogZWNtYTEwU2NyaXB0VmFsdWVzLFxuICAgIDExOiBlY21hMTFTY3JpcHRWYWx1ZXMsXG4gICAgMTI6IGVjbWExMlNjcmlwdFZhbHVlcyxcbiAgICAxMzogZWNtYTEzU2NyaXB0VmFsdWVzLFxuICAgIDE0OiBlY21hMTRTY3JpcHRWYWx1ZXNcbiAgfTtcblxuICB2YXIgZGF0YSA9IHt9O1xuICBmdW5jdGlvbiBidWlsZFVuaWNvZGVEYXRhKGVjbWFWZXJzaW9uKSB7XG4gICAgdmFyIGQgPSBkYXRhW2VjbWFWZXJzaW9uXSA9IHtcbiAgICAgIGJpbmFyeTogd29yZHNSZWdleHAodW5pY29kZUJpbmFyeVByb3BlcnRpZXNbZWNtYVZlcnNpb25dICsgXCIgXCIgKyB1bmljb2RlR2VuZXJhbENhdGVnb3J5VmFsdWVzKSxcbiAgICAgIGJpbmFyeU9mU3RyaW5nczogd29yZHNSZWdleHAodW5pY29kZUJpbmFyeVByb3BlcnRpZXNPZlN0cmluZ3NbZWNtYVZlcnNpb25dKSxcbiAgICAgIG5vbkJpbmFyeToge1xuICAgICAgICBHZW5lcmFsX0NhdGVnb3J5OiB3b3Jkc1JlZ2V4cCh1bmljb2RlR2VuZXJhbENhdGVnb3J5VmFsdWVzKSxcbiAgICAgICAgU2NyaXB0OiB3b3Jkc1JlZ2V4cCh1bmljb2RlU2NyaXB0VmFsdWVzW2VjbWFWZXJzaW9uXSlcbiAgICAgIH1cbiAgICB9O1xuICAgIGQubm9uQmluYXJ5LlNjcmlwdF9FeHRlbnNpb25zID0gZC5ub25CaW5hcnkuU2NyaXB0O1xuXG4gICAgZC5ub25CaW5hcnkuZ2MgPSBkLm5vbkJpbmFyeS5HZW5lcmFsX0NhdGVnb3J5O1xuICAgIGQubm9uQmluYXJ5LnNjID0gZC5ub25CaW5hcnkuU2NyaXB0O1xuICAgIGQubm9uQmluYXJ5LnNjeCA9IGQubm9uQmluYXJ5LlNjcmlwdF9FeHRlbnNpb25zO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxpc3QgPSBbOSwgMTAsIDExLCAxMiwgMTMsIDE0XTsgaSA8IGxpc3QubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB2YXIgZWNtYVZlcnNpb24gPSBsaXN0W2ldO1xuXG4gICAgYnVpbGRVbmljb2RlRGF0YShlY21hVmVyc2lvbik7XG4gIH1cblxuICB2YXIgcHAkMSA9IFBhcnNlci5wcm90b3R5cGU7XG5cbiAgdmFyIFJlZ0V4cFZhbGlkYXRpb25TdGF0ZSA9IGZ1bmN0aW9uIFJlZ0V4cFZhbGlkYXRpb25TdGF0ZShwYXJzZXIpIHtcbiAgICB0aGlzLnBhcnNlciA9IHBhcnNlcjtcbiAgICB0aGlzLnZhbGlkRmxhZ3MgPSBcImdpbVwiICsgKHBhcnNlci5vcHRpb25zLmVjbWFWZXJzaW9uID49IDYgPyBcInV5XCIgOiBcIlwiKSArIChwYXJzZXIub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA5ID8gXCJzXCIgOiBcIlwiKSArIChwYXJzZXIub3B0aW9ucy5lY21hVmVyc2lvbiA+PSAxMyA/IFwiZFwiIDogXCJcIikgKyAocGFyc2VyLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gMTUgPyBcInZcIiA6IFwiXCIpO1xuICAgIHRoaXMudW5pY29kZVByb3BlcnRpZXMgPSBkYXRhW3BhcnNlci5vcHRpb25zLmVjbWFWZXJzaW9uID49IDE0ID8gMTQgOiBwYXJzZXIub3B0aW9ucy5lY21hVmVyc2lvbl07XG4gICAgdGhpcy5zb3VyY2UgPSBcIlwiO1xuICAgIHRoaXMuZmxhZ3MgPSBcIlwiO1xuICAgIHRoaXMuc3RhcnQgPSAwO1xuICAgIHRoaXMuc3dpdGNoVSA9IGZhbHNlO1xuICAgIHRoaXMuc3dpdGNoViA9IGZhbHNlO1xuICAgIHRoaXMuc3dpdGNoTiA9IGZhbHNlO1xuICAgIHRoaXMucG9zID0gMDtcbiAgICB0aGlzLmxhc3RJbnRWYWx1ZSA9IDA7XG4gICAgdGhpcy5sYXN0U3RyaW5nVmFsdWUgPSBcIlwiO1xuICAgIHRoaXMubGFzdEFzc2VydGlvbklzUXVhbnRpZmlhYmxlID0gZmFsc2U7XG4gICAgdGhpcy5udW1DYXB0dXJpbmdQYXJlbnMgPSAwO1xuICAgIHRoaXMubWF4QmFja1JlZmVyZW5jZSA9IDA7XG4gICAgdGhpcy5ncm91cE5hbWVzID0gW107XG4gICAgdGhpcy5iYWNrUmVmZXJlbmNlTmFtZXMgPSBbXTtcbiAgfTtcblxuICBSZWdFeHBWYWxpZGF0aW9uU3RhdGUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQgKHN0YXJ0LCBwYXR0ZXJuLCBmbGFncykge1xuICAgIHZhciB1bmljb2RlU2V0cyA9IGZsYWdzLmluZGV4T2YoXCJ2XCIpICE9PSAtMTtcbiAgICB2YXIgdW5pY29kZSA9IGZsYWdzLmluZGV4T2YoXCJ1XCIpICE9PSAtMTtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQgfCAwO1xuICAgIHRoaXMuc291cmNlID0gcGF0dGVybiArIFwiXCI7XG4gICAgdGhpcy5mbGFncyA9IGZsYWdzO1xuICAgIGlmICh1bmljb2RlU2V0cyAmJiB0aGlzLnBhcnNlci5vcHRpb25zLmVjbWFWZXJzaW9uID49IDE1KSB7XG4gICAgICB0aGlzLnN3aXRjaFUgPSB0cnVlO1xuICAgICAgdGhpcy5zd2l0Y2hWID0gdHJ1ZTtcbiAgICAgIHRoaXMuc3dpdGNoTiA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3dpdGNoVSA9IHVuaWNvZGUgJiYgdGhpcy5wYXJzZXIub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2O1xuICAgICAgdGhpcy5zd2l0Y2hWID0gZmFsc2U7XG4gICAgICB0aGlzLnN3aXRjaE4gPSB1bmljb2RlICYmIHRoaXMucGFyc2VyLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOTtcbiAgICB9XG4gIH07XG5cbiAgUmVnRXhwVmFsaWRhdGlvblN0YXRlLnByb3RvdHlwZS5yYWlzZSA9IGZ1bmN0aW9uIHJhaXNlIChtZXNzYWdlKSB7XG4gICAgdGhpcy5wYXJzZXIucmFpc2VSZWNvdmVyYWJsZSh0aGlzLnN0YXJ0LCAoXCJJbnZhbGlkIHJlZ3VsYXIgZXhwcmVzc2lvbjogL1wiICsgKHRoaXMuc291cmNlKSArIFwiLzogXCIgKyBtZXNzYWdlKSk7XG4gIH07XG5cbiAgLy8gSWYgdSBmbGFnIGlzIGdpdmVuLCB0aGlzIHJldHVybnMgdGhlIGNvZGUgcG9pbnQgYXQgdGhlIGluZGV4IChpdCBjb21iaW5lcyBhIHN1cnJvZ2F0ZSBwYWlyKS5cbiAgLy8gT3RoZXJ3aXNlLCB0aGlzIHJldHVybnMgdGhlIGNvZGUgdW5pdCBvZiB0aGUgaW5kZXggKGNhbiBiZSBhIHBhcnQgb2YgYSBzdXJyb2dhdGUgcGFpcikuXG4gIFJlZ0V4cFZhbGlkYXRpb25TdGF0ZS5wcm90b3R5cGUuYXQgPSBmdW5jdGlvbiBhdCAoaSwgZm9yY2VVKSB7XG4gICAgICBpZiAoIGZvcmNlVSA9PT0gdm9pZCAwICkgZm9yY2VVID0gZmFsc2U7XG5cbiAgICB2YXIgcyA9IHRoaXMuc291cmNlO1xuICAgIHZhciBsID0gcy5sZW5ndGg7XG4gICAgaWYgKGkgPj0gbCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIHZhciBjID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIGlmICghKGZvcmNlVSB8fCB0aGlzLnN3aXRjaFUpIHx8IGMgPD0gMHhEN0ZGIHx8IGMgPj0gMHhFMDAwIHx8IGkgKyAxID49IGwpIHtcbiAgICAgIHJldHVybiBjXG4gICAgfVxuICAgIHZhciBuZXh0ID0gcy5jaGFyQ29kZUF0KGkgKyAxKTtcbiAgICByZXR1cm4gbmV4dCA+PSAweERDMDAgJiYgbmV4dCA8PSAweERGRkYgPyAoYyA8PCAxMCkgKyBuZXh0IC0gMHgzNUZEQzAwIDogY1xuICB9O1xuXG4gIFJlZ0V4cFZhbGlkYXRpb25TdGF0ZS5wcm90b3R5cGUubmV4dEluZGV4ID0gZnVuY3Rpb24gbmV4dEluZGV4IChpLCBmb3JjZVUpIHtcbiAgICAgIGlmICggZm9yY2VVID09PSB2b2lkIDAgKSBmb3JjZVUgPSBmYWxzZTtcblxuICAgIHZhciBzID0gdGhpcy5zb3VyY2U7XG4gICAgdmFyIGwgPSBzLmxlbmd0aDtcbiAgICBpZiAoaSA+PSBsKSB7XG4gICAgICByZXR1cm4gbFxuICAgIH1cbiAgICB2YXIgYyA9IHMuY2hhckNvZGVBdChpKSwgbmV4dDtcbiAgICBpZiAoIShmb3JjZVUgfHwgdGhpcy5zd2l0Y2hVKSB8fCBjIDw9IDB4RDdGRiB8fCBjID49IDB4RTAwMCB8fCBpICsgMSA+PSBsIHx8XG4gICAgICAgIChuZXh0ID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweERDMDAgfHwgbmV4dCA+IDB4REZGRikge1xuICAgICAgcmV0dXJuIGkgKyAxXG4gICAgfVxuICAgIHJldHVybiBpICsgMlxuICB9O1xuXG4gIFJlZ0V4cFZhbGlkYXRpb25TdGF0ZS5wcm90b3R5cGUuY3VycmVudCA9IGZ1bmN0aW9uIGN1cnJlbnQgKGZvcmNlVSkge1xuICAgICAgaWYgKCBmb3JjZVUgPT09IHZvaWQgMCApIGZvcmNlVSA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIHRoaXMuYXQodGhpcy5wb3MsIGZvcmNlVSlcbiAgfTtcblxuICBSZWdFeHBWYWxpZGF0aW9uU3RhdGUucHJvdG90eXBlLmxvb2thaGVhZCA9IGZ1bmN0aW9uIGxvb2thaGVhZCAoZm9yY2VVKSB7XG4gICAgICBpZiAoIGZvcmNlVSA9PT0gdm9pZCAwICkgZm9yY2VVID0gZmFsc2U7XG5cbiAgICByZXR1cm4gdGhpcy5hdCh0aGlzLm5leHRJbmRleCh0aGlzLnBvcywgZm9yY2VVKSwgZm9yY2VVKVxuICB9O1xuXG4gIFJlZ0V4cFZhbGlkYXRpb25TdGF0ZS5wcm90b3R5cGUuYWR2YW5jZSA9IGZ1bmN0aW9uIGFkdmFuY2UgKGZvcmNlVSkge1xuICAgICAgaWYgKCBmb3JjZVUgPT09IHZvaWQgMCApIGZvcmNlVSA9IGZhbHNlO1xuXG4gICAgdGhpcy5wb3MgPSB0aGlzLm5leHRJbmRleCh0aGlzLnBvcywgZm9yY2VVKTtcbiAgfTtcblxuICBSZWdFeHBWYWxpZGF0aW9uU3RhdGUucHJvdG90eXBlLmVhdCA9IGZ1bmN0aW9uIGVhdCAoY2gsIGZvcmNlVSkge1xuICAgICAgaWYgKCBmb3JjZVUgPT09IHZvaWQgMCApIGZvcmNlVSA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuY3VycmVudChmb3JjZVUpID09PSBjaCkge1xuICAgICAgdGhpcy5hZHZhbmNlKGZvcmNlVSk7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICBSZWdFeHBWYWxpZGF0aW9uU3RhdGUucHJvdG90eXBlLmVhdENoYXJzID0gZnVuY3Rpb24gZWF0Q2hhcnMgKGNocywgZm9yY2VVKSB7XG4gICAgICBpZiAoIGZvcmNlVSA9PT0gdm9pZCAwICkgZm9yY2VVID0gZmFsc2U7XG5cbiAgICB2YXIgcG9zID0gdGhpcy5wb3M7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxpc3QgPSBjaHM7IGkgPCBsaXN0Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB2YXIgY2ggPSBsaXN0W2ldO1xuXG4gICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5hdChwb3MsIGZvcmNlVSk7XG4gICAgICBpZiAoY3VycmVudCA9PT0gLTEgfHwgY3VycmVudCAhPT0gY2gpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBwb3MgPSB0aGlzLm5leHRJbmRleChwb3MsIGZvcmNlVSk7XG4gICAgfVxuICAgIHRoaXMucG9zID0gcG9zO1xuICAgIHJldHVybiB0cnVlXG4gIH07XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHRoZSBmbGFncyBwYXJ0IG9mIGEgZ2l2ZW4gUmVnRXhwTGl0ZXJhbC5cbiAgICpcbiAgICogQHBhcmFtIHtSZWdFeHBWYWxpZGF0aW9uU3RhdGV9IHN0YXRlIFRoZSBzdGF0ZSB0byB2YWxpZGF0ZSBSZWdFeHAuXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgcHAkMS52YWxpZGF0ZVJlZ0V4cEZsYWdzID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgdmFsaWRGbGFncyA9IHN0YXRlLnZhbGlkRmxhZ3M7XG4gICAgdmFyIGZsYWdzID0gc3RhdGUuZmxhZ3M7XG5cbiAgICB2YXIgdSA9IGZhbHNlO1xuICAgIHZhciB2ID0gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZsYWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZmxhZyA9IGZsYWdzLmNoYXJBdChpKTtcbiAgICAgIGlmICh2YWxpZEZsYWdzLmluZGV4T2YoZmxhZykgPT09IC0xKSB7XG4gICAgICAgIHRoaXMucmFpc2Uoc3RhdGUuc3RhcnQsIFwiSW52YWxpZCByZWd1bGFyIGV4cHJlc3Npb24gZmxhZ1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChmbGFncy5pbmRleE9mKGZsYWcsIGkgKyAxKSA+IC0xKSB7XG4gICAgICAgIHRoaXMucmFpc2Uoc3RhdGUuc3RhcnQsIFwiRHVwbGljYXRlIHJlZ3VsYXIgZXhwcmVzc2lvbiBmbGFnXCIpO1xuICAgICAgfVxuICAgICAgaWYgKGZsYWcgPT09IFwidVwiKSB7IHUgPSB0cnVlOyB9XG4gICAgICBpZiAoZmxhZyA9PT0gXCJ2XCIpIHsgdiA9IHRydWU7IH1cbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSAxNSAmJiB1ICYmIHYpIHtcbiAgICAgIHRoaXMucmFpc2Uoc3RhdGUuc3RhcnQsIFwiSW52YWxpZCByZWd1bGFyIGV4cHJlc3Npb24gZmxhZ1wiKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHRoZSBwYXR0ZXJuIHBhcnQgb2YgYSBnaXZlbiBSZWdFeHBMaXRlcmFsLlxuICAgKlxuICAgKiBAcGFyYW0ge1JlZ0V4cFZhbGlkYXRpb25TdGF0ZX0gc3RhdGUgVGhlIHN0YXRlIHRvIHZhbGlkYXRlIFJlZ0V4cC5cbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBwcCQxLnZhbGlkYXRlUmVnRXhwUGF0dGVybiA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdGhpcy5yZWdleHBfcGF0dGVybihzdGF0ZSk7XG5cbiAgICAvLyBUaGUgZ29hbCBzeW1ib2wgZm9yIHRoZSBwYXJzZSBpcyB8UGF0dGVyblt+VSwgfk5dfC4gSWYgdGhlIHJlc3VsdCBvZlxuICAgIC8vIHBhcnNpbmcgY29udGFpbnMgYSB8R3JvdXBOYW1lfCwgcmVwYXJzZSB3aXRoIHRoZSBnb2FsIHN5bWJvbFxuICAgIC8vIHxQYXR0ZXJuW35VLCArTl18IGFuZCB1c2UgdGhpcyByZXN1bHQgaW5zdGVhZC4gVGhyb3cgYSAqU3ludGF4RXJyb3IqXG4gICAgLy8gZXhjZXB0aW9uIGlmIF9QXyBkaWQgbm90IGNvbmZvcm0gdG8gdGhlIGdyYW1tYXIsIGlmIGFueSBlbGVtZW50cyBvZiBfUF9cbiAgICAvLyB3ZXJlIG5vdCBtYXRjaGVkIGJ5IHRoZSBwYXJzZSwgb3IgaWYgYW55IEVhcmx5IEVycm9yIGNvbmRpdGlvbnMgZXhpc3QuXG4gICAgaWYgKCFzdGF0ZS5zd2l0Y2hOICYmIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA5ICYmIHN0YXRlLmdyb3VwTmFtZXMubGVuZ3RoID4gMCkge1xuICAgICAgc3RhdGUuc3dpdGNoTiA9IHRydWU7XG4gICAgICB0aGlzLnJlZ2V4cF9wYXR0ZXJuKHN0YXRlKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtUGF0dGVyblxuICBwcCQxLnJlZ2V4cF9wYXR0ZXJuID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBzdGF0ZS5wb3MgPSAwO1xuICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IDA7XG4gICAgc3RhdGUubGFzdFN0cmluZ1ZhbHVlID0gXCJcIjtcbiAgICBzdGF0ZS5sYXN0QXNzZXJ0aW9uSXNRdWFudGlmaWFibGUgPSBmYWxzZTtcbiAgICBzdGF0ZS5udW1DYXB0dXJpbmdQYXJlbnMgPSAwO1xuICAgIHN0YXRlLm1heEJhY2tSZWZlcmVuY2UgPSAwO1xuICAgIHN0YXRlLmdyb3VwTmFtZXMubGVuZ3RoID0gMDtcbiAgICBzdGF0ZS5iYWNrUmVmZXJlbmNlTmFtZXMubGVuZ3RoID0gMDtcblxuICAgIHRoaXMucmVnZXhwX2Rpc2p1bmN0aW9uKHN0YXRlKTtcblxuICAgIGlmIChzdGF0ZS5wb3MgIT09IHN0YXRlLnNvdXJjZS5sZW5ndGgpIHtcbiAgICAgIC8vIE1ha2UgdGhlIHNhbWUgbWVzc2FnZXMgYXMgVjguXG4gICAgICBpZiAoc3RhdGUuZWF0KDB4MjkgLyogKSAqLykpIHtcbiAgICAgICAgc3RhdGUucmFpc2UoXCJVbm1hdGNoZWQgJyknXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXRlLmVhdCgweDVEIC8qIF0gKi8pIHx8IHN0YXRlLmVhdCgweDdEIC8qIH0gKi8pKSB7XG4gICAgICAgIHN0YXRlLnJhaXNlKFwiTG9uZSBxdWFudGlmaWVyIGJyYWNrZXRzXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc3RhdGUubWF4QmFja1JlZmVyZW5jZSA+IHN0YXRlLm51bUNhcHR1cmluZ1BhcmVucykge1xuICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIGVzY2FwZVwiKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGxpc3QgPSBzdGF0ZS5iYWNrUmVmZXJlbmNlTmFtZXM7IGkgPCBsaXN0Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB2YXIgbmFtZSA9IGxpc3RbaV07XG5cbiAgICAgIGlmIChzdGF0ZS5ncm91cE5hbWVzLmluZGV4T2YobmFtZSkgPT09IC0xKSB7XG4gICAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBuYW1lZCBjYXB0dXJlIHJlZmVyZW5jZWRcIik7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLURpc2p1bmN0aW9uXG4gIHBwJDEucmVnZXhwX2Rpc2p1bmN0aW9uID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB0aGlzLnJlZ2V4cF9hbHRlcm5hdGl2ZShzdGF0ZSk7XG4gICAgd2hpbGUgKHN0YXRlLmVhdCgweDdDIC8qIHwgKi8pKSB7XG4gICAgICB0aGlzLnJlZ2V4cF9hbHRlcm5hdGl2ZShzdGF0ZSk7XG4gICAgfVxuXG4gICAgLy8gTWFrZSB0aGUgc2FtZSBtZXNzYWdlIGFzIFY4LlxuICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRRdWFudGlmaWVyKHN0YXRlLCB0cnVlKSkge1xuICAgICAgc3RhdGUucmFpc2UoXCJOb3RoaW5nIHRvIHJlcGVhdFwiKTtcbiAgICB9XG4gICAgaWYgKHN0YXRlLmVhdCgweDdCIC8qIHsgKi8pKSB7XG4gICAgICBzdGF0ZS5yYWlzZShcIkxvbmUgcXVhbnRpZmllciBicmFja2V0c1wiKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtQWx0ZXJuYXRpdmVcbiAgcHAkMS5yZWdleHBfYWx0ZXJuYXRpdmUgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHdoaWxlIChzdGF0ZS5wb3MgPCBzdGF0ZS5zb3VyY2UubGVuZ3RoICYmIHRoaXMucmVnZXhwX2VhdFRlcm0oc3RhdGUpKVxuICAgICAgeyB9XG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtYW5uZXhCLVRlcm1cbiAgcHAkMS5yZWdleHBfZWF0VGVybSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgaWYgKHRoaXMucmVnZXhwX2VhdEFzc2VydGlvbihzdGF0ZSkpIHtcbiAgICAgIC8vIEhhbmRsZSBgUXVhbnRpZmlhYmxlQXNzZXJ0aW9uIFF1YW50aWZpZXJgIGFsdGVybmF0aXZlLlxuICAgICAgLy8gYHN0YXRlLmxhc3RBc3NlcnRpb25Jc1F1YW50aWZpYWJsZWAgaXMgdHJ1ZSBpZiB0aGUgbGFzdCBlYXRlbiBBc3NlcnRpb25cbiAgICAgIC8vIGlzIGEgUXVhbnRpZmlhYmxlQXNzZXJ0aW9uLlxuICAgICAgaWYgKHN0YXRlLmxhc3RBc3NlcnRpb25Jc1F1YW50aWZpYWJsZSAmJiB0aGlzLnJlZ2V4cF9lYXRRdWFudGlmaWVyKHN0YXRlKSkge1xuICAgICAgICAvLyBNYWtlIHRoZSBzYW1lIG1lc3NhZ2UgYXMgVjguXG4gICAgICAgIGlmIChzdGF0ZS5zd2l0Y2hVKSB7XG4gICAgICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIHF1YW50aWZpZXJcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLnN3aXRjaFUgPyB0aGlzLnJlZ2V4cF9lYXRBdG9tKHN0YXRlKSA6IHRoaXMucmVnZXhwX2VhdEV4dGVuZGVkQXRvbShzdGF0ZSkpIHtcbiAgICAgIHRoaXMucmVnZXhwX2VhdFF1YW50aWZpZXIoc3RhdGUpO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1hbm5leEItQXNzZXJ0aW9uXG4gIHBwJDEucmVnZXhwX2VhdEFzc2VydGlvbiA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIHN0YXJ0ID0gc3RhdGUucG9zO1xuICAgIHN0YXRlLmxhc3RBc3NlcnRpb25Jc1F1YW50aWZpYWJsZSA9IGZhbHNlO1xuXG4gICAgLy8gXiwgJFxuICAgIGlmIChzdGF0ZS5lYXQoMHg1RSAvKiBeICovKSB8fCBzdGF0ZS5lYXQoMHgyNCAvKiAkICovKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICAvLyBcXGIgXFxCXG4gICAgaWYgKHN0YXRlLmVhdCgweDVDIC8qIFxcICovKSkge1xuICAgICAgaWYgKHN0YXRlLmVhdCgweDQyIC8qIEIgKi8pIHx8IHN0YXRlLmVhdCgweDYyIC8qIGIgKi8pKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICB9XG5cbiAgICAvLyBMb29rYWhlYWQgLyBMb29rYmVoaW5kXG4gICAgaWYgKHN0YXRlLmVhdCgweDI4IC8qICggKi8pICYmIHN0YXRlLmVhdCgweDNGIC8qID8gKi8pKSB7XG4gICAgICB2YXIgbG9va2JlaGluZCA9IGZhbHNlO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA5KSB7XG4gICAgICAgIGxvb2tiZWhpbmQgPSBzdGF0ZS5lYXQoMHgzQyAvKiA8ICovKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS5lYXQoMHgzRCAvKiA9ICovKSB8fCBzdGF0ZS5lYXQoMHgyMSAvKiAhICovKSkge1xuICAgICAgICB0aGlzLnJlZ2V4cF9kaXNqdW5jdGlvbihzdGF0ZSk7XG4gICAgICAgIGlmICghc3RhdGUuZWF0KDB4MjkgLyogKSAqLykpIHtcbiAgICAgICAgICBzdGF0ZS5yYWlzZShcIlVudGVybWluYXRlZCBncm91cFwiKTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5sYXN0QXNzZXJ0aW9uSXNRdWFudGlmaWFibGUgPSAhbG9va2JlaGluZDtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1RdWFudGlmaWVyXG4gIHBwJDEucmVnZXhwX2VhdFF1YW50aWZpZXIgPSBmdW5jdGlvbihzdGF0ZSwgbm9FcnJvcikge1xuICAgIGlmICggbm9FcnJvciA9PT0gdm9pZCAwICkgbm9FcnJvciA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMucmVnZXhwX2VhdFF1YW50aWZpZXJQcmVmaXgoc3RhdGUsIG5vRXJyb3IpKSB7XG4gICAgICBzdGF0ZS5lYXQoMHgzRiAvKiA/ICovKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLVF1YW50aWZpZXJQcmVmaXhcbiAgcHAkMS5yZWdleHBfZWF0UXVhbnRpZmllclByZWZpeCA9IGZ1bmN0aW9uKHN0YXRlLCBub0Vycm9yKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHN0YXRlLmVhdCgweDJBIC8qICogKi8pIHx8XG4gICAgICBzdGF0ZS5lYXQoMHgyQiAvKiArICovKSB8fFxuICAgICAgc3RhdGUuZWF0KDB4M0YgLyogPyAqLykgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdEJyYWNlZFF1YW50aWZpZXIoc3RhdGUsIG5vRXJyb3IpXG4gICAgKVxuICB9O1xuICBwcCQxLnJlZ2V4cF9lYXRCcmFjZWRRdWFudGlmaWVyID0gZnVuY3Rpb24oc3RhdGUsIG5vRXJyb3IpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgaWYgKHN0YXRlLmVhdCgweDdCIC8qIHsgKi8pKSB7XG4gICAgICB2YXIgbWluID0gMCwgbWF4ID0gLTE7XG4gICAgICBpZiAodGhpcy5yZWdleHBfZWF0RGVjaW1hbERpZ2l0cyhzdGF0ZSkpIHtcbiAgICAgICAgbWluID0gc3RhdGUubGFzdEludFZhbHVlO1xuICAgICAgICBpZiAoc3RhdGUuZWF0KDB4MkMgLyogLCAqLykgJiYgdGhpcy5yZWdleHBfZWF0RGVjaW1hbERpZ2l0cyhzdGF0ZSkpIHtcbiAgICAgICAgICBtYXggPSBzdGF0ZS5sYXN0SW50VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRlLmVhdCgweDdEIC8qIH0gKi8pKSB7XG4gICAgICAgICAgLy8gU3ludGF4RXJyb3IgaW4gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3NlYy10ZXJtXG4gICAgICAgICAgaWYgKG1heCAhPT0gLTEgJiYgbWF4IDwgbWluICYmICFub0Vycm9yKSB7XG4gICAgICAgICAgICBzdGF0ZS5yYWlzZShcIm51bWJlcnMgb3V0IG9mIG9yZGVyIGluIHt9IHF1YW50aWZpZXJcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS5zd2l0Y2hVICYmICFub0Vycm9yKSB7XG4gICAgICAgIHN0YXRlLnJhaXNlKFwiSW5jb21wbGV0ZSBxdWFudGlmaWVyXCIpO1xuICAgICAgfVxuICAgICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLUF0b21cbiAgcHAkMS5yZWdleHBfZWF0QXRvbSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMucmVnZXhwX2VhdFBhdHRlcm5DaGFyYWN0ZXJzKHN0YXRlKSB8fFxuICAgICAgc3RhdGUuZWF0KDB4MkUgLyogLiAqLykgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdFJldmVyc2VTb2xpZHVzQXRvbUVzY2FwZShzdGF0ZSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdENoYXJhY3RlckNsYXNzKHN0YXRlKSB8fFxuICAgICAgdGhpcy5yZWdleHBfZWF0VW5jYXB0dXJpbmdHcm91cChzdGF0ZSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdENhcHR1cmluZ0dyb3VwKHN0YXRlKVxuICAgIClcbiAgfTtcbiAgcHAkMS5yZWdleHBfZWF0UmV2ZXJzZVNvbGlkdXNBdG9tRXNjYXBlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgaWYgKHN0YXRlLmVhdCgweDVDIC8qIFxcICovKSkge1xuICAgICAgaWYgKHRoaXMucmVnZXhwX2VhdEF0b21Fc2NhcGUoc3RhdGUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG4gIHBwJDEucmVnZXhwX2VhdFVuY2FwdHVyaW5nR3JvdXAgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcbiAgICBpZiAoc3RhdGUuZWF0KDB4MjggLyogKCAqLykpIHtcbiAgICAgIGlmIChzdGF0ZS5lYXQoMHgzRiAvKiA/ICovKSAmJiBzdGF0ZS5lYXQoMHgzQSAvKiA6ICovKSkge1xuICAgICAgICB0aGlzLnJlZ2V4cF9kaXNqdW5jdGlvbihzdGF0ZSk7XG4gICAgICAgIGlmIChzdGF0ZS5lYXQoMHgyOSAvKiApICovKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUucmFpc2UoXCJVbnRlcm1pbmF0ZWQgZ3JvdXBcIik7XG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG4gIHBwJDEucmVnZXhwX2VhdENhcHR1cmluZ0dyb3VwID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuZWF0KDB4MjggLyogKCAqLykpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gOSkge1xuICAgICAgICB0aGlzLnJlZ2V4cF9ncm91cFNwZWNpZmllcihzdGF0ZSk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXRlLmN1cnJlbnQoKSA9PT0gMHgzRiAvKiA/ICovKSB7XG4gICAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBncm91cFwiKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVnZXhwX2Rpc2p1bmN0aW9uKHN0YXRlKTtcbiAgICAgIGlmIChzdGF0ZS5lYXQoMHgyOSAvKiApICovKSkge1xuICAgICAgICBzdGF0ZS5udW1DYXB0dXJpbmdQYXJlbnMgKz0gMTtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIHN0YXRlLnJhaXNlKFwiVW50ZXJtaW5hdGVkIGdyb3VwXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1hbm5leEItRXh0ZW5kZWRBdG9tXG4gIHBwJDEucmVnZXhwX2VhdEV4dGVuZGVkQXRvbSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHN0YXRlLmVhdCgweDJFIC8qIC4gKi8pIHx8XG4gICAgICB0aGlzLnJlZ2V4cF9lYXRSZXZlcnNlU29saWR1c0F0b21Fc2NhcGUoc3RhdGUpIHx8XG4gICAgICB0aGlzLnJlZ2V4cF9lYXRDaGFyYWN0ZXJDbGFzcyhzdGF0ZSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdFVuY2FwdHVyaW5nR3JvdXAoc3RhdGUpIHx8XG4gICAgICB0aGlzLnJlZ2V4cF9lYXRDYXB0dXJpbmdHcm91cChzdGF0ZSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdEludmFsaWRCcmFjZWRRdWFudGlmaWVyKHN0YXRlKSB8fFxuICAgICAgdGhpcy5yZWdleHBfZWF0RXh0ZW5kZWRQYXR0ZXJuQ2hhcmFjdGVyKHN0YXRlKVxuICAgIClcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1hbm5leEItSW52YWxpZEJyYWNlZFF1YW50aWZpZXJcbiAgcHAkMS5yZWdleHBfZWF0SW52YWxpZEJyYWNlZFF1YW50aWZpZXIgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRCcmFjZWRRdWFudGlmaWVyKHN0YXRlLCB0cnVlKSkge1xuICAgICAgc3RhdGUucmFpc2UoXCJOb3RoaW5nIHRvIHJlcGVhdFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtU3ludGF4Q2hhcmFjdGVyXG4gIHBwJDEucmVnZXhwX2VhdFN5bnRheENoYXJhY3RlciA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RhdGUuY3VycmVudCgpO1xuICAgIGlmIChpc1N5bnRheENoYXJhY3RlcihjaCkpIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IGNoO1xuICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG4gIGZ1bmN0aW9uIGlzU3ludGF4Q2hhcmFjdGVyKGNoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGNoID09PSAweDI0IC8qICQgKi8gfHxcbiAgICAgIGNoID49IDB4MjggLyogKCAqLyAmJiBjaCA8PSAweDJCIC8qICsgKi8gfHxcbiAgICAgIGNoID09PSAweDJFIC8qIC4gKi8gfHxcbiAgICAgIGNoID09PSAweDNGIC8qID8gKi8gfHxcbiAgICAgIGNoID49IDB4NUIgLyogWyAqLyAmJiBjaCA8PSAweDVFIC8qIF4gKi8gfHxcbiAgICAgIGNoID49IDB4N0IgLyogeyAqLyAmJiBjaCA8PSAweDdEIC8qIH0gKi9cbiAgICApXG4gIH1cblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1QYXR0ZXJuQ2hhcmFjdGVyXG4gIC8vIEJ1dCBlYXQgZWFnZXIuXG4gIHBwJDEucmVnZXhwX2VhdFBhdHRlcm5DaGFyYWN0ZXJzID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgdmFyIGNoID0gMDtcbiAgICB3aGlsZSAoKGNoID0gc3RhdGUuY3VycmVudCgpKSAhPT0gLTEgJiYgIWlzU3ludGF4Q2hhcmFjdGVyKGNoKSkge1xuICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGUucG9zICE9PSBzdGFydFxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLWFubmV4Qi1FeHRlbmRlZFBhdHRlcm5DaGFyYWN0ZXJcbiAgcHAkMS5yZWdleHBfZWF0RXh0ZW5kZWRQYXR0ZXJuQ2hhcmFjdGVyID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgY2ggPSBzdGF0ZS5jdXJyZW50KCk7XG4gICAgaWYgKFxuICAgICAgY2ggIT09IC0xICYmXG4gICAgICBjaCAhPT0gMHgyNCAvKiAkICovICYmXG4gICAgICAhKGNoID49IDB4MjggLyogKCAqLyAmJiBjaCA8PSAweDJCIC8qICsgKi8pICYmXG4gICAgICBjaCAhPT0gMHgyRSAvKiAuICovICYmXG4gICAgICBjaCAhPT0gMHgzRiAvKiA/ICovICYmXG4gICAgICBjaCAhPT0gMHg1QiAvKiBbICovICYmXG4gICAgICBjaCAhPT0gMHg1RSAvKiBeICovICYmXG4gICAgICBjaCAhPT0gMHg3QyAvKiB8ICovXG4gICAgKSB7XG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBHcm91cFNwZWNpZmllciA6OlxuICAvLyAgIFtlbXB0eV1cbiAgLy8gICBgP2AgR3JvdXBOYW1lXG4gIHBwJDEucmVnZXhwX2dyb3VwU3BlY2lmaWVyID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuZWF0KDB4M0YgLyogPyAqLykpIHtcbiAgICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRHcm91cE5hbWUoc3RhdGUpKSB7XG4gICAgICAgIGlmIChzdGF0ZS5ncm91cE5hbWVzLmluZGV4T2Yoc3RhdGUubGFzdFN0cmluZ1ZhbHVlKSAhPT0gLTEpIHtcbiAgICAgICAgICBzdGF0ZS5yYWlzZShcIkR1cGxpY2F0ZSBjYXB0dXJlIGdyb3VwIG5hbWVcIik7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUuZ3JvdXBOYW1lcy5wdXNoKHN0YXRlLmxhc3RTdHJpbmdWYWx1ZSk7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIGdyb3VwXCIpO1xuICAgIH1cbiAgfTtcblxuICAvLyBHcm91cE5hbWUgOjpcbiAgLy8gICBgPGAgUmVnRXhwSWRlbnRpZmllck5hbWUgYD5gXG4gIC8vIE5vdGU6IHRoaXMgdXBkYXRlcyBgc3RhdGUubGFzdFN0cmluZ1ZhbHVlYCBwcm9wZXJ0eSB3aXRoIHRoZSBlYXRlbiBuYW1lLlxuICBwcCQxLnJlZ2V4cF9lYXRHcm91cE5hbWUgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHN0YXRlLmxhc3RTdHJpbmdWYWx1ZSA9IFwiXCI7XG4gICAgaWYgKHN0YXRlLmVhdCgweDNDIC8qIDwgKi8pKSB7XG4gICAgICBpZiAodGhpcy5yZWdleHBfZWF0UmVnRXhwSWRlbnRpZmllck5hbWUoc3RhdGUpICYmIHN0YXRlLmVhdCgweDNFIC8qID4gKi8pKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBzdGF0ZS5yYWlzZShcIkludmFsaWQgY2FwdHVyZSBncm91cCBuYW1lXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBSZWdFeHBJZGVudGlmaWVyTmFtZSA6OlxuICAvLyAgIFJlZ0V4cElkZW50aWZpZXJTdGFydFxuICAvLyAgIFJlZ0V4cElkZW50aWZpZXJOYW1lIFJlZ0V4cElkZW50aWZpZXJQYXJ0XG4gIC8vIE5vdGU6IHRoaXMgdXBkYXRlcyBgc3RhdGUubGFzdFN0cmluZ1ZhbHVlYCBwcm9wZXJ0eSB3aXRoIHRoZSBlYXRlbiBuYW1lLlxuICBwcCQxLnJlZ2V4cF9lYXRSZWdFeHBJZGVudGlmaWVyTmFtZSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgc3RhdGUubGFzdFN0cmluZ1ZhbHVlID0gXCJcIjtcbiAgICBpZiAodGhpcy5yZWdleHBfZWF0UmVnRXhwSWRlbnRpZmllclN0YXJ0KHN0YXRlKSkge1xuICAgICAgc3RhdGUubGFzdFN0cmluZ1ZhbHVlICs9IGNvZGVQb2ludFRvU3RyaW5nKHN0YXRlLmxhc3RJbnRWYWx1ZSk7XG4gICAgICB3aGlsZSAodGhpcy5yZWdleHBfZWF0UmVnRXhwSWRlbnRpZmllclBhcnQoc3RhdGUpKSB7XG4gICAgICAgIHN0YXRlLmxhc3RTdHJpbmdWYWx1ZSArPSBjb2RlUG9pbnRUb1N0cmluZyhzdGF0ZS5sYXN0SW50VmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gUmVnRXhwSWRlbnRpZmllclN0YXJ0IDo6XG4gIC8vICAgVW5pY29kZUlEU3RhcnRcbiAgLy8gICBgJGBcbiAgLy8gICBgX2BcbiAgLy8gICBgXFxgIFJlZ0V4cFVuaWNvZGVFc2NhcGVTZXF1ZW5jZVsrVV1cbiAgcHAkMS5yZWdleHBfZWF0UmVnRXhwSWRlbnRpZmllclN0YXJ0ID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgdmFyIGZvcmNlVSA9IHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSAxMTtcbiAgICB2YXIgY2ggPSBzdGF0ZS5jdXJyZW50KGZvcmNlVSk7XG4gICAgc3RhdGUuYWR2YW5jZShmb3JjZVUpO1xuXG4gICAgaWYgKGNoID09PSAweDVDIC8qIFxcICovICYmIHRoaXMucmVnZXhwX2VhdFJlZ0V4cFVuaWNvZGVFc2NhcGVTZXF1ZW5jZShzdGF0ZSwgZm9yY2VVKSkge1xuICAgICAgY2ggPSBzdGF0ZS5sYXN0SW50VmFsdWU7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cElkZW50aWZpZXJTdGFydChjaCkpIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IGNoO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcbiAgZnVuY3Rpb24gaXNSZWdFeHBJZGVudGlmaWVyU3RhcnQoY2gpIHtcbiAgICByZXR1cm4gaXNJZGVudGlmaWVyU3RhcnQoY2gsIHRydWUpIHx8IGNoID09PSAweDI0IC8qICQgKi8gfHwgY2ggPT09IDB4NUYgLyogXyAqL1xuICB9XG5cbiAgLy8gUmVnRXhwSWRlbnRpZmllclBhcnQgOjpcbiAgLy8gICBVbmljb2RlSURDb250aW51ZVxuICAvLyAgIGAkYFxuICAvLyAgIGBfYFxuICAvLyAgIGBcXGAgUmVnRXhwVW5pY29kZUVzY2FwZVNlcXVlbmNlWytVXVxuICAvLyAgIDxaV05KPlxuICAvLyAgIDxaV0o+XG4gIHBwJDEucmVnZXhwX2VhdFJlZ0V4cElkZW50aWZpZXJQYXJ0ID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgdmFyIGZvcmNlVSA9IHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSAxMTtcbiAgICB2YXIgY2ggPSBzdGF0ZS5jdXJyZW50KGZvcmNlVSk7XG4gICAgc3RhdGUuYWR2YW5jZShmb3JjZVUpO1xuXG4gICAgaWYgKGNoID09PSAweDVDIC8qIFxcICovICYmIHRoaXMucmVnZXhwX2VhdFJlZ0V4cFVuaWNvZGVFc2NhcGVTZXF1ZW5jZShzdGF0ZSwgZm9yY2VVKSkge1xuICAgICAgY2ggPSBzdGF0ZS5sYXN0SW50VmFsdWU7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cElkZW50aWZpZXJQYXJ0KGNoKSkge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gY2g7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIHN0YXRlLnBvcyA9IHN0YXJ0O1xuICAgIHJldHVybiBmYWxzZVxuICB9O1xuICBmdW5jdGlvbiBpc1JlZ0V4cElkZW50aWZpZXJQYXJ0KGNoKSB7XG4gICAgcmV0dXJuIGlzSWRlbnRpZmllckNoYXIoY2gsIHRydWUpIHx8IGNoID09PSAweDI0IC8qICQgKi8gfHwgY2ggPT09IDB4NUYgLyogXyAqLyB8fCBjaCA9PT0gMHgyMDBDIC8qIDxaV05KPiAqLyB8fCBjaCA9PT0gMHgyMDBEIC8qIDxaV0o+ICovXG4gIH1cblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1hbm5leEItQXRvbUVzY2FwZVxuICBwcCQxLnJlZ2V4cF9lYXRBdG9tRXNjYXBlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLnJlZ2V4cF9lYXRCYWNrUmVmZXJlbmNlKHN0YXRlKSB8fFxuICAgICAgdGhpcy5yZWdleHBfZWF0Q2hhcmFjdGVyQ2xhc3NFc2NhcGUoc3RhdGUpIHx8XG4gICAgICB0aGlzLnJlZ2V4cF9lYXRDaGFyYWN0ZXJFc2NhcGUoc3RhdGUpIHx8XG4gICAgICAoc3RhdGUuc3dpdGNoTiAmJiB0aGlzLnJlZ2V4cF9lYXRLR3JvdXBOYW1lKHN0YXRlKSlcbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIGlmIChzdGF0ZS5zd2l0Y2hVKSB7XG4gICAgICAvLyBNYWtlIHRoZSBzYW1lIG1lc3NhZ2UgYXMgVjguXG4gICAgICBpZiAoc3RhdGUuY3VycmVudCgpID09PSAweDYzIC8qIGMgKi8pIHtcbiAgICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIHVuaWNvZGUgZXNjYXBlXCIpO1xuICAgICAgfVxuICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIGVzY2FwZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG4gIHBwJDEucmVnZXhwX2VhdEJhY2tSZWZlcmVuY2UgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcbiAgICBpZiAodGhpcy5yZWdleHBfZWF0RGVjaW1hbEVzY2FwZShzdGF0ZSkpIHtcbiAgICAgIHZhciBuID0gc3RhdGUubGFzdEludFZhbHVlO1xuICAgICAgaWYgKHN0YXRlLnN3aXRjaFUpIHtcbiAgICAgICAgLy8gRm9yIFN5bnRheEVycm9yIGluIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNzZWMtYXRvbWVzY2FwZVxuICAgICAgICBpZiAobiA+IHN0YXRlLm1heEJhY2tSZWZlcmVuY2UpIHtcbiAgICAgICAgICBzdGF0ZS5tYXhCYWNrUmVmZXJlbmNlID0gbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKG4gPD0gc3RhdGUubnVtQ2FwdHVyaW5nUGFyZW5zKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG4gIHBwJDEucmVnZXhwX2VhdEtHcm91cE5hbWUgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5lYXQoMHg2QiAvKiBrICovKSkge1xuICAgICAgaWYgKHRoaXMucmVnZXhwX2VhdEdyb3VwTmFtZShzdGF0ZSkpIHtcbiAgICAgICAgc3RhdGUuYmFja1JlZmVyZW5jZU5hbWVzLnB1c2goc3RhdGUubGFzdFN0cmluZ1ZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBuYW1lZCByZWZlcmVuY2VcIik7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLWFubmV4Qi1DaGFyYWN0ZXJFc2NhcGVcbiAgcHAkMS5yZWdleHBfZWF0Q2hhcmFjdGVyRXNjYXBlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5yZWdleHBfZWF0Q29udHJvbEVzY2FwZShzdGF0ZSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdENDb250cm9sTGV0dGVyKHN0YXRlKSB8fFxuICAgICAgdGhpcy5yZWdleHBfZWF0WmVybyhzdGF0ZSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdEhleEVzY2FwZVNlcXVlbmNlKHN0YXRlKSB8fFxuICAgICAgdGhpcy5yZWdleHBfZWF0UmVnRXhwVW5pY29kZUVzY2FwZVNlcXVlbmNlKHN0YXRlLCBmYWxzZSkgfHxcbiAgICAgICghc3RhdGUuc3dpdGNoVSAmJiB0aGlzLnJlZ2V4cF9lYXRMZWdhY3lPY3RhbEVzY2FwZVNlcXVlbmNlKHN0YXRlKSkgfHxcbiAgICAgIHRoaXMucmVnZXhwX2VhdElkZW50aXR5RXNjYXBlKHN0YXRlKVxuICAgIClcbiAgfTtcbiAgcHAkMS5yZWdleHBfZWF0Q0NvbnRyb2xMZXR0ZXIgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcbiAgICBpZiAoc3RhdGUuZWF0KDB4NjMgLyogYyAqLykpIHtcbiAgICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRDb250cm9sTGV0dGVyKHN0YXRlKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuICBwcCQxLnJlZ2V4cF9lYXRaZXJvID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuY3VycmVudCgpID09PSAweDMwIC8qIDAgKi8gJiYgIWlzRGVjaW1hbERpZ2l0KHN0YXRlLmxvb2thaGVhZCgpKSkge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gMDtcbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLUNvbnRyb2xFc2NhcGVcbiAgcHAkMS5yZWdleHBfZWF0Q29udHJvbEVzY2FwZSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RhdGUuY3VycmVudCgpO1xuICAgIGlmIChjaCA9PT0gMHg3NCAvKiB0ICovKSB7XG4gICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAweDA5OyAvKiBcXHQgKi9cbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIGlmIChjaCA9PT0gMHg2RSAvKiBuICovKSB7XG4gICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAweDBBOyAvKiBcXG4gKi9cbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIGlmIChjaCA9PT0gMHg3NiAvKiB2ICovKSB7XG4gICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAweDBCOyAvKiBcXHYgKi9cbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIGlmIChjaCA9PT0gMHg2NiAvKiBmICovKSB7XG4gICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAweDBDOyAvKiBcXGYgKi9cbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIGlmIChjaCA9PT0gMHg3MiAvKiByICovKSB7XG4gICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAweDBEOyAvKiBcXHIgKi9cbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLUNvbnRyb2xMZXR0ZXJcbiAgcHAkMS5yZWdleHBfZWF0Q29udHJvbExldHRlciA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RhdGUuY3VycmVudCgpO1xuICAgIGlmIChpc0NvbnRyb2xMZXR0ZXIoY2gpKSB7XG4gICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSBjaCAlIDB4MjA7XG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcbiAgZnVuY3Rpb24gaXNDb250cm9sTGV0dGVyKGNoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIChjaCA+PSAweDQxIC8qIEEgKi8gJiYgY2ggPD0gMHg1QSAvKiBaICovKSB8fFxuICAgICAgKGNoID49IDB4NjEgLyogYSAqLyAmJiBjaCA8PSAweDdBIC8qIHogKi8pXG4gICAgKVxuICB9XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtUmVnRXhwVW5pY29kZUVzY2FwZVNlcXVlbmNlXG4gIHBwJDEucmVnZXhwX2VhdFJlZ0V4cFVuaWNvZGVFc2NhcGVTZXF1ZW5jZSA9IGZ1bmN0aW9uKHN0YXRlLCBmb3JjZVUpIHtcbiAgICBpZiAoIGZvcmNlVSA9PT0gdm9pZCAwICkgZm9yY2VVID0gZmFsc2U7XG5cbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgdmFyIHN3aXRjaFUgPSBmb3JjZVUgfHwgc3RhdGUuc3dpdGNoVTtcblxuICAgIGlmIChzdGF0ZS5lYXQoMHg3NSAvKiB1ICovKSkge1xuICAgICAgaWYgKHRoaXMucmVnZXhwX2VhdEZpeGVkSGV4RGlnaXRzKHN0YXRlLCA0KSkge1xuICAgICAgICB2YXIgbGVhZCA9IHN0YXRlLmxhc3RJbnRWYWx1ZTtcbiAgICAgICAgaWYgKHN3aXRjaFUgJiYgbGVhZCA+PSAweEQ4MDAgJiYgbGVhZCA8PSAweERCRkYpIHtcbiAgICAgICAgICB2YXIgbGVhZFN1cnJvZ2F0ZUVuZCA9IHN0YXRlLnBvcztcbiAgICAgICAgICBpZiAoc3RhdGUuZWF0KDB4NUMgLyogXFwgKi8pICYmIHN0YXRlLmVhdCgweDc1IC8qIHUgKi8pICYmIHRoaXMucmVnZXhwX2VhdEZpeGVkSGV4RGlnaXRzKHN0YXRlLCA0KSkge1xuICAgICAgICAgICAgdmFyIHRyYWlsID0gc3RhdGUubGFzdEludFZhbHVlO1xuICAgICAgICAgICAgaWYgKHRyYWlsID49IDB4REMwMCAmJiB0cmFpbCA8PSAweERGRkYpIHtcbiAgICAgICAgICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gKGxlYWQgLSAweEQ4MDApICogMHg0MDAgKyAodHJhaWwgLSAweERDMDApICsgMHgxMDAwMDtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgc3RhdGUucG9zID0gbGVhZFN1cnJvZ2F0ZUVuZDtcbiAgICAgICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSBsZWFkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIHN3aXRjaFUgJiZcbiAgICAgICAgc3RhdGUuZWF0KDB4N0IgLyogeyAqLykgJiZcbiAgICAgICAgdGhpcy5yZWdleHBfZWF0SGV4RGlnaXRzKHN0YXRlKSAmJlxuICAgICAgICBzdGF0ZS5lYXQoMHg3RCAvKiB9ICovKSAmJlxuICAgICAgICBpc1ZhbGlkVW5pY29kZShzdGF0ZS5sYXN0SW50VmFsdWUpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIGlmIChzd2l0Y2hVKSB7XG4gICAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCB1bmljb2RlIGVzY2FwZVwiKTtcbiAgICAgIH1cbiAgICAgIHN0YXRlLnBvcyA9IHN0YXJ0O1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9O1xuICBmdW5jdGlvbiBpc1ZhbGlkVW5pY29kZShjaCkge1xuICAgIHJldHVybiBjaCA+PSAwICYmIGNoIDw9IDB4MTBGRkZGXG4gIH1cblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1hbm5leEItSWRlbnRpdHlFc2NhcGVcbiAgcHAkMS5yZWdleHBfZWF0SWRlbnRpdHlFc2NhcGUgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5zd2l0Y2hVKSB7XG4gICAgICBpZiAodGhpcy5yZWdleHBfZWF0U3ludGF4Q2hhcmFjdGVyKHN0YXRlKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKHN0YXRlLmVhdCgweDJGIC8qIC8gKi8pKSB7XG4gICAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IDB4MkY7IC8qIC8gKi9cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHZhciBjaCA9IHN0YXRlLmN1cnJlbnQoKTtcbiAgICBpZiAoY2ggIT09IDB4NjMgLyogYyAqLyAmJiAoIXN0YXRlLnN3aXRjaE4gfHwgY2ggIT09IDB4NkIgLyogayAqLykpIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IGNoO1xuICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1EZWNpbWFsRXNjYXBlXG4gIHBwJDEucmVnZXhwX2VhdERlY2ltYWxFc2NhcGUgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IDA7XG4gICAgdmFyIGNoID0gc3RhdGUuY3VycmVudCgpO1xuICAgIGlmIChjaCA+PSAweDMxIC8qIDEgKi8gJiYgY2ggPD0gMHgzOSAvKiA5ICovKSB7XG4gICAgICBkbyB7XG4gICAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IDEwICogc3RhdGUubGFzdEludFZhbHVlICsgKGNoIC0gMHgzMCAvKiAwICovKTtcbiAgICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgICAgfSB3aGlsZSAoKGNoID0gc3RhdGUuY3VycmVudCgpKSA+PSAweDMwIC8qIDAgKi8gJiYgY2ggPD0gMHgzOSAvKiA5ICovKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gUmV0dXJuIHZhbHVlcyB1c2VkIGJ5IGNoYXJhY3RlciBzZXQgcGFyc2luZyBtZXRob2RzLCBuZWVkZWQgdG9cbiAgLy8gZm9yYmlkIG5lZ2F0aW9uIG9mIHNldHMgdGhhdCBjYW4gbWF0Y2ggc3RyaW5ncy5cbiAgdmFyIENoYXJTZXROb25lID0gMDsgLy8gTm90aGluZyBwYXJzZWRcbiAgdmFyIENoYXJTZXRPayA9IDE7IC8vIENvbnN0cnVjdCBwYXJzZWQsIGNhbm5vdCBjb250YWluIHN0cmluZ3NcbiAgdmFyIENoYXJTZXRTdHJpbmcgPSAyOyAvLyBDb25zdHJ1Y3QgcGFyc2VkLCBjYW4gY29udGFpbiBzdHJpbmdzXG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtQ2hhcmFjdGVyQ2xhc3NFc2NhcGVcbiAgcHAkMS5yZWdleHBfZWF0Q2hhcmFjdGVyQ2xhc3NFc2NhcGUgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBjaCA9IHN0YXRlLmN1cnJlbnQoKTtcblxuICAgIGlmIChpc0NoYXJhY3RlckNsYXNzRXNjYXBlKGNoKSkge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gLTE7XG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gQ2hhclNldE9rXG4gICAgfVxuXG4gICAgdmFyIG5lZ2F0ZSA9IGZhbHNlO1xuICAgIGlmIChcbiAgICAgIHN0YXRlLnN3aXRjaFUgJiZcbiAgICAgIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA5ICYmXG4gICAgICAoKG5lZ2F0ZSA9IGNoID09PSAweDUwIC8qIFAgKi8pIHx8IGNoID09PSAweDcwIC8qIHAgKi8pXG4gICAgKSB7XG4gICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAtMTtcbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICAgIHZhciByZXN1bHQ7XG4gICAgICBpZiAoXG4gICAgICAgIHN0YXRlLmVhdCgweDdCIC8qIHsgKi8pICYmXG4gICAgICAgIChyZXN1bHQgPSB0aGlzLnJlZ2V4cF9lYXRVbmljb2RlUHJvcGVydHlWYWx1ZUV4cHJlc3Npb24oc3RhdGUpKSAmJlxuICAgICAgICBzdGF0ZS5lYXQoMHg3RCAvKiB9ICovKVxuICAgICAgKSB7XG4gICAgICAgIGlmIChuZWdhdGUgJiYgcmVzdWx0ID09PSBDaGFyU2V0U3RyaW5nKSB7IHN0YXRlLnJhaXNlKFwiSW52YWxpZCBwcm9wZXJ0eSBuYW1lXCIpOyB9XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgIH1cbiAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBwcm9wZXJ0eSBuYW1lXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBDaGFyU2V0Tm9uZVxuICB9O1xuXG4gIGZ1bmN0aW9uIGlzQ2hhcmFjdGVyQ2xhc3NFc2NhcGUoY2gpIHtcbiAgICByZXR1cm4gKFxuICAgICAgY2ggPT09IDB4NjQgLyogZCAqLyB8fFxuICAgICAgY2ggPT09IDB4NDQgLyogRCAqLyB8fFxuICAgICAgY2ggPT09IDB4NzMgLyogcyAqLyB8fFxuICAgICAgY2ggPT09IDB4NTMgLyogUyAqLyB8fFxuICAgICAgY2ggPT09IDB4NzcgLyogdyAqLyB8fFxuICAgICAgY2ggPT09IDB4NTcgLyogVyAqL1xuICAgIClcbiAgfVxuXG4gIC8vIFVuaWNvZGVQcm9wZXJ0eVZhbHVlRXhwcmVzc2lvbiA6OlxuICAvLyAgIFVuaWNvZGVQcm9wZXJ0eU5hbWUgYD1gIFVuaWNvZGVQcm9wZXJ0eVZhbHVlXG4gIC8vICAgTG9uZVVuaWNvZGVQcm9wZXJ0eU5hbWVPclZhbHVlXG4gIHBwJDEucmVnZXhwX2VhdFVuaWNvZGVQcm9wZXJ0eVZhbHVlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIHN0YXJ0ID0gc3RhdGUucG9zO1xuXG4gICAgLy8gVW5pY29kZVByb3BlcnR5TmFtZSBgPWAgVW5pY29kZVByb3BlcnR5VmFsdWVcbiAgICBpZiAodGhpcy5yZWdleHBfZWF0VW5pY29kZVByb3BlcnR5TmFtZShzdGF0ZSkgJiYgc3RhdGUuZWF0KDB4M0QgLyogPSAqLykpIHtcbiAgICAgIHZhciBuYW1lID0gc3RhdGUubGFzdFN0cmluZ1ZhbHVlO1xuICAgICAgaWYgKHRoaXMucmVnZXhwX2VhdFVuaWNvZGVQcm9wZXJ0eVZhbHVlKHN0YXRlKSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBzdGF0ZS5sYXN0U3RyaW5nVmFsdWU7XG4gICAgICAgIHRoaXMucmVnZXhwX3ZhbGlkYXRlVW5pY29kZVByb3BlcnR5TmFtZUFuZFZhbHVlKHN0YXRlLCBuYW1lLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiBDaGFyU2V0T2tcbiAgICAgIH1cbiAgICB9XG4gICAgc3RhdGUucG9zID0gc3RhcnQ7XG5cbiAgICAvLyBMb25lVW5pY29kZVByb3BlcnR5TmFtZU9yVmFsdWVcbiAgICBpZiAodGhpcy5yZWdleHBfZWF0TG9uZVVuaWNvZGVQcm9wZXJ0eU5hbWVPclZhbHVlKHN0YXRlKSkge1xuICAgICAgdmFyIG5hbWVPclZhbHVlID0gc3RhdGUubGFzdFN0cmluZ1ZhbHVlO1xuICAgICAgcmV0dXJuIHRoaXMucmVnZXhwX3ZhbGlkYXRlVW5pY29kZVByb3BlcnR5TmFtZU9yVmFsdWUoc3RhdGUsIG5hbWVPclZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gQ2hhclNldE5vbmVcbiAgfTtcblxuICBwcCQxLnJlZ2V4cF92YWxpZGF0ZVVuaWNvZGVQcm9wZXJ0eU5hbWVBbmRWYWx1ZSA9IGZ1bmN0aW9uKHN0YXRlLCBuYW1lLCB2YWx1ZSkge1xuICAgIGlmICghaGFzT3duKHN0YXRlLnVuaWNvZGVQcm9wZXJ0aWVzLm5vbkJpbmFyeSwgbmFtZSkpXG4gICAgICB7IHN0YXRlLnJhaXNlKFwiSW52YWxpZCBwcm9wZXJ0eSBuYW1lXCIpOyB9XG4gICAgaWYgKCFzdGF0ZS51bmljb2RlUHJvcGVydGllcy5ub25CaW5hcnlbbmFtZV0udGVzdCh2YWx1ZSkpXG4gICAgICB7IHN0YXRlLnJhaXNlKFwiSW52YWxpZCBwcm9wZXJ0eSB2YWx1ZVwiKTsgfVxuICB9O1xuXG4gIHBwJDEucmVnZXhwX3ZhbGlkYXRlVW5pY29kZVByb3BlcnR5TmFtZU9yVmFsdWUgPSBmdW5jdGlvbihzdGF0ZSwgbmFtZU9yVmFsdWUpIHtcbiAgICBpZiAoc3RhdGUudW5pY29kZVByb3BlcnRpZXMuYmluYXJ5LnRlc3QobmFtZU9yVmFsdWUpKSB7IHJldHVybiBDaGFyU2V0T2sgfVxuICAgIGlmIChzdGF0ZS5zd2l0Y2hWICYmIHN0YXRlLnVuaWNvZGVQcm9wZXJ0aWVzLmJpbmFyeU9mU3RyaW5ncy50ZXN0KG5hbWVPclZhbHVlKSkgeyByZXR1cm4gQ2hhclNldFN0cmluZyB9XG4gICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIHByb3BlcnR5IG5hbWVcIik7XG4gIH07XG5cbiAgLy8gVW5pY29kZVByb3BlcnR5TmFtZSA6OlxuICAvLyAgIFVuaWNvZGVQcm9wZXJ0eU5hbWVDaGFyYWN0ZXJzXG4gIHBwJDEucmVnZXhwX2VhdFVuaWNvZGVQcm9wZXJ0eU5hbWUgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBjaCA9IDA7XG4gICAgc3RhdGUubGFzdFN0cmluZ1ZhbHVlID0gXCJcIjtcbiAgICB3aGlsZSAoaXNVbmljb2RlUHJvcGVydHlOYW1lQ2hhcmFjdGVyKGNoID0gc3RhdGUuY3VycmVudCgpKSkge1xuICAgICAgc3RhdGUubGFzdFN0cmluZ1ZhbHVlICs9IGNvZGVQb2ludFRvU3RyaW5nKGNoKTtcbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlLmxhc3RTdHJpbmdWYWx1ZSAhPT0gXCJcIlxuICB9O1xuXG4gIGZ1bmN0aW9uIGlzVW5pY29kZVByb3BlcnR5TmFtZUNoYXJhY3RlcihjaCkge1xuICAgIHJldHVybiBpc0NvbnRyb2xMZXR0ZXIoY2gpIHx8IGNoID09PSAweDVGIC8qIF8gKi9cbiAgfVxuXG4gIC8vIFVuaWNvZGVQcm9wZXJ0eVZhbHVlIDo6XG4gIC8vICAgVW5pY29kZVByb3BlcnR5VmFsdWVDaGFyYWN0ZXJzXG4gIHBwJDEucmVnZXhwX2VhdFVuaWNvZGVQcm9wZXJ0eVZhbHVlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgY2ggPSAwO1xuICAgIHN0YXRlLmxhc3RTdHJpbmdWYWx1ZSA9IFwiXCI7XG4gICAgd2hpbGUgKGlzVW5pY29kZVByb3BlcnR5VmFsdWVDaGFyYWN0ZXIoY2ggPSBzdGF0ZS5jdXJyZW50KCkpKSB7XG4gICAgICBzdGF0ZS5sYXN0U3RyaW5nVmFsdWUgKz0gY29kZVBvaW50VG9TdHJpbmcoY2gpO1xuICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGUubGFzdFN0cmluZ1ZhbHVlICE9PSBcIlwiXG4gIH07XG4gIGZ1bmN0aW9uIGlzVW5pY29kZVByb3BlcnR5VmFsdWVDaGFyYWN0ZXIoY2gpIHtcbiAgICByZXR1cm4gaXNVbmljb2RlUHJvcGVydHlOYW1lQ2hhcmFjdGVyKGNoKSB8fCBpc0RlY2ltYWxEaWdpdChjaClcbiAgfVxuXG4gIC8vIExvbmVVbmljb2RlUHJvcGVydHlOYW1lT3JWYWx1ZSA6OlxuICAvLyAgIFVuaWNvZGVQcm9wZXJ0eVZhbHVlQ2hhcmFjdGVyc1xuICBwcCQxLnJlZ2V4cF9lYXRMb25lVW5pY29kZVByb3BlcnR5TmFtZU9yVmFsdWUgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHJldHVybiB0aGlzLnJlZ2V4cF9lYXRVbmljb2RlUHJvcGVydHlWYWx1ZShzdGF0ZSlcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1DaGFyYWN0ZXJDbGFzc1xuICBwcCQxLnJlZ2V4cF9lYXRDaGFyYWN0ZXJDbGFzcyA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLmVhdCgweDVCIC8qIFsgKi8pKSB7XG4gICAgICB2YXIgbmVnYXRlID0gc3RhdGUuZWF0KDB4NUUgLyogXiAqLyk7XG4gICAgICB2YXIgcmVzdWx0ID0gdGhpcy5yZWdleHBfY2xhc3NDb250ZW50cyhzdGF0ZSk7XG4gICAgICBpZiAoIXN0YXRlLmVhdCgweDVEIC8qIF0gKi8pKVxuICAgICAgICB7IHN0YXRlLnJhaXNlKFwiVW50ZXJtaW5hdGVkIGNoYXJhY3RlciBjbGFzc1wiKTsgfVxuICAgICAgaWYgKG5lZ2F0ZSAmJiByZXN1bHQgPT09IENoYXJTZXRTdHJpbmcpXG4gICAgICAgIHsgc3RhdGUucmFpc2UoXCJOZWdhdGVkIGNoYXJhY3RlciBjbGFzcyBtYXkgY29udGFpbiBzdHJpbmdzXCIpOyB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jcHJvZC1DbGFzc0NvbnRlbnRzXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLUNsYXNzUmFuZ2VzXG4gIHBwJDEucmVnZXhwX2NsYXNzQ29udGVudHMgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5jdXJyZW50KCkgPT09IDB4NUQgLyogXSAqLykgeyByZXR1cm4gQ2hhclNldE9rIH1cbiAgICBpZiAoc3RhdGUuc3dpdGNoVikgeyByZXR1cm4gdGhpcy5yZWdleHBfY2xhc3NTZXRFeHByZXNzaW9uKHN0YXRlKSB9XG4gICAgdGhpcy5yZWdleHBfbm9uRW1wdHlDbGFzc1JhbmdlcyhzdGF0ZSk7XG4gICAgcmV0dXJuIENoYXJTZXRPa1xuICB9O1xuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLU5vbmVtcHR5Q2xhc3NSYW5nZXNcbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtTm9uZW1wdHlDbGFzc1Jhbmdlc05vRGFzaFxuICBwcCQxLnJlZ2V4cF9ub25FbXB0eUNsYXNzUmFuZ2VzID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB3aGlsZSAodGhpcy5yZWdleHBfZWF0Q2xhc3NBdG9tKHN0YXRlKSkge1xuICAgICAgdmFyIGxlZnQgPSBzdGF0ZS5sYXN0SW50VmFsdWU7XG4gICAgICBpZiAoc3RhdGUuZWF0KDB4MkQgLyogLSAqLykgJiYgdGhpcy5yZWdleHBfZWF0Q2xhc3NBdG9tKHN0YXRlKSkge1xuICAgICAgICB2YXIgcmlnaHQgPSBzdGF0ZS5sYXN0SW50VmFsdWU7XG4gICAgICAgIGlmIChzdGF0ZS5zd2l0Y2hVICYmIChsZWZ0ID09PSAtMSB8fCByaWdodCA9PT0gLTEpKSB7XG4gICAgICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIGNoYXJhY3RlciBjbGFzc1wiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVmdCAhPT0gLTEgJiYgcmlnaHQgIT09IC0xICYmIGxlZnQgPiByaWdodCkge1xuICAgICAgICAgIHN0YXRlLnJhaXNlKFwiUmFuZ2Ugb3V0IG9mIG9yZGVyIGluIGNoYXJhY3RlciBjbGFzc1wiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1DbGFzc0F0b21cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtQ2xhc3NBdG9tTm9EYXNoXG4gIHBwJDEucmVnZXhwX2VhdENsYXNzQXRvbSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIHN0YXJ0ID0gc3RhdGUucG9zO1xuXG4gICAgaWYgKHN0YXRlLmVhdCgweDVDIC8qIFxcICovKSkge1xuICAgICAgaWYgKHRoaXMucmVnZXhwX2VhdENsYXNzRXNjYXBlKHN0YXRlKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKHN0YXRlLnN3aXRjaFUpIHtcbiAgICAgICAgLy8gTWFrZSB0aGUgc2FtZSBtZXNzYWdlIGFzIFY4LlxuICAgICAgICB2YXIgY2gkMSA9IHN0YXRlLmN1cnJlbnQoKTtcbiAgICAgICAgaWYgKGNoJDEgPT09IDB4NjMgLyogYyAqLyB8fCBpc09jdGFsRGlnaXQoY2gkMSkpIHtcbiAgICAgICAgICBzdGF0ZS5yYWlzZShcIkludmFsaWQgY2xhc3MgZXNjYXBlXCIpO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBlc2NhcGVcIik7XG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICB9XG5cbiAgICB2YXIgY2ggPSBzdGF0ZS5jdXJyZW50KCk7XG4gICAgaWYgKGNoICE9PSAweDVEIC8qIF0gKi8pIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IGNoO1xuICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1hbm5leEItQ2xhc3NFc2NhcGVcbiAgcHAkMS5yZWdleHBfZWF0Q2xhc3NFc2NhcGUgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcblxuICAgIGlmIChzdGF0ZS5lYXQoMHg2MiAvKiBiICovKSkge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gMHgwODsgLyogPEJTPiAqL1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoc3RhdGUuc3dpdGNoVSAmJiBzdGF0ZS5lYXQoMHgyRCAvKiAtICovKSkge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gMHgyRDsgLyogLSAqL1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoIXN0YXRlLnN3aXRjaFUgJiYgc3RhdGUuZWF0KDB4NjMgLyogYyAqLykpIHtcbiAgICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRDbGFzc0NvbnRyb2xMZXR0ZXIoc3RhdGUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5yZWdleHBfZWF0Q2hhcmFjdGVyQ2xhc3NFc2NhcGUoc3RhdGUpIHx8XG4gICAgICB0aGlzLnJlZ2V4cF9lYXRDaGFyYWN0ZXJFc2NhcGUoc3RhdGUpXG4gICAgKVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLUNsYXNzU2V0RXhwcmVzc2lvblxuICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jcHJvZC1DbGFzc1VuaW9uXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLUNsYXNzSW50ZXJzZWN0aW9uXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLUNsYXNzU3VidHJhY3Rpb25cbiAgcHAkMS5yZWdleHBfY2xhc3NTZXRFeHByZXNzaW9uID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgcmVzdWx0ID0gQ2hhclNldE9rLCBzdWJSZXN1bHQ7XG4gICAgaWYgKHRoaXMucmVnZXhwX2VhdENsYXNzU2V0UmFuZ2Uoc3RhdGUpKSA7IGVsc2UgaWYgKHN1YlJlc3VsdCA9IHRoaXMucmVnZXhwX2VhdENsYXNzU2V0T3BlcmFuZChzdGF0ZSkpIHtcbiAgICAgIGlmIChzdWJSZXN1bHQgPT09IENoYXJTZXRTdHJpbmcpIHsgcmVzdWx0ID0gQ2hhclNldFN0cmluZzsgfVxuICAgICAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtQ2xhc3NJbnRlcnNlY3Rpb25cbiAgICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcbiAgICAgIHdoaWxlIChzdGF0ZS5lYXRDaGFycyhbMHgyNiwgMHgyNl0gLyogJiYgKi8pKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBzdGF0ZS5jdXJyZW50KCkgIT09IDB4MjYgLyogJiAqLyAmJlxuICAgICAgICAgIChzdWJSZXN1bHQgPSB0aGlzLnJlZ2V4cF9lYXRDbGFzc1NldE9wZXJhbmQoc3RhdGUpKVxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAoc3ViUmVzdWx0ICE9PSBDaGFyU2V0U3RyaW5nKSB7IHJlc3VsdCA9IENoYXJTZXRPazsgfVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIGNoYXJhY3RlciBpbiBjaGFyYWN0ZXIgY2xhc3NcIik7XG4gICAgICB9XG4gICAgICBpZiAoc3RhcnQgIT09IHN0YXRlLnBvcykgeyByZXR1cm4gcmVzdWx0IH1cbiAgICAgIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLUNsYXNzU3VidHJhY3Rpb25cbiAgICAgIHdoaWxlIChzdGF0ZS5lYXRDaGFycyhbMHgyRCwgMHgyRF0gLyogLS0gKi8pKSB7XG4gICAgICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRDbGFzc1NldE9wZXJhbmQoc3RhdGUpKSB7IGNvbnRpbnVlIH1cbiAgICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIGNoYXJhY3RlciBpbiBjaGFyYWN0ZXIgY2xhc3NcIik7XG4gICAgICB9XG4gICAgICBpZiAoc3RhcnQgIT09IHN0YXRlLnBvcykgeyByZXR1cm4gcmVzdWx0IH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUucmFpc2UoXCJJbnZhbGlkIGNoYXJhY3RlciBpbiBjaGFyYWN0ZXIgY2xhc3NcIik7XG4gICAgfVxuICAgIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLUNsYXNzVW5pb25cbiAgICBmb3IgKDs7KSB7XG4gICAgICBpZiAodGhpcy5yZWdleHBfZWF0Q2xhc3NTZXRSYW5nZShzdGF0ZSkpIHsgY29udGludWUgfVxuICAgICAgc3ViUmVzdWx0ID0gdGhpcy5yZWdleHBfZWF0Q2xhc3NTZXRPcGVyYW5kKHN0YXRlKTtcbiAgICAgIGlmICghc3ViUmVzdWx0KSB7IHJldHVybiByZXN1bHQgfVxuICAgICAgaWYgKHN1YlJlc3VsdCA9PT0gQ2hhclNldFN0cmluZykgeyByZXN1bHQgPSBDaGFyU2V0U3RyaW5nOyB9XG4gICAgfVxuICB9O1xuXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNwcm9kLUNsYXNzU2V0UmFuZ2VcbiAgcHAkMS5yZWdleHBfZWF0Q2xhc3NTZXRSYW5nZSA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIHN0YXJ0ID0gc3RhdGUucG9zO1xuICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRDbGFzc1NldENoYXJhY3RlcihzdGF0ZSkpIHtcbiAgICAgIHZhciBsZWZ0ID0gc3RhdGUubGFzdEludFZhbHVlO1xuICAgICAgaWYgKHN0YXRlLmVhdCgweDJEIC8qIC0gKi8pICYmIHRoaXMucmVnZXhwX2VhdENsYXNzU2V0Q2hhcmFjdGVyKHN0YXRlKSkge1xuICAgICAgICB2YXIgcmlnaHQgPSBzdGF0ZS5sYXN0SW50VmFsdWU7XG4gICAgICAgIGlmIChsZWZ0ICE9PSAtMSAmJiByaWdodCAhPT0gLTEgJiYgbGVmdCA+IHJpZ2h0KSB7XG4gICAgICAgICAgc3RhdGUucmFpc2UoXCJSYW5nZSBvdXQgb2Ygb3JkZXIgaW4gY2hhcmFjdGVyIGNsYXNzXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtQ2xhc3NTZXRPcGVyYW5kXG4gIHBwJDEucmVnZXhwX2VhdENsYXNzU2V0T3BlcmFuZCA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgaWYgKHRoaXMucmVnZXhwX2VhdENsYXNzU2V0Q2hhcmFjdGVyKHN0YXRlKSkgeyByZXR1cm4gQ2hhclNldE9rIH1cbiAgICByZXR1cm4gdGhpcy5yZWdleHBfZWF0Q2xhc3NTdHJpbmdEaXNqdW5jdGlvbihzdGF0ZSkgfHwgdGhpcy5yZWdleHBfZWF0TmVzdGVkQ2xhc3Moc3RhdGUpXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtTmVzdGVkQ2xhc3NcbiAgcHAkMS5yZWdleHBfZWF0TmVzdGVkQ2xhc3MgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcbiAgICBpZiAoc3RhdGUuZWF0KDB4NUIgLyogWyAqLykpIHtcbiAgICAgIHZhciBuZWdhdGUgPSBzdGF0ZS5lYXQoMHg1RSAvKiBeICovKTtcbiAgICAgIHZhciByZXN1bHQgPSB0aGlzLnJlZ2V4cF9jbGFzc0NvbnRlbnRzKHN0YXRlKTtcbiAgICAgIGlmIChzdGF0ZS5lYXQoMHg1RCAvKiBdICovKSkge1xuICAgICAgICBpZiAobmVnYXRlICYmIHJlc3VsdCA9PT0gQ2hhclNldFN0cmluZykge1xuICAgICAgICAgIHN0YXRlLnJhaXNlKFwiTmVnYXRlZCBjaGFyYWN0ZXIgY2xhc3MgbWF5IGNvbnRhaW4gc3RyaW5nc1wiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICB9XG4gICAgaWYgKHN0YXRlLmVhdCgweDVDIC8qIFxcICovKSkge1xuICAgICAgdmFyIHJlc3VsdCQxID0gdGhpcy5yZWdleHBfZWF0Q2hhcmFjdGVyQ2xhc3NFc2NhcGUoc3RhdGUpO1xuICAgICAgaWYgKHJlc3VsdCQxKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQkMVxuICAgICAgfVxuICAgICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtQ2xhc3NTdHJpbmdEaXNqdW5jdGlvblxuICBwcCQxLnJlZ2V4cF9lYXRDbGFzc1N0cmluZ0Rpc2p1bmN0aW9uID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgaWYgKHN0YXRlLmVhdENoYXJzKFsweDVDLCAweDcxXSAvKiBcXHEgKi8pKSB7XG4gICAgICBpZiAoc3RhdGUuZWF0KDB4N0IgLyogeyAqLykpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMucmVnZXhwX2NsYXNzU3RyaW5nRGlzanVuY3Rpb25Db250ZW50cyhzdGF0ZSk7XG4gICAgICAgIGlmIChzdGF0ZS5lYXQoMHg3RCAvKiB9ICovKSkge1xuICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTWFrZSB0aGUgc2FtZSBtZXNzYWdlIGFzIFY4LlxuICAgICAgICBzdGF0ZS5yYWlzZShcIkludmFsaWQgZXNjYXBlXCIpO1xuICAgICAgfVxuICAgICAgc3RhdGUucG9zID0gc3RhcnQ7XG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtQ2xhc3NTdHJpbmdEaXNqdW5jdGlvbkNvbnRlbnRzXG4gIHBwJDEucmVnZXhwX2NsYXNzU3RyaW5nRGlzanVuY3Rpb25Db250ZW50cyA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMucmVnZXhwX2NsYXNzU3RyaW5nKHN0YXRlKTtcbiAgICB3aGlsZSAoc3RhdGUuZWF0KDB4N0MgLyogfCAqLykpIHtcbiAgICAgIGlmICh0aGlzLnJlZ2V4cF9jbGFzc1N0cmluZyhzdGF0ZSkgPT09IENoYXJTZXRTdHJpbmcpIHsgcmVzdWx0ID0gQ2hhclNldFN0cmluZzsgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH07XG5cbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtQ2xhc3NTdHJpbmdcbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtTm9uRW1wdHlDbGFzc1N0cmluZ1xuICBwcCQxLnJlZ2V4cF9jbGFzc1N0cmluZyA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICB3aGlsZSAodGhpcy5yZWdleHBfZWF0Q2xhc3NTZXRDaGFyYWN0ZXIoc3RhdGUpKSB7IGNvdW50Kys7IH1cbiAgICByZXR1cm4gY291bnQgPT09IDEgPyBDaGFyU2V0T2sgOiBDaGFyU2V0U3RyaW5nXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3Byb2QtQ2xhc3NTZXRDaGFyYWN0ZXJcbiAgcHAkMS5yZWdleHBfZWF0Q2xhc3NTZXRDaGFyYWN0ZXIgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcbiAgICBpZiAoc3RhdGUuZWF0KDB4NUMgLyogXFwgKi8pKSB7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMucmVnZXhwX2VhdENoYXJhY3RlckVzY2FwZShzdGF0ZSkgfHxcbiAgICAgICAgdGhpcy5yZWdleHBfZWF0Q2xhc3NTZXRSZXNlcnZlZFB1bmN0dWF0b3Ioc3RhdGUpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS5lYXQoMHg2MiAvKiBiICovKSkge1xuICAgICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAweDA4OyAvKiA8QlM+ICovXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICB2YXIgY2ggPSBzdGF0ZS5jdXJyZW50KCk7XG4gICAgaWYgKGNoIDwgMCB8fCBjaCA9PT0gc3RhdGUubG9va2FoZWFkKCkgJiYgaXNDbGFzc1NldFJlc2VydmVkRG91YmxlUHVuY3R1YXRvckNoYXJhY3RlcihjaCkpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICBpZiAoaXNDbGFzc1NldFN5bnRheENoYXJhY3RlcihjaCkpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgc3RhdGUubGFzdEludFZhbHVlID0gY2g7XG4gICAgcmV0dXJuIHRydWVcbiAgfTtcblxuICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jcHJvZC1DbGFzc1NldFJlc2VydmVkRG91YmxlUHVuY3R1YXRvclxuICBmdW5jdGlvbiBpc0NsYXNzU2V0UmVzZXJ2ZWREb3VibGVQdW5jdHVhdG9yQ2hhcmFjdGVyKGNoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGNoID09PSAweDIxIC8qICEgKi8gfHxcbiAgICAgIGNoID49IDB4MjMgLyogIyAqLyAmJiBjaCA8PSAweDI2IC8qICYgKi8gfHxcbiAgICAgIGNoID49IDB4MkEgLyogKiAqLyAmJiBjaCA8PSAweDJDIC8qICwgKi8gfHxcbiAgICAgIGNoID09PSAweDJFIC8qIC4gKi8gfHxcbiAgICAgIGNoID49IDB4M0EgLyogOiAqLyAmJiBjaCA8PSAweDQwIC8qIEAgKi8gfHxcbiAgICAgIGNoID09PSAweDVFIC8qIF4gKi8gfHxcbiAgICAgIGNoID09PSAweDYwIC8qIGAgKi8gfHxcbiAgICAgIGNoID09PSAweDdFIC8qIH4gKi9cbiAgICApXG4gIH1cblxuICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jcHJvZC1DbGFzc1NldFN5bnRheENoYXJhY3RlclxuICBmdW5jdGlvbiBpc0NsYXNzU2V0U3ludGF4Q2hhcmFjdGVyKGNoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGNoID09PSAweDI4IC8qICggKi8gfHxcbiAgICAgIGNoID09PSAweDI5IC8qICkgKi8gfHxcbiAgICAgIGNoID09PSAweDJEIC8qIC0gKi8gfHxcbiAgICAgIGNoID09PSAweDJGIC8qIC8gKi8gfHxcbiAgICAgIGNoID49IDB4NUIgLyogWyAqLyAmJiBjaCA8PSAweDVEIC8qIF0gKi8gfHxcbiAgICAgIGNoID49IDB4N0IgLyogeyAqLyAmJiBjaCA8PSAweDdEIC8qIH0gKi9cbiAgICApXG4gIH1cblxuICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jcHJvZC1DbGFzc1NldFJlc2VydmVkUHVuY3R1YXRvclxuICBwcCQxLnJlZ2V4cF9lYXRDbGFzc1NldFJlc2VydmVkUHVuY3R1YXRvciA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RhdGUuY3VycmVudCgpO1xuICAgIGlmIChpc0NsYXNzU2V0UmVzZXJ2ZWRQdW5jdHVhdG9yKGNoKSkge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gY2g7XG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jcHJvZC1DbGFzc1NldFJlc2VydmVkUHVuY3R1YXRvclxuICBmdW5jdGlvbiBpc0NsYXNzU2V0UmVzZXJ2ZWRQdW5jdHVhdG9yKGNoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGNoID09PSAweDIxIC8qICEgKi8gfHxcbiAgICAgIGNoID09PSAweDIzIC8qICMgKi8gfHxcbiAgICAgIGNoID09PSAweDI1IC8qICUgKi8gfHxcbiAgICAgIGNoID09PSAweDI2IC8qICYgKi8gfHxcbiAgICAgIGNoID09PSAweDJDIC8qICwgKi8gfHxcbiAgICAgIGNoID09PSAweDJEIC8qIC0gKi8gfHxcbiAgICAgIGNoID49IDB4M0EgLyogOiAqLyAmJiBjaCA8PSAweDNFIC8qID4gKi8gfHxcbiAgICAgIGNoID09PSAweDQwIC8qIEAgKi8gfHxcbiAgICAgIGNoID09PSAweDYwIC8qIGAgKi8gfHxcbiAgICAgIGNoID09PSAweDdFIC8qIH4gKi9cbiAgICApXG4gIH1cblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1hbm5leEItQ2xhc3NDb250cm9sTGV0dGVyXG4gIHBwJDEucmVnZXhwX2VhdENsYXNzQ29udHJvbExldHRlciA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIGNoID0gc3RhdGUuY3VycmVudCgpO1xuICAgIGlmIChpc0RlY2ltYWxEaWdpdChjaCkgfHwgY2ggPT09IDB4NUYgLyogXyAqLykge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gY2ggJSAweDIwO1xuICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtSGV4RXNjYXBlU2VxdWVuY2VcbiAgcHAkMS5yZWdleHBfZWF0SGV4RXNjYXBlU2VxdWVuY2UgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBzdGFydCA9IHN0YXRlLnBvcztcbiAgICBpZiAoc3RhdGUuZWF0KDB4NzggLyogeCAqLykpIHtcbiAgICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRGaXhlZEhleERpZ2l0cyhzdGF0ZSwgMikpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZS5zd2l0Y2hVKSB7XG4gICAgICAgIHN0YXRlLnJhaXNlKFwiSW52YWxpZCBlc2NhcGVcIik7XG4gICAgICB9XG4gICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH07XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtRGVjaW1hbERpZ2l0c1xuICBwcCQxLnJlZ2V4cF9lYXREZWNpbWFsRGlnaXRzID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICB2YXIgc3RhcnQgPSBzdGF0ZS5wb3M7XG4gICAgdmFyIGNoID0gMDtcbiAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAwO1xuICAgIHdoaWxlIChpc0RlY2ltYWxEaWdpdChjaCA9IHN0YXRlLmN1cnJlbnQoKSkpIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IDEwICogc3RhdGUubGFzdEludFZhbHVlICsgKGNoIC0gMHgzMCAvKiAwICovKTtcbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlLnBvcyAhPT0gc3RhcnRcbiAgfTtcbiAgZnVuY3Rpb24gaXNEZWNpbWFsRGlnaXQoY2gpIHtcbiAgICByZXR1cm4gY2ggPj0gMHgzMCAvKiAwICovICYmIGNoIDw9IDB4MzkgLyogOSAqL1xuICB9XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtSGV4RGlnaXRzXG4gIHBwJDEucmVnZXhwX2VhdEhleERpZ2l0cyA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgdmFyIHN0YXJ0ID0gc3RhdGUucG9zO1xuICAgIHZhciBjaCA9IDA7XG4gICAgc3RhdGUubGFzdEludFZhbHVlID0gMDtcbiAgICB3aGlsZSAoaXNIZXhEaWdpdChjaCA9IHN0YXRlLmN1cnJlbnQoKSkpIHtcbiAgICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IDE2ICogc3RhdGUubGFzdEludFZhbHVlICsgaGV4VG9JbnQoY2gpO1xuICAgICAgc3RhdGUuYWR2YW5jZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdGUucG9zICE9PSBzdGFydFxuICB9O1xuICBmdW5jdGlvbiBpc0hleERpZ2l0KGNoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIChjaCA+PSAweDMwIC8qIDAgKi8gJiYgY2ggPD0gMHgzOSAvKiA5ICovKSB8fFxuICAgICAgKGNoID49IDB4NDEgLyogQSAqLyAmJiBjaCA8PSAweDQ2IC8qIEYgKi8pIHx8XG4gICAgICAoY2ggPj0gMHg2MSAvKiBhICovICYmIGNoIDw9IDB4NjYgLyogZiAqLylcbiAgICApXG4gIH1cbiAgZnVuY3Rpb24gaGV4VG9JbnQoY2gpIHtcbiAgICBpZiAoY2ggPj0gMHg0MSAvKiBBICovICYmIGNoIDw9IDB4NDYgLyogRiAqLykge1xuICAgICAgcmV0dXJuIDEwICsgKGNoIC0gMHg0MSAvKiBBICovKVxuICAgIH1cbiAgICBpZiAoY2ggPj0gMHg2MSAvKiBhICovICYmIGNoIDw9IDB4NjYgLyogZiAqLykge1xuICAgICAgcmV0dXJuIDEwICsgKGNoIC0gMHg2MSAvKiBhICovKVxuICAgIH1cbiAgICByZXR1cm4gY2ggLSAweDMwIC8qIDAgKi9cbiAgfVxuXG4gIC8vIGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvOC4wLyNwcm9kLWFubmV4Qi1MZWdhY3lPY3RhbEVzY2FwZVNlcXVlbmNlXG4gIC8vIEFsbG93cyBvbmx5IDAtMzc3KG9jdGFsKSBpLmUuIDAtMjU1KGRlY2ltYWwpLlxuICBwcCQxLnJlZ2V4cF9lYXRMZWdhY3lPY3RhbEVzY2FwZVNlcXVlbmNlID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICBpZiAodGhpcy5yZWdleHBfZWF0T2N0YWxEaWdpdChzdGF0ZSkpIHtcbiAgICAgIHZhciBuMSA9IHN0YXRlLmxhc3RJbnRWYWx1ZTtcbiAgICAgIGlmICh0aGlzLnJlZ2V4cF9lYXRPY3RhbERpZ2l0KHN0YXRlKSkge1xuICAgICAgICB2YXIgbjIgPSBzdGF0ZS5sYXN0SW50VmFsdWU7XG4gICAgICAgIGlmIChuMSA8PSAzICYmIHRoaXMucmVnZXhwX2VhdE9jdGFsRGlnaXQoc3RhdGUpKSB7XG4gICAgICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gbjEgKiA2NCArIG4yICogOCArIHN0YXRlLmxhc3RJbnRWYWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSBuMSAqIDggKyBuMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gbjE7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfTtcblxuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1PY3RhbERpZ2l0XG4gIHBwJDEucmVnZXhwX2VhdE9jdGFsRGlnaXQgPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgIHZhciBjaCA9IHN0YXRlLmN1cnJlbnQoKTtcbiAgICBpZiAoaXNPY3RhbERpZ2l0KGNoKSkge1xuICAgICAgc3RhdGUubGFzdEludFZhbHVlID0gY2ggLSAweDMwOyAvKiAwICovXG4gICAgICBzdGF0ZS5hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAwO1xuICAgIHJldHVybiBmYWxzZVxuICB9O1xuICBmdW5jdGlvbiBpc09jdGFsRGlnaXQoY2gpIHtcbiAgICByZXR1cm4gY2ggPj0gMHgzMCAvKiAwICovICYmIGNoIDw9IDB4MzcgLyogNyAqL1xuICB9XG5cbiAgLy8gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtSGV4NERpZ2l0c1xuICAvLyBodHRwczovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzguMC8jcHJvZC1IZXhEaWdpdFxuICAvLyBBbmQgSGV4RGlnaXQgSGV4RGlnaXQgaW4gaHR0cHM6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi84LjAvI3Byb2QtSGV4RXNjYXBlU2VxdWVuY2VcbiAgcHAkMS5yZWdleHBfZWF0Rml4ZWRIZXhEaWdpdHMgPSBmdW5jdGlvbihzdGF0ZSwgbGVuZ3RoKSB7XG4gICAgdmFyIHN0YXJ0ID0gc3RhdGUucG9zO1xuICAgIHN0YXRlLmxhc3RJbnRWYWx1ZSA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGNoID0gc3RhdGUuY3VycmVudCgpO1xuICAgICAgaWYgKCFpc0hleERpZ2l0KGNoKSkge1xuICAgICAgICBzdGF0ZS5wb3MgPSBzdGFydDtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBzdGF0ZS5sYXN0SW50VmFsdWUgPSAxNiAqIHN0YXRlLmxhc3RJbnRWYWx1ZSArIGhleFRvSW50KGNoKTtcbiAgICAgIHN0YXRlLmFkdmFuY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfTtcblxuICAvLyBPYmplY3QgdHlwZSB1c2VkIHRvIHJlcHJlc2VudCB0b2tlbnMuIE5vdGUgdGhhdCBub3JtYWxseSwgdG9rZW5zXG4gIC8vIHNpbXBseSBleGlzdCBhcyBwcm9wZXJ0aWVzIG9uIHRoZSBwYXJzZXIgb2JqZWN0LiBUaGlzIGlzIG9ubHlcbiAgLy8gdXNlZCBmb3IgdGhlIG9uVG9rZW4gY2FsbGJhY2sgYW5kIHRoZSBleHRlcm5hbCB0b2tlbml6ZXIuXG5cbiAgdmFyIFRva2VuID0gZnVuY3Rpb24gVG9rZW4ocCkge1xuICAgIHRoaXMudHlwZSA9IHAudHlwZTtcbiAgICB0aGlzLnZhbHVlID0gcC52YWx1ZTtcbiAgICB0aGlzLnN0YXJ0ID0gcC5zdGFydDtcbiAgICB0aGlzLmVuZCA9IHAuZW5kO1xuICAgIGlmIChwLm9wdGlvbnMubG9jYXRpb25zKVxuICAgICAgeyB0aGlzLmxvYyA9IG5ldyBTb3VyY2VMb2NhdGlvbihwLCBwLnN0YXJ0TG9jLCBwLmVuZExvYyk7IH1cbiAgICBpZiAocC5vcHRpb25zLnJhbmdlcylcbiAgICAgIHsgdGhpcy5yYW5nZSA9IFtwLnN0YXJ0LCBwLmVuZF07IH1cbiAgfTtcblxuICAvLyAjIyBUb2tlbml6ZXJcblxuICB2YXIgcHAgPSBQYXJzZXIucHJvdG90eXBlO1xuXG4gIC8vIE1vdmUgdG8gdGhlIG5leHQgdG9rZW5cblxuICBwcC5uZXh0ID0gZnVuY3Rpb24oaWdub3JlRXNjYXBlU2VxdWVuY2VJbktleXdvcmQpIHtcbiAgICBpZiAoIWlnbm9yZUVzY2FwZVNlcXVlbmNlSW5LZXl3b3JkICYmIHRoaXMudHlwZS5rZXl3b3JkICYmIHRoaXMuY29udGFpbnNFc2MpXG4gICAgICB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZSh0aGlzLnN0YXJ0LCBcIkVzY2FwZSBzZXF1ZW5jZSBpbiBrZXl3b3JkIFwiICsgdGhpcy50eXBlLmtleXdvcmQpOyB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5vblRva2VuKVxuICAgICAgeyB0aGlzLm9wdGlvbnMub25Ub2tlbihuZXcgVG9rZW4odGhpcykpOyB9XG5cbiAgICB0aGlzLmxhc3RUb2tFbmQgPSB0aGlzLmVuZDtcbiAgICB0aGlzLmxhc3RUb2tTdGFydCA9IHRoaXMuc3RhcnQ7XG4gICAgdGhpcy5sYXN0VG9rRW5kTG9jID0gdGhpcy5lbmRMb2M7XG4gICAgdGhpcy5sYXN0VG9rU3RhcnRMb2MgPSB0aGlzLnN0YXJ0TG9jO1xuICAgIHRoaXMubmV4dFRva2VuKCk7XG4gIH07XG5cbiAgcHAuZ2V0VG9rZW4gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm5leHQoKTtcbiAgICByZXR1cm4gbmV3IFRva2VuKHRoaXMpXG4gIH07XG5cbiAgLy8gSWYgd2UncmUgaW4gYW4gRVM2IGVudmlyb25tZW50LCBtYWtlIHBhcnNlcnMgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBTeW1ib2wgIT09IFwidW5kZWZpbmVkXCIpXG4gICAgeyBwcFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGhpcyQxJDEgPSB0aGlzO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIHRva2VuID0gdGhpcyQxJDEuZ2V0VG9rZW4oKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZG9uZTogdG9rZW4udHlwZSA9PT0gdHlwZXMkMS5lb2YsXG4gICAgICAgICAgICB2YWx1ZTogdG9rZW5cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9OyB9XG5cbiAgLy8gVG9nZ2xlIHN0cmljdCBtb2RlLiBSZS1yZWFkcyB0aGUgbmV4dCBudW1iZXIgb3Igc3RyaW5nIHRvIHBsZWFzZVxuICAvLyBwZWRhbnRpYyB0ZXN0cyAoYFwidXNlIHN0cmljdFwiOyAwMTA7YCBzaG91bGQgZmFpbCkuXG5cbiAgLy8gUmVhZCBhIHNpbmdsZSB0b2tlbiwgdXBkYXRpbmcgdGhlIHBhcnNlciBvYmplY3QncyB0b2tlbi1yZWxhdGVkXG4gIC8vIHByb3BlcnRpZXMuXG5cbiAgcHAubmV4dFRva2VuID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGN1ckNvbnRleHQgPSB0aGlzLmN1ckNvbnRleHQoKTtcbiAgICBpZiAoIWN1ckNvbnRleHQgfHwgIWN1ckNvbnRleHQucHJlc2VydmVTcGFjZSkgeyB0aGlzLnNraXBTcGFjZSgpOyB9XG5cbiAgICB0aGlzLnN0YXJ0ID0gdGhpcy5wb3M7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5sb2NhdGlvbnMpIHsgdGhpcy5zdGFydExvYyA9IHRoaXMuY3VyUG9zaXRpb24oKTsgfVxuICAgIGlmICh0aGlzLnBvcyA+PSB0aGlzLmlucHV0Lmxlbmd0aCkgeyByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLmVvZikgfVxuXG4gICAgaWYgKGN1ckNvbnRleHQub3ZlcnJpZGUpIHsgcmV0dXJuIGN1ckNvbnRleHQub3ZlcnJpZGUodGhpcykgfVxuICAgIGVsc2UgeyB0aGlzLnJlYWRUb2tlbih0aGlzLmZ1bGxDaGFyQ29kZUF0UG9zKCkpOyB9XG4gIH07XG5cbiAgcHAucmVhZFRva2VuID0gZnVuY3Rpb24oY29kZSkge1xuICAgIC8vIElkZW50aWZpZXIgb3Iga2V5d29yZC4gJ1xcdVhYWFgnIHNlcXVlbmNlcyBhcmUgYWxsb3dlZCBpblxuICAgIC8vIGlkZW50aWZpZXJzLCBzbyAnXFwnIGFsc28gZGlzcGF0Y2hlcyB0byB0aGF0LlxuICAgIGlmIChpc0lkZW50aWZpZXJTdGFydChjb2RlLCB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNikgfHwgY29kZSA9PT0gOTIgLyogJ1xcJyAqLylcbiAgICAgIHsgcmV0dXJuIHRoaXMucmVhZFdvcmQoKSB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXRUb2tlbkZyb21Db2RlKGNvZGUpXG4gIH07XG5cbiAgcHAuZnVsbENoYXJDb2RlQXRQb3MgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29kZSA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyk7XG4gICAgaWYgKGNvZGUgPD0gMHhkN2ZmIHx8IGNvZGUgPj0gMHhkYzAwKSB7IHJldHVybiBjb2RlIH1cbiAgICB2YXIgbmV4dCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDEpO1xuICAgIHJldHVybiBuZXh0IDw9IDB4ZGJmZiB8fCBuZXh0ID49IDB4ZTAwMCA/IGNvZGUgOiAoY29kZSA8PCAxMCkgKyBuZXh0IC0gMHgzNWZkYzAwXG4gIH07XG5cbiAgcHAuc2tpcEJsb2NrQ29tbWVudCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGFydExvYyA9IHRoaXMub3B0aW9ucy5vbkNvbW1lbnQgJiYgdGhpcy5jdXJQb3NpdGlvbigpO1xuICAgIHZhciBzdGFydCA9IHRoaXMucG9zLCBlbmQgPSB0aGlzLmlucHV0LmluZGV4T2YoXCIqL1wiLCB0aGlzLnBvcyArPSAyKTtcbiAgICBpZiAoZW5kID09PSAtMSkgeyB0aGlzLnJhaXNlKHRoaXMucG9zIC0gMiwgXCJVbnRlcm1pbmF0ZWQgY29tbWVudFwiKTsgfVxuICAgIHRoaXMucG9zID0gZW5kICsgMjtcbiAgICBpZiAodGhpcy5vcHRpb25zLmxvY2F0aW9ucykge1xuICAgICAgZm9yICh2YXIgbmV4dEJyZWFrID0gKHZvaWQgMCksIHBvcyA9IHN0YXJ0OyAobmV4dEJyZWFrID0gbmV4dExpbmVCcmVhayh0aGlzLmlucHV0LCBwb3MsIHRoaXMucG9zKSkgPiAtMTspIHtcbiAgICAgICAgKyt0aGlzLmN1ckxpbmU7XG4gICAgICAgIHBvcyA9IHRoaXMubGluZVN0YXJ0ID0gbmV4dEJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLm9uQ29tbWVudClcbiAgICAgIHsgdGhpcy5vcHRpb25zLm9uQ29tbWVudCh0cnVlLCB0aGlzLmlucHV0LnNsaWNlKHN0YXJ0ICsgMiwgZW5kKSwgc3RhcnQsIHRoaXMucG9zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydExvYywgdGhpcy5jdXJQb3NpdGlvbigpKTsgfVxuICB9O1xuXG4gIHBwLnNraXBMaW5lQ29tbWVudCA9IGZ1bmN0aW9uKHN0YXJ0U2tpcCkge1xuICAgIHZhciBzdGFydCA9IHRoaXMucG9zO1xuICAgIHZhciBzdGFydExvYyA9IHRoaXMub3B0aW9ucy5vbkNvbW1lbnQgJiYgdGhpcy5jdXJQb3NpdGlvbigpO1xuICAgIHZhciBjaCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArPSBzdGFydFNraXApO1xuICAgIHdoaWxlICh0aGlzLnBvcyA8IHRoaXMuaW5wdXQubGVuZ3RoICYmICFpc05ld0xpbmUoY2gpKSB7XG4gICAgICBjaCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCgrK3RoaXMucG9zKTtcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5vbkNvbW1lbnQpXG4gICAgICB7IHRoaXMub3B0aW9ucy5vbkNvbW1lbnQoZmFsc2UsIHRoaXMuaW5wdXQuc2xpY2Uoc3RhcnQgKyBzdGFydFNraXAsIHRoaXMucG9zKSwgc3RhcnQsIHRoaXMucG9zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydExvYywgdGhpcy5jdXJQb3NpdGlvbigpKTsgfVxuICB9O1xuXG4gIC8vIENhbGxlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIHBhcnNlIGFuZCBhZnRlciBldmVyeSB0b2tlbi4gU2tpcHNcbiAgLy8gd2hpdGVzcGFjZSBhbmQgY29tbWVudHMsIGFuZC5cblxuICBwcC5za2lwU3BhY2UgPSBmdW5jdGlvbigpIHtcbiAgICBsb29wOiB3aGlsZSAodGhpcy5wb3MgPCB0aGlzLmlucHV0Lmxlbmd0aCkge1xuICAgICAgdmFyIGNoID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zKTtcbiAgICAgIHN3aXRjaCAoY2gpIHtcbiAgICAgIGNhc2UgMzI6IGNhc2UgMTYwOiAvLyAnICdcbiAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgMTM6XG4gICAgICAgIGlmICh0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAxKSA9PT0gMTApIHtcbiAgICAgICAgICArK3RoaXMucG9zO1xuICAgICAgICB9XG4gICAgICBjYXNlIDEwOiBjYXNlIDgyMzI6IGNhc2UgODIzMzpcbiAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb2NhdGlvbnMpIHtcbiAgICAgICAgICArK3RoaXMuY3VyTGluZTtcbiAgICAgICAgICB0aGlzLmxpbmVTdGFydCA9IHRoaXMucG9zO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDQ3OiAvLyAnLydcbiAgICAgICAgc3dpdGNoICh0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAxKSkge1xuICAgICAgICBjYXNlIDQyOiAvLyAnKidcbiAgICAgICAgICB0aGlzLnNraXBCbG9ja0NvbW1lbnQoKTtcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDQ3OlxuICAgICAgICAgIHRoaXMuc2tpcExpbmVDb21tZW50KDIpO1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYnJlYWsgbG9vcFxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAoY2ggPiA4ICYmIGNoIDwgMTQgfHwgY2ggPj0gNTc2MCAmJiBub25BU0NJSXdoaXRlc3BhY2UudGVzdChTdHJpbmcuZnJvbUNoYXJDb2RlKGNoKSkpIHtcbiAgICAgICAgICArK3RoaXMucG9zO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJyZWFrIGxvb3BcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBDYWxsZWQgYXQgdGhlIGVuZCBvZiBldmVyeSB0b2tlbi4gU2V0cyBgZW5kYCwgYHZhbGAsIGFuZFxuICAvLyBtYWludGFpbnMgYGNvbnRleHRgIGFuZCBgZXhwckFsbG93ZWRgLCBhbmQgc2tpcHMgdGhlIHNwYWNlIGFmdGVyXG4gIC8vIHRoZSB0b2tlbiwgc28gdGhhdCB0aGUgbmV4dCBvbmUncyBgc3RhcnRgIHdpbGwgcG9pbnQgYXQgdGhlXG4gIC8vIHJpZ2h0IHBvc2l0aW9uLlxuXG4gIHBwLmZpbmlzaFRva2VuID0gZnVuY3Rpb24odHlwZSwgdmFsKSB7XG4gICAgdGhpcy5lbmQgPSB0aGlzLnBvcztcbiAgICBpZiAodGhpcy5vcHRpb25zLmxvY2F0aW9ucykgeyB0aGlzLmVuZExvYyA9IHRoaXMuY3VyUG9zaXRpb24oKTsgfVxuICAgIHZhciBwcmV2VHlwZSA9IHRoaXMudHlwZTtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMudmFsdWUgPSB2YWw7XG5cbiAgICB0aGlzLnVwZGF0ZUNvbnRleHQocHJldlR5cGUpO1xuICB9O1xuXG4gIC8vICMjIyBUb2tlbiByZWFkaW5nXG5cbiAgLy8gVGhpcyBpcyB0aGUgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgdG8gZmV0Y2ggdGhlIG5leHQgdG9rZW4uIEl0XG4gIC8vIGlzIHNvbWV3aGF0IG9ic2N1cmUsIGJlY2F1c2UgaXQgd29ya3MgaW4gY2hhcmFjdGVyIGNvZGVzIHJhdGhlclxuICAvLyB0aGFuIGNoYXJhY3RlcnMsIGFuZCBiZWNhdXNlIG9wZXJhdG9yIHBhcnNpbmcgaGFzIGJlZW4gaW5saW5lZFxuICAvLyBpbnRvIGl0LlxuICAvL1xuICAvLyBBbGwgaW4gdGhlIG5hbWUgb2Ygc3BlZWQuXG4gIC8vXG4gIHBwLnJlYWRUb2tlbl9kb3QgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV4dCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDEpO1xuICAgIGlmIChuZXh0ID49IDQ4ICYmIG5leHQgPD0gNTcpIHsgcmV0dXJuIHRoaXMucmVhZE51bWJlcih0cnVlKSB9XG4gICAgdmFyIG5leHQyID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMik7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2ICYmIG5leHQgPT09IDQ2ICYmIG5leHQyID09PSA0NikgeyAvLyA0NiA9IGRvdCAnLidcbiAgICAgIHRoaXMucG9zICs9IDM7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLmVsbGlwc2lzKVxuICAgIH0gZWxzZSB7XG4gICAgICArK3RoaXMucG9zO1xuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5kb3QpXG4gICAgfVxuICB9O1xuXG4gIHBwLnJlYWRUb2tlbl9zbGFzaCA9IGZ1bmN0aW9uKCkgeyAvLyAnLydcbiAgICB2YXIgbmV4dCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDEpO1xuICAgIGlmICh0aGlzLmV4cHJBbGxvd2VkKSB7ICsrdGhpcy5wb3M7IHJldHVybiB0aGlzLnJlYWRSZWdleHAoKSB9XG4gICAgaWYgKG5leHQgPT09IDYxKSB7IHJldHVybiB0aGlzLmZpbmlzaE9wKHR5cGVzJDEuYXNzaWduLCAyKSB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoT3AodHlwZXMkMS5zbGFzaCwgMSlcbiAgfTtcblxuICBwcC5yZWFkVG9rZW5fbXVsdF9tb2R1bG9fZXhwID0gZnVuY3Rpb24oY29kZSkgeyAvLyAnJSonXG4gICAgdmFyIG5leHQgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAxKTtcbiAgICB2YXIgc2l6ZSA9IDE7XG4gICAgdmFyIHRva2VudHlwZSA9IGNvZGUgPT09IDQyID8gdHlwZXMkMS5zdGFyIDogdHlwZXMkMS5tb2R1bG87XG5cbiAgICAvLyBleHBvbmVudGlhdGlvbiBvcGVyYXRvciAqKiBhbmQgKio9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA3ICYmIGNvZGUgPT09IDQyICYmIG5leHQgPT09IDQyKSB7XG4gICAgICArK3NpemU7XG4gICAgICB0b2tlbnR5cGUgPSB0eXBlcyQxLnN0YXJzdGFyO1xuICAgICAgbmV4dCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDIpO1xuICAgIH1cblxuICAgIGlmIChuZXh0ID09PSA2MSkgeyByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLmFzc2lnbiwgc2l6ZSArIDEpIH1cbiAgICByZXR1cm4gdGhpcy5maW5pc2hPcCh0b2tlbnR5cGUsIHNpemUpXG4gIH07XG5cbiAgcHAucmVhZFRva2VuX3BpcGVfYW1wID0gZnVuY3Rpb24oY29kZSkgeyAvLyAnfCYnXG4gICAgdmFyIG5leHQgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAxKTtcbiAgICBpZiAobmV4dCA9PT0gY29kZSkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSAxMikge1xuICAgICAgICB2YXIgbmV4dDIgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAyKTtcbiAgICAgICAgaWYgKG5leHQyID09PSA2MSkgeyByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLmFzc2lnbiwgMykgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoT3AoY29kZSA9PT0gMTI0ID8gdHlwZXMkMS5sb2dpY2FsT1IgOiB0eXBlcyQxLmxvZ2ljYWxBTkQsIDIpXG4gICAgfVxuICAgIGlmIChuZXh0ID09PSA2MSkgeyByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLmFzc2lnbiwgMikgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaE9wKGNvZGUgPT09IDEyNCA/IHR5cGVzJDEuYml0d2lzZU9SIDogdHlwZXMkMS5iaXR3aXNlQU5ELCAxKVxuICB9O1xuXG4gIHBwLnJlYWRUb2tlbl9jYXJldCA9IGZ1bmN0aW9uKCkgeyAvLyAnXidcbiAgICB2YXIgbmV4dCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDEpO1xuICAgIGlmIChuZXh0ID09PSA2MSkgeyByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLmFzc2lnbiwgMikgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaE9wKHR5cGVzJDEuYml0d2lzZVhPUiwgMSlcbiAgfTtcblxuICBwcC5yZWFkVG9rZW5fcGx1c19taW4gPSBmdW5jdGlvbihjb2RlKSB7IC8vICcrLSdcbiAgICB2YXIgbmV4dCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDEpO1xuICAgIGlmIChuZXh0ID09PSBjb2RlKSB7XG4gICAgICBpZiAobmV4dCA9PT0gNDUgJiYgIXRoaXMuaW5Nb2R1bGUgJiYgdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMikgPT09IDYyICYmXG4gICAgICAgICAgKHRoaXMubGFzdFRva0VuZCA9PT0gMCB8fCBsaW5lQnJlYWsudGVzdCh0aGlzLmlucHV0LnNsaWNlKHRoaXMubGFzdFRva0VuZCwgdGhpcy5wb3MpKSkpIHtcbiAgICAgICAgLy8gQSBgLS0+YCBsaW5lIGNvbW1lbnRcbiAgICAgICAgdGhpcy5za2lwTGluZUNvbW1lbnQoMyk7XG4gICAgICAgIHRoaXMuc2tpcFNwYWNlKCk7XG4gICAgICAgIHJldHVybiB0aGlzLm5leHRUb2tlbigpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLmluY0RlYywgMilcbiAgICB9XG4gICAgaWYgKG5leHQgPT09IDYxKSB7IHJldHVybiB0aGlzLmZpbmlzaE9wKHR5cGVzJDEuYXNzaWduLCAyKSB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoT3AodHlwZXMkMS5wbHVzTWluLCAxKVxuICB9O1xuXG4gIHBwLnJlYWRUb2tlbl9sdF9ndCA9IGZ1bmN0aW9uKGNvZGUpIHsgLy8gJzw+J1xuICAgIHZhciBuZXh0ID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMSk7XG4gICAgdmFyIHNpemUgPSAxO1xuICAgIGlmIChuZXh0ID09PSBjb2RlKSB7XG4gICAgICBzaXplID0gY29kZSA9PT0gNjIgJiYgdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMikgPT09IDYyID8gMyA6IDI7XG4gICAgICBpZiAodGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgc2l6ZSkgPT09IDYxKSB7IHJldHVybiB0aGlzLmZpbmlzaE9wKHR5cGVzJDEuYXNzaWduLCBzaXplICsgMSkgfVxuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoT3AodHlwZXMkMS5iaXRTaGlmdCwgc2l6ZSlcbiAgICB9XG4gICAgaWYgKG5leHQgPT09IDMzICYmIGNvZGUgPT09IDYwICYmICF0aGlzLmluTW9kdWxlICYmIHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDIpID09PSA0NSAmJlxuICAgICAgICB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAzKSA9PT0gNDUpIHtcbiAgICAgIC8vIGA8IS0tYCwgYW4gWE1MLXN0eWxlIGNvbW1lbnQgdGhhdCBzaG91bGQgYmUgaW50ZXJwcmV0ZWQgYXMgYSBsaW5lIGNvbW1lbnRcbiAgICAgIHRoaXMuc2tpcExpbmVDb21tZW50KDQpO1xuICAgICAgdGhpcy5za2lwU3BhY2UoKTtcbiAgICAgIHJldHVybiB0aGlzLm5leHRUb2tlbigpXG4gICAgfVxuICAgIGlmIChuZXh0ID09PSA2MSkgeyBzaXplID0gMjsgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaE9wKHR5cGVzJDEucmVsYXRpb25hbCwgc2l6ZSlcbiAgfTtcblxuICBwcC5yZWFkVG9rZW5fZXFfZXhjbCA9IGZ1bmN0aW9uKGNvZGUpIHsgLy8gJz0hJ1xuICAgIHZhciBuZXh0ID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMSk7XG4gICAgaWYgKG5leHQgPT09IDYxKSB7IHJldHVybiB0aGlzLmZpbmlzaE9wKHR5cGVzJDEuZXF1YWxpdHksIHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDIpID09PSA2MSA/IDMgOiAyKSB9XG4gICAgaWYgKGNvZGUgPT09IDYxICYmIG5leHQgPT09IDYyICYmIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2KSB7IC8vICc9PidcbiAgICAgIHRoaXMucG9zICs9IDI7XG4gICAgICByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLmFycm93KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maW5pc2hPcChjb2RlID09PSA2MSA/IHR5cGVzJDEuZXEgOiB0eXBlcyQxLnByZWZpeCwgMSlcbiAgfTtcblxuICBwcC5yZWFkVG9rZW5fcXVlc3Rpb24gPSBmdW5jdGlvbigpIHsgLy8gJz8nXG4gICAgdmFyIGVjbWFWZXJzaW9uID0gdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uO1xuICAgIGlmIChlY21hVmVyc2lvbiA+PSAxMSkge1xuICAgICAgdmFyIG5leHQgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAxKTtcbiAgICAgIGlmIChuZXh0ID09PSA0Nikge1xuICAgICAgICB2YXIgbmV4dDIgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAyKTtcbiAgICAgICAgaWYgKG5leHQyIDwgNDggfHwgbmV4dDIgPiA1NykgeyByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLnF1ZXN0aW9uRG90LCAyKSB9XG4gICAgICB9XG4gICAgICBpZiAobmV4dCA9PT0gNjMpIHtcbiAgICAgICAgaWYgKGVjbWFWZXJzaW9uID49IDEyKSB7XG4gICAgICAgICAgdmFyIG5leHQyJDEgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MgKyAyKTtcbiAgICAgICAgICBpZiAobmV4dDIkMSA9PT0gNjEpIHsgcmV0dXJuIHRoaXMuZmluaXNoT3AodHlwZXMkMS5hc3NpZ24sIDMpIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLmNvYWxlc2NlLCAyKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maW5pc2hPcCh0eXBlcyQxLnF1ZXN0aW9uLCAxKVxuICB9O1xuXG4gIHBwLnJlYWRUb2tlbl9udW1iZXJTaWduID0gZnVuY3Rpb24oKSB7IC8vICcjJ1xuICAgIHZhciBlY21hVmVyc2lvbiA9IHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbjtcbiAgICB2YXIgY29kZSA9IDM1OyAvLyAnIydcbiAgICBpZiAoZWNtYVZlcnNpb24gPj0gMTMpIHtcbiAgICAgICsrdGhpcy5wb3M7XG4gICAgICBjb2RlID0gdGhpcy5mdWxsQ2hhckNvZGVBdFBvcygpO1xuICAgICAgaWYgKGlzSWRlbnRpZmllclN0YXJ0KGNvZGUsIHRydWUpIHx8IGNvZGUgPT09IDkyIC8qICdcXCcgKi8pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5wcml2YXRlSWQsIHRoaXMucmVhZFdvcmQxKCkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yYWlzZSh0aGlzLnBvcywgXCJVbmV4cGVjdGVkIGNoYXJhY3RlciAnXCIgKyBjb2RlUG9pbnRUb1N0cmluZyhjb2RlKSArIFwiJ1wiKTtcbiAgfTtcblxuICBwcC5nZXRUb2tlbkZyb21Db2RlID0gZnVuY3Rpb24oY29kZSkge1xuICAgIHN3aXRjaCAoY29kZSkge1xuICAgIC8vIFRoZSBpbnRlcnByZXRhdGlvbiBvZiBhIGRvdCBkZXBlbmRzIG9uIHdoZXRoZXIgaXQgaXMgZm9sbG93ZWRcbiAgICAvLyBieSBhIGRpZ2l0IG9yIGFub3RoZXIgdHdvIGRvdHMuXG4gICAgY2FzZSA0NjogLy8gJy4nXG4gICAgICByZXR1cm4gdGhpcy5yZWFkVG9rZW5fZG90KClcblxuICAgIC8vIFB1bmN0dWF0aW9uIHRva2Vucy5cbiAgICBjYXNlIDQwOiArK3RoaXMucG9zOyByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLnBhcmVuTClcbiAgICBjYXNlIDQxOiArK3RoaXMucG9zOyByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLnBhcmVuUilcbiAgICBjYXNlIDU5OiArK3RoaXMucG9zOyByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLnNlbWkpXG4gICAgY2FzZSA0NDogKyt0aGlzLnBvczsgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5jb21tYSlcbiAgICBjYXNlIDkxOiArK3RoaXMucG9zOyByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLmJyYWNrZXRMKVxuICAgIGNhc2UgOTM6ICsrdGhpcy5wb3M7IHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGVzJDEuYnJhY2tldFIpXG4gICAgY2FzZSAxMjM6ICsrdGhpcy5wb3M7IHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGVzJDEuYnJhY2VMKVxuICAgIGNhc2UgMTI1OiArK3RoaXMucG9zOyByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLmJyYWNlUilcbiAgICBjYXNlIDU4OiArK3RoaXMucG9zOyByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLmNvbG9uKVxuXG4gICAgY2FzZSA5NjogLy8gJ2AnXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uIDwgNikgeyBicmVhayB9XG4gICAgICArK3RoaXMucG9zO1xuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5iYWNrUXVvdGUpXG5cbiAgICBjYXNlIDQ4OiAvLyAnMCdcbiAgICAgIHZhciBuZXh0ID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zICsgMSk7XG4gICAgICBpZiAobmV4dCA9PT0gMTIwIHx8IG5leHQgPT09IDg4KSB7IHJldHVybiB0aGlzLnJlYWRSYWRpeE51bWJlcigxNikgfSAvLyAnMHgnLCAnMFgnIC0gaGV4IG51bWJlclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSA2KSB7XG4gICAgICAgIGlmIChuZXh0ID09PSAxMTEgfHwgbmV4dCA9PT0gNzkpIHsgcmV0dXJuIHRoaXMucmVhZFJhZGl4TnVtYmVyKDgpIH0gLy8gJzBvJywgJzBPJyAtIG9jdGFsIG51bWJlclxuICAgICAgICBpZiAobmV4dCA9PT0gOTggfHwgbmV4dCA9PT0gNjYpIHsgcmV0dXJuIHRoaXMucmVhZFJhZGl4TnVtYmVyKDIpIH0gLy8gJzBiJywgJzBCJyAtIGJpbmFyeSBudW1iZXJcbiAgICAgIH1cblxuICAgIC8vIEFueXRoaW5nIGVsc2UgYmVnaW5uaW5nIHdpdGggYSBkaWdpdCBpcyBhbiBpbnRlZ2VyLCBvY3RhbFxuICAgIC8vIG51bWJlciwgb3IgZmxvYXQuXG4gICAgY2FzZSA0OTogY2FzZSA1MDogY2FzZSA1MTogY2FzZSA1MjogY2FzZSA1MzogY2FzZSA1NDogY2FzZSA1NTogY2FzZSA1NjogY2FzZSA1NzogLy8gMS05XG4gICAgICByZXR1cm4gdGhpcy5yZWFkTnVtYmVyKGZhbHNlKVxuXG4gICAgLy8gUXVvdGVzIHByb2R1Y2Ugc3RyaW5ncy5cbiAgICBjYXNlIDM0OiBjYXNlIDM5OiAvLyAnXCInLCBcIidcIlxuICAgICAgcmV0dXJuIHRoaXMucmVhZFN0cmluZyhjb2RlKVxuXG4gICAgLy8gT3BlcmF0b3JzIGFyZSBwYXJzZWQgaW5saW5lIGluIHRpbnkgc3RhdGUgbWFjaGluZXMuICc9JyAoNjEpIGlzXG4gICAgLy8gb2Z0ZW4gcmVmZXJyZWQgdG8uIGBmaW5pc2hPcGAgc2ltcGx5IHNraXBzIHRoZSBhbW91bnQgb2ZcbiAgICAvLyBjaGFyYWN0ZXJzIGl0IGlzIGdpdmVuIGFzIHNlY29uZCBhcmd1bWVudCwgYW5kIHJldHVybnMgYSB0b2tlblxuICAgIC8vIG9mIHRoZSB0eXBlIGdpdmVuIGJ5IGl0cyBmaXJzdCBhcmd1bWVudC5cbiAgICBjYXNlIDQ3OiAvLyAnLydcbiAgICAgIHJldHVybiB0aGlzLnJlYWRUb2tlbl9zbGFzaCgpXG5cbiAgICBjYXNlIDM3OiBjYXNlIDQyOiAvLyAnJSonXG4gICAgICByZXR1cm4gdGhpcy5yZWFkVG9rZW5fbXVsdF9tb2R1bG9fZXhwKGNvZGUpXG5cbiAgICBjYXNlIDEyNDogY2FzZSAzODogLy8gJ3wmJ1xuICAgICAgcmV0dXJuIHRoaXMucmVhZFRva2VuX3BpcGVfYW1wKGNvZGUpXG5cbiAgICBjYXNlIDk0OiAvLyAnXidcbiAgICAgIHJldHVybiB0aGlzLnJlYWRUb2tlbl9jYXJldCgpXG5cbiAgICBjYXNlIDQzOiBjYXNlIDQ1OiAvLyAnKy0nXG4gICAgICByZXR1cm4gdGhpcy5yZWFkVG9rZW5fcGx1c19taW4oY29kZSlcblxuICAgIGNhc2UgNjA6IGNhc2UgNjI6IC8vICc8PidcbiAgICAgIHJldHVybiB0aGlzLnJlYWRUb2tlbl9sdF9ndChjb2RlKVxuXG4gICAgY2FzZSA2MTogY2FzZSAzMzogLy8gJz0hJ1xuICAgICAgcmV0dXJuIHRoaXMucmVhZFRva2VuX2VxX2V4Y2woY29kZSlcblxuICAgIGNhc2UgNjM6IC8vICc/J1xuICAgICAgcmV0dXJuIHRoaXMucmVhZFRva2VuX3F1ZXN0aW9uKClcblxuICAgIGNhc2UgMTI2OiAvLyAnfidcbiAgICAgIHJldHVybiB0aGlzLmZpbmlzaE9wKHR5cGVzJDEucHJlZml4LCAxKVxuXG4gICAgY2FzZSAzNTogLy8gJyMnXG4gICAgICByZXR1cm4gdGhpcy5yZWFkVG9rZW5fbnVtYmVyU2lnbigpXG4gICAgfVxuXG4gICAgdGhpcy5yYWlzZSh0aGlzLnBvcywgXCJVbmV4cGVjdGVkIGNoYXJhY3RlciAnXCIgKyBjb2RlUG9pbnRUb1N0cmluZyhjb2RlKSArIFwiJ1wiKTtcbiAgfTtcblxuICBwcC5maW5pc2hPcCA9IGZ1bmN0aW9uKHR5cGUsIHNpemUpIHtcbiAgICB2YXIgc3RyID0gdGhpcy5pbnB1dC5zbGljZSh0aGlzLnBvcywgdGhpcy5wb3MgKyBzaXplKTtcbiAgICB0aGlzLnBvcyArPSBzaXplO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGUsIHN0cilcbiAgfTtcblxuICBwcC5yZWFkUmVnZXhwID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVzY2FwZWQsIGluQ2xhc3MsIHN0YXJ0ID0gdGhpcy5wb3M7XG4gICAgZm9yICg7Oykge1xuICAgICAgaWYgKHRoaXMucG9zID49IHRoaXMuaW5wdXQubGVuZ3RoKSB7IHRoaXMucmFpc2Uoc3RhcnQsIFwiVW50ZXJtaW5hdGVkIHJlZ3VsYXIgZXhwcmVzc2lvblwiKTsgfVxuICAgICAgdmFyIGNoID0gdGhpcy5pbnB1dC5jaGFyQXQodGhpcy5wb3MpO1xuICAgICAgaWYgKGxpbmVCcmVhay50ZXN0KGNoKSkgeyB0aGlzLnJhaXNlKHN0YXJ0LCBcIlVudGVybWluYXRlZCByZWd1bGFyIGV4cHJlc3Npb25cIik7IH1cbiAgICAgIGlmICghZXNjYXBlZCkge1xuICAgICAgICBpZiAoY2ggPT09IFwiW1wiKSB7IGluQ2xhc3MgPSB0cnVlOyB9XG4gICAgICAgIGVsc2UgaWYgKGNoID09PSBcIl1cIiAmJiBpbkNsYXNzKSB7IGluQ2xhc3MgPSBmYWxzZTsgfVxuICAgICAgICBlbHNlIGlmIChjaCA9PT0gXCIvXCIgJiYgIWluQ2xhc3MpIHsgYnJlYWsgfVxuICAgICAgICBlc2NhcGVkID0gY2ggPT09IFwiXFxcXFwiO1xuICAgICAgfSBlbHNlIHsgZXNjYXBlZCA9IGZhbHNlOyB9XG4gICAgICArK3RoaXMucG9zO1xuICAgIH1cbiAgICB2YXIgcGF0dGVybiA9IHRoaXMuaW5wdXQuc2xpY2Uoc3RhcnQsIHRoaXMucG9zKTtcbiAgICArK3RoaXMucG9zO1xuICAgIHZhciBmbGFnc1N0YXJ0ID0gdGhpcy5wb3M7XG4gICAgdmFyIGZsYWdzID0gdGhpcy5yZWFkV29yZDEoKTtcbiAgICBpZiAodGhpcy5jb250YWluc0VzYykgeyB0aGlzLnVuZXhwZWN0ZWQoZmxhZ3NTdGFydCk7IH1cblxuICAgIC8vIFZhbGlkYXRlIHBhdHRlcm5cbiAgICB2YXIgc3RhdGUgPSB0aGlzLnJlZ2V4cFN0YXRlIHx8ICh0aGlzLnJlZ2V4cFN0YXRlID0gbmV3IFJlZ0V4cFZhbGlkYXRpb25TdGF0ZSh0aGlzKSk7XG4gICAgc3RhdGUucmVzZXQoc3RhcnQsIHBhdHRlcm4sIGZsYWdzKTtcbiAgICB0aGlzLnZhbGlkYXRlUmVnRXhwRmxhZ3Moc3RhdGUpO1xuICAgIHRoaXMudmFsaWRhdGVSZWdFeHBQYXR0ZXJuKHN0YXRlKTtcblxuICAgIC8vIENyZWF0ZSBMaXRlcmFsI3ZhbHVlIHByb3BlcnR5IHZhbHVlLlxuICAgIHZhciB2YWx1ZSA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIHZhbHVlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBmbGFncyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gRVNUcmVlIHJlcXVpcmVzIG51bGwgaWYgaXQgZmFpbGVkIHRvIGluc3RhbnRpYXRlIFJlZ0V4cCBvYmplY3QuXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZXN0cmVlL2VzdHJlZS9ibG9iL2EyNzAwM2FkZjRmZDdiZmFkNDRkZTljZWYzNzJhMmVhY2Q1MjdiMWMvZXM1Lm1kI3JlZ2V4cGxpdGVyYWxcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLnJlZ2V4cCwge3BhdHRlcm46IHBhdHRlcm4sIGZsYWdzOiBmbGFncywgdmFsdWU6IHZhbHVlfSlcbiAgfTtcblxuICAvLyBSZWFkIGFuIGludGVnZXIgaW4gdGhlIGdpdmVuIHJhZGl4LiBSZXR1cm4gbnVsbCBpZiB6ZXJvIGRpZ2l0c1xuICAvLyB3ZXJlIHJlYWQsIHRoZSBpbnRlZ2VyIHZhbHVlIG90aGVyd2lzZS4gV2hlbiBgbGVuYCBpcyBnaXZlbiwgdGhpc1xuICAvLyB3aWxsIHJldHVybiBgbnVsbGAgdW5sZXNzIHRoZSBpbnRlZ2VyIGhhcyBleGFjdGx5IGBsZW5gIGRpZ2l0cy5cblxuICBwcC5yZWFkSW50ID0gZnVuY3Rpb24ocmFkaXgsIGxlbiwgbWF5YmVMZWdhY3lPY3RhbE51bWVyaWNMaXRlcmFsKSB7XG4gICAgLy8gYGxlbmAgaXMgdXNlZCBmb3IgY2hhcmFjdGVyIGVzY2FwZSBzZXF1ZW5jZXMuIEluIHRoYXQgY2FzZSwgZGlzYWxsb3cgc2VwYXJhdG9ycy5cbiAgICB2YXIgYWxsb3dTZXBhcmF0b3JzID0gdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDEyICYmIGxlbiA9PT0gdW5kZWZpbmVkO1xuXG4gICAgLy8gYG1heWJlTGVnYWN5T2N0YWxOdW1lcmljTGl0ZXJhbGAgaXMgdHJ1ZSBpZiBpdCBkb2Vzbid0IGhhdmUgcHJlZml4ICgweCwwbywwYilcbiAgICAvLyBhbmQgaXNuJ3QgZnJhY3Rpb24gcGFydCBub3IgZXhwb25lbnQgcGFydC4gSW4gdGhhdCBjYXNlLCBpZiB0aGUgZmlyc3QgZGlnaXRcbiAgICAvLyBpcyB6ZXJvIHRoZW4gZGlzYWxsb3cgc2VwYXJhdG9ycy5cbiAgICB2YXIgaXNMZWdhY3lPY3RhbE51bWVyaWNMaXRlcmFsID0gbWF5YmVMZWdhY3lPY3RhbE51bWVyaWNMaXRlcmFsICYmIHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcykgPT09IDQ4O1xuXG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5wb3MsIHRvdGFsID0gMCwgbGFzdENvZGUgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwLCBlID0gbGVuID09IG51bGwgPyBJbmZpbml0eSA6IGxlbjsgaSA8IGU7ICsraSwgKyt0aGlzLnBvcykge1xuICAgICAgdmFyIGNvZGUgPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MpLCB2YWwgPSAodm9pZCAwKTtcblxuICAgICAgaWYgKGFsbG93U2VwYXJhdG9ycyAmJiBjb2RlID09PSA5NSkge1xuICAgICAgICBpZiAoaXNMZWdhY3lPY3RhbE51bWVyaWNMaXRlcmFsKSB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZSh0aGlzLnBvcywgXCJOdW1lcmljIHNlcGFyYXRvciBpcyBub3QgYWxsb3dlZCBpbiBsZWdhY3kgb2N0YWwgbnVtZXJpYyBsaXRlcmFsc1wiKTsgfVxuICAgICAgICBpZiAobGFzdENvZGUgPT09IDk1KSB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZSh0aGlzLnBvcywgXCJOdW1lcmljIHNlcGFyYXRvciBtdXN0IGJlIGV4YWN0bHkgb25lIHVuZGVyc2NvcmVcIik7IH1cbiAgICAgICAgaWYgKGkgPT09IDApIHsgdGhpcy5yYWlzZVJlY292ZXJhYmxlKHRoaXMucG9zLCBcIk51bWVyaWMgc2VwYXJhdG9yIGlzIG5vdCBhbGxvd2VkIGF0IHRoZSBmaXJzdCBvZiBkaWdpdHNcIik7IH1cbiAgICAgICAgbGFzdENvZGUgPSBjb2RlO1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAoY29kZSA+PSA5NykgeyB2YWwgPSBjb2RlIC0gOTcgKyAxMDsgfSAvLyBhXG4gICAgICBlbHNlIGlmIChjb2RlID49IDY1KSB7IHZhbCA9IGNvZGUgLSA2NSArIDEwOyB9IC8vIEFcbiAgICAgIGVsc2UgaWYgKGNvZGUgPj0gNDggJiYgY29kZSA8PSA1NykgeyB2YWwgPSBjb2RlIC0gNDg7IH0gLy8gMC05XG4gICAgICBlbHNlIHsgdmFsID0gSW5maW5pdHk7IH1cbiAgICAgIGlmICh2YWwgPj0gcmFkaXgpIHsgYnJlYWsgfVxuICAgICAgbGFzdENvZGUgPSBjb2RlO1xuICAgICAgdG90YWwgPSB0b3RhbCAqIHJhZGl4ICsgdmFsO1xuICAgIH1cblxuICAgIGlmIChhbGxvd1NlcGFyYXRvcnMgJiYgbGFzdENvZGUgPT09IDk1KSB7IHRoaXMucmFpc2VSZWNvdmVyYWJsZSh0aGlzLnBvcyAtIDEsIFwiTnVtZXJpYyBzZXBhcmF0b3IgaXMgbm90IGFsbG93ZWQgYXQgdGhlIGxhc3Qgb2YgZGlnaXRzXCIpOyB9XG4gICAgaWYgKHRoaXMucG9zID09PSBzdGFydCB8fCBsZW4gIT0gbnVsbCAmJiB0aGlzLnBvcyAtIHN0YXJ0ICE9PSBsZW4pIHsgcmV0dXJuIG51bGwgfVxuXG4gICAgcmV0dXJuIHRvdGFsXG4gIH07XG5cbiAgZnVuY3Rpb24gc3RyaW5nVG9OdW1iZXIoc3RyLCBpc0xlZ2FjeU9jdGFsTnVtZXJpY0xpdGVyYWwpIHtcbiAgICBpZiAoaXNMZWdhY3lPY3RhbE51bWVyaWNMaXRlcmFsKSB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQoc3RyLCA4KVxuICAgIH1cblxuICAgIC8vIGBwYXJzZUZsb2F0KHZhbHVlKWAgc3RvcHMgcGFyc2luZyBhdCB0aGUgZmlyc3QgbnVtZXJpYyBzZXBhcmF0b3IgdGhlbiByZXR1cm5zIGEgd3JvbmcgdmFsdWUuXG4gICAgcmV0dXJuIHBhcnNlRmxvYXQoc3RyLnJlcGxhY2UoL18vZywgXCJcIikpXG4gIH1cblxuICBmdW5jdGlvbiBzdHJpbmdUb0JpZ0ludChzdHIpIHtcbiAgICBpZiAodHlwZW9mIEJpZ0ludCAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIC8vIGBCaWdJbnQodmFsdWUpYCB0aHJvd3Mgc3ludGF4IGVycm9yIGlmIHRoZSBzdHJpbmcgY29udGFpbnMgbnVtZXJpYyBzZXBhcmF0b3JzLlxuICAgIHJldHVybiBCaWdJbnQoc3RyLnJlcGxhY2UoL18vZywgXCJcIikpXG4gIH1cblxuICBwcC5yZWFkUmFkaXhOdW1iZXIgPSBmdW5jdGlvbihyYWRpeCkge1xuICAgIHZhciBzdGFydCA9IHRoaXMucG9zO1xuICAgIHRoaXMucG9zICs9IDI7IC8vIDB4XG4gICAgdmFyIHZhbCA9IHRoaXMucmVhZEludChyYWRpeCk7XG4gICAgaWYgKHZhbCA9PSBudWxsKSB7IHRoaXMucmFpc2UodGhpcy5zdGFydCArIDIsIFwiRXhwZWN0ZWQgbnVtYmVyIGluIHJhZGl4IFwiICsgcmFkaXgpOyB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSAxMSAmJiB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MpID09PSAxMTApIHtcbiAgICAgIHZhbCA9IHN0cmluZ1RvQmlnSW50KHRoaXMuaW5wdXQuc2xpY2Uoc3RhcnQsIHRoaXMucG9zKSk7XG4gICAgICArK3RoaXMucG9zO1xuICAgIH0gZWxzZSBpZiAoaXNJZGVudGlmaWVyU3RhcnQodGhpcy5mdWxsQ2hhckNvZGVBdFBvcygpKSkgeyB0aGlzLnJhaXNlKHRoaXMucG9zLCBcIklkZW50aWZpZXIgZGlyZWN0bHkgYWZ0ZXIgbnVtYmVyXCIpOyB9XG4gICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5udW0sIHZhbClcbiAgfTtcblxuICAvLyBSZWFkIGFuIGludGVnZXIsIG9jdGFsIGludGVnZXIsIG9yIGZsb2F0aW5nLXBvaW50IG51bWJlci5cblxuICBwcC5yZWFkTnVtYmVyID0gZnVuY3Rpb24oc3RhcnRzV2l0aERvdCkge1xuICAgIHZhciBzdGFydCA9IHRoaXMucG9zO1xuICAgIGlmICghc3RhcnRzV2l0aERvdCAmJiB0aGlzLnJlYWRJbnQoMTAsIHVuZGVmaW5lZCwgdHJ1ZSkgPT09IG51bGwpIHsgdGhpcy5yYWlzZShzdGFydCwgXCJJbnZhbGlkIG51bWJlclwiKTsgfVxuICAgIHZhciBvY3RhbCA9IHRoaXMucG9zIC0gc3RhcnQgPj0gMiAmJiB0aGlzLmlucHV0LmNoYXJDb2RlQXQoc3RhcnQpID09PSA0ODtcbiAgICBpZiAob2N0YWwgJiYgdGhpcy5zdHJpY3QpIHsgdGhpcy5yYWlzZShzdGFydCwgXCJJbnZhbGlkIG51bWJlclwiKTsgfVxuICAgIHZhciBuZXh0ID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zKTtcbiAgICBpZiAoIW9jdGFsICYmICFzdGFydHNXaXRoRG90ICYmIHRoaXMub3B0aW9ucy5lY21hVmVyc2lvbiA+PSAxMSAmJiBuZXh0ID09PSAxMTApIHtcbiAgICAgIHZhciB2YWwkMSA9IHN0cmluZ1RvQmlnSW50KHRoaXMuaW5wdXQuc2xpY2Uoc3RhcnQsIHRoaXMucG9zKSk7XG4gICAgICArK3RoaXMucG9zO1xuICAgICAgaWYgKGlzSWRlbnRpZmllclN0YXJ0KHRoaXMuZnVsbENoYXJDb2RlQXRQb3MoKSkpIHsgdGhpcy5yYWlzZSh0aGlzLnBvcywgXCJJZGVudGlmaWVyIGRpcmVjdGx5IGFmdGVyIG51bWJlclwiKTsgfVxuICAgICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5udW0sIHZhbCQxKVxuICAgIH1cbiAgICBpZiAob2N0YWwgJiYgL1s4OV0vLnRlc3QodGhpcy5pbnB1dC5zbGljZShzdGFydCwgdGhpcy5wb3MpKSkgeyBvY3RhbCA9IGZhbHNlOyB9XG4gICAgaWYgKG5leHQgPT09IDQ2ICYmICFvY3RhbCkgeyAvLyAnLidcbiAgICAgICsrdGhpcy5wb3M7XG4gICAgICB0aGlzLnJlYWRJbnQoMTApO1xuICAgICAgbmV4dCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyk7XG4gICAgfVxuICAgIGlmICgobmV4dCA9PT0gNjkgfHwgbmV4dCA9PT0gMTAxKSAmJiAhb2N0YWwpIHsgLy8gJ2VFJ1xuICAgICAgbmV4dCA9IHRoaXMuaW5wdXQuY2hhckNvZGVBdCgrK3RoaXMucG9zKTtcbiAgICAgIGlmIChuZXh0ID09PSA0MyB8fCBuZXh0ID09PSA0NSkgeyArK3RoaXMucG9zOyB9IC8vICcrLSdcbiAgICAgIGlmICh0aGlzLnJlYWRJbnQoMTApID09PSBudWxsKSB7IHRoaXMucmFpc2Uoc3RhcnQsIFwiSW52YWxpZCBudW1iZXJcIik7IH1cbiAgICB9XG4gICAgaWYgKGlzSWRlbnRpZmllclN0YXJ0KHRoaXMuZnVsbENoYXJDb2RlQXRQb3MoKSkpIHsgdGhpcy5yYWlzZSh0aGlzLnBvcywgXCJJZGVudGlmaWVyIGRpcmVjdGx5IGFmdGVyIG51bWJlclwiKTsgfVxuXG4gICAgdmFyIHZhbCA9IHN0cmluZ1RvTnVtYmVyKHRoaXMuaW5wdXQuc2xpY2Uoc3RhcnQsIHRoaXMucG9zKSwgb2N0YWwpO1xuICAgIHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGVzJDEubnVtLCB2YWwpXG4gIH07XG5cbiAgLy8gUmVhZCBhIHN0cmluZyB2YWx1ZSwgaW50ZXJwcmV0aW5nIGJhY2tzbGFzaC1lc2NhcGVzLlxuXG4gIHBwLnJlYWRDb2RlUG9pbnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2ggPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MpLCBjb2RlO1xuXG4gICAgaWYgKGNoID09PSAxMjMpIHsgLy8gJ3snXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uIDwgNikgeyB0aGlzLnVuZXhwZWN0ZWQoKTsgfVxuICAgICAgdmFyIGNvZGVQb3MgPSArK3RoaXMucG9zO1xuICAgICAgY29kZSA9IHRoaXMucmVhZEhleENoYXIodGhpcy5pbnB1dC5pbmRleE9mKFwifVwiLCB0aGlzLnBvcykgLSB0aGlzLnBvcyk7XG4gICAgICArK3RoaXMucG9zO1xuICAgICAgaWYgKGNvZGUgPiAweDEwRkZGRikgeyB0aGlzLmludmFsaWRTdHJpbmdUb2tlbihjb2RlUG9zLCBcIkNvZGUgcG9pbnQgb3V0IG9mIGJvdW5kc1wiKTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb2RlID0gdGhpcy5yZWFkSGV4Q2hhcig0KTtcbiAgICB9XG4gICAgcmV0dXJuIGNvZGVcbiAgfTtcblxuICBwcC5yZWFkU3RyaW5nID0gZnVuY3Rpb24ocXVvdGUpIHtcbiAgICB2YXIgb3V0ID0gXCJcIiwgY2h1bmtTdGFydCA9ICsrdGhpcy5wb3M7XG4gICAgZm9yICg7Oykge1xuICAgICAgaWYgKHRoaXMucG9zID49IHRoaXMuaW5wdXQubGVuZ3RoKSB7IHRoaXMucmFpc2UodGhpcy5zdGFydCwgXCJVbnRlcm1pbmF0ZWQgc3RyaW5nIGNvbnN0YW50XCIpOyB9XG4gICAgICB2YXIgY2ggPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQodGhpcy5wb3MpO1xuICAgICAgaWYgKGNoID09PSBxdW90ZSkgeyBicmVhayB9XG4gICAgICBpZiAoY2ggPT09IDkyKSB7IC8vICdcXCdcbiAgICAgICAgb3V0ICs9IHRoaXMuaW5wdXQuc2xpY2UoY2h1bmtTdGFydCwgdGhpcy5wb3MpO1xuICAgICAgICBvdXQgKz0gdGhpcy5yZWFkRXNjYXBlZENoYXIoZmFsc2UpO1xuICAgICAgICBjaHVua1N0YXJ0ID0gdGhpcy5wb3M7XG4gICAgICB9IGVsc2UgaWYgKGNoID09PSAweDIwMjggfHwgY2ggPT09IDB4MjAyOSkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uIDwgMTApIHsgdGhpcy5yYWlzZSh0aGlzLnN0YXJ0LCBcIlVudGVybWluYXRlZCBzdHJpbmcgY29uc3RhbnRcIik7IH1cbiAgICAgICAgKyt0aGlzLnBvcztcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb2NhdGlvbnMpIHtcbiAgICAgICAgICB0aGlzLmN1ckxpbmUrKztcbiAgICAgICAgICB0aGlzLmxpbmVTdGFydCA9IHRoaXMucG9zO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNOZXdMaW5lKGNoKSkgeyB0aGlzLnJhaXNlKHRoaXMuc3RhcnQsIFwiVW50ZXJtaW5hdGVkIHN0cmluZyBjb25zdGFudFwiKTsgfVxuICAgICAgICArK3RoaXMucG9zO1xuICAgICAgfVxuICAgIH1cbiAgICBvdXQgKz0gdGhpcy5pbnB1dC5zbGljZShjaHVua1N0YXJ0LCB0aGlzLnBvcysrKTtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hUb2tlbih0eXBlcyQxLnN0cmluZywgb3V0KVxuICB9O1xuXG4gIC8vIFJlYWRzIHRlbXBsYXRlIHN0cmluZyB0b2tlbnMuXG5cbiAgdmFyIElOVkFMSURfVEVNUExBVEVfRVNDQVBFX0VSUk9SID0ge307XG5cbiAgcHAudHJ5UmVhZFRlbXBsYXRlVG9rZW4gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmluVGVtcGxhdGVFbGVtZW50ID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5yZWFkVG1wbFRva2VuKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyID09PSBJTlZBTElEX1RFTVBMQVRFX0VTQ0FQRV9FUlJPUikge1xuICAgICAgICB0aGlzLnJlYWRJbnZhbGlkVGVtcGxhdGVUb2tlbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5pblRlbXBsYXRlRWxlbWVudCA9IGZhbHNlO1xuICB9O1xuXG4gIHBwLmludmFsaWRTdHJpbmdUb2tlbiA9IGZ1bmN0aW9uKHBvc2l0aW9uLCBtZXNzYWdlKSB7XG4gICAgaWYgKHRoaXMuaW5UZW1wbGF0ZUVsZW1lbnQgJiYgdGhpcy5vcHRpb25zLmVjbWFWZXJzaW9uID49IDkpIHtcbiAgICAgIHRocm93IElOVkFMSURfVEVNUExBVEVfRVNDQVBFX0VSUk9SXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmFpc2UocG9zaXRpb24sIG1lc3NhZ2UpO1xuICAgIH1cbiAgfTtcblxuICBwcC5yZWFkVG1wbFRva2VuID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IFwiXCIsIGNodW5rU3RhcnQgPSB0aGlzLnBvcztcbiAgICBmb3IgKDs7KSB7XG4gICAgICBpZiAodGhpcy5wb3MgPj0gdGhpcy5pbnB1dC5sZW5ndGgpIHsgdGhpcy5yYWlzZSh0aGlzLnN0YXJ0LCBcIlVudGVybWluYXRlZCB0ZW1wbGF0ZVwiKTsgfVxuICAgICAgdmFyIGNoID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zKTtcbiAgICAgIGlmIChjaCA9PT0gOTYgfHwgY2ggPT09IDM2ICYmIHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcyArIDEpID09PSAxMjMpIHsgLy8gJ2AnLCAnJHsnXG4gICAgICAgIGlmICh0aGlzLnBvcyA9PT0gdGhpcy5zdGFydCAmJiAodGhpcy50eXBlID09PSB0eXBlcyQxLnRlbXBsYXRlIHx8IHRoaXMudHlwZSA9PT0gdHlwZXMkMS5pbnZhbGlkVGVtcGxhdGUpKSB7XG4gICAgICAgICAgaWYgKGNoID09PSAzNikge1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gMjtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGVzJDEuZG9sbGFyQnJhY2VMKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICArK3RoaXMucG9zO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5iYWNrUXVvdGUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG91dCArPSB0aGlzLmlucHV0LnNsaWNlKGNodW5rU3RhcnQsIHRoaXMucG9zKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS50ZW1wbGF0ZSwgb3V0KVxuICAgICAgfVxuICAgICAgaWYgKGNoID09PSA5MikgeyAvLyAnXFwnXG4gICAgICAgIG91dCArPSB0aGlzLmlucHV0LnNsaWNlKGNodW5rU3RhcnQsIHRoaXMucG9zKTtcbiAgICAgICAgb3V0ICs9IHRoaXMucmVhZEVzY2FwZWRDaGFyKHRydWUpO1xuICAgICAgICBjaHVua1N0YXJ0ID0gdGhpcy5wb3M7XG4gICAgICB9IGVsc2UgaWYgKGlzTmV3TGluZShjaCkpIHtcbiAgICAgICAgb3V0ICs9IHRoaXMuaW5wdXQuc2xpY2UoY2h1bmtTdGFydCwgdGhpcy5wb3MpO1xuICAgICAgICArK3RoaXMucG9zO1xuICAgICAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgaWYgKHRoaXMuaW5wdXQuY2hhckNvZGVBdCh0aGlzLnBvcykgPT09IDEwKSB7ICsrdGhpcy5wb3M7IH1cbiAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICBvdXQgKz0gXCJcXG5cIjtcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIG91dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoKTtcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubG9jYXRpb25zKSB7XG4gICAgICAgICAgKyt0aGlzLmN1ckxpbmU7XG4gICAgICAgICAgdGhpcy5saW5lU3RhcnQgPSB0aGlzLnBvcztcbiAgICAgICAgfVxuICAgICAgICBjaHVua1N0YXJ0ID0gdGhpcy5wb3M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICArK3RoaXMucG9zO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBSZWFkcyBhIHRlbXBsYXRlIHRva2VuIHRvIHNlYXJjaCBmb3IgdGhlIGVuZCwgd2l0aG91dCB2YWxpZGF0aW5nIGFueSBlc2NhcGUgc2VxdWVuY2VzXG4gIHBwLnJlYWRJbnZhbGlkVGVtcGxhdGVUb2tlbiA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAoOyB0aGlzLnBvcyA8IHRoaXMuaW5wdXQubGVuZ3RoOyB0aGlzLnBvcysrKSB7XG4gICAgICBzd2l0Y2ggKHRoaXMuaW5wdXRbdGhpcy5wb3NdKSB7XG4gICAgICBjYXNlIFwiXFxcXFwiOlxuICAgICAgICArK3RoaXMucG9zO1xuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlIFwiJFwiOlxuICAgICAgICBpZiAodGhpcy5pbnB1dFt0aGlzLnBvcyArIDFdICE9PSBcIntcIikge1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cblxuICAgICAgLy8gZmFsbHMgdGhyb3VnaFxuICAgICAgY2FzZSBcImBcIjpcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluaXNoVG9rZW4odHlwZXMkMS5pbnZhbGlkVGVtcGxhdGUsIHRoaXMuaW5wdXQuc2xpY2UodGhpcy5zdGFydCwgdGhpcy5wb3MpKVxuXG4gICAgICAvLyBubyBkZWZhdWx0XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucmFpc2UodGhpcy5zdGFydCwgXCJVbnRlcm1pbmF0ZWQgdGVtcGxhdGVcIik7XG4gIH07XG5cbiAgLy8gVXNlZCB0byByZWFkIGVzY2FwZWQgY2hhcmFjdGVyc1xuXG4gIHBwLnJlYWRFc2NhcGVkQ2hhciA9IGZ1bmN0aW9uKGluVGVtcGxhdGUpIHtcbiAgICB2YXIgY2ggPSB0aGlzLmlucHV0LmNoYXJDb2RlQXQoKyt0aGlzLnBvcyk7XG4gICAgKyt0aGlzLnBvcztcbiAgICBzd2l0Y2ggKGNoKSB7XG4gICAgY2FzZSAxMTA6IHJldHVybiBcIlxcblwiIC8vICduJyAtPiAnXFxuJ1xuICAgIGNhc2UgMTE0OiByZXR1cm4gXCJcXHJcIiAvLyAncicgLT4gJ1xccidcbiAgICBjYXNlIDEyMDogcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy5yZWFkSGV4Q2hhcigyKSkgLy8gJ3gnXG4gICAgY2FzZSAxMTc6IHJldHVybiBjb2RlUG9pbnRUb1N0cmluZyh0aGlzLnJlYWRDb2RlUG9pbnQoKSkgLy8gJ3UnXG4gICAgY2FzZSAxMTY6IHJldHVybiBcIlxcdFwiIC8vICd0JyAtPiAnXFx0J1xuICAgIGNhc2UgOTg6IHJldHVybiBcIlxcYlwiIC8vICdiJyAtPiAnXFxiJ1xuICAgIGNhc2UgMTE4OiByZXR1cm4gXCJcXHUwMDBiXCIgLy8gJ3YnIC0+ICdcXHUwMDBiJ1xuICAgIGNhc2UgMTAyOiByZXR1cm4gXCJcXGZcIiAvLyAnZicgLT4gJ1xcZidcbiAgICBjYXNlIDEzOiBpZiAodGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zKSA9PT0gMTApIHsgKyt0aGlzLnBvczsgfSAvLyAnXFxyXFxuJ1xuICAgIGNhc2UgMTA6IC8vICcgXFxuJ1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb2NhdGlvbnMpIHsgdGhpcy5saW5lU3RhcnQgPSB0aGlzLnBvczsgKyt0aGlzLmN1ckxpbmU7IH1cbiAgICAgIHJldHVybiBcIlwiXG4gICAgY2FzZSA1NjpcbiAgICBjYXNlIDU3OlxuICAgICAgaWYgKHRoaXMuc3RyaWN0KSB7XG4gICAgICAgIHRoaXMuaW52YWxpZFN0cmluZ1Rva2VuKFxuICAgICAgICAgIHRoaXMucG9zIC0gMSxcbiAgICAgICAgICBcIkludmFsaWQgZXNjYXBlIHNlcXVlbmNlXCJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChpblRlbXBsYXRlKSB7XG4gICAgICAgIHZhciBjb2RlUG9zID0gdGhpcy5wb3MgLSAxO1xuXG4gICAgICAgIHRoaXMuaW52YWxpZFN0cmluZ1Rva2VuKFxuICAgICAgICAgIGNvZGVQb3MsXG4gICAgICAgICAgXCJJbnZhbGlkIGVzY2FwZSBzZXF1ZW5jZSBpbiB0ZW1wbGF0ZSBzdHJpbmdcIlxuICAgICAgICApO1xuICAgICAgfVxuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAoY2ggPj0gNDggJiYgY2ggPD0gNTUpIHtcbiAgICAgICAgdmFyIG9jdGFsU3RyID0gdGhpcy5pbnB1dC5zdWJzdHIodGhpcy5wb3MgLSAxLCAzKS5tYXRjaCgvXlswLTddKy8pWzBdO1xuICAgICAgICB2YXIgb2N0YWwgPSBwYXJzZUludChvY3RhbFN0ciwgOCk7XG4gICAgICAgIGlmIChvY3RhbCA+IDI1NSkge1xuICAgICAgICAgIG9jdGFsU3RyID0gb2N0YWxTdHIuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgIG9jdGFsID0gcGFyc2VJbnQob2N0YWxTdHIsIDgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9zICs9IG9jdGFsU3RyLmxlbmd0aCAtIDE7XG4gICAgICAgIGNoID0gdGhpcy5pbnB1dC5jaGFyQ29kZUF0KHRoaXMucG9zKTtcbiAgICAgICAgaWYgKChvY3RhbFN0ciAhPT0gXCIwXCIgfHwgY2ggPT09IDU2IHx8IGNoID09PSA1NykgJiYgKHRoaXMuc3RyaWN0IHx8IGluVGVtcGxhdGUpKSB7XG4gICAgICAgICAgdGhpcy5pbnZhbGlkU3RyaW5nVG9rZW4oXG4gICAgICAgICAgICB0aGlzLnBvcyAtIDEgLSBvY3RhbFN0ci5sZW5ndGgsXG4gICAgICAgICAgICBpblRlbXBsYXRlXG4gICAgICAgICAgICAgID8gXCJPY3RhbCBsaXRlcmFsIGluIHRlbXBsYXRlIHN0cmluZ1wiXG4gICAgICAgICAgICAgIDogXCJPY3RhbCBsaXRlcmFsIGluIHN0cmljdCBtb2RlXCJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKG9jdGFsKVxuICAgICAgfVxuICAgICAgaWYgKGlzTmV3TGluZShjaCkpIHtcbiAgICAgICAgLy8gVW5pY29kZSBuZXcgbGluZSBjaGFyYWN0ZXJzIGFmdGVyIFxcIGdldCByZW1vdmVkIGZyb20gb3V0cHV0IGluIGJvdGhcbiAgICAgICAgLy8gdGVtcGxhdGUgbGl0ZXJhbHMgYW5kIHN0cmluZ3NcbiAgICAgICAgcmV0dXJuIFwiXCJcbiAgICAgIH1cbiAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoKVxuICAgIH1cbiAgfTtcblxuICAvLyBVc2VkIHRvIHJlYWQgY2hhcmFjdGVyIGVzY2FwZSBzZXF1ZW5jZXMgKCdcXHgnLCAnXFx1JywgJ1xcVScpLlxuXG4gIHBwLnJlYWRIZXhDaGFyID0gZnVuY3Rpb24obGVuKSB7XG4gICAgdmFyIGNvZGVQb3MgPSB0aGlzLnBvcztcbiAgICB2YXIgbiA9IHRoaXMucmVhZEludCgxNiwgbGVuKTtcbiAgICBpZiAobiA9PT0gbnVsbCkgeyB0aGlzLmludmFsaWRTdHJpbmdUb2tlbihjb2RlUG9zLCBcIkJhZCBjaGFyYWN0ZXIgZXNjYXBlIHNlcXVlbmNlXCIpOyB9XG4gICAgcmV0dXJuIG5cbiAgfTtcblxuICAvLyBSZWFkIGFuIGlkZW50aWZpZXIsIGFuZCByZXR1cm4gaXQgYXMgYSBzdHJpbmcuIFNldHMgYHRoaXMuY29udGFpbnNFc2NgXG4gIC8vIHRvIHdoZXRoZXIgdGhlIHdvcmQgY29udGFpbmVkIGEgJ1xcdScgZXNjYXBlLlxuICAvL1xuICAvLyBJbmNyZW1lbnRhbGx5IGFkZHMgb25seSBlc2NhcGVkIGNoYXJzLCBhZGRpbmcgb3RoZXIgY2h1bmtzIGFzLWlzXG4gIC8vIGFzIGEgbWljcm8tb3B0aW1pemF0aW9uLlxuXG4gIHBwLnJlYWRXb3JkMSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY29udGFpbnNFc2MgPSBmYWxzZTtcbiAgICB2YXIgd29yZCA9IFwiXCIsIGZpcnN0ID0gdHJ1ZSwgY2h1bmtTdGFydCA9IHRoaXMucG9zO1xuICAgIHZhciBhc3RyYWwgPSB0aGlzLm9wdGlvbnMuZWNtYVZlcnNpb24gPj0gNjtcbiAgICB3aGlsZSAodGhpcy5wb3MgPCB0aGlzLmlucHV0Lmxlbmd0aCkge1xuICAgICAgdmFyIGNoID0gdGhpcy5mdWxsQ2hhckNvZGVBdFBvcygpO1xuICAgICAgaWYgKGlzSWRlbnRpZmllckNoYXIoY2gsIGFzdHJhbCkpIHtcbiAgICAgICAgdGhpcy5wb3MgKz0gY2ggPD0gMHhmZmZmID8gMSA6IDI7XG4gICAgICB9IGVsc2UgaWYgKGNoID09PSA5MikgeyAvLyBcIlxcXCJcbiAgICAgICAgdGhpcy5jb250YWluc0VzYyA9IHRydWU7XG4gICAgICAgIHdvcmQgKz0gdGhpcy5pbnB1dC5zbGljZShjaHVua1N0YXJ0LCB0aGlzLnBvcyk7XG4gICAgICAgIHZhciBlc2NTdGFydCA9IHRoaXMucG9zO1xuICAgICAgICBpZiAodGhpcy5pbnB1dC5jaGFyQ29kZUF0KCsrdGhpcy5wb3MpICE9PSAxMTcpIC8vIFwidVwiXG4gICAgICAgICAgeyB0aGlzLmludmFsaWRTdHJpbmdUb2tlbih0aGlzLnBvcywgXCJFeHBlY3RpbmcgVW5pY29kZSBlc2NhcGUgc2VxdWVuY2UgXFxcXHVYWFhYXCIpOyB9XG4gICAgICAgICsrdGhpcy5wb3M7XG4gICAgICAgIHZhciBlc2MgPSB0aGlzLnJlYWRDb2RlUG9pbnQoKTtcbiAgICAgICAgaWYgKCEoZmlyc3QgPyBpc0lkZW50aWZpZXJTdGFydCA6IGlzSWRlbnRpZmllckNoYXIpKGVzYywgYXN0cmFsKSlcbiAgICAgICAgICB7IHRoaXMuaW52YWxpZFN0cmluZ1Rva2VuKGVzY1N0YXJ0LCBcIkludmFsaWQgVW5pY29kZSBlc2NhcGVcIik7IH1cbiAgICAgICAgd29yZCArPSBjb2RlUG9pbnRUb1N0cmluZyhlc2MpO1xuICAgICAgICBjaHVua1N0YXJ0ID0gdGhpcy5wb3M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHdvcmQgKyB0aGlzLmlucHV0LnNsaWNlKGNodW5rU3RhcnQsIHRoaXMucG9zKVxuICB9O1xuXG4gIC8vIFJlYWQgYW4gaWRlbnRpZmllciBvciBrZXl3b3JkIHRva2VuLiBXaWxsIGNoZWNrIGZvciByZXNlcnZlZFxuICAvLyB3b3JkcyB3aGVuIG5lY2Vzc2FyeS5cblxuICBwcC5yZWFkV29yZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB3b3JkID0gdGhpcy5yZWFkV29yZDEoKTtcbiAgICB2YXIgdHlwZSA9IHR5cGVzJDEubmFtZTtcbiAgICBpZiAodGhpcy5rZXl3b3Jkcy50ZXN0KHdvcmQpKSB7XG4gICAgICB0eXBlID0ga2V5d29yZHNbd29yZF07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaFRva2VuKHR5cGUsIHdvcmQpXG4gIH07XG5cbiAgLy8gQWNvcm4gaXMgYSB0aW55LCBmYXN0IEphdmFTY3JpcHQgcGFyc2VyIHdyaXR0ZW4gaW4gSmF2YVNjcmlwdC5cbiAgLy9cbiAgLy8gQWNvcm4gd2FzIHdyaXR0ZW4gYnkgTWFyaWpuIEhhdmVyYmVrZSwgSW5ndmFyIFN0ZXBhbnlhbiwgYW5kXG4gIC8vIHZhcmlvdXMgY29udHJpYnV0b3JzIGFuZCByZWxlYXNlZCB1bmRlciBhbiBNSVQgbGljZW5zZS5cbiAgLy9cbiAgLy8gR2l0IHJlcG9zaXRvcmllcyBmb3IgQWNvcm4gYXJlIGF2YWlsYWJsZSBhdFxuICAvL1xuICAvLyAgICAgaHR0cDovL21hcmlqbmhhdmVyYmVrZS5ubC9naXQvYWNvcm5cbiAgLy8gICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hY29ybmpzL2Fjb3JuLmdpdFxuICAvL1xuICAvLyBQbGVhc2UgdXNlIHRoZSBbZ2l0aHViIGJ1ZyB0cmFja2VyXVtnaGJ0XSB0byByZXBvcnQgaXNzdWVzLlxuICAvL1xuICAvLyBbZ2hidF06IGh0dHBzOi8vZ2l0aHViLmNvbS9hY29ybmpzL2Fjb3JuL2lzc3Vlc1xuICAvL1xuICAvLyBbd2Fsa106IHV0aWwvd2Fsay5qc1xuXG5cbiAgdmFyIHZlcnNpb24gPSBcIjguMTAuMFwiO1xuXG4gIFBhcnNlci5hY29ybiA9IHtcbiAgICBQYXJzZXI6IFBhcnNlcixcbiAgICB2ZXJzaW9uOiB2ZXJzaW9uLFxuICAgIGRlZmF1bHRPcHRpb25zOiBkZWZhdWx0T3B0aW9ucyxcbiAgICBQb3NpdGlvbjogUG9zaXRpb24sXG4gICAgU291cmNlTG9jYXRpb246IFNvdXJjZUxvY2F0aW9uLFxuICAgIGdldExpbmVJbmZvOiBnZXRMaW5lSW5mbyxcbiAgICBOb2RlOiBOb2RlLFxuICAgIFRva2VuVHlwZTogVG9rZW5UeXBlLFxuICAgIHRva1R5cGVzOiB0eXBlcyQxLFxuICAgIGtleXdvcmRUeXBlczoga2V5d29yZHMsXG4gICAgVG9rQ29udGV4dDogVG9rQ29udGV4dCxcbiAgICB0b2tDb250ZXh0czogdHlwZXMsXG4gICAgaXNJZGVudGlmaWVyQ2hhcjogaXNJZGVudGlmaWVyQ2hhcixcbiAgICBpc0lkZW50aWZpZXJTdGFydDogaXNJZGVudGlmaWVyU3RhcnQsXG4gICAgVG9rZW46IFRva2VuLFxuICAgIGlzTmV3TGluZTogaXNOZXdMaW5lLFxuICAgIGxpbmVCcmVhazogbGluZUJyZWFrLFxuICAgIGxpbmVCcmVha0c6IGxpbmVCcmVha0csXG4gICAgbm9uQVNDSUl3aGl0ZXNwYWNlOiBub25BU0NJSXdoaXRlc3BhY2VcbiAgfTtcblxuICAvLyBUaGUgbWFpbiBleHBvcnRlZCBpbnRlcmZhY2UgKHVuZGVyIGBzZWxmLmFjb3JuYCB3aGVuIGluIHRoZVxuICAvLyBicm93c2VyKSBpcyBhIGBwYXJzZWAgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIGNvZGUgc3RyaW5nIGFuZFxuICAvLyByZXR1cm5zIGFuIGFic3RyYWN0IHN5bnRheCB0cmVlIGFzIHNwZWNpZmllZCBieSBbTW96aWxsYSBwYXJzZXJcbiAgLy8gQVBJXVthcGldLlxuICAvL1xuICAvLyBbYXBpXTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9TcGlkZXJNb25rZXkvUGFyc2VyX0FQSVxuXG4gIGZ1bmN0aW9uIHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIFBhcnNlci5wYXJzZShpbnB1dCwgb3B0aW9ucylcbiAgfVxuXG4gIC8vIFRoaXMgZnVuY3Rpb24gdHJpZXMgdG8gcGFyc2UgYSBzaW5nbGUgZXhwcmVzc2lvbiBhdCBhIGdpdmVuXG4gIC8vIG9mZnNldCBpbiBhIHN0cmluZy4gVXNlZnVsIGZvciBwYXJzaW5nIG1peGVkLWxhbmd1YWdlIGZvcm1hdHNcbiAgLy8gdGhhdCBlbWJlZCBKYXZhU2NyaXB0IGV4cHJlc3Npb25zLlxuXG4gIGZ1bmN0aW9uIHBhcnNlRXhwcmVzc2lvbkF0KGlucHV0LCBwb3MsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gUGFyc2VyLnBhcnNlRXhwcmVzc2lvbkF0KGlucHV0LCBwb3MsIG9wdGlvbnMpXG4gIH1cblxuICAvLyBBY29ybiBpcyBvcmdhbml6ZWQgYXMgYSB0b2tlbml6ZXIgYW5kIGEgcmVjdXJzaXZlLWRlc2NlbnQgcGFyc2VyLlxuICAvLyBUaGUgYHRva2VuaXplcmAgZXhwb3J0IHByb3ZpZGVzIGFuIGludGVyZmFjZSB0byB0aGUgdG9rZW5pemVyLlxuXG4gIGZ1bmN0aW9uIHRva2VuaXplcihpbnB1dCwgb3B0aW9ucykge1xuICAgIHJldHVybiBQYXJzZXIudG9rZW5pemVyKGlucHV0LCBvcHRpb25zKVxuICB9XG5cbiAgZXhwb3J0cy5Ob2RlID0gTm9kZTtcbiAgZXhwb3J0cy5QYXJzZXIgPSBQYXJzZXI7XG4gIGV4cG9ydHMuUG9zaXRpb24gPSBQb3NpdGlvbjtcbiAgZXhwb3J0cy5Tb3VyY2VMb2NhdGlvbiA9IFNvdXJjZUxvY2F0aW9uO1xuICBleHBvcnRzLlRva0NvbnRleHQgPSBUb2tDb250ZXh0O1xuICBleHBvcnRzLlRva2VuID0gVG9rZW47XG4gIGV4cG9ydHMuVG9rZW5UeXBlID0gVG9rZW5UeXBlO1xuICBleHBvcnRzLmRlZmF1bHRPcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XG4gIGV4cG9ydHMuZ2V0TGluZUluZm8gPSBnZXRMaW5lSW5mbztcbiAgZXhwb3J0cy5pc0lkZW50aWZpZXJDaGFyID0gaXNJZGVudGlmaWVyQ2hhcjtcbiAgZXhwb3J0cy5pc0lkZW50aWZpZXJTdGFydCA9IGlzSWRlbnRpZmllclN0YXJ0O1xuICBleHBvcnRzLmlzTmV3TGluZSA9IGlzTmV3TGluZTtcbiAgZXhwb3J0cy5rZXl3b3JkVHlwZXMgPSBrZXl3b3JkcztcbiAgZXhwb3J0cy5saW5lQnJlYWsgPSBsaW5lQnJlYWs7XG4gIGV4cG9ydHMubGluZUJyZWFrRyA9IGxpbmVCcmVha0c7XG4gIGV4cG9ydHMubm9uQVNDSUl3aGl0ZXNwYWNlID0gbm9uQVNDSUl3aGl0ZXNwYWNlO1xuICBleHBvcnRzLnBhcnNlID0gcGFyc2U7XG4gIGV4cG9ydHMucGFyc2VFeHByZXNzaW9uQXQgPSBwYXJzZUV4cHJlc3Npb25BdDtcbiAgZXhwb3J0cy50b2tDb250ZXh0cyA9IHR5cGVzO1xuICBleHBvcnRzLnRva1R5cGVzID0gdHlwZXMkMTtcbiAgZXhwb3J0cy50b2tlbml6ZXIgPSB0b2tlbml6ZXI7XG4gIGV4cG9ydHMudmVyc2lvbiA9IHZlcnNpb247XG5cbn0pKTtcbiIsIlxuaW1wb3J0IE1vZHVsZSBmcm9tICcuL01vZHVsZSdcbmltcG9ydCBVdGlscyBmcm9tICcuL3V0aWxzL2luZGV4J1xuaW1wb3J0IElOYXRpdmUgZnJvbSAnLi9JTmF0aXZlJ1xuaW1wb3J0IENyZWF0dXJlIGZyb20gJy4vQ3JlYXR1cmUnXG5pbXBvcnQgQmFzZUVsZW1lbnQgZnJvbSAnLi9lbGVtZW50cy9CYXNlRWxlbWVudCdcblxuZXhwb3J0IGNsYXNzIFJ1bm5hYmxlIHtcblxuICAgIHJvb3Q6IEJhc2VFbGVtZW50XG4gICAgbW91bnQ6ICgpID0+IHZvaWRcblxuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEJhc2VFbGVtZW50LCBtb3VudDogKCkgPT4gdm9pZCkge1xuICAgICAgICB0aGlzLnJvb3QgPSByb290XG4gICAgICAgIHRoaXMubW91bnQgPSBtb3VudFxuICAgIH1cbn1cblxuY2xhc3MgQXBwbGV0IHtcblxuICAgIF9rZXk6IHN0cmluZ1xuICAgIHB1YmxpYyBnZXQga2V5KCkgeyByZXR1cm4gdGhpcy5fa2V5IH1cblxuICAgIF9nZW5lc2lzQ3JlYXR1cmU6IENyZWF0dXJlXG5cbiAgICBfbmF0aXZlQnVpbGRlcjogKG1vZDogTW9kdWxlKSA9PiBJTmF0aXZlXG5cbiAgICBwcml2YXRlIF9tb2R1bGVzOiB7IFtpZDogc3RyaW5nXTogTW9kdWxlIH1cbiAgICBwdWJsaWMgZmluZE1vZHVsZShpZDogc3RyaW5nKSB7IHJldHVybiB0aGlzLl9tb2R1bGVzW2lkXSB9XG4gICAgcHVibGljIHB1dE1vZHVsZShtb2R1bGU6IE1vZHVsZSkge1xuICAgICAgICBtb2R1bGUuc2V0QXBwbGV0KHRoaXMpXG4gICAgICAgIHRoaXMuX21vZHVsZXNbbW9kdWxlLmtleV0gPSBtb2R1bGVcbiAgICB9XG4gICAgcHVibGljIHJlbW92ZU1vZHVsZShrZXk6IHN0cmluZykgeyBkZWxldGUgdGhpcy5fbW9kdWxlc1trZXldIH1cblxuICAgIG1pZGRsZUNvZGU6IGFueVxuXG4gICAgcHVibGljIGZpbGwoanN4Q29kZTogYW55KSB7XG4gICAgICAgIHRoaXMubWlkZGxlQ29kZSA9IFV0aWxzLmNvbXBpbGVyLnBhcnNlKGpzeENvZGUpXG4gICAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHRoaXMubWlkZGxlQ29kZSkpXG4gICAgICAgIGxldCByID0gVXRpbHMuY29tcGlsZXIuZXh0cmFjdE1vZHVsZXModGhpcy5taWRkbGVDb2RlLCB0aGlzKTtcbiAgICAgICAgci5mb3JFYWNoKChtb2R1bGU6IE1vZHVsZSkgPT4gdGhpcy5wdXRNb2R1bGUobW9kdWxlKSlcbiAgICB9XG5cbiAgICBjYWNoZSA9IHtcbiAgICAgICAgZWxlbWVudHM6IHt9LFxuICAgICAgICBtb3VudHM6IFtdXG4gICAgfVxuXG4gICAgb2xkVmVyc2lvbnMgPSB7fVxuXG4gICAgb25DcmVhdHVyZVN0YXRlQ2hhbmdlKGNyZWF0dXJlOiBDcmVhdHVyZSwgbmV3VmVyc2lvbjogQmFzZUVsZW1lbnQpIHtcbiAgICAgICAgbGV0IG9sZFZlcnNpb24gPSB0aGlzLm9sZFZlcnNpb25zW2NyZWF0dXJlLl9rZXldXG4gICAgICAgIHRoaXMub2xkVmVyc2lvbnNbY3JlYXR1cmUuX2tleV0gPSBuZXdWZXJzaW9uXG4gICAgICAgIGxldCB1cGRhdGVzID0gVXRpbHMuanNvbi5kaWZmKG9sZFZlcnNpb24sIG5ld1ZlcnNpb24pXG4gICAgICAgIHVwZGF0ZXMuZm9yRWFjaCgodTogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAodS5fX2FjdGlvbl9fID09PSAnZWxlbWVudF9kZWxldGVkJykge1xuICAgICAgICAgICAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5jYWNoZS5lbGVtZW50cykuZmlsdGVyKGsgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoay5zdGFydHNXaXRoKHUuX19rZXlfXykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNhY2hlLmVsZW1lbnRzW2tdXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIGlmIChrZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXAgPSBrZXlzW2tleXMubGVuZ3RoIC0gMV0uc3BsaXQoJy0nKVxuICAgICAgICAgICAgICAgICAgICBpZiAodGVtcC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcDIgPSB0ZW1wLnNsaWNlKDAsIHRlbXAubGVuZ3RoIC0gMSkuam9pbignLScpXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5jYWNoZS5lbGVtZW50c1t0ZW1wMl1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy51cGRhdGUob2xkVmVyc2lvbi5fa2V5LCB1cGRhdGVzKVxuICAgIH1cblxuICAgIHVwZGF0ZTogKGtleTogc3RyaW5nLCB1OiBhbnkpID0+IHZvaWRcbiAgICBmaXJzdE1vdW50OiBib29sZWFuID0gZmFsc2U7XG5cbiAgICBwdWJsaWMgcnVuKGdlbmVzaXM6IHN0cmluZywgbmF0aXZlQnVpbGRlcjogKG1vZDogTW9kdWxlKSA9PiBJTmF0aXZlLCB1cGRhdGU6IChrZXk6IHN0cmluZywgdTogYW55KSA9PiB2b2lkKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMuX25hdGl2ZUJ1aWxkZXIgPSBuYXRpdmVCdWlsZGVyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZVxuICAgICAgICAgICAgdGhpcy5maXJzdE1vdW50ID0gZmFsc2VcbiAgICAgICAgICAgIHRoaXMuY2FjaGUuZWxlbWVudHMgPSB7fVxuICAgICAgICAgICAgdGhpcy5jYWNoZS5tb3VudHMgPSBbXVxuICAgICAgICAgICAgbGV0IGdlbmVzaXNNb2QgPSB0aGlzLl9tb2R1bGVzW2dlbmVzaXNdXG4gICAgICAgICAgICB0aGlzLl9nZW5lc2lzQ3JlYXR1cmUgPSBnZW5lc2lzTW9kLmluc3RhbnRpYXRlKClcbiAgICAgICAgICAgIGxldCBnZW5lc2lzTWV0YUNvbnRleHQgPSBVdGlscy5nZW5lcmF0b3IubmVzdGVkQ29udGV4dCh0aGlzLl9nZW5lc2lzQ3JlYXR1cmUpXG4gICAgICAgICAgICB0aGlzLmNhY2hlLm1vdW50cy5wdXNoKCgpID0+IHRoaXMuX2dlbmVzaXNDcmVhdHVyZS5nZXRCYXNlTWV0aG9kKCdvbk1vdW50JykoZ2VuZXNpc01ldGFDb250ZXh0KSlcbiAgICAgICAgICAgIHRoaXMuX2dlbmVzaXNDcmVhdHVyZS5nZXRCYXNlTWV0aG9kKCdjb25zdHJ1Y3RvcicpKGdlbmVzaXNNZXRhQ29udGV4dClcbiAgICAgICAgICAgIGxldCB2aWV3ID0gdGhpcy5fZ2VuZXNpc0NyZWF0dXJlLmdldEJhc2VNZXRob2QoJ3JlbmRlcicpKGdlbmVzaXNNZXRhQ29udGV4dClcbiAgICAgICAgICAgIHRoaXMub2xkVmVyc2lvbnNbdGhpcy5fZ2VuZXNpc0NyZWF0dXJlLl9rZXldID0gdmlld1xuICAgICAgICAgICAgcmVzb2x2ZShcbiAgICAgICAgICAgICAgICBuZXcgUnVubmFibGUoXG4gICAgICAgICAgICAgICAgICAgIHZpZXcsXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmlyc3RNb3VudCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FjaGUubW91bnRzLnJldmVyc2UoKS5mb3JFYWNoKChvbk1vdW50OiBhbnkpID0+IG9uTW91bnQoKSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgbW9kdWxlcz86IHsgW2lkOiBzdHJpbmddOiBNb2R1bGUgfSkge1xuICAgICAgICB0aGlzLl9rZXkgPSBrZXlcbiAgICAgICAgdGhpcy5fbW9kdWxlcyA9IG1vZHVsZXMgPyBtb2R1bGVzIDoge31cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcGxldFxuIiwiXG5pbXBvcnQgRE9NIGZyb20gXCIuL0RPTVwiXG5pbXBvcnQgRXhlY3V0aW9uTWV0YSBmcm9tIFwiLi9FeGVjdXRpb25NZXRhXCJcbmltcG9ydCBNb2R1bGUgZnJvbSBcIi4vTW9kdWxlXCJcbmltcG9ydCBSdW50aW1lIGZyb20gXCIuL1J1bnRpbWVcIlxuaW1wb3J0IEJhc2VFbGVtZW50IGZyb20gXCIuL2VsZW1lbnRzL0Jhc2VFbGVtZW50XCJcbmltcG9ydCBVdGlscyBmcm9tICcuL3V0aWxzJ1xuXG5jbGFzcyBDcmVhdHVyZSB7XG5cbiAgICBwdWJsaWMgX2tleTogc3RyaW5nXG4gICAgcHVibGljIGdldCBrZXkoKSB7IHJldHVybiB0aGlzLl9rZXkgfVxuXG4gICAgcHJpdmF0ZSBfY29zbW9JZDogc3RyaW5nXG4gICAgcHVibGljIGdldCBjb3Ntb0lkKCkgeyByZXR1cm4gdGhpcy5fY29zbW9JZCB9XG4gICAgcHVibGljIHNldENvc21vSWQoY29zbW9JZDogc3RyaW5nKSB7IHRoaXMuX2Nvc21vSWQgPSBjb3Ntb0lkIH1cblxuICAgIHByaXZhdGUgX21vZHVsZTogTW9kdWxlXG4gICAgcHVibGljIGdldCBtb2R1bGUoKSB7IHJldHVybiB0aGlzLl9tb2R1bGUgfVxuXG4gICAgcHVibGljIF9ydW50aW1lOiBSdW50aW1lXG4gICAgcHVibGljIGdldCBydW50aW1lKCkgeyByZXR1cm4gdGhpcy5fcnVudGltZSB9XG5cbiAgICBwdWJsaWMgX2RvbTogRE9NXG4gICAgcHVibGljIGdldCBkb20oKSB7IHJldHVybiB0aGlzLl9kb20gfVxuXG4gICAgcHVibGljIHRoaXNPYmo6IHsgW2lkOiBzdHJpbmddOiBhbnkgfVxuXG4gICAgcHVibGljIGdldEJhc2VNZXRob2QobWV0aG9kSWQ6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5fcnVudGltZS5zdGFja1swXS5maW5kVW5pdChtZXRob2RJZClcbiAgICB9XG5cbiAgICBwdWJsaWMgdXBkYXRlKHByb3BzPzogeyBbaWQ6IHN0cmluZ106IGFueSB9LCBzdHlsZXM/OiB7IFtpZDogc3RyaW5nXTogYW55IH0sIGNoaWxkcmVuPzogQXJyYXk8QmFzZUVsZW1lbnQ+KSB7XG4gICAgICAgIHRoaXMudGhpc09iaiA9IHtcbiAgICAgICAgICAgIC4uLnRoaXMudGhpc09iaixcbiAgICAgICAgICAgIHByb3BzLFxuICAgICAgICAgICAgc3R5bGVzLFxuICAgICAgICAgICAgY2hpbGRyZW5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBmaWxsQ2hpbGRyZW4oY2hpbGRyZW46IEFycmF5PEJhc2VFbGVtZW50Pikge1xuICAgICAgICB0aGlzLnRoaXNPYmouY2hpbGRyZW4gPSBjaGlsZHJlblxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKG1vZHVsZTogTW9kdWxlLCBkZWZhdWx0VmFsdWVzPzogYW55KSB7XG4gICAgICAgIHRoaXMuX2tleSA9IGRlZmF1bHRWYWx1ZXM/Ll9rZXkgPyBkZWZhdWx0VmFsdWVzLl9rZXkgOiBVdGlscy5nZW5lcmF0b3IuZ2VuZXJhdGVLZXkoKVxuICAgICAgICB0aGlzLl9jb3Ntb0lkID0gZGVmYXVsdFZhbHVlcz8uY29zbW9JZFxuICAgICAgICB0aGlzLl9tb2R1bGUgPSBtb2R1bGVcbiAgICAgICAgdGhpcy5fZG9tID0gZGVmYXVsdFZhbHVlcz8uZG9tID8gZGVmYXVsdFZhbHVlcy5kb20gOiBuZXcgRE9NKHRoaXMuX21vZHVsZSwgdGhpcylcbiAgICAgICAgdGhpcy5fcnVudGltZSA9IGRlZmF1bHRWYWx1ZXM/LnJ1bnRpbWUgPyBkZWZhdWx0VmFsdWVzLnJ1bnRpbWUgOiBuZXcgUnVudGltZSh0aGlzLl9tb2R1bGUsIHRoaXMpXG4gICAgICAgIHRoaXMudGhpc09iaiA9IGRlZmF1bHRWYWx1ZXM/LnRoaXNPYmpcbiAgICAgICAgaWYgKCFkZWZhdWx0VmFsdWVzPy5ydW50aW1lKSB7XG4gICAgICAgICAgICB0aGlzLl9ydW50aW1lLmxvYWQoKVxuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy50aGlzT2JqKSB7XG4gICAgICAgICAgICB0aGlzLnRoaXNPYmogPSB7fVxuICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5fcnVudGltZS5zdGFja1swXS51bml0cykuZm9yRWFjaChrID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX3J1bnRpbWUubmF0aXZlW2tdIHx8IChrID09PSAnY29uc3RydWN0b3InKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRoaXNPYmpba10gPSB0aGlzLl9ydW50aW1lLnN0YWNrWzBdLnVuaXRzW2tdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHRoaXMudGhpc09iaiA9IHt9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aGlzT2JqWydzZXRTdGF0ZSddID0gKHN0YXRlVXBkYXRlOiB7IFtpZDogc3RyaW5nXTogYW55IH0pID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHN0YXRlVXBkYXRlKVxuICAgICAgICAgICAgdGhpcy50aGlzT2JqWydzdGF0ZSddID0geyAuLi50aGlzLnRoaXNPYmpbJ3N0YXRlJ10sIC4uLnN0YXRlVXBkYXRlIH1cbiAgICAgICAgICAgIGxldCBuZXdNZXRhQnJhbmNoID0gbmV3IEV4ZWN1dGlvbk1ldGEoeyBjcmVhdHVyZTogdGhpcywgcGFyZW50SnN4S2V5OiB0aGlzLnRoaXNPYmpbJ3BhcmVudEpzeEtleSddIH0pXG4gICAgICAgICAgICBsZXQgbmV3UmVuZGVyID0gdGhpcy5nZXRCYXNlTWV0aG9kKCdyZW5kZXInKShuZXdNZXRhQnJhbmNoKVxuICAgICAgICAgICAgdGhpcy5fbW9kdWxlLmFwcGxldC5vbkNyZWF0dXJlU3RhdGVDaGFuZ2UodGhpcywgbmV3UmVuZGVyKVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDcmVhdHVyZVxuIiwiXG5pbXBvcnQgQ3JlYXR1cmUgZnJvbSBcIi4vQ3JlYXR1cmVcIlxuaW1wb3J0IEZ1bmMgZnJvbSBcIi4vRnVuY1wiXG5cbmNsYXNzIENyZWF0dXJlU3RvcmUge1xuXG4gICAgcHJpdmF0ZSBfc3RvcmU6IHsgW2lkOiBzdHJpbmddOiBDcmVhdHVyZSB9XG4gICAgcHVibGljIHB1dENyZWF0dXJlKGNyZWF0dXJlOiBDcmVhdHVyZSkgeyB0aGlzLl9zdG9yZVtjcmVhdHVyZS5rZXldID0gY3JlYXR1cmUgfVxuICAgIHB1YmxpYyByZW1vdmVDcmVhdHVyZShrZXk6IHN0cmluZykgeyBkZWxldGUgdGhpcy5fc3RvcmVba2V5XSB9XG4gICAgcHVibGljIGZpbmRDcmVhdHVyZShrZXk6IHN0cmluZykgeyByZXR1cm4gdGhpcy5fc3RvcmVba2V5XSB9XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fc3RvcmUgPSB7fVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ3JlYXR1cmVTdG9yZVxuIiwiXG5pbXBvcnQgQ3JlYXR1cmUgZnJvbSAnLi9DcmVhdHVyZSdcbmltcG9ydCBNb2R1bGUgZnJvbSAnLi9Nb2R1bGUnXG5pbXBvcnQgQmFzZUVsZW1lbnQgZnJvbSAnLi9lbGVtZW50cy9CYXNlRWxlbWVudCdcblxuY2xhc3MgRE9NIHtcblxuICAgIHByaXZhdGUgX21vZHVsZTogTW9kdWxlXG4gICAgcHVibGljIGdldCBtb2R1bGUoKSB7IHJldHVybiB0aGlzLl9tb2R1bGUgfVxuXG4gICAgcHJpdmF0ZSBfY3JlYXR1cmU6IENyZWF0dXJlXG4gICAgcHVibGljIGdldCBjcmVhdHVyZSgpIHsgcmV0dXJuIHRoaXMuX2NyZWF0dXJlIH1cblxuICAgIHByaXZhdGUgX3Jvb3Q/OiBCYXNlRWxlbWVudFxuICAgIHB1YmxpYyBnZXQgcm9vdCgpIHsgcmV0dXJuIHRoaXMuX3Jvb3QgfVxuICAgIHB1YmxpYyBzZXRSb290KHJvb3Q6IEJhc2VFbGVtZW50KSB7IHRoaXMuX3Jvb3QgPSByb290IH1cblxuICAgIGNvbnN0cnVjdG9yKG1vZHVsZTogTW9kdWxlLCBjcmVhdHVyZT86IENyZWF0dXJlLCByb290PzogQmFzZUVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlID0gbW9kdWxlXG4gICAgICAgIHRoaXMuX2NyZWF0dXJlID0gY3JlYXR1cmVcbiAgICAgICAgdGhpcy5fcm9vdCA9IHJvb3RcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERPTVxuIiwiaW1wb3J0IENyZWF0dXJlIGZyb20gXCIuL0NyZWF0dXJlXCJcblxuY2xhc3MgRXhlY3V0aW9uTWV0YSB7XG5cbiAgICBjcmVhdHVyZTogQ3JlYXR1cmVcbiAgICBkZWNsYXJhdGlvbj86IGJvb2xlYW5cbiAgICBkZWNsYXJhdGlvblR5cGU/OiBzdHJpbmdcbiAgICByZXR1cm5JZFBhcmVudD86IGJvb2xlYW5cbiAgICBpc0Fub3RoZXJDcmVhdHVyZT86IGJvb2xlYW5cbiAgICBwYXJlbnRKc3hLZXk6IHN0cmluZ1xuXG4gICAgY29uc3RydWN0b3IobWV0YURpY3Q6IGFueSkge1xuICAgICAgICB0aGlzLmNyZWF0dXJlID0gbWV0YURpY3QuY3JlYXR1cmVcbiAgICAgICAgdGhpcy5kZWNsYXJhdGlvbiA9IChtZXRhRGljdC5kZWNsYXJhdGlvbiA9PT0gdHJ1ZSlcbiAgICAgICAgdGhpcy5kZWNsYXJhdGlvblR5cGUgPSBtZXRhRGljdC5kZWNsYXJhdGlvblR5cGVcbiAgICAgICAgdGhpcy5yZXR1cm5JZFBhcmVudCA9IG1ldGFEaWN0LnJldHVybklkUGFyZW50XG4gICAgICAgIHRoaXMuaXNBbm90aGVyQ3JlYXR1cmUgPSBtZXRhRGljdC5pc0Fub3RoZXJDcmVhdHVyZVxuICAgICAgICB0aGlzLnBhcmVudEpzeEtleSA9IG1ldGFEaWN0LnBhcmVudEpzeEtleVxuICAgICAgICBpZiAodGhpcy5kZWNsYXJhdGlvbiAmJiAhdGhpcy5kZWNsYXJhdGlvblR5cGUpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IHRocm93IGludmFsaWQgZXhlY3V0aW9uIG1ldGFkYXRhIGV4Y2VwdGlvblxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFeGVjdXRpb25NZXRhXG4iLCJpbXBvcnQgRnVuYyBmcm9tIFwiLi9GdW5jXCJcblxuY2xhc3MgRnVuY1N0b3JlIHtcblxuICAgIHByaXZhdGUgX3N0b3JlOiB7IFtpZDogc3RyaW5nXTogRnVuYyB9XG4gICAgcHVibGljIGdldCBzdG9yZSgpIHsgcmV0dXJuIHRoaXMuX3N0b3JlIH1cbiAgICBwdWJsaWMgcHV0RnVuYyhmdW5jOiBGdW5jKSB7IHRoaXMuX3N0b3JlW2Z1bmMua2V5XSA9IGZ1bmMgfVxuICAgIHB1YmxpYyByZW1vdmVGdW5jKGtleTogc3RyaW5nKSB7IGRlbGV0ZSB0aGlzLl9zdG9yZVtrZXldIH1cbiAgICBwdWJsaWMgZmluZEZ1bmMoa2V5OiBzdHJpbmcpIHsgcmV0dXJuIHRoaXMuX3N0b3JlW2tleV0gfVxuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX3N0b3JlID0ge31cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZ1bmNTdG9yZVxuIiwiXG5pbXBvcnQgTW9kdWxlIGZyb20gXCIuL01vZHVsZVwiXG5cbmNsYXNzIElOYXRpdmUge1xuICAgIFxuICAgIHB1YmxpYyBfbW9kdWxlOiBNb2R1bGVcbiAgICBwdWJsaWMgZ2V0IGtleSgpIHsgcmV0dXJuIHRoaXMuX21vZHVsZS5rZXkgfVxuXG4gICAgY29uc3RydWN0b3IobW9kdWxlOiBNb2R1bGUpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlID0gbW9kdWxlXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJTmF0aXZlXG4iLCJcbmltcG9ydCBGdW5jIGZyb20gXCIuL0Z1bmNcIlxuXG5jbGFzcyBNZW1vcnlMYXllciB7XG5cbiAgICBwcml2YXRlIF91bml0czogeyBbaWQ6IHN0cmluZ106IGFueSB9XG4gICAgcHVibGljIGdldCB1bml0cygpIHsgcmV0dXJuIHRoaXMuX3VuaXRzIH1cbiAgICBwdWJsaWMgZmluZFVuaXQoa2V5OiBzdHJpbmcpIHsgcmV0dXJuIHRoaXMuX3VuaXRzW2tleV0gfVxuICAgIHB1YmxpYyBwdXRVbml0KGtleTogc3RyaW5nLCB1bml0OiBhbnkpIHsgdGhpcy5fdW5pdHNba2V5XSA9IHVuaXQgfVxuICAgIHB1YmxpYyByZW1vdmVVbml0KGtleTogc3RyaW5nKSB7IGRlbGV0ZSB0aGlzLl91bml0c1trZXldIH1cblxuICAgIGNvbnN0cnVjdG9yKGluaXRpYWxVbml0cz86IHsgW2lkOiBzdHJpbmddOiBhbnkgfSkge1xuICAgICAgICB0aGlzLl91bml0cyA9IGluaXRpYWxVbml0cyA/IGluaXRpYWxVbml0cyA6IHt9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZW1vcnlMYXllclxuIiwiXG5pbXBvcnQgQXBwbGV0IGZyb20gXCIuL0FwcGxldFwiXG5pbXBvcnQgQ3JlYXR1cmUgZnJvbSBcIi4vQ3JlYXR1cmVcIlxuaW1wb3J0IENyZWF0dXJlU3RvcmUgZnJvbSBcIi4vQ3JlYXR1cmVTdG9yZVwiXG5pbXBvcnQgRE9NIGZyb20gXCIuL0RPTVwiXG5pbXBvcnQgRnVuY1N0b3JlIGZyb20gXCIuL0Z1bmNTdG9yZVwiXG5pbXBvcnQgUnVudGltZSBmcm9tIFwiLi9SdW50aW1lXCJcbmltcG9ydCBCYXNlRWxlbWVudCBmcm9tIFwiLi9lbGVtZW50cy9CYXNlRWxlbWVudFwiXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi91dGlscydcblxuY2xhc3MgTW9kdWxlIHtcblxuICAgIHByaXZhdGUgX2FwcGxldDogQXBwbGV0XG4gICAgcHVibGljIGdldCBhcHBsZXQoKSB7IHJldHVybiB0aGlzLl9hcHBsZXQgfVxuICAgIHB1YmxpYyBzZXRBcHBsZXQoYXBwbGV0OiBBcHBsZXQpIHsgdGhpcy5fYXBwbGV0ID0gYXBwbGV0IH1cblxuICAgIHByaXZhdGUgX2NyZWF0dXJlczogQ3JlYXR1cmVTdG9yZVxuICAgIHB1YmxpYyBnZXQgY3JlYXR1cmVzKCkgeyByZXR1cm4gdGhpcy5fY3JlYXR1cmVzIH1cblxuICAgIHByaXZhdGUgX2tleTogc3RyaW5nXG4gICAgZ2V0IGtleSgpIHsgcmV0dXJuIHRoaXMuX2tleSB9XG5cbiAgICBwcml2YXRlIF9mdW5jczogRnVuY1N0b3JlXG4gICAgcHVibGljIGdldCBmdW5jcygpIHsgcmV0dXJuIHRoaXMuX2Z1bmNzIH1cblxuICAgIHByaXZhdGUgX2RvbTogRE9NXG4gICAgcHVibGljIGdldCBkb20oKSB7IHJldHVybiB0aGlzLl9kb20gfVxuXG4gICAgcHJpdmF0ZSBfYXN0PzogYW55XG4gICAgcHVibGljIGdldCBhc3QoKSB7IHJldHVybiB0aGlzLl9hc3QgfVxuICAgIHB1YmxpYyBzZXRBc3QoYXN0OiBhbnkpIHsgdGhpcy5fYXN0ID0gYXN0IH1cblxuICAgIHB1YmxpYyBpbnN0YW50aWF0ZShwcm9wcz86IHsgW2lkOiBzdHJpbmddOiBhbnkgfSwgc3R5bGVzPzogeyBbaWQ6IHN0cmluZ106IGFueSB9LCBjaGlsZHJlbj86IEFycmF5PEJhc2VFbGVtZW50PiwgdGhpc09iaj86IGFueSkge1xuICAgICAgICBsZXQgY3JlYXR1cmUgPSBuZXcgQ3JlYXR1cmUoXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvc21vSWQ6IHByb3BzPy5rZXksXG4gICAgICAgICAgICAgICAgdGhpc09iajogdGhpc09iaiA/XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnRoaXNPYmosXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wczogcHJvcHMgPyBwcm9wcyA6IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzOiBzdHlsZXMgPyBzdHlsZXMgOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbiA/IGNoaWxkcmVuIDogW11cbiAgICAgICAgICAgICAgICAgICAgfSA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiBwcm9wcyA/IHByb3BzIDoge30sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXM6IHN0eWxlcyA/IHN0eWxlcyA6IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IGNoaWxkcmVuID8gY2hpbGRyZW4gOiBbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgICAgdGhpcy5fY3JlYXR1cmVzLnB1dENyZWF0dXJlKGNyZWF0dXJlKVxuICAgICAgICByZXR1cm4gY3JlYXR1cmVcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgYXBwbGV0OiBBcHBsZXQsIGFzdD86IGFueSkge1xuICAgICAgICB0aGlzLl9rZXkgPSBrZXlcbiAgICAgICAgdGhpcy5fYXBwbGV0ID0gYXBwbGV0XG4gICAgICAgIHRoaXMuX2FzdCA9IGFzdFxuICAgICAgICB0aGlzLl9jcmVhdHVyZXMgPSBuZXcgQ3JlYXR1cmVTdG9yZSgpXG4gICAgICAgIHRoaXMuX2Z1bmNzID0gbmV3IEZ1bmNTdG9yZSgpXG4gICAgICAgIHRoaXMuX2RvbSA9IG5ldyBET00odGhpcylcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1vZHVsZVxuIiwiXG5pbXBvcnQgQ3JlYXR1cmUgZnJvbSAnLi9DcmVhdHVyZSdcbmltcG9ydCBJTmF0aXZlIGZyb20gJy4vSU5hdGl2ZSdcbmltcG9ydCBNZW1vcnlMYXllciBmcm9tICcuL01lbW9yeUxheWVyJ1xuaW1wb3J0IE1lbW9yeSBmcm9tICcuL01lbW9yeUxheWVyJ1xuaW1wb3J0IE1vZHVsZSBmcm9tICcuL01vZHVsZSdcbmltcG9ydCBVdGlscyBmcm9tICcuL3V0aWxzJ1xuXG5jbGFzcyBSdW50aW1lIHtcblxuICAgIHByaXZhdGUgX21vZHVsZTogTW9kdWxlXG4gICAgcHVibGljIGdldCBtb2R1bGUoKSB7IHJldHVybiB0aGlzLl9tb2R1bGUgfVxuXG4gICAgcHJpdmF0ZSBfY3JlYXR1cmU6IENyZWF0dXJlXG4gICAgcHVibGljIGdldCBjcmVhdHVyZSgpIHsgcmV0dXJuIHRoaXMuX2NyZWF0dXJlIH1cblxuICAgIHByaXZhdGUgX25hdGl2ZTogSU5hdGl2ZVxuICAgIHB1YmxpYyBnZXQgbmF0aXZlKCkgeyByZXR1cm4gdGhpcy5fbmF0aXZlIH1cblxuICAgIHB1YmxpYyBzdGFjazogQXJyYXk8TWVtb3J5PiA9IFtdXG4gICAgcHVibGljIHB1c2hPblN0YWNrKGluaXRpYWxVbml0cz86IHsgW2lkOiBzdHJpbmddOiBhbnkgfSkgeyB0aGlzLnN0YWNrLnB1c2gobmV3IE1lbW9yeUxheWVyKGluaXRpYWxVbml0cykpIH1cbiAgICBwdWJsaWMgcG9wRnJvbVN0YWNrKCkgeyB0aGlzLnN0YWNrLnBvcCgpIH1cbiAgICBwdWJsaWMgZ2V0IHN0YWNrVG9wKCkgeyByZXR1cm4gdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aCAtIDFdIH1cbiAgICBwdWJsaWMgcmVzZXRTdGFjaygpIHtcbiAgICAgICAgdGhpcy5zdGFjayA9IFtdXG4gICAgICAgIHRoaXMucHVzaE9uU3RhY2soeyAuLi50aGlzLl9uYXRpdmUgfSlcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMucmVzZXRTdGFjaygpXG4gICAgfVxuXG4gICAgcHVibGljIGV4ZWN1dGUoYXN0OiBhbnkpIHtcbiAgICAgICAgVXRpbHMuZXhlY3V0b3IuZXhlY3V0ZUJsb2NrKGFzdCwgbmV3IFV0aWxzLmV4ZWN1dG9yLkV4ZWN1dGlvbk1ldGEoeyBjcmVhdHVyZTogdGhpcy5fY3JlYXR1cmUgfSkpXG4gICAgfVxuXG4gICAgcHVibGljIGxvYWQoKSB7XG4gICAgICAgIHRoaXMuZXhlY3V0ZSh0aGlzLm1vZHVsZS5hc3QuYm9keS5ib2R5KVxuICAgIH1cblxuICAgIHB1YmxpYyBjbG9uZSgpIHtcbiAgICAgICAgbGV0IGNvcHkgPSBuZXcgUnVudGltZSh0aGlzLm1vZHVsZSwgdGhpcy5jcmVhdHVyZSwgeyBuYXRpdmU6IHRoaXMubmF0aXZlLCBzdGFjazogbmV3IEFycmF5KC4uLnRoaXMuc3RhY2spIH0pXG4gICAgICAgIHJldHVybiBjb3B5XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IobW9kdWxlOiBNb2R1bGUsIGNyZWF0dXJlPzogQ3JlYXR1cmUsIHJldXNhYmxlVG9vbHM/OiBhbnkpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlID0gbW9kdWxlXG4gICAgICAgIHRoaXMuX2NyZWF0dXJlID0gY3JlYXR1cmVcbiAgICAgICAgdGhpcy5fbmF0aXZlID0gcmV1c2FibGVUb29scz8ubmF0aXZlID8gcmV1c2FibGVUb29scy5uYXRpdmUgOiB0aGlzLl9tb2R1bGUuYXBwbGV0Ll9uYXRpdmVCdWlsZGVyKHRoaXMuX21vZHVsZSlcbiAgICAgICAgaWYgKHJldXNhYmxlVG9vbHM/LnN0YWNrKSB7XG4gICAgICAgICAgICB0aGlzLnN0YWNrID0gcmV1c2FibGVUb29scy5zdGFja1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpXG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgUnVudGltZVxuIiwiXG5jbGFzcyBCYXNlQ29udHJvbCB7XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZUNvbnRyb2xcbiIsIlxuaW1wb3J0IEJhc2VDb250cm9sIGZyb20gJy4vQmFzZUNvbnRyb2wnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCBCYXNlRWxlbWVudCBmcm9tICcuLi9lbGVtZW50cy9CYXNlRWxlbWVudCc7XG5cbmNsYXNzIEJveENvbnRyb2wgZXh0ZW5kcyBCYXNlQ29udHJvbCB7XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRZUEUgPSAnYm94J1xuICAgIHB1YmxpYyBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyBkZWZhdWx0U3R5bGVzID0ge1xuICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICBoZWlnaHQ6IDIwMFxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgaW5zdGFudGlhdGUob3ZlcnJpZGVuUHJvcHM6IHsgW2lkOiBzdHJpbmddOiBhbnkgfSwgb3ZlcnJpZGVuU3R5bGVzOiB7IFtpZDogc3RyaW5nXTogYW55IH0sIGNoaWxkcmVuOiBBcnJheTxCYXNlRWxlbWVudD4pIHtcbiAgICAgICAgcmV0dXJuIFV0aWxzLmdlbmVyYXRvci5wcmVwYXJlRWxlbWVudChCb3hDb250cm9sLlRZUEUsIHRoaXMuZGVmYXVsdFByb3BzLCBvdmVycmlkZW5Qcm9wcywgdGhpcy5kZWZhdWx0U3R5bGVzLCBvdmVycmlkZW5TdHlsZXMsIGNoaWxkcmVuKVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQm94Q29udHJvbFxuIiwiXG5pbXBvcnQgQmFzZUNvbnRyb2wgZnJvbSAnLi9CYXNlQ29udHJvbCc7XG5pbXBvcnQgU3RyaW5nUHJvcCBmcm9tICcuLi9wcm9wcy9TdHJpbmdQcm9wJ1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCBCYXNlRWxlbWVudCBmcm9tICcuLi9lbGVtZW50cy9CYXNlRWxlbWVudCc7XG5pbXBvcnQgRnVuY1Byb3AgZnJvbSAnLi4vcHJvcHMvRnVuY1Byb3AnO1xuXG5jbGFzcyBCdXR0b25Db250cm9sIGV4dGVuZHMgQmFzZUNvbnRyb2wge1xuXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBUWVBFID0gJ2J1dHRvbidcbiAgICBwdWJsaWMgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgY2FwdGlvbjogbmV3IFN0cmluZ1Byb3AoJycpLFxuICAgICAgICB2YXJpYW50OiBuZXcgU3RyaW5nUHJvcCgnZmlsbGVkJyksXG4gICAgICAgIG9uQ2xpY2s6IG5ldyBGdW5jUHJvcCh1bmRlZmluZWQpXG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgZGVmYXVsdFN0eWxlcyA9IHtcbiAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgaGVpZ2h0OiAnYXV0bydcbiAgICB9XG5cbiAgICBzdGF0aWMgaW5zdGFudGlhdGUob3ZlcnJpZGVuUHJvcHM6IHsgW2lkOiBzdHJpbmddOiBhbnkgfSwgb3ZlcnJpZGVuU3R5bGVzOiB7IFtpZDogc3RyaW5nXTogYW55IH0sIGNoaWxkcmVuOiBBcnJheTxCYXNlRWxlbWVudD4pIHtcbiAgICAgICAgcmV0dXJuIFV0aWxzLmdlbmVyYXRvci5wcmVwYXJlRWxlbWVudChCdXR0b25Db250cm9sLlRZUEUsIHRoaXMuZGVmYXVsdFByb3BzLCBvdmVycmlkZW5Qcm9wcywgdGhpcy5kZWZhdWx0U3R5bGVzLCBvdmVycmlkZW5TdHlsZXMsIGNoaWxkcmVuKVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQnV0dG9uQ29udHJvbFxuIiwiXG5pbXBvcnQgQmFzZUNvbnRyb2wgZnJvbSAnLi9CYXNlQ29udHJvbCc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IEJhc2VFbGVtZW50IGZyb20gJy4uL2VsZW1lbnRzL0Jhc2VFbGVtZW50JztcblxuY2xhc3MgQ2FyZENvbnRyb2wgZXh0ZW5kcyBCYXNlQ29udHJvbCB7XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRZUEUgPSAnY2FyZCdcbiAgICBwdWJsaWMgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgXG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgZGVmYXVsdFN0eWxlcyA9IHtcbiAgICAgICAgd2lkdGg6IDIwMCxcbiAgICAgICAgaGVpZ2h0OiAyMDAsXG4gICAgICAgIGJveFNoYWRvdzogJ3JnYmEoMCwgMCwgMCwgMC4yNCkgMHB4IDNweCA4cHgnLFxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgYm9yZGVyUmFkaXVzOiA0XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBpbnN0YW50aWF0ZShvdmVycmlkZW5Qcm9wczogeyBbaWQ6IHN0cmluZ106IGFueSB9LCBvdmVycmlkZW5TdHlsZXM6IHsgW2lkOiBzdHJpbmddOiBhbnkgfSwgY2hpbGRyZW46IEFycmF5PEJhc2VFbGVtZW50Pikge1xuICAgICAgICByZXR1cm4gVXRpbHMuZ2VuZXJhdG9yLnByZXBhcmVFbGVtZW50KENhcmRDb250cm9sLlRZUEUsIHRoaXMuZGVmYXVsdFByb3BzLCBvdmVycmlkZW5Qcm9wcywgdGhpcy5kZWZhdWx0U3R5bGVzLCBvdmVycmlkZW5TdHlsZXMsIGNoaWxkcmVuKVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2FyZENvbnRyb2xcbiIsIlxuaW1wb3J0IEJhc2VDb250cm9sIGZyb20gJy4vQmFzZUNvbnRyb2wnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCBCYXNlRWxlbWVudCBmcm9tICcuLi9lbGVtZW50cy9CYXNlRWxlbWVudCc7XG5cbmNsYXNzIFByaW1hcnlUYWJDb250cm9sIGV4dGVuZHMgQmFzZUNvbnRyb2wge1xuXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBUWVBFID0gJ3ByaW1hcnktdGFiJ1xuICAgIHB1YmxpYyBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyBkZWZhdWx0U3R5bGVzID0ge1xuICAgICAgICBcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGluc3RhbnRpYXRlKG92ZXJyaWRlblByb3BzOiB7IFtpZDogc3RyaW5nXTogYW55IH0sIG92ZXJyaWRlblN0eWxlczogeyBbaWQ6IHN0cmluZ106IGFueSB9LCBjaGlsZHJlbjogQXJyYXk8QmFzZUVsZW1lbnQ+KSB7XG4gICAgICAgIHJldHVybiBVdGlscy5nZW5lcmF0b3IucHJlcGFyZUVsZW1lbnQoUHJpbWFyeVRhYkNvbnRyb2wuVFlQRSwgdGhpcy5kZWZhdWx0UHJvcHMsIG92ZXJyaWRlblByb3BzLCB0aGlzLmRlZmF1bHRTdHlsZXMsIG92ZXJyaWRlblN0eWxlcywgY2hpbGRyZW4pXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcmltYXJ5VGFiQ29udHJvbFxuIiwiXG5pbXBvcnQgQmFzZUNvbnRyb2wgZnJvbSAnLi9CYXNlQ29udHJvbCc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IEJhc2VFbGVtZW50IGZyb20gJy4uL2VsZW1lbnRzL0Jhc2VFbGVtZW50JztcbmltcG9ydCBGdW5jUHJvcCBmcm9tICcuLi9wcm9wcy9GdW5jUHJvcCc7XG5cbmNsYXNzIFRhYnNDb250cm9sIGV4dGVuZHMgQmFzZUNvbnRyb2wge1xuXG4gICAgcHVibGljIHN0YXRpYyByZWFkb25seSBUWVBFID0gJ3RhYnMnXG4gICAgcHVibGljIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIG9uQ2hhbmdlOiBuZXcgRnVuY1Byb3AodW5kZWZpbmVkKVxuICAgIH1cbiAgICBwdWJsaWMgc3RhdGljIGRlZmF1bHRTdHlsZXMgPSB7XG4gICAgICAgIFxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgaW5zdGFudGlhdGUob3ZlcnJpZGVuUHJvcHM6IHsgW2lkOiBzdHJpbmddOiBhbnkgfSwgb3ZlcnJpZGVuU3R5bGVzOiB7IFtpZDogc3RyaW5nXTogYW55IH0sIGNoaWxkcmVuOiBBcnJheTxCYXNlRWxlbWVudD4pIHtcbiAgICAgICAgcmV0dXJuIFV0aWxzLmdlbmVyYXRvci5wcmVwYXJlRWxlbWVudChUYWJzQ29udHJvbC5UWVBFLCB0aGlzLmRlZmF1bHRQcm9wcywgb3ZlcnJpZGVuUHJvcHMsIHRoaXMuZGVmYXVsdFN0eWxlcywgb3ZlcnJpZGVuU3R5bGVzLCBjaGlsZHJlbilcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRhYnNDb250cm9sXG4iLCJcbmltcG9ydCBCYXNlQ29udHJvbCBmcm9tICcuL0Jhc2VDb250cm9sJztcbmltcG9ydCBTdHJpbmdQcm9wIGZyb20gJy4uL3Byb3BzL1N0cmluZ1Byb3AnXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IEJhc2VFbGVtZW50IGZyb20gJy4uL2VsZW1lbnRzL0Jhc2VFbGVtZW50JztcblxuY2xhc3MgVGV4dENvbnRyb2wgZXh0ZW5kcyBCYXNlQ29udHJvbCB7XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRZUEUgPSAndGV4dCdcbiAgICBwdWJsaWMgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgdGV4dDogbmV3IFN0cmluZ1Byb3AoJycpXG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgZGVmYXVsdFN0eWxlcyA9IHtcbiAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgaGVpZ2h0OiAnYXV0bydcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGluc3RhbnRpYXRlKG92ZXJyaWRlblByb3BzOiB7IFtpZDogc3RyaW5nXTogYW55IH0sIG92ZXJyaWRlblN0eWxlczogeyBbaWQ6IHN0cmluZ106IGFueSB9LCBjaGlsZHJlbjogQXJyYXk8QmFzZUVsZW1lbnQ+KSB7XG4gICAgICAgIHJldHVybiBVdGlscy5nZW5lcmF0b3IucHJlcGFyZUVsZW1lbnQoVGV4dENvbnRyb2wuVFlQRSwgdGhpcy5kZWZhdWx0UHJvcHMsIG92ZXJyaWRlblByb3BzLCB0aGlzLmRlZmF1bHRTdHlsZXMsIG92ZXJyaWRlblN0eWxlcywgY2hpbGRyZW4pXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXh0Q29udHJvbFxuIiwiXG5pbXBvcnQgQm94Q29udHJvbCBmcm9tIFwiLi9Cb3hDb250cm9sXCJcbmltcG9ydCBCdXR0b25Db250cm9sIGZyb20gXCIuL0J1dHRvbkNvbnRyb2xcIlxuaW1wb3J0IENhcmRDb250cm9sIGZyb20gXCIuL0NhcmRDb250cm9sXCJcbmltcG9ydCBUYWJzQ29udHJvbCBmcm9tIFwiLi9UYWJzQ29udHJvbFwiXG5pbXBvcnQgUHJpbWFyeVRhYkNvbnRyb2wgZnJvbSBcIi4vUHJpbWFyeVRhYkNvbnRyb2xcIlxuaW1wb3J0IFRleHRDb250cm9sIGZyb20gXCIuL1RleHRDb250cm9sXCJcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIFtUZXh0Q29udHJvbC5UWVBFXTogVGV4dENvbnRyb2wsXG4gICAgW0J1dHRvbkNvbnRyb2wuVFlQRV06IEJ1dHRvbkNvbnRyb2wsXG4gICAgW0JveENvbnRyb2wuVFlQRV06IEJveENvbnRyb2wsXG4gICAgW0NhcmRDb250cm9sLlRZUEVdOiBDYXJkQ29udHJvbCxcbiAgICBbVGFic0NvbnRyb2wuVFlQRV06IFRhYnNDb250cm9sLFxuICAgIFtQcmltYXJ5VGFiQ29udHJvbC5UWVBFXTogUHJpbWFyeVRhYkNvbnRyb2xcbn1cbiIsImltcG9ydCBCYXNlUHJvcCBmcm9tIFwiLi4vcHJvcHMvQmFzZVByb3BcIjtcblxuY2xhc3MgQmFzZUVsZW1lbnQge1xuXG4gICAgcHVibGljIF9rZXk6IHN0cmluZ1xuICAgIHB1YmxpYyBnZXQga2V5KCkgeyByZXR1cm4gdGhpcy5fa2V5IH1cblxuICAgIHByaXZhdGUgX2NvbnRyb2xUeXBlOiBzdHJpbmdcbiAgICBwdWJsaWMgZ2V0IGNvbnRyb2xUeXBlKCkgeyByZXR1cm4gdGhpcy5fY29udHJvbFR5cGUgfVxuXG4gICAgcHVibGljIF9wcm9wczogeyBba2V5OiBzdHJpbmddOiBCYXNlUHJvcCB9XG4gICAgZ2V0IHByb3BzKCkgeyByZXR1cm4gdGhpcy5fcHJvcHMgfVxuXG4gICAgcHVibGljIF9zdHlsZXM6IHsgW2tleTogc3RyaW5nXTogYW55IH1cbiAgICBnZXQgc3R5bGVzKCkgeyByZXR1cm4gdGhpcy5fc3R5bGVzIH1cblxuICAgIHB1YmxpYyBfY2hpbGRyZW46IEFycmF5PEJhc2VFbGVtZW50PlxuICAgIGdldCBjaGlsZHJlbigpIHsgcmV0dXJuIHRoaXMuX2NoaWxkcmVuIH1cblxuICAgIHB1YmxpYyB1cGRhdGUocHJvcHM/OiB7IFtpZDogc3RyaW5nXTogYW55IH0sIHN0eWxlcz86IHsgW2lkOiBzdHJpbmddOiBhbnkgfSwgY2hpbGRyZW4/OiBBcnJheTxCYXNlRWxlbWVudD4pIHtcbiAgICAgICAgaWYgKHByb3BzKSB0aGlzLl9wcm9wcyA9IHByb3BzXG4gICAgICAgIGlmIChzdHlsZXMpIHRoaXMuX3N0eWxlcyA9IHN0eWxlc1xuICAgICAgICBpZiAoY2hpbGRyZW4pIHRoaXMuX2NoaWxkcmVuID0gY2hpbGRyZW5cbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAga2V5OiBzdHJpbmcsXG4gICAgICAgIGNvbnRyb2xUeXBlOiBzdHJpbmcsXG4gICAgICAgIHByb3BzOiB7IFtrZXk6IHN0cmluZ106IEJhc2VQcm9wIH0sXG4gICAgICAgIHN0eWxlczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSxcbiAgICAgICAgY2hpbGRyZW4/OiBBcnJheTxCYXNlRWxlbWVudD5cbiAgICApIHtcbiAgICAgICAgdGhpcy5fa2V5ID0ga2V5XG4gICAgICAgIHRoaXMuX2NvbnRyb2xUeXBlID0gY29udHJvbFR5cGVcbiAgICAgICAgdGhpcy5fcHJvcHMgPSBwcm9wcztcbiAgICAgICAgdGhpcy5fc3R5bGVzID0gc3R5bGVzXG4gICAgICAgIHRoaXMuX2NoaWxkcmVuID0gY2hpbGRyZW4gPyBjaGlsZHJlbiA6IFtdXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlRWxlbWVudFxuIiwiXG5hYnN0cmFjdCBjbGFzcyBCYXNlUHJvcCB7XG5cbiAgICBfdHlwZTogc3RyaW5nXG4gICAgcHVibGljIGdldCB0eXBlKCkgeyByZXR1cm4gdGhpcy5fdHlwZSB9XG5cbiAgICBwdWJsaWMgYWJzdHJhY3Qgc2V0VmFsdWUodmFsdWU6IGFueSk6IHZvaWRcbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0VmFsdWUoKTogYW55XG5cbiAgICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fdHlwZSA9IHR5cGVcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VQcm9wXG4iLCJcbmltcG9ydCBCYXNlUHJvcCBmcm9tICcuL0Jhc2VQcm9wJ1xuXG5jbGFzcyBGdW5jUHJvcCBleHRlbmRzIEJhc2VQcm9wIHtcblxuICAgIF92YWx1ZT86ICgpID0+IHZvaWRcbiAgICBwdWJsaWMgZ2V0IHZhbHVlKCkgeyByZXR1cm4gdGhpcy5fdmFsdWUgfVxuICAgIHB1YmxpYyBzZXRWYWx1ZSh2OiBhbnkpIHsgdGhpcy5fdmFsdWUgPSB2fVxuICAgIHB1YmxpYyBnZXRWYWx1ZSgpIHsgcmV0dXJuIHRoaXMuX3ZhbHVlfVxuXG4gICAgX2RlZmF1bHRWYWx1ZT86ICgpID0+IHZvaWRcbiAgICBwdWJsaWMgZ2V0IGRlZmF1bHRWYWx1ZSgpIHsgcmV0dXJuIHRoaXMuX2RlZmF1bHRWYWx1ZSB9XG5cbiAgICBjb25zdHJ1Y3RvcihkZWZhdWx0VmFsdWU/OiAoKSA9PiB2b2lkKSB7XG4gICAgICAgIHN1cGVyKCdmdW5jdGlvbicpXG4gICAgICAgIHRoaXMuX3ZhbHVlID0gZGVmYXVsdFZhbHVlXG4gICAgICAgIHRoaXMuX2RlZmF1bHRWYWx1ZSA9IGRlZmF1bHRWYWx1ZVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRnVuY1Byb3BcbiIsIlxuaW1wb3J0IEJhc2VQcm9wIGZyb20gJy4vQmFzZVByb3AnXG5cbmNsYXNzIFN0cmluZ1Byb3AgZXh0ZW5kcyBCYXNlUHJvcCB7XG5cbiAgICBfdmFsdWU/OiBzdHJpbmdcbiAgICBwdWJsaWMgZ2V0IHZhbHVlKCkgeyByZXR1cm4gdGhpcy5fdmFsdWUgfVxuICAgIHB1YmxpYyBzZXRWYWx1ZSh2OiBhbnkpIHsgdGhpcy5fdmFsdWUgPSB2fVxuICAgIHB1YmxpYyBnZXRWYWx1ZSgpIHsgcmV0dXJuIHRoaXMuX3ZhbHVlfVxuXG4gICAgX2RlZmF1bHRWYWx1ZTogc3RyaW5nXG4gICAgcHVibGljIGdldCBkZWZhdWx0VmFsdWUoKSB7IHJldHVybiB0aGlzLl9kZWZhdWx0VmFsdWUgfVxuXG4gICAgY29uc3RydWN0b3IoZGVmYXVsdFZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoJ3N0cmluZycpXG4gICAgICAgIHRoaXMuX3ZhbHVlID0gZGVmYXVsdFZhbHVlXG4gICAgICAgIHRoaXMuX2RlZmF1bHRWYWx1ZSA9IGRlZmF1bHRWYWx1ZVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3RyaW5nUHJvcFxuIiwiXG5pbXBvcnQgeyBQYXJzZXIgYXMgQWNvcm5QYXJzZXIgfSBmcm9tICdhY29ybic7XG5pbXBvcnQgKiBhcyBqc3ggZnJvbSAnYWNvcm4tanN4JztcbmltcG9ydCBBcHBsZXQgZnJvbSAnLi4vQXBwbGV0JztcbmltcG9ydCBNb2R1bGUgZnJvbSAnLi4vTW9kdWxlJztcbmltcG9ydCBjc3NQcm9wZXJ0eSBmcm9tICcuL2Nzc1Byb3BlcnR5JztcbmltcG9ydCBoeXBoZW5hdGVTdHlsZU5hbWUgZnJvbSAnLi9oeXBoZW5hdGVTdHlsZU5hbWUnO1xuXG5sZXQgeyBpc1VuaXRsZXNzTnVtYmVyIH0gPSBjc3NQcm9wZXJ0eVxuXG5sZXQganN4Q29tcGlsZXIgPSBBY29yblBhcnNlci5leHRlbmQoanN4KCkpO1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG52YXIga2V5cyA9IE9iamVjdC5rZXlzO1xuXG52YXIgY291bnRlciA9IDE7XG4vLyBGb2xsb3dzIHN5bnRheCBhdCBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvY29udGVudCxcbi8vIGluY2x1ZGluZyBtdWx0aXBsZSBzcGFjZSBzZXBhcmF0ZWQgdmFsdWVzLlxudmFyIHVucXVvdGVkQ29udGVudFZhbHVlUmVnZXggPSAvXihub3JtYWx8bm9uZXwoXFxiKHVybFxcKFteKV0qXFwpfGNoYXB0ZXJfY291bnRlcnxhdHRyXFwoW14pXSpcXCl8KG5vLSk/KG9wZW58Y2xvc2UpLXF1b3RlfGluaGVyaXQpKChcXGJcXHMqKXwkfFxccyspKSspJC87XG5cbmZ1bmN0aW9uIGJ1aWxkUnVsZShrZXksIHZhbHVlKSB7XG4gICAgaWYgKCFpc1VuaXRsZXNzTnVtYmVyW2tleV0gJiYgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICB2YWx1ZSA9ICcnICsgdmFsdWUgKyAncHgnO1xuICAgIH1cbiAgICBlbHNlIGlmIChrZXkgPT09ICdjb250ZW50JyAmJiAhdW5xdW90ZWRDb250ZW50VmFsdWVSZWdleC50ZXN0KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZSA9IFwiJ1wiICsgdmFsdWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpICsgXCInXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGh5cGhlbmF0ZVN0eWxlTmFtZShrZXkpICsgJzogJyArIHZhbHVlICsgJzsgICc7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkVmFsdWUoa2V5LCB2YWx1ZSkge1xuICAgIGlmICghaXNVbml0bGVzc051bWJlcltrZXldICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgdmFsdWUgPSAnJyArIHZhbHVlICsgJ3B4JztcbiAgICB9XG4gICAgZWxzZSBpZiAoa2V5ID09PSAnY29udGVudCcgJiYgIXVucXVvdGVkQ29udGVudFZhbHVlUmVnZXgudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSBcIidcIiArIHZhbHVlLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKSArIFwiJ1wiO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZSArICcnO1xufVxuXG5mdW5jdGlvbiBzdHlsZVRvQ3NzU3RyaW5nKHJ1bGVzKSB7XG4gICAgdmFyIHJlc3VsdCA9ICcnXG4gICAgaWYgKCFydWxlcyB8fCBrZXlzKHJ1bGVzKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgdmFyIHN0eWxlS2V5cyA9IGtleXMocnVsZXMpO1xuICAgIGZvciAodmFyIGogPSAwLCBsID0gc3R5bGVLZXlzLmxlbmd0aDsgaiA8IGw7IGorKykge1xuICAgICAgICB2YXIgc3R5bGVLZXkgPSBzdHlsZUtleXNbal07XG4gICAgICAgIHZhciB2YWx1ZSA9IHJ1bGVzW3N0eWxlS2V5XTtcblxuICAgICAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB2YWx1ZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBidWlsZFJ1bGUoc3R5bGVLZXksIHZhbHVlW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBidWlsZFJ1bGUoc3R5bGVLZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5sZXQgcGFyc2UgPSAoanN4Q29kZTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIGpzeENvbXBpbGVyLnBhcnNlKGpzeENvZGUsIHsgc291cmNlVHlwZTogJ21vZHVsZScsIGVjbWFWZXJzaW9uOiAnbGF0ZXN0JyB9KTtcbn1cblxubGV0IGV4dHJhY3RNb2R1bGVzID0gKG1pZGRsZUNvZGU6IGFueSwgYXBwbGV0OiBBcHBsZXQpID0+IHtcbiAgICByZXR1cm4gbWlkZGxlQ29kZS5ib2R5XG4gICAgICAgIC5maWx0ZXIoKGRlY2xhcmF0aW9uOiBhbnkpID0+IGRlY2xhcmF0aW9uLnR5cGUgPT09ICdDbGFzc0RlY2xhcmF0aW9uJylcbiAgICAgICAgLm1hcCgoZGVjbGFyYXRpb246IGFueSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBNb2R1bGUoZGVjbGFyYXRpb24uaWQubmFtZSwgYXBwbGV0LCBkZWNsYXJhdGlvbilcbiAgICAgICAgfSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgeyBwYXJzZSwgZXh0cmFjdE1vZHVsZXMsIHN0eWxlVG9Dc3NTdHJpbmcsIGJ1aWxkUnVsZSwgYnVpbGRWYWx1ZSB9XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ1NTIHByb3BlcnRpZXMgd2hpY2ggYWNjZXB0IG51bWJlcnMgYnV0IGFyZSBub3QgaW4gdW5pdHMgb2YgXCJweFwiLlxuICovXG52YXIgaXNVbml0bGVzc051bWJlciA9IHtcbiAgYm94RmxleDogdHJ1ZSxcbiAgYm94RmxleEdyb3VwOiB0cnVlLFxuICBjb2x1bW5Db3VudDogdHJ1ZSxcbiAgZmxleDogdHJ1ZSxcbiAgZmxleEdyb3c6IHRydWUsXG4gIGZsZXhQb3NpdGl2ZTogdHJ1ZSxcbiAgZmxleFNocmluazogdHJ1ZSxcbiAgZmxleE5lZ2F0aXZlOiB0cnVlLFxuICBmb250V2VpZ2h0OiB0cnVlLFxuICBsaW5lQ2xhbXA6IHRydWUsXG4gIGxpbmVIZWlnaHQ6IHRydWUsXG4gIG9wYWNpdHk6IHRydWUsXG4gIG9yZGVyOiB0cnVlLFxuICBvcnBoYW5zOiB0cnVlLFxuICB3aWRvd3M6IHRydWUsXG4gIHpJbmRleDogdHJ1ZSxcbiAgem9vbTogdHJ1ZSxcblxuICAvLyBTVkctcmVsYXRlZCBwcm9wZXJ0aWVzXG4gIGZpbGxPcGFjaXR5OiB0cnVlLFxuICBzdHJva2VEYXNob2Zmc2V0OiB0cnVlLFxuICBzdHJva2VPcGFjaXR5OiB0cnVlLFxuICBzdHJva2VXaWR0aDogdHJ1ZVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IHZlbmRvci1zcGVjaWZpYyBwcmVmaXgsIGVnOiBXZWJraXRcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgc3R5bGUgbmFtZSwgZWc6IHRyYW5zaXRpb25EdXJhdGlvblxuICogQHJldHVybiB7c3RyaW5nfSBzdHlsZSBuYW1lIHByZWZpeGVkIHdpdGggYHByZWZpeGAsIHByb3Blcmx5IGNhbWVsQ2FzZWQsIGVnOlxuICogV2Via2l0VHJhbnNpdGlvbkR1cmF0aW9uXG4gKi9cbmZ1bmN0aW9uIHByZWZpeEtleShwcmVmaXgsIGtleSkge1xuICByZXR1cm4gcHJlZml4ICsga2V5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsga2V5LnN1YnN0cmluZygxKTtcbn1cblxuLyoqXG4gKiBTdXBwb3J0IHN0eWxlIG5hbWVzIHRoYXQgbWF5IGNvbWUgcGFzc2VkIGluIHByZWZpeGVkIGJ5IGFkZGluZyBwZXJtdXRhdGlvbnNcbiAqIG9mIHZlbmRvciBwcmVmaXhlcy5cbiAqL1xudmFyIHByZWZpeGVzID0gWydXZWJraXQnLCAnbXMnLCAnTW96JywgJ08nXTtcblxuLy8gVXNpbmcgT2JqZWN0LmtleXMgaGVyZSwgb3IgZWxzZSB0aGUgdmFuaWxsYSBmb3ItaW4gbG9vcCBtYWtlcyBJRTggZ28gaW50byBhblxuLy8gaW5maW5pdGUgbG9vcCwgYmVjYXVzZSBpdCBpdGVyYXRlcyBvdmVyIHRoZSBuZXdseSBhZGRlZCBwcm9wcyB0b28uXG5PYmplY3Qua2V5cyhpc1VuaXRsZXNzTnVtYmVyKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gIHByZWZpeGVzLmZvckVhY2goZnVuY3Rpb24gKHByZWZpeCkge1xuICAgIGlzVW5pdGxlc3NOdW1iZXJbcHJlZml4S2V5KHByZWZpeCwgcHJvcCldID0gaXNVbml0bGVzc051bWJlcltwcm9wXTtcbiAgfSk7XG59KTtcblxuLyoqXG4gKiBNb3N0IHN0eWxlIHByb3BlcnRpZXMgY2FuIGJlIHVuc2V0IGJ5IGRvaW5nIC5zdHlsZVtwcm9wXSA9ICcnIGJ1dCBJRThcbiAqIGRvZXNuJ3QgbGlrZSBkb2luZyB0aGF0IHdpdGggc2hvcnRoYW5kIHByb3BlcnRpZXMgc28gZm9yIHRoZSBwcm9wZXJ0aWVzIHRoYXRcbiAqIElFOCBicmVha3Mgb24sIHdoaWNoIGFyZSBsaXN0ZWQgaGVyZSwgd2UgaW5zdGVhZCB1bnNldCBlYWNoIG9mIHRoZVxuICogaW5kaXZpZHVhbCBwcm9wZXJ0aWVzLiBTZWUgaHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvMTIzODUuXG4gKiBUaGUgNC12YWx1ZSAnY2xvY2snIHByb3BlcnRpZXMgbGlrZSBtYXJnaW4sIHBhZGRpbmcsIGJvcmRlci13aWR0aCBzZWVtIHRvXG4gKiBiZWhhdmUgd2l0aG91dCBhbnkgcHJvYmxlbXMuIEN1cmlvdXNseSwgbGlzdC1zdHlsZSB3b3JrcyB0b28gd2l0aG91dCBhbnlcbiAqIHNwZWNpYWwgcHJvZGRpbmcuXG4gKi9cbnZhciBzaG9ydGhhbmRQcm9wZXJ0eUV4cGFuc2lvbnMgPSB7XG4gIGJhY2tncm91bmQ6IHtcbiAgICBiYWNrZ3JvdW5kSW1hZ2U6IHRydWUsXG4gICAgYmFja2dyb3VuZFBvc2l0aW9uOiB0cnVlLFxuICAgIGJhY2tncm91bmRSZXBlYXQ6IHRydWUsXG4gICAgYmFja2dyb3VuZENvbG9yOiB0cnVlXG4gIH0sXG4gIGJvcmRlcjoge1xuICAgIGJvcmRlcldpZHRoOiB0cnVlLFxuICAgIGJvcmRlclN0eWxlOiB0cnVlLFxuICAgIGJvcmRlckNvbG9yOiB0cnVlXG4gIH0sXG4gIGJvcmRlckJvdHRvbToge1xuICAgIGJvcmRlckJvdHRvbVdpZHRoOiB0cnVlLFxuICAgIGJvcmRlckJvdHRvbVN0eWxlOiB0cnVlLFxuICAgIGJvcmRlckJvdHRvbUNvbG9yOiB0cnVlXG4gIH0sXG4gIGJvcmRlckxlZnQ6IHtcbiAgICBib3JkZXJMZWZ0V2lkdGg6IHRydWUsXG4gICAgYm9yZGVyTGVmdFN0eWxlOiB0cnVlLFxuICAgIGJvcmRlckxlZnRDb2xvcjogdHJ1ZVxuICB9LFxuICBib3JkZXJSaWdodDoge1xuICAgIGJvcmRlclJpZ2h0V2lkdGg6IHRydWUsXG4gICAgYm9yZGVyUmlnaHRTdHlsZTogdHJ1ZSxcbiAgICBib3JkZXJSaWdodENvbG9yOiB0cnVlXG4gIH0sXG4gIGJvcmRlclRvcDoge1xuICAgIGJvcmRlclRvcFdpZHRoOiB0cnVlLFxuICAgIGJvcmRlclRvcFN0eWxlOiB0cnVlLFxuICAgIGJvcmRlclRvcENvbG9yOiB0cnVlXG4gIH0sXG4gIGZvbnQ6IHtcbiAgICBmb250U3R5bGU6IHRydWUsXG4gICAgZm9udFZhcmlhbnQ6IHRydWUsXG4gICAgZm9udFdlaWdodDogdHJ1ZSxcbiAgICBmb250U2l6ZTogdHJ1ZSxcbiAgICBsaW5lSGVpZ2h0OiB0cnVlLFxuICAgIGZvbnRGYW1pbHk6IHRydWVcbiAgfVxufTtcblxudmFyIENTU1Byb3BlcnR5ID0ge1xuICBpc1VuaXRsZXNzTnVtYmVyOiBpc1VuaXRsZXNzTnVtYmVyLFxuICBzaG9ydGhhbmRQcm9wZXJ0eUV4cGFuc2lvbnM6IHNob3J0aGFuZFByb3BlcnR5RXhwYW5zaW9uc1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQ1NTUHJvcGVydHlcbiIsIlxuaW1wb3J0IEJhc2VFbGVtZW50IGZyb20gXCIuLi9lbGVtZW50cy9CYXNlRWxlbWVudFwiXG5pbXBvcnQgQ3JlYXR1cmUgZnJvbSBcIi4uL0NyZWF0dXJlXCJcbmltcG9ydCBDb250cm9scyBmcm9tICcuLi9jb250cm9scy9pbmRleCdcbmltcG9ydCBFeGVjdXRpb25NZXRhIGZyb20gXCIuLi9FeGVjdXRpb25NZXRhXCJcbmltcG9ydCBVdGlscyBmcm9tICcuJ1xuXG5sZXQgZXhlY3V0ZVNpbmdsZSA9IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICBsZXQgY2FsbGJhY2sgPSBjb2RlQ2FsbGJhY2tzW2NvZGUudHlwZV1cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IHIgPSBjYWxsYmFjayhjb2RlLCBtZXRhKVxuICAgICAgICByZXR1cm4gclxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjb2RlXG4gICAgfVxufVxuXG5sZXQgZXhlY3V0ZUJsb2NrID0gKGNvZGVzOiBBcnJheTxhbnk+LCBtZXRhOiBFeGVjdXRpb25NZXRhKSA9PiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgY29kZSA9IGNvZGVzW2ldXG4gICAgICAgIGxldCByID0gZXhlY3V0ZVNpbmdsZShjb2RlLCBtZXRhKVxuICAgICAgICBpZiAocj8ucmV0dXJuRmlyZWQpIHJldHVybiByXG4gICAgfVxufVxuXG5sZXQgZmluZExheWVyID0gKG1ldGE6IEV4ZWN1dGlvbk1ldGEsIGlkOiBzdHJpbmcpID0+IHtcbiAgICBmb3IgKGxldCBpID0gbWV0YS5jcmVhdHVyZS5ydW50aW1lLnN0YWNrLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGxldCByID0gbWV0YS5jcmVhdHVyZS5fcnVudGltZS5zdGFja1tpXS5maW5kVW5pdChpZClcbiAgICAgICAgaWYgKHIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIG1ldGEuY3JlYXR1cmUucnVudGltZS5zdGFja1tpXVxuICAgICAgICB9XG4gICAgfVxufVxuXG5jb25zdCBnZW5lcmF0ZUNhbGxiYWNrRnVuY3Rpb24gPSAoY29kZTogYW55LCBtZXRhOiBFeGVjdXRpb25NZXRhKSA9PiB7XG4gICAgbGV0IG5ld01ldGFCcmFuY2ggPSBtZXRhXG4gICAgcmV0dXJuICguLi5hcmdzOiBBcnJheTxhbnk+KSA9PiB7XG4gICAgICAgIGxldCBwYXJhbWV0ZXJzID0ge31cbiAgICAgICAgY29kZS5wYXJhbXMuZm9yRWFjaCgocGFyYW06IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgcGFyYW1ldGVyc1twYXJhbS5uYW1lXSA9IGFyZ3NbaW5kZXhdXG4gICAgICAgIH0pXG4gICAgICAgIGxldCBmaXJzdFBhcmFtID0gYXJnc1swXVxuICAgICAgICBpZiAoZmlyc3RQYXJhbSAmJiAoZmlyc3RQYXJhbSBpbnN0YW5jZW9mIEV4ZWN1dGlvbk1ldGEpICYmIGZpcnN0UGFyYW0uaXNBbm90aGVyQ3JlYXR1cmUpIHtcbiAgICAgICAgICAgIG5ld01ldGFCcmFuY2ggPSBmaXJzdFBhcmFtXG4gICAgICAgIH1cbiAgICAgICAgbmV3TWV0YUJyYW5jaC5jcmVhdHVyZS5ydW50aW1lLnB1c2hPblN0YWNrKHBhcmFtZXRlcnMpXG4gICAgICAgIGxldCByZXN1bHQgPSBleGVjdXRlU2luZ2xlKGNvZGUuYm9keSwgbmV3TWV0YUJyYW5jaClcbiAgICAgICAgbmV3TWV0YUJyYW5jaC5jcmVhdHVyZS5ydW50aW1lLnBvcEZyb21TdGFjaygpXG4gICAgICAgIHJldHVybiByZXN1bHQ/LnZhbHVlXG4gICAgfVxufVxuXG5sZXQgY29kZUNhbGxiYWNrcyA9IHtcbiAgICBVbmFyeUV4cHJlc3Npb246IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgaWYgKGNvZGUub3BlcmF0b3IgPT09ICchJykge1xuICAgICAgICAgICAgcmV0dXJuICFleGVjdXRlU2luZ2xlKGNvZGUuYXJndW1lbnQsIG1ldGEpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIExvZ2ljYWxFeHByZXNzaW9uOiAoY29kZTogYW55LCBtZXRhOiBFeGVjdXRpb25NZXRhKSA9PiB7XG4gICAgICAgIGlmIChjb2RlLm9wZXJhdG9yID09PSAnJiYnKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVNpbmdsZShjb2RlLmxlZnQsIG1ldGEpICYmIGV4ZWN1dGVTaW5nbGUoY29kZS5yaWdodCwgbWV0YSlcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlLm9wZXJhdG9yID09PSAnfHwnKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVNpbmdsZShjb2RlLmxlZnQsIG1ldGEpIHx8IGV4ZWN1dGVTaW5nbGUoY29kZS5yaWdodCwgbWV0YSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgQ29uZGl0aW9uYWxFeHByZXNzaW9uOiAoY29kZTogYW55LCBtZXRhOiBFeGVjdXRpb25NZXRhKSA9PiB7XG4gICAgICAgIHJldHVybiBleGVjdXRlU2luZ2xlKGNvZGUudGVzdCwgbWV0YSkgPyBleGVjdXRlU2luZ2xlKGNvZGUuY29uc2VxdWVudCwgbWV0YSkgOiBleGVjdXRlU2luZ2xlKGNvZGUuYWx0ZXJuYXRlLCBtZXRhKVxuICAgIH0sXG4gICAgVGhpc0V4cHJlc3Npb246IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgcmV0dXJuIG1ldGEuY3JlYXR1cmUudGhpc09ialxuICAgIH0sXG4gICAgSlNYRXhwcmVzc2lvbkNvbnRhaW5lcjogKGNvZGU6IGFueSwgbWV0YTogRXhlY3V0aW9uTWV0YSkgPT4ge1xuICAgICAgICByZXR1cm4gZXhlY3V0ZVNpbmdsZShjb2RlLmV4cHJlc3Npb24sIG1ldGEpXG4gICAgfSxcbiAgICBKU1hUZXh0OiAoY29kZTogYW55LCBtZXRhOiBFeGVjdXRpb25NZXRhKSA9PiB7XG4gICAgICAgIHJldHVybiBjb2RlLnZhbHVlLnRyaW0oKTtcbiAgICB9LFxuICAgIEpTWEVsZW1lbnQ6IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgaWYgKCFjb2RlLmNvc21vSWQpIGNvZGUuY29zbW9JZCA9IFV0aWxzLmdlbmVyYXRvci5nZW5lcmF0ZUtleSgpXG4gICAgICAgIGxldCBDb250cm9sID0gbWV0YS5jcmVhdHVyZS5tb2R1bGUuYXBwbGV0LmZpbmRNb2R1bGUoY29kZS5vcGVuaW5nRWxlbWVudC5uYW1lLm5hbWUpXG4gICAgICAgIGxldCBhdHRycyA9IHt9XG4gICAgICAgIGNvZGUub3BlbmluZ0VsZW1lbnQuYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGF0dHJzW2F0dHIubmFtZS5uYW1lXSA9IGV4ZWN1dGVTaW5nbGUoYXR0ci52YWx1ZSwgbWV0YSlcbiAgICAgICAgfSlcbiAgIFxuICAgICAgICBsZXQga2V5ID0gYXR0cnNbJ2tleSddXG4gICAgICAgIGlmIChrZXkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAga2V5ID0gY29kZS5jb3Ntb0lkXG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1ldGEucGFyZW50SnN4S2V5KSBrZXkgPSBtZXRhLnBhcmVudEpzeEtleSArICctJyArIGtleVxuICAgICAgICBhdHRyc1sna2V5J10gPSBrZXlcblxuICAgICAgICBsZXQgYyA9IG1ldGEuY3JlYXR1cmUubW9kdWxlLmFwcGxldC5jYWNoZS5lbGVtZW50c1trZXldO1xuICAgICAgICBsZXQgaXNOZXcgPSAoYyA9PT0gdW5kZWZpbmVkKVxuXG4gICAgICAgIGMgPSBDb250cm9sLmluc3RhbnRpYXRlKGF0dHJzLCBhdHRyc1snc3R5bGUnXSwgW10sIGM/LnRoaXNPYmopXG5cbiAgICAgICAgbGV0IGNoaWxkTWV0YSA9IG5ldyBFeGVjdXRpb25NZXRhKHsgLi4ubWV0YSwgcGFyZW50SnN4S2V5OiBrZXkgfSlcbiAgICAgICAgbGV0IGNoaWxkcmVuID0gY29kZS5jaGlsZHJlbi5tYXAoKGNoaWxkOiBhbnkpID0+IGV4ZWN1dGVTaW5nbGUoY2hpbGQsIGNoaWxkTWV0YSkpXG4gICAgICAgICAgICAuZmxhdChJbmZpbml0eSkuZmlsdGVyKChjaGlsZDogYW55KSA9PiAoY2hpbGQgIT09ICcnKSlcbiAgICAgICAgYy5maWxsQ2hpbGRyZW4oY2hpbGRyZW4pXG4gICAgICAgIGlmIChtZXRhLnBhcmVudEpzeEtleSkgYy50aGlzT2JqLnBhcmVudEpzeEtleSA9IG1ldGEucGFyZW50SnN4S2V5XG5cbiAgICAgICAgbGV0IG5ld01ldGFCcmFuY2ggPSBVdGlscy5nZW5lcmF0b3IubmVzdGVkQ29udGV4dChjLCB7IC4uLm1ldGEsIHBhcmVudEpzeEtleToga2V5IH0pXG4gICAgICAgIG1ldGEuY3JlYXR1cmUubW9kdWxlLmFwcGxldC5jYWNoZS5lbGVtZW50c1trZXldID0gY1xuICAgICAgICBpZiAoaXNOZXcpIGMuZ2V0QmFzZU1ldGhvZCgnY29uc3RydWN0b3InKShuZXdNZXRhQnJhbmNoKVxuICAgICAgICBpZiAobWV0YS5jcmVhdHVyZS5tb2R1bGUuYXBwbGV0LmZpcnN0TW91bnQpIHtcbiAgICAgICAgICAgIGMuZ2V0QmFzZU1ldGhvZCgnb25Nb3VudCcpKG5ld01ldGFCcmFuY2gpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXRhLmNyZWF0dXJlLm1vZHVsZS5hcHBsZXQuY2FjaGUubW91bnRzLnB1c2goKCkgPT4gYy5nZXRCYXNlTWV0aG9kKCdvbk1vdW50JykobmV3TWV0YUJyYW5jaCkpXG4gICAgICAgIH1cbiAgICAgICAgbGV0IHIgPSBjLmdldEJhc2VNZXRob2QoJ3JlbmRlcicpKG5ld01ldGFCcmFuY2gpXG4gICAgICAgIGlmICghbWV0YS5jcmVhdHVyZS5tb2R1bGUuYXBwbGV0Lm9sZFZlcnNpb25zW2MuX2tleV0pIHtcbiAgICAgICAgICAgIG1ldGEuY3JlYXR1cmUubW9kdWxlLmFwcGxldC5vbGRWZXJzaW9uc1tjLl9rZXldID0gclxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByXG4gICAgfSxcbiAgICBQcm9ncmFtOiAoY29kZTogYW55LCBtZXRhOiBFeGVjdXRpb25NZXRhKSA9PiB7XG4gICAgICAgIGNvZGUuYm9keS5mb3JFYWNoKChjaGlsZDogYW55KSA9PiB7XG4gICAgICAgICAgICBleGVjdXRlU2luZ2xlKGNoaWxkLCBtZXRhKVxuICAgICAgICB9KVxuICAgIH0sXG4gICAgTGl0ZXJhbDogKGNvZGU6IGFueSwgbWV0YTogRXhlY3V0aW9uTWV0YSkgPT4ge1xuICAgICAgICByZXR1cm4gY29kZS52YWx1ZVxuICAgIH0sXG4gICAgRnVuY3Rpb25FeHByZXNzaW9uOiAoY29kZTogYW55LCBtZXRhOiBFeGVjdXRpb25NZXRhKSA9PiB7XG4gICAgICAgIGxldCBuZXdDcmVhdHVyZUJyYW5jaCA9IG5ldyBDcmVhdHVyZShtZXRhLmNyZWF0dXJlLm1vZHVsZSwgeyAuLi5tZXRhLmNyZWF0dXJlLCBydW50aW1lOiBtZXRhLmNyZWF0dXJlLnJ1bnRpbWUuY2xvbmUoKSB9KVxuICAgICAgICBsZXQgbmV3TWV0YUJyYW5jaCA9IG5ldyBFeGVjdXRpb25NZXRhKHsgLi4ubWV0YSwgY3JlYXR1cmU6IG5ld0NyZWF0dXJlQnJhbmNoIH0pXG4gICAgICAgIHJldHVybiBnZW5lcmF0ZUNhbGxiYWNrRnVuY3Rpb24oY29kZSwgbmV3TWV0YUJyYW5jaClcbiAgICB9LFxuICAgIEZ1bmN0aW9uRGVjbGFyYXRpb246IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgbGV0IG5ld0NyZWF0dXJlQnJhbmNoID0gbmV3IENyZWF0dXJlKG1ldGEuY3JlYXR1cmUubW9kdWxlLCB7IC4uLm1ldGEuY3JlYXR1cmUsIHJ1bnRpbWU6IG1ldGEuY3JlYXR1cmUucnVudGltZS5jbG9uZSgpIH0pXG4gICAgICAgIGxldCBuZXdNZXRhQnJhbmNoID0gbmV3IEV4ZWN1dGlvbk1ldGEoeyAuLi5tZXRhLCBjcmVhdHVyZTogbmV3Q3JlYXR1cmVCcmFuY2ggfSlcbiAgICAgICAgbWV0YS5jcmVhdHVyZS5ydW50aW1lLnN0YWNrVG9wLnB1dFVuaXQoY29kZS5pZC5uYW1lLCBnZW5lcmF0ZUNhbGxiYWNrRnVuY3Rpb24oY29kZSwgbmV3TWV0YUJyYW5jaCkpXG4gICAgfSxcbiAgICBNZXRob2REZWZpbml0aW9uOiAoY29kZTogYW55LCBtZXRhOiBFeGVjdXRpb25NZXRhKSA9PiB7XG4gICAgICAgIG1ldGEuY3JlYXR1cmUucnVudGltZS5zdGFja1RvcC5wdXRVbml0KGNvZGUua2V5Lm5hbWUsIGV4ZWN1dGVTaW5nbGUoY29kZS52YWx1ZSwgbWV0YSkpXG4gICAgfSxcbiAgICBWYXJpYWJsZURlY2xhcmF0aW9uOiAoY29kZTogYW55LCBtZXRhOiBFeGVjdXRpb25NZXRhKSA9PiB7XG4gICAgICAgIGlmIChjb2RlLmtpbmQgPT09ICdsZXQnKSB7XG4gICAgICAgICAgICBjb2RlLmRlY2xhcmF0aW9ucy5mb3JFYWNoKChkOiBhbnkpID0+IGV4ZWN1dGVTaW5nbGUoZCwgbmV3IEV4ZWN1dGlvbk1ldGEoeyAuLi5tZXRhLCBkZWNsYXJhdGlvbjogdHJ1ZSwgZGVjbGFyYXRpb25UeXBlOiAnbGV0JyB9KSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUua2luZCA9PT0gJ2NvbnN0Jykge1xuICAgICAgICAgICAgY29kZS5kZWNsYXJhdGlvbnMuZm9yRWFjaCgoZDogYW55KSA9PiBleGVjdXRlU2luZ2xlKGQsIG5ldyBFeGVjdXRpb25NZXRhKHsgLi4ubWV0YSwgZGVjbGFyYXRpb246IHRydWUsIGRlY2xhcmF0aW9uVHlwZTogJ2NvbnN0JyB9KSkpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBWYXJpYWJsZURlY2xhcmF0b3I6IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgaWYgKG1ldGE/LmRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICBsZXQgdmFsID0gZXhlY3V0ZVNpbmdsZShjb2RlLmluaXQsIG1ldGEpXG4gICAgICAgICAgICBpZiAoY29kZS5pZC50eXBlID09PSAnT2JqZWN0UGF0dGVybicpIHtcbiAgICAgICAgICAgICAgICBjb2RlLmlkLnByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydHk6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBtZXRhLmNyZWF0dXJlLnJ1bnRpbWUuc3RhY2tUb3AucHV0VW5pdChwcm9wZXJ0eS5rZXkubmFtZSwgdmFsW3Byb3BlcnR5LmtleS5uYW1lXSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWV0YS5jcmVhdHVyZS5ydW50aW1lLnN0YWNrVG9wLnB1dFVuaXQoY29kZS5pZC5uYW1lLCB2YWwpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIElkZW50aWZpZXI6IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgaWYgKG1ldGEucmV0dXJuSWRQYXJlbnQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBtZXRhLmNyZWF0dXJlLnJ1bnRpbWUuc3RhY2subGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBsZXQgd3JhcHBlciA9IGZpbmRMYXllcihtZXRhLCBjb2RlLm5hbWUpXG4gICAgICAgICAgICAgICAgaWYgKHdyYXBwZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgcGFyZW50OiB3cmFwcGVyLnVuaXRzLCBpZDogY29kZS5uYW1lIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gbWV0YS5jcmVhdHVyZS5ydW50aW1lLnN0YWNrLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgbGV0IHIgPSBtZXRhLmNyZWF0dXJlLnJ1bnRpbWUuc3RhY2tbaV0uZmluZFVuaXQoY29kZS5uYW1lKVxuICAgICAgICAgICAgICAgIGlmIChyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIEJpbmFyeUV4cHJlc3Npb246IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgaWYgKGNvZGUub3BlcmF0b3IgPT09ICcrJykge1xuICAgICAgICAgICAgcmV0dXJuIGV4ZWN1dGVTaW5nbGUoY29kZS5sZWZ0LCBtZXRhKSArIGV4ZWN1dGVTaW5nbGUoY29kZS5yaWdodCwgbWV0YSlcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlLm9wZXJhdG9yID09PSAnLScpIHtcbiAgICAgICAgICAgIHJldHVybiBleGVjdXRlU2luZ2xlKGNvZGUubGVmdCwgbWV0YSkgLSBleGVjdXRlU2luZ2xlKGNvZGUucmlnaHQsIG1ldGEpXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZS5vcGVyYXRvciA9PT0gJyonKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVNpbmdsZShjb2RlLmxlZnQsIG1ldGEpICogZXhlY3V0ZVNpbmdsZShjb2RlLnJpZ2h0LCBtZXRhKVxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUub3BlcmF0b3IgPT09ICcvJykge1xuICAgICAgICAgICAgcmV0dXJuIGV4ZWN1dGVTaW5nbGUoY29kZS5sZWZ0LCBtZXRhKSAvIGV4ZWN1dGVTaW5nbGUoY29kZS5yaWdodCwgbWV0YSlcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlLm9wZXJhdG9yID09PSAnXicpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnBvdyhleGVjdXRlU2luZ2xlKGNvZGUubGVmdCwgbWV0YSksIGV4ZWN1dGVTaW5nbGUoY29kZS5yaWdodCwgbWV0YSkpXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZS5vcGVyYXRvciA9PT0gJyUnKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVNpbmdsZShjb2RlLmxlZnQsIG1ldGEpICUgZXhlY3V0ZVNpbmdsZShjb2RlLnJpZ2h0LCBtZXRhKVxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUub3BlcmF0b3IgPT09ICc9PT0nKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVNpbmdsZShjb2RlLmxlZnQsIG1ldGEpID09PSBleGVjdXRlU2luZ2xlKGNvZGUucmlnaHQsIG1ldGEpXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZS5vcGVyYXRvciA9PT0gJzwnKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVNpbmdsZShjb2RlLmxlZnQsIG1ldGEpIDwgZXhlY3V0ZVNpbmdsZShjb2RlLnJpZ2h0LCBtZXRhKVxuICAgICAgICB9IGVsc2UgaWYgKGNvZGUub3BlcmF0b3IgPT09ICc+Jykge1xuICAgICAgICAgICAgcmV0dXJuIGV4ZWN1dGVTaW5nbGUoY29kZS5sZWZ0LCBtZXRhKSA+IGV4ZWN1dGVTaW5nbGUoY29kZS5yaWdodCwgbWV0YSlcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlLm9wZXJhdG9yID09PSAnJicpIHtcbiAgICAgICAgICAgIHJldHVybiBleGVjdXRlU2luZ2xlKGNvZGUubGVmdCwgbWV0YSkgJiBleGVjdXRlU2luZ2xlKGNvZGUucmlnaHQsIG1ldGEpXG4gICAgICAgIH0gZWxzZSBpZiAoY29kZS5vcGVyYXRvciA9PT0gJ3wnKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVNpbmdsZShjb2RlLmxlZnQsIG1ldGEpIHwgZXhlY3V0ZVNpbmdsZShjb2RlLnJpZ2h0LCBtZXRhKVxuICAgICAgICB9XG4gICAgfSxcbiAgICBJZlN0YXRlbWVudDogKGNvZGU6IGFueSwgbWV0YTogRXhlY3V0aW9uTWV0YSkgPT4ge1xuICAgICAgICBpZiAoZXhlY3V0ZVNpbmdsZShjb2RlLnRlc3QsIG1ldGEpKSB7XG4gICAgICAgICAgICBsZXQgciA9IGV4ZWN1dGVTaW5nbGUoY29kZS5jb25zZXF1ZW50LCBtZXRhKVxuICAgICAgICAgICAgaWYgKHI/LmJyZWFrRmlyZWQpIHJldHVybiByXG4gICAgICAgICAgICBlbHNlIGlmIChyPy5yZXR1cm5GaXJlZCkgcmV0dXJuIHJcbiAgICAgICAgfSBlbHNlIGlmIChjb2RlLmFsdGVybmF0ZSkge1xuICAgICAgICAgICAgbGV0IHIgPSBleGVjdXRlU2luZ2xlKGNvZGUuYWx0ZXJuYXRlLCBtZXRhKVxuICAgICAgICAgICAgaWYgKHI/LmJyZWFrRmlyZWQpIHJldHVybiByXG4gICAgICAgICAgICBlbHNlIGlmIChyPy5yZXR1cm5GaXJlZCkgcmV0dXJuIHJcbiAgICAgICAgfVxuICAgIH0sXG4gICAgQnJlYWtTdGF0ZW1lbnQ6IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgcmV0dXJuIHsgYnJlYWtGaXJlZDogdHJ1ZSB9O1xuICAgIH0sXG4gICAgV2hpbGVTdGF0ZW1lbnQ6IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgd2hpbGUgKGV4ZWN1dGVTaW5nbGUoY29kZS50ZXN0LCBtZXRhKSkge1xuICAgICAgICAgICAgbGV0IHIgPSBleGVjdXRlU2luZ2xlKGNvZGUuYm9keSwgbWV0YSlcbiAgICAgICAgICAgIGlmIChyPy5icmVha0ZpcmVkKSBicmVha1xuICAgICAgICAgICAgZWxzZSBpZiAocj8ucmV0dXJuRmlyZWQpIHJldHVybiByXG4gICAgICAgIH1cbiAgICB9LFxuICAgIEJsb2NrU3RhdGVtZW50OiAoY29kZTogYW55LCBtZXRhOiBFeGVjdXRpb25NZXRhKSA9PiB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29kZS5ib2R5Py5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IHIgPSBleGVjdXRlU2luZ2xlKGNvZGUuYm9keVtpXSwgbWV0YSlcbiAgICAgICAgICAgIGlmIChyPy5icmVha0ZpcmVkKSByZXR1cm4gclxuICAgICAgICAgICAgZWxzZSBpZiAocj8ucmV0dXJuRmlyZWQpIHJldHVybiByXG4gICAgICAgIH1cbiAgICB9LFxuICAgIEV4cHJlc3Npb25TdGF0ZW1lbnQ6IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgcmV0dXJuIGV4ZWN1dGVTaW5nbGUoY29kZS5leHByZXNzaW9uLCBtZXRhKVxuICAgIH0sXG4gICAgQXNzaWdubWVudEV4cHJlc3Npb246IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgbGV0IHJpZ2h0ID0gZXhlY3V0ZVNpbmdsZShjb2RlLnJpZ2h0LCBtZXRhKVxuICAgICAgICBsZXQgd3JhcHBlciA9IGV4ZWN1dGVTaW5nbGUoY29kZS5sZWZ0LCB7IC4uLm1ldGEsIHJldHVybklkUGFyZW50OiB0cnVlIH0pXG4gICAgICAgIGlmICh3cmFwcGVyKSB7XG4gICAgICAgICAgICBpZiAod3JhcHBlci5wYXJlbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxldCBiZWZvcmUgPSB3cmFwcGVyLnBhcmVudFt3cmFwcGVyLmlkXVxuICAgICAgICAgICAgICAgIGlmIChjb2RlLm9wZXJhdG9yID09PSAnPScpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlci5wYXJlbnRbd3JhcHBlci5pZF0gPSByaWdodFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29kZS5vcGVyYXRvciA9PT0gJys9Jykge1xuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyLnBhcmVudFt3cmFwcGVyLmlkXSA9IGJlZm9yZSArIHJpZ2h0XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb2RlLm9wZXJhdG9yID09PSAnLT0nKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXIucGFyZW50W3dyYXBwZXIuaWRdID0gYmVmb3JlIC0gcmlnaHRcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvZGUub3BlcmF0b3IgPT09ICcqPScpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlci5wYXJlbnRbd3JhcHBlci5pZF0gPSBiZWZvcmUgKiByaWdodFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29kZS5vcGVyYXRvciA9PT0gJy89Jykge1xuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyLnBhcmVudFt3cmFwcGVyLmlkXSA9IGJlZm9yZSAvIHJpZ2h0XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb2RlLm9wZXJhdG9yID09PSAnXj0nKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXIucGFyZW50W3dyYXBwZXIuaWRdID0gTWF0aC5wb3coYmVmb3JlLCByaWdodClcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvZGUub3BlcmF0b3IgPT09ICclPScpIHtcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlci5wYXJlbnRbd3JhcHBlci5pZF0gPSBiZWZvcmUgJSByaWdodFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGxheWVyID0gZmluZExheWVyKG1ldGEsIHdyYXBwZXIuaWQpXG4gICAgICAgICAgICAgICAgaWYgKGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByID0gbGF5ZXIuZmluZFVuaXQod3JhcHBlci5pZClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb2RlLm9wZXJhdG9yID09PSAnPScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByID0gcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29kZS5vcGVyYXRvciA9PT0gJys9Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIgKz0gcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29kZS5vcGVyYXRvciA9PT0gJy09Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIgLT0gcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29kZS5vcGVyYXRvciA9PT0gJyo9Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIgKj0gcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29kZS5vcGVyYXRvciA9PT0gJy89Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIgLz0gcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29kZS5vcGVyYXRvciA9PT0gJ149Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIgPSBNYXRoLnBvdyhyLCByaWdodClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29kZS5vcGVyYXRvciA9PT0gJyU9Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIgJT0gcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLnB1dFVuaXQoY29kZS5uYW1lLCByKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBGb3JTdGF0ZW1lbnQ6IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgZm9yIChleGVjdXRlU2luZ2xlKGNvZGUuaW5pdCwgbWV0YSk7IGV4ZWN1dGVTaW5nbGUoY29kZS50ZXN0LCBtZXRhKTsgZXhlY3V0ZVNpbmdsZShjb2RlLnVwZGF0ZSwgbWV0YSkpIHtcbiAgICAgICAgICAgIGxldCByID0gZXhlY3V0ZVNpbmdsZShjb2RlLmJvZHksIG1ldGEpXG4gICAgICAgICAgICBpZiAocj8uYnJlYWtGaXJlZCkgYnJlYWtcbiAgICAgICAgICAgIGVsc2UgaWYgKHI/LnJldHVybkZpcmVkKSByZXR1cm4gclxuICAgICAgICB9XG4gICAgfSxcbiAgICBVcGRhdGVFeHByZXNzaW9uOiAoY29kZTogYW55LCBtZXRhOiBFeGVjdXRpb25NZXRhKSA9PiB7XG4gICAgICAgIGlmIChbJysrJywgJy0tJ10uaW5jbHVkZXMoY29kZS5vcGVyYXRvcikpIHtcbiAgICAgICAgICAgIGxldCB3cmFwcGVyID0gZXhlY3V0ZVNpbmdsZShjb2RlLmFyZ3VtZW50LCB7IC4uLm1ldGEsIHJldHVybklkUGFyZW50OiB0cnVlIH0pXG4gICAgICAgICAgICBpZiAod3JhcHBlcikge1xuICAgICAgICAgICAgICAgIGlmICh3cmFwcGVyLnBhcmVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBiZWZvcmUgPSB3cmFwcGVyLnBhcmVudFt3cmFwcGVyLmlkXVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGJlZm9yZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb2RlLm9wZXJhdG9yID09PSAnKysnKSBiZWZvcmUrK1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY29kZS5vcGVyYXRvciA9PT0gJy0tJykgYmVmb3JlLS1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdyYXBwZXIucGFyZW50W3dyYXBwZXIuaWRdID0gYmVmb3JlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGF5ZXIgPSBmaW5kTGF5ZXIobWV0YSwgd3JhcHBlci5pZClcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgciA9IGxheWVyLmZpbmRVbml0KHdyYXBwZXIuaWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgciA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGUub3BlcmF0b3IgPT09ICcrKycpIHIrK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjb2RlLm9wZXJhdG9yID09PSAnLS0nKSByLS1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF5ZXIucHV0VW5pdChjb2RlLm5hbWUsIHIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBDYWxsRXhwcmVzc2lvbjogKGNvZGU6IGFueSwgbWV0YTogRXhlY3V0aW9uTWV0YSkgPT4ge1xuICAgICAgICBsZXQgcHJvcCA9IHVuZGVmaW5lZFxuICAgICAgICBpZiAoY29kZS5wcm9wZXJ0eSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBsZXQgciA9IGV4ZWN1dGVTaW5nbGUoY29kZS5jYWxsZWUsIG1ldGEpO1xuICAgICAgICAgICAgcmV0dXJuIHIoLi4uY29kZS5hcmd1bWVudHMubWFwKChjOiBhbnkpID0+IGV4ZWN1dGVTaW5nbGUoYywgbWV0YSkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb2RlLmNhbGxlZS5wcm9wZXJ0eS50eXBlID09PSAnSWRlbnRpZmllcicpIHtcbiAgICAgICAgICAgICAgICBwcm9wID0gY29kZS5jYWxsZWUucHJvcGVydHkubmFtZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHIgPSBleGVjdXRlU2luZ2xlKGNvZGUuY2FsbGVlLm9iamVjdCwgbWV0YSk7XG4gICAgICAgICAgICByZXR1cm4gcltwcm9wXSguLi5jb2RlLmFyZ3VtZW50cy5tYXAoKGM6IGFueSkgPT4gZXhlY3V0ZVNpbmdsZShjLCBtZXRhKSkpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIE1lbWJlckV4cHJlc3Npb246IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgbGV0IHByb3AgPSB1bmRlZmluZWRcbiAgICAgICAgaWYgKGNvZGUucHJvcGVydHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbGV0IHIgPSBleGVjdXRlU2luZ2xlKGNvZGUub2JqZWN0LCBtZXRhKTtcbiAgICAgICAgICAgIGlmIChtZXRhLnJldHVybklkUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgcGFyZW50OiB1bmRlZmluZWQsIGlkOiBjb2RlLm5hbWUgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb2RlLmNvbXB1dGVkKSB7XG4gICAgICAgICAgICAgICAgcHJvcCA9IGV4ZWN1dGVTaW5nbGUoY29kZS5wcm9wZXJ0eSwgbWV0YSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjb2RlLnByb3BlcnR5LnR5cGUgPT09ICdJZGVudGlmaWVyJykge1xuICAgICAgICAgICAgICAgICAgICBwcm9wID0gY29kZS5wcm9wZXJ0eS5uYW1lXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb2RlLnByb3BlcnR5LnR5cGUgPT09ICdMaXRlcmFsJykge1xuICAgICAgICAgICAgICAgICAgICBwcm9wID0gY29kZS5wcm9wZXJ0eS52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZmlsdGVyZWRNZXRhID0geyAuLi5tZXRhIH1cbiAgICAgICAgICAgIGRlbGV0ZSBmaWx0ZXJlZE1ldGFbJ3JldHVybklkUGFyZW50J11cbiAgICAgICAgICAgIGxldCByID0gZXhlY3V0ZVNpbmdsZShjb2RlLm9iamVjdCwgZmlsdGVyZWRNZXRhKTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHIpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHAgPSByW3Byb3BdO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKC4uLmFyZ3M6IEFycmF5PGFueT4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAocHJvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3B1c2gnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByLnB1c2goLi4uYXJncylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbWFwJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gci5tYXAoLi4uYXJncylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZm9yRWFjaCc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHIuZm9yRWFjaCguLi5hcmdzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV0YS5yZXR1cm5JZFBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgcGFyZW50OiByLCBpZDogcHJvcCB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcltwcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG1ldGEucmV0dXJuSWRQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgcGFyZW50OiByLCBpZDogcHJvcCB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJbcHJvcF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBTd2l0Y2hTdGF0ZW1lbnQ6IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgbGV0IGRpc2MgPSBleGVjdXRlU2luZ2xlKGNvZGUuZGlzY3JpbWluYW50LCBtZXRhKVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvZGUuY2FzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBjID0gY29kZS5jYXNlc1tpXVxuICAgICAgICAgICAgaWYgKGMudHlwZSA9PT0gJ1N3aXRjaENhc2UnKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNhc2VDb25kID0gZXhlY3V0ZVNpbmdsZShjLnRlc3QsIG1ldGEpO1xuICAgICAgICAgICAgICAgIGlmIChkaXNjID09PSBjYXNlQ29uZCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGMuY29uc2VxdWVudC5sZW5ndGhsOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjbyA9IGMuY29uc2VxdWVudFtqXVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHIgPSBleGVjdXRlU2luZ2xlKGNvLCBtZXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHI/LnJldHVybkZpcmVkKSByZXR1cm4gclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBBcnJvd0Z1bmN0aW9uRXhwcmVzc2lvbjogKGNvZGU6IGFueSwgbWV0YTogRXhlY3V0aW9uTWV0YSkgPT4ge1xuICAgICAgICBsZXQgbmV3Q3JlYXR1cmVCcmFuY2ggPSBuZXcgQ3JlYXR1cmUobWV0YS5jcmVhdHVyZS5tb2R1bGUsIHsgLi4ubWV0YS5jcmVhdHVyZSwgcnVudGltZTogbWV0YS5jcmVhdHVyZS5ydW50aW1lLmNsb25lKCkgfSlcbiAgICAgICAgbGV0IG5ld01ldGFCcmFuY2ggPSBuZXcgRXhlY3V0aW9uTWV0YSh7IC4uLm1ldGEsIGNyZWF0dXJlOiBuZXdDcmVhdHVyZUJyYW5jaCB9KVxuICAgICAgICByZXR1cm4gZ2VuZXJhdGVDYWxsYmFja0Z1bmN0aW9uKGNvZGUsIG5ld01ldGFCcmFuY2gpXG4gICAgfSxcbiAgICBPYmplY3RFeHByZXNzaW9uOiAoY29kZTogYW55LCBtZXRhOiBFeGVjdXRpb25NZXRhKSA9PiB7XG4gICAgICAgIGxldCBvYmogPSB7fVxuICAgICAgICBjb2RlLnByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydHk6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3BlcnR5LnR5cGUgPT09ICdQcm9wZXJ0eScpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkua2V5LnR5cGUgPT09ICdJZGVudGlmaWVyJykge1xuICAgICAgICAgICAgICAgICAgICBvYmpbcHJvcGVydHkua2V5Lm5hbWVdID0gZXhlY3V0ZVNpbmdsZShwcm9wZXJ0eS52YWx1ZSwgbWV0YSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS50eXBlID09PSAnU3ByZWFkRWxlbWVudCcpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3Byb3BlcnR5LmFyZ3VtZW50Lm5hbWVdID0gZXhlY3V0ZVNpbmdsZShwcm9wZXJ0eSwgbWV0YSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBvYmpcbiAgICB9LFxuICAgIEFycmF5RXhwcmVzc2lvbjogKGNvZGU6IGFueSwgbWV0YTogRXhlY3V0aW9uTWV0YSkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gW11cbiAgICAgICAgY29kZS5lbGVtZW50cy5mb3JFYWNoKChhcnJFbDogYW55KSA9PiB7XG4gICAgICAgICAgICBsZXQgciA9IGV4ZWN1dGVTaW5nbGUoYXJyRWwsIG1ldGEpXG4gICAgICAgICAgICBpZiAoKGFyckVsLnR5cGUgPT09ICdTcHJlYWRFbGVtZW50JykgJiYgQXJyYXkuaXNBcnJheShyKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKC4uLnIpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9LFxuICAgIFNwcmVhZEVsZW1lbnQ6IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgbGV0IHNvdXJjZSA9IGV4ZWN1dGVTaW5nbGUoY29kZS5hcmd1bWVudCwgbWV0YSlcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgICAgICAgcmV0dXJuIFsuLi5zb3VyY2VdXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4geyAuLi5zb3VyY2UgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBSZXR1cm5TdGF0ZW1lbnQ6IChjb2RlOiBhbnksIG1ldGE6IEV4ZWN1dGlvbk1ldGEpID0+IHtcbiAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGV4ZWN1dGVTaW5nbGUoY29kZS5hcmd1bWVudCwgbWV0YSksIHJldHVybkZpcmVkOiB0cnVlIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgZXhlY3V0ZVNpbmdsZSwgZXhlY3V0ZUJsb2NrLCBFeGVjdXRpb25NZXRhIH1cbiIsIlxuaW1wb3J0IEJhc2VFbGVtZW50IGZyb20gXCIuLi9lbGVtZW50cy9CYXNlRWxlbWVudFwiO1xuaW1wb3J0IEJhc2VQcm9wIGZyb20gXCIuLi9wcm9wcy9CYXNlUHJvcFwiO1xuaW1wb3J0IEV4ZWN1dGlvbk1ldGEgZnJvbSBcIi4uL0V4ZWN1dGlvbk1ldGFcIjtcbmltcG9ydCBDcmVhdHVyZSBmcm9tIFwiLi4vQ3JlYXR1cmVcIjtcblxubGV0IGdlbmVyYXRlS2V5ID0gKCkgPT4ge1xuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpXG59XG5cbmZ1bmN0aW9uIGNsb25lPFQ+KGluc3RhbmNlOiBUKTogVCB7XG4gICAgY29uc3QgY29weSA9IG5ldyAoaW5zdGFuY2UuY29uc3RydWN0b3IgYXMgeyBuZXcoKTogVCB9KSgpO1xuICAgIE9iamVjdC5hc3NpZ24oY29weSwgaW5zdGFuY2UpO1xuICAgIHJldHVybiBjb3B5O1xufVxuXG5jb25zdCBwcmVwYXJlRWxlbWVudCA9IChcbiAgICB0eXBlTmFtZTogc3RyaW5nLFxuICAgIGRlZmF1bHRQcm9wczogeyBbaWQ6IHN0cmluZ106IEJhc2VQcm9wIH0sXG4gICAgb3ZlcnJpZGVuUHJvcHM6IHsgW2lkOiBzdHJpbmddOiBhbnkgfSxcbiAgICBkZWZhdWx0U3R5bGVzOiB7IFtpZDogc3RyaW5nXTogYW55IH0sXG4gICAgb3ZlcnJpZGVuU3R5bGVzOiB7IFtpZDogc3RyaW5nXTogYW55IH0sXG4gICAgY2hpbGRyZW46IEFycmF5PEJhc2VFbGVtZW50PlxuKSA9PiB7XG4gICAgbGV0IGZpbmFsUHJvcHMgPSB7fVxuICAgIE9iamVjdC5rZXlzKGRlZmF1bHRQcm9wcykuZm9yRWFjaChwcm9wS2V5ID0+IHtcbiAgICAgICAgaWYgKG92ZXJyaWRlblByb3BzW3Byb3BLZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGxldCBicFByb3AgPSBkZWZhdWx0UHJvcHNbcHJvcEtleV1cbiAgICAgICAgICAgIGxldCBjb3BpZWRQcm9wID0gY2xvbmUoYnBQcm9wKVxuICAgICAgICAgICAgY29waWVkUHJvcC5zZXRWYWx1ZShvdmVycmlkZW5Qcm9wc1twcm9wS2V5XSlcbiAgICAgICAgICAgIGZpbmFsUHJvcHNbcHJvcEtleV0gPSBjb3BpZWRQcm9wXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBsZXQgZmluYWxTdHlsZXMgPSB7IC4uLmRlZmF1bHRTdHlsZXMgfVxuICAgIGlmIChvdmVycmlkZW5TdHlsZXMpIGZpbmFsU3R5bGVzID0geyAuLi5maW5hbFN0eWxlcywgLi4ub3ZlcnJpZGVuU3R5bGVzIH1cbiAgICByZXR1cm4gbmV3IEJhc2VFbGVtZW50KG92ZXJyaWRlblByb3BzWydrZXknXSwgdHlwZU5hbWUsIGZpbmFsUHJvcHMsIGZpbmFsU3R5bGVzLCBjaGlsZHJlbilcbn1cblxuY29uc3QgbmVzdGVkQ29udGV4dCA9IChjcmVhdHVyZTogQ3JlYXR1cmUsIG90aGVyTWV0YXM/OiBFeGVjdXRpb25NZXRhKSA9PiB7XG4gICAgaWYgKG90aGVyTWV0YXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFeGVjdXRpb25NZXRhKHsgLi4ub3RoZXJNZXRhcywgY3JlYXR1cmUsIGlzQW5vdGhlckNyZWF0dXJlOiB0cnVlIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFeGVjdXRpb25NZXRhKHsgY3JlYXR1cmUsIGlzQW5vdGhlckNyZWF0dXJlOiB0cnVlIH0pXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7IGdlbmVyYXRlS2V5LCBwcmVwYXJlRWxlbWVudCwgbmVzdGVkQ29udGV4dCB9XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1zUGF0dGVybiA9IC9ebXMtLztcblxudmFyIF91cHBlcmNhc2VQYXR0ZXJuID0gLyhbQS1aXSkvZztcblxuLyoqXG4gKiBIeXBoZW5hdGVzIGEgY2FtZWxjYXNlZCBzdHJpbmcsIGZvciBleGFtcGxlOlxuICpcbiAqICAgPiBoeXBoZW5hdGUoJ2JhY2tncm91bmRDb2xvcicpXG4gKiAgIDwgXCJiYWNrZ3JvdW5kLWNvbG9yXCJcbiAqXG4gKiBGb3IgQ1NTIHN0eWxlIG5hbWVzLCB1c2UgYGh5cGhlbmF0ZVN0eWxlTmFtZWAgaW5zdGVhZCB3aGljaCB3b3JrcyBwcm9wZXJseVxuICogd2l0aCBhbGwgdmVuZG9yIHByZWZpeGVzLCBpbmNsdWRpbmcgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGh5cGhlbmF0ZShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKF91cHBlcmNhc2VQYXR0ZXJuLCAnLSQxJykudG9Mb3dlckNhc2UoKTtcbn1cblxuLyoqXG4gKiBIeXBoZW5hdGVzIGEgY2FtZWxjYXNlZCBDU1MgcHJvcGVydHkgbmFtZSwgZm9yIGV4YW1wbGU6XG4gKlxuICogICA+IGh5cGhlbmF0ZVN0eWxlTmFtZSgnYmFja2dyb3VuZENvbG9yJylcbiAqICAgPCBcImJhY2tncm91bmQtY29sb3JcIlxuICogICA+IGh5cGhlbmF0ZVN0eWxlTmFtZSgnTW96VHJhbnNpdGlvbicpXG4gKiAgIDwgXCItbW96LXRyYW5zaXRpb25cIlxuICogICA+IGh5cGhlbmF0ZVN0eWxlTmFtZSgnbXNUcmFuc2l0aW9uJylcbiAqICAgPCBcIi1tcy10cmFuc2l0aW9uXCJcbiAqXG4gKiBBcyBNb2Rlcm5penIgc3VnZ2VzdHMgKGh0dHA6Ly9tb2Rlcm5penIuY29tL2RvY3MvI3ByZWZpeGVkKSwgYW4gYG1zYCBwcmVmaXhcbiAqIGlzIGNvbnZlcnRlZCB0byBgLW1zLWAuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBoeXBoZW5hdGVTdHlsZU5hbWUoc3RyaW5nKSB7XG4gIHJldHVybiBoeXBoZW5hdGUoc3RyaW5nKS5yZXBsYWNlKG1zUGF0dGVybiwgJy1tcy0nKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgaHlwaGVuYXRlU3R5bGVOYW1lXG4iLCJcbmltcG9ydCBnZW5lcmF0b3IgZnJvbSAnLi9nZW5lcmF0b3InXG5pbXBvcnQgY29tcGlsZXIgZnJvbSAnLi9jb21waWxlcidcbmltcG9ydCBqc29uIGZyb20gJy4vanNvbidcbmltcG9ydCBleGVjdXRvciBmcm9tICcuL2V4ZWN1dG9yJ1xuXG5leHBvcnQgZGVmYXVsdCB7IGdlbmVyYXRvciwgY29tcGlsZXIsIGpzb24sIGV4ZWN1dG9yIH1cbiIsIlxuaW1wb3J0IEJhc2VFbGVtZW50IGZyb20gXCIuLi9lbGVtZW50cy9CYXNlRWxlbWVudFwiXG5cbmxldCBwcmV0dGlmeSA9IChvYmo6IGFueSkgPT4ge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmosIHVuZGVmaW5lZCwgNClcbn1cblxubGV0IHVwZGF0ZXMgPSBbXVxuXG5sZXQgZmluZENoYW5nZXMgPSAocGFyZW50S2V5OiBzdHJpbmcsIGVsMTogQmFzZUVsZW1lbnQsIGVsMjogQmFzZUVsZW1lbnQpID0+IHtcbiAgICBpZiAoZWwxLl9rZXkgIT09IGVsMi5fa2V5KSB7XG4gICAgICAgIHVwZGF0ZXMucHVzaChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfX2FjdGlvbl9fOiAnZWxlbWVudF9kZWxldGVkJyxcbiAgICAgICAgICAgICAgICBfX2tleV9fOiBlbDEuX2tleSxcbiAgICAgICAgICAgICAgICBfX3BhcmVudEtleV9fOiBwYXJlbnRLZXlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX19hY3Rpb25fXzogJ2VsZW1lbnRfY3JlYXRlZCcsXG4gICAgICAgICAgICAgICAgX19rZXlfXzogZWwyLl9rZXksXG4gICAgICAgICAgICAgICAgX19lbGVtZW50X186IGVsMixcbiAgICAgICAgICAgICAgICBfX3BhcmVudEtleV9fOiBwYXJlbnRLZXlcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IHByb3BzQ2hhbmdlcyA9IHsgX19hY3Rpb25fXzogJ3Byb3BzX3VwZGF0ZWQnLCBfX2tleV9fOiBlbDIuX2tleSwgX19jcmVhdGVkX186IHt9LCBfX2RlbGV0ZWRfXzoge30sIF9fdXBkYXRlZF9fOiB7fSB9XG4gICAgZm9yIChsZXQgcEtleSBpbiBlbDIuX3Byb3BzKSB7XG4gICAgICAgIGlmIChlbDEuX3Byb3BzW3BLZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHByb3BzQ2hhbmdlcy5fX2NyZWF0ZWRfX1twS2V5XSA9IGVsMi5fcHJvcHNbcEtleV1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBwS2V5IGluIGVsMS5fcHJvcHMpIHtcbiAgICAgICAgaWYgKGVsMi5fcHJvcHNbcEtleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcHJvcHNDaGFuZ2VzLl9fZGVsZXRlZF9fW3BLZXldID0gZWwyLl9wcm9wc1twS2V5XVxuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAobGV0IHBLZXkgaW4gZWwyLl9wcm9wcykge1xuICAgICAgICBpZiAoZWwxLl9wcm9wc1twS2V5XSAhPT0gdW5kZWZpbmVkICYmIGVsMi5fcHJvcHNbcEtleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGVsMS5fcHJvcHNbcEtleV0uZ2V0VmFsdWUoKSAhPT0gZWwyLl9wcm9wc1twS2V5XS5nZXRWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgcHJvcHNDaGFuZ2VzLl9fdXBkYXRlZF9fW3BLZXldID0gZWwyLl9wcm9wc1twS2V5XVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChcbiAgICAgICAgKE9iamVjdC5rZXlzKHByb3BzQ2hhbmdlcy5fX2NyZWF0ZWRfXykubGVuZ3RoID4gMCkgfHxcbiAgICAgICAgKE9iamVjdC5rZXlzKHByb3BzQ2hhbmdlcy5fX2RlbGV0ZWRfXykubGVuZ3RoID4gMCkgfHxcbiAgICAgICAgKE9iamVjdC5rZXlzKHByb3BzQ2hhbmdlcy5fX3VwZGF0ZWRfXykubGVuZ3RoID4gMClcbiAgICApIHtcbiAgICAgICAgdXBkYXRlcy5wdXNoKHByb3BzQ2hhbmdlcylcbiAgICB9XG4gICAgbGV0IHN0eWxlc0NoYW5nZXMgPSB7IF9fYWN0aW9uX186ICdzdHlsZXNfdXBkYXRlZCcsIF9fa2V5X186IGVsMi5fa2V5LCBfX2NyZWF0ZWRfXzoge30sIF9fZGVsZXRlZF9fOiB7fSwgX191cGRhdGVkX186IHt9IH1cbiAgICBmb3IgKGxldCBzS2V5IGluIGVsMi5fc3R5bGVzKSB7XG4gICAgICAgIGlmIChlbDEuX3N0eWxlc1tzS2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdHlsZXNDaGFuZ2VzLl9fY3JlYXRlZF9fW3NLZXldID0gZWwyLl9zdHlsZXNbc0tleV1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBzS2V5IGluIGVsMS5fc3R5bGVzKSB7XG4gICAgICAgIGlmIChlbDIuX3N0eWxlc1tzS2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdHlsZXNDaGFuZ2VzLl9fZGVsZXRlZF9fW3NLZXldID0gZWwyLl9zdHlsZXNbc0tleV1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBzS2V5IGluIGVsMi5fc3R5bGVzKSB7XG4gICAgICAgIGlmIChlbDEuX3N0eWxlc1tzS2V5XSAhPT0gdW5kZWZpbmVkICYmIGVsMi5fc3R5bGVzW3NLZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChlbDEuX3N0eWxlc1tzS2V5XSAhPT0gZWwyLl9zdHlsZXNbc0tleV0pIHtcbiAgICAgICAgICAgICAgICBzdHlsZXNDaGFuZ2VzLl9fdXBkYXRlZF9fW3NLZXldID0gZWwyLl9zdHlsZXNbc0tleV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoXG4gICAgICAgIChPYmplY3Qua2V5cyhzdHlsZXNDaGFuZ2VzLl9fY3JlYXRlZF9fKS5sZW5ndGggPiAwKSB8fFxuICAgICAgICAoT2JqZWN0LmtleXMoc3R5bGVzQ2hhbmdlcy5fX2RlbGV0ZWRfXykubGVuZ3RoID4gMCkgfHxcbiAgICAgICAgKE9iamVjdC5rZXlzKHN0eWxlc0NoYW5nZXMuX191cGRhdGVkX18pLmxlbmd0aCA+IDApXG4gICAgKSB7XG4gICAgICAgIHVwZGF0ZXMucHVzaChzdHlsZXNDaGFuZ2VzKVxuICAgIH1cbiAgICBsZXQgY3MgPSB7fVxuICAgIGVsMi5fY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7IGNzW2NoaWxkLl9rZXldID0gY2hpbGQgfSlcbiAgICBlbDEuX2NoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICBpZiAoY3NbY2hpbGQuX2tleV0pIHtcbiAgICAgICAgICAgIGZpbmRDaGFuZ2VzKGVsMS5fa2V5LCBjaGlsZCwgY3NbY2hpbGQuX2tleV0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cGRhdGVzLnB1c2goXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBfX2FjdGlvbl9fOiAnZWxlbWVudF9kZWxldGVkJyxcbiAgICAgICAgICAgICAgICAgICAgX19rZXlfXzogY2hpbGQuX2tleSxcbiAgICAgICAgICAgICAgICAgICAgX19wYXJlbnRLZXlfXzogZWwxLl9rZXlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICB9KVxuICAgIGNzID0ge31cbiAgICBlbDEuX2NoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4geyBjc1tjaGlsZC5fa2V5XSA9IGNoaWxkIH0pXG4gICAgZWwyLl9jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgICAgaWYgKCFjc1tjaGlsZC5fa2V5XSkge1xuICAgICAgICAgICAgdXBkYXRlcy5wdXNoKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgX19hY3Rpb25fXzogJ2VsZW1lbnRfY3JlYXRlZCcsXG4gICAgICAgICAgICAgICAgICAgIF9fa2V5X186IGNoaWxkLl9rZXksXG4gICAgICAgICAgICAgICAgICAgIF9fZWxlbWVudF9fOiBjaGlsZCxcbiAgICAgICAgICAgICAgICAgICAgX19wYXJlbnRLZXlfXzogZWwyLl9rZXlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICB9KVxufVxuXG5sZXQgZGlmZiA9IChlbDE6IEJhc2VFbGVtZW50LCBlbDI6IEJhc2VFbGVtZW50KSA9PiB7XG4gICAgdXBkYXRlcyA9IFtdXG4gICAgZmluZENoYW5nZXModW5kZWZpbmVkLCBlbDEsIGVsMilcbiAgICByZXR1cm4gdXBkYXRlc1xufVxuXG5leHBvcnQgZGVmYXVsdCB7IHByZXR0aWZ5LCBkaWZmIH1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcbmltcG9ydCBNb2R1bGUgZnJvbSAnLi93aWRnZXQvTW9kdWxlJ1xuaW1wb3J0IEFwcGxldCwgeyBSdW5uYWJsZSB9IGZyb20gJy4vd2lkZ2V0L0FwcGxldCdcbmltcG9ydCBVdGlscyBmcm9tICcuL3dpZGdldC91dGlscydcbmltcG9ydCBDb250cm9scyBmcm9tICcuL3dpZGdldC9jb250cm9scydcbmltcG9ydCBJTmF0aXZlIGZyb20gJy4vd2lkZ2V0L0lOYXRpdmUnXG5cbmV4cG9ydCB7XG4gICAgQXBwbGV0LFxuICAgIFJ1bm5hYmxlLFxuICAgIE1vZHVsZSxcbiAgICBVdGlscyxcbiAgICBDb250cm9scyxcbiAgICBJTmF0aXZlXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9