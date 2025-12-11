/**
 * Latin Poetry Text-to-Phoneme Synthesis Pipeline
 *
 * A JavaScript translation of the AWK/Ruby pipeline for converting Latin text
 * to MBROLA .pho format for speech synthesis.
 *
 * Pipeline stages:
 *   1. Pre-scansion: amp -> mrj -> unamp -> postamp -> nudiv
 *   2. Scansion: scansion (meter matching)
 *   3. Accentuation: inc (pitch accent placement)
 *   4. Phoneme production: d2m -> spkfmt -> spk -> phostrip -> phobunc -> phofix
 *
 * Format conventions:
 *   - Vowels are marked as %[LETTER][QUANTITY] where quantity is:
 *     0 = short, 4 = anceps, 6 = closed by position, 8 = long
 *   - Syllable boundaries are marked with /
 *   - Accent markers: %H = high, %L = low, %N = neutral, %S = superhigh (breath)
 *   - @ = line separator, # = word separator (internal use)
 */

// The scansion dictionary will be loaded from scansions.json
let scansionsDict = null;

/**
 * Load the scansions dictionary from JSON
 * @param {Object} dict - The scansions dictionary object
 */
function loadScansions(dict) {
  scansionsDict = dict;
}

// ============================================================================
// STAGE 1: PRE-SCANSION (amp.awk, mrj.awk, unamp.awk, postamp.awk, nudiv.awk)
// ============================================================================

/**
 * amp.awk - Add @ for line separators and # for word separators
 *
 * Input: Plain Latin text
 * Output: Text with spaces replaced by # and lines joined by @
 */
function amp(text) {
  // Replace spaces with # and join lines with @
  return text.split('\n').map(line => line.replace(/ /g, '#')).join('@');
}

/**
 * nufec.awk - Parse HTML-wrapped word and convert to scansion format
 * This is used by mrj when a word isn't in the database.
 *
 * Input: Word wrapped in <th><foreign lang="la">WORD</foreign></th>
 * Output: Scansion-formatted word with vowels marked
 */
function nufec(text) {
  // Extract word from HTML tags
  const match = text.match(/<th><foreign lang="la">([^<]+)<\/foreign><\/th>/i);
  if (!match) return '';

  let word = match[1].toLowerCase();

  // Consonant normalization
  word = word.replace(/k/g, 'c');
  word = word.replace(/qu/g, 'q');
  word = word.replace(/x/g, 'cs');
  word = word.replace(/z/g, 'dz');
  word = word.replace(/y/g, 'i');

  // Handle marked vowels (with macron/breve)
  word = word.replace(/&/g, '%');
  word = word.replace(/circ;/g, '8');
  word = word.replace(/._|.\^/g, '%$&');
  word = word.replace(/\^/g, '0');
  word = word.replace(/_/g, '8');

  // Diphthongs (long)
  word = word.replace(/ae/g, '%AE8');
  word = word.replace(/%a/g, '%A');
  word = word.replace(/au/g, '%AU8');
  word = word.replace(/%e/g, '%E');
  word = word.replace(/ei/g, '%EI8');
  word = word.replace(/%i/g, '%I');
  word = word.replace(/eu/g, '%EU8');
  word = word.replace(/%o/g, '%O');
  word = word.replace(/oe/g, '%OE8');
  word = word.replace(/%u/g, '%U');
  word = word.replace(/ui/g, '%UI8');

  // Remaining unmarked vowels are short
  word = word.replace(/[aeiou]/g, '%$&0');

  return word.toLowerCase();
}

/**
 * premux.awk - Extract content between pipe delimiters
 */
function premux(text) {
  const match = text.match(/\|(.*)\|/);
  return match ? match[1] : '';
}

/**
 * numux.awk - Merge multiple scansion possibilities
 * When a vowel could be 0 (short) or 8 (long), mark it as 4 (anceps)
 */
