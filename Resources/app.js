var SOURCEMAPS = (function() {

var VLQ_BASE_SHIFT = 5;
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
var VLQ_BASE_MASK = VLQ_BASE - 1;
var VLQ_CONTINUATION_BIT = VLQ_BASE;

var BASE64_DIGITS = [];
var BASE64_DIGIT_MAP = {};

var Action = {
  Encode: "encode",
  Decode: "decode",
  Auto: "auto"
}

var currentAction = Action.Auto;
var currentInput = "";

(function() {
  var charCode = "A".charCodeAt(0);
  for (var i = 0; i < 26; ++i)
    BASE64_DIGITS.push(String.fromCharCode(charCode + i));
  charCode = "a".charCodeAt(0);
  for (var i = 0; i < 26; ++i)
    BASE64_DIGITS.push(String.fromCharCode(charCode + i));
  charCode = "0".charCodeAt(0);
  for (var i = 0; i < 10; ++i)
    BASE64_DIGITS.push(String.fromCharCode(charCode + i));
  BASE64_DIGITS.push("+");
  BASE64_DIGITS.push("/");

  for (var i = 0; i < BASE64_DIGITS.length; ++i)
    BASE64_DIGIT_MAP[BASE64_DIGITS[i]] = i;
})();

function encode(value, isAutoConvert)
{
  var result = "";
  if (value instanceof Array) {
    for (var i = 0; i < value.length; ++i) {
      if (isNaN(value[i]))
        return setResult("", "Invalid numeric value at index " + i + " (" + value[i] + ")");
      result += encodePrimitive(value[i]);
    }
    return setResult(result);
  }

  setResult(encodePrimitive(value), (isAutoConvert ? "Automatically ran Base64 VLQ ENCODING. If you need to DECODE your input, choose the \"Decode\" action." : ""));
}

function decode(value)
{
  if (typeof value !== "string")
    return _info("Invalid input");
  var result = [];
  var segmentsInLine;
  var numbersInSegment;
  var shift = 0;
  var continuation;
  var lines = value.split(";");
  for (var curLine = 0; curLine < lines.length; ++curLine) {
    var segments = lines[curLine].split(",");
    segmentsInLine = [];
    for (var curSegment = 0; curSegment < segments.length; ++curSegment) {
      var segment = segments[curSegment];
      var resultValue = 0;
      numbersInSegment = [];
      for (var i = 0; i < segment.length; ++i) {
        var c = segment.charAt(i);
        digit = BASE64_DIGIT_MAP[c];
        if (digit === undefined)
          return _info("Invalid digit at index " + i + " ('" + c + "')");
        continuation = digit & VLQ_CONTINUATION_BIT;
        digit &= VLQ_BASE_MASK;
        resultValue += digit << shift;
        shift += VLQ_BASE_SHIFT;
        if (continuation === 0) {
          negate = (resultValue & 1) == 1;
          resultValue >>= 1;
          numbersInSegment.push(negate ? -resultValue : resultValue);
          resultValue = 0;
          shift = 0;
        }
      }
      if (numbersInSegment.length)
        segmentsInLine.push(numbersInSegment);
    }
    result.push(segmentsInLine);
  }

  if (!continuation) {
    var decodedData = decodedResultForOutput(result);
    return _info(decodedData[0]+ ":" + decodedData[1]);
  }
  _info("Invalid VLQ64 encoding, continuation bit set at last character while decoding.");
}

function decodedResultForOutput(result)
{
  if (result.length === 1 && result[0].length === 1)
    return [JSON.stringify(result[0][0]), ""];

  var output = [];
  var sourceMapOutput = [];
  var outIndex = 0;
  var context = {};
  for (var i = 0; i < result.length; ++i) {
    if (!result[i].length)
      continue;
    var mapped = result[i].map(function(segment) {
      return JSON.stringify(segment);
    }, null);
    output[outIndex] = i + ") " + mapped.join(", ");
    sourceMapOutput[outIndex] = buildLineDecodedMappings(i, result[i], context)
    ++outIndex;
  }
  return [output.join("\n"), sourceMapOutput.join("\n")];
}

function buildLineDecodedMappings(targetLine, segments, context)
{
  var result = [];
  var prevTargetColumn = 0;
  for (var i = 0; i < segments.length; ++i) {
    var segment = segments[i];
    var targetColumn = prevTargetColumn + segment[0];
    prevTargetColumn = targetColumn;
    var sourceIndex = (context.prevSourceIndex || 0) + segment[1];
    context.prevSourceIndex = sourceIndex;
    var sourceLine = (context.prevSourceLine || 0) + segment[2];
    context.prevSourceLine = sourceLine;
    var sourceColumn = (context.prevSourceColumn || 0) + segment[3];
    context.prevSourceColumn = sourceColumn;
    result.push("([" + sourceLine + "," + sourceColumn + "](#" + sourceIndex + ")=>[" + targetLine + "," + targetColumn + "])");
  }
  return result.join(" | ");
}

function encodePrimitive(value)
{
  if (value < 0)
    value = ((-value) << 1) | 1;
  else
    value <<= 1;

  result = "";
  do {
    digit = value & VLQ_BASE_MASK;
    value >>>= VLQ_BASE_SHIFT;
    if (value > 0)
      digit |= VLQ_CONTINUATION_BIT;
    result += BASE64_DIGITS[digit];
  } while (value > 0);

  return result;
}

  return {decode:decode}
})()


////////////////////////////////////

_info = function(s) { Ti.API.info(s) }

Ti.include("cljs-out/goog/base.js")

goog.global.CLOSURE_IMPORT_SCRIPT = function(script) {
  var path = "cljs-out/goog/" + script;
  Ti.include(path);
}

Ti.include("cljs-out/goog/deps.js");
Ti.include("cljs-out/app.js");
goog.require("vs.main");
