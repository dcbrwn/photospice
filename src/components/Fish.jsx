import React from 'react';
import { genParagraph } from '../lib/textGenerator';

export default function Fish({ length }) {
  return <span>{genParagraph(length)}</span>
}
