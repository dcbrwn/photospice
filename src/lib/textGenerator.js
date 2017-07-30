const vowels = 'aeiou';
const consonants = 'klmnpstwj';

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function pickRandom(array) {
  return array[randomInRange(0, array.length - 1) | 0];
}

function genWord(index) {
  let word = '';
  for (let i = 0; i < index % 3; i += 1) {
    let cframe = pickRandom(consonants);
    let vframe = pickRandom(vowels);
    if (Math.random() < 0.05) cframe += pickRandom(consonants);
    if (Math.random() < 0.2) vframe += pickRandom(vowels);
    word += cframe + vframe;
  }
  return word;
}

function genSentence(length, min = 0, max = 250) {
  const result = [];
  for (let i = 0; i < length; i += 1) {
    result.push(genWord(randomInRange(min, max)));
  }
  return capitalizeFirstLetter(result.join(' ') + '.')
}

export function genParagraph(length, min = 0, max = 10) {
  const result = [];
  for (let i = 0; i < length; i += 1) {
    result.push(genSentence(randomInRange(min, max)));
  }
  return result.join(' ');
}