function numux(text) {
  // Split on non-alphanumeric, non-% characters
  const parts = text.split(/([^0-9a-z%|]+)/);

  return parts.map(part => {
    if (!part.includes('|')) return part;

    // Add markers for processing
    let s = '!' + part.replace(/\|/g, '@!') + '@';

    while (!s.includes('!@')) {
      // Move marker past non-quantity characters
      s = s.replace(/!([^08@]+)/g, '$1!');

      // If both 0 and 8 are possible, use 4 (anceps)
      if (s.includes('!0') && s.includes('!8')) {
        s = s.replace(/![08]/g, '4!');
      } else {
        s = s.replace(/!([08])/g, '$1!');
      }
    }

    // Remove processing markers
    s = s.replace(/!@.*$/, '');
    s = s.replace(/^.*@/, '');

    return s;
  }).join('');
}

/**
 * v2c.awk - Convert certain vowels to consonants (semivowels)
 * Handle j/v as consonants in certain positions
 */
function v2c(text) {
  let s = ' ' + text;

  // gu/su + vowel: u becomes v (consonantal)
  s = s.replace(/([gs])%u0%/g, '$1v%');

  // After quantity marker + i + vowel: i becomes j
  s = s.replace(/([08])%i0%/g, '$1j%');

  // Word-initial i + u: i becomes j
  s = s.replace(/ %i0%u/g, ' j%u');

  // eu8n -> e0%u0n (desinence -eum)
  s = s.replace(/eu8n/g, 'e0%u0n');

  // ui after non-c/h: separate into u + i
  s = s.replace(/([^cChH])%ui8/g, '$1%u0%i8');

  return s.trimStart();
}

/**
 * fudge pipeline: nufec -> premux -> numux -> v2c
 * Used when word not found in scansions database
 */
function fudge(word) {
  const html = `<th><foreign lang="la">${word}</foreign></th>`;
  let result = nufec(html);
  result = premux('|' + result + '|');
  result = numux(result);
  result = v2c(result);
  return result;
}

/**
 * mrj.awk - Merge scansion lookup with text
 * Look up each word in the scansions database and insert vowel markings
 *
 * Input: Text with @ line separators and # word separators
 * Output: Text with vowel quantities marked (%[vowel][0|4|8])
 */
function mrj(text) {
  if (!scansionsDict) {
    throw new Error('Scansions dictionary not loaded. Call loadScansions() first.');
  }

  let result = '';
  let remaining = text;

  // Word pattern: sequence of letters
  const wordPattern = /[a-zA-Z]+/g;
  let lastIndex = 0;
  let match;

  while ((match = wordPattern.exec(remaining)) !== null) {
    // Get the punctuation between words
    const before = remaining.slice(lastIndex, match.index);
    // Filter out certain punctuation but keep line markers
    const filteredBefore = before.replace(/[^-@#,.;:!? \n]/g, '');
    // Handle newlines
    let processedBefore = filteredBefore.replace(/\n/, '~').replace(/\n/g, '').replace(/~/, '\n').replace(/ /, '');

    result += processedBefore;

    const textWord = match[0];

    // Look up in scansions database (case-insensitive)
    let multiplexedScansion = scansionsDict[textWord] || scansionsDict[textWord.toLowerCase()] || '';

    // Fix malformed scansion patterns like %X%NN -> %XN (e.g., %u%88 -> %u8)
    if (multiplexedScansion) {
      multiplexedScansion = multiplexedScansion.replace(/%([aeiouAEIOU])%([048])\2/g, '%$1$2');
    }

    // If not found, use fudge to generate scansion
    if (!multiplexedScansion) {
      multiplexedScansion = fudge(textWord);
    }

    // Rehydrate word (extract just the letters)
    let rehydratedWord = multiplexedScansion.replace(/[^a-zA-Z]/g, '');
    rehydratedWord = rehydratedWord.replace(/q/g, 'qu').replace(/cs/g, 'x').replace(/dz/g, 'z');

    const interregnum = textWord.length - rehydratedWord.length;

    if (interregnum === 0) {
      result += multiplexedScansion;
    } else {
      // Handle suffix (usually enclitics like -que, -ve, -ne)
      let suf = textWord.slice(rehydratedWord.length);
      suf = suf.toLowerCase();

      // Normalize consonants
      suf = suf.replace(/k/g, 'c');
      suf = suf.replace(/qu/g, 'q');
      suf = suf.replace(/x/g, 'cs');
      suf = suf.replace(/z/g, 'dz');
      suf = suf.replace(/y/g, 'i');

      // Convert vowel markings
      suf = suf.replace(/&/g, '%');
      suf = suf.replace(/circ;/g, '8');
      suf = suf.replace(/\^/g, '0');

      // Diphthongs
      suf = suf.replace(/ae/g, '%AE8');
      suf = suf.replace(/%a/g, '%A');
      suf = suf.replace(/au/g, '%AU8');
      suf = suf.replace(/%e/g, '%E');
      suf = suf.replace(/ei/g, '%EI8');
      suf = suf.replace(/%i/g, '%I');
      suf = suf.replace(/eu/g, '%EU8');
      suf = suf.replace(/%o/g, '%O');
      suf = suf.replace(/oe/g, '%OE8');
      suf = suf.replace(/%u/g, '%U');
      suf = suf.replace(/ui/g, '%UI8');

      // Unmarked vowels are short
      suf = suf.replace(/[aeiou]/g, '%$&0');

      result += multiplexedScansion + suf.toLowerCase();
    }

    lastIndex = match.index + textWord.length;
  }

  // Add any remaining text
  result += remaining.slice(lastIndex).replace(/[^-@#,.;:!? \n]/g, '');

  return result;
}

/**
 * unamp.awk - Reverse amp: restore line breaks and spaces
 *
 * Input: Text with @ line separators and # word separators
 * Output: Text with restored newlines and spaces
 */
function unamp(text) {
  return text.replace(/@/g, '\n').replace(/#/g, ' ').replace(/\n$/, '');
}

/**
 * postamp.awk - Remove debug markers (~~~...~~~)
 */
function postamp(text) {
  return text.replace(/~~~[^~]*~~~/g, '');
}

/**
 * nudiv.awk - Divide text into syllables
 * Insert / at syllable boundaries based on Latin syllabification rules
 *
 * Input: Text with vowel quantities marked
 * Output: Text with syllable boundaries marked by /
 */
function nudiv(text) {
  const cons = '[bcdfgjklmnpqrstvz]';
  const consNoM = '[bcdfgjklnpqrstvz]';
  const wordend = "[- !():;\"'`,.?]*";  // Note: space after hyphen matches AWK
  const pct = '%';

  let s = text;

  // V/V: vowel followed by vowel (hiatus)
  // Pattern: quantity followed by h?%
  s = s.replace(new RegExp('([048])(h?' + pct + ')', 'g'), '$1/$2');

  // V/CV: vowel + single consonant + vowel -> break before consonant
  s = s.replace(new RegExp('([048])(' + wordend + cons + 'h?' + pct + ')', 'g'), '$1/$2');

  // Same but consonant can't be m (for certain cases)
  s = s.replace(new RegExp('([048])(' + consNoM + wordend + 'h?' + pct + ')', 'g'), '$1/$2');

  // VCC: vowel + two consonants
  // If first vowel is long (8), keep it long
  s = s.replace(new RegExp('8(' + wordend + cons + 'h?)(' + wordend + cons + ')', 'g'), '8$1/$2');

  // If first vowel is short/anceps (0 or 4), make it closed (6)
  s = s.replace(new RegExp('[04](' + wordend + cons + 'h?)(' + wordend + cons + ')', 'g'), '6$1/$2');

  return s;
}

/**
 * Pre-scansion stage: amp -> mrj -> unamp -> postamp -> nudiv
 */
function preScansion(text) {
  let s = amp(text);
  s = mrj(s);
  s = unamp(s);
  s = postamp(s);
  s = nudiv(s);
  return s;
}

// ============================================================================
// STAGE 2: SCANSION (scansion.rb)
// ============================================================================

/**
 * Build meter regex patterns
 * l = long ([468])
 * s = short ([04])
 * a = anceps ([04]|[468]) - can be either
 * r = resolvable ([04]|[04][04]) - long or two shorts
 */
function buildMeterPattern(meterSpec) {
  const syllTypes = {
    l: '([468])',           // long
    s: '([04])',            // short
    a: '([0468])',          // anceps
    r: '([468]|[04][04])'   // resolvable (long or two shorts)
  };

  const pattern = meterSpec.split('').map(c => syllTypes[c] || '([0468])').join('');
  return new RegExp('^' + pattern + '$');
}

/**
 * Extract vowel quantities from syllabified text
 * Vowels are marked as [0468] followed by non-vowel chars until /
 */
function getVowels(text) {
  const vowelPattern = /[0468](?=[^0468]*\/)/g;
  return (text.match(vowelPattern) || []).join('');
}

/**
 * Apply scansion to match meter
 * Replace 4 (anceps) with the appropriate value based on meter
 */
function fix4s(vowels, meterSpec) {
  const syllTypes = {
    l: '8',  // long -> replace 4 with 8
    s: '0',  // short -> replace 4 with 0
    a: '0',  // anceps -> default to 0
    r: '8'   // resolvable -> default to 8
  };

  const result = [];
  let meterChars = meterSpec.split('');

  for (let i = 0; i < vowels.length && i < meterChars.length; i++) {
    const orig = vowels[i];
    const target = syllTypes[meterChars[i]] || '0';

    if (orig === '4') {
      result.push(target);
    } else {
      // Replace 4 with 0 in non-anceps positions
      result.push(orig === '4' ? '0' : orig);
    }
  }

  return result.join('');
}

/**
 * scansion.rb - Apply metrical scansion to syllabified text
 *
 * Input: Syllabified text with vowel quantities, meter specification
 * Output: Text with vowels adjusted to fit the meter
 */
function scansion(text, meterSpec) {
  // Add trailing / for vowel matching
  let s = text.replace(/\s*$/, '/');

  // Common substitution: make muta cum liquida position optional
  // 6 before pt/ck/bd/g + l/r can become 4
  s = s.replace(/6(?=\s*[ptckbdg]\/[lr])/g, '4');

  // Get vowels and try to match meter
  const vowels = getVowels(s);
  const meterPattern = buildMeterPattern(meterSpec);
  const match = vowels.match(meterPattern);

  if (match) {
    // Apply the fixed vowels
    let fixed = fix4s(vowels, meterSpec) + '0'.repeat(20); // padding

    // Replace vowels in text
    s = s.replace(/[0468](?=[^0468]*\/)/g, () => {
      const c = fixed[0];
      fixed = fixed.slice(1);
      return c;
    });
  }

  // Remove trailing / and add newline like Ruby's puts
  return s.slice(0, -1) + '\n';
}

// ============================================================================
// STAGE 3: ACCENTUATION (inc.awk)
// ============================================================================

/**
 * inc.awk - Add pitch accent markers
 *
 * Latin accent rules:
 * - Two-syllable words: accent on first syllable
 * - Longer words: accent on penult if heavy, else antepenult
 *
 * Markers:
 * %H = high pitch (accented)
 * %L = low pitch (before accented)
 * %N = neutral
 *
 * Input: Scanned text with syllable divisions
 * Output: Text with accent markers on vowels
 */
function inc(text) {
  let s = text;

  // Pad with spaces for boundary matching
  s = ' ' + s + ' ';
  s = s.replace(/\n/g, ' \n ');

  // Replace all % with %N (neutral) first
  s = s.replace(/%/g, '%N');

  // Convert anceps 4 to short 0 (final decision)
  s = s.replace(/4/g, '0');

  // Rule 1: High accent on penult if it's long (has [68])
  // Pattern: %N + consonants + [68] + stuff + %N + final syllable + word boundary
  s = s.replace(/%N(..?[68][^% ]*%N[^% ]* )/g, '%H$1');

  // Rule 2: High accent on antepenult if penult is short (has 0) followed by final
  s = s.replace(/%N([^% ]*%N..?0[^% ]*%[^% ]* )/g, '%H$1');

  // Rule 3: High accent on first syllable of two-syllable words
  s = s.replace(/( [^% ]*%)N([^% ]*%[^% ]* )/g, '$1H$2');

  // Mark secondary low pitch after syllable boundary before high
  s = s.replace(/(\/[^%\/]*)%([^%\/\n]*%)/g, '$1@$2');

  // Mark low pitch before high
  s = s.replace(/%N([^%]*%H)/g, '%L$1');

  // Remove padding
  s = s.replace(/ $/g, '');
  s = s.replace(/^ /g, '');
  s = s.replace(/ \n /g, '\n');

  // AWK's print adds a trailing newline
  return s + '\n';
}

// ============================================================================
// STAGE 4: PHONEME PRODUCTION (d2m, spkfmt, spk, phostrip, phobunc, phofix)
// ============================================================================

/**
 * d2m.awk - Convert diphthongs to separate vowel segments
 *
 * Input: Accented text
 * Output: Text with diphthongs split for MBROLA
 */
function d2m(text) {
  let s = text;

  // ae -> ai (pronunciation)
  s = s.replace(/ae/g, 'ai');

  // Split diphthongs: %[LNH]XY[0468] -> %[LNH]X[0468]%NY0
  s = s.replace(/%([LNH])(.)(.)([0468])/g, '%$1$2$4%N$30');

  // Mark final m for special handling
  s = s.replace(/(@[^ ]*)m/g, '$1M');

  return s;
}

/**
 * spkfmt.awk - Format for phoneme conversion
 *
 * Input: Text with split diphthongs
 * Output: Text with each character separated by /
 */
function spkfmt(text) {
  let s = text;

  // Remove syllable markers
  s = s.replace(/\//g, '');

  // Punctuation handling: ! after high pitch -> superhigh (breath)
  s = s.replace(/%H([^\s]*)!/g, '%S$1.');

  // ? also becomes superhigh
  s = s.replace(/%[LNH]([^%]*)\?/g, '%S$1.');

  // Don't have low pitch right before superhigh
  s = s.replace(/%L([^%]*%S)/g, '%N$1');

  // Split into individual characters with /
  // Note: In JS, . doesn't match newlines, so use [\s\S] instead
  s = s.replace(/[\s\S]/g, '$&/');

  // AWK's print at end adds a trailing newline
  return s + '\n';
}

/**
 * spk.awk - Convert to MBROLA phoneme format
 *
 * Input: Character-separated text
 * Output: MBROLA .pho format lines
 */
function spk(text) {
  // Configuration
  const pause = { ',': 100, ':': 200, ';': 250, '.': 800 };
  const raise = { ',': 0.15, ':': 0.25, ';': 0.4 };
  const lenth = { cons: 81, 0: 91, 6: 151, 8: 151 };

  const vowel = {
    'a0': 'A', 'a8': 'A2',
    'e0': 'E1', 'e8': 'E2',
    'i0': 'I', 'i8': 'I2',
    'o0': 'O1', 'o8': 'O2',
    'u0': 'U', 'u8': 'U2'
  };

  const cons = {
    'b': 'B', 'c': 'K', 'd': 'D', 'f': 'F', 'g': 'G',
    'h': 'h 10\n;H', 'j': 'J', 'k': 'K', 'l': 'L', 'm': 'M',
    'n': 'N', 'p': 'P', 'q': 'q', 'r': 'R', 's': 'S',
    't': 'T', 'v': 'W', 'z': 'Z'
  };

  let histart = 110, lostart = 80;
  let hitone = histart, lotone = lostart;
  const histep = 2.5, lostep = 2.5;
  const highest = 120, lowest = 40;

  const lines = [];
  const tokens = text.split('/').filter(t => t);

  // NR in AWK is the record number (1-based)
  // It resets to 0 after punctuation (via NR = 0 assignment)
  let NR = 0;

  for (let i = 0; i < tokens.length; i++) {
    NR++;  // Increment for each record, like AWK
    const token = tokens[i];

    // Consonant
    if (/[bcdfghjklmnpqrstvz]/.test(token) && token.length === 1) {
      lines.push(cons[token] + ' ' + lenth.cons);
      continue;
    }

    // Newline (pause)
    if (token === '\n') {
      if (NR !== 1) {
        lines.push('_ ' + (pause[','] / 2));
      }
      continue;
    }

    // Punctuation pause
    if (/[,:;.]/.test(token)) {
      lines.push(`_ ${pause[token]} 0 ${lowest} 50 ${hitone}`);
      NR = 0;  // Reset like AWK's NR = 0

      if (/[,:;]/.test(token)) {
        const del = (highest - hitone) * raise[token];
        hitone += del;
        lotone += del;
      }

      if (token === '.') {
        hitone = histart;
        lotone = lostart;
      }
      continue;
    }

    // Vowel marker %
    if (token === '%') {

      // Get next tokens: pitch marker, letter, quantity
      const lnhs = tokens[++i]; // L, N, H, or S
      const dot = tokens[++i];  // vowel letter
      const ohsixeight = tokens[++i]; // quantity (0, 6, or 8)

      let fullvowel = dot + ohsixeight;
      fullvowel = fullvowel.replace(/6/g, '0'); // 6 sounds like 0

      const mbrolavowel = vowel[fullvowel] || fullvowel;
      const mbrolalen = lenth[ohsixeight] || lenth[0];
      let mbrolapitch = '';

      if (lnhs === 'L') {
        mbrolapitch = '50 ' + lotone;
        lotone -= lostep;
        if (lotone < lowest) {
          lotone = lowest;
        }
      }

      if (lnhs === 'H') {
        mbrolapitch = '50 ' + hitone;
        hitone -= histep;
        if (hitone < lotone) {
          hitone = lotone;
        }
      }

      if (lnhs === 'S') {
        mbrolapitch = '99 ' + (0.5 * (hitone + highest));
      }

      lines.push('');
      lines.push(mbrolavowel + ' ' + mbrolalen + (mbrolapitch ? ' ' + mbrolapitch : ''));
      continue;
    }
  }

  return lines.join('\n');
}

/**
 * phostrip.awk - Remove comments (lines starting with ;)
 */
function phostrip(text) {
  // Remove whitespace followed by ; and anything until newline
  return text.replace(/[\s]+;[^\n]*/g, '');
}

/**
 * phobunc.awk - Remove multiple consecutive newlines
 */
function phobunc(text) {
  return text.replace(/[\n]+/g, '\n');
}

/**
 * phofix.awk - Fix nonexistent diphone pairs
 *
 * Various phonological rules for valid MBROLA sequences
 */
function phofix(text) {
  const conslen = 81;
  const newlen = 2 * conslen;
  const crlf = '([^\\n]*\\n)';

  let s = text;

  // Devoicing before voiceless consonants
  const novoice = crlf + '([KFPST])' + crlf;
  s = s.replace(new RegExp('B' + novoice, 'g'), 'P$1$2$3');
  s = s.replace(new RegExp('D' + novoice, 'g'), 'T$1$2$3');

  // q -> K + W (qu = kw)
  s = s.replace(new RegExp('q' + crlf, 'g'), `K ${conslen}\nW ${conslen / 2}\n`);

  // Gemination: double consonants become single long consonant
  s = s.replace(new RegExp('K' + crlf + 'K' + crlf, 'g'), `K ${newlen}\n`);
  s = s.replace(new RegExp('P' + crlf + 'P' + crlf, 'g'), `P ${newlen}\n`);
  s = s.replace(new RegExp('T' + crlf + 'T' + crlf, 'g'), `T ${newlen}\n`);
  s = s.replace(new RegExp('G' + crlf + 'G' + crlf, 'g'), `G ${newlen}\n`);
  s = s.replace(new RegExp('B' + crlf + 'B' + crlf, 'g'), `B ${newlen}\n`);
  s = s.replace(new RegExp('D' + crlf + 'D' + crlf, 'g'), `D ${newlen}\n`);
  s = s.replace(new RegExp('S' + crlf + 'S' + crlf, 'g'), `S ${newlen}\n`);
  s = s.replace(new RegExp('F' + crlf + 'F' + crlf, 'g'), `F ${newlen}\n`);
  s = s.replace(new RegExp('M' + crlf + 'M' + crlf, 'g'), `M ${newlen}\n`);
  s = s.replace(new RegExp('N' + crlf + 'N' + crlf, 'g'), `N ${newlen}\n`);
  s = s.replace(new RegExp('L' + crlf + 'L' + crlf, 'g'), `L ${newlen}\n`);
  s = s.replace(new RegExp('R' + crlf + 'R' + crlf, 'g'), `R ${newlen}\n`);

  // Aspirated stops: p/t + h -> remove h (aspiration)
  s = s.replace(new RegExp('([TP])' + crlf + 'h', 'g'), '$1$2_');
  s = s.replace(/h/g, ';');

  // D before E1 -> E (dialectal)
  s = s.replace(new RegExp('D' + crlf + 'E1', 'g'), 'D$1E');

  // U + T: insert pause
  s = s.replace(new RegExp('U(2?)' + crlf + 'T ', 'g'), 'U$1$2_ 1\nT ');

  // W before M/L: become U
  s = s.replace(new RegExp('W' + crlf + '(M|L)', 'g'), 'U$1$2');

  return s;
}

/**
 * Phoneme production stage: d2m -> spkfmt -> spk -> phostrip -> phobunc -> phofix
 */
function phonemeProduction(text) {
  let s = d2m(text);
  s = spkfmt(s);
  s = spk(s);
  s = phostrip(s);
  s = phobunc(s);
  s = phofix(s);
  return s;
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

/**
 * Convert Latin text to MBROLA .pho format
 *
 * @param {string} text - Latin text to synthesize
 * @param {string} meter - Meter specification (e.g., 'lrlrlrlrlrla' for dactylic hexameter)
 *                         Default: 'a' repeated for each syllable (auto-detect)
 * @returns {string} MBROLA .pho format output
 */
function synthesize(text, meter = null) {
  // Auto-detect meter if not specified
  if (!meter) {
    const vowelCount = (text.match(/[aeiouAEIOU]/g) || []).length;
    meter = 'a'.repeat(Math.max(vowelCount, 1));
  }

  // Stage 1: Pre-scansion
  let s = preScansion(text);

  // Stage 2: Scansion
  s = scansion(s, meter);

  // Stage 3: Accentuation
  s = inc(s);

  // Stage 4: Phoneme production
  s = phonemeProduction(s);

  return s;
}

/**
 * Convert intermediate format to MBROLA .pho format
 * (For when pre-scansion and scansion are already done)
 */
function intermediateToPhone(intermediate) {
  let s = inc(intermediate);
  s = phonemeProduction(s);
  return s;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadScansions,
    amp,
    mrj,
    unamp,
    postamp,
    nudiv,
    preScansion,
    scansion,
    inc,
    d2m,
    spkfmt,
    spk,
    phostrip,
    phobunc,
    phofix,
    phonemeProduction,
    synthesize,
    intermediateToPhone,
    // Helper functions for testing
    nufec,
    premux,
    numux,
    v2c,
    fudge
  };
}
